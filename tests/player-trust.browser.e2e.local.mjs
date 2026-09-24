import assert from 'node:assert/strict'

const browserDebugPort = Number(process.env.BROWSER_DEBUG_PORT ?? 9235)
const appOrigin = process.env.APP_ORIGIN ?? 'http://127.0.0.1:5180'
const sessionId = process.env.REVIEW_SESSION_ID ?? 'review-flow-session'
const password = 'MesaAbiertaReview123!'
const reviewComment = `Opinión persistente 008D ${sessionId}`

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

const createClient = async (webSocketDebuggerUrl) => {
  const socket = new WebSocket(webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  let nextId = 1
  const callbacks = new Map()
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    const callback = callbacks.get(message.id)
    if (!callback) return
    callbacks.delete(message.id)
    callback(message)
  })
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++
    callbacks.set(id, (message) => message.error ? reject(new Error(message.error.message)) : resolve(message.result))
    socket.send(JSON.stringify({ id, method, params }))
  })
  return { call, close: () => socket.close() }
}

const createPage = async (rootClient, browserContextId) => {
  const { targetId } = await rootClient.call('Target.createTarget', {
    browserContextId,
    url: `${appOrigin}/login`,
  })
  const targets = await (await fetch(`http://127.0.0.1:${browserDebugPort}/json/list`)).json()
  const target = targets.find((candidate) => candidate.id === targetId)
  assert.ok(target?.webSocketDebuggerUrl)
  const client = await createClient(target.webSocketDebuggerUrl)
  const evaluate = async (expression) => {
    const result = await client.call('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const waitFor = async (expression, description) => {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      if (await evaluate(expression)) return
      await delay(100)
    }
    const snapshot = await evaluate("JSON.stringify({ url: location.href, text: document.body.innerText })")
    throw new Error(`Tiempo agotado: ${description}. Estado: ${snapshot}`)
  }
  return { client, evaluate, waitFor }
}

const fill = (selector, value) => `(() => {
  const element = document.querySelector(${JSON.stringify(selector)});
  if (!element) throw new Error('No existe ${selector}');
  const prototype = element instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, ${JSON.stringify(value)});
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
})()`

const clickText = (selector, text) => `(() => {
  const element = [...document.querySelectorAll(${JSON.stringify(selector)})]
    .find((candidate) => candidate.textContent.trim() === ${JSON.stringify(text)});
  if (!element) throw new Error('No existe ${text}');
  element.click();
})()`

const navigate = (path) => `(() => {
  window.history.pushState({}, '', ${JSON.stringify(path)});
  window.dispatchEvent(new PopStateEvent('popstate'));
})()`

const login = async (page, email) => {
  await page.waitFor("Boolean(document.querySelector('#login-email'))", 'mostrar Login')
  await page.evaluate(fill('#login-email', email))
  await page.evaluate(fill('#login-password', password))
  await page.evaluate("document.querySelector('form').requestSubmit()")
  await page.waitFor("location.pathname === '/'", `iniciar sesión como ${email}`)
}

const run = async () => {
  const version = await (await fetch(`http://127.0.0.1:${browserDebugPort}/json/version`)).json()
  const rootClient = await createClient(version.webSocketDebuggerUrl)
  const oliviaContext = (await rootClient.call('Target.createBrowserContext')).browserContextId
  const pabloContext = (await rootClient.call('Target.createBrowserContext')).browserContextId
  const olivia = await createPage(rootClient, oliviaContext)
  const pablo = await createPage(rootClient, pabloContext)

  try {
    await login(olivia, 'review-organizer@mesa-abierta.local')
    await olivia.evaluate(navigate(`/sessions/${sessionId}/reviews`))
    await olivia.waitFor("document.body.innerText.includes('Pablo Participante')", 'mostrar a Pablo como participante valorable')
    await olivia.evaluate(clickText('button', 'Valorar'))
    await olivia.waitFor("Boolean(document.querySelector('.review-form'))", 'abrir formulario de valoración')
    await olivia.evaluate("document.querySelector('input[name=\"rating\"][value=\"5\"]').click()")
    await olivia.evaluate(fill('#review-comment', reviewComment))
    await olivia.evaluate("document.querySelector('.review-form').requestSubmit()")
    await olivia.waitFor(`document.body.innerText.includes(${JSON.stringify(`Tu valoración para Pablo Participante se ha publicado.`)})`, 'publicar review')
    await olivia.waitFor("document.body.innerText.includes('Valoración enviada')", 'bloquear el duplicado en la UI')
    assert.equal(await olivia.evaluate("document.body.innerText.includes('Olivia Organizadora')"), false)

    await login(pablo, 'review-player@mesa-abierta.local')
    await pablo.evaluate(navigate('/profile'))
    await pablo.waitFor(`document.body.innerText.includes(${JSON.stringify(reviewComment)})`, 'mostrar la review en el perfil de Pablo')
    await pablo.waitFor("(() => { const summary = document.querySelector('.trust-summary__item')?.innerText ?? ''; return summary.includes('★') && /[1-9][0-9]* valoraci/.test(summary); })()", 'mostrar resumen de reputación')
    await pablo.waitFor("document.body.innerText.includes('Sin datos de asistencia verificados')", 'mantener fiabilidad neutral')
    await pablo.evaluate('location.reload()')
    await pablo.waitFor(`document.body.innerText.includes(${JSON.stringify(reviewComment)})`, 'conservar la review tras F5')
    await pablo.evaluate(clickText('button', 'Cerrar sesión'))
    await pablo.waitFor("location.pathname === '/login'", 'cerrar la sesión de Pablo')
    await login(pablo, 'review-player@mesa-abierta.local')
    await pablo.evaluate(navigate('/profile'))
    await pablo.waitFor(`document.body.innerText.includes(${JSON.stringify(reviewComment)})`, 'conservar la review tras volver a entrar')

    console.log(JSON.stringify({ ok: true, sessionId, reviewComment }))
  } finally {
    olivia.client.close()
    pablo.client.close()
    await rootClient.call('Target.disposeBrowserContext', { browserContextId: oliviaContext })
    await rootClient.call('Target.disposeBrowserContext', { browserContextId: pabloContext })
    rootClient.close()
  }
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
