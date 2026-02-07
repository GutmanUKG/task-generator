<script setup>
import { useRouter } from 'vue-router'
import { authStore } from '../stores/auth'

const router = useRouter()

function logout() {
  authStore.logout()
  router.push('/login')
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

          <div class="flex gap-4">
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

        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500">{{ authStore.user?.name }}</span>
          <button @click="logout"
                  class="text-sm text-red-500 hover:text-red-700">
            Выйти
          </button>
        </div>
      </div>
    </nav>

    <!-- Контент страницы -->
    <main class="max-w-6xl mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>