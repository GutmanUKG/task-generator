const express = require('express')
const cors = require('cors')

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
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.listen(PORT, ()=>{
    console.log(`Сервер запущен http://localhost:${PORT}`)
})
