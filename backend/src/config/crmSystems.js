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