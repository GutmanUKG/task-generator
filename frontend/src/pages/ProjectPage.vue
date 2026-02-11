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

// Удаление ТЗ
async function deleteSpec(specId) {
  if (!confirm('Удалить это ТЗ? Действие необратимо.')) return

  try {
    await api.delete(`/specifications/${specId}`)
    project.value.specifications = project.value.specifications.filter(s => s.id !== specId)
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка удаления')
  }
}

// Форматирование минут в "X ч Y мин"
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
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="error" role="alert" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <div v-else-if="project">
      <!-- Навигация назад -->
      <div class="mb-6">
        <router-link to="/projects" class="link link-primary text-sm">
          &larr; Все проекты
        </router-link>
      </div>

      <h1 class="text-2xl font-bold mb-2">{{ project.name }}</h1>
      <p v-if="project.description" class="text-base-content/60 mb-6">{{ project.description }}</p>

      <!-- Заголовок секции ТЗ + кнопка создания -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h2 class="text-lg font-semibold">Технические задания</h2>
        <router-link :to="`/record?projectId=${project.id}`"
                     class="btn btn-primary btn-sm">
          + Создать ТЗ
        </router-link>
      </div>

      <!-- Пустой список -->
      <div v-if="project.specifications.length === 0"
           class="card bg-base-100 shadow-md">
        <div class="card-body text-center text-base-content/50">
          <p>ТЗ пока нет</p>
          <p class="text-sm mt-1">Запишите голос и создайте первое техническое задание</p>
        </div>
      </div>

      <!-- Список ТЗ проекта -->
      <div v-else class="space-y-4">
        <div v-for="spec in project.specifications" :key="spec.id"
             class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
          <div class="card-body py-4">
            <div class="flex flex-col sm:flex-row justify-between items-start gap-1">
              <router-link :to="`/specifications/${spec.id}`" class="flex-1 min-w-0">
                <h3 class="card-title text-base">{{ spec.title }}</h3>
                <p class="text-sm text-base-content/40 mt-1">
                  {{ spec.sections.length }} разделов &middot;
                  {{ new Date(spec.createdAt).toLocaleDateString('ru') }}
                </p>
              </router-link>
              <div class="flex items-center gap-3 mt-2 sm:mt-0">
                <span class="badge badge-ghost">
                  {{ formatTime(spec.sections.reduce((sum, s) =>
                    sum + s.items.reduce((iSum, item) => iSum + (item.timeEstimate || 0), 0), 0)) }}
                </span>
                <button @click="deleteSpec(spec.id)"
                        class="btn btn-ghost btn-xs text-error">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
