const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const authRoutes = require('./routes/auth')

const app = express();
const PORT = process.env.PORT || 3000;
//Роуты для проектов
const projectRoutes = require('./routes/projects')
//AI
const aiRoutes = require('./routes/ai')
//
const specRoutes = require('./routes/specifications')
//Список crm
const crmRoutes = require('./routes/crm')

//Промты
const promptRoutes = require('./routes/prompts')
//Админские роуты
const adminRoutes = require('./routes/admin')
//Экспорт
const exportRoutes = require('./routes/export')
//подгрузка файлов к пунктам
const attachmentRoutes = require('./routes/attachments')

// Middleware
app.use(cors())

app.use(express.json())

//Роуты
//Авторизация/регистрация
app.use('/api/auth', authRoutes)
//Проекты
app.use('/api/projects', projectRoutes)

//AI
app.use('/api/ai', aiRoutes)
//
app.use('/api/specifications', specRoutes)
////Промты
app.use('/api/prompts', promptRoutes)

//Админские роуты
app.use('/api/admin', adminRoutes)

app.use('/api/crm', crmRoutes)
//Экспорт
app.use('/api/export', exportRoutes)

// Раздача загруженных файлов по URL /uploads/filename.jpg

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/api/attachments', attachmentRoutes)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.listen(PORT, ()=>{
    console.log(`Сервер запущен http://localhost:${PORT}`)
})
