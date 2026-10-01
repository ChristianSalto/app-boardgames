# Estado actual

**Fase actual:** Bloque BETA-R02 — Identidad y catálogo de juegos.

**Tarea activa:** BETA-R02D4A — Bootstrap local del catálogo inicial.

**Estado:** herramienta local implementada en `scripts/bootstrap-game-catalog-dev.mjs` y probada con Firestore Emulator. Los ocho registros aprobados viven en `src/games/initialCatalogGames.ts`; `tests/fixtures/catalogGames.ts` los reutiliza y mantiene aparte la novena entrada exclusivamente para búsqueda. IDs inmutables y nombres exactos de D3, sin aliases.

**Validación D4A:** siete pruebas del bootstrap en Emulator demo: vacío 8 CREATE, segunda ejecución 8 UNCHANGED, conflicto y documento extra bloquean apply sin otras escrituras, proyecto y confirmación incorrectos rechazados, ruta DEV rechaza entorno Emulator o falta de credencial antes de conectar. `test:game-sessions` pasó (14 unitarias y 5 integración, incluido catálogo); typecheck y build:cloud pasaron. `git diff --check` pasó al cierre.

**Protección:** DEV exige `--project mesa-abierta-dev`, `GOOGLE_APPLICATION_CREDENTIALS` apuntando a JSON de cuenta de servicio cuyo `project_id` sea DEV, ausencia de Emulator y `--confirm-project mesa-abierta-dev` para apply. Emulator exige bandera separada, proyecto demo y host local exacto. Conflictos y documentos extra bloquean; solo `batch.create` para ausentes, verificación posterior. No se ha ejecutado lectura, escritura, seed ni deploy cloud.

**Pendiente / gate D4B:** revisión humana de script y salida local; preparar credencial de servicio DEV fuera del repositorio; preflight de Rules/Hosting y estado remoto solo cuando se autorice; ejecutar secuencia Rules → dry-run DEV → apply DEV → verificación → Hosting, con smoke manual. D4A no autoriza D4B ni avance de fase. Sin Marketplace, migraciones, imágenes, BGG ni expansiones.
