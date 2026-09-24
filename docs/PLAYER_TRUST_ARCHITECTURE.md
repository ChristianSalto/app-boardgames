# Arquitectura de Player Trust

## Estado y alcance

- **Fase:** 7 — Trust & Reputation MVP
- **Tarea:** PROMPT-008E — Player Trust Security Hardening
- **Estado:** Security Rules y pruebas formales implementadas; en revisión

Este documento concreta el capability `player-trust` aprobado en `TRUST_REPUTATION_PRODUCT.md` y registra su implementación incremental. PROMPT-008E consolida la frontera de confianza de reviews y del tiempo canónico sin añadir funcionalidades ni cambiar UI.

## Boundary

`player-trust` posee:

- `PlayerReview` y sus invariantes;
- la decisión de elegibilidad para valorar;
- publicación inmutable y unicidad de reviews;
- consultas de reviews recibidas;
- cálculo del resumen derivado de reputación;
- read models de confianza consumidos por Perfil.

No posee `Player`, Authentication, `GameSession`, attendance, no-shows, gamificación ni reputación comercial. Usa `PlayerId` como primitiva transversal y consume evidencia mínima de otros dominios mediante ports definidos por su Application.

La elegibilidad mostrada por la UI es orientativa. La autorización definitiva se vuelve a comprobar en el límite de confianza de Firestore al crear la review.

## Modelo mínimo

### `PlayerReview`

| Campo | Significado |
| --- | --- |
| `id` | Identificador determinista de la relación única. |
| `sessionId` | Partida que acredita la relación. |
| `reviewerId` | Player autor; debe corresponder a la identidad autenticada. |
| `reviewedPlayerId` | Player valorado. |
| `rating` | Entero entre 1 y 5. |
| `comment` | Texto plano opcional, normalizado y con máximo de 500 caracteres. |
| `createdAt` | Instante de publicación asignado por servidor. |

No contiene nombres, avatar, juego, asistencia, categorías, estado de sesión ni snapshots de otros dominios. Es inmutable desde clientes.

El comentario se recorta en extremos antes de enviarse. Una cadena vacía equivale a ausencia. No admite edición enriquecida y Presentation siempre lo renderiza como texto, nunca como HTML interpretado. El límite de **500 caracteres** permite explicar una experiencia breve y sigue siendo sencillo de validar de forma coherente en Presentation, Domain y Rules.

## ReviewId y unicidad

El identificador se deriva de la tupla ordenada:

```text
sessionId + reviewerId + reviewedPlayerId
```

La representación recomendada es el SHA-256 hexadecimal de una codificación canónica con separadores no ambiguos. El mismo algoritmo debe existir en Infrastructure y en las pruebas de Rules. Firestore Rules puede verificar el hash esperado a partir de los campos de la solicitud.

Ventajas:

- un único path representa la misma review direccional;
- `create` falla si el documento ya existe, incluso con clientes concurrentes;
- evita una query previa como mecanismo de unicidad;
- no depende de analizar un ID compuesto con separadores que también puedan aparecer en identificadores;
- mantiene longitud fija y no copia tres identificadores al path.

El hash no es una medida de confidencialidad: los identificadores siguen dentro del documento legible por usuarios autenticados. No se usa un UUID aleatorio.

## Evidencia de elegibilidad

### Fuente real actual

La colección `gameSessions` conserva:

- `organizerId`;
- `participantIds`, inicializado con el organizador y ampliado únicamente durante una aceptación protegida;
- `status`, actualmente `scheduled` o `cancelled`;
- `startsAt` como `Timestamp` canónico;
- `date` y `time` conservados temporalmente como compatibilidad derivada, no como autoridad.

`participationRequests/{sessionId_playerId}` conserva la transición de solicitud y su estado, pero no es la fuente final de pertenencia. La aceptación actual actualiza atómicamente la solicitud a `confirmed` y añade el Player a `gameSessions.participantIds`.

Por tanto, **`participantIds` es la fuente de verdad de participantes confirmados** para reviews. Incluye al organizador y evita que `player-trust` necesite interpretar solicitudes. `participationRequests` permanece como historial del flujo, no como dependencia para elegibilidad.

### Read model interno

Application consume un `ReviewSessionEvidence` mínimo, propiedad de `player-trust`:

- `sessionId`;
- `status`;
- `startsAt` como instante;
- `participantIds`;
- `gameName` solo para contexto de lectura posterior.

Este tipo no es `GameSession` ni importa su dominio. Un adaptador traduce la proyección persistida. Domain recibe además el `reviewerId`, `reviewedPlayerId` y un `now` explícito para evaluar reglas puras.

