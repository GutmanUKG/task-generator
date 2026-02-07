const express = require('express')
const { authenticate } = require('../middleware/auth')
const {
    getAll,
    getOne,
    create,
    update,
    remove
} = require('../controllers/projectController')

const router = express.Router()

// Все роуты защищены
router.use(authenticate)

router.get('/', getAll)
router.get('/:id', getOne)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', remove)

module.exports = router