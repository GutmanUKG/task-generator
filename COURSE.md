# Курс: Создание системы генерации ТЗ из голоса

---

## НЕРЕАЛИЗОВАННЫЕ ЗАДАЧИ

> Полный список нереализованных функций вынесен в [BACKLOG.md](./BACKLOG.md)

---

## РЕАЛИЗОВАННЫЕ ЧАСТИ

- ✅ Часть 1 — Настройка проекта (backend + frontend + Prisma)
- ✅ Часть 2 — Авторизация (регистрация, JWT, middleware)
- ✅ Часть 3 — Голосовой ввод (Web Speech API)
- ✅ Часть 4 — CRUD проектов
- ✅ Часть 5 — CRUD технических заданий
- ✅ Часть 6 — Заготовка для AI
- ✅ Часть 8 — Надёжная транскрибация
- ✅ Часть 9 — Vue Router и навигация
- ✅ Часть 10 — UI проектов
- ✅ Часть 11 — UI технических заданий (кроме 11.6 Статус)
- ✅ Часть 12 — AI-структурирование через Ollama
- ✅ Часть 17 — Удалённый доступ через ngrok
- ✅ Часть 18 — Админ-панель
- ✅ Часть 19 — Загрузка документов для генерации ТЗ
- ✅ Часть 20 — Выбор CRM-системы для оценки ТЗ
- ✅ Часть 21 — Управление промптами и кастомизация AI
- ✅ Часть 22 — Экспорт в DOC
- ✅ Часть 23 — Прикрепление скриншотов к пунктам ТЗ

---

## Введение

Мы создадим веб-приложение где пользователь:
1. Говорит в микрофон
2. Речь преобразуется в текст
3. Текст структурируется в пункты ТЗ
4. ТЗ можно редактировать и экспортировать в PDF

**Стек:**
- Frontend: Vue 3 + JavaScript + TailwindCSS + DaisyUI
- Backend: Node.js + Express + JavaScript
- БД: MySQL + Prisma ORM
- Голос: Web Speech API (встроен в браузер)

---

# ЧАСТЬ 1: НАСТРОЙКА ПРОЕКТА ✅

## Урок 1.1: Создание Backend ✅

### Шаг 1: Инициализация проекта

```bash
mkdir backend
cd backend
npm init -y
```

### Шаг 2: Установка зависимостей

```bash
npm install express cors dotenv bcryptjs jsonwebtoken
npm install -D nodemon prisma
```

**Что ставим:**
- `express` — веб-фреймворк
- `cors` — разрешает запросы с frontend
- `dotenv` — читает переменные из .env файла
- `bcryptjs` — хеширование паролей
- `jsonwebtoken` — JWT токены для авторизации
- `nodemon` — автоперезапуск сервера при изменениях
- `prisma` — ORM для работы с базой данных

### Шаг 3: Структура папок

Создай такую структуру:

```
backend/
├── src/
│   ├── routes/          # Роуты API
│   ├── controllers/     # Логика обработки запросов
│   ├── middleware/      # Промежуточные обработчики
│   ├── services/        # Бизнес-логика
│   └── index.js         # Точка входа
├── prisma/
│   └── schema.prisma    # Схема базы данных
├── .env                 # Переменные окружения
└── package.json
```

### Шаг 4: Настройка package.json

Открой `package.json` и добавь скрипты:

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

### Шаг 5: Создание .env файла

Создай файл `.env` в папке backend:

```env
PORT=3000
DATABASE_URL="mysql://root:@localhost:3306/task_generator"
JWT_SECRET="твой-секретный-ключ-замени-это"
```

### Шаг 6: Главный файл сервера

Создай файл `src/index.js`:

```javascript
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Адрес Vue dev сервера
  credentials: true
}))
app.use(express.json())

// Тестовый роут
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер работает!' })
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`)
})
```

### Шаг 7: Проверка

```bash
npm run dev
```

Открой в браузере: http://localhost:3000/api/health

Должен увидеть: `{"status":"ok","message":"Сервер работает!"}`

---

## Урок 1.2: Создание Frontend ✅

### Шаг 1: Создание Vue проекта

```bash
cd ..
npm create vite@latest frontend -- --template vue
cd frontend
npm install
```

### Шаг 2: Установка TailwindCSS

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer
```

### Шаг 3: Настройка PostCSS

Создай файл `postcss.config.js`:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {}
  }
}
```

### Шаг 4: Настройка Tailwind

Создай файл `tailwind.config.js`:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
}
```

### Шаг 5: Подключение стилей

Замени содержимое `src/style.css`:

```css
@import "tailwindcss";
```

### Шаг 6: Проверка

```bash
npm run dev
```

Открой http://localhost:5173 — должна открыться страница Vue.

---

## Урок 1.3: Настройка базы данных (Prisma) ✅

### Шаг 1: Инициализация Prisma

```bash
cd backend
npx prisma init
```

### Шаг 2: Схема базы данных

Открой файл `prisma/schema.prisma` и замени содержимое:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Пользователи
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  role      String   @default("manager") // admin, manager, executor
  createdAt DateTime @default(now())

  projects       Project[]
  specifications Specification[]
}

// Проекты
model Project {
  id          Int      @id @default(autoincrement())
  name        String
  description String?  @db.Text
  createdAt   DateTime @default(now())

  userId         Int
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  specifications Specification[]
}

// Технические задания
model Specification {
  id        Int      @id @default(autoincrement())
  title     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  projectId Int
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  userId Int
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  sections Section[]
}

// Разделы ТЗ
model Section {
  id       Int    @id @default(autoincrement())
  title    String
  position Int    @default(0)

  specificationId Int
  specification   Specification @relation(fields: [specificationId], references: [id], onDelete: Cascade)

  items Item[]
}

// Пункты ТЗ
model Item {
  id           Int     @id @default(autoincrement())
  content      String  @db.Text
  position     Int     @default(0)
  timeEstimate Int?    // Оценка времени в минутах

  sectionId Int
  section   Section @relation(fields: [sectionId], references: [id], onDelete: Cascade)

  attachments Attachment[]
}

// Вложения
model Attachment {
  id        Int      @id @default(autoincrement())
  filename  String
  path      String
  mimetype  String
  size      Int
  createdAt DateTime @default(now())

  itemId Int
  item   Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
}
```

### Шаг 3: Создание базы данных

Убедись что MySQL запущен, затем:

```bash
npx prisma db push
```

Это создаст все таблицы в базе данных.

### Шаг 4: Установка клиента Prisma

```bash
npm install @prisma/client
```

### Шаг 5: Создание файла для работы с БД

Создай файл `src/db.js`:

```javascript
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = prisma
```

---

# ЧАСТЬ 2: АВТОРИЗАЦИЯ ✅

## Урок 2.1: Регистрация пользователей (Backend) ✅

### Шаг 1: Создание контроллера

Создай файл `src/controllers/authController.js`:

```javascript
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../db')

// Регистрация
async function register(req, res) {
  try {
    const { email, password, name } = req.body

    // Проверка: все поля заполнены?
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Заполните все поля'
      })
    }

    // Проверка: email уже существует?
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        error: 'Пользователь с таким email уже существует'
      })
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создаём пользователя
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    // Создаём JWT токен
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Ошибка регистрации:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

// Вход
async function login(req, res) {
  try {
    const { email, password } = req.body

    // Проверка: все поля заполнены?
    if (!email || !password) {
      return res.status(400).json({
        error: 'Введите email и пароль'
      })
    }

    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        error: 'Неверный email или пароль'
      })
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Неверный email или пароль'
      })
    }

    // Создаём токен
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Вход успешен',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Ошибка входа:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

module.exports = { register, login }
```

### Шаг 2: Создание роута

Создай файл `src/routes/auth.js`:

```javascript
const express = require('express')
const { register, login } = require('../controllers/authController')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)

module.exports = router
```

### Шаг 3: Подключение роута

Обнови `src/index.js`:

```javascript
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Роуты
app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Сервер: http://localhost:${PORT}`)
})
```

### Шаг 4: Проверка через curl или Postman

```bash
# Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Тест"}'

# Вход
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

---

## Урок 2.2: Middleware авторизации ✅

### Шаг 1: Создание middleware

Создай файл `src/middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken')

function authenticate(req, res, next) {
  // Получаем токен из заголовка
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Токен не предоставлен' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Добавляем данные пользователя в запрос
    req.userId = decoded.userId
    req.userRole = decoded.role

    next()
  } catch (error) {
    return res.status(401).json({ error: 'Недействительный токен' })
  }
}

// Проверка роли
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Недостаточно прав' })
    }
    next()
  }
}

module.exports = { authenticate, requireRole }
```

### Как использовать:

```javascript
const { authenticate, requireRole } = require('./middleware/auth')

// Защищённый роут (нужен токен)
router.get('/profile', authenticate, (req, res) => {
  // req.userId доступен здесь
})

// Только для админов
router.delete('/users/:id', authenticate, requireRole('admin'), (req, res) => {
  // Только админ может удалять
})
```

---

## Урок 2.3: Авторизация на Frontend ✅

### Шаг 1: Установка axios

```bash
cd frontend
npm install axios
```

### Шаг 2: Создание API клиента

Создай файл `src/api/index.js`:

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Добавляем токен к каждому запросу
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Обработка ошибок
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Токен истёк - разлогиниваем
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### Шаг 3: Создание store для авторизации

Создай файл `src/stores/auth.js`:

```javascript
import { reactive } from 'vue'
import api from '../api'

export const authStore = reactive({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,

  get isAuthenticated() {
    return !!this.token
  },

  async register(email, password, name) {
    const response = await api.post('/auth/register', {
      email, password, name
    })

    this.setAuth(response.data.token, response.data.user)
    return response.data
  },

  async login(email, password) {
    const response = await api.post('/auth/login', {
      email, password
    })

    this.setAuth(response.data.token, response.data.user)
    return response.data
  },

  setAuth(token, user) {
    this.token = token
    this.user = user
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  logout() {
    this.token = null
    this.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
})
```

### Шаг 4: Компонент формы входа

Создай файл `src/components/LoginForm.vue`:

```vue
<script setup>
import { ref } from 'vue'
import { authStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const emit = defineEmits(['success'])

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    await authStore.login(email.value, password.value)
    emit('success')
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка входа'
  } finally {
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
        v-model="email"
        type="email"
        required
        class="w-full border rounded px-3 py-2"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Пароль</label>
      <input
        v-model="password"
        type="password"
        required
        class="w-full border rounded px-3 py-2"
      />
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {{ loading ? 'Вход...' : 'Войти' }}
    </button>
  </form>
</template>
```

---

# ЧАСТЬ 3: ГОЛОСОВОЙ ВВОД ✅

## Урок 3.1: Web Speech API ✅

### Теория

Web Speech API — встроенный в браузер API для распознавания речи.

**Ограничения:**
- Работает только в Chrome и Edge
- Требует интернет (аудио отправляется на серверы Google)
- Требует HTTPS на продакшене (на localhost работает)

### Шаг 1: Создание composable

Создай файл `src/composables/useSpeechRecognition.js`:

```javascript
import { ref, onUnmounted } from 'vue'

export function useSpeechRecognition() {
  const isListening = ref(false)
  const transcript = ref('')
  const interimTranscript = ref('')
  const error = ref(null)

  // Проверяем поддержку
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const isSupported = !!SpeechRecognition

  let recognition = null

  if (isSupported) {
    recognition = new SpeechRecognition()

    // Настройки
    recognition.continuous = true        // Непрерывное распознавание
    recognition.interimResults = true    // Показывать промежуточные результаты
    recognition.lang = 'ru-RU'           // Русский язык

    // Начало записи
    recognition.onstart = () => {
      isListening.value = true
      error.value = null
    }

    // Результаты распознавания
    recognition.onresult = (event) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }

      if (final) {
        transcript.value += final
      }
      interimTranscript.value = interim
    }

    // Ошибки
    recognition.onerror = (event) => {
      const errors = {
        'no-speech': 'Речь не обнаружена',
        'audio-capture': 'Микрофон не найден',
        'not-allowed': 'Доступ к микрофону запрещён'
      }
      error.value = errors[event.error] || event.error
      isListening.value = false
    }

    // Конец записи
    recognition.onend = () => {
      isListening.value = false
    }
  }

  // Методы
  function start() {
    if (!recognition) {
      error.value = 'Браузер не поддерживает распознавание речи'
      return
    }
    error.value = null
    recognition.start()
  }

  function stop() {
    if (recognition && isListening.value) {
      recognition.stop()
    }
  }

  function clear() {
    transcript.value = ''
    interimTranscript.value = ''
  }

  // Останавливаем при уничтожении компонента
  onUnmounted(() => {
    if (recognition) {
      recognition.abort()
    }
  })

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    clear
  }
}
```

### Шаг 2: Компонент записи

Создай файл `src/components/SpeechRecorder.vue`:

```vue
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
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Голосовой ввод</h1>

    <!-- Браузер не поддерживает -->
    <div v-if="!isSupported" class="bg-red-100 text-red-700 p-4 rounded mb-4">
      Ваш браузер не поддерживает распознавание речи. Используйте Chrome или Edge.
    </div>

    <!-- Ошибка -->
    <div v-if="error" class="bg-yellow-100 text-yellow-700 p-4 rounded mb-4">
      {{ error }}
    </div>

    <!-- Кнопки -->
    <div class="flex gap-4 mb-6">
      <button
        @click="toggle"
        :disabled="!isSupported"
        :class="[
          'px-6 py-3 rounded font-medium',
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white',
          !isSupported && 'opacity-50 cursor-not-allowed'
        ]"
      >
        {{ isListening ? '⏹ Остановить' : '🎤 Начать запись' }}
      </button>

      <button
        v-if="transcript"
        @click="clear"
        class="px-6 py-3 rounded bg-gray-200 hover:bg-gray-300"
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
    <div class="border rounded p-4 min-h-[200px] bg-white">
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
```

### Шаг 3: Использование

В `App.vue`:

```vue
<script setup>
import SpeechRecorder from './components/SpeechRecorder.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <SpeechRecorder />
  </div>
</template>
```

---

# ЧАСТЬ 4: CRUD ПРОЕКТОВ ✅

## Урок 4.1: API для проектов (Backend) ✅

### Шаг 1: Контроллер

Создай файл `src/controllers/projectController.js`:

```javascript
const prisma = require('../db')

// Получить все проекты пользователя
async function getAll(req, res) {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

// Получить один проект
async function getOne(req, res) {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.userId
      }
    })

    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' })
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

// Создать проект
async function create(req, res) {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Название обязательно' })
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: req.userId
      }
    })

    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

// Обновить проект
async function update(req, res) {
  try {
    const { name, description } = req.body

    // Проверяем что проект принадлежит пользователю
    const existing = await prisma.project.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.userId
      }
    })

    if (!existing) {
      return res.status(404).json({ error: 'Проект не найден' })
    }

    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description }
    })

    res.json(project)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

// Удалить проект
async function remove(req, res) {
  try {
    const existing = await prisma.project.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.userId
      }
    })

    if (!existing) {
      return res.status(404).json({ error: 'Проект не найден' })
    }

    await prisma.project.delete({
      where: { id: parseInt(req.params.id) }
    })

    res.json({ message: 'Проект удалён' })
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

module.exports = { getAll, getOne, create, update, remove }
```

### Шаг 2: Роуты

Создай файл `src/routes/projects.js`:

```javascript
const express = require('express')
const { authenticate } = require('../middleware/auth')
const {
  getAll,
  getOne,
  create,
  update,
  remove
} = require('../controllers/projectController')

const router = express.Router()

// Все роуты защищены
router.use(authenticate)

router.get('/', getAll)
router.get('/:id', getOne)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', remove)

module.exports = router
```

### Шаг 3: Подключение в index.js

```javascript
const projectRoutes = require('./routes/projects')

// После app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
```

---

# ЧАСТЬ 5: CRUD ТЕХНИЧЕСКИХ ЗАДАНИЙ ✅

## Урок 5.1: API для ТЗ ✅

Аналогично проектам, но со вложенными секциями и пунктами.

Создай `src/controllers/specificationController.js`:

```javascript
const prisma = require('../db')

// Получить все ТЗ проекта
async function getAll(req, res) {
  try {
    const { projectId } = req.query

    const specs = await prisma.specification.findMany({
      where: {
        userId: req.userId,
        ...(projectId && { projectId: parseInt(projectId) })
      },
      include: {
        project: true,
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(specs)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

// Создать ТЗ
async function create(req, res) {
  try {
    const { title, projectId, sections } = req.body

    if (!title || !projectId) {
      return res.status(400).json({
        error: 'Название и проект обязательны'
      })
    }

    const spec = await prisma.specification.create({
      data: {
        title,
        projectId: parseInt(projectId),
        userId: req.userId,
        sections: sections ? {
          create: sections.map((section, idx) => ({
            title: section.title,
            position: idx,
            items: section.items ? {
              create: section.items.map((item, itemIdx) => ({
                content: item.content,
                position: itemIdx,
                timeEstimate: item.timeEstimate
              }))
            } : undefined
          }))
        } : undefined
      },
      include: {
        sections: {
          include: { items: true }
        }
      }
    })

    res.status(201).json(spec)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

module.exports = { getAll, create }
```

---

# ЧАСТЬ 6: ЗАГОТОВКА ДЛЯ AI ✅

## Урок 6.1: Интерфейс AI сервиса ✅

Создай файл `src/services/aiService.js`:

```javascript
// Заглушка для AI сервиса
// Позже здесь будет реальная интеграция с Ollama (Часть 12)

async function structureText(text) {
  // Пока возвращаем простую структуру
  // В будущем здесь будет вызов AI API

  const lines = text.split(/[.!?]/).filter(line => line.trim())

  return {
    sections: [
      {
        title: 'Основные требования',
        items: lines.map(line => ({
          content: line.trim(),
          timeEstimate: null
        }))
      }
    ]
  }
}

module.exports = { structureText }
```

### Использование:

```javascript
const { structureText } = require('../services/aiService')

// В контроллере:
router.post('/structure', authenticate, async (req, res) => {
  const { text } = req.body
  const structured = await structureText(text)
  res.json(structured)
})
```

---

# ЧАСТЬ 7: ЭКСПОРТ В PDF ⬜

## Урок 7.1: Генерация PDF ⬜

### Шаг 1: Установка библиотеки

```bash
npm install puppeteer
```

### Шаг 2: Сервис PDF

Создай файл `src/services/pdfService.js`:

```javascript
const puppeteer = require('puppeteer')

async function generatePdf(specification) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // HTML шаблон
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        .item { margin: 10px 0; padding: 10px; background: #f5f5f5; }
        .time { color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>${specification.title}</h1>
      ${specification.sections.map(section => `
        <h2>${section.title}</h2>
        ${section.items.map(item => `
          <div class="item">
            ${item.content}
            ${item.timeEstimate ? `<div class="time">Оценка: ${item.timeEstimate} мин</div>` : ''}
          </div>
        `).join('')}
      `).join('')}
    </body>
    </html>
  `

  await page.setContent(html)
  const pdf = await page.pdf({ format: 'A4' })

  await browser.close()

  return pdf
}

module.exports = { generatePdf }
```

---

# ЧАСТЬ 8: НАДЁЖНАЯ ТРАНСКРИБАЦИЯ ✅

## Проблема Web Speech API

Web Speech API останавливается при:
- Длинных паузах (>5 сек без речи)
- Длительной записи (браузер обрывает соединение)
- Потере сети (аудио идёт на серверы Google)

Это делает его непригодным для записи длинных ТЗ. Решение — авто-перезапуск: бесплатно и работает в браузере.

---

## Урок 8.1: Авто-перезапуск Web Speech API ✅

### Теория

Идея простая: когда `onend` срабатывает, а пользователь **не нажимал "Стоп"** — мы перезапускаем запись автоматически. Пользователь даже не заметит остановку.

### Шаг 1: Обновлённый composable

Замени файл `src/composables/useSpeechRecognition.js`:

```javascript
import { ref, onUnmounted } from 'vue'

export function useSpeechRecognition() {
  const isListening = ref(false)
  const transcript = ref('')
  const interimTranscript = ref('')
  const error = ref(null)

  // ========================================
  // Проверяем поддержку браузера
  // SpeechRecognition — стандартное API
  // webkitSpeechRecognition — для Chrome
  // ========================================
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const isSupported = !!SpeechRecognition

  let recognition = null

  // Флаг: пользователь сам остановил запись?
  // Нужен чтобы отличить "браузер оборвал" от "нажали Стоп"
  let manualStop = false

  if (isSupported) {
    recognition = new SpeechRecognition()

    // ========================================
    // Настройки распознавания
    // ========================================
    recognition.continuous = true       // Не останавливаться после первой фразы
    recognition.interimResults = true   // Показывать текст пока говорят
    recognition.lang = 'ru-RU'         // Русский язык
    recognition.maxAlternatives = 1     // Один вариант распознавания (быстрее)

    // ========================================
    // Событие: запись началась
    // ========================================
    recognition.onstart = () => {
      isListening.value = true
      error.value = null
    }

    // ========================================
    // Событие: получены результаты распознавания
    //
    // event.results — массив результатов
    // event.resultIndex — индекс первого нового результата
    // result.isFinal — true если фраза распознана окончательно
    // result[0].transcript — текст распознавания
    // ========================================
    recognition.onresult = (event) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }

      if (final) {
        transcript.value += final
      }
      interimTranscript.value = interim
    }

    // ========================================
    // Событие: ошибка
    //
    // Типичные ошибки:
    // - no-speech: молчание дольше ~5 сек
    // - audio-capture: нет микрофона
    // - not-allowed: пользователь запретил доступ
    // - network: проблемы с сетью
    // ========================================
    recognition.onerror = (event) => {
      const errors = {
        'no-speech': 'Речь не обнаружена',
        'audio-capture': 'Микрофон не найден',
        'not-allowed': 'Доступ к микрофону запрещён',
        'network': 'Ошибка сети'
      }

      // no-speech — не критическая ошибка, авто-перезапуск справится
      if (event.error === 'no-speech') {
        return
      }

      error.value = errors[event.error] || event.error
      isListening.value = false
    }

    // ========================================
    // Событие: запись остановилась
    //
    // КЛЮЧЕВОЙ МОМЕНТ: если пользователь НЕ нажимал Стоп,
    // значит браузер сам оборвал запись — перезапускаем!
    // ========================================
    recognition.onend = () => {
      if (!manualStop && isListening.value) {
        // Браузер оборвал — перезапускаем через 100мс
        // Задержка нужна чтобы браузер успел освободить ресурсы
        setTimeout(() => {
          try {
            recognition.start()
          } catch (e) {
            isListening.value = false
          }
        }, 100)
      } else {
        isListening.value = false
      }
    }
  }

  // ========================================
  // Публичные методы
  // ========================================

  function start() {
    if (!recognition) {
      error.value = 'Браузер не поддерживает распознавание речи'
      return
    }
    manualStop = false  // Сбрасываем флаг
    error.value = null
    transcript.value = ''
    interimTranscript.value = ''
    recognition.start()
  }

  function stop() {
    if (recognition && isListening.value) {
      manualStop = true  // Ставим флаг — не перезапускать!
      recognition.stop()
    }
  }

  function clear() {
    transcript.value = ''
    interimTranscript.value = ''
  }

  // Очистка при уничтожении компонента
  onUnmounted(() => {
    if (recognition) {
      manualStop = true
      recognition.abort()
    }
  })

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    clear
  }
}
```

**Что изменилось:**
- Добавлен флаг `manualStop` — отличает "пользователь нажал Стоп" от "браузер оборвал"
- В `onend` — автоматический перезапуск через 100мс если запись была прервана браузером
- Ошибка `no-speech` игнорируется (не критичная, перезапуск справится)
- `start()` очищает предыдущий текст
- Исправлен баг: `window.SpeechRecognition` вместо `window.SpeechRecognitionResult`

---

# ЧАСТЬ 9: VUE ROUTER И НАВИГАЦИЯ ✅

## Урок 9.1: Установка и настройка ✅

### Теория

Сейчас всё приложение — одна страница. Vue Router позволяет:
- Создать несколько страниц (login, dashboard, projects)
- Защитить страницы от неавторизованных пользователей
- Переходить между страницами без перезагрузки (SPA)

### Шаг 1: Установка

```bash
cd frontend
npm install vue-router@4
```

### Шаг 2: Создание страниц

Создай папку `src/pages/` и файлы:

**`src/pages/LoginPage.vue`** — страница входа:

```vue
<script setup>
import { useRouter } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'

const router = useRouter()

// После успешного входа — переход на дашборд
function onSuccess() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <LoginForm @success="onSuccess" />

      <p class="mt-4 text-center text-sm text-gray-500">
        Нет аккаунта?
        <router-link to="/register" class="text-blue-500 hover:underline">
          Зарегистрироваться
        </router-link>
      </p>
    </div>
  </div>
