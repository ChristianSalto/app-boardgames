# Estado actual

**Fase actual:**  
Bloque BETA-R02 — Identidad y catálogo de juegos

**Tarea activa:**  
BETA-R02C — GameCombobox accesible y búsqueda local determinista.

**Estado:**  
BETA-R02C implementado localmente: `GameCombobox` reutilizable y controlado por `GameSelection`, búsqueda Application local normalizada y limitada sobre el port existente, alias opcional compatible con documentos antiguos y fallback explícito solo ante búsqueda vacía satisfactoria. Fixture aislada permite probar resultados, error, reintento y teclado sin tocar las pantallas reales. Pasan typecheck, build cloud, pruebas de búsqueda/semántica, `test:game-sessions` (12 unitarias y 5 de integración con emulador) y `test:rules` (52 pruebas). La fixture se comprobó a 375 y 400 px sin overflow horizontal y con opciones de 44 px; el formulario requerido bloquea texto sin selección. La revisión QA/UX independiente encontró cuatro casos y confirmó su corrección en código. Pendientes validación humana, lector de pantalla, IME y dispositivo táctil real; no se modificaron Rules en R02C, ni hubo acceso cloud o deploy.

**Último cierre de fase:**  
PROMPT-008F — Player Trust integrado y validado de extremo a extremo: reviews persistentes, resumen global, opiniones recientes y paginadas, fiabilidad diferenciada, autoridad temporal `startsAt`, lifecycle y Security Rules verificados sin bloqueos.

**Restricción:**  
BETA-R02C no integra todavía el componente en Crear/Editar/Explorar/Marketplace ni sustituye el selector actual. La integración real, la estrategia de carga del catálogo y la integridad entre ID y nombre quedan para R02D.
