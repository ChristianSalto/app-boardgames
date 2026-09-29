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
    const snapshot = await evaluate("JSON.stringify({ url: location.href, text: document.body.innerText, active: document.activeElement?.outerHTML?.slice(0, 300) })")
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
  await page.evaluate(`(() => {
    window.__sawFalseNotFound = false;
    new MutationObserver(() => {
      if (document.body.innerText.includes('Partida no encontrada')) window.__sawFalseNotFound = true;
    }).observe(document.body, { childList: true, characterData: true, subtree: true });
  })()`)
  await page.evaluate("document.querySelector('form').requestSubmit()")
  await page.waitFor("location.pathname.startsWith('/sessions/')", 'publicar partida')
  await page.waitFor(bodyHas(game), 'mostrar el detalle recién creado')
  assert.equal(await page.evaluate('window.__sawFalseNotFound'), false, 'No debe aparecer un falso «Partida no encontrada».')
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
  let organizerMirror

  const organizerEmail = `organizador-${runId}@test.local`
  const participantEmail = `jugador-${runId}@test.local`
  const organizerName = `Organizadora QA ${runId}`
  const participantName = `Jugador QA ${runId}`

  try {
    await registerAndCreatePlayer(organizer, organizerEmail, organizerName, 'Chamberí')
    await organizer.evaluate("import('/tests/prototype-context.realtime.browser.ts').then((module) => module.checkDelayedProfileDoesNotBlockSessions())")
    await organizer.evaluate("import('/tests/prototype-context.realtime.browser.ts').then((module) => module.checkUnidentifiedRequestsCannotBeResolved())")
    for (const count of [0, 1, 2, 4]) {
      const result = await organizer.evaluate(`import('/tests/organizer-requests.browser.ts').then(async (module) => {
        try { return await module.mountOrganizerRequestsFixture(${count}) }
        finally { module.unmountOrganizerRequestsFixture() }
      })`)
      assert.equal(result.count, count, `La lista debe mostrar ${count} solicitudes.`)
      assert.equal(result.hasAccordion, false, 'Las solicitudes no deben ocultarse en un acordeón.')
      assert.equal(result.horizontalOverflow, false, 'Las solicitudes no deben desbordar horizontalmente.')
      assert.equal(result.hasManagementActions, true, 'Editar y cancelar permanecen en una sección separada.')
      if (count >= 2) {
        assert.equal(result.rated && result.newPlayer && result.biographyLabeled, true,
          'La lista debe distinguir reputación real, nuevos usuarios y descripción de perfil.')
      }
    }
    organizerMirror = await createPage(rootClient, organizerContext)
    await organizerMirror.waitFor("location.pathname === '/'", 'restaurar la sesión del segundo navegador de Belial')
    await registerAndCreatePlayer(participant, participantEmail, participantName, 'Retiro')
    const confirmedSessionId = await createSession(organizer, {
      game: 'Azul',
      date: '2031-06-20',
      time: '16:00',
      district: 'Chamberí',
      venue: 'Café QA',
      description: 'Partida de validación A/B.',
    })
    await organizer.waitFor(bodyHas('16:00'), 'mostrar la hora creada')
    await organizer.evaluate(navigate('/my-sessions'))
    await organizer.waitFor(bodyHas('Azul'), 'mostrar la partida organizada sin recargar')
    await organizerMirror.waitFor(bodyHas('Azul'), 'mostrar la nueva partida en la segunda pestaña sin recargar')
    await participant.waitFor(
      `Boolean(document.querySelector('a[href="/sessions/${confirmedSessionId}"]'))`,
      'mostrar la nueva partida a Redon sin recargar',
    )

    await participant.evaluate(navigate(`/sessions/${confirmedSessionId}`))
    await participant.waitFor(bodyHas(organizerName), 'mostrar el Player persistido de la organizadora')
    await organizer.evaluate(navigate(`/sessions/${confirmedSessionId}`))
    await organizer.waitFor(bodyHas('Gestionar partida'), 'mantener abierto el detalle de Belial')
    await participant.evaluate(clickText('button', 'Solicitar plaza'))
    await participant.waitFor(bodyHas('Solicitud pendiente'), 'mostrar solicitud pendiente')
    await participant.evaluate(navigate('/my-sessions'))
    await participant.waitFor(bodyHas('Participo / he solicitado 1'), 'contar la solicitud propia sin recargar')
    await participant.evaluate(clickText('button', 'Participo / he solicitado 1'))
    await participant.waitFor(bodyHas('Azul'), 'mostrar solicitud propia en Mis partidas sin recargar')
    await participant.evaluate(navigate(`/sessions/${confirmedSessionId}`))
    await participant.waitFor(bodyHas('Solicitud pendiente'), 'conservar estado pendiente al volver al detalle')
    await organizer.waitFor(bodyHas('1 solicitud pendiente'), 'mostrar la solicitud remota sin recargar')
    await organizer.waitFor(bodyHas(participantName), 'mostrar la persona solicitante')
    assert.equal(await organizer.evaluate("Boolean(document.querySelector('summary'))"), false, 'Las solicitudes deben estar visibles sin acordeón.')
    await organizer.evaluate(`[...document.querySelectorAll('button')].find((item) => item.textContent.trim() === 'Aceptar solicitud').focus()`)
    assert.equal(await organizer.evaluate("document.activeElement?.textContent?.trim()"), 'Aceptar solicitud', 'El botón de aceptación debe tener foco antes de activarlo.')
    await organizer.evaluate(clickText('button', 'Aceptar solicitud'))
    await organizer.waitFor(bodyHas('tiene ahora una plaza confirmada'), 'aceptar la solicitud')
    await organizer.waitFor(bodyHas('2/4 confirmados'), 'actualizar el aforo')
    await organizer.waitFor("document.activeElement?.textContent?.trim() === 'Gestionar partida'", 'restaurar el foco tras cerrar la última solicitud')

    await participant.waitFor(bodyHas('Plaza confirmada'), 'mostrar participación confirmada sin recargar')
    await participant.waitFor(`!${bodyHas('aún no tienes una plaza confirmada')}`, 'retirar el aviso de solicitud pendiente tras aceptación')

    const lifecycleSessionId = await createSession(organizer, {
      game: 'Wingspan',
      date: '2031-06-21',
      time: '16:00',
      district: 'Retiro',
      venue: 'Sala QA',
      description: 'Partida de ciclo de vida.',
    })
    await participant.evaluate(navigate(`/sessions/${lifecycleSessionId}`))
    await participant.waitFor(bodyHas('Wingspan'), 'abrir la segunda partida')
    await participant.evaluate(clickText('button', 'Solicitar plaza'))
    await participant.waitFor(bodyHas('Solicitud pendiente'), 'crear segunda solicitud')

    await organizer.waitFor(bodyHas('1 solicitud pendiente'), 'ver segunda solicitud sin recargar')
    await organizer.waitFor(bodyHas(participantName), 'mostrar la segunda persona solicitante')
    await organizer.evaluate(clickText('button', 'Rechazar'))
    await organizer.waitFor(bodyHas('¿Rechazar esta solicitud?'), 'pedir confirmación de rechazo')
    await organizer.evaluate(`[...document.querySelectorAll('button')].find((item) => item.textContent.trim() === 'Sí, rechazar').focus()`)
    await organizer.evaluate(clickText('button', 'Sí, rechazar'))
    await organizer.waitFor(bodyHas('no ha sido aceptada'), 'rechazar solicitud')
    await organizer.waitFor("document.activeElement?.textContent?.trim() === 'Gestionar partida'", 'restaurar el foco tras rechazar la última solicitud')
    await participant.waitFor(bodyHas('Solicitud no aceptada'), 'mostrar rechazo sin recargar')
    await participant.waitFor(`!${bodyHas('aún no tienes una plaza confirmada')}`, 'retirar el aviso pendiente tras rechazo')

    await organizer.evaluate(navigate(`/sessions/${lifecycleSessionId}/edit`))
    await organizer.waitFor("Boolean(document.querySelector('#description'))", 'abrir edición')
    await organizer.evaluate(fill('#description', 'Mi borrador local sin guardar'))
    await createSession(organizerMirror, {
      game: 'Root',
      date: '2031-06-22',
      time: '16:00',
      district: 'Chamberí',
      venue: 'Sala paralela',
      description: 'Otra partida de Belial.',
    })
    assert.equal(await organizer.evaluate("document.querySelector('#description')?.value"), 'Mi borrador local sin guardar', 'Una partida nueva en otra pestaña no debe desmontar el formulario dirty.')
    await organizerMirror.evaluate(navigate(`/sessions/${lifecycleSessionId}/edit`))
    await organizerMirror.waitFor("Boolean(document.querySelector('#time'))", 'abrir edición en otra pestaña de Belial')
    await organizerMirror.evaluate(fill('#time', '17:30'))
    await organizerMirror.evaluate("document.querySelector('form').requestSubmit()")
    await organizerMirror.waitFor(bodyHas('17:30'), 'guardar cambio de hora remoto')
    await participant.waitFor(bodyHas('17:30'), 'recibir edición remota sin recargar')
    assert.equal(await organizer.evaluate("document.querySelector('#description').value"), 'Mi borrador local sin guardar', 'La edición remota no debe borrar el formulario dirty.')

    await organizerMirror.evaluate(clickText('button', 'Cancelar partida'))
    await organizerMirror.waitFor(bodyHas('¿Cancelar esta partida?'), 'pedir confirmación de cancelación')
    await organizerMirror.evaluate(clickText('button', 'Sí, cancelar partida'))
    await organizerMirror.waitFor(bodyHas('La partida se ha cancelado'), 'cancelar partida')
    await participant.waitFor(bodyHas('La partida ha sido cancelada'), 'recibir cancelación sin recargar')
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
    organizerMirror?.client.close()
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
