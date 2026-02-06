<script setup>
import { ref } from 'vue'
import { authStore } from '../stores/auth.js'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const emit = defineEmits(['success'])

async function handleSubmit(){
  error.value = ''
  loading.value = true

  try {
    await authStore.login(email.value, password.value)
    emit('success')
  }catch (e) {
    error.value = e.responses?.data?.error || "Ошибка входа"
  }finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <h2 class="text-2xl font-bold">Вход</h2>
    <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded">
      {{ error }}
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">Email</label>
      <input
      v-model = "email"
      type="email"
      required
      class="w-full border rounded px-3 py-2"
      >
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Пароль</label>
      <input
      v-model="password"
      type="password"
      required
      class="w-full border rounded px-3 py-2"
      >
    </div>
    <button
    type="submit"
    :disabled = "loading"
    class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {{ loading ? "Вход..." : "Войти" }}
    </button>
  </form>
</template>