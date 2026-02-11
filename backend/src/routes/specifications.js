const express = require('express')
const { authenticate } = require('../middleware/auth')
const uploadDoc = require('../middleware/uploadDoc')
const { generate, create, getById, getAll, update, remove, uploadDocument } = require('../controllers/specificationController')

const router = express.Router()

// Все роуты защищены авторизацией
router.use(authenticate)

router.post('/generate', generate)
router.post('/', create)
router.get('/', getAll)
router.get('/:id', getById)
router.put('/:id', update)
router.delete('/:id', remove)
router.post('/upload-doc', uploadDoc.single('document'), uploadDocument)
module.exports = router