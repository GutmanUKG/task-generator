<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import api from '../api'

  const route = useRoute()
  const spec = ref(null)
  const loading = ref(true)
  const error = ref('')


  // ========================================
  // Режим редактирования
  //
  // isEditing — переключатель просмотр/редактирование
  // editTitle — редактируемый заголовок
  // editSections — редактируемые секции (копия данных)
  //
  // Работаем с копией, чтобы можно было отменить изменения
  // ========================================
  const isEditing = ref(false)
  const editTitle = ref('')
  const editSections = ref([])
  const isSaving = ref(false)


  // ========================================
  // Загружаем ТЗ по ID из URL
  //
  // GET /api/specifications/:id
  // Возвращает: { title, sections: [{ title, items: [...] }] }
  // ========================================

  onMounted(async () =>{
    try{
      const response = await api.get(`/specifications/${route.params.id}`)
      spec.value = response.data
    }catch (e) {
      error.value = e.response?.data?.error || 'Ошибка загрузки ТЗ'
    }finally {
      loading.value = false
    }
  })
  // Форматирование минут в "X ч Y мин"
  function formatTime(minutes) {
    if (!minutes) return ''
    if (minutes < 60) return `${minutes} мин`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m ? `${h} ч ${m} мин` : `${h} ч`
  }
  // Суммарное время всех пунктов
  function totalTime() {
    if (!spec.value) return 0
    return spec.value.sections.reduce((sum, s) =>
        sum + s.items.reduce((iSum, item) => iSum + (item.timeEstimate || 0), 0), 0)
  }

  // Включить режим редактирования
  // JSON.parse(JSON.stringify(...)) — глубокая копия объекта
  function startEditing(){
    editTitle.value = spec.value.title
    editSections.value = JSON.parse(JSON.stringify(spec.value.sections))
    isEditing.value = true
  }
  // Отменить редактирование
  function cancelEditing() {
    isEditing.value = false
  }
  // Добавить раздел
  function addSection(){
    editSections.value.push({
      title: 'Новый раздел',
      items: [{content : '', timeEstimate: null}]
    })
  }
  // Добавить пункт в раздел
  function addItem(sIdx){
    editSections.value[sIdx].items.push({
      content: '',
      timeEstimate: null
    })
  }
  // Удалить пункт
  function removeItem(sIdx, iIdx) {
    editSections.value[sIdx].items.splice(iIdx, 1)
  }
  // Удалить раздел
  function removeSection(sIdx) {
    editSections.value.splice(sIdx, 1)
  }
  // Сохранить изменения

  async function saveChanges (){
    isSaving.value = true
    try{
      const response = await api.put(`/specifications/${route.params.id}`, {
        title: editTitle.value,
        sections: editSections.value
      })
      spec.value = response.data
      isEditing.value = false
    }catch (e) {
      error.value = e.response?.data?.error || 'Ошибка сохранения'
    }finally {
      isSaving.value = false
    }
  }
</script>
<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="loading" class="text-center py-12 text-gray-500">Загрузкa...</div>
    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded">{{error}}</div>
    <div v-else-if="spec">
      <!-- Заголовок + общее время -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ spec.title }}</h1>
        <span class="text-sm text-gray-500">
          Общее время: {{ formatTime(totalTime()) }}
        </span>
      </div>

      <!-- Кнопка редактирования (в режиме просмотра) -->
      <button v-if="!isEditing" @click="startEditing"
        class="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
        Редактировать
      </button>

      <!-- ===== РЕЖИМ ПРОСМОТРА ===== -->
      <template v-if="!isEditing">
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
      </template>

      <!-- ===== РЕЖИМ РЕДАКТИРОВАНИЯ ===== -->
      <template v-else>
        <!-- Название -->
        <div class="bg-white rounded-lg shadow p-6 mb-4">
          <label class="block text-sm font-medium mb-1">Название ТЗ</label>
          <input v-model="editTitle" type="text" class="w-full border rounded px-3 py-2" />
        </div>

        <!-- Секции -->
        <div v-for="(section, sIdx) in editSections" :key="sIdx"
          class="bg-white rounded-lg shadow p-6 mb-4">
          <div class="flex items-center justify-between mb-4">
            <input v-model="section.title" type="text"
              class="text-lg font-semibold border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none flex-1"
              placeholder="Название раздела" />
            <button @click="removeSection(sIdx)"
              class="text-red-400 hover:text-red-600 ml-4 text-sm">
              Удалить раздел
            </button>
          </div>

          <div v-for="(item, iIdx) in section.items" :key="iIdx"
            class="flex gap-3 mb-3 items-start">
            <span class="text-gray-400 mt-2 text-sm">{{ sIdx + 1 }}.{{ iIdx + 1 }}</span>
            <textarea v-model="item.content" rows="2"
              class="flex-1 border rounded px-3 py-2 text-sm"
              placeholder="Описание пункта"></textarea>
            <input v-model.number="item.timeEstimate" type="number" min="0"
              class="w-20 border rounded px-2 py-2 text-sm"
              placeholder="мин" />
            <button @click="removeItem(sIdx, iIdx)"
              class="text-red-400 hover:text-red-600 mt-2">&times;</button>
          </div>

          <button @click="addItem(sIdx)"
            class="text-blue-500 hover:text-blue-700 text-sm">
            + Добавить пункт
          </button>
        </div>

        <!-- Кнопки -->
        <div class="flex gap-4">
          <button @click="addSection"
            class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
            + Добавить раздел
          </button>
          <button @click="saveChanges" :disabled="isSaving"
            class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50">
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </button>
          <button @click="cancelEditing"
            class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
            Отмена
          </button>
        </div>
      </template>
    </div>
  </div>
</template>