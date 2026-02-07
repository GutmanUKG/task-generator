<script setup>

import { useRouter } from "vue-router";
import SpeechRecorder from "../components/SpeechRecorder.vue";

const router = useRouter()

//Когда текст записан - переходим с созданию ТЗ
function onTranscriptReady(text) {
  //Сохранение текста в sessionStorege для следующей страницы
  sessionStorage.setItem('voiceText', text)
  router.push('/specifications/new')
}
</script>

<template>
  <div>
    <SpeechRecorder @transcriptReady="onTranscriptReady"></SpeechRecorder>
  </div>
</template>