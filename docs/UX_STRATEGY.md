# Estrategia UX — Fase 1

## Estado y alcance

- **Fase:** 1 — UX y User Flows
- **Estado:** completada tras revisión humana
- **Contexto fijo del prototipo:** Madrid
- **Fuentes de producto:** `PRD.md` y `MVP.md`, complementados por las decisiones aprobadas para esta fase.

Este documento traduce el MVP a una experiencia coherente antes del prototipo. No define UI visual, modelo de datos ni arquitectura técnica. Durante la Fase 2, Madrid será el contexto geográfico fijo y preseleccionado: Explorar muestra partidas de Madrid y los usuarios filtran o crean por zona/distrito. Esto no limita el producto futuro ni debe bloquear una ampliación arquitectónica posterior a múltiples ciudades.

PROMPT-007A amplió posteriormente este documento con la estrategia conceptual del Marketplace MVP. PROMPT-008A aprueba después un MVP real de reviews entre Players elegibles, definido en `TRUST_REPUTATION_PRODUCT.md`; esta estrategia histórica no prescribe todavía su UI.

## Objetivo UX

La experiencia debe responder con rapidez a: «Quiero jugar a un juego de mesa y necesito encontrar gente con quien jugar».

En la exploración y el detalle, una persona debe poder reconocer sin esfuerzo:

1. a qué juego se jugará;
2. cuándo será;
3. en qué zona aproximada de Madrid;
4. quién organiza;
5. cuántas plazas confirmadas y disponibles hay;
6. cómo solicitar una plaza;
7. si su solicitud está pendiente o confirmada.
8. qué señales de confianza existen sobre la persona organizadora.

## Principios UX

- **Explorar primero:** la entrada principal muestra partidas disponibles, no un dashboard genérico.
- **Información para decidir:** juego, fecha/hora, zona, aforo y organizador aparecen antes de pedir una acción.
- **Estados con lenguaje inequívoco:** «Solicitud pendiente» y «Participación confirmada» nunca se presentan como equivalentes.
- **Acción principal visible:** solicitar, publicar o gestionar solicitudes debe ser evidente según contexto y rol.
- **Divulgación progresiva:** el listado resume; el detalle contiene participantes, descripción y acciones.
- **Privacidad por defecto:** para descubrir se muestra Madrid y una zona o distrito, nunca el punto exacto de encuentro.
- **KISS:** pocos filtros, un único formulario de creación y reutilización del detalle para la gestión del organizador.
- **Recuperación:** errores y estados vacíos explican qué ocurrió y ofrecen una acción siguiente.
- **Accesibilidad desde el diseño:** estructura, contenido, foco y estados se conciben para WCAG 2.2 AA.
- **Sin falsas expectativas:** una solicitud pendiente no consume una plaza confirmada ni promete aceptación.
- **Confianza con contexto:** reputación subjetiva y fiabilidad observable se presentan por separado; ninguna cifra se comunica como garantía de seguridad.

## Arquitectura de información propuesta

### Navegación de primer nivel

1. **Explorar:** destino inicial; listado y filtros de partidas disponibles en Madrid.
2. **Mis partidas:** dos vistas internas: «Organizadas por mí» y «Participo / he solicitado».
3. **Crear:** acceso directo al formulario breve para publicar una partida.
4. **Perfil:** perfil propio y acceso a su edición básica.

La propuesta usa cuatro elementos porque cada uno soporta una intención principal frecuente. En móvil conservan una posición estable en la navegación inferior. En desktop, Explorar, Mis partidas y Perfil se leen como navegación y «Crear partida» aparece al lado como acción principal compacta y separada. No depende exclusivamente de un botón flotante o de un icono.

### Navegación contextual

- El resultado de Explorar abre el detalle de partida.
- El nombre del organizador o de un participante abre su perfil básico.
- Una partida organizada desde Mis partidas abre el mismo detalle con controles del organizador.
- Las solicitudes se gestionan dentro del detalle del organizador. Los aforos pequeños del MVP no justifican una pantalla administrativa separada.
- Tras publicar, se abre el detalle de la nueva partida con confirmación de éxito.

### Elementos que no necesitan primer nivel

- Detalle de partida y perfil ajeno son destinos contextuales.
- Filtros pertenecen a Explorar.
- Solicitudes pendientes pertenecen a la partida organizada.
- No existen navegación de feed, mensajes, colección o notificaciones.
- Marketplace no requiere todavía un destino permanente: «Juegos de la comunidad» se descubre después de las partidas en Explorar, y «Mis anuncios» vive dentro del Perfil propio.

