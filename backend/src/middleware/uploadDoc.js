const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Папка для временных файлов

const uploadDir = path.join(__dirname, '../../uploads/dosc')

if(!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {recursive: true})
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1000)}-${file.originalname}`
        cb(null, uniqueName)
    }
})

// Разрешаем только текстовые документы

const fileFilter = (req, file, cb) => {
    const allowed = [
        'text/plain',                                                          // .txt
        'application/msword',                                                   // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ]
    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Допустимые форматы: .txt, .doc, .docx'), false)
    }
}

const uploadDoc = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024  // 10 MB максимум
    }
})

module.exports = uploadDoc