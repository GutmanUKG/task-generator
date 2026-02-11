/**
 * Опрашивает локальный API ngrok и выводит публичный URL.
 * Ngrok предоставляет API на http://localhost:4040/api/tunnels
 * Скрипт ждёт пока ngrok запустится, затем выводит URL.
 */

const MAX_ATTEMPTS = 30
const INTERVAL = 2000

async function getUrl(port) {
  try {
    const res = await fetch(`http://localhost:${port}/api/tunnels`)
    const data = await res.json()
    const tunnel = data.tunnels?.find(t => t.proto === 'https') || data.tunnels?.[0]
    return tunnel?.public_url || null
  } catch {
    return null
  }
}

async function main() {
  console.log('Ожидание запуска ngrok...')

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    // ngrok может занять порт 4040 или 4041
    const url = await getUrl(4040) || await getUrl(4041)

    if (url) {
      console.log('')
      console.log('============================================')
      console.log(`  Публичный URL: ${url}`)
      console.log('============================================')
      console.log('')
      console.log('  Откройте этот URL на телефоне или другом ПК')
      console.log('')

      // Продолжаем работать чтобы concurrently не завершил процесс
      await new Promise(() => {})
    }

    await new Promise(r => setTimeout(r, INTERVAL))
  }

  console.log('[!] Не удалось получить URL от ngrok')
}

main()