### Mapa sencillo

```text
Explorar
├── Detalle de partida
│   └── Perfil de organizador o participante
└── Juegos de la comunidad
    ├── Ver todos
    └── Detalle de anuncio

Mis partidas
├── Organizadas por mí
│   └── Detalle + solicitudes
└── Participo / he solicitado
    └── Detalle + estado personal

Crear
└── Detalle de la partida publicada

Perfil
├── Edición básica del propio perfil
└── Mis anuncios
```

## Estrategia UX del Marketplace MVP

### Jerarquía en Explorar

Las partidas siguen siendo el primer contenido y el principal motivo para visitar Explorar. Después del listado o bloque principal aparece «Juegos de la comunidad» con pocas publicaciones activas y recientes, seguido de «Ver todos». Marketplace no usa un hero propio ni compite con la acción de encontrar o crear una partida.

En móvil se recomienda una lista vertical compacta de dos o tres anuncios: evita ocultar contenido esencial en un carrusel y conserva navegación por teclado y lectura lineal. En desktop puede utilizarse una cuadrícula reducida de hasta tres elementos. El listado completo mantiene el mismo orden por publicación reciente y solo incorpora búsqueda por juego, modalidad o zona si la cantidad de anuncios lo justifica.

### Información para decidir

La card permite reconocer imagen, juego, condición, venta/intercambio, precio cuando corresponda y Madrid + zona. El detalle amplía descripción, propietario, perfil, fecha y estado. No muestra dirección exacta, email ni teléfono.

### Publicar y gestionar

Publicar utiliza un formulario corto con una imagen, nombre del juego, descripción, condición, modalidad, precio condicionado a venta y zona dentro de Madrid. El propietario gestiona sus anuncios en «Perfil → Mis anuncios», donde puede editar, cerrar y consultar intereses. Cerrar sustituye al hard-delete y no equivale a reservar.

### Interés privado

«Me interesa» registra una señal privada y no vinculante. El propietario puede aceptar o declinar y ambos ven el resultado, pero la aceptación no promete una venta ni revela contacto personal. No hay chat, negociación o pago. La suficiencia de esta señal y la necesidad de un mecanismo de coordinación seguro son hipótesis que deben validarse antes de pruebas públicas.

## Dirección de la iteración visual

La primera revisión humana confirma una base seria y creíble, pero exige hacer inequívoca la propuesta de valor. Explorar abre con una frase breve que explica que Mesa Abierta sirve para encontrar personas con quienes jugar a juegos de mesa en Madrid. Este encabezado permanece compacto en móvil para que filtros y partidas sigan apareciendo pronto.

La dirección visual se define como **club moderno de juegos de mesa**: cercana, seria, fiable y con personalidad editorial. Emplea superficies cálidas, geometrías de tablero, fichas y cartas abstractas de forma sutil. Evita fantasía, estética gamer/neón, casino, ilustración infantil y decoración que compita con la información.

## Estrategia de descubrimiento

### Orden inicial

Las partidas se ordenan por fecha y hora próximas. No se añade un selector de orden al MVP: la proximidad temporal responde al caso de uso y reduce controles.

### Filtros mínimos

- **Juego:** búsqueda por nombre entre los juegos simulados.
- **Fecha:** cualquier fecha, hoy, próximos siete días o este fin de semana mediante botones seleccionables visibles.
- **Zona o distrito:** una selección simple de ejemplos de Madrid, sin catálogo oficial ni mapa.

Madrid se muestra como contexto fijo y no editable. No existe selector de ciudad, multi-ciudad, geolocalización, GPS ni mapa en el prototipo. Tampoco se añade un filtro avanzado de distancia, duración, dificultad, edad, idioma o experiencia. Al limpiar filtros se recupera el listado disponible completo de Madrid.

En 360–430 px, las opciones de fecha forman una cuadrícula compacta y mantienen selección textual y gráfica. La zona conserva un `select` nativo para evitar un componente complejo. Esta distribución podrá refinarse visualmente, pero no añadirá filtros.

### Contenido mínimo de una tarjeta

- nombre del juego;
- fecha y hora;
- zona o distrito y Madrid;
- nombre visible del organizador;
- plazas confirmadas sobre aforo total y plazas disponibles;
- acción «Ver partida».