## Evidencia temporal confiable

### Problema resuelto en 008D

`date` y `time` son cadenas civiles separadas. Las Rules no pueden resolver de forma fiable `Europe/Madrid`, incluidos cambios DST, a partir de esas cadenas. Compararlas con `request.time` o convertirlas como UTC repetiría el bug histórico de horas.

Además, hoy el organizador puede escribir esos campos dentro de las actualizaciones permitidas. Una operación de reviews no debe confiar en una fecha que un cliente pueda convertir arbitrariamente en pasada.

### Decisión

`gameSessions` usa un **`startsAt` Firestore Timestamp canónico** que representa el instante real de la partida:

- la entrada civil se interpreta explícitamente en `Europe/Madrid`, respetando DST;
- UI y Domain reciben una representación agnóstica de Firebase y formatean el instante para Madrid;
- Rules comparan `startsAt` con `request.time`;
- las nuevas escrituras ya no persisten `date` ni `time`; ambos solo pueden sobrevivir como campos legacy de lectura y quedan inmutables desde cliente;
- creación y edición deben exigir un `startsAt` futuro;
- una sesión cuyo `startsAt` ya pasó no puede reprogramarse desde cliente.

El valor visible de fecha/hora se deriva del instante canónico en `Europe/Madrid`. La conversión rechaza horas civiles inexistentes durante el salto de primavera y, ante una hora ambigua de otoño, elige explícitamente la primera ocurrencia. `npm run migrate:session-starts-at` hace backfill local idempotente de documentos legacy, conserva el resto de campos y reporta migradas, omitidas y errores.

La cancelación conserva la política ya aprobada: el organizador puede cancelar sin hard-delete incluso después del inicio. Una cancelación posterior no borra reviews existentes, pero impide crear nuevas porque la elegibilidad exige que la sesión siga en estado `scheduled`. No se introduce `completed` ni un lifecycle nuevo.

### Cloud Functions

No se necesita una Cloud Function para publicar reviews en el MVP si:

1. `startsAt` es el único instante autoritativo y las Rules protegen sus transiciones;
2. `participantIds` continúa protegido por las Rules actuales;
3. la review se crea con ID determinista, `createdAt == request.time` y forma exacta;
4. los agregados se calculan desde reviews y no se materializan.

Si no puede garantizarse esa evidencia temporal canónica, la alternativa segura sería una operación server-side que derive y valide el instante; no se autorizará una solución basada solo en ocultar el botón o comparar strings.

## Persistencia conceptual

Se recomienda una colección raíz:

```text
playerReviews/{reviewId}
```

Campos persistidos: `sessionId`, `reviewerId`, `reviewedPlayerId`, `rating`, `comment?` y `createdAt`.

Esta forma permite:

- consultar reviews recibidas mediante `reviewedPlayerId`, ordenadas por `createdAt`;
- consultar las realizadas por `reviewerId` cuando un flujo real lo necesite;
- comprobar una review concreta mediante su ID determinista;
- aplicar una única política de lectura autenticada;
- incorporar moderación posteriormente sin ligar la vida del documento a un perfil.

Guardar reviews bajo `players/{playerId}` haría que `players` pareciera propietario del lifecycle, acoplaría su path a la persona valorada y complicaría consultas transversales y retención histórica. No se recomienda.

El índice implementado combina `reviewedPlayerId ASC`, `createdAt DESC` y el ID documental ascendente para sostener una paginación estable.

## Implementación Firestore de 008D

El runtime usa `FirestorePlayerReviewRepository`; el adaptador en memoria queda limitado a pruebas unitarias. La creación escribe `playerReviews/{reviewId}` mediante transacción, falla con resultado `duplicate` si el path ya existe y delega `createdAt` en `serverTimestamp()`. Después convierte el `Timestamp` confirmado a ISO antes de cruzar Infrastructure.

El ID es el SHA-256 hexadecimal lowercase del JSON canónico `['sessionId','reviewerId','reviewedPlayerId']`, representado realmente como array JSON con comillas dobles. No existen operaciones de actualización ni borrado en el port.

El resumen carga todas las reviews recibidas para calcular `averageRating` y `reviewCount`; solo expone las tres más recientes al perfil. El listado `/players/:playerId/reviews` usa páginas de 10 con cursor compuesto por `createdAt` e ID, sin confundir una página visible con la fuente completa del agregado.

## Casos de uso

