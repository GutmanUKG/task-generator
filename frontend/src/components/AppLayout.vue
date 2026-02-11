<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../stores/auth'

const router = useRouter()
const menuOpen = ref(false)
const dropdownRef = ref(null)

function logout() {
  authStore.logout()
  router.push('/login')
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function onClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    menuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <!-- Верхняя панель навигации -->
    <div class="navbar bg-base-100 shadow-sm">
      <div class="navbar-start">
        <div ref="dropdownRef" class="relative lg:hidden">
          <button class="btn btn-ghost btn-circle" @click.stop="toggleMenu">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <ul v-if="menuOpen"
              class="menu menu-sm absolute left-0 top-full bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow">
            <li><router-link to="/dashboard" @click="closeMenu">Дашборд</router-link></li>
            <li><router-link to="/projects" @click="closeMenu">Проекты</router-link></li>
            <li><router-link to="/record" @click="closeMenu">Записать</router-link></li>
            <li><router-link to="/prompts" @click="closeMenu">Промпты</router-link></li>
            <li v-if="authStore.user?.role === 'admin'">
              <router-link to="/admin/users" @click="closeMenu">Админка</router-link>
            </li>
          </ul>
        </div>
        <router-link to="/dashboard" class="btn btn-ghost text-lg font-bold text-primary">
          ТЗ-Генератор
        </router-link>
      </div>

      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1 gap-1">
          <li><router-link to="/dashboard">Дашборд</router-link></li>
          <li><router-link to="/projects">Проекты</router-link></li>
          <li><router-link to="/record">Записать</router-link></li>
          <li><router-link to="/prompts">Промпты</router-link></li>
          <li v-if="authStore.user?.role === 'admin'">
            <router-link to="/admin/users">Админка</router-link>
          </li>
        </ul>
      </div>

      <div class="navbar-end">
        <span class="text-sm text-base-content/60 mr-3 hidden sm:inline">{{ authStore.user?.name }}</span>
        <button @click="logout" class="btn btn-ghost btn-sm text-error">
          Выйти
        </button>
      </div>
    </div>

    <!-- Контент страницы -->
    <main class="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <router-view />
    </main>
  </div>
</template>
