# ADR-006 — Player Trust y publicación íntegra de reviews

- **Estado:** aceptada
- **Fecha:** 2026-09-23

## Contexto

PROMPT-008A aprobó reviews simples entre Players confirmados de una misma partida pasada y no cancelada. La arquitectura debía garantizar elegibilidad, unicidad, inmutabilidad y agregados no manipulables sin mezclar `player-trust` con `players`, `authentication`, `game-sessions` o `game-listings`.

El esquema real de Game Sessions conserva los confirmados en `participantIds`, pero representa el horario mediante `date` y `time` civiles. Esas cadenas preservan correctamente la intención local de Madrid en la UI, aunque no constituyen evidencia temporal comparable de forma segura por Firestore Rules.

## Decisión

- Sustituir exclusivamente la decisión provisional de ADR-004 que mantenía reputación dentro de `players`; el resto del baseline continúa vigente.
- Extraer `player-trust` como capability propio y mantener `PlayerReview` independiente de `Player` y `GameSession`.
- Persistir reviews conceptualmente en una colección raíz `playerReviews`.
- Usar un ReviewId determinista, derivado mediante SHA-256 de la tupla canónica `sessionId + reviewerId + reviewedPlayerId`, para garantizar una sola review direccional sin query previa.
- Considerar `gameSessions.participantIds` la evidencia autoritativa de participantes confirmados; `participationRequests` conserva el historial, pero no se consulta para elegibilidad.
- Incorporar en Game Sessions un `startsAt` Timestamp canónico, interpretado desde la hora civil en `Europe/Madrid`, como única autoridad temporal. La fecha/hora visible se deriva de ese instante.
- Proteger con Security Rules la creación de reviews contra autenticación, identidad, forma, sesión, participantes, tiempo, ID e inmutabilidad. Update y delete quedan denegados al cliente.
- Calcular `averageRating` y `reviewCount` desde las reviews al leer. No materializar agregados en Player durante el MVP.
- Mantener la implementación client-only para este incremento. Cloud Functions solo será necesaria si no puede garantizarse `startsAt` o si futuros agregados/moderación exigen una operación privilegiada.

## Alternativas consideradas

### Conservar reviews dentro de `players`

Descartada porque `players` no posee su elegibilidad ni ciclo de vida, dificulta consultas transversales y confunde el perfil con la fuente de verdad de reputación.

### Usar UUID aleatorio y comprobar duplicados con query

Descartada porque dos clientes concurrentes podrían crear duplicados. Una query previa no constituye una restricción de unicidad.

### Comparar directamente `date` y `time` en Rules

Descartada porque las cadenas civiles no ofrecen una conversión confiable a `Europe/Madrid`, especialmente durante DST, y no son directamente comparables con `request.time` como instante.

### Materializar resumen en Player

Descartada para el MVP por introducir una segunda fuente de verdad, escritura multi-documento y riesgo de manipulación. Se reconsiderará con evidencia de volumen.

### Publicar siempre mediante Cloud Function

No seleccionada inicialmente. Un Timestamp canónico, ID determinista y Rules pueden proteger la operación simple sin backend adicional. Se conserva como fallback si la evidencia temporal o futuras operaciones dejan de ser verificables por Rules.

## Consecuencias

### Positivas

- El dominio mantiene límites claros y puede probar elegibilidad sin Firebase.
- Un path determinista convierte la unicidad en una propiedad estructural.
- Las reviews son inmutables y la media no puede alterarse mediante una escritura independiente.
- El modelo temporal deja de depender del timezone del navegador y permite comparar con tiempo de servidor.
- La solución conserva el enfoque client-only y KISS del baseline.

### Costes y riesgos

- Game Sessions necesita migración o recreación de datos locales para añadir `startsAt`.
- La conversión inicial desde hora civil debe manejar explícitamente DST de Madrid.
- Calcular agregados al leer aumenta linealmente el coste cuando crece el historial.
- Confirmation no prueba asistencia y las cuentas coordinadas siguen siendo un riesgo no resuelto.
- Rules deberá duplicar invariantes críticas de Domain en el límite de confianza.

## Restricciones

- No almacenar snapshots de Player o Game Session dentro de la review.
- No aceptar `reviewerId`, `createdAt` o agregados como autoridad confiada desde Presentation.
- No autorizar update/delete de reviews desde cliente.
- No introducir attendance, no-shows, moderación completa o reputación comercial.
- No habilitar reviews persistidas antes de que `startsAt` sea canónico y esté protegido.

## Decisiones abiertas

- política de migración para horarios DST ambiguos o inexistentes;
- índices concretos derivados de consultas implementadas;
- umbral para materializar un resumen separado;
- reporting, ocultación, auditoría y eliminación de cuentas;
- necesidad futura de una operación server-side para moderación o agregación.
