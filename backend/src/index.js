const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', //Адресс для dev Vue сервера
    credentials: true
}))

app.use(express.json())

//Роуты
app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.listen(PORT, ()=>{
    console.log(`Сервер запущен http://localhost:${PORT}`)
})
