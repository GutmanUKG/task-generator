import axios from "axios";
const api = axios.create({
    baseURL: '/api',// Относительный путь — запросы пойдут на тот же хост
    headers: {
        'Content-Type': 'application/json'
    }
})

//Добавление токена к каждому запросу
api.interceptors.request.use(config  => {
    const token = localStorage.getItem('token')

    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

//Обработка ошибок

api.interceptors.response.use(
    response => response,
    error => {
        if(error.response?.status === 401) {
            //Токен истёк = разлогиниваем
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)
export default api