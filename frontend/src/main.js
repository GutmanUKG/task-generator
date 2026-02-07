import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router"

// ========================================
// createApp — создаёт экземпляр Vue
// .use(router) — подключает Vue Router
// .mount('#app') — монтирует в DOM
// ========================================

createApp(App)
    .use(router)
    .mount('#app')
