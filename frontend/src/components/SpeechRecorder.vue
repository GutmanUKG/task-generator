<script setup>
import { useSpeechRecognition } from '../composables/useSpeechRecognition'

const {
  isSupported,
  isListening,
  transcript,
  interimTranscript,
  error,
  start,
  stop,
  clear
} = useSpeechRecognition()

function toggle() {
  if (isListening.value) {
    stop()
  } else {
    start()
  }
}


// ========================================
// defineEmits — объявляем события компонента
//
// Родительский компонент (RecordPage) сможет слушать:
// <SpeechRecorder @transcriptReady="onTranscriptReady" />
// ========================================

const emit = defineEmits(
    ['transcriptReady']
)

function useTrancript() {
  if(transcript.value){
    emit('transcriptReady', transcript.value)
  }
}
</script>

<template>
  <div class="p-4 sm:p-6 max-w-2xl mx-auto">
    <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Голосовой ввод</h1>

    <!-- Браузер не поддерживает -->
    <div v-if="!isSupported" class="bg-red-100 text-red-700 p-4 rounded mb-4">
      Ваш браузер не поддерживает распознавание речи. Используйте Chrome или Edge.
    </div>

    <!-- Ошибка -->
    <div v-if="error" class="bg-yellow-100 text-yellow-700 p-4 rounded mb-4">
      {{ error }}
    </div>

    <!-- Кнопки -->
    <div class="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
      <button
          @click="toggle"
          :disabled="!isSupported"
          :class="[
          'px-4 sm:px-6 py-3 rounded font-medium text-sm sm:text-base',
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white',
          !isSupported && 'opacity-50 cursor-not-allowed'
        ]"
      >
        {{ isListening ? '⏹ Остановить' : '🎤 Начать запись' }}
      </button>
      <button v-if="transcript"
      @click="useTrancript"
              class="px-4 sm:px-6 py-3 rounded bg-green-500 hover:bg-green-600 text-white font-medium text-sm sm:text-base"
      >
      Создать ТЗ
      </button>
      <button
          v-if="transcript"
          @click="clear"
          class="px-4 sm:px-6 py-3 rounded bg-gray-200 hover:bg-gray-300 text-sm sm:text-base"
      >
        Очистить
      </button>
    </div>

    <!-- Индикатор записи -->
    <div v-if="isListening" class="flex items-center gap-2 text-red-500 mb-4">
      <span class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
      Запись...
    </div>

    <!-- Текст -->
    <div class="border rounded p-3 sm:p-4 min-h-[150px] sm:min-h-[200px] bg-white text-sm sm:text-base">
      <template v-if="transcript || interimTranscript">
        {{ transcript }}<span class="text-gray-400">{{ interimTranscript }}</span>
      </template>
      <span v-else class="text-gray-400">
        Нажмите "Начать запись" и говорите...
      </span>
    </div>

    <!-- Статистика -->
    <div v-if="transcript" class="mt-4 text-sm text-gray-500">
      Символов: {{ transcript.length }}
    </div>
  </div>
</template>