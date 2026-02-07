<script setup>
import { ref, onMounted } from "vue";
import api from "../api";


// ========================================
// Реактивные данные
// ========================================
const projects = ref([])        // Список проектов
const loading = ref(true)       // Загрузка списка
const showForm = ref(false)     // Показать/скрыть форму
const editingId = ref(null)     // ID редактируемого проекта (null = создание)
const formData = ref({          // Данные формы
  name: '',
  description: ''
})
const formError = ref('')
// ========================================
// Загрузка проектов при открытии страницы
//
// onMounted — вызывается когда компонент появился в DOM
// ========================================

onMounted(async ()=>{
  await loadProjects()
})

async function loadProjects(){
  loading.value = true
  try {
    const response = await api.get('/projects')
    projects.value = response.data
  }catch (e){
    console.error('Ошибка загрузки проектов:', e)
  }finally {
    loading.value = false
  }
}

// ========================================
// Открыть форму для создания
// ========================================

function openCreate(){
  editingId.value = null
  formData.value = { name: '', description: '' }
  formError.value = ''
  showForm.value = true
}

// ========================================
// Открыть форму для редактирования
// Заполняем данные существующего проекта
// ========================================

function openEdit(project) {
  editingId.value = project.id
  formData.value = {
    name: project.name,
    description: project.description || ''
  }
  formError.value = ''
  showForm.value = true
}
// ========================================
// Сохранить (создание или обновление)
//
// Если editingId == null → POST (создание)
// Если editingId != null → PUT (обновление)
// ========================================

async function saveProject() {
  if(!formData.value.name.trim()) {
    formError.value = 'Введите название проекта'
    return
  }

  try{
    if(editingId.value){
      await api.put(`/projects/${editingId.value}`, formData.value)
    }else{
      await api.post('/projects', formData.value)
    }
    showForm.value = false
    await loadProjects() //Перезагрузка списка
  }catch (e){
    formError.value = e.response?.data?.error || 'Ошибка сохранения'
  }
}

// ========================================
// Удаление с подтверждением
// ========================================

async function deleteProject(id) {
  if(!confirm('Удалить проект и все его ТЗ ?')) return
  try {
    await api.delete(`/projects/${id}`)
    await loadProjects()
  }catch (e) {
    alert('Ошибка удаления')
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Проекты</h1>
      <button @click="openCreate"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        + Новый проект
      </button>
    </div>

    <!-- Форма создания/редактирования (модальное окно) -->

    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {{ editingId ? 'Редактировать проект' : 'Новый проект' }}
        </h2>

        <div v-if="formError" class="bg-red-100 text-red-700 p-3 rounded mb-4">
          {{ formError }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Название</label>
            <input v-model="formData.name" type="text"
                   class="w-full border rounded px-3 py-2"
                   placeholder="Название проекта" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Описание</label>
            <textarea v-model="formData.description" rows="3"
                      class="w-full border rounded px-3 py-2"
                      placeholder="Описание (необязательно)"></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="saveProject"
                  class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Сохранить
          </button>
          <button @click="showForm = false"
                  class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
            Отмена
          </button>
        </div>
      </div>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="text-gray-500">Загрузка...</div>

    <!-- Пустой список -->
    <div v-else-if="projects.length === 0" class="text-center py-12 text-gray-500">
      <p class="text-lg mb-2">Проектов пока нет</p>
      <p class="text-sm">Нажмите "Новый проект" чтобы создать первый</p>
    </div>

    <!-- Список проектов -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="project in projects" :key="project.id"
           class="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow">
        <h3 class="font-semibold text-lg mb-1">{{ project.name }}</h3>
        <p v-if="project.description" class="text-gray-500 text-sm mb-4">
          {{ project.description }}
        </p>
        <p class="text-xs text-gray-400 mb-4">
          Создан: {{ new Date(project.createdAt).toLocaleDateString('ru') }}
        </p>

        <div class="flex gap-2">
          <router-link :to="`/projects/${project.id}`"
                       class="text-blue-500 hover:text-blue-700 text-sm">
            Открыть
          </router-link>
          <button @click="openEdit(project)"
                  class="text-gray-500 hover:text-gray-700 text-sm">
            Редактировать
          </button>
          <button @click="deleteProject(project.id)"
                  class="text-red-500 hover:text-red-700 text-sm">
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>