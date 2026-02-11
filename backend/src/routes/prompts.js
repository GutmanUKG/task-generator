// ========================================
// Роуты для промптов
//
// Все роуты защищены middleware authenticate
// ========================================


const express = require('express')
const { authenticate  } = require('../middleware/auth')
const { getAll, create, update, remove, getDefaultText } = require('../controllers/promptController')

const router = express.Router()

router.get('/default-text', authenticate, getDefaultText)
router.get('/', authenticate, getAll)
router.post('/', authenticate, create)
router.put('/:id', authenticate, update)
router.delete('/:id', authenticate, remove)

module.exports = router