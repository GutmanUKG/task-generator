<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from "vue-router";
import SpeechRecorder from "../components/SpeechRecorder.vue";
import DocumentUploader from '../components/DocumentUploader.vue'
import api from '../api'

const router = useRouter()
const route = useRoute()

// Текст из голоса и из документа
const voiceText = ref('')
const docText = ref('')
const hasProjects = ref(true)
const loading = ref(true)

// Проверяем наличие проектов
onMounted(async () => {
  try {
    const res = await api.get('/projects')
    hasProjects.value = res.data.length > 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

// projectId из query (если перешли из проекта)
const projectId = route.query.projectId

//Когда текст записан - переходим к созданию ТЗ
function onTranscriptReady(text) {
  sessionStorage.setItem('voiceText', text)
  const query = projectId ? `?projectId=${projectId}` : ''
  router.push(`/specifications/new${query}`)
}

// Документ обработан
function onTextExtracted(text) {
  docText.value = text
}
// Объединить и перейти к созданию ТЗ
function proceed() {
  const parts = []
  if (voiceText.value.trim()) parts.push(voiceText.value.trim())
  if (docText.value.trim()) parts.push(docText.value.trim())
  const combined = parts.join('\n\n')

  if (!combined) {
    alert('Запишите голос или загрузите документ')
    return
  }

  sessionStorage.setItem('voiceText', combined)
  const query = projectId ? `?projectId=${projectId}` : ''
  router.push(`/specifications/new${query}`)
}
</script>

<template>
  <div>
    <!-- Загрузка -->
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Нет проектов — блокируем -->
    <div v-else-if="!hasProjects" class="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body items-center text-center">
          <h2 class="card-title">Сначала создайте проект</h2>
          <p class="text-base-content/60 text-sm">
            Для создания ТЗ нужен хотя бы один проект
          </p>
          <div class="card-actions mt-2">
            <router-link to="/projects" class="btn btn-primary">
              Перейти к проектам
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <template v-else>
    <SpeechRecorder @transcriptReady="onTranscriptReady"></SpeechRecorder>
    <!-- Разделитель -->
    <div class="max-w-2xl mx-auto px-4 sm:px-6">
      <div class="divider">или</div>
    </div>

    <!-- Загрузка документа -->
    <DocumentUploader @textExtracted="onTextExtracted" />

    <!-- Текст из документа (предпросмотр) -->
    <div v-if="docText" class="max-w-2xl mx-auto px-4 sm:px-6 mb-4">
      <div class="card bg-base-100 border border-base-300">
        <div class="card-body p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium">Текст из документа:</span>
            <button @click="docText = ''" class="btn btn-ghost btn-xs text-error">
              Убрать
            </button>
          </div>
          <p class="text-sm text-base-content/70 whitespace-pre-line max-h-40 overflow-y-auto">
            {{ docText }}
          </p>
        </div>
      </div>
    </div>
    <!-- Кнопка "Далее" — если есть хоть какой-то текст -->
    <div v-if="voiceText || docText"
         class="max-w-2xl mx-auto px-4 sm:px-6 mb-6">
      <button @click="proceed" class="btn btn-success w-full">
        Создать ТЗ
        <span v-if="voiceText && docText" class="opacity-70 ml-1">
          (голос + документ)
        </span>
      </button>
    </div>
    </template>
  </div>
</template>
