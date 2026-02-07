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