</template>
```

**`src/pages/RegisterPage.vue`** — страница регистрации:

```vue
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../stores/auth'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''

  if (password.value !== passwordConfirm.value) {
    error.value = 'Пароли не совпадают'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Пароль минимум 6 символов'
    return
  }

  loading.value = true
  try {
    await authStore.register(email.value, password.value, name.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка регистрации'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <h2 class="text-2xl font-bold">Регистрация</h2>

        <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded">
          {{ error }}
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Имя</label>
          <input v-model="name" type="text" required
            class="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input v-model="email" type="email" required
            class="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Пароль</label>
          <input v-model="password" type="password" required
            class="w-full border rounded px-3 py-2" />
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
```

**`src/pages/DashboardPage.vue`** — дашборд:

```vue
<script setup>
import { authStore } from '../stores/auth'
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">
      Добро пожаловать, {{ authStore.user?.name }}!
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <router-link to="/projects"
        class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <h2 class="text-lg font-semibold mb-2">Проекты</h2>
        <p class="text-gray-500 text-sm">Управление проектами и клиентами</p>
      </router-link>

      <router-link to="/record"
        class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <h2 class="text-lg font-semibold mb-2">Записать ТЗ</h2>
        <p class="text-gray-500 text-sm">Голосовой ввод нового ТЗ</p>
      </router-link>
    </div>
  </div>
</template>
```

**`src/pages/RecordPage.vue`** — страница записи:

```vue
<script setup>
import { useRouter } from 'vue-router'
import SpeechRecorder from '../components/SpeechRecorder.vue'

const router = useRouter()

// Когда текст записан — переходим к созданию ТЗ
function onTranscriptReady(text) {
  // Сохраняем текст в sessionStorage для следующей страницы
  sessionStorage.setItem('voiceText', text)
  router.push('/specifications/new')
}
</script>

<template>
  <div>
    <SpeechRecorder @transcriptReady="onTranscriptReady" />
  </div>
</template>
```

### Шаг 3: Layout с навигацией

Создай `src/components/AppLayout.vue`:

```vue
<script setup>
import { useRouter } from 'vue-router'
import { authStore } from '../stores/auth'

const router = useRouter()

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Верхняя панель навигации -->
    <nav class="bg-white shadow">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-6">
          <router-link to="/dashboard" class="text-lg font-bold text-blue-600">
            ТЗ-Генератор
          </router-link>

          <div class="flex gap-4">
            <router-link to="/dashboard"
              class="text-gray-600 hover:text-blue-500 text-sm">
              Дашборд
            </router-link>
            <router-link to="/projects"
              class="text-gray-600 hover:text-blue-500 text-sm">
              Проекты
            </router-link>
            <router-link to="/record"
              class="text-gray-600 hover:text-blue-500 text-sm">
              Записать
            </router-link>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500">{{ authStore.user?.name }}</span>
          <button @click="logout"
            class="text-sm text-red-500 hover:text-red-700">
            Выйти
          </button>
        </div>
      </div>
    </nav>

    <!-- Контент страницы -->
    <main class="max-w-6xl mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>
```

### Шаг 4: Файл роутера

Создай `src/router/index.js`:

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../stores/auth'

// ========================================
// Ленивая загрузка страниц
//
// () => import(...) — страница загружается только когда
// пользователь на неё переходит (уменьшает начальный размер JS)
// ========================================
const routes = [
  {
    path: '/login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { guest: true }  // Только для неавторизованных
  },
  {
    path: '/register',
    component: () => import('../pages/RegisterPage.vue'),
    meta: { guest: true }
  },
  {
    // ========================================
    // Layout-обёртка: все вложенные страницы
    // отображаются внутри AppLayout (навигация + контент)
    // ========================================
    path: '/',
    component: () => import('../components/AppLayout.vue'),
    meta: { auth: true },  // Только для авторизованных
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        component: () => import('../pages/DashboardPage.vue')
      },
      {
        path: 'projects',
        component: () => import('../pages/ProjectsPage.vue')
      },
      {
        path: 'record',
        component: () => import('../pages/RecordPage.vue')
      },
      {
        path: 'specifications/new',
        component: () => import('../pages/NewSpecificationPage.vue')
      },
      {
        path: 'specifications/:id',
        component: () => import('../pages/SpecificationPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ========================================
// Navigation Guard — проверка авторизации
//
// Перед каждым переходом проверяем:
// - Если страница требует auth и пользователь не авторизован → /login
// - Если страница для гостей и пользователь авторизован → /dashboard
// ========================================
router.beforeEach((to, from, next) => {
  const isAuth = authStore.isAuthenticated

  if (to.meta.auth && !isAuth) {
    // Требуется авторизация, но пользователь не вошёл
    next('/login')
  } else if (to.meta.guest && isAuth) {
    // Страница для гостей, но пользователь уже вошёл
    next('/dashboard')
  } else {
    next()
  }
})

export default router
```

### Шаг 5: Обновление main.js

Замени `src/main.js`:

```javascript
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// ========================================
// createApp — создаёт экземпляр Vue
// .use(router) — подключает Vue Router
// .mount('#app') — монтирует в DOM
// ========================================
createApp(App)
  .use(router)
  .mount('#app')
```

### Шаг 6: Обновление App.vue

Замени `src/App.vue`:

```vue
<template>
  <!-- router-view отображает текущую страницу по URL -->
  <router-view />
</template>
```

---

# ЧАСТЬ 10: UI ПРОЕКТОВ ✅

## Урок 10.1: Страница проектов (Frontend) ✅

### Теория

Нужно создать страницу где пользователь может:
- Видеть список своих проектов
- Создавать новые проекты
- Редактировать существующие
- Удалять проекты

**Важно:** Перед этим уроком убедись что backend-роуты из Части 4 (CRUD проектов) реализованы и подключены в `index.js`.

### Шаг 1: Создание страницы

Создай `src/pages/ProjectsPage.vue`:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

// ========================================
// Реактивные данные
// ========================================
const projects = ref([])        // Список проектов
const loading = ref(true)       // Загрузка списка
const showForm = ref(false)     // Показать/скрыть форму
const editingId = ref(null)     // ID редактируемого проекта (null = создание)
const formData = ref({          // Данные формы
  name: '',
  description: ''
})
const formError = ref('')

// ========================================
// Загрузка проектов при открытии страницы
//
// onMounted — вызывается когда компонент появился в DOM
// ========================================
onMounted(async () => {
  await loadProjects()
})

async function loadProjects() {
  loading.value = true
  try {
    const response = await api.get('/projects')
    projects.value = response.data
  } catch (e) {
    console.error('Ошибка загрузки проектов:', e)
  } finally {
    loading.value = false
  }
}

// ========================================
// Открыть форму для создания
// ========================================
function openCreate() {
  editingId.value = null
  formData.value = { name: '', description: '' }
  formError.value = ''
  showForm.value = true
}

// ========================================
// Открыть форму для редактирования
// Заполняем данные существующего проекта
// ========================================
function openEdit(project) {
  editingId.value = project.id
  formData.value = {
    name: project.name,
    description: project.description || ''
  }
  formError.value = ''
  showForm.value = true
}

// ========================================
// Сохранить (создание или обновление)
//
// Если editingId == null → POST (создание)
// Если editingId != null → PUT (обновление)
// ========================================
async function saveProject() {
  if (!formData.value.name.trim()) {
    formError.value = 'Введите название проекта'
    return
  }

  try {
    if (editingId.value) {
      await api.put(`/projects/${editingId.value}`, formData.value)
    } else {
      await api.post('/projects', formData.value)
    }

    showForm.value = false
    await loadProjects()  // Перезагружаем список
  } catch (e) {
    formError.value = e.response?.data?.error || 'Ошибка сохранения'
  }
}

// ========================================
// Удаление с подтверждением
// ========================================
async function deleteProject(id) {
  if (!confirm('Удалить проект и все его ТЗ?')) return

  try {
    await api.delete(`/projects/${id}`)
    await loadProjects()
  } catch (e) {
    alert('Ошибка удаления')
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Проекты</h1>
      <button @click="openCreate"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        + Новый проект
      </button>
    </div>

    <!-- Форма создания/редактирования (модальное окно) -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {{ editingId ? 'Редактировать проект' : 'Новый проект' }}
        </h2>

        <div v-if="formError" class="bg-red-100 text-red-700 p-3 rounded mb-4">
          {{ formError }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Название</label>
            <input v-model="formData.name" type="text"
              class="w-full border rounded px-3 py-2"
              placeholder="Название проекта" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Описание</label>
            <textarea v-model="formData.description" rows="3"
              class="w-full border rounded px-3 py-2"
              placeholder="Описание (необязательно)"></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="saveProject"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Сохранить
          </button>
          <button @click="showForm = false"
            class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
            Отмена
          </button>
        </div>
      </div>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="text-gray-500">Загрузка...</div>

    <!-- Пустой список -->
    <div v-else-if="projects.length === 0" class="text-center py-12 text-gray-500">
      <p class="text-lg mb-2">Проектов пока нет</p>
      <p class="text-sm">Нажмите "Новый проект" чтобы создать первый</p>
    </div>

    <!-- Список проектов -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="project in projects" :key="project.id"
        class="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow">
        <h3 class="font-semibold text-lg mb-1">{{ project.name }}</h3>
        <p v-if="project.description" class="text-gray-500 text-sm mb-4">
          {{ project.description }}
        </p>
        <p class="text-xs text-gray-400 mb-4">
          Создан: {{ new Date(project.createdAt).toLocaleDateString('ru') }}
        </p>

        <div class="flex gap-2">
          <router-link :to="`/projects/${project.id}`"
            class="text-blue-500 hover:text-blue-700 text-sm">
            Открыть
          </router-link>
          <button @click="openEdit(project)"
            class="text-gray-500 hover:text-gray-700 text-sm">
            Редактировать
          </button>
          <button @click="deleteProject(project.id)"
            class="text-red-500 hover:text-red-700 text-sm">
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```

## Урок 10.2: Детальная страница проекта ✅

### Теория

Сейчас на странице проектов есть ссылка "Открыть", но она ведёт в никуда. Нужно:
1. Создать страницу `ProjectPage.vue` — детальный просмотр проекта со списком его ТЗ
2. Добавить роут `projects/:id` в роутер
3. Обновить `projectController.getOne` — чтобы возвращал проект вместе со спецификациями

### Шаг 1: Обновить контроллер проектов (Backend)

В `src/controllers/projectController.js` обнови функцию `getOne` — добавь `include` чтобы Prisma подтягивала связанные спецификации с секциями и пунктами:

```javascript
// Получить один проект
async function getOne(req, res) {
    try {
        const project = await prisma.project.findFirst({
            where: {
                id: parseInt(req.params.id),
                userId: req.userId
            },
            // ========================================
            // include — подтягиваем связанные данные
            //
            // Без include: { id, name, description }
            // С include: { id, name, description, specifications: [...] }
            //
            // Вложенный include — подтягиваем секции внутри ТЗ,
            // а внутри секций — пункты
            // ========================================
            include: {
                specifications: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        sections: {
                            orderBy: { position: 'asc' },
                            include: {
                                items: { orderBy: { position: 'asc' } }
                            }
                        }
                    }
                }
            }
        })

        if (!project) {
            return res.status(404).json({ error: 'Проект не найден' })
        }

        res.json(project)
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}
```

### Шаг 2: Страница проекта (Frontend)

Создай файл `src/pages/ProjectPage.vue`:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const project = ref(null)
const loading = ref(true)
const error = ref('')

// ========================================
// При открытии — загружаем проект по ID из URL
//
// route.params.id — берём :id из адреса /projects/5
// ========================================
onMounted(async () => {
  try {
    const response = await api.get(`/projects/${route.params.id}`)
    project.value = response.data
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка загрузки проекта'
  } finally {
    loading.value = false
  }
})

// Форматирование минут в "X ч Y мин"
function formatTime(minutes) {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} мин`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} ч ${m} мин` : `${h} ч`
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="loading" class="text-center py-12 text-gray-500">Загрузка...</div>

    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded">{{ error }}</div>

    <div v-else-if="project">
      <!-- Навигация назад -->
      <div class="mb-6">
        <router-link to="/projects" class="text-blue-500 hover:text-blue-700 text-sm">
          &larr; Все проекты
        </router-link>
      </div>

      <h1 class="text-2xl font-bold mb-2">{{ project.name }}</h1>
      <p v-if="project.description" class="text-gray-500 mb-6">{{ project.description }}</p>

      <!-- Заголовок секции ТЗ + кнопка создания -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Технические задания</h2>
        <router-link to="/record"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
          + Создать ТЗ
        </router-link>
      </div>

      <!-- Пустой список -->
      <div v-if="project.specifications.length === 0"
        class="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
        <p>ТЗ пока нет</p>
        <p class="text-sm mt-1">Запишите голос и создайте первое техническое задание</p>
      </div>

      <!-- Список ТЗ проекта -->
      <div v-else class="space-y-4">
        <router-link v-for="spec in project.specifications" :key="spec.id"
          :to="`/specifications/${spec.id}`"
          class="block bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold">{{ spec.title }}</h3>
              <p class="text-sm text-gray-400 mt-1">
                {{ spec.sections.length }} разделов &middot;
                {{ new Date(spec.createdAt).toLocaleDateString('ru') }}
              </p>
            </div>
            <span class="text-sm text-gray-500">
              {{ formatTime(spec.sections.reduce((sum, s) =>
                sum + s.items.reduce((iSum, item) => iSum + (item.timeEstimate || 0), 0), 0)) }}
            </span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
```

### Шаг 3: Добавить роут

В `src/router/index.js` добавь после роута `projects`:

```javascript
{
    path: 'projects/:id',
    component: () => import('../pages/ProjectPage.vue')
},
```

### Проверка

1. Перейди на страницу проектов
2. Нажми "Открыть" у любого проекта
3. Должна открыться детальная страница с названием, описанием и списком ТЗ

---

# ЧАСТЬ 11: UI ТЕХНИЧЕСКИХ ЗАДАНИЙ ✅

## Урок 11.1: Кнопка "Создать ТЗ" в голосовом вводе ✅

### Теория

Сейчас `SpeechRecorder` умеет записывать речь и показывать текст, но не умеет передавать этот текст дальше. Нужно добавить:
1. Кнопку "Создать ТЗ" — появляется когда есть записанный текст
2. `emit('transcriptReady', text)` — событие для родительского компонента
3. `RecordPage` ловит это событие, сохраняет текст в `sessionStorage` и перенаправляет на `NewSpecificationPage`

### Шаг 1: Обновить SpeechRecorder.vue

В `src/components/SpeechRecorder.vue` добавь:

**В `<script setup>` — объявление события и функция:**

```javascript
// ========================================
// defineEmits — объявляем события компонента
//
// Родительский компонент (RecordPage) сможет слушать:
// <SpeechRecorder @transcriptReady="onTranscriptReady" />
// ========================================
const emit = defineEmits(['transcriptReady'])

// Передать текст родителю для создания ТЗ
function useTranscript() {
  if (transcript.value) {
    emit('transcriptReady', transcript.value)
  }
}
```

**В `<template>` — кнопка между "Остановить" и "Очистить":**

```html
<button
    v-if="transcript"
    @click="useTranscript"
    class="px-6 py-3 rounded bg-green-500 hover:bg-green-600 text-white font-medium"
>
  Создать ТЗ
</button>
```

### Проверка

1. Запиши голос
2. Появится зелёная кнопка "Создать ТЗ"
3. Нажми — тебя перенаправит на страницу создания ТЗ с текстом

---

## Урок 11.2: Создание ТЗ из голосового текста ✅

### Теория

Поток работы пользователя:
1. Записал голос → получил текст (RecordPage)
2. Текст сохраняется в `sessionStorage`
3. Переход на NewSpecificationPage
4. Нажимает "Структурировать через AI"
5. Получает разделы и пункты
6. Может редактировать вручную
7. Сохраняет ТЗ

### Шаг 1: Страница создания ТЗ

Создай `src/pages/NewSpecificationPage.vue`:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()

// ========================================
// Состояние
// ========================================
const voiceText = ref('')           // Исходный текст из голоса
const title = ref('')               // Название ТЗ
const projectId = ref(null)         // Выбранный проект
const projects = ref([])            // Список проектов для выбора
const sections = ref([])            // Разделы ТЗ (результат AI)
const isStructuring = ref(false)    // AI обрабатывает текст
const isSaving = ref(false)
const error = ref('')

// ========================================
// При открытии страницы:
// 1. Получаем текст из sessionStorage (записан на RecordPage)
// 2. Загружаем список проектов
// ========================================
onMounted(async () => {
  voiceText.value = sessionStorage.getItem('voiceText') || ''

  try {
    const response = await api.get('/projects')
    projects.value = response.data
  } catch (e) {
    console.error(e)
  }
})

// ========================================
// Отправить текст на AI-структурирование
//
// POST /api/ai/structure — принимает { text }
// Возвращает { sections: [{ title, items: [{ content }] }] }
// ========================================
async function structureWithAI() {
  if (!voiceText.value.trim()) {
    error.value = 'Введите или запишите текст'
    return
  }

  isStructuring.value = true
  error.value = ''

  try {
    const response = await api.post('/ai/structure', {
      text: voiceText.value
    })
    sections.value = response.data.sections
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка AI-структурирования'
  } finally {
    isStructuring.value = false
  }
}

// ========================================
// Ручное добавление раздела
// ========================================
function addSection() {
  sections.value.push({
    title: 'Новый раздел',
    items: [{ content: '', timeEstimate: null }]
  })
}

// ========================================
// Добавить пункт в раздел
// ========================================
function addItem(sectionIndex) {
  sections.value[sectionIndex].items.push({
    content: '',
    timeEstimate: null
  })
}

// ========================================
// Удалить пункт из раздела
// ========================================
function removeItem(sectionIndex, itemIndex) {
  sections.value[sectionIndex].items.splice(itemIndex, 1)
}

// ========================================
// Удалить раздел целиком
// ========================================
function removeSection(index) {
  sections.value.splice(index, 1)
}

// ========================================
// Сохранить ТЗ
//
// POST /api/specifications — создаёт ТЗ со вложенными
// секциями и пунктами (Prisma nested create)
// ========================================
async function save() {
  if (!title.value.trim()) {
    error.value = 'Введите название ТЗ'
    return
  }
  if (!projectId.value) {
    error.value = 'Выберите проект'
    return
  }

  isSaving.value = true
  try {
    const response = await api.post('/specifications', {
      title: title.value,
      projectId: projectId.value,
      sections: sections.value
    })

    // Очищаем sessionStorage и переходим к ТЗ
    sessionStorage.removeItem('voiceText')
    router.push(`/specifications/${response.data.id}`)
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка сохранения'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Новое техническое задание</h1>

    <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- Основные поля -->
    <div class="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Название ТЗ</label>
        <input v-model="title" type="text" class="w-full border rounded px-3 py-2"
          placeholder="Например: Разработка интернет-магазина" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Проект</label>
        <select v-model="projectId" class="w-full border rounded px-3 py-2">
          <option :value="null" disabled>Выберите проект</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">
            {{ p.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Голосовой текст -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <label class="block text-sm font-medium mb-2">Текст из голосового ввода</label>
      <textarea v-model="voiceText" rows="6" class="w-full border rounded px-3 py-2"
        placeholder="Вставьте текст или запишите голос на странице 'Записать'"></textarea>

      <button @click="structureWithAI" :disabled="isStructuring"
        class="mt-3 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50">
        {{ isStructuring ? 'AI обрабатывает...' : 'Структурировать через AI' }}
      </button>
    </div>

    <!-- Разделы и пункты -->
    <div class="space-y-4 mb-6">
      <div v-for="(section, sIdx) in sections" :key="sIdx"
        class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <input v-model="section.title" type="text"
            class="text-lg font-semibold border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none flex-1"
            placeholder="Название раздела" />
          <button @click="removeSection(sIdx)"
            class="text-red-400 hover:text-red-600 ml-4 text-sm">
            Удалить раздел
          </button>
        </div>

        <!-- Пункты раздела -->
        <div v-for="(item, iIdx) in section.items" :key="iIdx"
          class="flex gap-3 mb-3 items-start">
          <span class="text-gray-400 mt-2 text-sm">{{ sIdx + 1 }}.{{ iIdx + 1 }}</span>

          <textarea v-model="item.content" rows="2"
            class="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="Описание пункта"></textarea>

          <input v-model.number="item.timeEstimate" type="number" min="0"
            class="w-20 border rounded px-2 py-2 text-sm"
            placeholder="мин" title="Оценка времени (минуты)" />

          <button @click="removeItem(sIdx, iIdx)"
            class="text-red-400 hover:text-red-600 mt-2">
            &times;
          </button>
        </div>

        <button @click="addItem(sIdx)"
          class="text-blue-500 hover:text-blue-700 text-sm">
          + Добавить пункт
        </button>
      </div>
    </div>

    <!-- Кнопки -->
    <div class="flex gap-4">
      <button @click="addSection"
        class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
        + Добавить раздел
      </button>

      <button @click="save" :disabled="isSaving"
        class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50">
        {{ isSaving ? 'Сохранение...' : 'Сохранить ТЗ' }}
      </button>
    </div>
  </div>
</template>
```

## Урок 11.3: Страница просмотра ТЗ ✅

### Теория

После сохранения ТЗ пользователь перенаправляется на `/specifications/:id`. Сейчас `SpecificationPage.vue` пустая — нужно создать страницу для просмотра готового ТЗ с разделами, пунктами и оценками времени.

### Шаг 1: Создать SpecificationPage.vue

Замени содержимое файла `src/pages/SpecificationPage.vue`:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const spec = ref(null)
const loading = ref(true)
const error = ref('')

// ========================================
// Загружаем ТЗ по ID из URL
//
// GET /api/specifications/:id
// Возвращает: { title, sections: [{ title, items: [...] }] }
// ========================================
onMounted(async () => {
  try {
    const response = await api.get(`/specifications/${route.params.id}`)
    spec.value = response.data
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка загрузки ТЗ'
  } finally {
    loading.value = false
  }
})

// Форматирование минут в "X ч Y мин"
function formatTime(minutes) {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} мин`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} ч ${m} мин` : `${h} ч`
}

// Суммарное время всех пунктов
function totalTime() {
  if (!spec.value) return 0
  return spec.value.sections.reduce((sum, s) =>
    sum + s.items.reduce((iSum, item) => iSum + (item.timeEstimate || 0), 0), 0)
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="loading" class="text-center py-12 text-gray-500">Загрузка...</div>

    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded">{{ error }}</div>

    <div v-else-if="spec">
      <!-- Заголовок + общее время -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ spec.title }}</h1>
        <span class="text-sm text-gray-500">
          Общее время: {{ formatTime(totalTime()) }}
        </span>
      </div>

      <!-- Разделы -->
      <div v-for="(section, sIdx) in spec.sections" :key="section.id"
        class="bg-white rounded-lg shadow p-6 mb-4">
        <h2 class="text-lg font-semibold mb-4">{{ sIdx + 1 }}. {{ section.title }}</h2>

        <!-- Пункты раздела -->
        <div v-for="(item, iIdx) in section.items" :key="item.id"
          class="flex justify-between items-start py-2 border-b last:border-0">
          <span class="text-sm">
            <span class="text-gray-400 mr-2">{{ sIdx + 1 }}.{{ iIdx + 1 }}</span>
            {{ item.content }}
          </span>
          <span v-if="item.timeEstimate" class="text-xs text-gray-500 whitespace-nowrap ml-4">
            {{ formatTime(item.timeEstimate) }}
          </span>
        </div>
      </div>

      <!-- Навигация -->
      <router-link to="/dashboard"
        class="inline-block mt-4 text-blue-500 hover:text-blue-700">
        &larr; На главную
      </router-link>
    </div>
  </div>
</template>
```

### Проверка

1. Создай ТЗ через AI (запиши голос → структурируй → сохрани)
2. После сохранения тебя перенаправит на страницу просмотра
3. Должны отобразиться: название, разделы с пунктами, оценки времени, общее время

---

## Урок 11.4: Улучшение промпта для AI ✅

### Теория

Базовый промпт может давать нерелевантные ответы — AI описывает процесс анализа вместо результата, или отвечает не на русском. Нужно сделать промпт более точным.

### Шаг 1: Обновить промпт в aiService.js

Замени промпт в `src/services/aiService.js`:

```javascript
const prompt = `Ты — опытный системный аналитик. Твоя задача — превратить сырой текст (запись речи заказчика) в структурированное техническое задание на разработку.

ПРАВИЛА:
- Разбей требования заказчика на логические разделы (например: "Каталог товаров", "Корзина", "Оплата", "Личный кабинет")
- В каждом разделе выдели конкретные задачи для разработчика
- Каждой задаче дай оценку времени в минутах (реалистичную для junior/middle разработчика)
- Придумай короткое название ТЗ, отражающее суть проекта
- НЕ описывай процесс анализа, описывай РЕЗУЛЬТАТ — что нужно разработать
- Отвечай ТОЛЬКО на русском языке

Верни ТОЛЬКО валидный JSON, без markdown-обёртки, без пояснений до или после, строго в формате:
{
  "title": "Название ТЗ",
  "sections": [
    {
      "title": "Название раздела",
      "items": [
        {
          "content": "Описание задачи для разработчика",
          "timeEstimate": 60
        }
      ]
    }
  ]
}

Текст от заказчика:
${text}`
```

**Что изменилось:**
- Роль "системный аналитик" — модель лучше понимает контекст
- Примеры разделов — подсказка для модели
- "НЕ описывай процесс анализа" — AI не будет описывать как он анализирует
- "Отвечай ТОЛЬКО на русском" — qwen2.5 иногда отвечает на китайском

### Проверка

Перезапусти бэкенд и отправь тестовый запрос. Сравни качество ответа до и после.

## Урок 11.5: Редактирование ТЗ ✅

### Теория

После генерации AI может ошибиться: неточное название, лишний пункт, неправильная оценка времени. Пользователь должен иметь возможность отредактировать ТЗ прямо на странице просмотра.

Что нужно:
1. **Backend** — эндпоинт `PUT /api/specifications/:id` для обновления ТЗ
2. **Frontend** — режим редактирования на `SpecificationPage.vue`

### Шаг 1: Эндпоинт обновления (Backend)

Добавь функцию `update` в `src/controllers/specificationController.js`:

```javascript
/**
 * PUT /api/specifications/:id
 *
 * Обновить ТЗ: название, секции и пункты
 *
 * Стратегия обновления:
 * 1. Удаляем все старые секции (каскадно удалятся пункты)
 * 2. Создаём новые секции и пункты из тела запроса
 *
 * Почему удаляем и создаём заново, а не обновляем по одному?
 * - Пользователь мог добавить/удалить секции и пункты
 * - Мог поменять порядок
 * - Проще пересоздать, чем отслеживать каждое изменение
 * - Prisma делает всё в одной транзакции — безопасно
 */
async function update(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { title, sections } = req.body

    // Проверяем что ТЗ существует и принадлежит пользователю
    const existing = await prisma.specification.findFirst({
      where: { id, userId: req.userId }
    })
    if (!existing) {
      return res.status(404).json({ error: 'ТЗ не найдено' })
    }

    // ========================================
    // Транзакция: удаляем старые секции + обновляем ТЗ
    //
    // prisma.$transaction — гарантирует что либо ВСЕ
    // операции выполнятся, либо НИ ОДНА (атомарность)
    // ========================================
    const updated = await prisma.$transaction(async (tx) => {
      // Удаляем старые секции (items удалятся каскадно)
      await tx.section.deleteMany({
        where: { specificationId: id }
      })

      // Обновляем заголовок и создаём новые секции
      return tx.specification.update({
        where: { id },
        data: {
          title,
          sections: {
            create: sections.map((section, sIdx) => ({
              title: section.title,
              position: sIdx,
              items: {
                create: section.items.map((item, iIdx) => ({
                  content: item.content,
                  timeEstimate: item.timeEstimate || null,
                  position: iIdx
                }))
              }
            }))
          }
        },
        include: {
          sections: {
            orderBy: { position: 'asc' },
            include: {
              items: { orderBy: { position: 'asc' } }
            }
          }
        }
      })
    })

    res.json(updated)
  } catch (error) {
    console.error('Ошибка обновления ТЗ:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}
```

Не забудь добавить `update` в `module.exports`:

```javascript
module.exports = { generate, getById, getAll, update }
```

### Шаг 2: Подключить роут

В `src/routes/specifications.js` добавь:

```javascript
const { generate, getById, getAll, update } = require('../controllers/specificationController')

// ... после остальных роутов
router.put('/:id', update)
```

### Шаг 3: Режим редактирования на фронте

Обнови `src/pages/SpecificationPage.vue` — добавь переключение между просмотром и редактированием:

**В `<script setup>` добавь:**

```javascript
// ========================================
// Режим редактирования
//
// isEditing — переключатель просмотр/редактирование
// editTitle — редактируемый заголовок
// editSections — редактируемые секции (копия данных)
//
// Работаем с копией, чтобы можно было отменить изменения
// ========================================
const isEditing = ref(false)
const editTitle = ref('')
const editSections = ref([])
const isSaving = ref(false)

// Включить режим редактирования
// JSON.parse(JSON.stringify(...)) — глубокая копия объекта
function startEditing() {
  editTitle.value = spec.value.title
  editSections.value = JSON.parse(JSON.stringify(spec.value.sections))
  isEditing.value = true
}

// Отменить редактирование
function cancelEditing() {
  isEditing.value = false
}

// Добавить раздел
function addSection() {
  editSections.value.push({
    title: 'Новый раздел',
    items: [{ content: '', timeEstimate: null }]
  })
}

// Добавить пункт в раздел
function addItem(sIdx) {
  editSections.value[sIdx].items.push({
    content: '',
    timeEstimate: null
  })
}

// Удалить пункт
function removeItem(sIdx, iIdx) {
  editSections.value[sIdx].items.splice(iIdx, 1)
}

// Удалить раздел
function removeSection(sIdx) {
  editSections.value.splice(sIdx, 1)
}

// Сохранить изменения
async function saveChanges() {
  isSaving.value = true
  try {
    const response = await api.put(`/specifications/${route.params.id}`, {
      title: editTitle.value,
      sections: editSections.value
    })
    spec.value = response.data
    isEditing.value = false
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка сохранения'
  } finally {
    isSaving.value = false
  }
}
```

**В `<template>` добавь кнопку "Редактировать" и форму редактирования:**

```html
<!-- Кнопка редактирования (в режиме просмотра) -->
<button v-if="!isEditing" @click="startEditing"
  class="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
  Редактировать
</button>

<!-- Режим редактирования -->
<div v-if="isEditing">
  <!-- Название -->
  <div class="bg-white rounded-lg shadow p-6 mb-4">
    <label class="block text-sm font-medium mb-1">Название ТЗ</label>
    <input v-model="editTitle" type="text" class="w-full border rounded px-3 py-2" />
  </div>

  <!-- Секции -->
  <div v-for="(section, sIdx) in editSections" :key="sIdx"
    class="bg-white rounded-lg shadow p-6 mb-4">
    <div class="flex items-center justify-between mb-4">
      <input v-model="section.title" type="text"
        class="text-lg font-semibold border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none flex-1"
        placeholder="Название раздела" />
      <button @click="removeSection(sIdx)"
        class="text-red-400 hover:text-red-600 ml-4 text-sm">
        Удалить раздел
      </button>
    </div>

    <div v-for="(item, iIdx) in section.items" :key="iIdx"
      class="flex gap-3 mb-3 items-start">
      <span class="text-gray-400 mt-2 text-sm">{{ sIdx + 1 }}.{{ iIdx + 1 }}</span>
      <textarea v-model="item.content" rows="2"
        class="flex-1 border rounded px-3 py-2 text-sm"
        placeholder="Описание пункта"></textarea>
      <input v-model.number="item.timeEstimate" type="number" min="0"
        class="w-20 border rounded px-2 py-2 text-sm"
        placeholder="мин" />
      <button @click="removeItem(sIdx, iIdx)"
        class="text-red-400 hover:text-red-600 mt-2">&times;</button>
    </div>

    <button @click="addItem(sIdx)"
      class="text-blue-500 hover:text-blue-700 text-sm">
      + Добавить пункт
    </button>
  </div>

  <!-- Кнопки -->
  <div class="flex gap-4">
    <button @click="addSection"
      class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
      + Добавить раздел
    </button>
    <button @click="saveChanges" :disabled="isSaving"
      class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50">
      {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
    </button>
    <button @click="cancelEditing"
      class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
      Отмена
    </button>
  </div>
</div>
```

### Проверка

1. Открой любое ТЗ
2. Нажми "Редактировать"
3. Измени название, добавь/удали пункты, поменяй оценки
4. Нажми "Сохранить" — данные обновятся в БД
5. Нажми "Отмена" — изменения откатятся

---

## Урок 11.6: Статус ТЗ ⬜

### Теория

Добавим поле `status` в модель `Specification`, чтобы отслеживать состояние ТЗ: черновик, в работе, выполнено.

Статусы:
- `draft` — черновик (по умолчанию)
- `in_progress` — в работе
- `completed` — выполнено

### Шаг 1: Обнови схему Prisma

В файле `backend/prisma/schema.prisma` добавь поле `status` в модель `Specification`:

```prisma
model Specification{
  id Int @id @default(autoincrement())
  title String
  status String @default("draft") // draft, in_progress, completed
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  projectId Int
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  userId Int
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  sections Section[]
}
```

Затем примени миграцию:

```bash
cd backend
npx prisma migrate dev --name add-spec-status
```

### Шаг 2: Бэкенд — эндпоинт смены статуса

В файле `backend/src/controllers/specificationController.js` добавь функцию `updateStatus`:

```javascript
/**
 * PATCH /api/specifications/:id/status
 *
 * Обновить статус ТЗ
 * Body: { status: "draft" | "in_progress" | "completed" }
 */
async function updateStatus(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { status } = req.body

    // Валидация статуса
    const validStatuses = ['draft', 'in_progress', 'completed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Невалидный статус. Допустимые: ${validStatuses.join(', ')}`
      })
    }

    // Проверяем что ТЗ существует и принадлежит пользователю
    const existing = await prisma.specification.findFirst({
      where: { id, userId: req.userId }
    })
    if (!existing) {
      return res.status(404).json({ error: 'ТЗ не найдено' })
    }

    const updated = await prisma.specification.update({
      where: { id },
      data: { status },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: { orderBy: { position: 'asc' } }
          }
        }
      }
    })

    res.json(updated)
  } catch (error) {
    console.error('Ошибка обновления статуса:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}
```

Не забудь добавить `updateStatus` в `module.exports`:

```javascript
module.exports = { generate, getById, getAll, update, updateStatus }
```

### Шаг 3: Бэкенд — роут

В файле `backend/src/routes/specifications.js` добавь роут:

```javascript
const { generate, getById, getAll, update, updateStatus } = require('../controllers/specificationController')

// ... существующие роуты ...
router.patch('/:id/status', updateStatus)
```

> **Почему PATCH, а не PUT?** `PUT` обновляет весь ресурс целиком, а `PATCH` — только часть (в нашем случае только поле `status`).

### Шаг 4: Фронтенд — отображение и смена статуса

В файле `frontend/src/pages/SpecificationPage.vue` добавь логику статусов.

**В `<script setup>`** добавь:

```javascript
// Маппинг статусов на русские названия и цвета
const statusMap = {
  draft: { label: 'Черновик', color: 'bg-gray-200 text-gray-700' },
  in_progress: { label: 'В работе', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Выполнено', color: 'bg-green-100 text-green-700' }
}

// Смена статуса
async function changeStatus(newStatus) {
  try {
    const response = await api.patch(`/specifications/${route.params.id}/status`, {
      status: newStatus
    })
    spec.value = response.data
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка смены статуса'
  }
}
```

**В `<template>`** — добавь бейдж статуса рядом с заголовком и кнопки смены:

```html
<!-- Заголовок + статус + общее время -->
<div class="flex items-center justify-between mb-6">
  <div class="flex items-center gap-3">
    <h1 class="text-2xl font-bold">{{ spec.title }}</h1>
    <span :class="['text-xs px-2 py-1 rounded-full font-medium',
      statusMap[spec.status]?.color || 'bg-gray-200']">
      {{ statusMap[spec.status]?.label || spec.status }}
    </span>
  </div>
  <span class="text-sm text-gray-500">
    Общее время: {{ formatTime(totalTime()) }}
  </span>
</div>

<!-- Кнопки смены статуса (в режиме просмотра) -->
<div v-if="!isEditing" class="flex gap-2 mb-6">
  <button v-if="spec.status !== 'draft'" @click="changeStatus('draft')"
    class="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
    Черновик
  </button>
  <button v-if="spec.status !== 'in_progress'" @click="changeStatus('in_progress')"
    class="text-sm px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200">
    В работе
  </button>
  <button v-if="spec.status !== 'completed'" @click="changeStatus('completed')"
    class="text-sm px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200">
    Выполнено
  </button>
</div>
```

### Проверка

1. Примени миграцию (`npx prisma migrate dev --name add-spec-status`)
2. Открой ТЗ — должен отображаться бейдж "Черновик"
3. Нажми "В работе" — статус изменится на синий
4. Нажми "Выполнено" — статус станет зелёным
5. Проверь что статус сохраняется после перезагрузки страницы

---

## Урок 11.7: Удаление ТЗ ✅

### Теория

Добавим возможность удалять ТЗ. Благодаря `onDelete: Cascade` в схеме Prisma, при удалении Specification автоматически удалятся все связанные Section и Item.

Важно: перед удалением показываем диалог подтверждения, чтобы пользователь не удалил ТЗ случайно.

### Шаг 1: Бэкенд — контроллер

В файле `backend/src/controllers/specificationController.js` добавь функцию `remove`:

```javascript
/**
 * DELETE /api/specifications/:id
 *
 * Удалить ТЗ (каскадно удалятся секции и пункты)
 */
async function remove(req, res) {
  try {
    const id = parseInt(req.params.id)

    // Проверяем что ТЗ существует и принадлежит пользователю
    const existing = await prisma.specification.findFirst({
      where: { id, userId: req.userId }
    })
    if (!existing) {
      return res.status(404).json({ error: 'ТЗ не найдено' })
    }

    await prisma.specification.delete({
      where: { id }
    })

    res.json({ message: 'ТЗ удалено' })
  } catch (error) {
    console.error('Ошибка удаления ТЗ:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}
```

Обнови `module.exports`:

```javascript
module.exports = { generate, getById, getAll, update, updateStatus, remove }
```

### Шаг 2: Бэкенд — роут

В файле `backend/src/routes/specifications.js`:

```javascript
const { generate, getById, getAll, update, updateStatus, remove } = require('../controllers/specificationController')

// ... существующие роуты ...
router.delete('/:id', remove)
```

### Шаг 3: Фронтенд — кнопка удаления

В файле `frontend/src/pages/SpecificationPage.vue` добавь логику удаления.

**В `<script setup>`** добавь:

```javascript
import { useRouter } from 'vue-router'

const router = useRouter()

// Удаление ТЗ с подтверждением
async function deleteSpec() {
  if (!confirm('Удалить это ТЗ? Все секции и пункты будут удалены безвозвратно.')) {
    return
  }

  try {
    await api.delete(`/specifications/${route.params.id}`)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка удаления'
  }
}
```

> **Примечание:** `useRoute` для чтения параметров URL у тебя уже импортирован. Теперь нужен ещё `useRouter` для программной навигации (`router.push`). Это разные вещи: `route` — текущий маршрут, `router` — навигатор.

**В `<template>`** — добавь кнопку удаления рядом с кнопкой "Редактировать":

```html
<!-- Кнопки действий (в режиме просмотра) -->
<div v-if="!isEditing" class="flex gap-2 mb-6">
  <button @click="startEditing"
    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
    Редактировать
  </button>
  <button @click="deleteSpec"
    class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">
    Удалить
  </button>
</div>
```

> Замени старую одиночную кнопку "Редактировать" на этот блок с двумя кнопками.

### Проверка

1. Открой любое ТЗ
2. Нажми "Удалить"
3. В диалоге нажми "OK" — ТЗ удалится, тебя перенаправит на главную
4. Проверь что ТЗ пропало из списка
5. Нажми "Отмена" в диалоге — ничего не произойдёт

---

# ЧАСТЬ 12: AI-СТРУКТУРИРОВАНИЕ ЧЕРЕЗ OLLAMA ✅

## Урок 12.1: Установка и настройка Ollama ✅

### Теория

Ollama — локальный AI, который работает прямо на твоём компьютере.
- Полностью бесплатен — никаких API-ключей и лимитов
- Работает офлайн после загрузки модели
- Хорошо работает с русским языком (модель qwen2.5)
- Отдаёт ответы через REST API на `localhost:11434`

### Шаг 1: Установка Ollama

1. Перейди на https://ollama.com и скачай установщик для своей ОС
2. Установи и запусти Ollama
3. Скачай модель (в терминале):

```bash
ollama pull qwen2.5:7b
```

> Модель весит ~4.5 ГБ. Загрузка займёт несколько минут.
> Если у тебя мало RAM (меньше 8 ГБ), используй `qwen2.5:3b` — она легче.

4. Проверь что всё работает:

```bash
ollama run qwen2.5:7b "Привет, ответь одним словом"
```

### Шаг 2: Переменные окружения

Добавь в `backend/.env`:

```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

## Урок 12.2: Сервис Ollama (Backend) ✅

### Теория

Ollama предоставляет REST API. Мы будем отправлять POST-запрос на `/api/generate` с промптом и получать ответ от модели.

Ключевой момент: мы просим модель вернуть JSON, но AI иногда добавляет текст до/после JSON. Поэтому нужна надёжная обработка ответа.

### Шаг 1: Обновлённый AI-сервис

Замени `src/services/aiService.js` (тот, что создали в Части 6):

```javascript
// ========================================
// Сервис для работы с Ollama
//
// Ollama — локальный AI-сервер
// Общение через HTTP API (REST)
// Эндпоинт: POST /api/generate
// ========================================

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b'

/**
 * Структурирование текста через Ollama
 *
 * @param {string} text — сырой текст из голосового ввода
 * @returns {Object} — { title, sections: [{ title, items: [{ content, timeEstimate }] }] }
 *
 * Как работает:
 * 1. Формируем промпт с инструкцией для AI
 * 2. Отправляем запрос в Ollama через fetch
 * 3. Ollama генерирует ответ локально на твоём компьютере
 * 4. Парсим JSON из ответа
 */
async function structureText(text) {
  // ========================================
  // Промпт — инструкция для AI
  //
  // Ключевые моменты:
  // - Просим вернуть ТОЛЬКО JSON (без markdown)
  // - Указываем точную структуру ожидаемого ответа
  // - Просим оценить время выполнения каждого пункта
  // - Просим придумать название для ТЗ
  // ========================================
  const prompt = `Ты — помощник по созданию технических заданий.

Проанализируй текст ниже и структурируй его в техническое задание.
Раздели на логические разделы, каждый раздел содержит пункты.
Для каждого пункта дай оценку времени в минутах.
Придумай краткое название для ТЗ.

Верни ТОЛЬКО JSON без markdown-обёртки, строго в формате:
{
  "title": "Название ТЗ",
  "sections": [
    {
      "title": "Название раздела",
      "items": [
        {
          "content": "Описание пункта",
          "timeEstimate": 60
        }
      ]
    }
  ]
}

Текст для анализа:
${text}`

  // ========================================
  // Запрос к Ollama
  //
  // fetch — встроенная функция для HTTP-запросов (Node 18+)
  // stream: false — получаем весь ответ сразу (не по частям)
  // signal + AbortController — таймаут 60 сек (AI может думать долго)
  // ========================================
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`Ollama вернула ошибку: ${response.status}`)
    }

    const data = await response.json()

    // ========================================
    // Парсинг ответа
    //
    // data.response — текст от AI
    // AI может обернуть JSON в ```json ... ```
    // Убираем markdown-обёртку если есть
    // ========================================
    const jsonStr = data.response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    return JSON.parse(jsonStr)
  } catch (error) {
    clearTimeout(timeout)

    // Понятные ошибки для пользователя
    if (error.name === 'AbortError') {
      throw new Error('Таймаут: Ollama не ответила за 60 секунд')
    }
    if (error.cause?.code === 'ECONNREFUSED') {
      throw new Error('Ollama не запущена. Выполни: ollama serve')
    }

    console.error('Ошибка AI:', error)
    throw new Error('Не удалось структурировать текст через AI')
  }
}

module.exports = { structureText }
```

> **Обрати внимание:** мы используем встроенный `fetch` (доступен в Node.js 18+).
> Никаких дополнительных пакетов для HTTP-запросов не нужно!

### Шаг 2: Роут для AI

Создай `src/routes/ai.js`:

```javascript
const express = require('express')
const { authenticate } = require('../middleware/auth')
const { structureText } = require('../services/aiService')

const router = express.Router()

/**
 * POST /api/ai/structure
 *
 * Тело запроса: { text: "сырой текст" }
 * Ответ: { title, sections: [...] }
 *
 * Поток: текст → промпт для Ollama → JSON-структура ТЗ
 */
router.post('/structure', authenticate, async (req, res) => {
  try {
    const { text } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Текст не может быть пустым' })
    }

    const structured = await structureText(text)
    res.json(structured)
  } catch (error) {
    console.error('Ошибка AI-структурирования:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
```

### Шаг 3: Подключение в index.js

Добавь в `src/index.js` рядом с другими роутами:

```javascript
const aiRoutes = require('./routes/ai')

app.use('/api/ai', aiRoutes)
```

### Проверка

1. Убедись что Ollama запущена (`ollama serve`)
2. Запусти бэкенд: `npm run dev`
3. Проверь через curl или Postman:

```bash
curl -X POST http://localhost:3000/api/ai/structure \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ТВОЙ_ТОКЕН" \
  -d '{"text": "Нужно сделать интернет-магазин с каталогом товаров, корзиной и оплатой"}'
```

Ответ должен содержать JSON с разделами и пунктами ТЗ.

> **Важно:** первый запрос может занять 10-30 секунд — модель загружается в память.
> Последующие запросы будут быстрее (3-10 сек).

## Урок 12.3: Генерация и сохранение ТЗ (Backend) ✅

### Теория

Сейчас AI возвращает структуру, но мы её не сохраняем в БД. В этом уроке создадим полноценный эндпоинт, который:
1. Принимает текст и ID проекта
2. Структурирует текст через Ollama
3. Сохраняет результат в БД (Specification → Section → Item)
4. Возвращает готовое ТЗ

### Шаг 1: Контроллер спецификаций

Создай `src/controllers/specificationController.js`:

```javascript
const prisma = require('../db')
const { structureText } = require('../services/aiService')

/**
 * POST /api/specifications/generate
 *
 * Принимает сырой текст, структурирует через AI,
 * сохраняет в БД как Specification → Section → Item
 */
async function generate(req, res) {
  try {
    const { text, projectId } = req.body

    // Валидация
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Текст не может быть пустым' })
    }
    if (!projectId) {
      return res.status(400).json({ error: 'projectId обязателен' })
    }

    // Проверяем что проект существует и принадлежит пользователю
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId }
    })
    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' })
    }

    // ========================================
    // Вызов AI
    //
    // structureText отправляет текст в Ollama
    // и возвращает { title, sections: [...] }
    // ========================================
    const structured = await structureText(text)

    // ========================================
    // Сохранение в БД
    //
    // prisma.specification.create с nested create:
    // - Создаём Specification
    // - Внутри создаём Section[]
    // - Внутри каждой секции создаём Item[]
    //
    // Всё в одной транзакции — если что-то упадёт,
    // ничего не сохранится (атомарность)
    // ========================================
    const specification = await prisma.specification.create({
      data: {
        title: structured.title || 'Без названия',
        projectId,
        userId: req.userId,
        sections: {
          create: structured.sections.map((section, sIndex) => ({
            title: section.title,
            position: sIndex,
            items: {
              create: section.items.map((item, iIndex) => ({
                content: item.content,
                timeEstimate: item.timeEstimate || null,
                position: iIndex
              }))
            }
          }))
        }
      },
      // Возвращаем созданное ТЗ со всеми связями
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' }
            }
          }
        }
      }
    })

    res.status(201).json(specification)
  } catch (error) {
    console.error('Ошибка генерации ТЗ:', error)
    res.status(500).json({ error: error.message })
  }
}

/**
 * GET /api/specifications/:id
 *
 * Получить ТЗ по ID с секциями и пунктами
 */
async function getById(req, res) {
  try {
    const id = parseInt(req.params.id)

    const specification = await prisma.specification.findFirst({
      where: { id, userId: req.userId },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' }
            }
          }
        }
      }
    })

    if (!specification) {
      return res.status(404).json({ error: 'ТЗ не найдено' })
    }

    res.json(specification)
  } catch (error) {
    console.error('Ошибка получения ТЗ:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

/**
 * GET /api/specifications
 *
 * Список ТЗ текущего пользователя
 */
async function getAll(req, res) {
  try {
    const specifications = await prisma.specification.findMany({
      where: { userId: req.userId },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' }
            }
          }
        },
        project: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(specifications)
  } catch (error) {
    console.error('Ошибка получения списка ТЗ:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

module.exports = { generate, getById, getAll }
```

### Шаг 2: Роуты спецификаций

Создай `src/routes/specifications.js`:

```javascript
const express = require('express')
const { authenticate } = require('../middleware/auth')
const { generate, getById, getAll } = require('../controllers/specificationController')

const router = express.Router()

// Все роуты защищены авторизацией
router.use(authenticate)

router.post('/generate', generate)
router.get('/', getAll)
router.get('/:id', getById)

module.exports = router
```

### Шаг 3: Подключение в index.js

Добавь в `src/index.js`:

```javascript
const specRoutes = require('./routes/specifications')

app.use('/api/specifications', specRoutes)
```

Итого `src/index.js` должен выглядеть так:

```javascript
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const aiRoutes = require('./routes/ai')
const specRoutes = require('./routes/specifications')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

// Роуты
app.use('/api/auth', authRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/specifications', specRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Сервер запущен http://localhost:${PORT}`)
})
```

---

# ЧАСТЬ 13: ЗАГРУЗКА ВЛОЖЕНИЙ ⬜

## Урок 13.1: Backend для загрузки файлов ⬜

### Теория

Вложения привязываются к пунктам ТЗ (Item).
Файлы сохраняются на диск в папку `uploads/`.
В БД хранится путь, имя, тип и размер.

### Шаг 1: Настройка multer

Создай `src/middleware/upload.js`:

```javascript
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// ========================================
// Папка для загрузок
// Создаём если не существует
// ========================================
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// ========================================
// Настройка хранилища
//
// destination — куда сохранять файлы
// filename — как именовать файлы
//
// Формат имени: timestamp-random-оригинальное_имя
// Это предотвращает конфликты имён
// ========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1000)}-${file.originalname}`
    cb(null, uniqueName)
  }
})

