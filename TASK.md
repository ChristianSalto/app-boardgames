# Estado actual

**Fase actual:**
Bloque BETA-R02 — Identidad y catálogo de juegos

**Tarea activa:**
BETA-R02D3 — Preparar catálogo inicial DEV y plan de despliegue.

**Estado:**
Plan local preparado en `docs/GAME_CATALOG_DEV_PLAN.md`: ocho juegos exactos de `catalogGames`, sin aliases; IDs literales aptos si permanecen inmutables; diseño de bootstrap idempotente con dry-run, guardas de proyecto y creación atómica; orden Rules → catálogo DEV → Hosting; rollback y smoke Belial/Redon/Pau/Ivy. No se añadió ni ejecutó un script con acceso privilegiado, ni se consultó o modificó cloud. El script y la dependencia Admin SDK se implementarán tras revisar el catálogo y el diseño.

**Validación D3:**
Inspección de fixture, adaptador, Rules, composición cloud, `firebase.json`, `.firebaserc`, scripts y CLI local. `git diff --check` al cierre. Sin cambios en aplicación, Marketplace ni Rules respecto al working tree recibido. D3 es un diseño, no un despliegue.

**Pendientes / gate:**
Revisión humana de los ocho registros; autorización explícita antes de cualquier escritura cloud; preflight remoto de Rules/Hosting/credenciales/colección en la tarea futura. Implementar y probar localmente el script Admin con dependencia directa y lockfile antes del dry-run y la secuencia de publicación. Sin avance de fase por este documento.

**Último incremento validado localmente:**
BETA-R02D2 — GameCombobox en Explorar; typecheck, build:cloud, 18 pruebas afectadas, test:game-sessions y navegador local aprobados; QA independiente recomendó aceptación. Deuda UX de lector, IME, táctil y zoom real 200 % registrada en PROMPTS_LOG.md.

**Restricción:**
No seed, deploy, migración, vinculación automática ni escritura cloud. Conservar cambios locales previos R02D1/D2 sin commit.
