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
    <div v-if="error" role="alert" class="alert alert-error">
      <span>{{ error }}</span>
    </div>
    <div class="form-control">
      <label class="label"><span class="label-text">Email</span></label>
      <input
      v-model = "email"
      type="email"
      required
      class="input input-bordered w-full"
      placeholder="your@email.com"
      >
    </div>

    <div class="form-control">
      <label class="label"><span class="label-text">Пароль</span></label>
      <input
      v-model="password"
      type="password"
      required
      class="input input-bordered w-full"
      >
    </div>
    <button
    type="submit"
    :disabled = "loading"
    class="btn btn-primary w-full"
    >
      <span v-if="loading" class="loading loading-spinner loading-sm"></span>
      {{ loading ? "Вход..." : "Войти" }}
    </button>
  </form>
</template>