// ========================================
// Фильтр файлов
//
// Разрешаем: изображения, PDF, документы
// Запрещаем: исполняемые файлы (.exe, .sh и т.д.)
// ========================================
const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Недопустимый тип файла'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5 MB максимум
  }
})

module.exports = upload
```

### Шаг 2: Роут вложений

Создай `src/routes/attachments.js`:

```javascript
const express = require('express')
const { authenticate } = require('../middleware/auth')
const upload = require('../middleware/upload')
const prisma = require('../db')
const fs = require('fs')
const path = require('path')

const router = express.Router()

/**
 * POST /api/attachments/:itemId
 *
 * Загрузить файл и привязать к пункту ТЗ
 * Принимает: multipart/form-data с полем "file"
 *
 * req.file — объект от multer:
 *   .filename — имя на диске
 *   .originalname — оригинальное имя
 *   .mimetype — MIME тип
 *   .size — размер в байтах
 *   .path — полный путь на диске
 */
router.post('/:itemId', authenticate, upload.single('file'), async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId)

    // Проверяем что пункт существует и принадлежит пользователю
    const item = await prisma.item.findFirst({
      where: { id: itemId },
      include: {
        section: {
          include: {
            specification: true
          }
        }
      }
    })

    if (!item || item.section.specification.userId !== req.userId) {
      return res.status(404).json({ error: 'Пункт не найден' })
    }

    // Создаём запись вложения в БД
    const attachment = await prisma.attachment.create({
      data: {
        filename: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype,
        size: req.file.size,
        itemId
      }
    })

    res.status(201).json(attachment)
  } catch (error) {
    console.error('Ошибка загрузки:', error)
    res.status(500).json({ error: 'Ошибка загрузки файла' })
  }
})

/**
 * DELETE /api/attachments/:id
 *
 * Удалить вложение: файл с диска + запись из БД
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        item: {
          include: {
            section: {
              include: { specification: true }
            }
          }
        }
      }
    })

    if (!attachment || attachment.item.section.specification.userId !== req.userId) {
      return res.status(404).json({ error: 'Вложение не найдено' })
    }

    // Удаляем файл с диска
    const filePath = path.join(__dirname, '../../', attachment.path)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Удаляем запись из БД
    await prisma.attachment.delete({
      where: { id: attachment.id }
    })

    res.json({ message: 'Вложение удалено' })
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления' })
  }
})

module.exports = router
```

### Шаг 3: Раздача статических файлов

В `src/index.js` добавь:

```javascript
const path = require('path')

const attachmentRoutes = require('./routes/attachments')

// Раздача загруженных файлов по URL /uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/attachments', attachmentRoutes)
```

---

# ЧАСТЬ 14: DRAG & DROP СОРТИРОВКА ⬜

## Урок 14.1: Перетаскивание разделов и пунктов ⬜

### Шаг 1: Установка библиотеки

```bash
cd frontend
npm install vuedraggable@next
```

`vuedraggable` — обёртка над SortableJS для Vue 3. Позволяет перетаскивать элементы в списке.

### Шаг 2: Использование в редакторе ТЗ

Обновлённый фрагмент для `NewSpecificationPage.vue`:

```vue
<script setup>
import draggable from 'vuedraggable'
// ... остальные импорты
</script>

<template>
  <!-- ... -->

  <!-- Разделы с Drag & Drop -->
  <!--
    draggable — компонент из vuedraggable
    v-model — массив который будет сортироваться
    item-key — уникальный ключ элемента
    handle — CSS-селектор за который можно тянуть
    ghost-class — CSS-класс для "призрака" при перетаскивании
    @end — событие завершения перетаскивания
  -->
  <draggable
    v-model="sections"
    item-key="title"
    handle=".drag-handle"
    ghost-class="opacity-30"
    @end="updatePositions"
  >
    <template #item="{ element: section, index: sIdx }">
      <div class="bg-white rounded-lg shadow p-6 mb-4">
        <div class="flex items-center gap-3 mb-4">
          <!-- Иконка перетаскивания -->
          <span class="drag-handle cursor-grab text-gray-400 hover:text-gray-600">
            &#x2630;
          </span>

          <input v-model="section.title" type="text"
            class="text-lg font-semibold border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none flex-1" />

          <button @click="removeSection(sIdx)"
            class="text-red-400 hover:text-red-600 text-sm">
            Удалить
          </button>
        </div>

        <!-- Пункты раздела — тоже с Drag & Drop -->
        <draggable
          v-model="section.items"
          item-key="content"
          handle=".item-drag"
          ghost-class="opacity-30"
        >
          <template #item="{ element: item, index: iIdx }">
            <div class="flex gap-3 mb-3 items-start">
              <span class="item-drag cursor-grab text-gray-300 hover:text-gray-500 mt-2">
                &#x2630;
              </span>
              <span class="text-gray-400 mt-2 text-sm">{{ sIdx + 1 }}.{{ iIdx + 1 }}</span>
              <textarea v-model="item.content" rows="2"
                class="flex-1 border rounded px-3 py-2 text-sm"></textarea>
              <input v-model.number="item.timeEstimate" type="number"
                class="w-20 border rounded px-2 py-2 text-sm"
                placeholder="мин" />
              <button @click="removeItem(sIdx, iIdx)"
                class="text-red-400 hover:text-red-600 mt-2">&times;</button>
            </div>
          </template>
        </draggable>

        <button @click="addItem(sIdx)"
          class="text-blue-500 hover:text-blue-700 text-sm">
          + Добавить пункт
        </button>
      </div>
    </template>
  </draggable>

  <!-- ... -->
</template>
```

### Шаг 3: Обновление позиций на сервере

Добавь в `specificationController.js`:

```javascript
/**
 * PUT /api/specifications/:id/positions
 *
 * Обновляет позиции (порядок) разделов и пунктов после drag & drop
 *
 * Тело запроса:
 * { sections: [{ id: 1, position: 0, items: [{ id: 5, position: 0 }] }] }
 *
 * Используем transaction — все обновления атомарны:
 * если одно упадёт, все откатятся
 */
async function updatePositions(req, res) {
  try {
    const { sections } = req.body

    await prisma.$transaction(
      sections.flatMap(section => [
        prisma.section.update({
          where: { id: section.id },
          data: { position: section.position }
        }),
        ...section.items.map(item =>
          prisma.item.update({
            where: { id: item.id },
            data: { position: item.position }
          })
        )
      ])
    )

    res.json({ message: 'Позиции обновлены' })
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления' })
  }
}
```

---

# ЧАСТЬ 15: ЭКСПОРТ В PDF (FRONTEND) ⬜

## Урок 15.1: Кнопка экспорта (Frontend → Backend) ⬜

### Шаг 1: Установка Puppeteer

```bash
cd backend
npm install puppeteer
```

### Шаг 2: Роут для экспорта

Создай `src/routes/export.js`:

```javascript
const express = require('express')
const { authenticate } = require('../middleware/auth')
const { generatePdf } = require('../services/pdfService')
const prisma = require('../db')

const router = express.Router()

/**
 * GET /api/export/pdf/:specificationId
 *
 * Генерирует PDF из ТЗ и отправляет как файл для скачивания
 *
 * Поток:
 * 1. Загружаем ТЗ из БД с разделами и пунктами
 * 2. Передаём в pdfService → Puppeteer рендерит HTML в PDF
 * 3. Устанавливаем заголовки для скачивания
 * 4. Отправляем PDF-буфер клиенту
 *
 * Content-Type: application/pdf — браузер поймёт что это PDF
 * Content-Disposition: attachment — браузер скачает файл вместо открытия
 */
router.get('/pdf/:specificationId', authenticate, async (req, res) => {
  try {
    const spec = await prisma.specification.findFirst({
      where: {
        id: parseInt(req.params.specificationId),
        userId: req.userId
      },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' }
            }
          }
        }
      }
    })

    if (!spec) {
      return res.status(404).json({ error: 'ТЗ не найдено' })
    }

    const pdf = await generatePdf(spec)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="tz-${spec.id}.pdf"`)
    res.send(pdf)
  } catch (error) {
    console.error('Ошибка генерации PDF:', error)
    res.status(500).json({ error: 'Ошибка экспорта' })
  }
})

module.exports = router
```

