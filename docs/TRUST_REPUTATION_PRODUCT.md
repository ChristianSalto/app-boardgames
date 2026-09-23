# Trust & Reputation MVP — definición de producto

## Estado y propósito

- **Fase:** 7 — Trust & Reputation MVP
- **Tarea:** PROMPT-008A — Trust & Reputation Product Definition
- **Estado:** definición de producto completada; arquitectura definida posteriormente en PROMPT-008B

Trust & Reputation debe reducir la incertidumbre razonable antes de quedar físicamente con personas desconocidas. Aporta contexto, no certifica seguridad ni convierte la actividad o la popularidad en una puntuación de confianza.

El producto mantiene dos conceptos separados:

- **Reputación:** opinión subjetiva expresada mediante reviews de personas con las que se compartió una partida.
- **Fiabilidad:** hechos verificables relacionados con participación y asistencia.

Las estrellas pertenecen exclusivamente a reputación. El número de partidas no aumenta por sí mismo la reputación y ningún dato de fiabilidad se mezcla en una puntuación opaca.

## Review mínima

Una review publicada contiene únicamente:

- puntuación entera de 1 a 5 estrellas;
- comentario opcional;
- autor, mediante su identidad pública de Player;
- Player valorado;
- Game Session que acredita la relación;
- fecha de publicación.

La referencia a la partida permite mostrar el juego como contexto sin convertirlo en una categoría de valoración. No se añaden puntuaciones separadas de simpatía, puntualidad, conocimiento o deportividad.

## Elegibilidad

Un Player puede valorar a otro únicamente cuando se cumplen todas estas condiciones:

1. son Players distintos;
2. ambos figuran como participantes confirmados de la misma Game Session; el organizador cuenta como participante confirmado;
3. la fecha y hora previstas de la partida ya han pasado;
4. la partida no está cancelada;
5. no existe ya una review del mismo autor sobre el mismo Player para esa partida.

La relación es direccional. Por tanto, una pareja puede generar una review en cada sentido, pero nunca duplicar el mismo sentido. Pueden valorarse organizador y participantes en ambos sentidos, y también participantes entre sí. El rol no concede privilegios sobre la valoración.

Para el MVP no se introduce `completed`: fecha/hora pasada y estado distinto de `cancelled` bastan para habilitar el flujo. Se reconsiderará un cierre explícito si asistencia, incidencias o una confirmación operativa hacen necesario distinguir «programada en el pasado» de «realmente celebrada».

## Publicación, edición y retirada

Antes de publicar se mostrará una confirmación clara. Una vez publicada, la review es inmutable para su autor y no puede eliminarse desde la experiencia normal. Esta política simplifica agregados, reduce cambios de represalia y evita borrar selectivamente historial.

Una corrección, retirada por causa justificada o contenido abusivo se tratará en el futuro mediante moderación, ocultación y trazabilidad, no reescribiendo silenciosamente la review original. Esta decisión debe revisarse con obligaciones legales antes de producción.

## Visibilidad en Perfil

Los usuarios autenticados podrán consultar en el perfil público:

1. **Reputación:** media con un decimal y número total de reviews, solo cuando exista al menos una.
2. **Opiniones recientes:** puntuación, comentario cuando exista, nombre visible del autor, fecha y juego de la partida de origen.
3. **Fiabilidad:** un bloque separado, sin reutilizar la media de estrellas.

No se muestra email, teléfono, identidad de Firebase, dirección o lugar privado de la partida. La referencia contextual no necesita exponer la sesión completa ni su ubicación.

Un Player sin reviews se presenta de forma neutral como **«Nuevo en Mesa Abierta»**, acompañado cuando aporte claridad por **«Sin valoraciones todavía»**. No se representa con cero estrellas ni se calcula una media ficticia.

## Attendance y fiabilidad

### Decisión MVP

No se implementará todavía `noShow` ni un registro público de asistencia. Ninguna de las alternativas consideradas ofrece por sí sola una base suficientemente justa y sencilla:

- solo el organizador puede producir falsos no-shows o represalias;
- exigir confirmación de participantes introduce desacuerdos, expiraciones y una experiencia adicional;
- la autodeclaración no verifica el comportamiento;
- un dato disputable presentado como hecho dañaría más la confianza de la que aporta.

Por tanto, nadie registra attendance en este incremento. PROMPT-008B no debe diseñar persistencia de asistencia. Una futura iteración podrá estudiar que el organizador proponga `attended`, `noShow` o `notRecorded` y que cualquier resultado negativo necesite confirmación o un mecanismo de revisión antes de hacerse público.

Hasta disponer de datos verificados, el perfil mostrará **«Sin datos de asistencia verificados»**. El número de partidas confirmadas pasadas puede aparecer por separado como actividad, nunca como prueba de fiabilidad. Si se aprueba attendance posteriormente, la representación inicial recomendada son cifras brutas —asistencias verificadas, ausencias confirmadas y partidas sin registrar—, no un porcentaje o score.

En el MVP actual, la elegibilidad de review se basa en confirmación y fecha porque no existe attendance. Si esta capacidad se incorpora, una persona con `noShow` confirmado quedará excluida en ambos sentidos del flujo de reviews de esa sesión: no podrá valorar la experiencia presencial ni recibir una review de esa experiencia. La regla deberá aplicarse antes de abrir la valoración y resolver qué ocurre con estados discutidos.

## Experiencia post-partida

