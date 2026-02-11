<script setup>
import { ref, onMounted } from "vue";
import api from "../api";

const projects = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref(null)
const formData = ref({
  name: '',
  description: ''
})
const formError = ref('')

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

function openCreate(){
  editingId.value = null
  formData.value = { name: '', description: '' }
  formError.value = ''
  showForm.value = true
}

function openEdit(project) {
  editingId.value = project.id
  formData.value = {
    name: project.name,
    description: project.description || ''
  }
  formError.value = ''
  showForm.value = true
}

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
    await loadProjects()
  }catch (e){
    formError.value = e.response?.data?.error || 'Ошибка сохранения'
  }
}

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
    <div class="flex justify-between items-center mb-4 sm:mb-6">
      <h1 class="text-xl sm:text-2xl font-bold">Проекты</h1>
      <button @click="openCreate" class="btn btn-primary btn-sm sm:btn-md">
        + Новый проект
      </button>
    </div>

    <!-- Модальное окно создания/редактирования -->
    <div v-if="showForm" class="modal modal-open">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-4">
          {{ editingId ? 'Редактировать проект' : 'Новый проект' }}
        </h3>

        <div v-if="formError" role="alert" class="alert alert-error mb-4">
          <span>{{ formError }}</span>
        </div>

        <div class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Название</span></label>
            <input v-model="formData.name" type="text"
                   class="input input-bordered w-full"
                   placeholder="Название проекта" />
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text">Описание</span></label>
            <textarea v-model="formData.description" rows="3"
                      class="textarea textarea-bordered w-full"
                      placeholder="Описание (необязательно)"></textarea>
          </div>
        </div>

        <div class="modal-action">
          <button @click="saveProject" class="btn btn-primary">
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
    <div v-else-if="projects.length === 0" class="text-center py-12 text-base-content/50">
      <p class="text-lg mb-2">Проектов пока нет</p>
      <p class="text-sm">Нажмите "Новый проект" чтобы создать первый</p>
    </div>

    <!-- Список проектов -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="project in projects" :key="project.id"
           class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
        <div class="card-body">
          <h2 class="card-title">{{ project.name }}</h2>
          <p v-if="project.description" class="text-base-content/60 text-sm">
            {{ project.description }}
          </p>
          <p class="text-xs text-base-content/40">
            Создан: {{ new Date(project.createdAt).toLocaleDateString('ru') }}
          </p>

          <div class="card-actions justify-start mt-2">
            <router-link :to="`/projects/${project.id}`"
                         class="btn btn-primary btn-sm">
              Открыть
            </router-link>
            <button @click="openEdit(project)"
                    class="btn btn-ghost btn-sm">
              Редактировать
            </button>
            <button @click="deleteProject(project.id)"
                    class="btn btn-ghost btn-sm text-error">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