Подключение в `index.js`:

```javascript
const exportRoutes = require('./routes/export')
app.use('/api/export', exportRoutes)
```

### Шаг 3: Кнопка скачивания на фронте

Добавь в компонент просмотра ТЗ:

```vue
<script setup>
import api from '../api'

async function downloadPdf(specId) {
  try {
    // ========================================
    // responseType: 'blob' — получаем бинарные данные
    // Без этого axios попытается распарсить PDF как JSON
    // ========================================
    const response = await api.get(`/export/pdf/${specId}`, {
      responseType: 'blob'
    })

    // ========================================
    // Создаём ссылку для скачивания:
    // 1. URL.createObjectURL — создаёт временный URL для Blob
    // 2. Создаём невидимый <a> с атрибутом download
    // 3. Программно кликаем → браузер скачивает
    // 4. Убираем за собой (revokeObjectURL)
    // ========================================
    const url = URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = url
    link.download = `tz-${specId}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    alert('Ошибка скачивания PDF')
  }
}
</script>

<template>
  <button @click="downloadPdf(specification.id)"
    class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
    Скачать PDF
  </button>
</template>
```

---

# ЧАСТЬ 16: ИНТЕГРАЦИЯ С BITRIX24 ⬜

## Урок 16.1: Создание задач в Bitrix24 ⬜

### Теория

Bitrix24 предоставляет REST API для работы с задачами.
Для подключения нужен **вебхук** (webhook) — URL с токеном доступа.

### Шаг 1: Создание вебхука в Bitrix24

1. В Bitrix24 перейди: Приложения → Разработчикам → Другое → Входящий вебхук
2. Выбери права: `task` (Задачи)
3. Скопируй URL вебхука (вида `https://your-domain.bitrix24.ru/rest/1/abc123/`)
4. Добавь в `.env`:

```env
BITRIX24_WEBHOOK_URL=https://your-domain.bitrix24.ru/rest/1/abc123
```

### Шаг 2: Сервис Bitrix24

Создай `src/services/bitrixService.js`:

```javascript
/**
 * Сервис интеграции с Bitrix24
 *
 * Bitrix24 REST API:
 * - tasks.task.add — создать задачу
 * - tasks.task.list — получить список задач
 *
 * Вебхук — это URL с встроенным токеном авторизации
 * Формат: https://domain.bitrix24.ru/rest/{userId}/{secret}/
 */

const WEBHOOK_URL = process.env.BITRIX24_WEBHOOK_URL

/**
 * Создать задачу в Bitrix24
 *
 * @param {Object} params
 * @param {string} params.title — название задачи
 * @param {string} params.description — описание (HTML)
 * @param {number} params.responsibleId — ID исполнителя в Bitrix24
 * @param {number|null} params.deadline — дедлайн (ISO строка)
 * @returns {Object} — ответ от Bitrix24 API
 *
 * Bitrix24 API: tasks.task.add
 * Метод: POST
 * Параметры передаются в fields объекте
 */
async function createTask({ title, description, responsibleId, deadline }) {
  const response = await fetch(`${WEBHOOK_URL}/tasks.task.add.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        TITLE: title,
        DESCRIPTION: description,
        RESPONSIBLE_ID: responsibleId,
        DEADLINE: deadline || undefined
      }
    })
  })

  const data = await response.json()

  if (data.error) {
    throw new Error(`Bitrix24: ${data.error_description}`)
  }

  return data.result
}

/**
 * Создать задачи из ТЗ
 *
 * Каждый пункт ТЗ → отдельная задача в Bitrix24
 * Разделы → группы задач (подзадачи)
 *
 * @param {Object} specification — ТЗ с разделами и пунктами
 * @param {number} responsibleId — ID исполнителя
 * @returns {Array} — массив ID созданных задач
 */
async function createTasksFromSpec(specification, responsibleId) {
  const createdTasks = []

  for (const section of specification.sections) {
    // Создаём родительскую задачу для раздела
    const parentTask = await createTask({
      title: `[ТЗ] ${specification.title} — ${section.title}`,
      description: `Раздел ТЗ: ${section.title}`,
      responsibleId
    })

    createdTasks.push(parentTask)

    // Создаём подзадачи для каждого пункта
    for (const item of section.items) {
      const childTask = await fetch(`${WEBHOOK_URL}/tasks.task.add.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            TITLE: item.content.substring(0, 100),  // Bitrix ограничивает длину
            DESCRIPTION: item.content,
            RESPONSIBLE_ID: responsibleId,
            PARENT_ID: parentTask.task.id,  // Привязка к родительской задаче
            TIME_ESTIMATE: item.timeEstimate
              ? item.timeEstimate * 60  // Bitrix принимает секунды
              : undefined
          }
        })
      }).then(r => r.json())

      createdTasks.push(childTask.result)
    }
  }

  return createdTasks
}

module.exports = { createTask, createTasksFromSpec }
```

### Шаг 3: Роут экспорта в Bitrix24

Создай `src/routes/bitrix.js`:

```javascript
const express = require('express')
const { authenticate } = require('../middleware/auth')
const { createTasksFromSpec } = require('../services/bitrixService')
const prisma = require('../db')

const router = express.Router()

/**
 * POST /api/bitrix/export/:specificationId
 *
 * Экспортирует ТЗ в Bitrix24 как набор задач
 *
 * Тело: { responsibleId: 1 } — ID исполнителя в Bitrix24
 */
router.post('/export/:specificationId', authenticate, async (req, res) => {
  try {
    const { responsibleId } = req.body

    if (!responsibleId) {
      return res.status(400).json({ error: 'Укажите ID исполнителя' })
    }

    const spec = await prisma.specification.findFirst({
      where: {
        id: parseInt(req.params.specificationId),
        userId: req.userId
      },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: { orderBy: { position: 'asc' } }
          }
        }
      }
    })

    if (!spec) {
      return res.status(404).json({ error: 'ТЗ не найдено' })
    }

    const tasks = await createTasksFromSpec(spec, responsibleId)

    res.json({
      message: `Создано ${tasks.length} задач в Bitrix24`,
      tasks
    })
  } catch (error) {
    console.error('Ошибка Bitrix24:', error)
    res.status(500).json({ error: error.message || 'Ошибка экспорта в Bitrix24' })
  }
})

module.exports = router
```

Подключение в `index.js`:

```javascript
const bitrixRoutes = require('./routes/bitrix')
app.use('/api/bitrix', bitrixRoutes)
```

---

# ЧАСТЬ 17: УДАЛЁННЫЙ ДОСТУП ЧЕРЕЗ NGROK ✅

## Урок 17.1: Что такое ngrok и зачем он нужен ✅

### Теория

Сейчас приложение работает на `localhost` — это значит, что зайти можно только с того же ПК. Но что если ты хочешь:
- Открыть приложение с телефона
- Работать с другого компьютера (на работе, у друга)
- Подключиться из другой Wi-Fi сети или через мобильный интернет

**Проблема:** твой домашний ПК находится за роутером (NAT), у него нет публичного IP. Устройства из интернета не могут к нему обратиться напрямую.

**Решение: ngrok** — это сервис, который создаёт туннель между интернетом и твоим localhost. Он даёт тебе публичный URL (например `https://abc123.ngrok-free.app`), и все запросы на этот URL перенаправляются на твой ПК.

```
Телефон/Другой ПК
       ↓
https://abc123.ngrok-free.app    (публичный URL в интернете)
       ↓
Серверы ngrok                    (перенаправляют трафик)
       ↓
Твой ПК → localhost:3000         (backend + Ollama)
```

**Ответ на главный вопрос: да, это работает из ЛЮБОЙ сети** — другой Wi-Fi, мобильный интернет, из другого города. Единственное условие — твой домашний ПК должен быть включён и подключён к интернету.

---

## Урок 17.2: Установка и настройка ngrok ✅

### Шаг 1: Регистрация

1. Перейди на https://ngrok.com и зарегистрируйся (бесплатно)
2. После входа ты попадёшь в Dashboard
3. Скопируй свой **Authtoken** (на странице https://dashboard.ngrok.com/get-started/your-authtoken)

### Шаг 2: Установка ngrok

**Windows (через Chocolatey):**
```bash
choco install ngrok
```

**Или скачай вручную:**
1. Перейди на https://ngrok.com/download
2. Скачай ZIP для Windows
3. Распакуй `ngrok.exe` в удобную папку (например `C:\ngrok\`)
4. Добавь эту папку в PATH (или запускай через полный путь)

**Проверка установки:**
```bash
ngrok version
```

### Шаг 3: Авторизация

Выполни команду (вставь свой токен):

```bash
ngrok config add-authtoken ТВОЙ_AUTHTOKEN
```

Это нужно сделать один раз. Токен сохранится в конфигурации.

---

## Урок 17.3: Настройка приложения для удалённого доступа ✅

### Теория

Перед тем как открывать туннель, нужно подготовить приложение:

1. **Frontend** должен знать адрес backend. Сейчас он обращается к `http://localhost:3000`, но с телефона этот адрес недоступен
2. **CORS** на backend должен разрешать запросы с ngrok-домена
3. **Web Speech API** работает только на `localhost` или `HTTPS`. Ngrok даёт HTTPS — значит речь будет работать

### Шаг 1: Настрой Frontend для работы через прокси

В файле `frontend/vite.config.js` добавь настройку прокси, чтобы frontend пробрасывал API-запросы на backend:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',  // Разрешить доступ извне (не только localhost)
    allowedHosts: ['.ngrok-free.dev', '.ngrok.io'], // Разрешить запросы через ngrok
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

> **`host: '0.0.0.0'`** — по умолчанию Vite слушает только localhost. С этой настройкой он принимает подключения с любого адреса.

### Шаг 2: Обнови API-клиент на frontend

В файле `frontend/src/api/index.js` измени `baseURL`, чтобы он работал и локально, и через ngrok:

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: '/api'  // Относительный путь — запросы пойдут на тот же хост
})

// ... остальной код (интерсептор с токеном) без изменений
```

> **Почему `/api` вместо `http://localhost:3000/api`?**
> Когда baseURL относительный, axios отправляет запросы на тот же хост, откуда загружена страница. Локально это `localhost:5173` (Vite проксирует на `:3000`). Через ngrok это `https://abc123.ngrok-free.app` — и запросы всё равно дойдут до backend.

### Шаг 3: Обнови CORS на backend

В файле `backend/src/index.js` разреши запросы с любых доменов (для разработки):

```javascript
app.use(cors())  // Без аргументов — разрешает все домены
```

> Если у тебя уже `cors()` без аргументов — ничего менять не нужно.

---

## Урок 17.4: Запуск туннеля ✅

### Вариант A: Проксировать Frontend (рекомендуется)

В этом варианте ngrok пробрасывает Vite dev server. Vite сам проксирует API-запросы на backend. Один туннель — всё работает.

**Шаг 1:** Запусти все сервисы (каждый в отдельном терминале):

```bash
# Терминал 1: Ollama (если не запущена)
ollama serve

# Терминал 2: Backend
cd backend
npm run dev

# Терминал 3: Frontend
cd frontend
npm run dev
```

**Шаг 2:** Открой ещё один терминал и запусти ngrok:

```bash
ngrok http 5173
```

Ты увидишь что-то вроде:

```
Session Status    online
Forwarding        https://a1b2c3d4.ngrok-free.app -> http://localhost:5173
```

**Шаг 3:** Открой URL `https://a1b2c3d4.ngrok-free.app` на телефоне или другом ПК. Готово!

### Вариант B: Два туннеля (если не используешь прокси Vite)

Если по какой-то причине ты не хочешь проксировать через Vite:

```bash
# Терминал 4: Туннель для backend
ngrok http 3000

# Терминал 5: Туннель для frontend
ngrok http 5173
```

Тогда в `frontend/src/api/index.js` нужно указать полный URL backend-туннеля:

```javascript
const api = axios.create({
  baseURL: 'https://xyz789.ngrok-free.app/api'  // URL из ngrok для backend
})
```

> Вариант A проще — один туннель вместо двух.

---

## Урок 17.5: Особенности и ограничения ✅

### Бесплатный план ngrok

- URL **меняется** при каждом перезапуске ngrok (случайный поддомен)
- Для **постоянного URL** нужен платный план ($8/мес) или использовать бесплатный статический домен (ngrok даёт 1 бесплатно)
- Максимум **20 подключений в минуту** на бесплатном плане
- При первом заходе ngrok показывает страницу-предупреждение ("Visit Site") — это нормально, нажми кнопку

### Получить бесплатный статический домен

ngrok даёт один бесплатный статический домен:

1. Перейди в https://dashboard.ngrok.com/domains
2. Нажми "New Domain" — получишь домен вида `кое-что.ngrok-free.app`
3. Запускай ngrok с этим доменом:

```bash
ngrok http --domain=твой-домен.ngrok-free.app 5173
```

Теперь URL не меняется при перезапуске.

### Важные моменты

| Вопрос | Ответ |
|--------|-------|
| Работает из другой Wi-Fi? | Да, из любой сети с интернетом |
| Работает с мобильного интернета? | Да |
| Работает из другого города/страны? | Да |
| Нужен ли белый IP? | Нет, ngrok решает эту проблему |
| ПК должен быть включён? | Да, и backend, и Ollama должны работать |
| Речь будет работать? | Да, ngrok даёт HTTPS, а Web Speech API работает на HTTPS |
| Безопасно ли это? | Для разработки — да. Для продакшена лучше VPS |

### Альтернативы ngrok

- **Cloudflare Tunnel** — бесплатно, стабильный URL, но сложнее настройка
- **Tailscale** — VPN-сеть между устройствами, работает без публичного URL (нужно приложение на каждом устройстве)
- **localhost.run** — `ssh -R 80:localhost:5173 nokey@localhost.run` — без установки, но менее стабильно

### Проверка

1. Запусти backend, frontend и ngrok
2. Скопируй ngrok URL
3. Открой URL **с телефона** (через мобильный интернет, не домашний Wi-Fi!)
4. Залогинься в свой аккаунт
5. Попробуй записать голос и создать ТЗ
6. Убедись что данные сохранились (открой с ПК — ТЗ на месте)

---

# ЧАСТЬ 18: АДМИН-ПАНЕЛЬ ✅

## Урок 18.1: Бэкенд — API для администратора ✅

### Теория

У нас уже есть поле `role` в модели User (по умолчанию `"manager"`) и middleware `requireRole` в `middleware/auth.js`. Осталось создать API-эндпоинты, доступные только администратору.

Админ сможет:
- Видеть список всех пользователей
- Смотреть проекты любого пользователя
- Смотреть ТЗ любого пользователя

> **Важно:** обычные пользователи видят только свои проекты и ТЗ (фильтр `userId: req.userId`). Админ видит всё — без фильтра по userId.

### Шаг 1: Создай контроллер админа

Создай файл `backend/src/controllers/adminController.js`:

```javascript
const prisma = require('../db')

/**
 * GET /api/admin/users
 *
 * Список всех пользователей с количеством проектов и ТЗ
 */
async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            specifications: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(users)
  } catch (error) {
    console.error('Ошибка получения пользователей:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

/**
 * GET /api/admin/users/:id
 *
 * Детали пользователя с его проектами
 */
async function getUserById(req, res) {
  try {
    const id = parseInt(req.params.id)

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        projects: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { specifications: true }
            }
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    res.json(user)
  } catch (error) {
    console.error('Ошибка получения пользователя:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

/**
 * GET /api/admin/users/:id/specifications
 *
 * Все ТЗ пользователя с секциями и пунктами
 */
async function getUserSpecifications(req, res) {
  try {
    const userId = parseInt(req.params.id)

    const specifications = await prisma.specification.findMany({
      where: { userId },
      include: {
        project: {
          select: { name: true }
        },
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(specifications)
  } catch (error) {
    console.error('Ошибка получения ТЗ пользователя:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

/**
 * PATCH /api/admin/users/:id/role
 *
 * Изменить роль пользователя
 * Body: { role: "admin" | "manager" | "executor" }
 */
async function changeRole(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { role } = req.body

    const validRoles = ['admin', 'manager', 'executor']
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: `Невалидная роль. Допустимые: ${validRoles.join(', ')}`
      })
    }

    // Нельзя менять роль самому себе
    if (id === req.userId) {
      return res.status(400).json({ error: 'Нельзя менять свою роль' })
    }

    const updated = await prisma.user.update({
      where: { id },
      select: { id: true, name: true, email: true, role: true }
    })

    res.json(updated)
  } catch (error) {
    console.error('Ошибка смены роли:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

module.exports = { getUsers, getUserById, getUserSpecifications, changeRole }
```

> **`_count`** — специальное поле Prisma, которое считает количество связанных записей без загрузки самих данных. Это эффективнее, чем загружать все проекты и считать `projects.length`.

> **`select`** вместо `include` — мы явно выбираем поля, чтобы НЕ отдавать пароль (`password`) в API.

### Шаг 2: Создай роуты админа

Создай файл `backend/src/routes/admin.js`:

```javascript
const express = require('express')
const { authenticate, requireRole } = require('../middleware/auth')
const {
  getUsers,
  getUserById,
  getUserSpecifications,
  changeRole
} = require('../controllers/adminController')

const router = express.Router()

// Все роуты: авторизация + только admin
router.use(authenticate)
router.use(requireRole('admin'))

router.get('/users', getUsers)
router.get('/users/:id', getUserById)
router.get('/users/:id/specifications', getUserSpecifications)
router.patch('/users/:id/role', changeRole)

module.exports = router
```

> **`router.use(requireRole('admin'))`** — все роуты в этом файле доступны только пользователям с `role: "admin"`. Остальные получат 403 "Недостаточно прав".

### Шаг 3: Подключи роуты в index.js

В файле `backend/src/index.js` добавь:

```javascript
const adminRoutes = require('./routes/admin')

// ... после остальных app.use() ...
app.use('/api/admin', adminRoutes)
```

### Шаг 4: Сделай себя админом

Через Prisma Studio или SQL-запрос измени свою роль:

```bash
npx prisma studio
```

В таблице `User` найди свою запись и измени `role` на `admin`.

Или через SQL:

```sql
UPDATE User SET role = 'admin' WHERE email = 'твой@email.com';
```

### Проверка

Протестируй через Postman или curl:

```bash
# Список пользователей (нужен токен админа)
curl -H "Authorization: Bearer ТВОЙ_ТОКЕН" http://localhost:3000/api/admin/users

# Детали пользователя с проектами
curl -H "Authorization: Bearer ТВОЙ_ТОКЕН" http://localhost:3000/api/admin/users/1

# ТЗ пользователя
curl -H "Authorization: Bearer ТВОЙ_ТОКЕН" http://localhost:3000/api/admin/users/1/specifications
```

Если зайти с обычным токеном (role: manager) — получишь 403.

---

## Урок 18.2: Фронтенд — страница списка пользователей ✅

### Теория

Админ-панель будет состоять из двух страниц:
1. **AdminUsersPage** — список пользователей с их статистикой
2. **AdminUserPage** — детали пользователя: его проекты и ТЗ

Доступ к админ-страницам должен быть только у пользователей с `role: "admin"`. Мы спрячем ссылки в навигации и добавим проверку в роутере.

### Шаг 1: Страница списка пользователей

Создай файл `frontend/src/pages/AdminUsersPage.vue`:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const users = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response = await api.get('/admin/users')
    users.value = response.data
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
})

// Цвета ролей
const roleMap = {
  admin: { label: 'Админ', color: 'bg-red-100 text-red-700' },
  manager: { label: 'Менеджер', color: 'bg-blue-100 text-blue-700' },
  executor: { label: 'Исполнитель', color: 'bg-green-100 text-green-700' }
}
</script>

<template>
  <div>
    <h1 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Пользователи</h1>

    <div v-if="loading" class="text-gray-500">Загрузка...</div>
    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded">{{ error }}</div>

    <div v-else-if="users.length === 0" class="text-center py-12 text-gray-500">
      Пользователей пока нет
    </div>

    <div v-else class="space-y-3">
      <router-link v-for="user in users" :key="user.id"
        :to="`/admin/users/${user.id}`"
        class="block bg-white rounded-lg shadow p-4 sm:p-5 hover:shadow-md transition-shadow">

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold">{{ user.name }}</h3>
              <span :class="['text-xs px-2 py-0.5 rounded-full',
                roleMap[user.role]?.color || 'bg-gray-200']">
                {{ roleMap[user.role]?.label || user.role }}
              </span>
            </div>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>

          <div class="flex gap-4 text-sm text-gray-500">
            <span>{{ user._count.projects }} проектов</span>
            <span>{{ user._count.specifications }} ТЗ</span>
          </div>
        </div>

        <p class="text-xs text-gray-400 mt-2">
          Зарегистрирован: {{ new Date(user.createdAt).toLocaleDateString('ru') }}
        </p>
      </router-link>
    </div>
  </div>
</template>
```

### Шаг 2: Добавь роут

В файле `frontend/src/router/index.js` добавь роут:

```javascript
{
  path: '/admin/users',
  component: () => import('../pages/AdminUsersPage.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
}
```

> **`meta: { requiresAdmin: true }`** — используем мета-поле для проверки прав в navigation guard.

### Шаг 3: Добавь проверку прав в роутер

В файле `frontend/src/router/index.js` обнови `beforeEach` guard:

```javascript
router.beforeEach((to, from, next) => {
  const { token, user } = authStore

  // Если нужна авторизация и нет токена — на логин
  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }

  // Если нужен админ и пользователь не админ — на дашборд
  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    return next('/dashboard')
  }

  next()
})
```

### Шаг 4: Добавь ссылку в навигацию

В файле `frontend/src/components/AppLayout.vue` добавь ссылку "Админка" только для админов.

В десктоп навигации (внутри `<div class="hidden md:flex gap-4">`):

```html
<router-link v-if="authStore.user?.role === 'admin'" to="/admin/users"
             class="text-gray-600 hover:text-blue-500 text-sm">
  Админка
</router-link>
```

В мобильном меню (внутри `<div v-if="menuOpen" ...>`):

```html
<router-link v-if="authStore.user?.role === 'admin'" to="/admin/users"
             @click="closeMenu"
             class="block text-gray-600 hover:text-blue-500">
  Админка
</router-link>
```

### Проверка

1. Убедись что твоя роль `admin` (Prisma Studio)
2. Перелогинься (чтобы токен содержал новую роль)
3. В навигации появится ссылка "Админка"
4. Открой — увидишь список пользователей с количеством проектов и ТЗ

---

## Урок 18.3: Фронтенд — страница пользователя для админа ✅

### Теория

При клике на пользователя из списка админ переходит на страницу с деталями: проекты и ТЗ этого пользователя. Также можно менять роль пользователя.

### Шаг 1: Страница деталей пользователя

Создай файл `frontend/src/pages/AdminUserPage.vue`:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const user = ref(null)
const specs = ref([])
const loading = ref(true)
const error = ref('')

// Загрузка данных пользователя и его ТЗ
onMounted(async () => {
  try {
    const [userRes, specsRes] = await Promise.all([
      api.get(`/admin/users/${route.params.id}`),
      api.get(`/admin/users/${route.params.id}/specifications`)
    ])
    user.value = userRes.data
    specs.value = specsRes.data
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
})

// Смена роли
async function changeRole(newRole) {
  try {
    await api.patch(`/admin/users/${route.params.id}/role`, { role: newRole })
    user.value.role = newRole
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка смены роли'
  }
}

// Цвета ролей
const roleMap = {
  admin: { label: 'Админ', color: 'bg-red-100 text-red-700' },
  manager: { label: 'Менеджер', color: 'bg-blue-100 text-blue-700' },
  executor: { label: 'Исполнитель', color: 'bg-green-100 text-green-700' }
}

function formatTime(minutes) {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} мин`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} ч ${m} мин` : `${h} ч`
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="loading" class="text-center py-12 text-gray-500">Загрузка...</div>
    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded">{{ error }}</div>

    <div v-else-if="user">
      <!-- Навигация назад -->
      <router-link to="/admin/users"
        class="text-blue-500 hover:text-blue-700 text-sm mb-4 inline-block">
        &larr; Все пользователи
      </router-link>

      <!-- Карточка пользователя -->
      <div class="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h1 class="text-xl sm:text-2xl font-bold">{{ user.name }}</h1>
              <span :class="['text-xs px-2 py-0.5 rounded-full',
                roleMap[user.role]?.color || 'bg-gray-200']">
                {{ roleMap[user.role]?.label || user.role }}
              </span>
            </div>
            <p class="text-gray-500">{{ user.email }}</p>
            <p class="text-xs text-gray-400 mt-1">
              Зарегистрирован: {{ new Date(user.createdAt).toLocaleDateString('ru') }}
            </p>
          </div>

          <!-- Смена роли -->
          <div class="flex flex-wrap gap-2">
            <button v-for="(info, role) in roleMap" :key="role"
              :disabled="user.role === role"
              @click="changeRole(role)"
              :class="['text-xs px-3 py-1.5 rounded', info.color,
                user.role === role ? 'opacity-50 cursor-default' : 'hover:opacity-80 cursor-pointer']">
              {{ info.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Проекты -->
      <h2 class="text-lg font-semibold mb-3">
        Проекты ({{ user.projects.length }})
      </h2>

      <div v-if="user.projects.length === 0"
        class="bg-white rounded-lg shadow p-6 text-center text-gray-500 mb-6">
        Проектов нет
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div v-for="project in user.projects" :key="project.id"
          class="bg-white rounded-lg shadow p-4">
          <h3 class="font-semibold">{{ project.name }}</h3>
          <p v-if="project.description" class="text-sm text-gray-500 mt-1">
            {{ project.description }}
          </p>
          <p class="text-xs text-gray-400 mt-2">
            {{ project._count.specifications }} ТЗ &middot;
            {{ new Date(project.createdAt).toLocaleDateString('ru') }}
          </p>
        </div>
      </div>

      <!-- ТЗ пользователя -->
      <h2 class="text-lg font-semibold mb-3">
        Технические задания ({{ specs.length }})
      </h2>

      <div v-if="specs.length === 0"
        class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        ТЗ нет
      </div>

      <div v-else class="space-y-3">
        <div v-for="spec in specs" :key="spec.id"
          class="bg-white rounded-lg shadow p-4 sm:p-5">

          <div class="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
            <div>
              <h3 class="font-semibold">{{ spec.title }}</h3>
              <p class="text-sm text-gray-400">
                Проект: {{ spec.project?.name || '—' }} &middot;
                {{ spec.sections.length }} разделов &middot;
                {{ new Date(spec.createdAt).toLocaleDateString('ru') }}
              </p>
            </div>
            <span class="text-sm text-gray-500">
              {{ formatTime(spec.sections.reduce((sum, s) =>
                sum + s.items.reduce((iSum, item) => iSum + (item.timeEstimate || 0), 0), 0)) }}
            </span>
          </div>

          <!-- Секции и пункты (сворачиваемые) -->
          <details v-for="(section, sIdx) in spec.sections" :key="section.id"
            class="border-t pt-2 mt-2">
            <summary class="cursor-pointer text-sm font-medium hover:text-blue-500">
              {{ sIdx + 1 }}. {{ section.title }}
              <span class="text-gray-400 font-normal">({{ section.items.length }} пунктов)</span>
            </summary>
            <div class="pl-4 mt-2 space-y-1">
              <div v-for="(item, iIdx) in section.items" :key="item.id"
                class="flex items-start gap-2 text-sm">
                <span class="text-gray-400 shrink-0">{{ sIdx + 1 }}.{{ iIdx + 1 }}</span>
                <span class="flex-1 break-words">{{ item.content }}</span>
                <span v-if="item.timeEstimate"
                  class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded shrink-0">
                  {{ formatTime(item.timeEstimate) }}
                </span>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>
```

