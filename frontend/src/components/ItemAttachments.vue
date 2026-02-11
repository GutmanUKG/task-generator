<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '../api'

const props = defineProps({
  itemId: { type: Number, required: true },
  attachments: { type: Array, default: () => [] },
  readonly: { type: Boolean, default: false }
})

const emit = defineEmits(['updated'])

const uploading = ref(false)
const dragover = ref(false)

async function uploadFile(file) {
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('Можно загружать только изображения (PNG, JPG, GIF, WebP)')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Файл слишком большой. Максимум 5 МБ')
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    await api.post(`/attachments/${props.itemId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    emit('updated')
  } catch (e) {
    alert('Ошибка загрузки: ' + (e.response?.data?.error || e.message))
  } finally {
    uploading.value = false
  }
}

function onFileSelect(event) {
  const file = event.target.files[0]
  uploadFile(file)
  event.target.value = ''
}

function onDragOver(e) {
  e.preventDefault()
  dragover.value = true
}

function onDragLeave() {
  dragover.value = false
}

function onDrop(e) {
  e.preventDefault()
  dragover.value = false
  const file = e.dataTransfer.files[0]
  uploadFile(file)
}

async function removeAttachment(attachmentId) {
  if (!confirm('Удалить скриншот?')) return
  try {
    await api.delete(`/attachments/${attachmentId}`)
    emit('updated')
  } catch (e) {
    alert('Ошибка удаления')
  }
}

function imageUrl(attachment) {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  return `${baseUrl}${attachment.path}`
}

function openImage(url) {
  window.open(url, '_blank')
}

function onPaste(e) {
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        uploadFile(file)
        break
      }
    }
  }
}

onMounted(() => {
  document.addEventListener('paste', onPaste)
})

onUnmounted(() => {
  document.removeEventListener('paste', onPaste)
})
</script>

<template>
  <div class="mt-2">
    <!-- Список прикреплённых скриншотов -->
    <div v-if="attachments.length > 0" class="flex flex-wrap gap-2 mb-2">
      <div v-for="att in attachments" :key="att.id" class="relative group">
        <img v-if="att.mimetype?.startsWith('image/')"
             :src="imageUrl(att)"
             :alt="att.filename"
             class="w-24 h-24 object-cover rounded border cursor-pointer
                    hover:opacity-90 transition-opacity"
             @click="openImage(imageUrl(att))" />

        <button v-if="!readonly"
                @click="removeAttachment(att.id)"
                class="absolute -top-2 -right-2 bg-red-500 text-white
                       rounded-full w-5 h-5 text-xs flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-opacity">
          x
        </button>
      </div>
    </div>

    <!-- Зона загрузки -->
    <div v-if="!readonly"
         :class="[
           'border-2 border-dashed rounded p-3 text-center text-sm transition-colors',
           dragover ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-400'
         ]"
         @dragover="onDragOver"
         @dragleave="onDragLeave"
         @drop="onDrop">

      <div v-if="uploading" class="text-blue-500">
        Загрузка...
      </div>
      <div v-else>
        <label class="cursor-pointer text-blue-500 hover:text-blue-700">
          Прикрепить скриншот
          <input type="file" accept="image/*" class="hidden" @change="onFileSelect" />
        </label>
        <span class="text-gray-400 ml-1">или перетащите сюда</span>
      </div>
    </div>
  </div>
</template>
