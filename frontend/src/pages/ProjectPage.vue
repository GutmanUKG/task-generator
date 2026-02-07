<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const project = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response = await api.get(`/projects/${route.params.id}`)
    project.value = response.data
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка загрузки проекта'
  } finally {
    loading.value = false
  }
})

function formatTime(minutes) {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} мин`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} ч ${m} мин` : `${h} ч`
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="loading" class="text-center py-12 text-gray-500">Загрузка...</div>

    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded">{{ error }}</div>

    <div v-else-if="project">
      <div class="mb-6">
        <router-link to="/projects" class="text-blue-500 hover:text-blue-700 text-sm">
          &larr; Все проекты
        </router-link>
      </div>

      <h1 class="text-2xl font-bold mb-2">{{ project.name }}</h1>
      <p v-if="project.description" class="text-gray-500 mb-6">{{ project.description }}</p>

      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Технические задания</h2>
        <router-link to="/record"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
          + Создать ТЗ
        </router-link>
      </div>

      <div v-if="project.specifications.length === 0"
        class="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
        <p>ТЗ пока нет</p>
        <p class="text-sm mt-1">Запишите голос и создайте первое техническое задание</p>
      </div>

      <div v-else class="space-y-4">
        <router-link v-for="spec in project.specifications" :key="spec.id"
          :to="`/specifications/${spec.id}`"
          class="block bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold">{{ spec.title }}</h3>
              <p class="text-sm text-gray-400 mt-1">
                {{ spec.sections.length }} разделов &middot;
                {{ new Date(spec.createdAt).toLocaleDateString('ru') }}
              </p>
            </div>
            <span class="text-sm text-gray-500">
              {{ formatTime(spec.sections.reduce((sum, s) =>
                sum + s.items.reduce((iSum, item) => iSum + (item.timeEstimate || 0), 0), 0)) }}
            </span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
