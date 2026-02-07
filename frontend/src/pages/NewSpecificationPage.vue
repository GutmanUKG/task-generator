<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()

// ========================================
// Состояние
// ========================================
const voiceText = ref('')           // Исходный текст из голоса
const title = ref('')               // Название ТЗ
const projectId = ref(null)         // Выбранный проект
const projects = ref([])            // Список проектов для выбора
const sections = ref([])            // Разделы ТЗ (результат AI)
const isStructuring = ref(false)    // AI обрабатывает текст
const isSaving = ref(false)
const error = ref('')

// ========================================
// При открытии страницы:
// 1. Получаем текст из sessionStorage (записан на RecordPage)
// 2. Загружаем список проектов
// ========================================
onMounted(async () => {
  voiceText.value = sessionStorage.getItem('voiceText') || ''

  try {
    const response = await api.get('/projects')
    projects.value = response.data
  } catch (e) {
    console.error(e)
  }
})

// ========================================
// Отправить текст на AI-структурирование
//
// POST /api/ai/structure — принимает { text }
// Возвращает { sections: [{ title, items: [{ content }] }] }
// ========================================
async function structureWithAI() {
  if (!voiceText.value.trim()) {
    error.value = 'Введите или запишите текст'
    return
  }

  isStructuring.value = true
  error.value = ''

  try {
    const response = await api.post('/ai/structure', {
      text: voiceText.value
    })
    sections.value = response.data.sections
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка AI-структурирования'
  } finally {
    isStructuring.value = false
  }
}

// ========================================
// Ручное добавление раздела
// ========================================
function addSection() {
  sections.value.push({
    title: 'Новый раздел',
    items: [{ content: '', timeEstimate: null }]
  })
}

// ========================================
// Добавить пункт в раздел
// ========================================
function addItem(sectionIndex) {
  sections.value[sectionIndex].items.push({
    content: '',
    timeEstimate: null
  })
}

// ========================================
// Удалить пункт из раздела
// ========================================
function removeItem(sectionIndex, itemIndex) {
  sections.value[sectionIndex].items.splice(itemIndex, 1)
}

// ========================================
// Удалить раздел целиком
// ========================================
function removeSection(index) {
  sections.value.splice(index, 1)
}

// ========================================
// Сохранить ТЗ
//
// POST /api/specifications — создаёт ТЗ со вложенными
// секциями и пунктами (Prisma nested create)
// ========================================
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
    const response = await api.post('/specifications/generate', {
      text: voiceText.value,
      projectId: projectId.value
    })

    // Очищаем sessionStorage и переходим к ТЗ
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
    <h1 class="text-2xl font-bold mb-6">Новое техническое задание</h1>

    <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- Основные поля -->
    <div class="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Название ТЗ</label>
        <input v-model="title" type="text" class="w-full border rounded px-3 py-2"
               placeholder="Например: Разработка интернет-магазина" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Проект</label>
        <select v-model="projectId" class="w-full border rounded px-3 py-2">
          <option :value="null" disabled>Выберите проект</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">
            {{ p.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Голосовой текст -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <label class="block text-sm font-medium mb-2">Текст из голосового ввода</label>
      <textarea v-model="voiceText" rows="6" class="w-full border rounded px-3 py-2"
                placeholder="Вставьте текст или запишите голос на странице 'Записать'"></textarea>

      <button @click="structureWithAI" :disabled="isStructuring"
              class="mt-3 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50">
        {{ isStructuring ? 'AI обрабатывает...' : 'Структурировать через AI' }}
      </button>
    </div>

    <!-- Разделы и пункты -->
    <div class="space-y-4 mb-6">
      <div v-for="(section, sIdx) in sections" :key="sIdx"
           class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <input v-model="section.title" type="text"
                 class="text-lg font-semibold border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none flex-1"
                 placeholder="Название раздела" />
          <button @click="removeSection(sIdx)"
                  class="text-red-400 hover:text-red-600 ml-4 text-sm">
            Удалить раздел
          </button>
        </div>

        <!-- Пункты раздела -->
        <div v-for="(item, iIdx) in section.items" :key="iIdx"
             class="flex gap-3 mb-3 items-start">
          <span class="text-gray-400 mt-2 text-sm">{{ sIdx + 1 }}.{{ iIdx + 1 }}</span>

          <textarea v-model="item.content" rows="2"
                    class="flex-1 border rounded px-3 py-2 text-sm"
                    placeholder="Описание пункта"></textarea>

          <input v-model.number="item.timeEstimate" type="number" min="0"
                 class="w-20 border rounded px-2 py-2 text-sm"
                 placeholder="мин" title="Оценка времени (минуты)" />

          <button @click="removeItem(sIdx, iIdx)"
                  class="text-red-400 hover:text-red-600 mt-2">
            &times;
          </button>
        </div>

        <button @click="addItem(sIdx)"
                class="text-blue-500 hover:text-blue-700 text-sm">
          + Добавить пункт
        </button>
      </div>
    </div>

    <!-- Кнопки -->
    <div class="flex gap-4">
      <button @click="addSection"
              class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
        + Добавить раздел
      </button>

      <button @click="save" :disabled="isSaving"
              class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50">
        {{ isSaving ? 'Сохранение...' : 'Сохранить ТЗ' }}
      </button>
    </div>
  </div>
</template>