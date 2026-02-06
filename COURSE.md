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

# ЧАСТЬ 4: CRUD ПРОЕКТОВ ⬜

## Урок 4.1: API для проектов (Backend) ⬜

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

# ЧАСТЬ 5: CRUD ТЕХНИЧЕСКИХ ЗАДАНИЙ ⬜

## Урок 5.1: API для ТЗ ⬜

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

# ЧАСТЬ 6: ЗАГОТОВКА ДЛЯ AI ⬜

## Урок 6.1: Интерфейс AI сервиса ⬜

Создай файл `src/services/aiService.js`:

```javascript
// Заглушка для AI сервиса
// Позже здесь будет реальная интеграция с Gemini/OpenAI/Claude

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

# ЧАСТЬ 8: НАДЁЖНАЯ ТРАНСКРИБАЦИЯ ⬜

## Проблема Web Speech API

Web Speech API останавливается при:
- Длинных паузах (>5 сек без речи)
- Длительной записи (браузер обрывает соединение)
- Потере сети (аудио идёт на серверы Google)

Это делает его непригодным для записи длинных ТЗ. Есть два решения:
1. **Авто-перезапуск** — быстрый фикс, бесплатно, но всё ещё зависит от браузера
2. **Google Cloud Speech-to-Text API** — надёжно, бесплатный лимит 60 мин/месяц

Мы реализуем **оба** варианта — пользователь сможет выбрать.

---

## Урок 8.1: Авто-перезапуск Web Speech API ⬜

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

## Урок 8.2: Google Cloud Speech-to-Text API (серверная транскрибация) ⬜

### Теория

Подход: записываем аудио через `MediaRecorder` API в браузере → отправляем файл на наш backend → backend отправляет на Google Cloud Speech-to-Text → получаем текст.

**Преимущества:**
- Не зависит от браузера (работает везде)
- Не обрывается на длинных записях
- Выше качество распознавания
- Бесплатный лимит: 60 минут в месяц

### Шаг 1: Получение API ключа Google

1. Перейди на https://console.cloud.google.com
2. Создай новый проект (или выбери существующий)
3. Включи **Cloud Speech-to-Text API** в разделе APIs & Services
4. Создай **Service Account** в IAM → Service Accounts
5. Скачай JSON-ключ и сохрани в `backend/credentials/google-speech.json`
6. Добавь в `.env`:

```env
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-speech.json
```

7. Добавь `credentials/` в `.gitignore` — **НИКОГДА не коммить ключи!**

### Шаг 2: Установка зависимости на backend

```bash
cd backend
npm install @google-cloud/speech multer
```

- `@google-cloud/speech` — клиент Google Speech-to-Text
- `multer` — парсинг multipart/form-data (загрузка файлов)

### Шаг 3: Сервис транскрибации

Создай файл `src/services/transcriptionService.js`:

```javascript
const speech = require('@google-cloud/speech')

// ========================================
// Создаём клиент Google Speech-to-Text
//
// Клиент автоматически ищет credentials из
// переменной GOOGLE_APPLICATION_CREDENTIALS
// ========================================
const client = new speech.SpeechClient()

/**
 * Транскрибация аудио-файла
 *
 * @param {Buffer} audioBuffer — бинарные данные аудио
 * @param {string} mimeType — MIME тип (audio/webm, audio/wav и т.д.)
 * @returns {string} — распознанный текст
 *
 * Как работает:
 * 1. Конвертируем Buffer в base64 строку (Google API требует)
 * 2. Указываем кодек и язык
 * 3. Отправляем на сервер Google
 * 4. Получаем массив результатов с альтернативами
 * 5. Собираем текст из лучших альтернатив
 */
async function transcribeAudio(audioBuffer, mimeType) {
  // Определяем кодировку по MIME типу
  // MediaRecorder в Chrome записывает в WebM/Opus
  const encoding = mimeType.includes('webm') ? 'WEBM_OPUS' : 'LINEAR16'

  const request = {
    audio: {
      // Google API принимает аудио в base64
      content: audioBuffer.toString('base64')
    },
    config: {
      encoding,
      // sampleRateHertz не нужен для WEBM_OPUS — определяется автоматически
      languageCode: 'ru-RU',

      // Улучшения качества распознавания:
      enableAutomaticPunctuation: true,  // Автоматические точки и запятые
      model: 'latest_long',             // Модель для длинных записей

      // Альтернативные языки (если говорят английские термины)
      alternativeLanguageCodes: ['en-US']
    }
  }

  const [response] = await client.recognize(request)

  // response.results — массив фрагментов речи
  // Каждый фрагмент имеет alternatives — варианты распознавания
  // alternatives[0] — лучший вариант
  const text = response.results
    .map(result => result.alternatives[0].transcript)
    .join(' ')

  return text
}

