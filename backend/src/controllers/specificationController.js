const prisma = require('../db')
const { structureText } = require('../services/aiService')

/**
 * POST /api/specifications/generate
 *
 * Принимает сырой текст, структурирует через AI,
 * сохраняет в БД как Specification → Section → Item
 */


async function generate(req, res) {
    try{
        const {text, projectId} = req.body
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
        const structured = await structureText(text)

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
                            orderBy: {position: 'asc'}
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

module.exports = {generate,  getById, getAll, update }