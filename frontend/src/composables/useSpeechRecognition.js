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