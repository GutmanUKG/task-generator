const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const prisma = require('../db')
const { generateDoc } = require('../services/docService')

/**
 * GET /api/export/doc/:specificationId
 *
 * Генерирует DOCX и отправляет для скачивания
 */
router.get('/doc/:specificationId', authenticate, async (req, res) => {
    try {
        const spec = await prisma.specification.findFirst({
            where: {
                id: parseInt(req.params.specificationId),
                userId: req.userId
            },
            include: {
                sections: {
                    orderBy: { position: 'asc' },
                    include: {
                        items: {
                            orderBy: { position: 'asc' },
                            include: {
                                attachments: true
                            }
                        }
                    }
                }
            }
        })

        if (!spec) {
            return res.status(404).json({ error: 'ТЗ не найдено' })
        }

        const buffer = await generateDoc(spec)

        res.setHeader('Content-Type',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        res.setHeader('Content-Disposition',
            `attachment; filename="tz-${spec.id}.docx"`)
        res.send(buffer)
    } catch (error) {
        console.error('Ошибка генерации DOC:', error)
        res.status(500).json({ error: 'Ошибка экспорта в DOC' })
    }
})

module.exports = router
