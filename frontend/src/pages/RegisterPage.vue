<script setup>
import { ref } from 'vue'
import { useRouter } from "vue-router";
import { authStore } from "../stores/auth.js";

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit(){
  error.value = ''
  if(password.value !== passwordConfirm.value) {
    error.value = 'Пароли не совпадают'
    return
  }
  if(password.value.length < 6){
    error.value = 'Пароль минимум  из 6 символов'
    return
  }
  loading.value = true
  try {
    await authStore.register(email.value, password.value, name.value)
    router.push('/dashboard')
  }catch (e){
    error.value = e.response?.data?.error || 'Ошибка регистрации'
  }finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <h2 class="text-2xl font-bold">Регистрация</h2>
        <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded">{{error}}</div>
        <div>
          <label class="block text-sm font-medium mb-1">Имя</label>
          <input v-model="name"
                 class="w-full border rounded px-3 py-2"
                 type="text"
                 required>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input v-model="email"
                 class="w-full border rounded px-3 py-2"
                 type="email"
                 required>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Пароль</label>
          <input v-model="password"
                 class="w-full border rounded px-3 py-2"
                 type="password"
                 required>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Повторите пароль</label>
          <input v-model="passwordConfirm" type="password" required
                 class="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" :disabled="loading"
                class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50">
          {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>
      <p class="mt-4 text-center text-sm text-gray-500">
        Уже есть аккаунт?
        <router-link to="/login" class="text-blue-500 hover:underline">
          Войти
        </router-link>
      </p>
    </div>
  </div>
</template>