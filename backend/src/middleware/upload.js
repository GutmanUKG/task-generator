const multer = require('multer')
const path = require('path')
const fs = require('fs')

// ========================================
// Папка для загрузок
// Создаём если не существует
// ========================================

const uploadDir = path.join(__dirname, '../../uploads')
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, {recursive: true})
}

// ========================================
// Настройка хранилища
//
// destination — куда сохранять файлы
// filename — как именовать файлы
//
// Формат имени: timestamp-random-оригинальное_имя
// Это предотвращает конфликты имён
// ========================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1000)}-${file.originalname}`
        cb(null, uniqueName)
    }
})

// ========================================
// Фильтр файлов
//
// Разрешаем: изображения, PDF, документы
// Запрещаем: исполняемые файлы (.exe, .sh и т.д.)
// ========================================

const fileFilter = (req, file, cb) => {
    const allowed = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Недопустимый тип файла'), false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024  // 5 MB максимум
    }
})

module.exports = upload