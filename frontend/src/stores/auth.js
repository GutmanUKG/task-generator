import { reactive } from "vue";
import api from '../api'

export const authStore = reactive({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token : localStorage.getItem('token') || null,

    get isAuthenticated(){
        return !!this.token
    },
    async register(email,password,name){
        const response = await api.post('/auth/register', {
            email, password,name
        })
        this.setAuth(response.data.token, response.data.user)
        return response.data
    },
    async login(email, password) {
        const response = await api.post('/auth/login', {
            email, password
        })
        this.setAuth(response.data.token, response.data.user)
        return response.data
    },
    setAuth(token, user){
        this.token = token
        this.user = user
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
    },
    logout(){
        this.token = null
        this.user = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }
})