Una solicitud pendiente no se suma a participantes confirmados. Las partidas completas, canceladas o pasadas no aparecen en el listado de disponibles, aunque pueden mantenerse visibles en Mis partidas cuando pertenezcan al usuario.

## Estrategia de participación

La acción se denomina **«Solicitar plaza»**, no «Unirme», para evitar prometer confirmación inmediata.

Después de solicitar, el propio detalle muestra un panel persistente:

> Solicitud enviada · Pendiente de respuesta del organizador. Aún no tienes una plaza confirmada.

El botón de solicitud desaparece o queda sustituido por el estado; no puede enviarse otra solicitud. Si el organizador acepta, el estado cambia a «Participación confirmada» y el usuario cuenta en el aforo. Si rechaza, se muestra «Solicitud no aceptada» con lenguaje neutral.

Si otra aceptación ocupa la última plaza mientras una solicitud sigue pendiente, esa solicitud deja de estar pendiente y se presenta el resultado: «La partida se ha completado. Tu solicitud no llegó a confirmarse porque ya no quedan plazas». Este mensaje describe falta de capacidad y no implica un rechazo personal.

No se ofrece solicitar cuando la partida está completa, cancelada o pasada. El organizador tampoco puede solicitar plaza en su propia partida.

## Estrategia del organizador y aforo

- El organizador es el primer participante confirmado.
- El aforo se comunica como `confirmados / total` y también mediante texto de plazas disponibles.
- Las solicitudes pendientes se cuentan por separado y no reducen plazas confirmadas.
- El organizador ve nombre, avatar si existe, zona general y descripción breve del solicitante. Puede abrir el perfil simulado para consultar las mismas señales de reputación y fiabilidad disponibles para el resto de usuarios.
- Al aceptar, se comprueba de nuevo que exista plaza. El usuario pasa a confirmado y el contador se actualiza.
- Al cubrir la última plaza, la partida pasa a completa, deja de estar disponible en Explorar y ya no permite aceptar solicitudes.
- Las demás solicitudes dejan de aparecer como pendientes en ese momento. Para sus solicitantes, el resultado explica que la partida se completó antes de que su plaza fuese confirmada; no se presenta como rechazo personal.
- No existe lista de espera. La denominación técnica de este resultado se decidirá en arquitectura y no forma parte de la decisión UX.
- Rechazar pide una confirmación breve para evitar acciones accidentales y después muestra resultado. No se solicita motivo en el MVP.

## Creación de partida

Se mantiene una sola pantalla. Los datos introducidos o seleccionados por el usuario son breves, siguen una secuencia natural y no justifican pasos ni indicador de progreso:

1. juego simulado;
2. fecha;
3. hora;
4. zona o distrito de Madrid;
5. lugar opcional, como nombre de un local o punto reconocible;
6. aforo total, incluyendo al organizador;
7. descripción opcional.

La pantalla muestra «Ciudad: Madrid» como contexto preseleccionado, no como campo de texto editable. No ofrece selector de ciudad. Esta decisión es específica del prototipo y no convierte Madrid en una restricción futura del producto.

Zona, lugar y descripción son conceptos distintos. El prototipo muestra el lugar para validar su utilidad, pero no solicita una dirección postal ni resuelve cuándo debe revelarse un punto exacto real. Esa política permanece pendiente y deberá aplicar minimización de datos y visibilidad controlada.

El texto de ayuda del aforo hará explícito: «Te contamos dentro del aforo». Los errores se muestran junto al campo y en un resumen enlazable al inicio del formulario. Tras publicar se navega al detalle, con el mensaje «Partida publicada».

El MVP crea una partida con un único juego definido. No se representa votación, propuesta múltiple o elección colectiva.

## Perfil básico

El perfil responde principalmente «¿Quién es esta persona con la que potencialmente voy a jugar?» y permite explorar si las señales de confianza reducen la incertidumbre al quedar.

### Perfil propio

- nombre visible;
- avatar opcional;
- ciudad;
- zona o distrito opcional;
- descripción breve opcional;
- recuentos derivados de partidas organizadas y participaciones, si ayudan a orientar;
- reputación simulada: media, número de valoraciones y opiniones recientes;
- fiabilidad simulada y separada: partidas jugadas, asistencias y ausencias sin aviso;
- aspectos mencionados por otros jugadores, sin badges ni gamificación;
- acción «Editar perfil».

### Perfil de otra persona