- **`getReviewEligibility`**: informa a Presentation si la acción debe ofrecerse y por qué no; no sustituye la comprobación autoritativa al crear.
- **`getReviewablePlayersForSession`**: devuelve otros participantes confirmados y si ya fueron valorados por el actor.
- **`createPlayerReview`**: normaliza entrada, aplica invariantes puras y solicita una creación protegida que vuelve a validar evidencia actual.
- **`getPlayerReviews`**: obtiene reviews recibidas, ordenadas y paginables cuando sea necesario.
- **`getPlayerTrustSummary`**: calcula el estado `new` o `rated`, media, recuento y reviews recientes.

No existen `updateReview` ni `deleteReview`. Una futura operación administrativa de moderación no formará parte de la API de cliente.

## Ports de Application

Se mantienen tres contratos pequeños, agrupables en uno o dos archivos si sus implementaciones siguen siendo simples:

1. **`PlayerReviewReader`**: obtiene reviews recibidas y existencia por ID; puede resolver juntas las lecturas necesarias para evitar viajes ceremoniales.
2. **`PlayerReviewWriter`**: crea una review una sola vez con semántica de conflicto; no expone update/delete ni CRUD genérico.
3. **`ReviewEligibilityReader`**: entrega `ReviewSessionEvidence` desde `game-sessions` sin exponer documentos Firebase ni importar su Domain.

Para identidad visible, Application puede consumir el `PlayerRepository.getById` público existente o una función de lectura pública de `players`. No se crea un repositorio paralelo si el contrato actual basta. Si la carga en lote se vuelve necesaria, `players` podrá exponer una operación estrecha `getByIds`; no se anticipa ahora.

La identidad autenticada procede de la API de `authentication`, se resuelve a `PlayerId` en Application y nunca se acepta `reviewerId` como autoridad enviada por Presentation.

## Estrategia de agregados

### Decisión MVP

`averageRating` y `reviewCount` se calculan al leer las reviews recibidas:

- `reviewCount` es el número de reviews visibles;
- `averageRating` es la media aritmética, ausente cuando el recuento es cero;
- las reviews son la única fuente de verdad;
- no se escribe ningún agregado en `Player` ni en un documento summary;
- el volumen inicial permite priorizar simplicidad y consistencia.

Esta decisión elimina una escritura multi-documento y evita confiar al cliente un agregado materializado. La publicación requiere un único `create` protegido, no una transacción de review + summary.

Si el volumen o coste de lectura lo exige, podrá añadirse `playerTrustSummaries/{playerId}` como proyección derivada mantenida exclusivamente por una operación confiable. No se introduce ahora y nunca será propiedad editable de `players`.

## Read model para Perfil

`PlayerTrustSummary` contiene conceptualmente:

- `state`: `new` o `rated`;
- `averageRating`, solo cuando `state == rated`;
- `reviewCount`;
- `recentReviews`.

Cada elemento reciente contiene rating, comentario opcional, fecha, `reviewerId`, identidad pública resuelta y contexto de juego. El read model puede componer esos datos para Presentation, pero no los duplica en `PlayerReview`.

No contiene partidas jugadas, attendance, no-shows, highlights simulados ni un score de fiabilidad. Con cero reviews devuelve `state: new`, recuento cero y media ausente.

## Security boundaries consolidados en 008E

### Create

Las Rules exigen:

- usuario autenticado y Player propio existente;
- `reviewerId == request.auth.uid` y Player valorado existente;
- campos exactos y tipos correctos;
- `rating` entero entre 1 y 5;
- comentario ausente o string no vacío de máximo 500 caracteres; Presentation lo trata siempre como texto plano;
- `createdAt == request.time`;
- ReviewId igual al hash determinista de la relación;
- `reviewerId != reviewedPlayerId`;
- Game Session existente, `status == scheduled` y `startsAt < request.time`;
- ambos IDs presentes en `participantIds`;
- documento inexistente, inherente a `create` sobre el ID único.

### Read

Usuarios autenticados pueden leer y listar reviews. Las queries deberán expresar sus filtros, porque Rules no actúa como filtro. La audiencia se revisará antes de una exposición pública anónima.

### Update y delete

Se deniegan siempre a clientes. Una futura herramienta de moderación usará un límite privilegiado y auditable, no una excepción general para autores o Players valorados.

