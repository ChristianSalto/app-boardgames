import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const phase = process.argv[2] ?? 'after'
const results=[]
const targets = await (await fetch('http://127.0.0.1:9247/json')).json()
const socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl)
await new Promise(r => socket.addEventListener('open',r,{once:true}))
let id=0; const callbacks = new Map()
socket.addEventListener('message', e => { const m=JSON.parse(e.data); if(callbacks.has(m.id)){callbacks.get(m.id)(m);callbacks.delete(m.id)} })
const call=(method,params={})=>new Promise((resolve,reject)=>{callbacks.set(++id,m=>m.error?reject(Error(m.error.message)):resolve(m.result));socket.send(JSON.stringify({id,method,params}))})
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
const wait=async expression=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100))}throw Error('Timeout: '+expression)}
const shot=async name=>{const r=await call('Page.captureScreenshot',{format:'png'});await fs.writeFile('.qa-r02d4b5.local/'+phase+'-'+name+'.png',Buffer.from(r.data,'base64'))}
const key=async key=>{const button=await evaluate('document.activeElement.tagName === "BUTTON"');const code={ArrowDown:40,ArrowUp:38,Enter:13,Escape:27,Tab:9}[key]; await call('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:code});if(key==='Enter' && button)await call('Input.dispatchKeyEvent',{type:'char',text:'\r',key,windowsVirtualKeyCode:13});await call('Input.dispatchKeyEvent',{type:'keyUp',key,code:key,windowsVirtualKeyCode:code})}
const fill=async value=>evaluate(`(()=>{const e=document.querySelector('#game');e.focus();Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}))})()`)
const click=async selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)
const metrics=()=>evaluate(`(()=>{const game=document.querySelector('#game'),zone=document.querySelector('#zone'),h=document.querySelector('.page-heading'); const style=e=>{const s=getComputedStyle(e);return {height:e.getBoundingClientRect().height,border:s.border,radius:s.borderRadius,font:s.fontSize}};return {scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,heading:h.getBoundingClientRect().height,formTop:document.querySelector('.form-card').getBoundingClientRect().top+scrollY,titleFont:getComputedStyle(h.querySelector('h1')).fontSize,game:style(game),zone:style(zone),nativeGameSelect:!!document.querySelector('select#game'),inputType:game.type}})()`)
try {
 for(const width of [1440,375,400]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false})
  await call('Page.navigate',{url:'http://127.0.0.1:5191/tests/create-session.fixture.html'})
  await wait('!!document.querySelector(".results-count")')
  await evaluate(`document.querySelector('a[href="/tests/create-session.fixture.html/create"]').click()`)
  await wait('!!document.querySelector("#game")')
  assert.equal(await evaluate(`document.querySelector('#game').tagName`),'INPUT')
  await shot(width+'-idle')
  const baseline=await metrics()
  await fill('a'); await wait('document.querySelectorAll(".game-combobox__option").length > 0'); await shot(width+'-results')
  await key('ArrowDown');await key('Escape'); assert.equal(await evaluate(`document.querySelector('#game').getAttribute('aria-expanded')`),'false')
  await key('ArrowDown');await key('Enter'); await wait(`document.querySelector('#game-status').textContent === 'Juego seleccionado.'`)
  assert.equal(await evaluate(`document.querySelector('#game').validity.valid`),true)
  await key('Tab');assert.equal(await evaluate('document.activeElement.getAttribute("aria-label")'),'Limpiar juego')
  await key('Enter');await wait(`document.querySelector('#game').value === ''`)
  assert.equal(await evaluate('document.activeElement.id'),'game')
  await fill('Mi juego sin ficha');await wait(`document.querySelector('.game-combobox__option')?.textContent.includes('sin ficha de catálogo')`)
  await key('ArrowDown');await key('Enter');await wait(`document.querySelector('#game-status').textContent === 'Juego seleccionado.'`)
  assert.equal(await evaluate(`document.querySelector('#game').value`),'Mi juego sin ficha')
  await click('.game-combobox__clear'); await fill('X'.repeat(120));await wait(`document.querySelector('.game-combobox__option')?.textContent.includes('sin ficha de catálogo')`)
  await shot(width+'-long')
  const long=await evaluate('({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,listScroll:document.querySelector(".game-combobox__list").scrollWidth,listClient:document.querySelector(".game-combobox__list").clientWidth})')
  if(phase==='after'){assert.equal(long.scroll,long.client);assert.equal(long.listScroll,long.listClient)}
  await key('Escape');await click('#zone');await shot(width+'-zone')
  const result={phase,width,baseline,long,interaction:'PASS text/results/selection/fallback/clear/keyboard'};results.push(result);console.log(JSON.stringify(result))
 }
 if(phase==='after') {
  await call('Page.navigate',{url:'http://127.0.0.1:5191/tests/create-session.fixture.html'})
  await wait('!!document.querySelector("#game-filter")')
  assert.equal(await evaluate('document.querySelector("#game-filter").getAttribute("placeholder")'),null)
  await shot('400-explore')
  await click('.session-card__link')
  await wait("!!document.querySelector('a[href$=\"/edit\"]')")
  await click('a[href$="/edit"]')
  await wait('document.querySelector("#game")?.value === "Azul"')
  assert.equal(await evaluate('!!document.querySelector(".session-create-page")'),false)
  await fill('Root');await wait('document.querySelector(".game-combobox__option")?.textContent === "Root"')
  const point=await evaluate('(()=>{const r=document.querySelector(".game-combobox__option").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()');await call('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await call('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});await wait('document.querySelector("#game-status").textContent === "Juego seleccionado."')
  assert.equal(await evaluate('document.querySelector("#game").value'),'Root')
  await shot('400-edit')
  console.log('PASS Edit shares input presentation; pointer selection Root; Explore placeholder unchanged')
 }
 await fs.writeFile('.qa-r02d4b5.local/'+phase+'-results.json',JSON.stringify(results,null,2))
} finally {socket.close()}
