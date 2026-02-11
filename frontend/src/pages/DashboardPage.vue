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
                   class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
        <div class="card-body">
          <h2 class="card-title">Проекты</h2>
          <p class="text-base-content/60 text-sm">Управление проектами и клиентами</p>
        </div>
      </router-link>
    </div>
  </div>
</template>
