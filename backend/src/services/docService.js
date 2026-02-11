// ========================================
// Сервис генерации DOCX
//
// Библиотека docx создаёт файлы Word
// программно — без шаблонов и внешних зависимостей
//
// Структура DOCX:
// Document → Section → Paragraph/Table
// ========================================

const {
    Document, Packer, Paragraph, TextRun,
    HeadingLevel, AlignmentType, BorderStyle,
    Table, TableRow, TableCell, WidthType,
    ImageRun
} = require('docx')
const fs = require('fs')
const path = require('path')

/**
 * Генерация DOCX из спецификации
 *
 * @param {Object} spec — спецификация с sections и items
 * @param {boolean} includeImages — включать ли прикреплённые скриншоты
 * @returns {Buffer} — буфер готового .docx файла
 */
async function generateDoc(spec, includeImages = true) {

    // ========================================
    // Собираем содержимое документа
    // Каждый элемент массива — параграф или таблица
    // ========================================
    const children = []

    // ========================================
    // Заголовок документа
    // ========================================
    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: spec.title || 'Техническое задание',
                    bold: true,
                    size: 32,          // размер в half-points (32 = 16pt)
                    font: 'Arial'
                })
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        })
    )

    // Дата создания
    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: `Дата: ${new Date(spec.createdAt).toLocaleDateString('ru')}`,
                    size: 20,
                    color: '666666',
                    font: 'Arial'
                })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 400 }
        })
    )

    // ========================================
    // Разделы и пункты
    // ========================================
    let totalMinutes = 0

    spec.sections.forEach((section, sectionIndex) => {
        // Заголовок раздела
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${sectionIndex + 1}. ${section.title}`,
                        bold: true,
                        size: 26,
                        font: 'Arial'
                    })
                ],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 300, after: 200 }
            })
        )

        // Пункты раздела
        section.items.forEach((item, itemIndex) => {
            const timeStr = item.timeEstimate
                ? ` [${item.timeEstimate} мин]`
                : ''

            if (item.timeEstimate) {
                totalMinutes += item.timeEstimate
            }

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${sectionIndex + 1}.${itemIndex + 1} `,
                            bold: true,
                            size: 22,
                            font: 'Arial'
                        }),
                        new TextRun({
                            text: item.content,
                            size: 22,
                            font: 'Arial'
                        }),
                        new TextRun({
                            text: timeStr,
                            size: 22,
                            color: '0066CC',
                            bold: true,
                            font: 'Arial'
                        })
                    ],
                    spacing: { after: 100 },
                    indent: { left: 400 }
                })
            )

            // ========================================
            // Прикреплённые изображения
            // Читаем файл с диска и вставляем в документ
            // ========================================
            if (includeImages && item.attachments) {
                item.attachments.forEach(att => {
                    if (att.mimetype && att.mimetype.startsWith('image/')) {
                        const filePath = path.join(__dirname, '../../', att.path)
                        if (fs.existsSync(filePath)) {
                            const imageData = fs.readFileSync(filePath)
                            children.push(
                                new Paragraph({
                                    children: [
                                        new ImageRun({
                                            data: imageData,
                                            transformation: {
                                                width: 500,
                                                height: 300
                                            },
                                            type: att.mimetype === 'image/png' ? 'png' : 'jpg'
                                        })
                                    ],
                                    spacing: { before: 100, after: 200 },
                                    indent: { left: 400 }
                                })
                            )
                        }
                    }
                })
            }
        })
    })

    // ========================================
    // Итоговая таблица с общим временем
    // ========================================
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    const totalStr = hours > 0
        ? `${hours} ч ${mins} мин`
        : `${totalMinutes} мин`

    children.push(
        new Paragraph({
            children: [
                new TextRun({ text: '' })
            ],
            spacing: { before: 400 }
        })
    )

    children.push(
        new Table({
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: 'Общее время:',
                                            bold: true,
                                            size: 24,
                                            font: 'Arial'
                                        })
                                    ]
                                })
                            ],
                            width: { size: 100, type: WidthType.PERCENTAGE }
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: totalStr,
                                            bold: true,
                                            size: 24,
                                            color: '0066CC',
                                            font: 'Arial'
                                        })
                                    ],
                                    alignment: AlignmentType.RIGHT
                                })
                            ],
                            width: { size: 100, type: WidthType.PERCENTAGE }
                        })
                    ]
                })
            ],
            width: { size: 300, type: WidthType.PERCENTAGE }
        })
    )

    // ========================================
    // Создаём документ
    // ========================================
    const doc = new Document({
        sections: [{
            children
        }]
    })

    // ========================================
    // Packer.toBuffer() — сериализует документ в буфер
    // Этот буфер можно сохранить в файл или отправить клиенту
    // ========================================
    const buffer = await Packer.toBuffer(doc)
    return buffer
}

module.exports = { generateDoc }