# Prototipo SPA — Fase 2

## Objetivo

Validar visualmente y mediante interacción los flujos aprobados de descubrimiento, solicitud, gestión, creación y perfiles antes de definir la arquitectura definitiva o integrar infraestructura real. **Mesa Abierta** es un nombre provisional.

## Alcance implementado

- Explorar partidas disponibles en Madrid y filtrar por juego, fecha y zona/distrito.
- Consultar una partida con variantes para usuario potencial, solicitud pendiente, participante confirmado, organizador, completa, cancelada y pasada.
- Solicitar plaza y reflejar inmediatamente el estado pendiente en Mis partidas.
- Aceptar o rechazar solicitudes como organizador.
- Completar el aforo y cerrar las solicitudes restantes sin mantenerlas pendientes ni crear una lista de espera.
- Crear una partida en una pantalla, con Madrid fijo, zona y lugar opcional diferenciados, y mostrarla en Explorar y Mis partidas.
- Consultar y editar el perfil simulado propio y abrir perfiles básicos de otros jugadores.
- Consultar reputación subjetiva y fiabilidad observable como señales simuladas y separadas, con opiniones variadas de solo lectura.
- Evaluar desde el detalle un resumen compacto de confianza sobre quien organiza.
- Navegación Mobile First y adaptación desktop con Explorar, Mis partidas, Crear y Perfil.

## Datos simulados

La aplicación comienza con Alex Martín como identidad ya iniciada y utiliza jugadores, juegos y partidas creados localmente. Todo el estado vive en memoria y se restablece al recargar. No hay peticiones a APIs ni recursos gráficos externos.

## Cómo ejecutarlo

Requiere Node.js y npm.

```bash
npm install
npm run dev
```

Abrir la URL local mostrada por Vite. Para comprobar la compilación:

```bash
npm run typecheck
npm run build
```

## Flujos disponibles

1. Explorar → abrir una partida → Solicitar plaza → comprobar «Solicitud pendiente» → verla en Mis partidas.
2. Mis partidas → Organizadas por mí → abrir Dune: Imperium → aceptar o rechazar solicitudes.
3. Aceptar la última plaza en Dune: Imperium → comprobar partida completa y cero solicitudes pendientes.
4. Crear → completar formulario → publicar → abrir el detalle → comprobarla en Mis partidas y Explorar.
5. Abrir el nombre de un organizador o participante → consultar su perfil.

## Limitaciones conocidas

- Sin persistencia: recargar recupera los datos iniciales.
- Fechas de partidas generadas respecto al día de ejecución para mantener escenarios futuros y pasados.
- Madrid es fijo durante el prototipo; no hay selector de ciudad.
- No existe comunicación real con las personas ni notificaciones.
- El resultado interno de una solicitud cerrada por aforo es provisional y no define el modelo futuro.
- Las decisiones visuales, densidad de filtros y prominencia de Crear necesitan validación humana.
- Las señales de reputación y fiabilidad son datos ficticios para validar comprensión y utilidad; no garantizan seguridad ni representan un cálculo real.
- Los lugares son nombres simulados de locales o puntos reconocibles. No se ha decidido cuándo ni para quién sería visible una dirección exacta real.

## Primera revisión humana

### Funciona correctamente

- navegación principal;
- Mis partidas;
- creación de partida;
- solicitud de plaza y gestión del aforo;
- comportamiento móvil;
- comportamiento desktop.

### Mejoras detectadas

- hacer explícita desde Explorar la propuesta de encontrar personas con quienes jugar a juegos de mesa;
- incorporar señales que ayuden a decidir si organizadores y participantes inspiran confianza;
- validar reputación como hipótesis importante, separándola de la fiabilidad observable;
- dar algo más de espacio y jerarquía a las tarjetas de partidas;
- aportar una identidad visual más reconocible dentro del hobby de juegos de mesa.

### Dirección visual

La iteración adopta la idea de **club moderno de juegos de mesa**: cercana, seria, fiable y con personalidad. Utiliza referencias abstractas a mesas, tableros, fichas y cartas sin recurrir a estética gamer, casino, infantil o de fantasía.

### Hipótesis de confianza representada

