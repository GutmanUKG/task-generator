const express = require('express')
const { authenticate } = require('../middleware/auth')
const { generate, getById, getAll } = require('../controllers/specificationController')

const router = express.Router()

// Все роуты защищены авторизацией
router.use(authenticate)

router.post('/generate', generate)
router.get('/', getAll)
router.get('/:id', getById)

module.exports = router