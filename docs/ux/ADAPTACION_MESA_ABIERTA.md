# Aplicación del kit a Mesa Abierta

Repositorio: [ChristianSalto/app-boardgames](https://github.com/ChristianSalto/app-boardgames). Referencia examinada: `main`, commit `df11d270b0efecf33807c15be0472524fa42a627`, consultado el 25 de septiembre de 2026. Revalidar contra HEAD al integrar.

## Decisiones ya existentes

La app es una SPA con React, TypeScript, React Router, Vite, Sass/ITCSS y Firebase. Usa `package-lock.json`; `package.json` no declara `packageManager` ni `engines`, y no hay `.nvmrc` en la raíz examinada. Resolver una versión compatible con el lockfile y las dependencias antes de ejecutar comandos; no copiar el requisito Node 24 de Cruxmatch sin comprobarlo.

`TASK.md` registra Fase 7 completada y no abre otra fase. Ya existen arquitectura UX, wireframes, inventario, dirección visual y un informe de validación histórica. La integración debe abrir una tarea de refactor dentro del proceso vigente, con `ProductManagerAgent` como responsable del alcance. No volver a Fase 0 ni sustituir esos documentos por las plantillas del kit.

La dirección aprobada es club moderno, cálido y editorial. Conservarla: no importar estética neón, glass ni paleta Cruxmatch. El núcleo es descubrir, crear y solicitar plaza en partidas de Madrid; los anuncios son secundarios. La participación requiere aceptación del organizador. No hay que introducir unión directa, chat, mapa, GPS, lista de espera ni una pestaña de catálogo por aparecer como ejemplos genéricos en la guía.

`RULES.md` conserva una exclusión histórica de intercambio en MVP 1, mientras PRD/MVP y las fases posteriores incluyen `game-listings`. Reconciliar la redacción con las decisiones aprobadas antes de usar esa frase para retirar funcionalidad existente. Asimismo, `docs/PROTOTYPE.md` describe en parte una etapa en memoria sin autenticación real, que ya no representa el runtime actual. La fecha, fase y código importan al interpretar documentos.

## Correspondencia de responsabilidades

| Rol existente | Aporte del kit | Límite |
| --- | --- | --- |
| ProductManagerAgent | Coordina lote, prioridad y aceptación | Conserva decisiones de alcance y fase; no implementa |
| UXDesignerAgent | Skills architecture, screens y writing; agentes architect y writer como apoyos | Conserva autoridad de diseño; los apoyos no crean otra jerarquía |
| FrontendAgent | Implementa el diseño con las skills aplicables | Conserva UI, rutas y CSS dentro de contratos aprobados |
| SoftwareArchitectAgent | Revisa cambios duraderos de límites o estado | Sin reescritura técnica por una tarea visual |
| FirebaseAgent | Interviene si se toca persistencia, reglas o permisos | No se convoca por simple copy o espaciado |
| QAReviewerAgent | Skill validation y apoyo reviewer | Revisión independiente y evidencia observable |

## Puntos de partida comprobados en código

Son candidatos a auditoría, no un diagnóstico visual de la app ejecutándose. No se instalaron dependencias ni se arrancó el producto durante este traspaso.

| Hallazgo | Evidencia | Tratamiento propuesto |
| --- | --- | --- |
| Contexto repetido en Explorar | `ExplorePage.tsx`: eyebrow de comunidad/Madrid, h1, lead que repite juegos/Madrid, encabezado Explorar/Partidas y Madrid de nuevo | Probar una cabecera compacta que conserve la propuesta de valor aprobada y un contexto de ciudad claro |
| Filtros locales y scroll global | `ExplorePage.tsx` usa `useState`; `AppShell.tsx` ejecuta `window.scrollTo({top: 0})` con cada pathname | Reproducir búsqueda → detalle → atrás; persistir lo necesario mediante el patrón mínimo, sin estado global indiscriminado |
| Destino tras autenticación | `App.tsx`: acceso no autenticado redirige a `/login`; usuario autenticado en `/login` se envía a `/` | Verificar enlace directo y sesión expirada; corregir en lote de navegación/auth si se confirma pérdida de destino |
| CTA Crear en más de una superficie | `AppShell.tsx`: header desktop y navegación móvil | Inspeccionar CSS antes de llamarlo duplicación visible; pueden ser variantes responsive excluyentes |
| Base visual reutilizable | `src/styles/01-settings/_tokens.scss`, AppShell, AppIcon, VisualSelect, SessionCard | Normalizar roles y variantes sobre estas piezas; no instalar otro design system |
| Inventario histórico incompleto respecto al runtime | Rutas de listings y reviews presentes en `App.tsx`; inventario con notas de fases previas | Actualizar el inventario existente por rutas implementadas y estados reales |

## Primer lote recomendado

**UX-R01 — Orientación y densidad de Explorar.** Empezar por línea base autenticada con emuladores y datos deterministas. Capturar `/`, `/sessions/:sessionId` y retorno a `/` en 360, 390 y 1440 px; ampliar a 430 y 768 si aparece un cambio de breakpoint. Registrar tema vigente, fuente, teclado y filtros. No exigir modos oscuro o nativo que no existen.

Alcance inicial: jerarquía del shell, cabecera de Explorar, filtros, resultado y retorno desde detalle. Mantener las rutas `/`, `/my-sessions`, `/create` y `/profile`, los filtros juego/fecha/zona, los anuncios secundarios y los contratos de participación. La estrategia aprobada incluye Crear en la navegación móvil: no retirarlo sin decisión explícita de UX/Producto.

Criterios: ubicación reconocible; propuesta de valor breve conservada; primer contenido útil antes que decoración accesoria en el viewport base cuando los datos lo permitan; estado vacío con una acción pertinente; sin ocultar campos/acciones con navegación fija; vuelta del detalle que conserva contexto; jerarquía de headings coherente; acceso completo con teclado. Medir la posición del primer resultado antes/después, sin fijar una altura que recorte texto al ampliar.

Los cambios en el destino después del login pueden necesitar un lote UX-R02 independiente para limitar regresiones de auth. Las demás pantallas se migran después con los patrones demostrados. Marketplace y reputación siguen funcionando y conservan su posición secundaria; no se eliminan por simplicidad.

## Validación real disponible

Los comandos observados en `package.json` son `npm run typecheck`, `npm run build`, `npm run test:game-sessions`, `npm run test:game-listings`, `npm run test:player-trust`, `npm run test:beta-access`, `npm run test:beta-access:local-rules` y `npm run test:rules`. Elegir según alcance. El primer lote normalmente necesita typecheck, build y pruebas de partidas si cambia estado/navegación; sumar auth, listings o trust si se afectan sus contratos. No existe un script E2E de navegador declarado en el manifiesto examinado: usar las herramientas disponibles y registrar el recorrido manual o incorporar una prueba solo cuando se justifique.

`npm run dev` y `npm run emulators` existen. El runtime de desarrollo conecta por defecto con emuladores y proyecto `demo-mesa-abierta`, salvo variables que lo cambien. Verificar variables efectivas sin revelar valores sensibles. No utilizar `dev:cloud`, `build:cloud`, `deploy:hosting:dev`, seeds o migraciones sin comprobar destino y alcance. El kit no ejecuta ninguno.

El informe UX histórico es una línea base documental, no evidencia del commit actual ni de cada estado nuevo. Reproducir las pruebas del lote y actualizar `TASK.md`, `PROMPTS_LOG.md` y los documentos UX que cambien. Usar `docs/ux/lotes/` solo para evidencia que no tenga ya un lugar adecuado.

## Fuentes del destino

- [Instrucciones y roles](https://github.com/ChristianSalto/app-boardgames/blob/df11d270b0efecf33807c15be0472524fa42a627/AGENTS.md).
- [Estrategia UX](https://github.com/ChristianSalto/app-boardgames/blob/df11d270b0efecf33807c15be0472524fa42a627/docs/UX_STRATEGY.md).
- [Rutas y guards](https://github.com/ChristianSalto/app-boardgames/blob/df11d270b0efecf33807c15be0472524fa42a627/src/app/App.tsx).
- [Shell](https://github.com/ChristianSalto/app-boardgames/blob/df11d270b0efecf33807c15be0472524fa42a627/src/shared/AppShell.tsx).
- [Explorar](https://github.com/ChristianSalto/app-boardgames/blob/df11d270b0efecf33807c15be0472524fa42a627/src/game-sessions/ExplorePage.tsx).
- [Manifiesto y comandos](https://github.com/ChristianSalto/app-boardgames/blob/df11d270b0efecf33807c15be0472524fa42a627/package.json).
