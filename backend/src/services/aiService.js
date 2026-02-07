// ========================================
// Сервис для работы с Ollama
//
// Ollama — локальный AI-сервер
// Общение через HTTP API (REST)
// Эндпоинт: POST /api/generate
// ========================================

const OLLAMA_URL = process.env.OLLAMA_URL
const OLLAMA_MODEL = process.env.OLLAMA_MODEL

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