<script setup>
import { useRouter } from "vue-router";
import LoginForm from "../components/LoginForm.vue";

const router = useRouter()

//После успешного входа - переход на дашборд

function onSuccess (){
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <login-form @success="onSuccess"></login-form>
      <p class="mt-4 text-center text-sm text-gray-500">
        Нет аккаунта?
        <router-link to="/register" class="text-blue-500 hover:underline">
          Зарегистрироваться
        </router-link>
      </p>
    </div>
  </div>
</template>