module.exports = { transcribeAudio }
```

### Шаг 4: Эндпоинт транскрибации

Создай файл `src/routes/transcription.js`:

```javascript
const express = require('express')
const multer = require('multer')
const { authenticate } = require('../middleware/auth')
const { transcribeAudio } = require('../services/transcriptionService')

const router = express.Router()

// ========================================
// Настройка multer
//
// storage: memoryStorage() — файл хранится в RAM как Buffer
// Не сохраняем на диск — сразу отправляем в Google API
// limits: 10MB максимум (примерно 10 минут записи)
// ========================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
})

// ========================================
// POST /api/transcription
//
// Принимает: multipart/form-data с полем "audio"
// Возвращает: { text: "распознанный текст" }
//
// Поток данных:
// Браузер (MediaRecorder) → multer (парсит файл) → Google API → ответ
// ========================================
router.post('/', authenticate, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Аудио файл не получен' })
    }

    const text = await transcribeAudio(req.file.buffer, req.file.mimetype)

    res.json({ text })
  } catch (error) {
    console.error('Ошибка транскрибации:', error)
    res.status(500).json({ error: 'Ошибка распознавания речи' })
  }
})

module.exports = router
```

### Шаг 5: Подключение роута

В `src/index.js` добавь:

```javascript
const transcriptionRoutes = require('./routes/transcription')

// После остальных app.use(...)
app.use('/api/transcription', transcriptionRoutes)
```

### Шаг 6: Composable для серверной транскрибации (Frontend)

Создай файл `src/composables/useServerTranscription.js`:

```javascript
import { ref } from 'vue'
import api from '../api'

/**
 * Composable для серверной транскрибации через Google Speech API
 *
 * В отличие от useSpeechRecognition (браузерный):
 * - Работает в любом браузере с поддержкой MediaRecorder
 * - Не обрывается на длинных записях
 * - Отправляет аудио на наш сервер → Google API
 *
 * Минус: текст появляется только после остановки записи
 * (нет промежуточных результатов в реальном времени)
 */
export function useServerTranscription() {
  const isRecording = ref(false)
  const isProcessing = ref(false)
  const transcript = ref('')
  const error = ref(null)

  let mediaRecorder = null
  let audioChunks = []

  // ========================================
  // Проверка поддержки MediaRecorder
  // Поддерживается во всех современных браузерах
  // ========================================
  const isSupported = typeof MediaRecorder !== 'undefined'

  /**
   * Начать запись
   *
   * 1. Запрашиваем доступ к микрофону (navigator.mediaDevices.getUserMedia)
   * 2. Создаём MediaRecorder — он записывает аудиопоток
   * 3. ondataavailable — каждый чанк аудио добавляем в массив
   * 4. onstop — когда запись остановлена, собираем чанки в Blob
   */
  async function start() {
    try {
      error.value = null
      audioChunks = []

      // Запрашиваем доступ к микрофону
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Создаём рекордер
      // mimeType: 'audio/webm' — формат который понимает Google API
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      // Каждый раз когда готов кусок аудио — сохраняем
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      // Когда запись остановлена — отправляем на сервер
      mediaRecorder.onstop = async () => {
        // Собираем все чанки в один Blob
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        await sendToServer(audioBlob)

        // Останавливаем все треки микрофона (освобождаем устройство)
        stream.getTracks().forEach(track => track.stop())
      }

      // Запускаем запись
      // timeslice: 1000 — получать чанки каждую секунду
      mediaRecorder.start(1000)
      isRecording.value = true

    } catch (e) {
      if (e.name === 'NotAllowedError') {
        error.value = 'Доступ к микрофону запрещён'
      } else {
        error.value = 'Ошибка запуска записи: ' + e.message
      }
    }
  }

  /**
   * Остановить запись
   * Вызывает mediaRecorder.stop() → срабатывает onstop → отправка на сервер
   */
  function stop() {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
      isRecording.value = false
    }
  }

  /**
   * Отправить аудио на backend для транскрибации
   *
   * FormData — специальный объект для отправки файлов
   * Axios автоматически ставит Content-Type: multipart/form-data
   */
  async function sendToServer(audioBlob) {
    isProcessing.value = true
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await api.post('/transcription', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Добавляем новый текст к существующему (можно записывать несколько раз)
      if (response.data.text) {
        transcript.value += (transcript.value ? ' ' : '') + response.data.text
      }
    } catch (e) {
      error.value = e.response?.data?.error || 'Ошибка распознавания'
    } finally {
      isProcessing.value = false
    }
  }

  function clear() {
    transcript.value = ''
  }

  return {
    isSupported,
    isRecording,
    isProcessing,  // true пока сервер обрабатывает аудио
    transcript,
    error,
    start,
    stop,
    clear
  }
}
```

### Шаг 7: Обновлённый компонент SpeechRecorder

Замени `src/components/SpeechRecorder.vue` — теперь с выбором метода:

```vue
<script setup>
import { ref } from 'vue'
import { useSpeechRecognition } from '../composables/useSpeechRecognition'
import { useServerTranscription } from '../composables/useServerTranscription'

