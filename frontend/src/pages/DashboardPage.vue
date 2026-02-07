<script setup>
import { authStore } from '../stores/auth'
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">
      Добро пожаловать, {{ authStore.user?.name }}!
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <router-link to="/projects"
                   class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <h2 class="text-lg font-semibold mb-2">Проекты</h2>
        <p class="text-gray-500 text-sm">Управление проектами и клиентами</p>
      </router-link>

      <router-link to="/record"
                   class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <h2 class="text-lg font-semibold mb-2">Записать ТЗ</h2>
        <p class="text-gray-500 text-sm">Голосовой ввод нового ТЗ</p>
      </router-link>
    </div>
  </div>
</template>