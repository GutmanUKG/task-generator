const express = require('express')
const { authenticate } = require('../middleware/auth')
const { structureText } = require('../services/aiService')

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
        const {text} = req.body
        if(!text || !text.trim()){
            return res.status(400).json({
                error: 'Текст не может быть пустым'
            })
        }
        const structured = await structureText(text)
        res.json(structured)
    }catch (error) {
        console.error('Ошибка AI-структурирования:', error)
        res.status(500).json({ error: error.message })
    }
})
module.exports = router