// ========================================
// Два метода транскрибации:
// 'browser' — Web Speech API (бесплатно, реалтайм, но может обрываться)
// 'server'  — Google Cloud API (надёжно, но текст после остановки)
// ========================================
const method = ref('browser')

const browser = useSpeechRecognition()
const server = useServerTranscription()

// Текущий активный метод (computed-подобная логика)
function isListening() {
  return method.value === 'browser' ? browser.isListening.value : server.isRecording.value
}

function currentTranscript() {
  return method.value === 'browser' ? browser.transcript.value : server.transcript.value
}

function currentError() {
  return method.value === 'browser' ? browser.error.value : server.error.value
}

function toggle() {
  if (method.value === 'browser') {
    browser.isListening.value ? browser.stop() : browser.start()
  } else {
    server.isRecording.value ? server.stop() : server.start()
  }
}

function clear() {
  browser.clear()
  server.clear()
}

// Событие — передаёт текст родительскому компоненту
const emit = defineEmits(['transcriptReady'])

function useTranscript() {
  const text = currentTranscript()
  if (text) {
    emit('transcriptReady', text)
  }
}
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Голосовой ввод</h1>

    <!-- Выбор метода -->
    <div class="flex gap-4 mb-6 p-4 bg-gray-50 rounded">
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="radio" v-model="method" value="browser" :disabled="isListening()" />
        <span class="text-sm">
          <strong>Браузерный</strong> — реалтайм, бесплатно
        </span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="radio" v-model="method" value="server" :disabled="isListening()" />
        <span class="text-sm">
          <strong>Серверный</strong> — надёжный, Google API
        </span>
      </label>
    </div>

    <!-- Ошибка поддержки -->
    <div
      v-if="method === 'browser' && !browser.isSupported"
      class="bg-red-100 text-red-700 p-4 rounded mb-4"
    >
      Ваш браузер не поддерживает Web Speech API. Переключитесь на серверный метод.
    </div>

    <!-- Ошибка -->
    <div v-if="currentError()" class="bg-yellow-100 text-yellow-700 p-4 rounded mb-4">
      {{ currentError() }}
    </div>

    <!-- Кнопки управления -->
    <div class="flex gap-4 mb-6">
      <button
        @click="toggle"
        :class="[
          'px-6 py-3 rounded font-medium transition-colors',
          isListening()
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        ]"
      >
        {{ isListening() ? '⏹ Остановить' : '🎤 Начать запись' }}
      </button>

      <button
        v-if="currentTranscript()"
        @click="useTranscript"
        class="px-6 py-3 rounded bg-green-500 hover:bg-green-600 text-white font-medium"
      >
        Использовать текст
      </button>

      <button
        v-if="currentTranscript()"
        @click="clear"
        class="px-6 py-3 rounded bg-gray-200 hover:bg-gray-300"
      >
        Очистить
      </button>
    </div>

    <!-- Индикатор записи -->
    <div v-if="isListening()" class="flex items-center gap-2 text-red-500 mb-4">
      <span class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
      Запись...
    </div>

    <!-- Индикатор обработки (серверный метод) -->
    <div v-if="server.isProcessing.value" class="flex items-center gap-2 text-blue-500 mb-4">
      <span class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
      Распознавание речи...
    </div>

    <!-- Область текста -->
    <div class="border rounded p-4 min-h-[200px] bg-white">
      <template v-if="currentTranscript() || browser.interimTranscript.value">
        {{ currentTranscript() }}
        <span v-if="method === 'browser'" class="text-gray-400">
          {{ browser.interimTranscript.value }}
        </span>
      </template>
      <span v-else class="text-gray-400">
        Нажмите "Начать запись" и говорите...
      </span>
    </div>

    <!-- Статистика -->
    <div v-if="currentTranscript()" class="mt-4 text-sm text-gray-500">
      Символов: {{ currentTranscript().length }}
    </div>
  </div>
