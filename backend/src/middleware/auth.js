const jwt = require('jsonwebtoken')

function authenticate(req, res, next){
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({
            error : "Токен не предоставлен"
        })
    }
    const token = authHeader.split(' ')[1]
    try {
        //Проверка токена
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        //Добавление данных пользователя в запрос
        req.userId = decoded.userId
        req.userRole = decoded.role

        next()
    }catch (e) {
        return res.status(401).json({ error: 'Недействительный токен' })
    }
}
function requireRole(...roles) {
    return (req, res, next) => {
        if(!roles.includes(req.userRole)) {
            return res.status(403).json({ error: 'Недостаточно прав' })
        }
        next()
    }
}
module.exports = {authenticate, requireRole}