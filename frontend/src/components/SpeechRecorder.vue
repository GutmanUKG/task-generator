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
    <div v-if="!isSupported" role="alert" class="alert alert-error mb-4">
      <span>Ваш браузер не поддерживает распознавание речи. Используйте Chrome или Edge.</span>
    </div>

    <!-- Ошибка -->
    <div v-if="error" role="alert" class="alert alert-warning mb-4">
      <span>{{ error }}</span>
    </div>

    <!-- Кнопки -->
    <div class="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
      <button
          @click="toggle"
          :disabled="!isSupported"
          :class="[
          'btn',
          isListening ? 'btn-error' : 'btn-primary',
        ]"
      >
        {{ isListening ? 'Остановить' : 'Начать запись' }}
      </button>
      <button v-if="transcript"
      @click="useTrancript"
              class="btn btn-success"
      >
      Создать ТЗ
      </button>
      <button
          v-if="transcript"
          @click="clear"
          class="btn btn-ghost"
      >
        Очистить
      </button>
    </div>

    <!-- Индикатор записи -->
    <div v-if="isListening" class="flex items-center gap-2 text-error mb-4">
      <span class="loading loading-dots loading-sm"></span>
      Запись...
    </div>

    <!-- Текст — textarea для записи голоса и ручного ввода -->
    <div class="relative">
      <textarea v-model="transcript" rows="8"
                class="textarea textarea-bordered w-full text-sm sm:text-base resize-y"
                placeholder="Нажмите 'Начать запись' и говорите, или введите текст вручную..."></textarea>
      <span v-if="interimTranscript"
            class="absolute bottom-3 left-3 text-base-content/40 text-sm pointer-events-none">
        {{ interimTranscript }}
      </span>
    </div>

    <!-- Статистика -->
    <div v-if="transcript" class="mt-4 text-sm text-base-content/50">
      Символов: {{ transcript.length }}
    </div>
  </div>
</template>