> **`<details>` + `<summary>`** — нативный HTML для сворачиваемых блоков. Не нужен JavaScript — браузер сам обрабатывает открытие/закрытие. Удобно когда у пользователя много секций.

> **`Promise.all`** — загружаем данные пользователя и его ТЗ параллельно, а не последовательно. Два запроса вместо одного по очереди — быстрее.

### Шаг 2: Добавь роут

В файле `frontend/src/router/index.js`:

```javascript
{
  path: '/admin/users/:id',
  component: () => import('../pages/AdminUserPage.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
}
```

### Проверка

1. Открой Админку → список пользователей
2. Кликни на пользователя — увидишь его проекты и ТЗ
3. Разверни секцию ТЗ (клик на заголовок) — увидишь пункты
4. Попробуй сменить роль пользователя кнопками
5. Проверь что обычный пользователь (manager) не может открыть /admin/users — его редиректит на дашборд

---

# ЧАСТЬ 19: ЗАГРУЗКА ДОКУМЕНТОВ ДЛЯ ГЕНЕРАЦИИ ТЗ ✅

## Урок 19.1: Бэкенд — парсинг .txt и .docx файлов ✅

### Теория

Сейчас пользователь может отправить на генерацию ТЗ только голосовой текст. Но часто требования приходят в виде документа — `.txt` или `.docx` файл от заказчика. Добавим возможность загрузить документ, извлечь из него текст и отправить в AI.

Поток данных:
```
Пользователь загружает .txt/.docx
       ↓
Backend извлекает текст из файла
       ↓
Текст возвращается на фронтенд
       ↓
Пользователь видит текст, может его отредактировать
       ↓
Нажимает "Структурировать через AI" (как обычно)
```

Для чтения `.docx` используем библиотеку `mammoth` — она извлекает текст из Word-документов.

### Шаг 1: Установка зависимостей

```bash
cd backend
npm install mammoth multer
```

- **mammoth** — извлекает текст из .docx файлов
- **multer** — middleware для обработки загрузки файлов (multipart/form-data)

> Если `multer` уже установлен (из Части 13) — повторно ставить не нужно.

### Шаг 2: Middleware для загрузки документов

Создай файл `backend/src/middleware/uploadDoc.js`:

```javascript
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Папка для временных файлов
const uploadDir = path.join(__dirname, '../../uploads/docs')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1000)}-${file.originalname}`
    cb(null, uniqueName)
  }
})

// Разрешаем только текстовые документы
const fileFilter = (req, file, cb) => {
  const allowed = [
    'text/plain',                                                          // .txt
    'application/msword',                                                   // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ]

  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Допустимые форматы: .txt, .doc, .docx'), false)
  }
}

const uploadDoc = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024  // 10 MB максимум
  }
})

module.exports = uploadDoc
```

> **Почему отдельный middleware, а не тот же что для вложений?** У них разные папки, разные фильтры файлов и разные лимиты. Проще держать раздельно.

### Шаг 3: Сервис извлечения текста

Создай файл `backend/src/services/documentService.js`:

```javascript
const fs = require('fs')
const mammoth = require('mammoth')
const path = require('path')

/**
 * Извлекает текст из загруженного файла
 *
 * @param {string} filePath - путь к файлу на диске
 * @param {string} mimetype - MIME-тип файла
 * @returns {string} извлечённый текст
 */
async function extractText(filePath, mimetype) {
  try {
    if (mimetype === 'text/plain') {
      // .txt — просто читаем как строку
      return fs.readFileSync(filePath, 'utf-8')
    }

    if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      // .docx / .doc — извлекаем текст через mammoth
      const result = await mammoth.extractRawText({ path: filePath })
      return result.value
    }

    throw new Error(`Неподдерживаемый формат: ${mimetype}`)
  } finally {
    // Удаляем временный файл после извлечения
    try {
      fs.unlinkSync(filePath)
    } catch (e) {
      console.error('Ошибка удаления временного файла:', e)
    }
  }
}

module.exports = { extractText }
```

> **Почему удаляем файл?** Нам нужен только текст из документа. Сам файл хранить не нужно — он был нужен только для парсинга. Это экономит место на диске.

> **Ограничение:** `mammoth` работает с `.docx`. Старый формат `.doc` поддерживается частично. Если нужна полная поддержка `.doc`, можно использовать `libreoffice` для конвертации, но это усложняет проект.

### Шаг 4: API-эндпоинт

Добавь в файл `backend/src/controllers/specificationController.js`:

```javascript
const { extractText } = require('../services/documentService')

/**
 * POST /api/specifications/upload-doc
 *
 * Загрузить документ и извлечь из него текст.
 * Возвращает текст, который фронтенд может показать
 * пользователю и потом отправить на AI-структурирование.
 */
async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' })
    }

    const text = await extractText(req.file.path, req.file.mimetype)

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Не удалось извлечь текст из документа' })
    }

    res.json({
      text: text.trim(),
      filename: req.file.originalname
    })
  } catch (error) {
    console.error('Ошибка обработки документа:', error)
    res.status(500).json({ error: error.message || 'Ошибка обработки документа' })
  }
}
```

Добавь `uploadDocument` в `module.exports`:

```javascript
module.exports = { generate, getById, getAll, update, uploadDocument }
```

### Шаг 5: Роут

В файле `backend/src/routes/specifications.js`:

```javascript
const uploadDoc = require('../middleware/uploadDoc')
const { generate, getById, getAll, update, uploadDocument } = require('../controllers/specificationController')

// ... существующие роуты ...
router.post('/upload-doc', uploadDoc.single('document'), uploadDocument)
```

> **`uploadDoc.single('document')`** — принимаем один файл из поля формы с именем `document`.

### Проверка

Протестируй через Postman:
1. Метод: POST
2. URL: `http://localhost:3000/api/specifications/upload-doc`
3. Header: `Authorization: Bearer ТВОЙ_ТОКЕН`
4. Body → form-data → ключ `document` (тип File) → выбери .txt или .docx файл
5. В ответе должен прийти `{ text: "...", filename: "..." }`

---

## Урок 19.2: Фронтенд — загрузка документа на странице записи ✅

### Теория

Добавим на страницу записи (`RecordPage`) вторую опцию — загрузить документ. Пользователь сможет:
1. Записать голос **или** загрузить файл **или** сделать и то и другое
2. Текст из голоса и текст из файла объединятся
3. Результат отправится на страницу создания ТЗ

### Шаг 1: Компонент загрузки документа

Создай файл `frontend/src/components/DocumentUploader.vue`:

```vue
<script setup>
import { ref } from 'vue'
import api from '../api'

const emit = defineEmits(['textExtracted'])

const file = ref(null)
const isUploading = ref(false)
const error = ref('')
const extractedFilename = ref('')

// Обработка выбора файла
function onFileChange(event) {
  const selected = event.target.files[0]
  if (!selected) return

  // Проверка расширения на фронтенде (дополнительная)
  const allowedExtensions = ['.txt', '.doc', '.docx']
  const ext = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase()

  if (!allowedExtensions.includes(ext)) {
    error.value = `Недопустимый формат. Допустимые: ${allowedExtensions.join(', ')}`
    file.value = null
    return
  }

  error.value = ''
  file.value = selected
}

// Отправка файла на сервер
async function upload() {
  if (!file.value) return

  isUploading.value = true
  error.value = ''

  try {
    // FormData — специальный объект для отправки файлов
    // Нужен потому что JSON не умеет передавать бинарные данные
    const formData = new FormData()
    formData.append('document', file.value)

    const response = await api.post('/specifications/upload-doc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    extractedFilename.value = response.data.filename
    emit('textExtracted', response.data.text)

    // Сбрасываем выбор файла
    file.value = null
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка загрузки документа'
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="p-4 sm:p-6 max-w-2xl mx-auto">
    <h2 class="text-lg sm:text-xl font-bold mb-4">Загрузить документ</h2>
    <p class="text-sm text-gray-500 mb-4">
      Загрузите файл с требованиями (.txt, .doc, .docx) — текст будет извлечён автоматически.
    </p>

    <!-- Ошибка -->
    <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
      {{ error }}
    </div>

    <!-- Успех -->
    <div v-if="extractedFilename" class="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
      Текст извлечён из файла "{{ extractedFilename }}"
    </div>

    <!-- Выбор файла -->
    <div class="flex flex-col sm:flex-row gap-3">
      <label class="flex-1">
        <input type="file"
          accept=".txt,.doc,.docx"
          @change="onFileChange"
          class="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            cursor-pointer" />
      </label>

      <button @click="upload"
        :disabled="!file || isUploading"
        class="px-4 py-2 rounded text-white text-sm font-medium
          bg-purple-500 hover:bg-purple-600
          disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
        {{ isUploading ? 'Извлечение текста...' : 'Загрузить' }}
      </button>
    </div>

    <p class="text-xs text-gray-400 mt-2">
      Максимальный размер: 10 МБ. Форматы: .txt, .doc, .docx
    </p>
  </div>
</template>
```

> **`FormData`** — встроенный браузерный объект для отправки файлов. Обычный JSON не может передать бинарные данные файла. `FormData` кодирует данные в формат `multipart/form-data`, который сервер (multer) умеет разбирать.

### Шаг 2: Обнови RecordPage — объедини голос и документ

Обнови файл `frontend/src/pages/RecordPage.vue`:

```vue
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SpeechRecorder from '../components/SpeechRecorder.vue'
import DocumentUploader from '../components/DocumentUploader.vue'

const router = useRouter()

// Текст из голоса и из документа хранятся отдельно
const voiceText = ref('')
const docText = ref('')

// Голос готов
function onTranscriptReady(text) {
  voiceText.value = text
}

// Документ обработан
function onTextExtracted(text) {
  docText.value = text
}

// Объединить и перейти к созданию ТЗ
function proceed() {
  // Собираем текст из обоих источников
  const parts = []
  if (voiceText.value.trim()) parts.push(voiceText.value.trim())
  if (docText.value.trim()) parts.push(docText.value.trim())

  const combined = parts.join('\n\n')

  if (!combined) {
    alert('Запишите голос или загрузите документ')
    return
  }

  sessionStorage.setItem('voiceText', combined)
  router.push('/specifications/new')
}
</script>

<template>
  <div>
    <!-- Голосовой ввод -->
    <SpeechRecorder @transcriptReady="onTranscriptReady" />

    <!-- Разделитель -->
    <div class="max-w-2xl mx-auto px-4 sm:px-6">
      <div class="flex items-center gap-4 my-2">
        <div class="flex-1 border-t border-gray-300"></div>
        <span class="text-sm text-gray-400">или</span>
        <div class="flex-1 border-t border-gray-300"></div>
      </div>
    </div>

    <!-- Загрузка документа -->
    <DocumentUploader @textExtracted="onTextExtracted" />

    <!-- Текст из документа (предпросмотр) -->
    <div v-if="docText" class="max-w-2xl mx-auto px-4 sm:px-6 mb-4">
      <div class="bg-white border rounded p-3 sm:p-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium">Текст из документа:</span>
          <button @click="docText = ''" class="text-red-400 hover:text-red-600 text-xs">
            Убрать
          </button>
        </div>
        <p class="text-sm text-gray-700 whitespace-pre-line max-h-40 overflow-y-auto">
          {{ docText }}
        </p>
      </div>
    </div>

    <!-- Кнопка "Далее" — если есть хоть какой-то текст -->
    <div v-if="voiceText || docText"
      class="max-w-2xl mx-auto px-4 sm:px-6 mb-6">
      <button @click="proceed"
        class="w-full py-3 rounded text-white font-medium
          bg-green-500 hover:bg-green-600 text-sm sm:text-base">
        Создать ТЗ
        <span v-if="voiceText && docText" class="text-green-200 ml-1">
          (голос + документ)
        </span>
      </button>
    </div>
  </div>
</template>
```

> **Зачем хранить голос и документ отдельно?** Чтобы пользователь мог использовать только один источник или оба сразу. При объединении текст из голоса идёт первым, из документа — вторым, разделённые пустой строкой.

> **`whitespace-pre-line`** — CSS-свойство, которое сохраняет переносы строк из текста документа. Без него весь текст слипнется в одну строку.

### Шаг 3: Обнови SpeechRecorder

Сейчас кнопка "Создать ТЗ" внутри `SpeechRecorder` сама переходит на страницу. Нужно убрать дублирование — теперь `RecordPage` управляет навигацией.

В `SpeechRecorder.vue` кнопка "Создать ТЗ" уже вызывает `emit('transcriptReady', transcript.value)` — это правильно. Но если пользователь загружает только документ (без голоса), кнопка "Создать ТЗ" не появится, потому что `transcript` пустой. Поэтому мы добавили отдельную кнопку "Создать ТЗ" в `RecordPage` — она появляется когда есть хоть какой-то текст (голос и/или документ).

### Проверка

1. Открой страницу "Записать"
2. Загрузи `.txt` или `.docx` файл → текст появится в предпросмотре
3. Нажми "Создать ТЗ" → текст из документа попадёт на страницу создания
4. Попробуй: запиши голос + загрузи документ → нажми "Создать ТЗ" → на странице создания будет объединённый текст
5. Нажми "Структурировать через AI" → AI обработает текст из обоих источников

---

# ЧАСТЬ 20: ВЫБОР CRM-СИСТЕМЫ ДЛЯ ОЦЕНКИ ТЗ ✅

## Урок 20.1: Бэкенд — CRM-контекст в AI-промпте ✅

### Теория

Оценка времени и структура ТЗ сильно зависят от платформы, на которой ведётся разработка. Создание каталога в Bitrix24 — это одно, а в 1С-Битрикс или в самописном решении — совсем другое. Если AI знает CRM-систему, он даст более точные оценки.

Поток:
```
Пользователь выбирает CRM (например Bitrix24)
       ↓
Фронтенд отправляет { text, crm: "Bitrix24" }
       ↓
Backend добавляет CRM в промпт для AI
       ↓
AI оценивает задачи с учётом специфики платформы
```

### Шаг 1: Список CRM-систем

Создай файл `backend/src/config/crmSystems.js`:

```javascript
/**
 * Список CRM-систем с описанием для AI.
 *
 * description — краткое описание платформы,
 * которое добавляется в промпт для AI,
 * чтобы он понимал контекст при оценке задач.
 */
const crmSystems = [
  {
    id: 'bitrix24',
    name: 'Битрикс24',
    description: 'Облачная CRM-система Битрикс24. Разработка через REST API, бизнес-процессы, CRM-формы, роботы, вебхуки. Есть маркетплейс приложений.'
  },
  {
    id: '1c-bitrix',
    name: '1С-Битрикс',
    description: 'CMS 1С-Битрикс для сайтов и интернет-магазинов. Разработка на PHP, компонентная архитектура, инфоблоки, модули, API. Нужен сервер.'
  },
  {
    id: 'amocrm',
    name: 'amoCRM',
    description: 'Облачная CRM amoCRM. Интеграция через REST API и виджеты. Фокус на воронке продаж, сделках, контактах.'
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    description: 'CMS WordPress. Разработка плагинов и тем на PHP, REST API, хуки и фильтры, WooCommerce для e-commerce.'
  },
  {
    id: 'custom',
    name: 'Самописное решение',
    description: 'Разработка с нуля. Свободный выбор стека, архитектуры, БД. Полный контроль, но больше времени на реализацию.'
  },
  {
    id: 'none',
    name: 'Не указана',
    description: null
  }
]

module.exports = crmSystems
```

> Этот список легко расширять — просто добавь объект с `id`, `name` и `description`. Фронтенд и бэкенд подхватят автоматически.

### Шаг 2: API-эндпоинт для получения списка CRM

Создай файл `backend/src/routes/crm.js`:

```javascript
const express = require('express')
const { authenticate } = require('../middleware/auth')
const crmSystems = require('../config/crmSystems')

const router = express.Router()

/**
 * GET /api/crm/systems
 *
 * Возвращает список доступных CRM-систем.
 * Фронтенд использует его для выпадающего списка.
 */
router.get('/systems', authenticate, (req, res) => {
  // Отдаём только id и name (description — для промпта, не для UI)
  const list = crmSystems.map(crm => ({
    id: crm.id,
    name: crm.name
  }))
  res.json(list)
})

module.exports = router
```

### Шаг 3: Подключи роут в index.js

В файле `backend/src/index.js`:

```javascript
const crmRoutes = require('./routes/crm')

app.use('/api/crm', crmRoutes)
```

### Шаг 4: Обнови AI-сервис — добавь CRM в промпт

В файле `backend/src/services/aiService.js` измени сигнатуру функции и промпт:

```javascript
const crmSystems = require('../config/crmSystems')

/**
 * @param {string} text — сырой текст
 * @param {string} [crmId] — ID выбранной CRM-системы (опционально)
 */
async function structureText(text, crmId) {
    // Находим CRM и формируем контекст
    const crm = crmId ? crmSystems.find(c => c.id === crmId) : null
    const crmContext = crm?.description
      ? `\n\nПЛАТФОРМА РАЗРАБОТКИ: ${crm.name}\n${crm.description}\nУчитывай специфику этой платформы при оценке времени и формулировке задач. Используй терминологию платформы где уместно.`
      : ''

    const prompt = `
    Ты — опытный системный аналитик. Твоя задача — превратить сырой текст (запись речи заказчика) в структурированное техническое задание на разработку.${crmContext}
            ПРАВИЛА:
            - Разбей требования заказчика на логические разделы (например: "Каталог товаров", "Корзина", "Оплата", "Личный кабинет")
            - В каждом разделе выдели конкретные задачи для разработчика
            - Каждой задаче дай оценку времени в минутах (реалистичную для junior/middle разработчика)
            - Придумай короткое название ТЗ, отражающее суть проекта
            - НЕ описывай процесс анализа, описывай РЕЗУЛЬТАТ — что нужно разработать
            - Отвечай ТОЛЬКО на русском языке

            Верни ТОЛЬКО валидный JSON, без markdown-обёртки, без пояснений до или после, строго в формате:
            {
              "title": "Название ТЗ",
              "sections": [
                {
                  "title": "Название раздела",
                  "items": [
                    {
                      "content": "Описание задачи для разработчика",
                      "timeEstimate": 60
                    }
                  ]
                }
              ]
            }

            Текст от заказчика:
${text}`

    // ... остальной код (fetch к Ollama) без изменений
```

> **Зачем `crmContext` добавляется перед ПРАВИЛАМИ?** Потому что AI обращает больше внимания на начало промпта. Контекст платформы — это рамка, в которой AI должен думать. Правила — это формат ответа.

### Шаг 5: Обнови роут AI — прокинь CRM

В файле `backend/src/routes/ai.js`:

```javascript
router.post('/structure', authenticate, async (req, res) => {
  try {
    const { text, crm } = req.body
    if (!text || !text.trim()) {
      return res.status(400).json({
        error: 'Текст не может быть пустым'
      })
    }
    const structured = await structureText(text, crm)
    res.json(structured)
  } catch (error) {
    console.error('Ошибка AI-структурирования:', error)
    res.status(500).json({ error: error.message })
  }
})
```

Единственное изменение: `req.body` теперь деструктурируется как `{ text, crm }`, и `crm` передаётся в `structureText`.

### Проверка

```bash
# Без CRM (как раньше)
curl -X POST http://localhost:3000/api/ai/structure \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Нужен интернет-магазин"}'

# С CRM
curl -X POST http://localhost:3000/api/ai/structure \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Нужен интернет-магазин", "crm": "1c-bitrix"}'
```

Сравни ответы — с CRM задачи будут содержать терминологию платформы (инфоблоки, компоненты, модули) и более точные оценки.

---

## Урок 20.2: Фронтенд — выбор CRM на странице создания ТЗ ✅

### Теория

Добавим выпадающий список CRM-систем на страницу создания ТЗ (`NewSpecificationPage`). Выбранная CRM отправляется вместе с текстом при нажатии "Структурировать через AI".

### Шаг 1: Обнови NewSpecificationPage

В файле `frontend/src/pages/NewSpecificationPage.vue`:

**В `<script setup>`** добавь загрузку CRM и переменную:

```javascript
const crmSystems = ref([])       // Список CRM-систем
const selectedCrm = ref('none')  // Выбранная CRM (по умолчанию "Не указана")

onMounted(async () => {
  voiceText.value = sessionStorage.getItem('voiceText') || ''

  try {
    // Загружаем проекты и CRM-системы параллельно
    const [projectsRes, crmRes] = await Promise.all([
      api.get('/projects'),
      api.get('/crm/systems')
    ])
    projects.value = projectsRes.data
    crmSystems.value = crmRes.data
  } catch (e) {
    console.error(e)
  }
})
```

**Обнови функцию `structureWithAI`** — передай CRM:

```javascript
async function structureWithAI() {
  if (!voiceText.value.trim()) {
    error.value = 'Введите или запишите текст'
    return
  }

  isStructuring.value = true
  error.value = ''

  try {
    const response = await api.post('/ai/structure', {
      text: voiceText.value,
      crm: selectedCrm.value !== 'none' ? selectedCrm.value : undefined
    })
    sections.value = response.data.sections
  } catch (e) {
    error.value = e.response?.data?.error || 'Ошибка AI-структурирования'
  } finally {
    isStructuring.value = false
  }
}
```

**В `<template>`** — добавь выпадающий список после поля "Проект":

```html
<!-- Основные поля -->
<div class="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
  <div>
    <label class="block text-sm font-medium mb-1">Название ТЗ</label>
    <input v-model="title" type="text" class="w-full border rounded px-3 py-2"
           placeholder="Например: Разработка интернет-магазина" />
  </div>

  <div>
    <label class="block text-sm font-medium mb-1">Проект</label>
    <select v-model="projectId" class="w-full border rounded px-3 py-2">
      <option :value="null" disabled>Выберите проект</option>
      <option v-for="p in projects" :key="p.id" :value="p.id">
        {{ p.name }}
      </option>
    </select>
  </div>

  <div>
    <label class="block text-sm font-medium mb-1">CRM / Платформа</label>
    <select v-model="selectedCrm" class="w-full border rounded px-3 py-2">
      <option v-for="crm in crmSystems" :key="crm.id" :value="crm.id">
        {{ crm.name }}
      </option>
    </select>
    <p class="text-xs text-gray-400 mt-1">
      AI учтёт специфику платформы при оценке задач и формулировках
    </p>
  </div>
</div>
```

### Шаг 2: Отображение выбранной CRM на странице ТЗ (опционально)

Если хочешь сохранять информацию о CRM в БД, нужно:

1. Добавить поле `crm` в модель `Specification` в `schema.prisma`:

```prisma
model Specification {
  id        Int      @id @default(autoincrement())
  title     String
  crm       String?  // ID CRM-системы (опционально)
  status    String   @default("draft")
  // ... остальные поля
}
```

2. Применить миграцию:

```bash
npx prisma migrate dev --name add-spec-crm
```

3. Передавать `crm` при сохранении в `specificationController.js` → `generate()`:

```javascript
const { text, projectId, crm } = req.body

// ... в prisma.specification.create:
data: {
  title: structured.title || 'Без названия',
  crm: crm || null,
  projectId,
  userId: req.userId,
  // ...
}
```

4. Показывать на `SpecificationPage.vue`:

```html
<span v-if="spec.crm" class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
  {{ spec.crm }}
</span>
```

### Проверка

1. Открой страницу создания ТЗ
2. Выбери CRM (например "Битрикс24")
3. Введи текст и нажми "Структурировать через AI"
4. Проверь что AI использует терминологию выбранной платформы
5. Попробуй то же самое с "Самописное решение" — оценки времени будут другими
6. Выбери "Не указана" — AI будет работать как раньше, без контекста платформы

### Добавление новых CRM

Чтобы добавить новую CRM — просто добавь объект в `backend/src/config/crmSystems.js`:

```javascript
{
  id: 'megaplan',
  name: 'Мегаплан',
  description: 'CRM Мегаплан. Управление задачами, сделками, клиентами. Интеграция через REST API.'
}
```

Фронтенд подхватит автоматически — список загружается с сервера.

---

# ЧАСТЬ 21: УПРАВЛЕНИЕ ПРОМПТАМИ И КАСТОМИЗАЦИЯ AI ✅

## Урок 21.1: Модель Prompt в базе данных

### Зачем

Сейчас промпт для AI захардкожен в `aiService.js`. Пользователи не могут настроить инструкцию под свои задачи — например, один хочет ТЗ для мобильных приложений, другой — для веб-сайтов. Добавим модель `Prompt` чтобы каждый пользователь мог хранить свои промпты.

### Шаг 1: Добавить модель Prompt в schema.prisma

Открой `backend/prisma/schema.prisma` и добавь новую модель:

```prisma
// ========================================
// Промпты для AI
// ========================================
model Prompt {
  id        Int      @id @default(autoincrement())
  title     String
  content   String   @db.Text
  isDefault Boolean  @default(false)
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Что тут:**
- `title` — название промпта (например "Для мобильных приложений")
- `content` — сам текст инструкции для AI (тип `@db.Text` для длинных текстов)
- `isDefault` — пометка "использовать по умолчанию"
- `userId` — привязка к пользователю (у каждого свои промпты)

### Шаг 2: Добавить связь в модель User

В модели `User` добавь поле:

```prisma
model User {
  id Int @id @default(autoincrement())
  email String @unique
  password String
  name String
  role String @default("manager")
  createdAt DateTime @default(now())

  projects Project[]
  specifications Specification[]
  prompts Prompt[]              // ← добавляем связь
}
```

### Шаг 3: Применить изменения

```bash
cd backend
npx prisma db push
```

Prisma создаст таблицу `Prompt` в MySQL и обновит клиент.

---

## Урок 21.2: Backend промптов

### Зачем

Нужен API для CRUD промптов и возможность передавать кастомный промпт при генерации ТЗ.

### Шаг 1: Вынести дефолтный промпт в константу

Открой `backend/src/services/aiService.js` и вынеси текст промпта из функции в константу:

```javascript
// ========================================
// Сервис для работы с Ollama
//
// Ollama — локальный AI-сервер
// Общение через HTTP API (REST)
// Эндпоинт: POST /api/generate
// ========================================

const OLLAMA_URL = process.env.OLLAMA_URL
const OLLAMA_MODEL = process.env.OLLAMA_MODEL

// ========================================
// Промпт по умолчанию
//
// Используется если пользователь не выбрал
// свой кастомный промпт
// ========================================
const DEFAULT_PROMPT = `Ты — опытный системный аналитик. Твоя задача — превратить сырой текст (запись речи заказчика) в структурированное техническое задание на разработку.
            ПРАВИЛА:
            - Разбей требования заказчика на логические разделы (например: "Каталог товаров", "Корзина", "Оплата", "Личный кабинет")
            - В каждом разделе выдели конкретные задачи для разработчика
            - Каждой задаче дай оценку времени в минутах (реалистичную для junior/middle разработчика)
            - Придумай короткое название ТЗ, отражающее суть проекта
            - НЕ описывай процесс анализа, описывай РЕЗУЛЬТАТ — что нужно разработать
            - Отвечай ТОЛЬКО на русском языке

            Верни ТОЛЬКО валидный JSON, без markdown-обёртки, без пояснений до или после, строго в формате:
            {
              "title": "Название ТЗ",
              "sections": [
                {
                  "title": "Название раздела",
                  "items": [
                    {
                      "content": "Описание задачи для разработчика",
                      "timeEstimate": 60
                    }
                  ]
                }
              ]
            }`
```

### Шаг 2: Изменить сигнатуру structureText

Теперь функция принимает необязательный `customPrompt`:

```javascript
async function structureText(text, customPrompt = null) {
    // Если пользователь выбрал свой промпт — используем его
    // Иначе — дефолтный промпт
    const basePrompt = customPrompt || DEFAULT_PROMPT

    const prompt = `${basePrompt}

            Текст от заказчика:
${text}`

    // ... остальной код без изменений
}

