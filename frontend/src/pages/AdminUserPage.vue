<script setup>
import  {ref, onMounted} from "vue";
import  { useRoute } from "vue-router";
import api from '../api'

const route = useRoute()
const user = ref(null)
const specs = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async ()=>{
  try {
    const [userRes, specsRes] = await Promise.all([
        api.get(`/admin/users/${route.params.id}`),
        api.get(`/admin/users/${route.params.id}/specifications`)
    ])
    user.value = userRes.data
    specs.value = specsRes.data
  }catch (e) {
    error.value = e.response?.data?.error || 'Ошибка загрузки'
  }finally {
    loading.value = false
  }
})

//Смена роли
async function changeRole(newRole) {
  try {
    await api.patch(`/admin/users/${route.params.id}/role`, {role: newRole})
    user.value.role = newRole
  }catch (e) {
    error.value = e.response?.data?.error || 'Ошибка смены роли'
  }
}
// Цвета ролей
const roleMap = {
  admin: { label: 'Админ', color: 'badge-error' },
  manager: { label: 'Менеджер', color: 'badge-info' },
  executor: { label: 'Исполнитель', color: 'badge-success' }
}

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

    <div v-else-if="user">
      <!-- Навигация назад -->
      <router-link to="/admin/users"
                   class="link link-primary text-sm mb-4 inline-block">
        &larr; Все пользователи
      </router-link>

      <!-- Карточка пользователя -->
      <div class="card bg-base-100 shadow-md mb-6">
        <div class="card-body">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h1 class="text-xl sm:text-2xl font-bold">{{ user.name }}</h1>
                <span :class="['badge',
                  roleMap[user.role]?.color || 'badge-ghost']">
                  {{ roleMap[user.role]?.label || user.role }}
                </span>
              </div>
              <p class="text-base-content/60">{{ user.email }}</p>
              <p class="text-xs text-base-content/40 mt-1">
                Зарегистрирован: {{ new Date(user.createdAt).toLocaleDateString('ru') }}
              </p>
            </div>
            <!-- Смена роли -->
            <div class="flex flex-wrap gap-2">
              <button v-for="(info, role) in roleMap" :key="role"
                      :disabled="user.role === role"
                      @click="changeRole(role)"
                      :class="['btn btn-sm',
                  user.role === role ? 'btn-disabled' : 'btn-outline']">
                {{ info.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Проекты -->
      <h2 class="text-lg font-semibold mb-3">
        Проекты ({{ user.projects.length }})
      </h2>
      <div v-if="user.projects.length === 0"
           class="card bg-base-100 shadow-md mb-6">
        <div class="card-body text-center text-base-content/50">
          Проектов нет
        </div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div v-for="project in user.projects" :key="project.id"
             class="card bg-base-100 shadow-md">
          <div class="card-body py-4">
            <h3 class="card-title text-base">{{ project.name }}</h3>
            <p v-if="project.description" class="text-sm text-base-content/50">
              {{ project.description }}
            </p>
            <p class="text-xs text-base-content/40">
              {{ project._count.specifications }} ТЗ &middot;
              {{ new Date(project.createdAt).toLocaleDateString('ru') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ТЗ пользователя -->
    <h2 class="text-lg font-semibold mb-3">
      Технические задания ({{ specs.length }})
    </h2>

    <div v-if="specs.length === 0"
         class="card bg-base-100 shadow-md">
      <div class="card-body text-center text-base-content/50">
        ТЗ нет
      </div>
    </div>
    <div v-else class="space-y-3">
      <div v-for="spec in specs" :key="spec.id"
           class="card bg-base-100 shadow-md">
        <div class="card-body py-4">
          <div class="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
            <div>
              <h3 class="card-title text-base">{{ spec.title }}</h3>
              <p class="text-sm text-base-content/40">
                Проект: {{ spec.project?.name || '—' }} &middot;
                {{ spec.sections.length }} разделов &middot;
                {{ new Date(spec.createdAt).toLocaleDateString('ru') }}
              </p>
            </div>
            <span class="badge badge-ghost">
              {{ formatTime(spec.sections.reduce((sum, s) =>
              sum + s.items.reduce((iSum, item) => iSum + (item.timeEstimate || 0), 0), 0)) }}
            </span>
          </div>

          <!-- Секции и пункты (сворачиваемые) -->
          <div v-for="(section, sIdx) in spec.sections" :key="section.id"
               class="collapse collapse-arrow border-t border-base-200">
            <input type="checkbox" />
            <div class="collapse-title text-sm font-medium py-2 min-h-0">
              {{ sIdx + 1 }}. {{ section.title }}
              <span class="text-base-content/40 font-normal">({{ section.items.length }} пунктов)</span>
            </div>
            <div class="collapse-content">
              <div v-for="(item, iIdx) in section.items" :key="item.id"
                   class="flex items-start gap-2 text-sm py-1">
                <span class="text-base-content/40 shrink-0">{{ sIdx + 1 }}.{{ iIdx + 1 }}</span>
                <span class="flex-1 break-words">{{ item.content }}</span>
                <span v-if="item.timeEstimate"
                      class="badge badge-sm badge-ghost shrink-0">
                  {{ formatTime(item.timeEstimate) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
