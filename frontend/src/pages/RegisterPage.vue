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
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card bg-base-100 shadow-xl w-full max-w-md">
      <div class="card-body">
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <h2 class="text-2xl font-bold">Регистрация</h2>
          <div v-if="error" role="alert" class="alert alert-error">
            <span>{{ error }}</span>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Имя</span></label>
            <input v-model="name"
                   class="input input-bordered w-full"
                   type="text"
                   required>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Email</span></label>
            <input v-model="email"
                   class="input input-bordered w-full"
                   type="email"
                   required>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Пароль</span></label>
            <input v-model="password"
                   class="input input-bordered w-full"
                   type="password"
                   required>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Повторите пароль</span></label>
            <input v-model="passwordConfirm" type="password" required
                   class="input input-bordered w-full" />
          </div>
          <button type="submit" :disabled="loading"
                  class="btn btn-primary w-full">
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
          </button>
        </form>
        <p class="mt-4 text-center text-sm text-base-content/60">
          Уже есть аккаунт?
          <router-link to="/login" class="link link-primary">
            Войти
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
