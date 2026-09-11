import assert from 'node:assert/strict'

const browserDebugPort = Number(process.env.BROWSER_DEBUG_PORT ?? 9226)
const appOrigin = process.env.APP_ORIGIN ?? 'http://127.0.0.1:5176'
const runId = Date.now().toString(36)
const password = 'mesa-abierta-qa'

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
  const target = targets.find((item) => item.id === targetId)
  assert.ok(target?.webSocketDebuggerUrl, `No se encontró la pestaña ${targetId}.`)
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
    for (let attempt = 0; attempt < 100; attempt += 1) {
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
  const prototype = element instanceof HTMLSelectElement
    ? HTMLSelectElement.prototype
    : element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, ${JSON.stringify(value)});
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
})()`

const clickText = (selector, text) => `(() => {
  const element = [...document.querySelectorAll(${JSON.stringify(selector)})]
    .find((item) => item.textContent.trim() === ${JSON.stringify(text)});
  if (!element) throw new Error('No existe ${text}');
  element.click();
})()`

const navigate = (path) => `(() => {
  window.history.pushState({}, '', ${JSON.stringify(path)});
  window.dispatchEvent(new PopStateEvent('popstate'));
})()`

const registerAndCreatePlayer = async (page, email, displayName, district) => {
  await page.evaluate(navigate('/register'))
  await page.waitFor("Boolean(document.querySelector('#register-email'))", 'llegar a registro')
  await page.evaluate(fill('#register-email', email))
  await page.evaluate(fill('#register-password', password))
  await page.evaluate(fill('#register-password-confirmation', password))
  await page.evaluate("document.querySelector('form').requestSubmit()")
  await page.waitFor("location.pathname === '/complete-profile'", 'crear la cuenta')
  await page.evaluate(fill('#display-name', displayName))
  await page.evaluate(fill('#district', district))
  await page.evaluate("document.querySelector('form').requestSubmit()")
  await page.waitFor("location.pathname === '/'", 'persistir el perfil')
}

const createSession = async (page, { game, date, time, district, venue, description }) => {
  await page.evaluate(navigate('/create'))
  await page.waitFor("Boolean(document.querySelector('#game'))", 'abrir Crear partida')
  await page.evaluate(fill('#game', game))
  await page.evaluate(fill('#date', date))
  await page.evaluate(fill('#time', time))
  await page.evaluate("document.querySelector('#zone').click()")
  await page.evaluate(clickText('[role=option]', district))
  await page.evaluate(fill('#place', venue))
  await page.evaluate(fill('#description', description))
  await page.evaluate("document.querySelector('form').requestSubmit()")
  await page.waitFor("location.pathname.startsWith('/sessions/')", 'publicar partida')
  const sessionId = await page.evaluate("location.pathname.split('/')[2]")
  assert.ok(sessionId, 'La partida creada debe tener identificador.')
  return sessionId
}

const bodyHas = (text) => `document.body.innerText.includes(${JSON.stringify(text)})`

const run = async () => {
  const version = await (await fetch(`http://127.0.0.1:${browserDebugPort}/json/version`)).json()
  const rootClient = await createClient(version.webSocketDebuggerUrl)
  const organizerContext = (await rootClient.call('Target.createBrowserContext')).browserContextId
  const participantContext = (await rootClient.call('Target.createBrowserContext')).browserContextId
  const organizer = await createPage(rootClient, organizerContext)
  const participant = await createPage(rootClient, participantContext)

  const organizerEmail = `organizador-${runId}@test.local`
  const participantEmail = `jugador-${runId}@test.local`
  const organizerName = `Organizadora QA ${runId}`
  const participantName = `Jugador QA ${runId}`

  try {
    await registerAndCreatePlayer(organizer, organizerEmail, organizerName, 'Chamberí')
    const confirmedSessionId = await createSession(organizer, {
      game: 'Azul',
      date: '2031-06-20',
      time: '16:00',
      district: 'Chamberí',
      venue: 'Café QA',
      description: 'Partida de validación A/B.',
    })
    await organizer.waitFor(bodyHas('16:00'), 'mostrar la hora creada')
    await organizer.evaluate('location.reload()')
    await organizer.waitFor(bodyHas('16:00'), 'recuperar la partida tras recarga')
    await organizer.evaluate(navigate(`/sessions/${confirmedSessionId}`))
    await organizer.waitFor(bodyHas('Café QA'), 'recuperar el detalle persistido tras recarga')
    await organizer.evaluate(navigate('/my-sessions'))
    await organizer.waitFor(bodyHas('Azul'), 'mostrar la partida organizada')

    await registerAndCreatePlayer(participant, participantEmail, participantName, 'Retiro')
    await participant.evaluate(navigate(`/sessions/${confirmedSessionId}`))
    await participant.waitFor(bodyHas(organizerName), 'mostrar el Player persistido de la organizadora')
    await participant.evaluate(clickText('button', 'Solicitar plaza'))
    await participant.waitFor(bodyHas('Solicitud pendiente'), 'mostrar solicitud pendiente')
    await participant.evaluate('location.reload()')
    await participant.waitFor(bodyHas('Solicitud pendiente'), 'conservar solicitud pendiente tras recarga')

    await organizer.evaluate(navigate(`/sessions/${confirmedSessionId}`))
    await organizer.evaluate('location.reload()')
    await organizer.waitFor(bodyHas(participantName), 'mostrar la solicitud del participante')
    await organizer.evaluate(clickText('button', 'Aceptar solicitud'))
    await organizer.waitFor(bodyHas('tiene ahora una plaza confirmada'), 'aceptar la solicitud')
    await organizer.waitFor(bodyHas('2/4 confirmados'), 'actualizar el aforo')

    await participant.evaluate(navigate(`/sessions/${confirmedSessionId}`))
    await participant.evaluate('location.reload()')
    await participant.waitFor(bodyHas('Participación confirmada'), 'mostrar participación confirmada')
    await participant.evaluate('location.reload()')
    await participant.waitFor(bodyHas('Participación confirmada'), 'conservar participación confirmada tras recarga')

    const lifecycleSessionId = await createSession(organizer, {
      game: 'Wingspan',
      date: '2031-06-21',
      time: '16:00',
      district: 'Retiro',
      venue: 'Sala QA',
      description: 'Partida de ciclo de vida.',
    })
    await participant.evaluate(navigate(`/sessions/${lifecycleSessionId}`))
    await participant.evaluate('location.reload()')
    await participant.waitFor(bodyHas('Wingspan'), 'abrir la segunda partida')
    await participant.evaluate(clickText('button', 'Solicitar plaza'))
    await participant.waitFor(bodyHas('Solicitud pendiente'), 'crear segunda solicitud')

    await organizer.evaluate(navigate(`/sessions/${lifecycleSessionId}`))
    await organizer.evaluate('location.reload()')
    await organizer.waitFor(bodyHas(participantName), 'ver segunda solicitud')
    await organizer.evaluate(clickText('button', 'Rechazar'))
    await organizer.waitFor(bodyHas('¿Rechazar esta solicitud?'), 'pedir confirmación de rechazo')
    await organizer.evaluate(clickText('button', 'Sí, rechazar'))
    await organizer.waitFor(bodyHas('no ha sido aceptada'), 'rechazar solicitud')
    await participant.evaluate(navigate(`/sessions/${lifecycleSessionId}`))
    await participant.evaluate('location.reload()')
    await participant.waitFor(bodyHas('Solicitud no aceptada'), 'mostrar rechazo al participante')

    await organizer.evaluate(navigate(`/sessions/${lifecycleSessionId}/edit`))
    await organizer.waitFor(bodyHas('Editar partida'), 'abrir edición')
    await organizer.evaluate(fill('#time', '17:30'))
    await organizer.evaluate("document.querySelector('form').requestSubmit()")
    await organizer.waitFor(bodyHas('17:30'), 'guardar cambio de hora')
    await organizer.evaluate('location.reload()')
    await organizer.waitFor(bodyHas('17:30'), 'conservar cambio de hora tras recarga')

    await organizer.evaluate(clickText('button', 'Cancelar partida'))
    await organizer.waitFor(bodyHas('¿Cancelar esta partida?'), 'pedir confirmación de cancelación')
    await organizer.evaluate(clickText('button', 'Sí, cancelar partida'))
    await organizer.waitFor(bodyHas('La partida se ha cancelado'), 'cancelar partida')
    await organizer.evaluate(navigate('/'))
    await organizer.waitFor(
      `!document.querySelector('a[href="/sessions/${lifecycleSessionId}"]')`,
      'ocultar cancelada en Explorar',
    )
    await organizer.evaluate(navigate('/my-sessions'))
    await organizer.waitFor(bodyHas('Wingspan'), 'conservar cancelada en Mis partidas')

    console.log(JSON.stringify({
      ok: true,
      organizerEmail,
      participantEmail,
      confirmedSessionId,
      lifecycleSessionId,
    }))
  } finally {
    organizer.client.close()
    participant.client.close()
    await rootClient.call('Target.disposeBrowserContext', { browserContextId: organizerContext })
    await rootClient.call('Target.disposeBrowserContext', { browserContextId: participantContext })
    rootClient.close()
  }
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
