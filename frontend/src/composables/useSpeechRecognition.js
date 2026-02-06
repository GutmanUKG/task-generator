import {ref, onUnmounted} from "vue";

export function useSpeechRecognition(){
    const isListening = ref(false)
    const transcript = ref('')
    const interimTranscript = ref('')
    const error = ref(null)

    //Проверка поддержки
    const SpeechRecognition = window.SpeechRecognitionResult || window.webkitSpeechRecognition
    const isSupported = !!SpeechRecognition

    let recognition = null
    if(isSupported){
        recognition = new SpeechRecognition()
        //Настройка

        recognition.continuous = true //Непрерывное распознование
        recognition.interimResults  = true //Вывод промежуточного результата
        recognition.lang = "ru-Ru" //Язык
        //Начало записи
        recognition.onstart = () =>{
            isListening.value = true
            error.value = null
        }
        //Результаты распознования
        recognition.onresult = (e) => {
            let interim = ''
            let final = ''

            for(let i = e.resultIndex; i < e.results.length; i++) {
                const result = e.results[i]
                if(result.isFinal) {
                    final += result[0].transcript + ' '
                }else{
                    interim += result[0].transcript
                }
            }
            if(final){
                transcript.value += final
            }
            interimTranscript.value = interim
        }
        //Ошибки
        recognition.onerror = (e) =>{
            const errors = {
                'no-speech': 'Речь не обнаружена',
                'audio-capture': 'Микрофон не найден',
                'not-allowed': 'Доступ к микрофону запрещён'
            }
            error.value = errors[e.error] || e.error
            isListening.value = false
        }

        //Конец записи
        recognition.onend = () =>{
            isListening.value = false
        }
    }

    //Методы
    function start(){
        if(!recognition) {
            error.value = 'Браузер не поддерживает распознавание речи'
            return
        }
        error.value = null
        recognition.start()
    }
    function stop(){
        if(recognition && isListening.value) {
            recognition.stop()
        }
    }
    function clear(){
        transcript.value = ''
        interimTranscript.value = ''
    }

    //Остановка при уничтожении компонента
    onUnmounted(() => {
        if(recognition) {
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