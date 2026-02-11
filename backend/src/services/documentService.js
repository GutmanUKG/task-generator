const fs = require('fs')

const mammoth = require('mammoth')
const path = require('path')
/**
 * Извлекает текст из загруженного файла
 *
 * @param {string} filePath - путь к файлу на диске
 * @param {string} mimetype - MIME-тип файла
 * @returns {string} извлечённый текст
 */
async function extractText(filePath, mimetype) {
    try {
        if (mimetype === 'text/plain') {
            // .txt — просто читаем как строку
            return fs.readFileSync(filePath, 'utf-8')
        }

        if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimetype === 'application/msword'
        ) {
            // .docx / .doc — извлекаем текст через mammoth
            const result = await mammoth.extractRawText({ path: filePath })
            return result.value
        }

        throw new Error(`Неподдерживаемый формат: ${mimetype}`)
    } finally {
        // Удаляем временный файл после извлечения
        try {
            fs.unlinkSync(filePath)
        } catch (e) {
            console.error('Ошибка удаления временного файла:', e)
        }
    }
}

module.exports = { extractText }