const express = require('express')
const { authenticate } = require('../middleware/auth')
const upload = require('../middleware/upload')
const prisma = require('../db')
const fs = require('fs')
const path = require('path')


const router = express.Router()


/**
 * POST /api/attachments/:itemId
 *
 * Загрузить файл и привязать к пункту ТЗ
 * Принимает: multipart/form-data с полем "file"
 *
 * req.file — объект от multer:
 *   .filename — имя на диске
 *   .originalname — оригинальное имя
 *   .mimetype — MIME тип
 *   .size — размер в байтах
 *   .path — полный путь на диске
 */


router.post('/:itemId', authenticate, upload.single('file'), async (req, res) =>{
    try{
        const itemId = parseInt(req.params.itemId)
        const item = await prisma.item.findFirst({
            where: { id: itemId },
            include: {
                section: {
                    include: {
                        specification: true
                    }
                }
            }
        })
        if (!item || item.section.specification.userId !== req.userId) {
            return res.status(404).json({ error: 'Пункт не найден' })
        }
        const attachment = await prisma.attachment.create({
            data: {
                filename: req.file.originalname,
                path: `/uploads/${req.file.filename}`,
                mimetype: req.file.mimetype,
                size: req.file.size,
                itemId
            }
        })

        res.status(201).json(attachment)
    }catch (error) {
        console.error('Ошибка загрузки:', error)
        res.status(500).json({ error: 'Ошибка загрузки файла' })
    }
})

/**
 * DELETE /api/attachments/:id
 *
 * Удалить вложение: файл с диска + запись из БД
 */

router.delete('/:id', authenticate, async (req, res) => {
    try {
        const attachment = await prisma.attachment.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                item: {
                    include: {
                        section: {
                            include: { specification: true }
                        }
                    }
                }
            }
        })

        if (!attachment || attachment.item.section.specification.userId !== req.userId) {
            return res.status(404).json({ error: 'Вложение не найдено' })
        }

        // Удаляем файл с диска
        const filePath = path.join(__dirname, '../../', attachment.path)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }

        // Удаляем запись из БД
        await prisma.attachment.delete({
            where: { id: attachment.id }
        })

        res.json({ message: 'Вложение удалено' })
    } catch (error) {
        res.status(500).json({ error: 'Ошибка удаления' })
    }
})

module.exports = router