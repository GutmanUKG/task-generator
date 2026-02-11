const express = require('express')
const { authenticate, requireRole } = require('../middleware/auth')
const {
    getUsers,
    getUserById,
    getUserSpecifications,
    changeRole
} = require('../controllers/adminController')

const router = express.Router()

// Все роуты: авторизация + только admin
router.use(authenticate)
router.use(requireRole('admin'))

router.get('/users', getUsers)
router.get('/users/:id', getUserById)
router.get('/users/:id/specifications', getUserSpecifications)
router.patch('/users/:id/role', changeRole)

module.exports = router