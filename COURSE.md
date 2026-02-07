# Курс: Создание системы генерации ТЗ из голоса

## Введение

Мы создадим веб-приложение где пользователь:
1. Говорит в микрофон
2. Речь преобразуется в текст
3. Текст структурируется в пункты ТЗ
4. ТЗ можно редактировать и экспортировать в PDF

**Стек:**
- Frontend: Vue 3 + JavaScript + TailwindCSS
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
│   │   │   └── specificationController.js  # CRUD ТЗ
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT проверка + роли
│   │   │   └── upload.js               # Multer для файлов
│   │   ├── routes/
│   │   │   ├── auth.js                 # /api/auth/*
│   │   │   ├── projects.js             # /api/projects/*
│   │   │   ├── ai.js                   # /api/ai/*
│   │   │   ├── transcription.js        # /api/transcription
│   │   │   ├── attachments.js          # /api/attachments/*
│   │   │   ├── export.js               # /api/export/*
│   │   │   └── bitrix.js               # /api/bitrix/*
│   │   └── services/
│   │       ├── aiService.js            # Gemini AI
│   │       ├── pdfService.js           # Puppeteer PDF
│   │       ├── transcriptionService.js # Google Speech
│   │       └── bitrixService.js        # Bitrix24 API
│   ├── prisma/
│   │   └── schema.prisma              # Схема БД
│   ├── uploads/                       # Загруженные файлы
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
│   │   │   └── SpeechRecorder.vue      # Запись голоса
│   │   └── pages/
│   │       ├── LoginPage.vue           # Страница входа
│   │       ├── RegisterPage.vue        # Страница регистрации
│   │       ├── DashboardPage.vue       # Дашборд
│   │       ├── ProjectsPage.vue        # Список проектов
│   │       ├── RecordPage.vue          # Запись голоса
│   │       ├── NewSpecificationPage.vue # Создание ТЗ
│   │       └── SpecificationPage.vue   # Просмотр ТЗ
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
11. Опционально: серверная транскрибация (Часть 8.2)
