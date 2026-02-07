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

    // ========================================
    // Защита от дублей на мобильных
    //
    // Проблема: на мобильных Chrome continuous mode
    // при авто-перезапуске (onend → start) отдаёт
    // одни и те же результаты повторно — получается "эхо".
    //
    // Решение: НЕ используем continuous на мобильных.
    // Вместо этого — ручной перезапуск после каждого
    // финального результата. Текст предыдущих сессий
    // храним в previousText и подставляем при каждом onresult.
    // ========================================
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    // Текст, накопленный за предыдущие сессии recognition
    // (каждый перезапуск — новая сессия)
    let previousText = ''

    if (isSupported) {
        recognition = new SpeechRecognition()

        // ========================================
        // Настройки распознавания
        //
        // На мобильных отключаем continuous —
        // он вызывает дубли. Вместо этого перезапускаем
        // вручную в onend.
        // ========================================
        recognition.continuous = !isMobile
        recognition.interimResults = true
        recognition.lang = 'ru-RU'
        recognition.maxAlternatives = 1

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
        // Стратегия: каждый раз пересобираем ВЕСЬ текст
        // из event.results (финальные) + previousText
        // (от предыдущих сессий). Это гарантирует отсутствие
        // дублей — мы не дописываем, а заменяем целиком.
        // ========================================
        recognition.onresult = (event) => {
            let sessionFinal = ''
            let interim = ''

            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i]
                if (result.isFinal) {
                    sessionFinal += result[0].transcript + ' '
                } else {
                    interim += result[0].transcript
                }
            }

            // Пересобираем полный текст: предыдущие сессии + текущая
            transcript.value = previousText + sessionFinal
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
        //
        // Перед перезапуском сохраняем текущий transcript
        // в previousText, чтобы новая сессия начала с чистого
        // event.results, а мы не потеряли старый текст.
        // ========================================
        recognition.onend = () => {
            if (!manualStop && isListening.value) {
                // Сохраняем накопленный текст перед перезапуском
                previousText = transcript.value
                // Задержка нужна чтобы браузер успел освободить ресурсы
                setTimeout(() => {
                    try {
                        recognition.start()
                    } catch (e) {
                        isListening.value = false
                    }
                }, 200)
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
        manualStop = false
        previousText = ''
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
        previousText = ''
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
