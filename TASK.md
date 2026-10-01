# Estado actual

**Fase actual:** Bloque BETA-R02 — Identidad y catálogo de juegos.

**Tarea activa:** BETA-R02D4B-1 — Preflight cloud DEV y despliegue controlado de Firestore Rules.

**Estado:** completado el 2026-10-01. Working tree limpio antes del despliegue; R02 versionado en 4f3dfeab5aab63049d94b59c1ae459fe91c8f72e. CLI autenticado, proyecto mesa-abierta-dev confirmado y seleccionado explícitamente sin cambiar el alias por defecto.

**Preflight remoto:** Rules previas equivalentes al commit 6040735ebce49099d263700b91d15ac5c40fbbd8; delta limitado al catálogo games y gameId opcional/coherente en partidas. Marketplace sin cambios. Respaldo local ignorado en .qa-r02d4b.local/before-firestore.rules y metadatos before-release.json.

**Validación:** npm run test:rules pasó (54 pruebas, 10 suites) en Emulator demo; procesos cerrados automáticamente, puertos 8180/9150/9299 libres. git diff --check pasó antes del despliegue. No se modificó la fuente de Rules.

**Deploy ejecutado:** .\node_modules\.bin\firebase.cmd deploy --only firestore:rules --project mesa-abierta-dev; exit 0, Deploy complete. Release activa projects/mesa-abierta-dev/rulesets/2c7126e4-932f-42e7-8598-e5459c628377, actualizada 2026-10-01T17:32:39.219210Z. Verificación remota posterior: fuente idéntica tras normalizar BOM/saltos de línea, SHA-256 d23885f4b4b1a9d053ac12258a3c599196f8f55435d6069998ee7def5b6d6a2a.

**Restricciones cumplidas:** ningún documento Firestore cloud leído o escrito; ningún bootstrap, seed, migración, Hosting, índices, Functions o Storage desplegado. Sin creación de cuentas de servicio, descarga de claves ni modificación de GOOGLE_APPLICATION_CREDENTIALS. El CLI leyó el archivo local de índices durante la preparación, pero no los desplegó.

**Pendiente:** BETA-R02D4B-2 no iniciado. El catálogo aún no se ha cargado por esta tarea; cualquier siguiente operación requiere su alcance autorizado. Detención tras D4B-1, sin avance automático de fase.