module.exports = { structureText, DEFAULT_PROMPT }
```

**Зачем экспортировать `DEFAULT_PROMPT`?** Чтобы фронтенд мог получить текст дефолтного промпта как шаблон при создании нового промпта.

### Шаг 3: Создать контроллер промптов

Создай файл `backend/src/controllers/promptController.js`:

```javascript
// ========================================
// Контроллер промптов
//
// CRUD для пользовательских промптов AI
// Каждый промпт принадлежит пользователю
// ========================================

const prisma = require('../db')
const { DEFAULT_PROMPT } = require('../services/aiService')

// ========================================
// GET /api/prompts
//
// Список промптов текущего пользователя
// Если промптов нет — возвращаем пустой массив
// (фронтенд покажет баннер "Создайте первый промпт")
// ========================================
async function getAll(req, res) {
    try {
        const prompts = await prisma.prompt.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' }
        })
        res.json(prompts)
    } catch (error) {
        console.error('Ошибка получения промптов:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

// ========================================
// POST /api/prompts
//
// Создание нового промпта
// Если isDefault: true — сбрасываем флаг у остальных
// ========================================
async function create(req, res) {
    try {
        const { title, content, isDefault } = req.body

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Название обязательно' })
        }
        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Текст промпта обязателен' })
        }

        // Если новый промпт — по умолчанию, сбрасываем флаг у остальных
        if (isDefault) {
            await prisma.prompt.updateMany({
                where: { userId: req.userId, isDefault: true },
                data: { isDefault: false }
            })
        }

        const prompt = await prisma.prompt.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                isDefault: isDefault || false,
                userId: req.userId
            }
        })

        res.status(201).json(prompt)
    } catch (error) {
        console.error('Ошибка создания промпта:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

// ========================================
// PUT /api/prompts/:id
//
// Обновление промпта
// Проверяем принадлежность пользователю
// ========================================
async function update(req, res) {
    try {
        const id = parseInt(req.params.id)
        const { title, content, isDefault } = req.body

        const existing = await prisma.prompt.findFirst({
            where: { id, userId: req.userId }
        })
        if (!existing) {
            return res.status(404).json({ error: 'Промпт не найден' })
        }

        if (isDefault) {
            await prisma.prompt.updateMany({
                where: { userId: req.userId, isDefault: true },
                data: { isDefault: false }
            })
        }

        const prompt = await prisma.prompt.update({
            where: { id },
            data: {
                title: title?.trim() || existing.title,
                content: content?.trim() || existing.content,
                isDefault: isDefault !== undefined ? isDefault : existing.isDefault
            }
        })

        res.json(prompt)
    } catch (error) {
        console.error('Ошибка обновления промпта:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

// ========================================
// DELETE /api/prompts/:id
//
// Удаление промпта
// ========================================
async function remove(req, res) {
    try {
        const id = parseInt(req.params.id)

        const existing = await prisma.prompt.findFirst({
            where: { id, userId: req.userId }
        })
        if (!existing) {
            return res.status(404).json({ error: 'Промпт не найден' })
        }

        await prisma.prompt.delete({ where: { id } })
        res.json({ message: 'Промпт удалён' })
    } catch (error) {
        console.error('Ошибка удаления промпта:', error)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
}

// ========================================
// GET /api/prompts/default-text
//
// Возвращает текст дефолтного промпта как шаблон
// ========================================
async function getDefaultText(req, res) {
    res.json({ content: DEFAULT_PROMPT })
}

module.exports = { getAll, create, update, remove, getDefaultText }
```

**Ключевой момент — логика `isDefault`:** У пользователя может быть только один промпт по умолчанию. Когда ставим `isDefault: true` новому промпту — сначала сбрасываем флаг у всех остальных через `updateMany`.

### Шаг 4: Создать роуты промптов

Создай файл `backend/src/routes/prompts.js`:

```javascript
// ========================================
// Роуты для промптов
//
// Все роуты защищены middleware authenticate
// ========================================

const express = require('express')
const { authenticate } = require('../middleware/auth')
const { getAll, create, update, remove, getDefaultText } = require('../controllers/promptController')

const router = express.Router()

router.get('/default-text', authenticate, getDefaultText)
router.get('/', authenticate, getAll)
router.post('/', authenticate, create)
router.put('/:id', authenticate, update)
router.delete('/:id', authenticate, remove)

module.exports = router
```

**Важно:** роут `/default-text` должен быть ДО `/:id`, иначе Express подумает что "default-text" — это id.

### Шаг 5: Подключить роуты в index.js

В `backend/src/index.js` добавь:

```javascript
const promptRoutes = require('./routes/prompts')

// ... после других роутов:
app.use('/api/prompts', promptRoutes)
```

### Шаг 6: Обновить роут AI-структурирования

В `backend/src/routes/ai.js` теперь принимаем `promptId`:

```javascript
const express = require('express')
const { authenticate } = require('../middleware/auth')
const { structureText } = require('../services/aiService')
const prisma = require('../db')

const router = express.Router()

router.post('/structure', authenticate, async (req,res) =>{
    try{
        const {text, promptId} = req.body
        if(!text || !text.trim()){
            return res.status(400).json({
                error: 'Текст не может быть пустым'
            })
        }

        // ========================================
        // Если передан promptId — ищем кастомный промпт в БД
        // Проверяем что промпт принадлежит пользователю
        // ========================================
        let customPrompt = null
        if (promptId) {
            const prompt = await prisma.prompt.findFirst({
                where: { id: promptId, userId: req.userId }
            })
            if (prompt) {
                customPrompt = prompt.content
            }
        }

        const structured = await structureText(text, customPrompt)
        res.json(structured)
    }catch (error) {
        console.error('Ошибка AI-структурирования:', error)
        res.status(500).json({ error: error.message })
    }
})
module.exports = router
```

### Шаг 7: Обновить контроллер спецификаций

В `backend/src/controllers/specificationController.js` аналогично принимаем `promptId`:

```javascript
async function generate(req, res) {
    try{
        const {text, projectId, promptId} = req.body  // ← добавили promptId

        // ... валидация text и projectId ...

        // ========================================
        // Если передан promptId — используем кастомный промпт
        // ========================================
        let customPrompt = null
        if (promptId) {
            const prompt = await prisma.prompt.findFirst({
                where: { id: promptId, userId: req.userId }
            })
            if (prompt) {
                customPrompt = prompt.content
            }
        }

        const structured = await structureText(text, customPrompt)  // ← передаём промпт

        // ... остальной код без изменений
    }
}
```

---

## Урок 21.3: Страница управления промптами

### Зачем

Пользователю нужен интерфейс для создания, редактирования и удаления промптов. Страница строится по паттерну `ProjectsPage.vue` — список карточек + модальное окно формы.

### Шаг 1: Создать PromptsPage.vue

Создай файл `frontend/src/pages/PromptsPage.vue`:

```vue
<script setup>
import { ref, onMounted } from "vue"
import api from "../api"

// ========================================
// Реактивные данные
// ========================================
const prompts = ref([])         // Список промптов
const loading = ref(true)       // Загрузка списка
const showForm = ref(false)     // Показать/скрыть форму
const editingId = ref(null)     // ID редактируемого промпта (null = создание)
const formData = ref({          // Данные формы
  title: '',
  content: '',
  isDefault: false
})
const formError = ref('')

// ========================================
// Загрузка промптов при открытии страницы
// ========================================
onMounted(async () => {
  await loadPrompts()
})

async function loadPrompts() {
  loading.value = true
  try {
    const response = await api.get('/prompts')
    prompts.value = response.data
  } catch (e) {
    console.error('Ошибка загрузки промптов:', e)
  } finally {
    loading.value = false
  }
}

// ========================================
// Открыть форму для создания
// Загружаем дефолтный промпт как шаблон
// ========================================
async function openCreate() {
  editingId.value = null
  formError.value = ''

  try {
    const response = await api.get('/prompts/default-text')
    formData.value = {
      title: '',
      content: response.data.content,
      isDefault: prompts.value.length === 0
    }
  } catch (e) {
    formData.value = { title: '', content: '', isDefault: false }
  }

  showForm.value = true
}

// ========================================
// Открыть форму для редактирования
// ========================================
function openEdit(prompt) {
  editingId.value = prompt.id
  formData.value = {
    title: prompt.title,
    content: prompt.content,
    isDefault: prompt.isDefault
  }
  formError.value = ''
  showForm.value = true
}

// ========================================
// Сохранить (создание или обновление)
// ========================================
async function savePrompt() {
  if (!formData.value.title.trim()) {
    formError.value = 'Введите название промпта'
    return
  }
  if (!formData.value.content.trim()) {
    formError.value = 'Введите текст промпта'
    return
  }

  try {
    if (editingId.value) {
      await api.put(`/prompts/${editingId.value}`, formData.value)
    } else {
      await api.post('/prompts', formData.value)
    }
    showForm.value = false
    await loadPrompts()
  } catch (e) {
    formError.value = e.response?.data?.error || 'Ошибка сохранения'
  }
}

// ========================================
// Сделать промпт по умолчанию
// ========================================
async function setDefault(id) {
  try {
    await api.put(`/prompts/${id}`, { isDefault: true })
    await loadPrompts()
  } catch (e) {
    console.error('Ошибка:', e)
  }
}

// ========================================
// Удаление с подтверждением
// ========================================
async function deletePrompt(id) {
  if (!confirm('Удалить этот промпт?')) return
  try {
    await api.delete(`/prompts/${id}`)
    await loadPrompts()
  } catch (e) {
    alert('Ошибка удаления')
  }
}

// ========================================
// Превью текста промпта (обрезаем до 150 символов)
// ========================================
function preview(text) {
  return text.length > 150 ? text.substring(0, 150) + '...' : text
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4 sm:mb-6">
      <h1 class="text-xl sm:text-2xl font-bold">Промпты</h1>
      <button @click="openCreate"
              class="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-600 text-sm sm:text-base">
        + Новый промпт
      </button>
    </div>

    <!-- Форма создания/редактирования (модальное окно) -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div class="bg-white rounded-t-lg sm:rounded-lg p-6 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
          {{ editingId ? 'Редактировать промпт' : 'Новый промпт' }}
        </h2>

        <div v-if="formError" class="bg-red-100 text-red-700 p-3 rounded mb-4">
          {{ formError }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Название</label>
            <input v-model="formData.title" type="text"
                   class="w-full border rounded px-3 py-2"
                   placeholder="Например: Промпт для мобильных приложений" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Текст промпта</label>
            <textarea v-model="formData.content" rows="10"
                      class="w-full border rounded px-3 py-2 text-sm font-mono"
                      placeholder="Инструкция для AI..."></textarea>
            <p class="text-xs text-gray-400 mt-1">
              Текст заказчика будет добавлен в конец промпта автоматически
            </p>
          </div>

          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="formData.isDefault" type="checkbox" class="rounded" />
              <span class="text-sm">Использовать по умолчанию</span>
            </label>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="savePrompt"
                  class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Сохранить
          </button>
          <button @click="showForm = false"
                  class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
            Отмена
          </button>
        </div>
      </div>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="text-gray-500">Загрузка...</div>

    <!-- Пустой список -->
    <div v-else-if="prompts.length === 0" class="text-center py-12">
      <div class="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
        <h2 class="text-lg font-semibold mb-2">Промптов пока нет</h2>
        <p class="text-gray-500 text-sm mb-4">
          Промпт — это инструкция для AI, которая определяет как будет
          структурировано ваше ТЗ. Создайте свой первый промпт или
          используйте стандартный шаблон.
        </p>
        <button @click="openCreate"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Создать первый промпт
        </button>
      </div>
    </div>

    <!-- Список промптов -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="prompt in prompts" :key="prompt.id"
           class="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold text-lg">{{ prompt.title }}</h3>
          <span v-if="prompt.isDefault"
                class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full shrink-0 ml-2">
            По умолчанию
          </span>
        </div>

        <p class="text-gray-500 text-sm mb-4 font-mono">
          {{ preview(prompt.content) }}
        </p>

        <p class="text-xs text-gray-400 mb-4">
          Создан: {{ new Date(prompt.createdAt).toLocaleDateString('ru') }}
        </p>

        <div class="flex flex-wrap gap-2">
          <button v-if="!prompt.isDefault" @click="setDefault(prompt.id)"
                  class="text-green-500 hover:text-green-700 text-sm">
            По умолчанию
          </button>
          <button @click="openEdit(prompt)"
                  class="text-gray-500 hover:text-gray-700 text-sm">
            Редактировать
          </button>
          <button @click="deletePrompt(prompt.id)"
                  class="text-red-500 hover:text-red-700 text-sm">
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```

**Что интересного:**
- `openCreate` загружает текст дефолтного промпта с сервера (`/prompts/default-text`) — пользователь может начать с шаблона
- Если промптов нет — первый создаётся сразу как `isDefault`
- `preview()` обрезает длинный текст промпта до 150 символов для карточки
- Модальное окно с `max-h-[90vh] overflow-y-auto` — промпт может быть длинным, нужен скролл

### Шаг 2: Добавить роут в router/index.js

В `frontend/src/router/index.js` добавь в массив `children`:

```javascript
{
    path: 'prompts',
    component: () => import('../pages/PromptsPage.vue')
},
```

### Шаг 3: Добавить "Промпты" в навигацию

В `frontend/src/components/AppLayout.vue` добавь ссылку в десктоп-навигацию:

```html
<!-- Десктоп навигация -->
<div class="hidden md:flex gap-4">
  <router-link to="/dashboard" class="text-gray-600 hover:text-blue-500 text-sm">
    Дашборд
  </router-link>
  <router-link to="/projects" class="text-gray-600 hover:text-blue-500 text-sm">
    Проекты
  </router-link>
  <router-link to="/prompts" class="text-gray-600 hover:text-blue-500 text-sm">
    Промпты
  </router-link>
  <router-link to="/record" class="text-gray-600 hover:text-blue-500 text-sm">
    Записать
  </router-link>
</div>
```

И в мобильное меню:

```html
<router-link to="/prompts" @click="closeMenu"
             class="block text-gray-600 hover:text-blue-500">
  Промпты
</router-link>
```

---

## Урок 21.4: Интеграция с генерацией ТЗ

### Зачем

Теперь подключим промпты к процессу создания ТЗ — добавим селектор на странице `NewSpecificationPage` и баннер на дашборд для новых пользователей.

### Шаг 1: Добавить селектор промптов в NewSpecificationPage

В `frontend/src/pages/NewSpecificationPage.vue` добавь загрузку промптов:

```javascript
// В секции данных
const prompts = ref([])             // Список промптов пользователя
const selectedPromptId = ref(null)  // Выбранный промпт для AI

// В onMounted после загрузки проектов:
try {
  const response = await api.get('/prompts')
  prompts.value = response.data
  // Выбираем промпт по умолчанию
  const defaultPrompt = prompts.value.find(p => p.isDefault)
  if (defaultPrompt) {
    selectedPromptId.value = defaultPrompt.id
  }
} catch (e) {
  console.error(e)
}
```

Добавь селектор в шаблон между textarea и кнопкой AI:

```html
<!-- Селектор промпта -->
<div class="mt-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
  <select v-model="selectedPromptId"
          class="border rounded px-3 py-2 text-sm flex-1 sm:max-w-xs">
    <option :value="null">Стандартный промпт</option>
    <option v-for="p in prompts" :key="p.id" :value="p.id">
      {{ p.title }}
    </option>
  </select>

  <button @click="structureWithAI" :disabled="isStructuring"
          class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50">
    {{ isStructuring ? 'AI обрабатывает...' : 'Структурировать через AI' }}
  </button>
</div>
```

Передавай `promptId` в оба запроса:

```javascript
// В structureWithAI:
const response = await api.post('/ai/structure', {
  text: voiceText.value,
  promptId: selectedPromptId.value
})

// В save:
const response = await api.post('/specifications/generate', {
  text: voiceText.value,
  projectId: projectId.value,
  promptId: selectedPromptId.value
})
```

### Шаг 2: Добавить баннер на DashboardPage

В `frontend/src/pages/DashboardPage.vue` добавь проверку промптов:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { authStore } from '../stores/auth'
import api from '../api'

// ========================================
// Проверяем есть ли у пользователя промпты
// Если нет — показываем баннер
// ========================================
const hasPrompts = ref(true) // По умолчанию скрываем баннер

onMounted(async () => {
  try {
    const response = await api.get('/prompts')
    hasPrompts.value = response.data.length > 0
  } catch (e) {
    console.error(e)
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">
      Добро пожаловать, {{ authStore.user?.name }}!
    </h1>

    <!-- Баннер: настройте промпт -->
    <div v-if="!hasPrompts"
         class="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
      <h2 class="text-lg font-semibold text-blue-800 mb-2">Настройте свой промпт для AI</h2>
      <p class="text-blue-600 text-sm mb-3">
        Промпт — это инструкция, которая определяет как AI будет структурировать
        ваши технические задания. Создайте свой промпт или используйте стандартный шаблон.
      </p>
      <router-link to="/prompts"
                   class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
        Настроить промпты
      </router-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <router-link to="/projects"
                   class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <h2 class="text-lg font-semibold mb-2">Проекты</h2>
        <p class="text-gray-500 text-sm">Управление проектами и клиентами</p>
      </router-link>

      <router-link to="/prompts"
                   class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <h2 class="text-lg font-semibold mb-2">Промпты</h2>
        <p class="text-gray-500 text-sm">Настройка инструкций для AI</p>
      </router-link>
    </div>
  </div>
</template>
```

**Что изменилось:**
- `hasPrompts` — проверяем при загрузке страницы, есть ли промпты
- Баннер `v-if="!hasPrompts"` — виден только если промптов нет
- Добавлена карточка "Промпты" в сетку навигации дашборда

### Проверка

1. Запусти `npx prisma db push` в backend — миграция без ошибок
2. Запусти backend `npm run dev` — сервер стартует
3. Запусти frontend `npm run dev` — приложение открывается
4. Зарегистрируй нового пользователя → на дашборде виден баннер "Настройте свой промпт для AI"
5. Перейди на `/prompts` → создай промпт с названием и текстом → баннер на дашборде исчезает
6. Создай ТЗ → виден селектор промптов → выбери свой промпт → AI использует его вместо дефолтного
7. Попробуй "Стандартный промпт" в селекторе — AI работает как раньше

---

# ЧАСТЬ 22: ЭКСПОРТ В DOC ✅

## Урок 22.1: Backend — генерация DOCX ✅

### Зачем

PDF хорош для финального документа, но заказчики часто хотят редактировать ТЗ в Word. Добавим экспорт в формат `.docx` — его можно открыть в Microsoft Word, Google Docs, LibreOffice.

### Шаг 1: Установка библиотеки docx

```bash
cd backend
npm install docx
```

**Что ставим:**
- `docx` — генерация `.docx` файлов на чистом JavaScript, без зависимостей от LibreOffice или других внешних программ

### Шаг 2: Создать сервис генерации DOC

Создай файл `backend/src/services/docService.js`:

```javascript
// ========================================
// Сервис генерации DOCX
//
// Библиотека docx создаёт файлы Word
// программно — без шаблонов и внешних зависимостей
//
// Структура DOCX:
// Document → Section → Paragraph/Table
// ========================================

const {
  Document, Packer, Paragraph, TextRun,
  HeadingLevel, AlignmentType, BorderStyle,
  Table, TableRow, TableCell, WidthType,
  ImageRun
} = require('docx')
const fs = require('fs')
const path = require('path')

/**
 * Генерация DOCX из спецификации
 *
 * @param {Object} spec — спецификация с sections и items
 * @param {boolean} includeImages — включать ли прикреплённые скриншоты
 * @returns {Buffer} — буфер готового .docx файла
 */
async function generateDoc(spec, includeImages = true) {

  // ========================================
  // Собираем содержимое документа
  // Каждый элемент массива — параграф или таблица
  // ========================================
  const children = []

  // ========================================
  // Заголовок документа
  // ========================================
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: spec.title || 'Техническое задание',
          bold: true,
          size: 32,          // размер в half-points (32 = 16pt)
          font: 'Arial'
        })
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  )

  // Дата создания
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Дата: ${new Date(spec.createdAt).toLocaleDateString('ru')}`,
          size: 20,
          color: '666666',
          font: 'Arial'
        })
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 }
    })
  )

  // ========================================
  // Разделы и пункты
  // ========================================
  let totalMinutes = 0

  spec.sections.forEach((section, sectionIndex) => {
    // Заголовок раздела
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${sectionIndex + 1}. ${section.title}`,
            bold: true,
            size: 26,
            font: 'Arial'
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 }
      })
    )

    // Пункты раздела
    section.items.forEach((item, itemIndex) => {
      const timeStr = item.timeEstimate
        ? ` [${item.timeEstimate} мин]`
        : ''

      if (item.timeEstimate) {
        totalMinutes += item.timeEstimate
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${sectionIndex + 1}.${itemIndex + 1} `,
              bold: true,
              size: 22,
              font: 'Arial'
            }),
            new TextRun({
              text: item.content,
              size: 22,
              font: 'Arial'
            }),
            new TextRun({
              text: timeStr,
              size: 22,
              color: '0066CC',
              bold: true,
              font: 'Arial'
            })
          ],
          spacing: { after: 100 },
          indent: { left: 400 }
        })
      )

      // ========================================
      // Прикреплённые изображения
      // Читаем файл с диска и вставляем в документ
      // ========================================
      if (includeImages && item.attachments) {
        item.attachments.forEach(att => {
          if (att.mimetype && att.mimetype.startsWith('image/')) {
            const filePath = path.join(__dirname, '../../', att.path)
            if (fs.existsSync(filePath)) {
              const imageData = fs.readFileSync(filePath)
              children.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: imageData,
                      transformation: {
                        width: 500,
                        height: 300
                      },
                      type: att.mimetype === 'image/png' ? 'png' : 'jpg'
                    })
                  ],
                  spacing: { before: 100, after: 200 },
                  indent: { left: 400 }
                })
              )
            }
          }
        })
      }
    })
  })

  // ========================================
  // Итоговая таблица с общим временем
  // ========================================
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  const totalStr = hours > 0
    ? `${hours} ч ${mins} мин`
    : `${totalMinutes} мин`

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '' })
      ],
      spacing: { before: 400 }
    })
  )

  children.push(
    new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Общее время:',
                      bold: true,
                      size: 24,
                      font: 'Arial'
                    })
                  ]
                })
              ],
              width: { size: 50, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: totalStr,
                      bold: true,
                      size: 24,
                      color: '0066CC',
                      font: 'Arial'
                    })
                  ],
                  alignment: AlignmentType.RIGHT
                })
              ],
              width: { size: 50, type: WidthType.PERCENTAGE }
            })
          ]
        })
      ],
      width: { size: 100, type: WidthType.PERCENTAGE }
    })
  )

  // ========================================
  // Создаём документ
  // ========================================
  const doc = new Document({
    sections: [{
      children
    }]
  })

  // ========================================
  // Packer.toBuffer() — сериализует документ в буфер
  // Этот буфер можно сохранить в файл или отправить клиенту
  // ========================================
  const buffer = await Packer.toBuffer(doc)
  return buffer
}

module.exports = { generateDoc }
```

**Ключевые моменты:**
- `Packer.toBuffer()` — превращает объект Document в Buffer (бинарные данные .docx)
- `ImageRun` — вставляет картинку прямо в документ, читая файл с диска
- Нумерация `1.1`, `1.2`, `2.1` — совпадает с отображением на фронте
- Итоговое время считается суммой `timeEstimate` всех пунктов

### Шаг 3: Добавить роут экспорта в DOC

Открой `backend/src/routes/export.js` и добавь новый роут:

```javascript
const { generateDoc } = require('../services/docService')

/**
 * GET /api/export/doc/:specificationId
 *
 * Генерирует DOCX и отправляет для скачивания
 *
 * Content-Type для .docx — длинный MIME-тип от Microsoft
 * Браузер поймёт что это файл Word и предложит скачать
 */
router.get('/doc/:specificationId', authenticate, async (req, res) => {
  try {
    const spec = await prisma.specification.findFirst({
      where: {
        id: parseInt(req.params.specificationId),
        userId: req.userId
      },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' },
              include: {
                attachments: true   // ← включаем вложения для картинок в DOC
              }
            }
          }
        }
      }
    })

    if (!spec) {
      return res.status(404).json({ error: 'ТЗ не найдено' })
    }

    const buffer = await generateDoc(spec)

    res.setHeader('Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition',
      `attachment; filename="tz-${spec.id}.docx"`)
    res.send(buffer)
  } catch (error) {
    console.error('Ошибка генерации DOC:', error)
    res.status(500).json({ error: 'Ошибка экспорта в DOC' })
  }
})
```

### Шаг 4: Обновить роут PDF — добавить включение вложений

Обнови существующий роут PDF в том же файле, чтобы тоже подгружал attachments:

```javascript
router.get('/pdf/:specificationId', authenticate, async (req, res) => {
  try {
    const spec = await prisma.specification.findFirst({
      where: {
        id: parseInt(req.params.specificationId),
        userId: req.userId
      },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' },
              include: {
                attachments: true   // ← добавляем
              }
            }
          }
        }
      }
    })

    if (!spec) {
      return res.status(404).json({ error: 'ТЗ не найдено' })
    }

    const pdf = await generatePdf(spec)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="tz-${spec.id}.pdf"`)
    res.send(pdf)
  } catch (error) {
    console.error('Ошибка генерации PDF:', error)
    res.status(500).json({ error: 'Ошибка экспорта' })
  }
})
```

---

## Урок 22.2: Frontend — селектор формата экспорта ✅

### Зачем

Вместо одной кнопки "Скачать PDF" добавим селектор формата (PDF / DOC). Пользователь выбирает формат и нажимает "Скачать".

### Шаг 1: Обновить SpecificationPage.vue

В `frontend/src/pages/SpecificationPage.vue` замени кнопку скачивания:

```vue
<!-- Селектор экспорта -->
<div class="flex gap-2 items-center">
  <select v-model="exportFormat"
          class="border rounded px-3 py-2 text-sm">
    <option value="pdf">PDF</option>
    <option value="doc">DOC (Word)</option>
  </select>
  <button @click="downloadExport"
          :disabled="exporting"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 text-sm">
    {{ exporting ? 'Генерация...' : 'Скачать' }}
  </button>
</div>
```

В `<script setup>` добавь:

```javascript
const exportFormat = ref('pdf')
const exporting = ref(false)

async function downloadExport() {
  exporting.value = true
  try {
    // ========================================
    // Формат определяет URL и расширение файла
    // responseType: 'blob' — получаем бинарные данные
    // ========================================
    const format = exportFormat.value
    const response = await api.get(`/export/${format}/${specification.value.id}`, {
      responseType: 'blob'
    })

    const extension = format === 'doc' ? 'docx' : 'pdf'
    const url = URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = url
    link.download = `tz-${specification.value.id}.${extension}`
    link.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    alert('Ошибка скачивания')
  } finally {
    exporting.value = false
  }
}
```

### Проверка

1. Открой страницу ТЗ с пунктами
2. Выбери формат "DOC (Word)" → нажми "Скачать"
3. Файл `.docx` скачивается → открой в Word/Google Docs — разделы, пункты, время на месте
4. Выбери "PDF" → скачивается PDF как раньше

---

# ЧАСТЬ 23: ПРИКРЕПЛЕНИЕ СКРИНШОТОВ К ПУНКТАМ ТЗ ✅

## Урок 23.1: UI загрузки скриншотов к пунктам

### Зачем

В Части 13 мы создали backend для вложений. Теперь нужен удобный UI — чтобы к каждому пункту ТЗ можно было прикрепить скриншоты прямо на странице просмотра.

### Шаг 1: Компонент загрузки скриншотов

Создай `frontend/src/components/ItemAttachments.vue`:

