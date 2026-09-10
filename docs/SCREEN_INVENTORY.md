# Inventario de pantallas — Fase 1

## Criterio de reducción

El MVP se resuelve con cinco pantallas principales. Los estados de solicitud, la gestión del organizador y la edición de perfil son variantes contextuales, no pantallas independientes. Esto reduce navegación y evita una administración prematura.

## SCR-01 — Explorar partidas

- **Objetivo:** descubrir partidas disponibles y llegar a su detalle.
- **Usuario:** cualquier persona que busca partida; en el prototipo se usa una identidad simulada.
- **Punto de entrada:** apertura de la aplicación o navegación «Explorar».
- **Acciones principales:** buscar juego, filtrar fecha, filtrar zona/distrito, limpiar filtros, ver partida, crear partida desde un vacío general.
- **Información principal:** propuesta de valor explícita sobre encontrar personas con quienes jugar a juegos de mesa, Madrid, filtros activos y tarjetas con juego, fecha/hora, zona, organizador, confirmados/aforo y plazas disponibles.
- **Estados importantes:** loading, listado con resultados, sin partidas disponibles, sin coincidencias de filtros y error de carga.

No muestra completas, canceladas o pasadas. No necesita orden avanzado ni mapa.

## SCR-02 — Detalle de partida

- **Objetivo:** permitir decidir, solicitar o gestionar según rol.
- **Usuario:** visitante interesado, solicitante pendiente, participante confirmado u organizador.
- **Punto de entrada:** tarjeta de Explorar, tarjeta de Mis partidas o detalle tras publicar.
- **Acciones principales:** solicitar plaza; abrir perfil; para el organizador, aceptar o rechazar solicitudes.
- **Información principal:** orientación contextual de origen y modo de consulta/gestión; juego, fecha, hora, Madrid, zona/distrito y lugar simulado si existe; organizador con reputación y fiabilidad simuladas resumidas, descripción, confirmados/aforo, plazas disponibles, participantes confirmados y estado personal.
- **Estados importantes:** loading, disponible para solicitar, solicitud pendiente, participación confirmada, solicitud no aceptada, partida completada antes de confirmar la solicitud, vista del organizador, completa, cancelada, pasada, error/no encontrada y éxito tras publicación.

Variantes:

- **Participante potencial:** muestra «Solicitar plaza» si la partida está disponible.
- **Solicitud pendiente:** sustituye la acción por un mensaje que indica que aún no existe plaza confirmada.
- **Confirmado:** muestra «Participación confirmada».
- **Organizador:** muestra participantes y solicitudes pendientes con Aceptar/Rechazar.
- **Partida completada durante la espera:** la solicitud deja de figurar como pendiente y se explica que no llegó a confirmarse porque se agotaron las plazas, sin presentarlo como rechazo personal.
- **No disponible:** explica completa, cancelada o pasada y elimina la acción de solicitud.

El prototipo puede mostrar el nombre de un local o punto reconocible; no exige una dirección postal ni define la visibilidad futura de un punto exacto real.

## SCR-03 — Crear partida

- **Objetivo:** publicar una partida mediante un formulario corto.
- **Usuario:** persona identificada que organiza.
- **Punto de entrada:** navegación principal «Crear» o CTA desde el vacío de Explorar/Mis partidas.
- **Acciones principales:** seleccionar juego simulado, introducir fecha/hora, seleccionar zona o distrito de Madrid, añadir un lugar opcional diferenciado, indicar aforo total, añadir descripción opcional y publicar.
- **Información principal:** Madrid como contexto fijo no editable; zona, lugar y descripción separados; etiquetas, obligatoriedad, ayuda de aforo y resumen de errores.
- **Estados importantes:** inicial, edición, validación incorrecta, publicación en curso, error de publicación y éxito con navegación a SCR-02.

La pantalla es única. No contiene selector de ciudad, multi-ciudad, recurrencia, torneo, lista de espera, votación, múltiples juegos, mapa, geolocalización, precio o pago. Esta simplificación del prototipo no bloquea soporte futuro para otras ciudades.

## SCR-04 — Mis partidas

- **Objetivo:** consultar y distinguir partidas organizadas, solicitudes y participaciones.
- **Usuario:** persona identificada.
- **Punto de entrada:** navegación principal «Mis partidas».
- **Acciones principales:** alternar «Organizadas por mí» / «Participo / he solicitado», abrir detalle, crear o explorar desde estados vacíos.
- **Información principal:** tarjetas con juego, fecha/hora, zona, relación del usuario, estado de partida o solicitud y alertas de solicitudes pendientes para el organizador.
- **Estados importantes:** loading, contenido en cada segmento, vacío por segmento, error, pendiente, confirmada, no aceptada, partida completada antes de confirmar la solicitud, abierta/organizada, completa, cancelada y pasada.

Los estados se muestran solo cuando explican la situación. No se modelan transiciones administrativas adicionales.

## SCR-05 — Perfil básico

- **Objetivo:** responder quién es la persona y permitir revisar el propio perfil.
- **Usuario:** titular del perfil u otra persona desde una partida.
- **Punto de entrada:** navegación «Perfil», nombre del organizador o participante.
- **Acciones principales:** abrir actividad relacionada; solo en perfil propio, editar y guardar datos básicos.
- **Información principal:** nombre visible, avatar opcional, Madrid como ciudad fija del prototipo, zona/distrito opcional, descripción opcional, actividad derivada, reputación subjetiva, fiabilidad observable o derivada, aspectos destacados y opiniones recientes simuladas.
- **Estados importantes:** perfil propio, perfil ajeno, opcionales ausentes, edición, error de validación, guardado, éxito y error de carga.

No incluye email/teléfono públicos, seguidores, amistades, badges o nivel. Las opiniones son de solo lectura y se presentan como procedentes de partidas finalizadas compartidas por participantes confirmados; no existe acción para valorar.

## Matriz resumida de estados

| Estado | SCR-01 | SCR-02 | SCR-03 | SCR-04 | SCR-05 |
|---|---:|---:|---:|---:|---:|
| Loading | Sí | Sí | Al publicar | Sí | Sí |
| Empty | Sí | No aplica | No aplica | Sí | Opcionales ausentes |
| Error | Sí | Sí | Sí | Sí | Sí |
| Success | No aplica | Solicitud/publicación | Publicación | No aplica | Guardado |
| Pending | No | Sí | No | Sí | No |
| Full | Se excluye | Sí | No | Sí | No |
| Resultado por aforo completo | No | Sí | No | Sí | No |
| Cancelled | Se excluye | Sí | No | Sí | No |
| Past | Se excluye | Sí | No | Sí | No |

«No aplica» evita crear estados sin una necesidad real.

## Comportamiento responsive común

- **Móvil:** una columna, contenido prioritario primero, navegación inferior persistente y acciones con área táctil suficiente.
- **Desktop:** navegación superior, filtros en fila, tarjetas en cuadrícula y detalle con una segunda columna cuando mejore la lectura.
- La información, acciones y estados son equivalentes en ambos; solo cambia la distribución.
