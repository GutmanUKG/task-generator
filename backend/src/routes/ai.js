const express = require('express')
const { authenticate } = require('../middleware/auth')
const { structureText } = require('../services/aiService')
const prisma = require('../db')

const router = express.Router()


/**
 * POST /api/ai/structure
 *
 * Тело запроса: { text: "сырой текст" }
 * Ответ: { title, sections: [...] }
 *
 * Поток: текст → промпт для Ollama → JSON-структура ТЗ
 */

router.post('/structure', authenticate, async (req,res) =>{
    try{
        const {text , crm , promptId} = req.body
        if(!text || !text.trim()){
            return res.status(400).json({
                error: 'Текст не может быть пустым'
            })
        }
        // ========================================
        // Если передан promptId — ищем кастомный промпт в БД
        // Проверяем что промпт принадлежит пользователю
        // ========================================
        let customPrompt = null
        let structured = ''
        if (promptId) {
            const prompt = await prisma.prompt.findFirst({
                where: { id: promptId, userId: req.userId }
            })
            if (prompt) {
                customPrompt = prompt.content
            }
             structured = await structureText(text, crm,customPrompt)
        }else{
             structured = await structureText(text, crm)
        }

        res.json(structured)
    }catch (error) {
        console.error('Ошибка AI-структурирования:', error)
        res.status(500).json({ error: error.message })
    }
})
module.exports = router