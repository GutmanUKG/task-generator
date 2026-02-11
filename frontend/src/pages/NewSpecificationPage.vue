<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api';

const router = useRouter()
const route = useRoute()

const voiceText = ref('')
const title = ref('')
const projectId = ref(null)
const projects = ref([])
const sections = ref([])
const isStructuring = ref(false)
const isSaving = ref(false)
const error = ref('')

const crmSystems = ref([])
const selectedCrm = ref('bitrix')

const prompts = ref([])
const selectedPromptId = ref(null)

onMounted(async () => {
  voiceText.value = sessionStorage.getItem('voiceText') || ''

  try {
    const [projectsRes, crmRes] = await Promise.all([
        api.get('/projects'),
        api.get('/crm/systems')
    ])
    projects.value = projectsRes.data
    crmSystems.value = crmRes.data

    if (route.query.projectId) {
      projectId.value = parseInt(route.query.projectId)
    }
    const response = await api.get('/prompts')
    prompts.value = response.data
    const defaultPrompt = prompts.value.find(p => p.isDefault)
    if (defaultPrompt) {
      selectedPromptId.value = defaultPrompt.id
    }
  } catch (e) {
    console.error(e)
  }
})

async function structureWithAI() {
  if (!voiceText.value.trim()) {
    error.value = 'Введите или запишите текст'
    return
  }

  isStructuring.value = true
  error.value = ''

  try {
    const response = await api.post('/ai/structure', {
      text: voiceText.value,
      crm: selectedCrm.value !== 'none' ? selectedCrm.value : undefined,
      promptId: selectedPromptId.value
    })
    sections.value = response.data.sections
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка AI-структурирования'
  } finally {
    isStructuring.value = false
  }
}

function addSection() {
  sections.value.push({
    title: 'Новый раздел',
    items: [{ content: '', timeEstimate: null }]
  })
}

function addItem(sectionIndex) {
  sections.value[sectionIndex].items.push({
    content: '',
    timeEstimate: null
  })
}

function removeItem(sectionIndex, itemIndex) {
  sections.value[sectionIndex].items.splice(itemIndex, 1)
}

function removeSection(index) {
  sections.value.splice(index, 1)
}

async function save() {
  if (!title.value.trim()) {
    error.value = 'Введите название ТЗ'
    return
  }
  if (!projectId.value) {
    error.value = 'Выберите проект'
    return
  }

  isSaving.value = true
  try {
    const response = await api.post('/specifications', {
      title: title.value,
      projectId: projectId.value,
      sections: sections.value
    })

    sessionStorage.removeItem('voiceText')
    router.push(`/specifications/${response.data.id}`)
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка сохранения'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Новое техническое задание</h1>

    <div v-if="error" role="alert" class="alert alert-error mb-4">
      <span>{{ error }}</span>
    </div>

    <!-- Основные поля -->
    <div class="card bg-base-100 shadow-md mb-6">
      <div class="card-body space-y-4">
        <div class="form-control">
          <label class="label"><span class="label-text">Название ТЗ</span></label>
          <input v-model="title" type="text" class="input input-bordered w-full"
                 placeholder="Например: Разработка интернет-магазина" />
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text">Проект</span></label>
          <select v-model="projectId" class="select select-bordered w-full">
            <option :value="null" disabled>Выберите проект</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">
              {{ p.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-md mb-6">
      <div class="card-body">
        <div class="form-control">
          <label class="label"><span class="label-text">CRM / Платформа</span></label>
          <select v-model="selectedCrm" class="select select-bordered w-full">
            <option v-for="crm in crmSystems" :key="crm.id" :value="crm.id">{{crm.name}}</option>
          </select>
          <label class="label">
            <span class="label-text-alt">AI учтёт специфику платформы при оценке задач и формулировках</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Голосовой текст -->
    <div class="card bg-base-100 shadow-md mb-6">
      <div class="card-body">
        <div class="form-control">
          <label class="label"><span class="label-text">Текст из голосового ввода</span></label>
          <textarea v-model="voiceText" rows="6" class="textarea textarea-bordered w-full"
                    placeholder="Вставьте текст или запишите голос на странице 'Записать'"></textarea>
        </div>

        <!-- Селектор промпта -->
        <div class="mt-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <select v-model="selectedPromptId"
                  class="select select-bordered select-sm flex-1 sm:max-w-xs">
            <option :value="null">Стандартный промпт</option>
            <option v-for="p in prompts" :key="p.id" :value="p.id">
              {{ p.title }}
            </option>
          </select>

          <button @click="structureWithAI" :disabled="isStructuring"
                  class="btn btn-secondary btn-sm sm:btn-md">
            <span v-if="isStructuring" class="loading loading-spinner loading-sm"></span>
            {{ isStructuring ? 'AI обрабатывает...' : 'Структурировать через AI' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Разделы и пункты -->
    <div class="space-y-4 mb-6">
      <div v-for="(section, sIdx) in sections" :key="sIdx"
           class="card bg-base-100 shadow-md">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <input v-model="section.title" type="text"
                   class="input input-ghost text-lg font-semibold flex-1 px-0"
                   placeholder="Название раздела" />
            <button @click="removeSection(sIdx)"
                    class="btn btn-ghost btn-sm text-error ml-4">
              Удалить раздел
            </button>
          </div>

          <!-- Пункты раздела -->
          <div v-for="(item, iIdx) in section.items" :key="iIdx"
               class="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 items-stretch sm:items-start">
            <div class="flex gap-2 sm:gap-3 items-start flex-1">
              <span class="text-base-content/40 mt-2 text-sm shrink-0">{{ sIdx + 1 }}.{{ iIdx + 1 }}</span>
              <textarea v-model="item.content" rows="2"
                        class="textarea textarea-bordered flex-1 text-sm"
                        placeholder="Описание пункта"></textarea>
            </div>
            <div class="flex gap-2 items-center sm:items-start pl-7 sm:pl-0">
              <input v-model.number="item.timeEstimate" type="number" min="0"
                     class="input input-bordered input-sm w-20"
                     placeholder="мин" title="Оценка времени (минуты)" />
              <button @click="removeItem(sIdx, iIdx)"
                      class="btn btn-ghost btn-sm text-error">
                &times;
              </button>
            </div>
          </div>

          <button @click="addItem(sIdx)"
                  class="btn btn-ghost btn-sm text-primary">
            + Добавить пункт
          </button>
        </div>
      </div>
    </div>

    <!-- Кнопки -->
    <div class="flex flex-wrap gap-3 sm:gap-4">
      <button @click="addSection" class="btn btn-ghost">
        + Добавить раздел
      </button>

      <button @click="save" :disabled="isSaving" class="btn btn-success">
        <span v-if="isSaving" class="loading loading-spinner loading-sm"></span>
        {{ isSaving ? 'Сохранение...' : 'Сохранить ТЗ' }}
      </button>
    </div>
  </div>
</template>
