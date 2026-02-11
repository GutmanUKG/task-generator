// ========================================
// Контроллер промптов
//
// CRUD для пользовательских промптов AI
// Каждый промпт принадлежит пользователю
// ========================================

const prisma = require('../db')
const { DEFAULT_PROMPT  } = require('../services/aiService')

// ========================================
// GET /api/prompts
//
// Список промптов текущего пользователя
// Если промптов нет — возвращаем пустой массив
// (фронтенд покажет баннер "Создайте первый промпт")
// ========================================


async function getAll(req, res) {
    try{
        const prompts = await prisma.prompt.findMany({
            where: {userId: req.userId},
            orderBy: {createdAt : 'desc'}
        })
        res.json(prompts)
    }catch (error) {
        console.error('Ошибка получения промптов:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}


// ========================================
// POST /api/prompts
//
// Создание нового промпта
// Если isDefault: true — сбрасываем флаг у остальных
// ========================================

async function create(req, res) {
    try{
        const {title , content, isDefault} = req.body
        if(!title || !title.trim()){
            return res.status(400).json(
                { error: 'Название обязательно'}
            )
        }
        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Текст промпта обязателен' })
        }
        // Если новый промпт — по умолчанию, сбрасываем флаг у остальных
        if(isDefault) {
            await prisma.prompt.updateMany({
                where: {userId: req.userId, isDefault: true},
                data: {isDefault: false}
            })
        }
        const prompt = await prisma.prompt.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                isDefault: isDefault || false,
                userId : req.userId
            }
        })
        res.status(201).json(prompt)
    }catch (error) {
        console.error('Ошибка создания промпта:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

// ========================================
// PUT /api/prompts/:id
//
// Обновление промпта
// Проверяем принадлежность пользователю
// ========================================

async function update(req, res) {
    try{
        const id = parseInt(req.params.id)
        const {title, content, isDefault} = req.body
        const existing = await prisma.prompt.findFirst({
            where: {id,userId : req.userId}
        })
        if(!existing){
            return res.status(404).json({ error: 'Промпт не найден' })
        }

        if(isDefault){
            await prisma.prompt.updateMany({
                where: {userId: req.userId, isDefault: true},
                data: {isDefault: false}
            })
        }
        const promt = await prisma.prompt.update({
            where: {id},
            data: {
                title : title?.trim() || existing.title,
                content: content?.trim() || existing.content,
                isDefault: isDefault !== undefined ? isDefault : existing.isDefault
            }
        })
        res.json(promt)
    }catch (error) {
        console.error('Ошибка обновления промпта:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

// ========================================
// DELETE /api/prompts/:id
//
// Удаление промпта
// ========================================

async function remove(req, res){
    try {
        const id = parseInt(req.params.id)
        const existing = await prisma.prompt.findFirst({
            where: {id, userId: req.userId}
        })
        if(!existing){
            return res.status(404).json({ error: 'Промпт не найден' })
        }
        await prisma.prompt.delete({
            where: {id}
        })
        res.json({ message: 'Промпт удалён' })
    }catch (error) {
        console.error('Ошибка удаления промпта:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

// ========================================
// GET /api/prompts/default-text
//
// Возвращает текст дефолтного промпта как шаблон
// ========================================

async function getDefaultText(req, res) {
    res.json({
        content: DEFAULT_PROMPT
    })
}

module.exports = {getAll, create, update, remove, getDefaultText}