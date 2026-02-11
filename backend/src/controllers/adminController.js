const prisma = require('../db')

/**
 * GET /api/admin/users
 *
 * Список всех пользователей с количеством проектов и ТЗ
 */
async function getUsers(req, res) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        projects: true,
                        specifications: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        res.json(users)
    } catch (error) {
        console.error('Ошибка получения пользователей:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

/**
 * GET /api/admin/users/:id
 *
 * Детали пользователя с его проектами
 */
async function getUserById(req, res) {
    try {
        const id = parseInt(req.params.id)

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                projects: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        _count: {
                            select: { specifications: true }
                        }
                    }
                }
            }
        })

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' })
        }

        res.json(user)
    } catch (error) {
        console.error('Ошибка получения пользователя:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

/**
 * GET /api/admin/users/:id/specifications
 *
 * Все ТЗ пользователя с секциями и пунктами
 */
async function getUserSpecifications(req, res) {
    try {
        const userId = parseInt(req.params.id)

        const specifications = await prisma.specification.findMany({
            where: { userId },
            include: {
                project: {
                    select: { name: true }
                },
                sections: {
                    orderBy: { position: 'asc' },
                    include: {
                        items: {
                            orderBy: { position: 'asc' }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        res.json(specifications)
    } catch (error) {
        console.error('Ошибка получения ТЗ пользователя:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

/**
 * PATCH /api/admin/users/:id/role
 *
 * Изменить роль пользователя
 * Body: { role: "admin" | "manager" | "executor" }
 */
async function changeRole(req, res) {
    try {
        const id = parseInt(req.params.id)
        const { role } = req.body

        const validRoles = ['admin', 'manager', 'executor']
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                error: `Невалидная роль. Допустимые: ${validRoles.join(', ')}`
            })
        }

        // Нельзя менять роль самому себе
        if (id === req.userId) {
            return res.status(400).json({ error: 'Нельзя менять свою роль' })
        }

        const updated = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, name: true, email: true, role: true }
        })

        res.json(updated)
    } catch (error) {
        console.error('Ошибка смены роли:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

module.exports = { getUsers, getUserById, getUserSpecifications, changeRole }