import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../stores/auth'

// ========================================
// Ленивая загрузка страниц
//
// () => import(...) — страница загружается только когда
// пользователь на неё переходит (уменьшает начальный размер JS)
// ========================================

const routers = [
    {
        path: '/login',
        component: () => import('../pages/LoginPage.vue'),
        meta: {guest : true} // Только для неавторизованных
    },
    {
        path: '/register',
        component: ()=> import('../pages/RegisterPage.vue'),
        meta: { guest : true }
    },
    {
        // ========================================
        // Layout-обёртка: все вложенные страницы
        // отображаются внутри AppLayout (навигация + контент)
        // ========================================
        path: '/',
        component: ()=>import('../components/AppLayout.vue'),
        meta: {auth: true}, //Только для авторизованных
        children : [
            {
                path: '',
                redirect: '/dashboard'
            },
            {
                path: 'dashboard',
                component : ()=> import('../pages/DashboardPage.vue')
            },
            {
                path : 'projects',
                component: () => import('../pages/ProjectsPage.vue')
            },
            {
              path: 'projects/:id',
              component : () => import('../pages/ProjectPage.vue')
            },
            {
                path: 'record',
                component: ()=> import('../pages/RecordPage.vue')
            },
            {
                path: 'specifications/new',
                component: () => import('../pages/NewSpecificationPage.vue')
            },
            {
                path: 'specifications/:id',
                component: () => import('../pages/SpecificationPage.vue')
            },
            {
                path: 'admin/users',
                component: () => import('../pages/AdminUsersPage.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: '/admin/users/:id',
                component: () => import('../pages/AdminUserPage.vue'),
                meta: {requiresAdmin: true}
            },
            {
                path: 'prompts',
                component : () => import('../pages/PromptsPage.vue')
            }

        ]
    }

]
const router = createRouter({
    history: createWebHistory(),
    routes: routers
})

// ========================================
// Navigation Guard — проверка авторизации
//
// Перед каждым переходом проверяем:
// - Если страница требует auth и пользователь не авторизован → /login
// - Если страница для гостей и пользователь авторизован → /dashboard
// ========================================

router.beforeEach((to, from, next) =>{
    const isAuth = authStore.isAuthenticated
    if(to.meta.auth && !isAuth){
        // Требуется авторизация, но пользователь не вошёл
        next('/login')
    }else if(to.meta.guest && isAuth){
        // Страница для гостей, но пользователь уже вошёл
        next('/dashboard')
    }else if(to.meta.requiresAdmin && authStore.user?.role !== 'admin'){
        // Нужен админ, но пользователь не админ — на дашборд
        next('/dashboard')
    }else{
        next()
    }
})

export default router