const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../db')

//Регистрация
async function register(req, res) {
    try{
        const { email, password, name } = req.body
        //Проверка на заполнение полей
        if(!email || !password || !name){
            return res.status(400).json({
                error: 'Не все поля заполненны'
            })
        }

        //Проверка уникальности email
        const existingUser = await prisma.user.findUnique({
            where: {email}
        })
        if(existingUser) {
            return res.status(400).json({
                error: 'Пользователь с таким email уже существует'
            })
        }

        //Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10)

        //Создание пользователя

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        })

        //Создание JWT токена
        const token = jwt.sign(
            {userId: user.id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        )
        res.status(201).json({
            message: "Регистрация успешна",
            token,
            user : {
                id: user.id,
                email : user.email,
                name : user.name,
                role : user.role
            }
        })
    }catch (e) {
        console.error("Ошибка регистрации", e)
        res.status(500).json({
            error: `Ошибка сервера ${e}`
        })
    }
}

//Авторизация
async function login(req, res){
    try{
        const {email, password} = req.body

        //Проверка заполнения
        if(!email || !password) {
            return res.status(400).json({
                error : "Введите email или пароль"
            })
        }
        //Поиск по базе
        const user = await prisma.user.findUnique({
            where: {email}
        })
        if(!user) {
            return res.status(401).json({
                error : 'Неверный логин или пароль'
            })
        }
        const isValidPassword = await bcrypt.compare(password, user.password)
        if(!isValidPassword){
            return  res.status(401).json({
                error : 'Неверный логин или пароль'
            })
        }
        //Создание токена
        const token = jwt.sign(
            {userId: user.id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        )
        res.json({
            message: 'Вход успешен',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        })
    }catch (e) {
        console.error('Ошибка входа:', e)
        res.status(500).json({ error: `Ошибка сервера ${e}` })
    }
}
module.exports = {register, login}