```vue
<script setup>
import { ref } from 'vue'
import api from '../api'

// ========================================
// Props и Events
//
// itemId — ID пункта ТЗ
// attachments — уже загруженные вложения
// readonly — режим просмотра (без загрузки/удаления)
// ========================================
const props = defineProps({
  itemId: { type: Number, required: true },
  attachments: { type: Array, default: () => [] },
  readonly: { type: Boolean, default: false }
})

const emit = defineEmits(['updated'])

const uploading = ref(false)
const dragover = ref(false)

// ========================================
// Загрузка файла
//
// FormData — специальный объект для отправки файлов
// через multipart/form-data (стандарт для загрузки файлов)
// ========================================
async function uploadFile(file) {
  if (!file) return

  // Проверяем тип — только изображения
  if (!file.type.startsWith('image/')) {
    alert('Можно загружать только изображения (PNG, JPG, GIF, WebP)')
    return
  }

  // Проверяем размер — максимум 5 МБ
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

    emit('updated')  // Родитель перезагрузит данные
  } catch (e) {
    alert('Ошибка загрузки: ' + (e.response?.data?.error || e.message))
  } finally {
    uploading.value = false
  }
}

// ========================================
// Обработка выбора файла через input
// ========================================
function onFileSelect(event) {
  const file = event.target.files[0]
  uploadFile(file)
  event.target.value = ''  // Сброс для повторной загрузки того же файла
}

// ========================================
// Drag & Drop
//
// dragover — подсвечиваем зону при перетаскивании
// drop — получаем файл из события
// preventDefault — иначе браузер откроет файл
// ========================================
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

// ========================================
// Удаление вложения
// ========================================
async function removeAttachment(attachmentId) {
  if (!confirm('Удалить скриншот?')) return
  try {
    await api.delete(`/attachments/${attachmentId}`)
    emit('updated')
  } catch (e) {
    alert('Ошибка удаления')
  }
}

// ========================================
// Полный URL картинки
// Backend раздаёт файлы по /uploads/filename
// ========================================
function imageUrl(attachment) {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  return `${baseUrl}${attachment.path}`
}
</script>

<template>
  <div class="mt-2">
    <!-- Список прикреплённых скриншотов -->
    <div v-if="attachments.length > 0" class="flex flex-wrap gap-2 mb-2">
      <div v-for="att in attachments" :key="att.id" class="relative group">
        <!-- Миниатюра -->
        <img v-if="att.mimetype?.startsWith('image/')"
             :src="imageUrl(att)"
             :alt="att.filename"
             class="w-24 h-24 object-cover rounded border cursor-pointer
                    hover:opacity-90 transition-opacity"
             @click="window.open(imageUrl(att), '_blank')" />

        <!-- Кнопка удаления (видна при наведении) -->
        <button v-if="!readonly"
                @click="removeAttachment(att.id)"
                class="absolute -top-2 -right-2 bg-red-500 text-white
                       rounded-full w-5 h-5 text-xs flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-opacity">
          x
        </button>
      </div>
    </div>

    <!-- Зона загрузки (drag & drop + кнопка) -->
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
```

**Что интересного:**
- Drag & Drop для удобной загрузки — перетащил скриншот на пункт
- Миниатюры 96x96px с возможностью открыть полный размер
- Кнопка удаления появляется при наведении (не мешает визуально)
- Проверка типа и размера файла на клиенте (до отправки на сервер)

### Шаг 2: Интеграция в SpecificationPage.vue

В `frontend/src/pages/SpecificationPage.vue` подключи компонент:

```javascript
import ItemAttachments from '../components/ItemAttachments.vue'
```

В шаблоне, внутри цикла `v-for="item in section.items"`, после текста пункта добавь:

```html
<!-- Скриншоты пункта -->
<ItemAttachments
  :item-id="item.id"
  :attachments="item.attachments || []"
  :readonly="isSharedView"
  @updated="loadSpecification" />
```

### Шаг 3: Обновить загрузку ТЗ — включить attachments

В функции `loadSpecification` убедись что backend возвращает вложения:

```javascript
async function loadSpecification() {
  const response = await api.get(`/specifications/${specId}`)
  specification.value = response.data
}
```

На backend в `specificationController.js` обнови `getById`:

```javascript
const spec = await prisma.specification.findFirst({
  where: { id, userId: req.userId },
  include: {
    sections: {
      orderBy: { position: 'asc' },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: {
            attachments: true   // ← добавляем
          }
        }
      }
    }
  }
})
```

### Шаг 4: Вставка через буфер обмена (Ctrl+V)

Добавь в `ItemAttachments.vue` обработку вставки из буфера — очень удобно для скриншотов:

```javascript
import { onMounted, onUnmounted } from 'vue'

// ========================================
// Вставка из буфера обмена (Ctrl+V)
//
// clipboardData.items — содержимое буфера
// getAsFile() — превращает элемент буфера в File
//
// Удобно: сделал скриншот (Win+Shift+S),
// кликнул на зону пункта, нажал Ctrl+V
// ========================================
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
```

### Проверка

1. Открой ТЗ с пунктами
2. Под каждым пунктом есть зона "Прикрепить скриншот"
3. Нажми на неё → выбери картинку → она появляется как миниатюра
4. Перетащи картинку на зону → загружается
5. Сделай скриншот (Win+Shift+S), нажми Ctrl+V → скриншот прикрепляется
6. Наведи на миниатюру → появляется крестик → удали
7. Нажми на миниатюру → открывается полный размер в новой вкладке

---

# ЧАСТЬ 24: ШАРИНГ ТЗ И СОВМЕСТНОЕ РЕДАКТИРОВАНИЕ ⬜

## Урок 24.1: Модель ShareLink — ссылки для общего доступа

### Зачем

Менеджер создаёт ТЗ и хочет отправить ссылку редактору (дизайнеру, разработчику). Редактор по ссылке может:
- Просмотреть ТЗ
- Вписать своё время в пункты
- Добавить новые пункты
- Оставить комментарий

Создатель потом видит изменения и согласовывает их.

### Шаг 1: Добавить модели в schema.prisma

```prisma
// ========================================
// Ссылка для шаринга ТЗ
//
// token — уникальный токен в URL (UUID)
// role — что может делать получатель:
//   "viewer" — только просмотр
//   "editor" — может предлагать изменения
// ========================================
model ShareLink {
  id              Int           @id @default(autoincrement())
  token           String        @unique
  role            String        @default("viewer")   // viewer | editor
  specificationId Int
  specification   Specification @relation(fields: [specificationId], references: [id], onDelete: Cascade)
  createdById     Int
  createdBy       User          @relation(fields: [createdById], references: [id])
  expiresAt       DateTime?                          // null = бессрочная
  createdAt       DateTime      @default(now())
}

// ========================================
// Предложение изменений от редактора
//
// Когда редактор меняет время или добавляет пункт —
// это сохраняется как "предложение", а не сразу применяется
//
// status:
//   "pending" — ждёт согласования
//   "approved" — создатель принял
//   "rejected" — создатель отклонил
// ========================================
model Suggestion {
  id              Int           @id @default(autoincrement())
  type            String                             // "time_change" | "new_item" | "comment"
  itemId          Int?                               // к какому пункту (null для new_item)
  item            Item?         @relation(fields: [itemId], references: [id], onDelete: Cascade)
  specificationId Int
  specification   Specification @relation(fields: [specificationId], references: [id], onDelete: Cascade)
  data            String        @db.Text             // JSON с данными предложения
  status          String        @default("pending")  // pending | approved | rejected
  authorName      String                             // имя редактора
  createdAt       DateTime      @default(now())
}
```

### Шаг 2: Добавить связи в существующие модели

В модели `Specification` добавь:

```prisma
model Specification {
  // ... существующие поля
  shareLinks  ShareLink[]
  suggestions Suggestion[]
}
```

В модели `User` добавь:

```prisma
model User {
  // ... существующие поля
  shareLinks  ShareLink[]
}
```

В модели `Item` добавь:

```prisma
model Item {
  // ... существующие поля
  suggestions Suggestion[]
}
```

### Шаг 3: Применить миграцию

```bash
cd backend
npm install uuid
npx prisma db push
```

---

## Урок 24.2: Backend шаринга

### Шаг 1: Контроллер шаринга

Создай `backend/src/controllers/shareController.js`:

