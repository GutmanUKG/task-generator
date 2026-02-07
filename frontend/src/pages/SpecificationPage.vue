<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const spec = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response = await api.get(`/specifications/${route.params.id}`)
    spec.value = response.data
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка загрузки ТЗ'
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

function totalTime() {
  if (!spec.value) return 0
  return spec.value.sections.reduce((sum, s) =>
    sum + s.items.reduce((iSum, item) => iSum + (item.timeEstimate || 0), 0), 0)
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="loading" class="text-center py-12 text-gray-500">Загрузка...</div>

    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded">{{ error }}</div>

    <div v-else-if="spec">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ spec.title }}</h1>
        <span class="text-sm text-gray-500">
          Общее время: {{ formatTime(totalTime()) }}
        </span>
      </div>

      <div v-for="(section, sIdx) in spec.sections" :key="section.id"
        class="bg-white rounded-lg shadow p-6 mb-4">
        <h2 class="text-lg font-semibold mb-4">{{ sIdx + 1 }}. {{ section.title }}</h2>

        <div v-for="(item, iIdx) in section.items" :key="item.id"
          class="flex justify-between items-start py-2 border-b last:border-0">
          <span class="text-sm">
            <span class="text-gray-400 mr-2">{{ sIdx + 1 }}.{{ iIdx + 1 }}</span>
            {{ item.content }}
          </span>
          <span v-if="item.timeEstimate" class="text-xs text-gray-500 whitespace-nowrap ml-4">
            {{ formatTime(item.timeEstimate) }}
          </span>
        </div>
      </div>

      <router-link to="/dashboard"
        class="inline-block mt-4 text-blue-500 hover:text-blue-700">
        &larr; На главную
      </router-link>
    </div>
  </div>
</template>
