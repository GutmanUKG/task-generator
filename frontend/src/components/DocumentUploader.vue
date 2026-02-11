<script setup>
import { ref } from 'vue'
import api from '../api'

const emit = defineEmits(['textExtracted'])

const file = ref(null)
const isUploading = ref(false)
const error = ref('')
const extractedFilename = ref('')

// Обработка выбора файла
function onFileChange(event) {
  const selected = event.target.files[0]
  if (!selected) return

  // Проверка расширения на фронтенде (дополнительная)
  const allowedExtensions = ['.txt', '.doc', '.docx']
  const ext = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase()

  if (!allowedExtensions.includes(ext)) {
    error.value = `Недопустимый формат. Допустимые: ${allowedExtensions.join(', ')}`
    file.value = null
    return
  }

  error.value = ''
  file.value = selected
}

// Отправка файла на сервер
async function upload() {
  if (!file.value) return

  isUploading.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('document', file.value)

    const response = await api.post('/specifications/upload-doc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    extractedFilename.value = response.data.filename
    emit('textExtracted', response.data.text)

    // Сбрасываем выбор файла
    file.value = null
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка загрузки документа'
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="p-4 sm:p-6 max-w-2xl mx-auto">
    <h2 class="text-lg sm:text-xl font-bold mb-4">Загрузить документ</h2>
    <p class="text-sm text-base-content/50 mb-4">
      Загрузите файл с требованиями (.txt, .doc, .docx) — текст будет извлечён автоматически.
    </p>

    <!-- Ошибка -->
    <div v-if="error" role="alert" class="alert alert-error mb-4">
      <span>{{ error }}</span>
    </div>

    <!-- Успех -->
    <div v-if="extractedFilename" role="alert" class="alert alert-success mb-4">
      <span>Текст извлечён из файла "{{ extractedFilename }}"</span>
    </div>

    <!-- Выбор файла -->
    <div class="flex flex-col sm:flex-row gap-3">
      <input type="file"
             accept=".txt,.doc,.docx"
             @change="onFileChange"
             class="file-input file-input-bordered file-input-primary flex-1" />

      <button @click="upload"
              :disabled="!file || isUploading"
              class="btn btn-secondary shrink-0">
        <span v-if="isUploading" class="loading loading-spinner loading-sm"></span>
        {{ isUploading ? 'Извлечение текста...' : 'Загрузить' }}
      </button>
    </div>

    <p class="text-xs text-base-content/40 mt-2">
      Максимальный размер: 10 МБ. Форматы: .txt, .doc, .docx
    </p>
  </div>
</template>
