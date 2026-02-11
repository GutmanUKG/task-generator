<script setup>
import { ref, onMounted } from "vue";
import api from '../api'

const users = ref([])
const loading = ref(true)
const error = ref('')
onMounted(async ()=>{
  try{
    const response = await api.get('/admin/users')
    users.value = response.data
  }catch (e) {
    error.value = e.response?.data?.error || 'Ошибка загрузки'
  }finally {
    loading.value = false
  }
})

//Цвета ролей
const roleMap = {
  admin: { label: 'Админ', color: 'badge-error' },
  manager: { label: 'Менеджер', color: 'badge-info' },
  executor: { label: 'Исполнитель', color: 'badge-success' }
}
</script>

<template>
  <div>
    <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Пользователи</h1>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="error" role="alert" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <div v-else-if="users.length === 0" class="text-center py-12 text-base-content/50">
      Пользователей пока нет
    </div>
    <div v-else class="space-y-3">
      <router-link v-for="user in users" :key="user.id"
                   :to="`/admin/users/${user.id}`"
                   class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow block"
      >
        <div class="card-body py-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold">{{ user.name }}</h3>
                <span :class="['badge badge-sm',
                  roleMap[user.role]?.color || 'badge-ghost']">
                  {{ roleMap[user.role]?.label || user.role }}
                </span>
              </div>
              <p class="text-sm text-base-content/50">{{ user.email }}</p>
            </div>
            <div class="flex gap-4 text-sm text-base-content/50">
              <span>{{ user._count.projects }} проектов</span>
              <span>{{ user._count.specifications }} ТЗ</span>
            </div>
          </div>
          <p class="text-xs text-base-content/40 mt-2">
            Зарегистрирован: {{ new Date(user.createdAt).toLocaleDateString('ru') }}
          </p>
        </div>
      </router-link>
    </div>

  </div>
</template>