Los perfiles muestran valoraciones y opiniones simuladas como **reputación**, y partidas jugadas, asistencias y ausencias sin aviso como **fiabilidad**. El detalle resume ambas dimensiones para quien organiza. No existe acción para valorar: conceptualmente, una futura review solo podrá proceder de participantes confirmados que hayan compartido una partida ya finalizada.

## Segunda revisión humana

- En desktop, «Crear partida» se separa de los destinos de navegación y se mantiene como acción principal compacta.
- El filtro de fecha pasa a opciones seleccionables visibles y la zona conserva un selector nativo integrado visualmente.
- El detalle incorpora orientación contextual sencilla para distinguir consulta y gestión, respetando el origen de navegación.
- La identidad, reputación, fiabilidad y acceso al perfil del organizador se agrupan en una unidad de lectura coherente.
- Las tarjetas y sus estados ganan espacio moderado para mejorar jerarquía y legibilidad.
- Crear partida distingue zona, lugar y descripción. El lugar es texto libre opcional y se representa con datos simulados, sin mapas ni servicios externos.
- La política de privacidad y el momento de revelar un punto concreto de encuentro continúan pendientes antes de producción.

## Iteración de navegación y header

- El header desktop separa los destinos de navegación de la acción compacta Crear partida.
- Los estados activos se reconocen por tipografía e indicador visual, además del color.
- La navegación inferior mantiene los cuatro destinos y targets táctiles amplios; Crear conserva un énfasis moderado sin adoptar un patrón flotante.
- Los breadcrumbs preservan el origen al pasar de Explorar o Mis partidas al detalle y desde este al perfil de otra persona.
- No se modifican flujos, estado de negocio, rutas disponibles ni datos simulados.

## PROMPT-003F — Filters & Forms

- Explorar conserva juego, fecha y zona con una composición más compacta y coherente con la fundación visual.
- Zona/distrito estrena un selector visual accesible y reutilizable, sin librerías externas ni catálogo adicional.
- Crear partida mantiene una sola pantalla, mejora su jerarquía responsive y diferencia claramente campos obligatorios y opcionales.
- Madrid continúa fijo; Lugar sigue siendo texto libre opcional y separado de zona y descripción.
- Fecha y hora mantienen controles nativos. La validación conserva los valores y elimina cada error cuando se corrige su campo.

## Cierre funcional de Fase 2

Tras la revisión funcional, el prototipo queda aprobado. Funcionan:

- navegación principal;
- Explorar y sus filtros de juego, fecha y zona/distrito;
- detalle de partida;
- solicitud de plaza;
- gestión de solicitudes y control de aforo;
- creación de partidas;
- lugar de la partida diferenciado de zona y descripción;
- Mis partidas;
- perfiles propios y ajenos;
- reputación y fiabilidad simuladas;
- experiencia responsive en mobile y desktop;
- datos exclusivamente simulados y mantenidos en memoria.

## Trabajo diferido no bloqueante

El cierre de esta fase no incluye, y no bloquea, los siguientes trabajos:

- refinamiento visual fino de cards;
- refinamiento de perfil y reviews;
- pulido final de componentes;
- pruebas con usuarios externos;
- autenticación real, Firebase y persistencia;
- decisión definitiva sobre privacidad y visibilidad del lugar;
- moderación;
- monetización;
- colección e intercambio de juegos;
- votación o selección colectiva de juegos;
- funcionalidades sociales futuras.

La visión futura contempla un modelo de monetización sostenible mediante funcionalidades premium, especialmente para jugadores avanzados, organizadores, clubes y tiendas o comercios. Las capacidades esenciales de descubrimiento, participación y confianza deberán mantenerse accesibles para favorecer el crecimiento de la comunidad. No se definen todavía planes, precios, billing ni pagos.

Las capacidades POST-MVP de colección, intercambio, votación de juegos y evolución social se conservan como posibilidades futuras de producto.

## Fuera del prototipo

Firebase, backend, APIs, autenticación real, catálogo externo, mapas, geolocalización, reglas definitivas de visibilidad del lugar, edición/cancelación de partidas, abandono o retirada de solicitudes, lista de espera, moderación, colección, intercambio, chat, publicación de reviews, cálculo o persistencia de reputación/fiabilidad, votación de juegos, pagos, notificaciones push, analytics y demás funciones POST-MVP.