Muestra los mismos datos que sean públicos, incluidas las señales simuladas de confianza, sin acción social. No incluye email, teléfono, fecha de nacimiento, seguidores, badges o nivel. La ausencia de avatar, zona o descripción se resuelve sin campos vacíos ni mensajes negativos.

La reputación representa opiniones subjetivas de personas con las que se compartió mesa. La fiabilidad representa comportamiento observable o derivado y nunca se fusiona en una única estrella. Las reviews del prototipo son solo lectura y variadas; no existe flujo para escribirlas. Como principio provisional, una futura valoración solo podría realizarse tras una partida finalizada entre participantes confirmados.

El detalle de partida muestra únicamente un resumen compacto de reputación y fiabilidad de quien organiza, además del enlace al perfil. Las opiniones completas permanecen en el perfil para no desviar el foco de la partida.

Esta composición es una **hipótesis UX**, no un modelo de datos definitivo.

## Mobile First

### Móvil, aproximadamente 360–430 px

- Una sola columna y lectura vertical.
- Navegación principal persistente en la parte inferior, con texto visible para cada destino.
- Encabezado compacto con título de pantalla y contexto «Madrid» donde sea relevante.
- Tarjetas a ancho disponible; toda la tarjeta puede agrupar contenido, pero la acción mantiene un nombre claro.
- Filtros inmediatamente antes del listado, apilados o en controles compactos sin ocultar el filtro activo.
- Acción principal de detalle cercana al contenido decisivo y repetible al final si la longitud lo requiere.
- Formulario en una columna, con campos y errores próximos.
- Áreas táctiles razonables y separación que evite activaciones accidentales.

### Evolución a desktop

- La navegación se mueve a un encabezado horizontal conservando nombres y orden mental.
- Explorar usa una fila de filtros y una cuadrícula de tarjetas de dos o tres columnas según espacio disponible.
- El detalle puede usar dos columnas: información principal y resumen/acción; el orden de lectura semántico sigue siendo coherente.
- En la vista del organizador, solicitudes y participantes pueden ocupar una columna secundaria sin convertirse en otra pantalla.
- Crear usa un contenedor de ancho de lectura moderado; no se estira el formulario ni se divide artificialmente.
- Mis partidas puede mostrar más tarjetas por fila, conservando los dos segmentos.

No se fijan breakpoints ni reglas CSS en esta fase.

## Accesibilidad UX — WCAG 2.2 AA

- Orden de encabezados lógico y un título principal identificable por pantalla.
- Todos los campos tienen etiqueta persistente; el placeholder no sustituye a la etiqueta.
- Instrucciones y formato esperado aparecen antes de provocar el error cuando sea necesario.
- Errores específicos, en lenguaje claro, junto al campo y resumidos al inicio; el foco se dirige al resumen tras un envío fallido.
- Tras solicitar, aceptar, rechazar o publicar, el foco se coloca en el mensaje de resultado o en el nuevo título de destino.
- Navegación y acciones completas mediante teclado, con orden predecible y foco visible.
- «Pendiente», «Confirmada», «Completa», «Cancelada» y «Pasada» se expresan con texto; color o icono solo refuerzan.
- Botones usan verbos: «Solicitar plaza», «Aceptar solicitud», «Rechazar solicitud», «Publicar partida».
- Los enlaces identifican destino: «Ver partida de Terraforming Mars» en su nombre accesible, aunque visualmente digan «Ver partida».
- Las zonas táctiles y la separación entre Aceptar/Rechazar permiten operar sin precisión fina.
- Loading no bloquea silenciosamente; error y vacío ofrecen reintento, limpiar filtros o crear partida según contexto.
- El contenido esencial no depende de imagen, avatar, icono, posición o gesto.
- Las estrellas incluyen una alternativa textual y reputación/fiabilidad usan títulos explícitos; no dependen solo de iconos o color.
- Los segmentos de Mis partidas usan botones normales con estado pulsado y funcionamiento nativo mediante Tab, Enter y Espacio.
- La ampliación a desktop no altera el orden de lectura ni esconde funcionalidad disponible en móvil.

No se prescribe implementación ARIA en esta fase; se definirá con la semántica concreta del prototipo.

## Decisiones UX aprobadas para el prototipo

