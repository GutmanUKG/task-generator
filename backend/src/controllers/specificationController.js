const prisma = require('../db')
const { structureText } = require('../services/aiService')

const { extractText } = require('../services/documentService')

/**
 * POST /api/specifications/generate
 *
 * Принимает сырой текст, структурирует через AI,
 * сохраняет в БД как Specification → Section → Item
 */


async function generate(req, res) {
    try{
        const {text, projectId , promptId} = req.body
        // Валидация
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Текст не может быть пустым' })
        }
        if (!projectId) {
            return res.status(400).json({ error: 'projectId обязателен' })
        }
        // Проверяем что проект существует и принадлежит пользователю
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: req.userId }
        })
        if (!project) {
            return res.status(404).json({ error: 'Проект не найден' })
        }
        // ========================================
        // Вызов AI
        //
        // structureText отправляет текст в Ollama
        // и возвращает { title, sections: [...] }
        // ========================================

        // ========================================
        // Если передан promptId — используем кастомный промпт
        // ========================================
        let customPrompt = null
        if(promptId) {
            const prompt = await prisma.prompt.findFirst({
                where: { id: promptId, userId: req.userId }
            })
            if (prompt) {
                customPrompt = prompt.content
            }
        }
        const structured = await structureText(text, customPrompt)

        // ========================================
        // Сохранение в БД
        //
        // prisma.specification.create с nested create:
        // - Создаём Specification
        // - Внутри создаём Section[]
        // - Внутри каждой секции создаём Item[]
        //
        // Всё в одной транзакции — если что-то упадёт,
        // ничего не сохранится (атомарность)
        // ========================================

        const specification = await prisma.specification.create({
            data: {
                title: structured.title || 'Без названия',
                projectId,
                userId : req.userId,
                sections : {
                    create: structured.sections.map((section, sIndex) => ({
                        title: section.title,
                        position: sIndex,
                        items: {
                            create: section.items.map((item, iIndex) => ({
                                content: item.content,
                                timeEstimate: item.timeEstimate || null,
                                position: iIndex
                            }))
                        }
                    }))
                }
            },
            // Возвращаем созданное ТЗ со всеми связями
            include: {
                sections : {
                    orderBy: {position: 'asc'},
                    include : {
                        items: {
                            orderBy: { position: 'asc' }
                        }
                    }
                }
            }
        })
        res.status(201).json(specification)
    }catch (error) {
        console.error('Ошибка генерации ТЗ:', error)
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/specifications/:id
 *
 * Получить ТЗ по ID с секциями и пунктами
 */

async function getById(req, res){
    try {
        const id = parseInt(req.params.id)
        const specification = await prisma.specification.findFirst({
            where: {
                id, userId: req.userId
            },
            include: {
                sections: {
                    orderBy: {position: 'asc'},
                    include: {
                        items: {
                            orderBy: {position: 'asc'},
                            include: {
                                attachments: true
                            }
                        }
                    }
                }
            }
        })
        if(!specification){
            return res.status(404).json({
                error: 'ТЗ не найдено'
            })
        }
        res.json(specification)
    }catch (error){
        console.error('Ошибка получения ТЗ:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}
/**
 * GET /api/specifications
 *
 * Список ТЗ текущего пользователя
 */
async function getAll(req, res) {
    try {
        const specifications = await prisma.specification.findMany({
            where: { userId: req.userId },
            include: {
                sections: {
                    orderBy: { position: 'asc' },
                    include: {
                        items: {
                            orderBy: { position: 'asc' }
                        }
                    }
                },
                project: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        res.json(specifications)
    } catch (error) {
        console.error('Ошибка получения списка ТЗ:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}
/**
 * PUT /api/specifications/:id
 *
 * Обновить ТЗ: название, секции и пункты
 *
 * Стратегия обновления:
 * 1. Удаляем все старые секции (каскадно удалятся пункты)
 * 2. Создаём новые секции и пункты из тела запроса
 *
 * Почему удаляем и создаём заново, а не обновляем по одному?
 * - Пользователь мог добавить/удалить секции и пункты
 * - Мог поменять порядок
 * - Проще пересоздать, чем отслеживать каждое изменение
 * - Prisma делает всё в одной транзакции — безопасно
 */

async function  update(req, res) {
    try{
        const id = parseInt(req.params.id)
        const {title, sections} = req.body

        //Проверка что ТЗ существует и принадлежит пользователю
        const existing = await prisma.specification.findFirst({
            where: {id, userId: req.userId}
        })
        if(!existing) {
            return res.status(404).json({
                error: 'ТЗ не найдено'
            })
        }
        // ========================================
        // Транзакция: удаляем старые секции + обновляем ТЗ
        //
        // prisma.$transaction — гарантирует что либо ВСЕ
        // операции выполнятся, либо НИ ОДНА (атомарность)
        // ========================================
        const update = await prisma.$transaction(async (tx) =>{
            // Удаляем старые секции (items удалятся каскадно)
            await tx.section.deleteMany({
                where : {specificationId: id}
            })
            //Обновляем заголовок и создаем новые секции
            return tx.specification.update({
                where: {id},
                data: {
                    title,
                    sections: {
                      create : sections.map((section, sIdx) => ({
                          title: section.title,
                          position: sIdx,
                          items: {
                              create: section.items.map((item, iIdx) => ({
                                  content: item.content,
                                  timeEstimate: item.timeEstimate || null,
                                  position: iIdx
                              }))
                          }
                      }))
                    }
                },
                include: {
                    sections: {
                        orderBy: {position: 'asc'},
                        include: {
                            items: {orderBy : {position : 'asc'}}
                        }
                    }
                }
            })
        })
        res.json(update)
    }catch (error) {
        console.error('Ошибка обновления ТЗ:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}
// Создать ТЗ
// async function create(req, res) {
//     try {
//         const { title, projectId, sections } = req.body
//
//         if (!title || !projectId) {
//             return res.status(400).json({
//                 error: 'Название и проект обязательны'
//             })
//         }
//
//         const spec = await prisma.specification.create({
//             data: {
//                 title,
//                 projectId: parseInt(projectId),
//                 userId: req.userId,
//                 sections: sections ? {
//                     create: sections.map((section, idx) => ({
//                         title: section.title,
//                         position: idx,
//                         items: section.items ? {
//                             create: section.items.map((item, itemIdx) => ({
//                                 content: item.content,
//                                 position: itemIdx,
//                                 timeEstimate: item.timeEstimate
//                             }))
//                         } : undefined
//                     }))
//                 } : undefined
//             },
//             include: {
//                 sections: {
//                     include: { items: true }
//                 }
//             }
//         })
//
//         res.status(201).json(spec)
//     } catch (error) {
//         console.error(error)
//         res.status(500).json({ error: 'Ошибка сервера' })
//     }
// }


/**
 * POST /api/specifications/upload-doc
 *
 * Загрузить документ и извлечь из него текст.
 * Возвращает текст, который фронтенд может показать
 * пользователю и потом отправить на AI-структурирование.
 */

async function uploadDocument(req, res) {
    try{
        if(!req.file){
            return res.status(400).json({ error: 'Файл не загружен' })
        }
        const text = await extractText(req.file.path, req.file.mimetype)

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Не удалось извлечь текст из документа' })
        }
        res.json({
            text: text.trim(),
            filename: req.file.originalname
        })
    }catch (error) {
        console.error('Ошибка обработки документа:', error)
        res.status(500).json({ error: error.message || 'Ошибка обработки документа' })
    }
}
/**
 * POST /api/specifications
 *
 * Сохраняет ТЗ с уже готовыми секциями и пунктами (без вызова AI).
 * Используется после того как пользователь структурировал текст
 * через AI, отредактировал результат и нажал "Сохранить".
 *
 * Body: { title, projectId, sections: [{ title, items: [{ content, timeEstimate }] }] }
 */
async function create(req, res) {
    try {
        const { title, projectId, sections } = req.body

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Название ТЗ обязательно' })
        }
        if (!projectId) {
            return res.status(400).json({ error: 'projectId обязателен' })
        }

        // Проверяем что проект принадлежит пользователю
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: req.userId }
        })
        if (!project) {
            return res.status(404).json({ error: 'Проект не найден' })
        }

        const specification = await prisma.specification.create({
            data: {
                title,
                projectId,
                userId: req.userId,
                sections: {
                    create: (sections || []).map((section, sIdx) => ({
                        title: section.title,
                        position: sIdx,
                        items: {
                            create: (section.items || []).map((item, iIdx) => ({
                                content: item.content,
                                timeEstimate: item.timeEstimate || null,
                                position: iIdx
                            }))
                        }
                    }))
                }
            },
            include: {
                sections: {
                    orderBy: { position: 'asc' },
                    include: {
                        items: { orderBy: { position: 'asc' } }
                    }
                }
            }
        })

        res.status(201).json(specification)
    } catch (error) {
        console.error('Ошибка создания ТЗ:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

/**
 * DELETE /api/specifications/:id
 *
 * Удалить ТЗ (каскадно удалятся секции и пункты)
 */
async function remove(req, res) {
    try {
        const id = parseInt(req.params.id)

        const existing = await prisma.specification.findFirst({
            where: { id, userId: req.userId }
        })
        if (!existing) {
            return res.status(404).json({ error: 'ТЗ не найдено' })
        }

        await prisma.specification.delete({ where: { id } })
        res.json({ message: 'ТЗ удалено' })
    } catch (error) {
        console.error('Ошибка удаления ТЗ:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

module.exports = { generate, create, getById, getAll, update, remove, uploadDocument }