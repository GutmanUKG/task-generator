// ========================================
// Сервис для работы с Ollama
//
// Ollama — локальный AI-сервер
// Общение через HTTP API (REST)
// Эндпоинт: POST /api/generate
// ========================================

const OLLAMA_URL = process.env.OLLAMA_URL
const OLLAMA_MODEL = process.env.OLLAMA_MODEL
const crmSystems = require('../config/crmSystems')
// ========================================
// Промпт разделён на две части:
// 1. Содержательная (роль + правила) — может быть заменена пользователем
// 2. Инструкция формата JSON — добавляется ВСЕГДА, чтобы ответ был парсируемый
// ========================================

const DEFAULT_PROMPT = `Ты — опытный системный аналитик. Твоя задача — превратить сырой текст (запись речи заказчика) в структурированное техническое задание на разработку.
ПРАВИЛА:
- Разбей требования заказчика на логические разделы (например: "Каталог товаров", "Корзина", "Оплата", "Личный кабинет")
- В каждом разделе выдели конкретные задачи для разработчика
- Каждой задаче дай оценку времени в минутах (реалистичную для junior/middle разработчика)
- Придумай короткое название ТЗ, отражающее суть проекта
- НЕ описывай процесс анализа, описывай РЕЗУЛЬТАТ — что нужно разработать
- Отвечай ТОЛЬКО на русском языке`

// Эта часть добавляется ВСЕГДА — без неё AI вернёт текст вместо JSON
const JSON_FORMAT_INSTRUCTION = `
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

/**
 * @param {string} text — сырой текст
 * @param {string} [crmId] — ID выбранной CRM-системы (опционально)
 */

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
async function structureText(text, crmId = false, customPrompt = null) {
    // ========================================
    // Промпт — инструкция для AI
    //
    // Если пользователь выбрал свой промпт — используем его
    // Иначе — дефолтный промпт

    // Содержательная часть — пользовательский или дефолтный промпт
    const basePrompt = customPrompt || DEFAULT_PROMPT

    // Находим CRM и формируем контекст
    const crm = crmId ? crmSystems.find(c => c.id === crmId) : null
    const crmContext = crm?.description
        ? `\n\nПЛАТФОРМА РАЗРАБОТКИ: ${crm.name}\n${crm.description}\nУчитывай специфику этой платформы при оценке времени и формулировке задач. Используй терминологию платформы где уместно.`
        : ''

    // Собираем финальный промпт: роль + CRM + ФОРМАТ (всегда) + текст
    const prompt = `${basePrompt}${crmContext}\n\n${JSON_FORMAT_INSTRUCTION}\n\nТекст от заказчика:\n${text}`
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
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: false
            }),
            signal: controller.signal

        })
        clearTimeout(timeout)

        if(!response.ok) {
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
    }catch (error) {
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

module.exports = { structureText, DEFAULT_PROMPT }