1. Explorar es la entrada y las partidas se ordenan por proximidad temporal.
2. La navegación principal tiene cuatro destinos: Explorar, Mis partidas, Crear y Perfil.
3. Los únicos filtros del MVP son juego, fecha y zona/distrito; Madrid es el contexto fijo y no editable del prototipo.
4. El listado muestra juego, fecha/hora, zona, organizador y aforo sin imágenes obligatorias.
5. El detalle es una única pantalla conceptual con variantes para usuario potencial, solicitud pendiente, participante confirmado, organizador y partida completa, cancelada o pasada. Solicitar la actualiza a «pendiente» sin crear otra pantalla.
6. La gestión de solicitudes se integra en el detalle del organizador.
7. Crear partida utiliza una sola pantalla y termina en el detalle publicado.
8. Mis partidas utiliza dos segmentos: «Organizadas por mí» y «Participo / he solicitado».
9. El perfil propio y ajeno reutilizan una misma estructura; solo el propio permite editar.
10. Las partidas completas, canceladas y pasadas se excluyen de Explorar, pero siguen visibles en Mis partidas cuando corresponda.
11. Al llenarse el aforo, ninguna solicitud inviable permanece pendiente: se cierra con un mensaje de capacidad, sin lista de espera ni apariencia de rechazo personal.
12. La identidad ya iniciada y los juegos serán simulados durante el prototipo; no se diseñan autenticación ni catálogo externo.
13. La confianza es una hipótesis prioritaria del prototipo: perfiles y detalle representan reputación y fiabilidad simuladas por separado, sin publicación de reviews ni sistema productivo.

Estas decisiones han sido aprobadas para el prototipo. No definen modelo de datos ni arquitectura técnica y podrán reevaluarse después de la validación visual cuando así se indica.

## Hipótesis utilizadas

- El prototipo puede comenzar con una identidad simulada ya iniciada; no necesita diseñar autenticación.
- El perfil mínimo usa nombre visible, avatar opcional, ciudad, zona/distrito opcional y descripción breve opcional. En el prototipo, la ciudad mostrada es Madrid y no se edita.
- Si no hay avatar, se usa un sustituto textual neutro; no se obliga a subir imagen.
- Fechas y horas de ejemplos se entienden en el contexto local de Madrid.
- Los juegos, usuarios y partidas del prototipo son datos simulados.
- El número de solicitudes por partida será suficientemente pequeño para gestionarlas en el detalle.
- Las personas comprenden mejor el aforo si ven confirmados/total y plazas disponibles juntos; debe validarse.
- El formulario en una pantalla será más comprensible que un flujo por pasos; debe comprobarse en prototipo.
- Reputación y fiabilidad separadas pueden ayudar a decidir quedar sin crear una falsa equivalencia entre opinión y comportamiento; debe validarse con usuarios.

## Preguntas realmente bloqueantes para Fase 2

No se identifica una pregunta adicional que impida construir un prototipo con datos simulados. La Fase 1 ya ha sido aprobada; el inicio de la Fase 2 requiere todavía su activación explícita conforme al workflow. Autenticación, catálogo externo, punto exacto de encuentro, moderación, requisitos legales y métricas permanecen fuera del prototipo sin bloquearlo.

## Cuestiones pendientes no bloqueantes para Fase 2

- Edición y cancelación de una partida.
- Abandono de una participación confirmada, retirada voluntaria de una solicitud y ausencias.
- Método y experiencia de autenticación real.
- Composición definitiva y visibilidad del perfil; la actual continúa siendo hipótesis UX.
- Punto exacto de encuentro y su visibilidad.
- Moderación y medidas mínimas de seguridad para pruebas externas.
- Necesidad y fuente de un catálogo externo.
- Experiencia multi-ciudad real y selector futuro de ciudad.
- Usuario prioritario, requisitos legales, compatibilidad objetivo y métricas de validación.
- Colección, chat y votación de juegos siguen fuera del alcance implementado. La Fase 7 aprueba reviews simples de reputación, pero attendance/no-show y fiabilidad productiva continúan diferidos.

Las cuestiones de ciclo de vida deberán resolverse antes del primer vertical slice, según el PRD, pero no impiden un prototipo visual con datos simulados.

## Fuera de esta fase

Durante la Fase 1 quedaron fuera intercambio, colección, feed, seguidores, amistades, chat, publicación de reviews, sistema productivo de reputación/fiabilidad, votación o elección colectiva de juegos, clubes, tiendas, gamificación, notificaciones push, IA, pagos, mapas, geolocalización y *tracking*. PROMPT-007A autorizó posteriormente el Marketplace acotado y PROMPT-008A autoriza reviews simples ligadas a partidas; las demás capacidades continúan excluidas.