</template>
```

**Разница между методами:**

| | Браузерный (Web Speech API) | Серверный (Google Cloud) |
|---|---|---|
| Реалтайм текст | Да (видно пока говоришь) | Нет (текст после остановки) |
| Длинные записи | Авто-перезапуск (может быть пауза) | Без ограничений |
| Стоимость | Бесплатно | 60 мин/мес бесплатно |
| Браузеры | Chrome, Edge | Любой |
| Качество | Хорошее | Отличное (пунктуация, модели) |

---

# ЧАСТЬ 9: VUE ROUTER И НАВИГАЦИЯ ⬜

## Урок 9.1: Установка и настройка ⬜

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

# ЧАСТЬ 10: UI ПРОЕКТОВ ⬜

## Урок 10.1: Страница проектов (Frontend) ⬜

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

---

# ЧАСТЬ 11: UI ТЕХНИЧЕСКИХ ЗАДАНИЙ ⬜

## Урок 11.1: Создание ТЗ из голосового текста ⬜

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

---

# ЧАСТЬ 12: AI-СТРУКТУРИРОВАНИЕ ⬜

## Урок 12.1: Интеграция с Gemini API ⬜

### Теория

Google Gemini API — бесплатный AI для структуризации текста.
- Бесплатный лимит: 60 запросов/мин
- Не требует карту для начала
- Хорошо работает с русским языком

### Шаг 1: Получение API ключа

1. Перейди на https://aistudio.google.com/apikey
2. Нажми "Create API Key"
3. Скопируй ключ и добавь в `.env`:

```env
GEMINI_API_KEY=твой-ключ-здесь
```

### Шаг 2: Установка SDK

```bash
cd backend
npm install @google/generative-ai
```

### Шаг 3: Обновлённый AI-сервис

Замени `src/services/aiService.js`:

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai')

// ========================================
// Инициализация Gemini
//
// GoogleGenerativeAI — SDK от Google
// getGenerativeModel — выбираем модель
// gemini-1.5-flash — быстрая и бесплатная модель
// ========================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

/**
 * Структурирование текста через AI
 *
 * @param {string} text — сырой текст из голосового ввода
 * @returns {Object} — { sections: [{ title, items: [{ content, timeEstimate }] }] }
 *
 * Как работает:
 * 1. Формируем промпт с инструкцией для AI
 * 2. AI анализирует текст и разбивает на разделы и пункты
 * 3. Возвращает JSON-структуру
 * 4. Парсим JSON из ответа AI
 */
async function structureText(text) {
  // ========================================
  // Промпт — инструкция для AI
  //
  // Ключевые моменты:
  // - Просим вернуть ТОЛЬКО JSON (без markdown)
  // - Указываем точную структуру ожидаемого ответа
  // - Просим оценить время (AI умеет примерно оценивать)
  // ========================================
  const prompt = `
Ты — помощник по созданию технических заданий.

Проанализируй текст ниже и структурируй его в техническое задание.
Раздели на логические разделы, каждый раздел содержит пункты.
Для каждого пункта дай оценку времени в минутах.

Верни ТОЛЬКО JSON без markdown-обёртки, строго в формате:
{
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
${text}
`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // ========================================
    // AI может вернуть JSON обёрнутый в ```json ... ```
    // Убираем markdown-обёртку если есть
    // ========================================
    const jsonStr = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    return JSON.parse(jsonStr)
  } catch (error) {
    console.error('Ошибка AI:', error)

    // Fallback: если AI недоступен — простое разделение по предложениям
    const lines = text.split(/[.!?]/).filter(line => line.trim())
    return {
      sections: [{
        title: 'Основные требования',
        items: lines.map(line => ({
          content: line.trim(),
          timeEstimate: null
        }))
      }]
    }
  }
}

module.exports = { structureText }
```

### Шаг 4: Роут для AI

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
 * Ответ: { sections: [...] }
 *
 * Поток: текст → промпт для AI → JSON-структура ТЗ
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
    res.status(500).json({ error: 'Ошибка обработки текста' })
  }
})

module.exports = router
```

### Шаг 5: Подключение в index.js

```javascript
const aiRoutes = require('./routes/ai')

app.use('/api/ai', aiRoutes)
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
