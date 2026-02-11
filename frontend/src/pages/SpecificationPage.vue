<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import api from '../api'
  import ItemAttachments from '../components/ItemAttachments.vue'

  const route = useRoute()
  const spec = ref(null)
  const loading = ref(true)
  const error = ref('')

  const isEditing = ref(false)
  const editTitle = ref('')
  const editSections = ref([])
  const isSaving = ref(false)
  const isExporting = ref(false)

  async function loadSpecification() {
    try {
      const response = await api.get(`/specifications/${route.params.id}`)
      spec.value = response.data
    } catch (e) {
      error.value = e.response?.data?.error || 'Ошибка загрузки ТЗ'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadSpecification()
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

  function startEditing(){
    editTitle.value = spec.value.title
    editSections.value = JSON.parse(JSON.stringify(spec.value.sections))
    isEditing.value = true
  }

  function cancelEditing() {
    isEditing.value = false
  }

  function addSection(){
    editSections.value.push({
      title: 'Новый раздел',
      items: [{content : '', timeEstimate: null}]
    })
  }

  function addItem(sIdx){
    editSections.value[sIdx].items.push({
      content: '',
      timeEstimate: null
    })
  }

  function removeItem(sIdx, iIdx) {
    editSections.value[sIdx].items.splice(iIdx, 1)
  }

  function removeSection(sIdx) {
    editSections.value.splice(sIdx, 1)
  }

  async function exportDoc() {
    isExporting.value = true
    try {
      const response = await api.get(`/export/doc/${route.params.id}`, {
        responseType: 'blob'
      })
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `tz-${route.params.id}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      error.value = 'Ошибка экспорта в DOC'
    } finally {
      isExporting.value = false
    }
  }

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
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="error" role="alert" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <div v-else-if="spec">
      <!-- Заголовок + общее время -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
        <h1 class="text-xl sm:text-2xl font-bold">{{ spec.title }}</h1>
        <span class="badge badge-lg badge-ghost">
          Общее время: {{ formatTime(totalTime()) }}
        </span>
      </div>

      <!-- Кнопки действий (в режиме просмотра) -->
      <div v-if="!isEditing" class="flex gap-3 mb-4 sm:mb-6">
        <button @click="startEditing" class="btn btn-primary btn-sm">
          Редактировать
        </button>
        <button @click="exportDoc" :disabled="isExporting" class="btn btn-secondary btn-sm">
          <span v-if="isExporting" class="loading loading-spinner loading-sm"></span>
          {{ isExporting ? 'Экспорт...' : 'Скачать DOCX' }}
        </button>
      </div>

      <!-- ===== РЕЖИМ ПРОСМОТРА ===== -->
      <template v-if="!isEditing">
        <div v-for="(section, sIdx) in spec.sections" :key="section.id"
          class="card bg-base-100 shadow-md mb-3 sm:mb-4">
          <div class="card-body p-4 sm:p-6">
            <h2 class="card-title text-base sm:text-lg">{{ sIdx + 1 }}. {{ section.title }}</h2>

            <div v-for="(item, iIdx) in section.items" :key="item.id"
              class="py-2 border-b border-base-200 last:border-0">
              <div class="flex items-start gap-2">
                <span class="text-base-content/40 text-xs sm:text-sm shrink-0 mt-0.5">{{ sIdx + 1 }}.{{ iIdx + 1 }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm break-words">{{ item.content }}</p>
                  <span v-if="item.timeEstimate"
                    class="badge badge-sm badge-ghost mt-1">
                    {{ formatTime(item.timeEstimate) }}
                  </span>
                  <!-- Скриншоты пункта -->
                  <ItemAttachments
                    :item-id="item.id"
                    :attachments="item.attachments || []"
                    @updated="loadSpecification" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <router-link to="/dashboard"
          class="link link-primary text-sm sm:text-base mt-4 inline-block">
          &larr; На главную
        </router-link>
      </template>

      <!-- ===== РЕЖИМ РЕДАКТИРОВАНИЯ ===== -->
      <template v-else>
        <!-- Название -->
        <div class="card bg-base-100 shadow-md mb-3 sm:mb-4">
          <div class="card-body p-4 sm:p-6">
            <div class="form-control">
              <label class="label"><span class="label-text">Название ТЗ</span></label>
              <input v-model="editTitle" type="text" class="input input-bordered w-full" />
            </div>
          </div>
        </div>

        <!-- Секции -->
        <div v-for="(section, sIdx) in editSections" :key="sIdx"
          class="card bg-base-100 shadow-md mb-3 sm:mb-4">
          <div class="card-body p-4 sm:p-6">
            <div class="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
              <input v-model="section.title" type="text"
                class="input input-ghost text-base sm:text-lg font-semibold flex-1 min-w-0 px-0"
                placeholder="Название раздела" />
              <button @click="removeSection(sIdx)"
                class="btn btn-ghost btn-xs text-error shrink-0">
                Удалить
              </button>
            </div>

            <div v-for="(item, iIdx) in section.items" :key="iIdx"
              class="mb-3">
              <div class="flex gap-2 items-start">
                <span class="text-base-content/40 mt-2 text-xs sm:text-sm shrink-0">{{ sIdx + 1 }}.{{ iIdx + 1 }}</span>
                <div class="flex-1 min-w-0">
                  <textarea v-model="item.content" rows="2"
                    class="textarea textarea-bordered w-full text-sm"
                    placeholder="Описание пункта"></textarea>
                  <div class="flex gap-2 items-center mt-1">
                    <input v-model.number="item.timeEstimate" type="number" min="0"
                      class="input input-bordered input-sm w-20"
                      placeholder="мин" />
                    <span class="text-xs text-base-content/40">мин</span>
                    <button @click="removeItem(sIdx, iIdx)"
                      class="btn btn-ghost btn-xs text-error ml-auto">Удалить</button>
                  </div>
                </div>
              </div>
            </div>

            <button @click="addItem(sIdx)"
              class="btn btn-ghost btn-sm text-primary">
              + Добавить пункт
            </button>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="flex flex-wrap gap-3 sm:gap-4">
          <button @click="addSection" class="btn btn-ghost">
            + Добавить раздел
          </button>
          <button @click="saveChanges" :disabled="isSaving"
            class="btn btn-success">
            <span v-if="isSaving" class="loading loading-spinner loading-sm"></span>
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </button>
          <button @click="cancelEditing" class="btn btn-ghost">
            Отмена
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
