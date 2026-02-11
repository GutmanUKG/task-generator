<script setup>
import { ref, onMounted } from "vue"
import api from "../api"

const prompts = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref(null)
const formData = ref({
  title: '',
  content: '',
  isDefault: false
})
const formError = ref('')

onMounted(async () => {
  await loadPrompts()
})

async function loadPrompts() {
  loading.value = true
  try {
    const response = await api.get('/prompts')
    prompts.value = response.data
  } catch (e) {
    console.error('Ошибка загрузки промптов:', e)
  } finally {
    loading.value = false
  }
}

async function openCreate() {
  editingId.value = null
  formError.value = ''

  try {
    const response = await api.get('/prompts/default-text')
    formData.value = {
      title: '',
      content: response.data.content,
      isDefault: prompts.value.length === 0
    }
  } catch (e) {
    formData.value = { title: '', content: '', isDefault: false }
  }

  showForm.value = true
}

function openEdit(prompt) {
  editingId.value = prompt.id
  formData.value = {
    title: prompt.title,
    content: prompt.content,
    isDefault: prompt.isDefault
  }
  formError.value = ''
  showForm.value = true
}

async function savePrompt() {
  if (!formData.value.title.trim()) {
    formError.value = 'Введите название промпта'
    return
  }
  if (!formData.value.content.trim()) {
    formError.value = 'Введите текст промпта'
    return
  }

  try {
    if (editingId.value) {
      await api.put(`/prompts/${editingId.value}`, formData.value)
    } else {
      await api.post('/prompts', formData.value)
    }
    showForm.value = false
    await loadPrompts()
  } catch (e) {
    formError.value = e.response?.data?.error || 'Ошибка сохранения'
  }
}

async function setDefault(id) {
  try {
    await api.put(`/prompts/${id}`, { isDefault: true })
    await loadPrompts()
  } catch (e) {
    console.error('Ошибка:', e)
  }
}

async function deletePrompt(id) {
  if (!confirm('Удалить этот промпт?')) return
  try {
    await api.delete(`/prompts/${id}`)
    await loadPrompts()
  } catch (e) {
    alert('Ошибка удаления')
  }
}

function preview(text) {
  return text.length > 150 ? text.substring(0, 150) + '...' : text
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4 sm:mb-6">
      <h1 class="text-xl sm:text-2xl font-bold">Промпты</h1>
      <button @click="openCreate" class="btn btn-primary btn-sm sm:btn-md">
        + Новый промпт
      </button>
    </div>

    <!-- Модальное окно создания/редактирования -->
    <div v-if="showForm" class="modal modal-open">
      <div class="modal-box w-11/12 max-w-lg">
        <h3 class="text-lg font-bold mb-4">
          {{ editingId ? 'Редактировать промпт' : 'Новый промпт' }}
        </h3>

        <div v-if="formError" role="alert" class="alert alert-error mb-4">
          <span>{{ formError }}</span>
        </div>

        <div class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Название</span></label>
            <input v-model="formData.title" type="text"
                   class="input input-bordered w-full"
                   placeholder="Например: Промпт для мобильных приложений" />
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text">Текст промпта</span></label>
            <textarea v-model="formData.content" rows="10"
                      class="textarea textarea-bordered w-full text-sm font-mono"
                      placeholder="Инструкция для AI..."></textarea>
            <label class="label">
              <span class="label-text-alt">Текст заказчика будет добавлен в конец промпта автоматически</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
              <input v-model="formData.isDefault" type="checkbox" class="checkbox checkbox-primary" />
              <span class="label-text">Использовать по умолчанию</span>
            </label>
          </div>
        </div>

        <div class="modal-action">
          <button @click="savePrompt" class="btn btn-primary">
            Сохранить
          </button>
          <button @click="showForm = false" class="btn btn-ghost">
            Отмена
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="showForm = false"></div>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Пустой список -->
    <div v-else-if="prompts.length === 0" class="text-center py-12">
      <div class="card bg-base-100 shadow-xl max-w-md mx-auto">
        <div class="card-body items-center text-center">
          <h2 class="card-title">Промптов пока нет</h2>
          <p class="text-base-content/60 text-sm">
            Промпт — это инструкция для AI, которая определяет как будет
            структурировано ваше ТЗ. Создайте свой первый промпт или
            используйте стандартный шаблон.
          </p>
          <div class="card-actions mt-2">
            <button @click="openCreate" class="btn btn-primary">
              Создать первый промпт
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Список промптов -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="prompt in prompts" :key="prompt.id"
           class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
        <div class="card-body">
          <div class="flex items-start justify-between mb-2">
            <h2 class="card-title text-base">{{ prompt.title }}</h2>
            <span v-if="prompt.isDefault"
                  class="badge badge-success badge-sm shrink-0 ml-2">
              По умолчанию
            </span>
          </div>

          <p class="text-base-content/50 text-sm font-mono">
            {{ preview(prompt.content) }}
          </p>

          <p class="text-xs text-base-content/40">
            Создан: {{ new Date(prompt.createdAt).toLocaleDateString('ru') }}
          </p>

          <div class="card-actions justify-start mt-2">
            <button v-if="!prompt.isDefault" @click="setDefault(prompt.id)"
                    class="btn btn-ghost btn-sm text-success">
              По умолчанию
            </button>
            <button @click="openEdit(prompt)"
                    class="btn btn-ghost btn-sm">
              Редактировать
            </button>
            <button @click="deletePrompt(prompt.id)"
                    class="btn btn-ghost btn-sm text-error">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
