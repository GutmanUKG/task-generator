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
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card bg-base-100 shadow-xl w-full max-w-md">
      <div class="card-body">
        <login-form @success="onSuccess"></login-form>
        <p class="mt-4 text-center text-sm text-base-content/60">
          Нет аккаунта?
          <router-link to="/register" class="link link-primary">
            Зарегистрироваться
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
