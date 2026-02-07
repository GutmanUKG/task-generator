# Task Generator

Веб-приложение для создания технических заданий из голосовой речи с помощью AI.

Говорите в микрофон — приложение распознает речь, отправляет текст в локальную AI-модель (Ollama), и получает структурированное ТЗ с разделами, пунктами и оценками времени.

## Стек

- **Frontend:** Vue 3 + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **База данных:** MySQL + Prisma ORM
- **Голос:** Web Speech API (Chrome, Edge)
- **AI:** Ollama (локальная модель qwen2.5:7b)
- **Удалённый доступ:** ngrok (туннель для доступа с телефона/другого ПК)

## Требования

- [Node.js](https://nodejs.org/) 18+
- [MySQL](https://dev.mysql.com/downloads/) 8+
- [Ollama](https://ollama.com/) для AI-структурирования
- [ngrok](https://ngrok.com/) для удалённого доступа (опционально)
- Браузер Chrome или Edge (для Web Speech API)

## Установка

### 1. Клонирование

```bash
git clone https://github.com/GutmanUKG/task-generator.git
cd task-generator
```

### 2. Установка Ollama и AI-модели

Скачай и установи Ollama с https://ollama.com

После установки скачай модель:

```bash
ollama pull qwen2.5:7b
```

> Модель весит ~4.5 ГБ. Если мало RAM (< 8 ГБ), используй `qwen2.5:3b`.

Проверь что модель работает:

```bash
ollama run qwen2.5:7b "Привет, ответь одним словом"
```

### 3. Создание базы данных

Создай базу данных MySQL:

```sql
CREATE DATABASE task_generator;
```

### 4. Настройка Backend

```bash
cd backend
npm install
```

Создай файл `.env` в папке `backend`:

```env
PORT=3000
DATABASE_URL="mysql://root:ТВОЙ_ПАРОЛЬ@localhost:3306/task_generator"
JWT_SECRET="замени-на-случайную-строку"
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

> Если MySQL без пароля, оставь `mysql://root:@localhost:3306/task_generator`

Примени миграции базы данных:

```bash
npx prisma migrate dev --name init
```

Сгенерируй Prisma-клиент:

```bash
npx prisma generate
```

### 5. Настройка Frontend

```bash
cd ../frontend
npm install
```

## Запуск (локально)

### Шаг 1: Запусти Ollama

```bash
ollama serve
```

> Ollama должна работать в фоне на порту 11434. На Windows она обычно запускается автоматически после установки.

### Шаг 2: Запусти Backend

```bash
cd backend
npm run dev
```

Сервер запустится на http://localhost:3000

### Шаг 3: Запусти Frontend

```bash
cd frontend
npm run dev
```

Приложение откроется на http://localhost:5173

## Удалённый доступ (ngrok)

Ngrok позволяет открыть приложение с телефона, другого ПК или из другой Wi-Fi сети. Твой домашний ПК работает как сервер — ngrok создаёт публичный HTTPS-туннель к нему.

### Установка ngrok

1. Зарегистрируйся на https://ngrok.com (бесплатно)
2. Скачай ngrok с https://ngrok.com/download
3. Авторизуйся (токен из Dashboard):

```bash
ngrok config add-authtoken ТВОЙ_AUTHTOKEN
```

### Запуск с ngrok

```bash
# Терминал 1: Ollama (если не запущена автоматически)
ollama serve

# Терминал 2: Backend
cd backend
npm run dev

# Терминал 3: Frontend
cd frontend
npm run dev

# Терминал 4: Ngrok туннель
ngrok http 5173
```

Ngrok покажет публичный URL вида `https://xxxxx.ngrok-free.app` — открой его на телефоне или другом ПК.

> Vite проксирует API-запросы (`/api/*`) на backend (`localhost:3000`), поэтому достаточно одного туннеля.

### Бесплатный статический домен

На бесплатном плане URL меняется при каждом перезапуске. Чтобы получить постоянный URL:

1. Перейди в https://dashboard.ngrok.com/domains
2. Нажми "New Domain" — получишь домен вида `кое-что.ngrok-free.app`
3. Запускай:

```bash
ngrok http --domain=твой-домен.ngrok-free.app 5173
```

## Использование

1. **Регистрация** — зайди на /register и создай аккаунт
2. **Создай проект** — перейди в "Проекты" и создай новый проект
3. **Запиши голос** — перейди в "Записать", нажми "Начать запись" и опиши требования к проекту
4. **Создай ТЗ** — нажми "Создать ТЗ", выбери проект, нажми "Структурировать через AI"
5. **Просмотр и редактирование** — открой ТЗ, нажми "Редактировать" для правки

## Структура проекта

```
task-generator/
├── backend/
│   ├── src/
│   │   ├── index.js              # Точка входа сервера
│   │   ├── db.js                 # Prisma-клиент
│   │   ├── routes/               # API роуты
│   │   │   ├── auth.js           # POST /api/auth/register, /login
│   │   │   ├── projects.js       # CRUD /api/projects
│   │   │   ├── ai.js             # POST /api/ai/structure
│   │   │   └── specifications.js # /api/specifications
│   │   ├── controllers/          # Логика обработки запросов
│   │   ├── services/
│   │   │   └── aiService.js      # Интеграция с Ollama
│   │   └── middleware/
│   │       └── auth.js           # JWT авторизация
│   ├── prisma/
│   │   └── schema.prisma         # Схема БД
│   └── .env                      # Переменные окружения
│
├── frontend/
│   ├── src/
│   │   ├── main.js               # Точка входа Vue
│   │   ├── App.vue               # Корневой компонент
│   │   ├── api/index.js          # Axios-клиент
│   │   ├── router/index.js       # Vue Router
│   │   ├── stores/auth.js        # Хранилище авторизации
│   │   ├── composables/          # Composables (useSpeechRecognition)
│   │   ├── components/           # Переиспользуемые компоненты
│   │   └── pages/                # Страницы приложения
│   ├── vite.config.js            # Настройки Vite (proxy, ngrok)
│   └── package.json
│
├── COURSE.md                     # Пошаговый курс по созданию проекта
└── README.md
```

## API эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| POST | /api/auth/register | Регистрация |
| POST | /api/auth/login | Авторизация |
| GET | /api/projects | Список проектов |
| POST | /api/projects | Создать проект |
| GET | /api/projects/:id | Детали проекта с ТЗ |
| PUT | /api/projects/:id | Обновить проект |
| DELETE | /api/projects/:id | Удалить проект |
| POST | /api/ai/structure | Структурировать текст через AI |
| POST | /api/specifications/generate | Сгенерировать и сохранить ТЗ |
| GET | /api/specifications | Список ТЗ |
| GET | /api/specifications/:id | Детали ТЗ |
| PUT | /api/specifications/:id | Обновить ТЗ |

## Настройка AI

### Смена модели

В файле `backend/.env` измени переменную `OLLAMA_MODEL`:

```env
OLLAMA_MODEL=qwen2.5:3b    # Легче, быстрее, меньше RAM
OLLAMA_MODEL=qwen2.5:7b    # Баланс качества и скорости (рекомендуется)
OLLAMA_MODEL=qwen2.5:14b   # Лучше качество, требует 16+ ГБ RAM
```

Не забудь скачать модель перед использованием:

```bash
ollama pull qwen2.5:7b
```

### Первый запрос

Первый запрос к AI может занять 10-30 секунд — модель загружается в память. Последующие запросы будут быстрее (3-10 сек).

## Решение проблем

### Ollama не отвечает

```bash
# Проверь что Ollama запущена
curl http://localhost:11434/api/tags

# Если не отвечает — запусти
ollama serve
```

### Ошибка подключения к БД

Проверь что MySQL запущен и данные в `.env` верные:

```bash
# Проверь подключение
npx prisma db pull
```

### Web Speech API не работает

- Используй Chrome или Edge
- Разреши доступ к микрофону
- Сайт должен работать на localhost или HTTPS (ngrok даёт HTTPS)

### Ngrok: "Blocked request" / "host is not allowed"

Vite блокирует запросы с незнакомого хоста. В `frontend/vite.config.js` уже настроен `allowedHosts` для ngrok-доменов. Если ошибка повторяется, добавь свой домен:

```javascript
server: {
  allowedHosts: ['.ngrok-free.dev', '.ngrok.io']
}
```

### Ngrok: ERR_NGROK_8012

Убедись что frontend запущен на правильном порту:

```bash
ngrok http 5173    # Порт Vite, НЕ 5171 или 3000
```
