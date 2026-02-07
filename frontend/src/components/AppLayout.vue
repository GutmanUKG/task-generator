<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../stores/auth'

const router = useRouter()
const menuOpen = ref(false)

function logout() {
  authStore.logout()
  router.push('/login')
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Верхняя панель навигации -->
    <nav class="bg-white shadow">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <router-link to="/dashboard" class="text-lg font-bold text-blue-600">
            ТЗ-Генератор
          </router-link>

          <!-- Десктоп навигация -->
          <div class="hidden md:flex gap-4">
            <router-link to="/dashboard"
                         class="text-gray-600 hover:text-blue-500 text-sm">
              Дашборд
            </router-link>
            <router-link to="/projects"
                         class="text-gray-600 hover:text-blue-500 text-sm">
              Проекты
            </router-link>
            <router-link to="/record"
                         class="text-gray-600 hover:text-blue-500 text-sm">
              Записать
            </router-link>
          </div>
        </div>

        <!-- Десктоп: юзер + выход -->
        <div class="hidden md:flex items-center gap-4">
          <span class="text-sm text-gray-500">{{ authStore.user?.name }}</span>
          <button @click="logout"
                  class="text-sm text-red-500 hover:text-red-700">
            Выйти
          </button>
        </div>

        <!-- Мобильная кнопка меню -->
        <button @click="menuOpen = !menuOpen"
                class="md:hidden p-2 text-gray-600 hover:text-gray-900">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Мобильное меню -->
      <div v-if="menuOpen" class="md:hidden border-t px-4 py-3 space-y-3">
        <router-link to="/dashboard" @click="closeMenu"
                     class="block text-gray-600 hover:text-blue-500">
          Дашборд
        </router-link>
        <router-link to="/projects" @click="closeMenu"
                     class="block text-gray-600 hover:text-blue-500">
          Проекты
        </router-link>
        <router-link to="/record" @click="closeMenu"
                     class="block text-gray-600 hover:text-blue-500">
          Записать
        </router-link>
        <div class="border-t pt-3 flex items-center justify-between">
          <span class="text-sm text-gray-500">{{ authStore.user?.name }}</span>
          <button @click="logout"
                  class="text-sm text-red-500 hover:text-red-700">
            Выйти
          </button>
        </div>
      </div>
    </nav>

    <!-- Контент страницы -->
    <main class="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <router-view />
    </main>
  </div>
</template>
