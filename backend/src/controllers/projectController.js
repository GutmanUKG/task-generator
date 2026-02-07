const prisma = require('../db')

// Получить все проекты пользователя
async function getAll(req, res) {
    try {
        const projects = await prisma.project.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' }
        })
        res.json(projects)
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

// Получить один проект
async function getOne(req, res) {
    try {
        const project = await prisma.project.findFirst({
            where: {
                id: parseInt(req.params.id),
                userId: req.userId
            },
            // ========================================
            // include — подтягиваем связанные данные
            //
            // Без include: { id, name, description }
            // С include: { id, name, description, specifications: [...] }
            //
            // Вложенный include — подтягиваем секции внутри ТЗ,
            // а внутри секций — пункты
            // ========================================
            include: {
                specifications: {
                    orderBy: {createdAt : 'desc'},
                    include: {
                        sections: {
                            orderBy: {position: 'asc'},
                            include: {
                                items: { orderBy: { position: 'asc' } }
                            }
                        }
                    }
                }
            }
        })

        if (!project) {
            return res.status(404).json({ error: 'Проект не найден' })
        }

        res.json(project)
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

// Создать проект
async function create(req, res) {
    try {
        const { name, description } = req.body

        if (!name) {
            return res.status(400).json({ error: 'Название обязательно' })
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                userId: req.userId
            }
        })

        res.status(201).json(project)
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

// Обновить проект
async function update(req, res) {
    try {
        const { name, description } = req.body

        // Проверяем что проект принадлежит пользователю
        const existing = await prisma.project.findFirst({
            where: {
                id: parseInt(req.params.id),
                userId: req.userId
            }
        })

        if (!existing) {
            return res.status(404).json({ error: 'Проект не найден' })
        }

        const project = await prisma.project.update({
            where: { id: parseInt(req.params.id) },
            data: { name, description }
        })

        res.json(project)
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

// Удалить проект
async function remove(req, res) {
    try {
        const existing = await prisma.project.findFirst({
            where: {
                id: parseInt(req.params.id),
                userId: req.userId
            }
        })

        if (!existing) {
            return res.status(404).json({ error: 'Проект не найден' })
        }

        await prisma.project.delete({
            where: { id: parseInt(req.params.id) }
        })

        res.json({ message: 'Проект удалён' })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

module.exports = { getAll, getOne, create, update, remove }