```text
Partida pasada y no cancelada
→ Mis partidas
→ Valorar participantes
→ lista de otros Players confirmados y estado «Pendiente de valorar / Valorado»
→ elegir una persona
→ 1–5 estrellas + comentario opcional
→ revisar y publicar
→ confirmación + perfil actualizado
```

El flujo no obliga a valorar a todas las personas, no muestra comparaciones y no recompensa publicar reviews. Las valoraciones pendientes pueden ofrecerse de forma contextual sin notificaciones push ni bandeja social.

## Jerarquía en Perfil

1. identidad pública y descripción del Player;
2. resumen de **Reputación** o estado «Nuevo en Mesa Abierta»;
3. **Fiabilidad**, explícitamente separada y inicialmente sin datos verificados;
4. **Opiniones recientes** con contexto mínimo;
5. actividad de partidas, si ayuda a comprender el perfil y se etiqueta como actividad.

El detalle de una partida puede conservar un resumen compacto y enlazar al Perfil. No debe copiar el listado completo de opiniones.

## Identidad, privacidad y moderación

Las reviews no son anónimas. Mostrar el nombre público del autor aporta responsabilidad y contexto; el identificador estable sigue siendo `PlayerId`. No se exponen datos de Authentication. Si una cuenta deja de estar activa, la política futura deberá preservar la integridad del historial con una identidad pública neutral cuando sea legalmente apropiado, sin usar la eliminación de cuenta como mecanismo para limpiar reputación.

El diseño futuro debe permitir reportar una review, ocultarla sin borrado físico, registrar la decisión de moderación y gestionar sanciones o disputas. PROMPT-008A no define UI, estados técnicos, plazos, derecho de réplica ni moderación automática.

## Protecciones mínimas contra abuso

- autenticación y Player válido para escribir;
- elegibilidad comprobada con la relación real de la Game Session;
- prohibición de auto-review;
- unicidad por `reviewer → reviewedPlayer → session`;
- prohibición de valorar partidas futuras o canceladas;
- puntuación limitada a enteros entre 1 y 5 y comentario con límites razonables que se concretarán en UX/arquitectura;
- review inmutable desde el cliente una vez publicada;
- agregados no editables por el Player ni aceptados desde el cliente;
- capacidad futura de reporte, ocultación y auditoría;
- eliminación de cuenta separada de la eliminación oportunista de reputación, pendiente de política legal.

## Integridad de agregados

Las reviews son la fuente de verdad. `averageRating` y `reviewCount` constituyen un resumen derivado propiedad de Trust & Reputation, no campos editables del perfil. Deben corresponder exactamente al conjunto de reviews visibles y elegibles, actualizarse de forma confiable y no aceptar valores calculados o escritos arbitrariamente por el cliente.

PROMPT-008B decide posteriormente calcular el resumen al leer durante el MVP y proteger la fuente mediante elegibilidad y escritura restringida. Los detalles están en `PLAYER_TRUST_ARCHITECTURE.md`; esta definición de producto no prescribe Firestore.

## Boundary conceptual

Se aprueba **`player-trust`** como capability propia. Ha dejado de ser información pasiva de `players`: ahora posee elegibilidad, publicación, inmutabilidad, agregados y un ciclo de moderación futuro. El nombre evita confundir reputación subjetiva con toda la confianza y delimita el contexto a personas y partidas, no a transacciones comerciales.

`player-trust` referencia `PlayerId` y necesita evidencia mínima de `game-sessions`, pero no posee perfiles ni sesiones. `players` consume un resumen de lectura para Perfil y `game-sessions` ofrece el contexto que acredita elegibilidad. No se definen todavía carpetas, ports, Firestore o Security Rules.

## Fuera del alcance

- attendance y no-shows públicos en esta primera entrega;
- categorías múltiples, endorsements, badges, niveles, XP, rankings y gamificación;
- respuestas públicas, edición o borrado libre de reviews;
- sistema completo de disputas, apelaciones, sanciones o moderación automática;
- recomendaciones o decisiones automatizadas basadas en reputación;
- score único de confianza o porcentaje de fiabilidad;
- reviews anónimas;
- reputación de compraventa, intercambio, Game Listings, tiendas o comercios;
- chat, notificaciones push y nuevos flujos sociales;
- algoritmos antifraude avanzados.

## Riesgos y decisiones abiertas

- Una participación confirmada no demuestra asistencia real; es una limitación explícita hasta aprobar attendance.
- Deben concretarse longitud y política de contenido del comentario antes de implementación pública.
- Reporte, tiempos de respuesta, criterios de ocultación, derecho de réplica y recursos de moderación siguen abiertos.
- Debe revisarse con asesoramiento legal la retención o anonimización al eliminar cuentas y el ejercicio de derechos sobre contenido.
- La media puede producir sesgos con muestras pequeñas; siempre se mostrará junto al recuento y nunca para perfiles sin reviews.
- El criterio temporal basado en fecha/hora puede requerir `completed` o un cierre operativo si el uso real revela partidas no celebradas o reprogramadas.
- La arquitectura de PROMPT-008B debe verificarse durante implementación y pruebas, especialmente en tiempo canónico, duplicados y manipulación de cliente.

## Recomendación de avance

La definición de producto dio **GO para PROMPT-008B**. Tras completarse esa arquitectura, el avance a implementación permanece limitado al alcance allí descrito. Attendance/no-show, moderación completa y reputación comercial siguen fuera.