```javascript
// ========================================
// Контроллер шаринга ТЗ
//
// Создание ссылок, просмотр по токену,
// отправка и согласование предложений
// ========================================

const prisma = require('../db')
const { v4: uuidv4 } = require('uuid')

// ========================================
// POST /api/share
//
// Создать ссылку для шаринга
// body: { specificationId, role, expiresInDays }
// ========================================
async function createLink(req, res) {
  try {
    const { specificationId, role, expiresInDays } = req.body

    // Проверяем что ТЗ принадлежит пользователю
    const spec = await prisma.specification.findFirst({
      where: { id: specificationId, userId: req.userId }
    })
    if (!spec) {
      return res.status(404).json({ error: 'ТЗ не найдено' })
    }

    // Генерируем уникальный токен
    const token = uuidv4()

    // Дата истечения (необязательно)
    let expiresAt = null
    if (expiresInDays) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    }

    const link = await prisma.shareLink.create({
      data: {
        token,
        role: role || 'viewer',
        specificationId,
        createdById: req.userId,
        expiresAt
      }
    })

    res.status(201).json({
      ...link,
      url: `${req.protocol}://${req.get('host')}/shared/${token}`
    })
  } catch (error) {
    console.error('Ошибка создания ссылки:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

// ========================================
// GET /api/share/:token
//
// Получить ТЗ по токену (без авторизации!)
// Проверяем срок действия ссылки
// ========================================
async function getByToken(req, res) {
  try {
    const { token } = req.params

    const link = await prisma.shareLink.findUnique({
      where: { token },
      include: {
        specification: {
          include: {
            sections: {
              orderBy: { position: 'asc' },
              include: {
                items: {
                  orderBy: { position: 'asc' },
                  include: {
                    attachments: true,
                    suggestions: {
                      where: { status: 'pending' }
                    }
                  }
                }
              }
            },
            suggestions: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })

    if (!link) {
      return res.status(404).json({ error: 'Ссылка не найдена' })
    }

    // Проверяем срок действия
    if (link.expiresAt && new Date() > link.expiresAt) {
      return res.status(410).json({ error: 'Ссылка истекла' })
    }

    res.json({
      role: link.role,
      specification: link.specification
    })
  } catch (error) {
    console.error('Ошибка:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

// ========================================
// POST /api/share/:token/suggest
//
// Редактор отправляет предложение
// Не требует авторизации (по токену)
//
// body: { type, itemId, data, authorName }
//
// type: "time_change" — изменение времени
//   data: { newTime: 120 }
//
// type: "new_item" — новый пункт
//   data: { sectionId: 5, content: "...", timeEstimate: 60 }
//
// type: "comment" — комментарий
//   data: { text: "Нужно уточнить..." }
// ========================================
async function addSuggestion(req, res) {
  try {
    const { token } = req.params
    const { type, itemId, data, authorName } = req.body

    const link = await prisma.shareLink.findUnique({
      where: { token }
    })

    if (!link || link.role !== 'editor') {
      return res.status(403).json({ error: 'Нет прав на редактирование' })
    }

    if (link.expiresAt && new Date() > link.expiresAt) {
      return res.status(410).json({ error: 'Ссылка истекла' })
    }

    const suggestion = await prisma.suggestion.create({
      data: {
        type,
        itemId: itemId || null,
        specificationId: link.specificationId,
        data: JSON.stringify(data),
        authorName: authorName || 'Аноним'
      }
    })

    res.status(201).json(suggestion)
  } catch (error) {
    console.error('Ошибка:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

// ========================================
// PUT /api/share/suggestions/:id
//
// Создатель ТЗ согласовывает или отклоняет
// Требует авторизации!
//
// body: { status: "approved" | "rejected" }
//
// Если approved и type="time_change" — обновляем timeEstimate
// Если approved и type="new_item" — создаём новый Item
// ========================================
async function reviewSuggestion(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { status } = req.body

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Статус: approved или rejected' })
    }

    const suggestion = await prisma.suggestion.findUnique({
      where: { id },
      include: {
        specification: true
      }
    })

    if (!suggestion || suggestion.specification.userId !== req.userId) {
      return res.status(404).json({ error: 'Предложение не найдено' })
    }

    // ========================================
    // Если одобрено — применяем изменения
    // ========================================
    const data = JSON.parse(suggestion.data)

    if (status === 'approved') {
      if (suggestion.type === 'time_change' && suggestion.itemId) {
        await prisma.item.update({
          where: { id: suggestion.itemId },
          data: { timeEstimate: data.newTime }
        })
      }

      if (suggestion.type === 'new_item') {
        // Определяем позицию — в конец раздела
        const lastItem = await prisma.item.findFirst({
          where: { sectionId: data.sectionId },
          orderBy: { position: 'desc' }
        })
        const position = lastItem ? lastItem.position + 1 : 0

        await prisma.item.create({
          data: {
            content: data.content,
            timeEstimate: data.timeEstimate || 0,
            position,
            sectionId: data.sectionId
          }
        })
      }
    }

    // Обновляем статус предложения
    const updated = await prisma.suggestion.update({
      where: { id },
      data: { status }
    })

    res.json(updated)
  } catch (error) {
    console.error('Ошибка:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

// ========================================
// GET /api/share/links/:specificationId
//
// Список всех ссылок для ТЗ (для создателя)
// ========================================
async function getLinks(req, res) {
  try {
    const specId = parseInt(req.params.specificationId)

    const links = await prisma.shareLink.findMany({
      where: {
        specificationId: specId,
        createdById: req.userId
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(links)
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

// ========================================
// DELETE /api/share/links/:id
//
// Удалить (отозвать) ссылку
// ========================================
async function deleteLink(req, res) {
  try {
    const id = parseInt(req.params.id)
    const link = await prisma.shareLink.findFirst({
      where: { id, createdById: req.userId }
    })

    if (!link) {
      return res.status(404).json({ error: 'Ссылка не найдена' })
    }

    await prisma.shareLink.delete({ where: { id } })
    res.json({ message: 'Ссылка удалена' })
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
}

module.exports = {
  createLink, getByToken, addSuggestion,
  reviewSuggestion, getLinks, deleteLink
}
```

### Шаг 2: Роуты шаринга

Создай `backend/src/routes/share.js`:

```javascript
const express = require('express')
const { authenticate } = require('../middleware/auth')
const {
  createLink, getByToken, addSuggestion,
  reviewSuggestion, getLinks, deleteLink
} = require('../controllers/shareController')

const router = express.Router()

// Публичные роуты (без авторизации — по токену)
router.get('/:token', getByToken)
router.post('/:token/suggest', addSuggestion)

// Защищённые роуты (для создателя ТЗ)
router.post('/', authenticate, createLink)
router.get('/links/:specificationId', authenticate, getLinks)
router.delete('/links/:id', authenticate, deleteLink)
router.put('/suggestions/:id', authenticate, reviewSuggestion)

module.exports = router
```

Подключи в `backend/src/index.js`:

```javascript
const shareRoutes = require('./routes/share')
app.use('/api/share', shareRoutes)
```

---

## Урок 24.3: Frontend — кнопка "Поделиться"

### Шаг 1: Компонент ShareDialog

Создай `frontend/src/components/ShareDialog.vue`:

```vue
<script setup>
import { ref } from 'vue'
import api from '../api'

const props = defineProps({
  specificationId: { type: Number, required: true }
})

const emit = defineEmits(['close'])

const role = ref('viewer')
const expiresInDays = ref(0)    // 0 = бессрочно
const generatedUrl = ref('')
const links = ref([])
const loading = ref(true)
const copied = ref(false)

// ========================================
// Загрузить существующие ссылки
// ========================================
async function loadLinks() {
  try {
    const response = await api.get(`/share/links/${props.specificationId}`)
    links.value = response.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
loadLinks()

// ========================================
// Создать новую ссылку
// ========================================
async function createLink() {
  try {
    const response = await api.post('/share', {
      specificationId: props.specificationId,
      role: role.value,
      expiresInDays: expiresInDays.value || null
    })

    // Формируем URL для фронтенда
    const frontUrl = `${window.location.origin}/shared/${response.data.token}`
    generatedUrl.value = frontUrl

    await loadLinks()
  } catch (e) {
    alert('Ошибка создания ссылки')
  }
}

// ========================================
// Копировать ссылку в буфер обмена
// ========================================
async function copyUrl() {
  await navigator.clipboard.writeText(generatedUrl.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// ========================================
// Удалить ссылку
// ========================================
async function deleteLink(id) {
  if (!confirm('Отозвать эту ссылку?')) return
  await api.delete(`/share/links/${id}`)
  await loadLinks()
}

function roleLabel(r) {
  return r === 'editor' ? 'Редактор' : 'Просмотр'
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold mb-4">Поделиться ТЗ</h2>

      <!-- Форма создания ссылки -->
      <div class="space-y-3 mb-6">
        <div>
          <label class="block text-sm font-medium mb-1">Роль получателя</label>
          <select v-model="role" class="w-full border rounded px-3 py-2 text-sm">
            <option value="viewer">Только просмотр</option>
            <option value="editor">Редактор (может предлагать изменения)</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Срок действия</label>
          <select v-model="expiresInDays" class="w-full border rounded px-3 py-2 text-sm">
            <option :value="0">Бессрочно</option>
            <option :value="1">1 день</option>
            <option :value="7">7 дней</option>
            <option :value="30">30 дней</option>
          </select>
        </div>

        <button @click="createLink"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full">
          Создать ссылку
        </button>
      </div>

      <!-- Сгенерированная ссылка -->
      <div v-if="generatedUrl" class="bg-green-50 border border-green-200 rounded p-4 mb-6">
        <p class="text-sm text-green-800 mb-2">Ссылка создана:</p>
        <div class="flex gap-2">
          <input :value="generatedUrl" readonly
                 class="flex-1 border rounded px-3 py-2 text-sm bg-white" />
          <button @click="copyUrl"
                  class="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 shrink-0">
            {{ copied ? 'Скопировано!' : 'Копировать' }}
          </button>
        </div>
      </div>

      <!-- Существующие ссылки -->
      <div v-if="links.length > 0">
        <h3 class="font-semibold text-sm mb-2">Активные ссылки</h3>
        <div v-for="link in links" :key="link.id"
             class="flex items-center justify-between py-2 border-b last:border-0">
          <div>
            <span class="text-sm">{{ roleLabel(link.role) }}</span>
            <span v-if="link.expiresAt" class="text-xs text-gray-400 ml-2">
              до {{ new Date(link.expiresAt).toLocaleDateString('ru') }}
            </span>
          </div>
          <button @click="deleteLink(link.id)"
                  class="text-red-500 text-sm hover:text-red-700">
            Отозвать
          </button>
        </div>
      </div>

      <button @click="$emit('close')"
              class="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 w-full">
        Закрыть
      </button>
    </div>
  </div>
</template>
```

### Шаг 2: Кнопка "Поделиться" на странице ТЗ

В `SpecificationPage.vue` добавь:

```javascript
import ShareDialog from '../components/ShareDialog.vue'

const showShareDialog = ref(false)
```

```html
<button @click="showShareDialog = true"
        class="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-sm">
  Поделиться
</button>

<ShareDialog v-if="showShareDialog"
             :specification-id="specification.id"
             @close="showShareDialog = false" />
```

---

## Урок 24.4: Страница SharedSpecificationPage

### Зачем

Когда получатель переходит по ссылке `/shared/:token`, он видит ТЗ. Если его роль — editor, он может предлагать изменения.

### Шаг 1: Создать страницу

Создай `frontend/src/pages/SharedSpecificationPage.vue`:

```vue
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const token = route.params.token

const specification = ref(null)
const role = ref('viewer')
const loading = ref(true)
const error = ref('')
const authorName = ref('')

// ========================================
// Форма нового пункта
// ========================================
const showAddItem = ref(false)
const addItemSectionId = ref(null)
const newItemContent = ref('')
const newItemTime = ref(0)

// ========================================
// Загрузка ТЗ по токену (без авторизации)
// ========================================
onMounted(async () => {
  try {
    // Запрос на /api/share/:token — публичный
    const response = await api.get(`/share/${token}`)
    specification.value = response.data.specification
    role.value = response.data.role
  } catch (e) {
    if (e.response?.status === 410) {
      error.value = 'Ссылка истекла'
    } else {
      error.value = 'ТЗ не найдено'
    }
  } finally {
    loading.value = false
  }
})

const isEditor = computed(() => role.value === 'editor')

// ========================================
// Общее время
// ========================================
const totalTime = computed(() => {
  if (!specification.value) return 0
  let total = 0
  specification.value.sections.forEach(s => {
    s.items.forEach(i => {
      total += i.timeEstimate || 0
    })
  })
  return total
})

function formatTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h} ч ${m} мин` : `${minutes} мин`
}

// ========================================
// Предложить изменение времени
// ========================================
async function suggestTimeChange(item) {
  const newTime = prompt(`Текущее время: ${item.timeEstimate} мин. Ваша оценка (мин):`)
  if (!newTime || isNaN(newTime)) return

  if (!authorName.value) {
    authorName.value = prompt('Ваше имя:') || 'Аноним'
  }

  try {
    await api.post(`/share/${token}/suggest`, {
      type: 'time_change',
      itemId: item.id,
      data: { newTime: parseInt(newTime), oldTime: item.timeEstimate },
      authorName: authorName.value
    })
    alert('Предложение отправлено!')
  } catch (e) {
    alert('Ошибка: ' + (e.response?.data?.error || e.message))
  }
}

// ========================================
// Предложить новый пункт
// ========================================
function openAddItem(sectionId) {
  addItemSectionId.value = sectionId
  newItemContent.value = ''
  newItemTime.value = 60
  showAddItem.value = true
}

async function submitNewItem() {
  if (!newItemContent.value.trim()) return

  if (!authorName.value) {
    authorName.value = prompt('Ваше имя:') || 'Аноним'
  }

  try {
    await api.post(`/share/${token}/suggest`, {
      type: 'new_item',
      data: {
        sectionId: addItemSectionId.value,
        content: newItemContent.value.trim(),
        timeEstimate: parseInt(newItemTime.value) || 0
      },
      authorName: authorName.value
    })
    showAddItem.value = false
    alert('Предложение отправлено! Создатель ТЗ рассмотрит его.')
  } catch (e) {
    alert('Ошибка отправки')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <div class="max-w-4xl mx-auto">

      <!-- Загрузка / ошибка -->
      <div v-if="loading" class="text-center py-12 text-gray-500">Загрузка...</div>
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-500 text-lg">{{ error }}</p>
      </div>

      <!-- ТЗ -->
      <div v-else-if="specification">
        <!-- Заголовок -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex justify-between items-start">
            <h1 class="text-2xl font-bold">{{ specification.title }}</h1>
            <span :class="[
              'text-xs px-2 py-1 rounded-full',
              isEditor ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            ]">
              {{ isEditor ? 'Редактор' : 'Просмотр' }}
            </span>
          </div>
          <p class="text-gray-400 text-sm mt-2">
            Общее время: {{ formatTime(totalTime) }}
          </p>
        </div>

        <!-- Разделы -->
        <div v-for="(section, si) in specification.sections" :key="section.id"
             class="bg-white rounded-lg shadow p-6 mb-4">
          <h2 class="text-lg font-semibold mb-4">
            {{ si + 1 }}. {{ section.title }}
          </h2>

          <div v-for="(item, ii) in section.items" :key="item.id"
               class="flex items-start gap-3 py-3 border-b last:border-0">
            <span class="text-gray-400 text-sm shrink-0 mt-0.5">
              {{ si + 1 }}.{{ ii + 1 }}
            </span>
            <div class="flex-1">
              <p>{{ item.content }}</p>

              <!-- Скриншоты -->
              <div v-if="item.attachments?.length" class="flex flex-wrap gap-2 mt-2">
                <img v-for="att in item.attachments" :key="att.id"
                     v-show="att.mimetype?.startsWith('image/')"
                     :src="`${$api?.defaults?.baseURL || 'http://localhost:3000'}${att.path}`"
                     class="w-20 h-20 object-cover rounded border" />
              </div>

              <!-- Пометки о предложениях -->
              <div v-if="item.suggestions?.length" class="mt-1">
                <span class="text-xs text-orange-500">
                  {{ item.suggestions.length }} предложений ожидает
                </span>
              </div>
            </div>
            <div class="text-right shrink-0">
              <span class="text-blue-500 text-sm font-medium">
                {{ item.timeEstimate }} мин
              </span>
              <!-- Кнопка изменить время (только editor) -->
              <button v-if="isEditor" @click="suggestTimeChange(item)"
                      class="block text-xs text-gray-400 hover:text-blue-500 mt-1">
                Изменить
              </button>
            </div>
          </div>

          <!-- Кнопка добавить пункт (только editor) -->
          <button v-if="isEditor" @click="openAddItem(section.id)"
                  class="mt-3 text-sm text-blue-500 hover:text-blue-700">
            + Предложить пункт
          </button>
        </div>
      </div>

      <!-- Модалка добавления пункта -->
      <div v-if="showAddItem" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 class="text-lg font-bold mb-4">Предложить новый пункт</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">Описание</label>
              <textarea v-model="newItemContent" rows="3"
                        class="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Что нужно сделать..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Оценка (мин)</label>
              <input v-model="newItemTime" type="number" min="0"
                     class="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div class="flex gap-3 mt-4">
            <button @click="submitNewItem"
                    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Отправить
            </button>
            <button @click="showAddItem = false"
                    class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

### Шаг 2: Роут для shared-страницы

В `frontend/src/router/index.js` добавь роут ВНЕ `children` (без AppLayout):

```javascript
{
  path: '/shared/:token',
  component: () => import('../pages/SharedSpecificationPage.vue')
}
```

---

## Урок 24.5: Согласование предложений

### Зачем

Создатель ТЗ видит предложения от редакторов и может одобрить или отклонить каждое.

### Шаг 1: Компонент SuggestionsPanel

Создай `frontend/src/components/SuggestionsPanel.vue`:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const props = defineProps({
  specificationId: { type: Number, required: true }
})

const emit = defineEmits(['updated'])

const suggestions = ref([])
const loading = ref(true)

onMounted(async () => {
  await loadSuggestions()
})

async function loadSuggestions() {
  try {
    const response = await api.get(`/specifications/${props.specificationId}`)
    // Собираем предложения из всех пунктов
    suggestions.value = response.data.suggestions || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// ========================================
// Одобрить или отклонить предложение
// ========================================
async function review(id, status) {
  try {
    await api.put(`/share/suggestions/${id}`, { status })
    await loadSuggestions()
    emit('updated')
  } catch (e) {
    alert('Ошибка')
  }
}

function parseData(dataStr) {
  try {
    return JSON.parse(dataStr)
  } catch {
    return {}
  }
}

function typeLabel(type) {
  const labels = {
    time_change: 'Изменение времени',
    new_item: 'Новый пункт',
    comment: 'Комментарий'
  }
  return labels[type] || type
}

function statusLabel(status) {
  const labels = {
    pending: 'Ожидает',
    approved: 'Одобрено',
    rejected: 'Отклонено'
  }
  return labels[status] || status
}

function statusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  }
  return colors[status] || ''
}
</script>

<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-lg font-semibold mb-4">
      Предложения от редакторов
      <span v-if="suggestions.filter(s => s.status === 'pending').length"
            class="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full ml-2">
        {{ suggestions.filter(s => s.status === 'pending').length }} новых
      </span>
    </h2>

    <div v-if="loading" class="text-gray-400 text-sm">Загрузка...</div>

    <div v-else-if="suggestions.length === 0" class="text-gray-400 text-sm">
      Предложений пока нет
    </div>

    <div v-else class="space-y-3">
      <div v-for="s in suggestions" :key="s.id"
           class="border rounded p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">{{ s.authorName }}</span>
            <span class="text-xs text-gray-400">
              {{ new Date(s.createdAt).toLocaleDateString('ru') }}
            </span>
          </div>
          <span :class="['text-xs px-2 py-1 rounded-full', statusColor(s.status)]">
            {{ statusLabel(s.status) }}
          </span>
        </div>

        <p class="text-sm text-gray-600 mb-1">{{ typeLabel(s.type) }}</p>

        <!-- Детали предложения -->
        <div class="text-sm">
          <template v-if="s.type === 'time_change'">
            <p>
              Было: <strong>{{ parseData(s.data).oldTime }} мин</strong> →
              Предлагает: <strong class="text-blue-600">{{ parseData(s.data).newTime }} мин</strong>
            </p>
          </template>
          <template v-else-if="s.type === 'new_item'">
            <p class="bg-gray-50 p-2 rounded">{{ parseData(s.data).content }}</p>
            <p class="text-gray-400 mt-1">
              Время: {{ parseData(s.data).timeEstimate }} мин
            </p>
          </template>
          <template v-else-if="s.type === 'comment'">
            <p class="italic">{{ parseData(s.data).text }}</p>
          </template>
        </div>

        <!-- Кнопки одобрить/отклонить (только для pending) -->
        <div v-if="s.status === 'pending'" class="flex gap-2 mt-3">
          <button @click="review(s.id, 'approved')"
                  class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
            Одобрить
          </button>
          <button @click="review(s.id, 'rejected')"
                  class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
            Отклонить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```

### Шаг 2: Добавить на страницу ТЗ

В `SpecificationPage.vue`:

```javascript
import SuggestionsPanel from '../components/SuggestionsPanel.vue'
```

```html
<!-- После разделов ТЗ -->
<SuggestionsPanel
  :specification-id="specification.id"
  @updated="loadSpecification" />
```

### Шаг 3: Добавить suggestions в контроллер спецификаций

В `specificationController.js` в функции `getById` добавь включение suggestions:

```javascript
const spec = await prisma.specification.findFirst({
  where: { id, userId: req.userId },
  include: {
    sections: {
      orderBy: { position: 'asc' },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: { attachments: true }
        }
      }
    },
    suggestions: {                    // ← добавляем
      orderBy: { createdAt: 'desc' }
    }
  }
})
```

### Шаг 4: Экспорт после согласования

Теперь полный флоу:
1. Менеджер создаёт ТЗ и нажимает "Поделиться" → получает ссылку с ролью "Редактор"
2. Редактор открывает ссылку → видит ТЗ → меняет время, добавляет пункты
3. Менеджер видит предложения → одобряет или отклоняет
4. После согласования → выбирает формат (PDF/DOC) и скачивает итоговый документ

### Проверка

1. Создай ТЗ с несколькими разделами и пунктами
2. Нажми "Поделиться" → создай ссылку с ролью "Редактор"
3. Открой ссылку в другом браузере (или в приватном режиме)
4. Нажми "Изменить" у времени → введи новое время → "Предложение отправлено!"
5. Нажми "Предложить пункт" → заполни → отправь
6. Вернись в основной браузер → обнови страницу ТЗ → видишь панель предложений
7. Одобри предложение времени → время пункта изменилось
8. Одобри новый пункт → он появился в разделе
9. Скачай в PDF/DOC — все изменения на месте

---

# ЧАСТЬ 25: ИМПОРТ АУДИОФАЙЛОВ ДЛЯ РАСШИФРОВКИ ⬜

## Урок 25.1: Backend — расшифровка загруженного аудио

### Зачем

Сейчас можно записать голос через микрофон. Но бывает что запись уже есть — голосовое сообщение из Telegram, запись совещания, аудиозаметка. Добавим возможность загрузить аудиофайл и получить текст.

### Шаг 1: Установка зависимостей

```bash
cd backend
npm install fluent-ffmpeg
```

Также нужен **FFmpeg** — конвертер аудио/видео:

**Windows:**
1. Скачай с https://ffmpeg.org/download.html (build от gyan.dev)
2. Распакуй в `C:\ffmpeg`
3. Добавь `C:\ffmpeg\bin` в системную переменную PATH
4. Перезапусти терминал
5. Проверь: `ffmpeg -version`

### Шаг 2: Middleware для аудиофайлов

Создай `backend/src/middleware/audioUpload.js`:

```javascript
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// ========================================
// Папка для загруженных аудио
// ========================================
const audioDir = path.join(__dirname, '../../uploads/audio')
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, audioDir),
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${Math.round(Math.random() * 1000)}${path.extname(file.originalname)}`
    cb(null, name)
  }
})

// ========================================
// Разрешённые MIME-типы аудио
//
// audio/mpeg — MP3
// audio/wav — WAV
// audio/ogg — OGG (Telegram голосовые)
// audio/webm — WebM (запись в браузере)
// audio/mp4 — M4A (iPhone записи)
// audio/x-m4a — M4A альтернативный MIME
// ========================================
const fileFilter = (req, file, cb) => {
  const allowed = [
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    'audio/webm', 'audio/mp4', 'audio/x-m4a',
    'audio/flac', 'audio/aac'
  ]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Неподдерживаемый формат: ${file.mimetype}`), false)
  }
}

const audioUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024  // 50 МБ максимум
  }
})

module.exports = audioUpload
```

### Шаг 3: Сервис расшифровки аудиофайлов

Создай `backend/src/services/audioTranscriptionService.js`:

```javascript
// ========================================
// Сервис расшифровки аудиофайлов
//
// Принцип работы:
// 1. Конвертируем аудио в WAV (16kHz, mono) через FFmpeg
// 2. Отправляем в Whisper (локальная модель через Ollama)
//    или в Google Speech API
//
// Whisper — модель OpenAI для распознавания речи
// Работает локально через Ollama, бесплатно
// ========================================

const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const path = require('path')

/**
 * Конвертация аудио в WAV формат
 *
 * Whisper лучше работает с WAV 16kHz mono
 * FFmpeg конвертирует любой формат
 *
 * @param {string} inputPath — путь к исходному файлу
 * @returns {string} — путь к WAV файлу
 */
function convertToWav(inputPath) {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath.replace(path.extname(inputPath), '.wav')

    ffmpeg(inputPath)
      .audioFrequency(16000)     // 16 кГц — стандарт для speech recognition
      .audioChannels(1)          // mono — один канал
      .audioCodec('pcm_s16le')   // 16-bit PCM — без сжатия
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run()
  })
}

/**
 * Расшифровка аудио через Whisper (Ollama)
 *
 * Ollama поддерживает модель whisper для транскрибации
 * Если Whisper не установлен — фолбэк на Web Speech API
 *
 * @param {string} filePath — путь к аудиофайлу
 * @returns {string} — расшифрованный текст
 */
async function transcribeAudio(filePath) {
  const wavPath = await convertToWav(filePath)

  try {
    // ========================================
    // Вариант 1: Whisper через Ollama
    // Отправляем аудио как base64
    // ========================================
    const audioBuffer = fs.readFileSync(wavPath)
    const base64Audio = audioBuffer.toString('base64')

    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'whisper',
        prompt: base64Audio,
        stream: false
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.response || ''
    }

    // ========================================
    // Вариант 2: Фолбэк — возвращаем ошибку
    // На фронте пользователь может скопировать
    // текст из другого сервиса
    // ========================================
    throw new Error('Whisper не доступен')

  } catch (error) {
    console.error('Ошибка транскрибации:', error.message)
    throw new Error(
      'Не удалось расшифровать аудио. Убедитесь что Whisper установлен: ollama pull whisper'
    )
  } finally {
    // Удаляем временный WAV
    if (fs.existsSync(wavPath) && wavPath !== filePath) {
      fs.unlinkSync(wavPath)
    }
  }
}

/**
 * Получение длительности аудио
 *
 * @param {string} filePath — путь к файлу
 * @returns {number} — длительность в секундах
 */
function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err)
      resolve(Math.round(metadata.format.duration || 0))
    })
  })
}

module.exports = { transcribeAudio, getAudioDuration, convertToWav }
```

### Шаг 4: Роут загрузки аудио

Создай `backend/src/routes/audioTranscription.js`:

```javascript
const express = require('express')
const { authenticate } = require('../middleware/auth')
const audioUpload = require('../middleware/audioUpload')
const { transcribeAudio, getAudioDuration } = require('../services/audioTranscriptionService')
const fs = require('fs')

const router = express.Router()

/**
 * POST /api/audio/transcribe
 *
 * Загружает аудиофайл и возвращает расшифрованный текст
 *
 * Поток:
 * 1. Multer сохраняет файл на диск
 * 2. FFmpeg конвертирует в WAV
 * 3. Whisper расшифровывает
 * 4. Удаляем исходный файл
 * 5. Возвращаем текст
 */
router.post('/transcribe', authenticate, audioUpload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' })
  }

  try {
    // Получаем длительность для информации
    const duration = await getAudioDuration(req.file.path)

    // Расшифровываем
    const text = await transcribeAudio(req.file.path)

    res.json({
      text,
      duration,
      filename: req.file.originalname
    })
  } catch (error) {
    console.error('Ошибка расшифровки аудио:', error)
    res.status(500).json({ error: error.message })
  } finally {
    // Удаляем загруженный файл (он больше не нужен)
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
  }
})

module.exports = router
```

Подключи в `backend/src/index.js`:

```javascript
const audioRoutes = require('./routes/audioTranscription')
app.use('/api/audio', audioRoutes)
```

---

## Урок 25.2: Frontend — кнопка импорта аудио

### Шаг 1: Компонент AudioImport

Создай `frontend/src/components/AudioImport.vue`:

```vue
<script setup>
import { ref } from 'vue'
import api from '../api'

const emit = defineEmits(['transcribed'])

const file = ref(null)
const transcribing = ref(false)
const progress = ref('')
const dragover = ref(false)

// ========================================
// Допустимые расширения
// ========================================
const acceptTypes = '.mp3,.wav,.ogg,.webm,.m4a,.flac,.aac'

function onFileSelect(event) {
  file.value = event.target.files[0]
  if (file.value) transcribe()
}

function onDrop(e) {
  e.preventDefault()
  dragover.value = false
  file.value = e.dataTransfer.files[0]
  if (file.value) transcribe()
}

async function transcribe() {
  if (!file.value) return

  transcribing.value = true
  progress.value = 'Загрузка файла...'

  try {
    const formData = new FormData()
    formData.append('audio', file.value)

    progress.value = 'Расшифровка аудио (это может занять некоторое время)...'

    const response = await api.post('/audio/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000  // 5 минут таймаут для длинных записей
    })

    emit('transcribed', {
      text: response.data.text,
      duration: response.data.duration,
      filename: response.data.filename
    })

    progress.value = ''
    file.value = null
  } catch (e) {
    progress.value = ''
    alert('Ошибка расшифровки: ' + (e.response?.data?.error || e.message))
  } finally {
    transcribing.value = false
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' Б'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ'
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ'
}
</script>

<template>
  <div>
    <!-- Зона загрузки -->
    <div :class="[
           'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
           dragover ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
         ]"
         @dragover.prevent="dragover = true"
         @dragleave="dragover = false"
         @drop="onDrop">

      <!-- Статус расшифровки -->
      <div v-if="transcribing" class="space-y-2">
        <div class="animate-pulse text-blue-500 font-medium">
          {{ progress }}
        </div>
        <div v-if="file" class="text-sm text-gray-400">
          {{ file.name }} ({{ formatSize(file.size) }})
        </div>
      </div>

      <!-- Выбор файла -->
      <div v-else>
        <p class="text-gray-500 mb-2">
          Перетащите аудиофайл или
        </p>
        <label class="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded
                      cursor-pointer hover:bg-gray-200 transition-colors">
          Выберите файл
          <input type="file" :accept="acceptTypes" class="hidden" @change="onFileSelect" />
        </label>
        <p class="text-xs text-gray-400 mt-2">
          MP3, WAV, OGG, WebM, M4A, FLAC. Максимум 50 МБ
        </p>
      </div>
    </div>
  </div>
</template>
```

### Шаг 2: Интеграция в NewSpecificationPage

В `frontend/src/pages/NewSpecificationPage.vue` добавь:

```javascript
import AudioImport from '../components/AudioImport.vue'
```

В шаблон, рядом с кнопкой записи голоса:

```html
<!-- Табы: запись / загрузка файла -->
<div class="flex gap-2 mb-4">
  <button @click="inputMode = 'mic'"
          :class="['px-4 py-2 rounded text-sm', inputMode === 'mic' ? 'bg-blue-500 text-white' : 'bg-gray-100']">
    Микрофон
  </button>
  <button @click="inputMode = 'file'"
          :class="['px-4 py-2 rounded text-sm', inputMode === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-100']">
    Загрузить аудио
  </button>
</div>

<!-- Режим микрофона -->
<div v-if="inputMode === 'mic'">
  <!-- Существующий SpeechRecorder -->
</div>

<!-- Режим загрузки аудио -->
<div v-if="inputMode === 'file'">
  <AudioImport @transcribed="onAudioTranscribed" />
</div>
```

В `<script setup>`:

```javascript
const inputMode = ref('mic')  // 'mic' | 'file'

function onAudioTranscribed({ text, duration, filename }) {
  // Добавляем расшифрованный текст в поле
  voiceText.value = (voiceText.value ? voiceText.value + '\n\n' : '') + text
}
```

### Проверка

1. Открой страницу создания ТЗ
2. Переключись на вкладку "Загрузить аудио"
3. Выбери MP3/OGG файл → начинается расшифровка
4. Через некоторое время текст появляется в поле
5. Нажми "Структурировать через AI" — работает как обычно

---

# ЧАСТЬ 26: СМЕНА AI-МОДЕЛИ НА БОЛЕЕ МОЩНУЮ ⬜

## Урок 26.1: Выбор модели под твоё железо

### Твоё железо

- CPU: Intel i5-14400F (10 ядер, 2.5 ГГц)
- RAM: 32 ГБ
- GPU: NVIDIA RTX 5060 Ti 16 ГБ VRAM

### Зачем менять модель

Сейчас используется `qwen2.5:7b` — она хорошая, но с твоим железом можно запустить более мощные модели. Больше параметров = лучше понимание контекста, точнее структурирование, меньше ошибок в JSON.

### Что можно запустить

С 16 ГБ VRAM и 32 ГБ RAM доступны следующие модели:

| Модель | Размер | VRAM | Качество русского | Скорость |
|--------|--------|------|-------------------|----------|
| `qwen2.5:7b` | 4.5 ГБ | ~5 ГБ | Хорошее | Быстро |
| `qwen2.5:14b` | 8.5 ГБ | ~10 ГБ | Очень хорошее | Средне |
| `qwen2.5:32b-q4_K_M` | ~18 ГБ | ~14 ГБ | Отличное | Медленнее |
| `gemma3:12b` | 7 ГБ | ~9 ГБ | Хорошее | Средне |
| `llama3.1:8b` | 4.7 ГБ | ~6 ГБ | Среднее | Быстро |
| `mistral:7b` | 4 ГБ | ~5 ГБ | Среднее | Быстро |
| `deepseek-r1:14b` | 8.5 ГБ | ~10 ГБ | Очень хорошее | Средне |

**Рекомендация:** `qwen2.5:14b` — лучший баланс качества и скорости для твоего железа. Если хочешь максимальное качество и готов подождать — `qwen2.5:32b-q4_K_M` (квантизация q4 поместится в 16 ГБ VRAM).

### Шаг 1: Загрузка новой модели

```bash
# Рекомендуемая — отличное качество, быстрая на RTX 5060 Ti
ollama pull qwen2.5:14b

# Или максимальное качество (медленнее, но мощнее)
ollama pull qwen2.5:32b-q4_K_M
```

### Шаг 2: Проверка модели

```bash
# Тестируем на русском тексте
ollama run qwen2.5:14b "Структурируй следующий текст в JSON с полями title и items: Нужно сделать интернет-магазин с каталогом товаров, корзиной и оплатой через Stripe"
```

Убедись что модель возвращает валидный JSON на русском языке.

### Шаг 3: Обновить .env

```env
OLLAMA_MODEL=qwen2.5:14b
```

Перезапусти backend — всё, приложение использует новую модель.

---

## Урок 26.2: Селектор модели в интерфейсе

### Зачем

Позволим пользователю выбирать модель прямо в интерфейсе — для разных задач разные модели. Быстрая 7b для простых ТЗ, мощная 14b/32b для сложных.

### Шаг 1: Роут получения списка моделей

Добавь в `backend/src/routes/ai.js`:

```javascript
/**
 * GET /api/ai/models
 *
 * Запрашиваем у Ollama список установленных моделей
 * Ollama API: GET /api/tags
 */
router.get('/models', authenticate, async (req, res) => {
  try {
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'

    const response = await fetch(`${OLLAMA_URL}/api/tags`)
    const data = await response.json()

    // ========================================
    // Фильтруем и форматируем
    // data.models — массив установленных моделей
    // Возвращаем только имя и размер
    // ========================================
    const models = (data.models || []).map(m => ({
      name: m.name,
      size: m.size,
      sizeFormatted: (m.size / (1024 * 1024 * 1024)).toFixed(1) + ' ГБ'
    }))

    // Помечаем текущую модель
    const currentModel = process.env.OLLAMA_MODEL || 'qwen2.5:7b'

    res.json({
      models,
      current: currentModel
    })
  } catch (error) {
    console.error('Ошибка получения моделей:', error)
    res.status(500).json({ error: 'Ollama не доступна' })
  }
})
```

### Шаг 2: Передача модели в structureText

Обнови `backend/src/services/aiService.js`:

```javascript
/**
 * @param {string} text — текст для структурирования
 * @param {string|null} customPrompt — кастомный промпт
 * @param {string|null} model — модель Ollama (null = из .env)
 */
async function structureText(text, customPrompt = null, model = null) {
  const basePrompt = customPrompt || DEFAULT_PROMPT
  const useModel = model || OLLAMA_MODEL

  const prompt = `${basePrompt}

            Текст от заказчика:
${text}`

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: useModel,       // ← теперь динамическая модель
      prompt,
      stream: false
    })
  })

  // ... остальная обработка без изменений
}
```

### Шаг 3: Обновить роут AI-структурирования

В `backend/src/routes/ai.js`:

```javascript
router.post('/structure', authenticate, async (req, res) => {
  try {
    const { text, promptId, model } = req.body   // ← добавили model

    // ... валидация и получение промпта ...

    const structured = await structureText(text, customPrompt, model)
    res.json(structured)
  } catch (error) {
    console.error('Ошибка AI-структурирования:', error)
    res.status(500).json({ error: error.message })
  }
})
```

### Шаг 4: Селектор модели на фронтенде

В `frontend/src/pages/NewSpecificationPage.vue` добавь:

```javascript
const models = ref([])
const selectedModel = ref(null)

// Загрузка списка моделей
onMounted(async () => {
  // ... существующий код ...

  try {
    const response = await api.get('/ai/models')
    models.value = response.data.models
    selectedModel.value = response.data.current
  } catch (e) {
    console.error('Не удалось загрузить модели:', e)
  }
})
```

В шаблон, рядом с селектором промптов:

```html
<!-- Селектор модели AI -->
<div class="mt-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
  <select v-model="selectedPromptId"
          class="border rounded px-3 py-2 text-sm flex-1 sm:max-w-xs">
    <option :value="null">Стандартный промпт</option>
    <option v-for="p in prompts" :key="p.id" :value="p.id">
      {{ p.title }}
    </option>
  </select>

  <!-- Выбор модели -->
  <select v-if="models.length > 1" v-model="selectedModel"
          class="border rounded px-3 py-2 text-sm sm:max-w-xs">
    <option v-for="m in models" :key="m.name" :value="m.name">
      {{ m.name }} ({{ m.sizeFormatted }})
    </option>
  </select>

  <button @click="structureWithAI" :disabled="isStructuring"
          class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50">
    {{ isStructuring ? 'AI обрабатывает...' : 'Структурировать через AI' }}
  </button>
</div>
```

Передавай модель в запросы:

```javascript
// В structureWithAI:
const response = await api.post('/ai/structure', {
  text: voiceText.value,
  promptId: selectedPromptId.value,
  model: selectedModel.value         // ← добавляем
})
```

### Проверка

1. Установи несколько моделей: `ollama pull qwen2.5:14b`
2. Открой страницу создания ТЗ
3. Рядом с селектором промптов появился селектор модели
4. Выбери `qwen2.5:14b` → структурируй текст → результат должен быть точнее
5. Сравни скорость и качество разных моделей

---

## Урок 26.3: GPU-ускорение Ollama для RTX 5060 Ti

### Зачем

По умолчанию Ollama уже использует GPU если он доступен. Но стоит убедиться что это работает правильно и настроить параметры.

### Шаг 1: Проверка GPU

```bash
# Проверяем что Ollama видит GPU
ollama ps
```

В выводе должно быть `gpu` в столбце processor. Если видишь `cpu` — нужна настройка.

### Шаг 2: Установка CUDA (если ещё нет)

RTX 5060 Ti требует CUDA 12.x:

1. Скачай CUDA Toolkit с https://developer.nvidia.com/cuda-downloads
2. Установи с настройками по умолчанию
3. Перезагрузи компьютер
4. Проверь: `nvidia-smi` — должна показать GPU

### Шаг 3: Настройка параметров Ollama

Создай файл переменных окружения для Ollama (Windows):

```
Системные переменные → Новая:
  Имя: OLLAMA_NUM_GPU
  Значение: 999
```

Это говорит Ollama использовать все доступные слои GPU. С 16 ГБ VRAM модель `qwen2.5:14b` полностью поместится в видеопамять.

### Шаг 4: Оптимальные параметры генерации

Обнови `aiService.js` — добавь параметры для лучшего качества:

```javascript
const response = await fetch(`${OLLAMA_URL}/api/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: useModel,
    prompt,
    stream: false,
    options: {
      // ========================================
      // Параметры генерации
      //
      // temperature: 0.3 — низкая "креативность"
      //   Для JSON нужны точные, предсказуемые ответы
      //   0 = полностью детерминированный
      //   1 = максимально случайный
      //
      // num_ctx: 8192 — размер контекста
      //   Сколько токенов модель "помнит"
      //   8192 достаточно для большинства ТЗ
      //   С 16 ГБ VRAM можно и 16384
      //
      // num_predict: 4096 — максимальная длина ответа
      //   Для больших ТЗ нужно больше токенов
      // ========================================
      temperature: 0.3,
      num_ctx: 8192,
      num_predict: 4096
    }
  })
})
```

### Проверка

1. Запусти `nvidia-smi` — GPU видна
2. Запусти `ollama ps` — модель использует GPU
3. Структурируй текст через AI — скорость выше чем на CPU
4. `qwen2.5:14b` на RTX 5060 Ti должна выдавать ~20-40 токенов/сек

---

# ИТОГОВАЯ СТРУКТУРА ПРОЕКТА

```
task_generator/
├── backend/
│   ├── src/
│   │   ├── index.js                    # Точка входа Express
│   │   ├── db.js                       # Prisma Client
│   │   ├── controllers/
│   │   │   ├── authController.js       # Регистрация, логин
│   │   │   ├── projectController.js    # CRUD проектов
│   │   │   ├── specificationController.js  # CRUD ТЗ
│   │   │   ├── promptController.js        # CRUD промптов AI
│   │   │   └── shareController.js         # Шаринг ТЗ + предложения
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT проверка + роли
│   │   │   ├── upload.js               # Multer для файлов
│   │   │   └── audioUpload.js          # Multer для аудиофайлов
│   │   ├── routes/
│   │   │   ├── auth.js                 # /api/auth/*
│   │   │   ├── projects.js             # /api/projects/*
│   │   │   ├── ai.js                   # /api/ai/*
│   │   │   ├── transcription.js        # /api/transcription
│   │   │   ├── audioTranscription.js   # /api/audio/*
│   │   │   ├── attachments.js          # /api/attachments/*
│   │   │   ├── export.js               # /api/export/* (PDF + DOC)
│   │   │   ├── share.js                # /api/share/*
│   │   │   ├── bitrix.js               # /api/bitrix/*
│   │   │   └── prompts.js             # /api/prompts/*
│   │   └── services/
│   │       ├── aiService.js            # Ollama AI
│   │       ├── pdfService.js           # Puppeteer PDF
│   │       ├── docService.js           # DOCX генерация
│   │       ├── audioTranscriptionService.js # Whisper транскрибация
│   │       ├── transcriptionService.js # Google Speech
│   │       └── bitrixService.js        # Bitrix24 API
│   ├── prisma/
│   │   └── schema.prisma              # Схема БД
│   ├── uploads/                       # Загруженные файлы
│   │   └── audio/                     # Временные аудиофайлы
│   ├── credentials/                   # API ключи (в .gitignore!)
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.js                    # Точка входа Vue
│   │   ├── App.vue                    # Корневой компонент
│   │   ├── style.css                  # TailwindCSS
│   │   ├── api/
│   │   │   └── index.js               # Axios HTTP клиент
│   │   ├── router/
│   │   │   └── index.js               # Vue Router
│   │   ├── stores/
│   │   │   └── auth.js                # Стор авторизации
│   │   ├── composables/
│   │   │   ├── useSpeechRecognition.js   # Web Speech API
│   │   │   └── useServerTranscription.js # Google Cloud Speech
│   │   ├── components/
│   │   │   ├── AppLayout.vue           # Навигация + layout
│   │   │   ├── LoginForm.vue           # Форма входа
│   │   │   ├── SpeechRecorder.vue      # Запись голоса
│   │   │   ├── ItemAttachments.vue     # Скриншоты к пунктам ТЗ
│   │   │   ├── ShareDialog.vue         # Диалог шаринга ТЗ
│   │   │   ├── SuggestionsPanel.vue    # Панель предложений
│   │   │   └── AudioImport.vue         # Импорт аудиофайлов
│   │   └── pages/
│   │       ├── LoginPage.vue           # Страница входа
│   │       ├── RegisterPage.vue        # Страница регистрации
│   │       ├── DashboardPage.vue       # Дашборд
│   │       ├── ProjectsPage.vue        # Список проектов
│   │       ├── PromptsPage.vue         # Управление промптами AI
│   │       ├── RecordPage.vue          # Запись голоса
│   │       ├── NewSpecificationPage.vue # Создание ТЗ
│   │       ├── SpecificationPage.vue   # Просмотр ТЗ
│   │       └── SharedSpecificationPage.vue # Просмотр по ссылке
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
├── CLAUDE.md
├── COURSE.md
└── todo.md
```

---

# ПОЛЕЗНЫЕ КОМАНДЫ

```bash
# Backend
cd backend
npm run dev              # Запуск сервера
npx prisma studio        # GUI для базы данных
npx prisma db push       # Применить изменения схемы

# Frontend
cd frontend
npm run dev              # Запуск dev сервера
npm run build            # Сборка для продакшена
```

---

# ПОРЯДОК РЕАЛИЗАЦИИ (РЕКОМЕНДАЦИЯ)

1. Исправить баги в существующем коде (Часть 8.1 — авто-перезапуск)
2. Добавить Vue Router и страницы (Часть 9)
3. Реализовать backend CRUD проектов и ТЗ (Части 4-5 из кода)
4. Создать UI проектов (Часть 10)
5. Создать UI ТЗ (Часть 11)
6. Подключить AI-структурирование (Часть 12)
7. Добавить загрузку файлов (Часть 13)
8. Добавить Drag & Drop (Часть 14)
9. Добавить PDF-экспорт (Часть 15)
10. Интегрировать Bitrix24 (Часть 16)
11. Удалённый доступ через ngrok (Часть 17)
12. Админ-панель (Часть 18)
13. Загрузка документов для генерации ТЗ (Часть 19)
14. Выбор CRM-системы для оценки ТЗ (Часть 20)
15. Опционально: серверная транскрибация (Часть 8.2)
16. Управление промптами и кастомизация AI (Часть 21)
17. Экспорт в DOC (Часть 22)
18. Прикрепление скриншотов к пунктам ТЗ (Часть 23)
19. Шаринг ТЗ и совместное редактирование (Часть 24)
20. Импорт аудиофайлов для расшифровки (Часть 25)
21. Смена AI-модели на более мощную (Часть 26)
