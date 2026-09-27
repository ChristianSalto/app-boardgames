# Estado actual

**Fase actual:**  
Fase 7 — Trust & Reputation MVP

**Tarea activa:**  
BETA-R01C-1 — Fix Auth Background Overflow on Real Mobile.

**Estado:**  
El fondo de Auth y sus contenedores padres necesarios usan la misma altura dinámica de viewport con fallback, evitando que `#root` prolongue el documento más allá de la superficie que pinta `auth-background`. AppShell conserva su regla previa. Typecheck, build cloud y diff-check pasan; la compilación confirma `100dvh` sin `100svh`. Validación final en móvil real pendiente.

**Último cierre de fase:**  
PROMPT-008F — Player Trust integrado y validado de extremo a extremo: reviews persistentes, resumen global, opiniones recientes y paginadas, fiabilidad diferenciada, autoridad temporal `startsAt`, lifecycle y Security Rules verificados sin bloqueos.

**Restricción:**  
BETA-R01C-1 corrige únicamente la altura responsive del fondo de Auth. Mantiene imagen, tarjeta, estructura, navegación y lógica; no hace deploy ni inicia tareas posteriores.