La baseline de 008E exige `startsAt` Timestamp futuro al crear, solo permite reprogramar mientras la sesión actual y la nueva fecha sean futuras y conserva la cancelación autorizada existente incluso tras el inicio. Al alcanzar `startsAt`, no se admiten nuevas solicitudes ni confirmaciones, por lo que `participantIds` queda congelado como evidencia histórica; los rechazos pendientes siguen pudiendo cerrarse. Las nuevas sesiones no admiten `date/time`; en documentos legacy esos campos deben aparecer juntos, tener forma civil válida y no pueden modificarse. Las pruebas formales cubren ALLOW/DENY del documento de review, hash, duplicado, inmutabilidad, elegibilidad y evidencia temporal.

## Identidad pública

`PlayerReview` solo conserva IDs. Para las opiniones recientes, Application obtiene `displayName` y `avatarUrl` actuales desde `players` y compone el read model. KISS prevalece sobre snapshots:

- evita duplicar datos personales;
- los cambios legítimos de perfil se reflejan automáticamente;
- el coste inicial de pocas reviews es asumible;
- se puede incorporar lectura en lote o caché más adelante.

Si un Player deja de existir, la review permanece y Presentation usa una identidad neutral como «Usuario no disponible». La política legal de anonimización o eliminación sigue pendiente, pero el path raíz evita borrado en cascada por estructura.

## Moderación y attendance futuros

Reportes y decisiones de moderación podrán vivir en documentos separados vinculados por `reviewId`. Ocultar una review requerirá una proyección o estado administrado por un actor confiable y deberá excluirla del resumen; no se añade hoy un campo sin flujo aprobado.

Una futura `AttendanceRecord` podrá incorporarse dentro del mismo capability o en una capacidad vecina y aportar evidencia adicional a elegibilidad. `PlayerReview` no necesita modificarse: ya referencia sesión y Players. Attendance queda completamente fuera de las siguientes implementaciones hasta nueva decisión de producto.

## Estructura incremental

```text
src/player-trust/
├── domain/
│   ├── playerReview
│   └── reviewEligibility
├── application/
│   ├── review use cases
│   └── ports
├── infrastructure/
│   └── Firestore adapters
└── presentation/
    ├── post-session review flow
    └── profile trust summary
```

Los nombres son orientativos. Solo se crearán carpetas con contenido real:

- 008C necesita Domain, Application, adapters en memoria y Presentation mínima;
- 008D incorpora Infrastructure Firestore y la migración temporal de Game Sessions;
- 008E incorpora Rules y pruebas;
- no se crea estructura de attendance o moderación.

## Secuencia de implementación

1. **PROMPT-008C — Domain/Application & UI Prototype:** modelo, invariantes, elegibilidad pura, casos de uso, ports, adaptadores en memoria y flujo de publicación/Perfil sin Firebase nuevo.
2. **PROMPT-008D — Firestore Persistence & Canonical Session Time:** introducir `startsAt` canónico y migración local de sesiones; persistir y consultar `playerReviews`; mantener agregados calculados al leer.
3. **PROMPT-008E — Security Rules & Security Tests:** proteger `startsAt`, creación elegible, hash, inmutabilidad y lectura autenticada con pruebas ALLOW/DENY y concurrencia de duplicados.
4. **PROMPT-008F — Integration Review & Phase Closeout:** validar dos usuarios, organizador/participante, participante/participante, estados nuevos, recarga, horario Madrid/DST, duplicados y regresiones.

No se inicia ninguna de estas tareas mediante este documento.

## Riesgos y decisiones abiertas

- El backfill interpreta `date` + `time` explícitamente como `Europe/Madrid`: rechaza horas inexistentes y elige la primera ocurrencia de una hora ambigua. Los documentos con error requieren corrección manual y no se modifican.
- `participantIds` demuestra confirmación, no asistencia; es una limitación de producto aceptada.
- Las cuentas coordinadas pueden fabricar partidas y reviews; no se añade antifraude avanzado en este MVP.
- El cálculo al leer crecerá linealmente con reviews; debe medirse antes de materializar resúmenes.
- Longitud por caracteres debe validarse con la misma semántica en Domain, UI y Rules.
- Reportes, ocultación, derecho de réplica, retención y eliminación de cuenta requieren decisiones legales y operativas posteriores.
- Los tipos simulados de confianza que todavía viven en `players` son legado del prototipo y no deben convertirse en una segunda fuente de verdad al implementar 008C.

## Recomendación

**GO técnico para 008F**: `startsAt` es la única autoridad temporal en nuevas escrituras, las reviews persisten y las Rules validan identidad, existencia de Players, participación, sesión pasada no cancelada, forma, rating, comentario, tiempo de servidor, hash determinista, duplicado e inmutabilidad. La integración completa y cierre de fase corresponden a 008F.
