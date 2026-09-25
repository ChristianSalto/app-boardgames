# Prompt para iniciar el refactor UX

Copiar el siguiente bloque en una tarea abierta desde la raíz de app-boardgames después de integrar el kit.

```text
Quiero iniciar un refactor UX de Mesa Abierta dentro de su alcance funcional
actual. Usa $boardgame-ux-architecture y las demás skills UX que correspondan.
Lee AGENTS.md, RULES.md, AI_WORKFLOW.md, TASK.md, PRD, MVP y las decisiones UX
existentes. Contrasta docs/ux/ADAPTACION_MESA_ABIERTA.md con el HEAD actual.

Mantén los roles existentes: ProductManagerAgent coordina la tarea,
UXDesignerAgent define la propuesta, FrontendAgent implementa y QAReviewerAgent
revisa de forma independiente. Utiliza los agentes del kit como apoyo acotado.
No dupliques documentos que ya tengan una fuente de verdad en este proyecto.

Comprueba Git y conserva cambios ajenos. Identifica stack, Node, gestor,
comandos y entorno Firebase reales antes de ejecutarlos. Recomienda un modelo
y razonamiento proporcionales a esta tarea; no afirmes haberlos cambiado si no
puedes hacerlo. No uses producción para capturas o datos de prueba.

Primero actualiza el inventario de rutas, estados, componentes y textos.
Reproduce con emuladores login, Explorar, detalle y vuelta al listado; registra
baseline visual, filtros, scroll, foco, teclado y responsive. Examina la pérdida
de destino tras login como un hallazgo a reproducir, sin darla por corregida.

Formula el primer lote UX-R01, con criterios concretos: orientación, jerarquía,
compacidad legible, copy sin redundancia y conservación del contexto. Mantén
las rutas y el dominio; solicitar plaza requiere aceptación. Conserva Madrid,
los filtros existentes, la identidad de club moderno, anuncios secundarios y
reputación. No añadas chat, mapa, lista de espera ni nuevas funciones.

Esta petición autoriza preparar e implementar el primer lote local reversible
del refactor dentro del proceso del proyecto. Registra la tarea con Producto y
continúa con el trabajo autorizado sin pedir aprobaciones rutinarias. Si una
decisión cambia alcance o contradice una instrucción vigente, concreta el
conflicto y pide solo esa decisión mientras avanzas en lo independiente.

Implementa el lote, compara antes/después con los mismos estados y datos,
ejecuta checks pertinentes y solicita revisión independiente de QA apoyada por
boardgame_ux_reviewer. Actualiza TASK.md, PROMPTS_LOG.md y documentos afectados.
No aceptes el lote sin evidencia requerida. Si faltan herramientas o acceso,
entrega el diagnóstico y cambio verificable, distinguiendo lo pendiente.
No hagas push, deploy ni cambios en servicios externos.
```

Para una tarea cotidiana basta con: «Compacta la pantalla X conservando sus acciones y estados; usa las skills UX del repositorio y verifica el resultado». Las instrucciones del repositorio enrutan la especialidad adecuada. Si solo quieres diagnóstico, sustituye la autorización de implementación por «Audita y propón; no modifiques el producto».
