# Operación del sistema UX

## Entrada por tipo de trabajo

| Petición | Skill principal | Participación adicional |
| --- | --- | --- |
| Ordenar menús o refactorizar un recorrido | boardgame-ux-architecture | Architect apoya UX; reviewer revisa el resultado |
| Crear o compactar una pantalla existente | boardgame-ux-screens | Writing si cambia copy; validation al cerrar |
| Revisar textos y redundancia | boardgame-ux-writing | Writer si abarca varios estados o pantallas |
| Auditar una entrega o regresión visual | boardgame-ux-validation | Reviewer independiente según alcance |
| Cambio de backend sin UX | Skill técnica del repositorio | No convocar agentes UX por rutina |

## Una única coordinación

En Mesa Abierta se mantienen los roles de su `AGENTS.md`. El agente principal organiza la sesión de trabajo siguiendo esos roles; ProductManagerAgent decide alcance, FrontendAgent implementa y QAReviewerAgent revisa. Los tres agentes del kit son apoyos especializados, no sustitutos de esa distribución. Fuera de este repositorio, adaptar el bloque de instrucciones a los roles reales antes de incorporarlo.

Los agentes heredan el modelo y las restricciones de su sesión. Sus TOML no fuerzan proveedor, modelo ni esfuerzo. Recomendar un modelo disponible al comenzar una tarea según riesgo; copy localizado suele requerir menos capacidad que reordenar auth, navegación y persistencia. Si cambiarlo no es posible, decirlo; recomendar no cambia el runtime.

## Contrato de delegación

Enviar objetivo, tarea activa, ruta/flujo, rol, datos y estados, límites, evidencia y salida esperada. Dar solo el contexto necesario. Pedir hallazgos con evidencia, impacto, propuesta y criterio verificable. Los revisores no editan producto ni documentos: devuelven el análisis para que el responsable lo integre. Cuando haga falta capturar nueva evidencia, el implementador o QA con herramientas autorizadas la obtiene; no simular inspección a partir de una descripción.

En ausencia de subagentes, usar las instrucciones TOML como roles secuenciales. El resultado debe indicar que no existe independencia de revisión. Si las reglas del proyecto la exigen para aceptar, dejar esa aceptación pendiente hasta que una revisión independiente real ocurra. La falta de independencia no impide preparar un cambio revisable.

## Persistencia de decisiones

La guía contiene criterios reutilizables. UX_STRATEGY, SCREEN_INVENTORY y VISUAL_DIRECTION contienen decisiones de Mesa Abierta. TASK y PROMPTS_LOG conservan estado y trazabilidad. Las fichas de pantalla o lote capturan únicamente lo que esos documentos no cubren. Mantener una fuente de verdad por decisión y enlazarla; no duplicar el plan entero en cada skill.

Excepciones: anotar criterio, motivo, evidencia y condición para revisarla. Ejemplo legítimo: dos acciones de elección equivalentes sin una preferida. Ejemplo insuficiente: aumentar densidad ocultando el estado de plaza porque no cabe.

## Comprobar la integración

1. Verificar los cuatro SKILL.md y los tres TOML en las rutas instaladas.
2. Abrir una sesión en la raíz y confirmar que la configuración y AGENTS efectivos no quedan desplazados por instrucciones más específicas.
3. Invocar explícitamente `$boardgame-ux-architecture` con una auditoría breve de navegación. Verificar que lee el contexto del destino y respeta los roles.
4. Encargar una revisión acotada al agente reviewer, si está disponible; confirmar su respuesta y no inferir ejecución de la existencia de un archivo.
5. Registrar la prueba de carga. Si la versión del entorno no admite agentes TOML de proyecto, mantener las skills y roles secuenciales hasta adaptar la configuración oficial vigente.

Referencias del mecanismo: [skills](https://learn.chatgpt.com/docs/build-skills), [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) y [subagentes](https://learn.chatgpt.com/docs/agent-configuration/subagents). Formato consultado el 25 de septiembre de 2026; verificarlo si cambia el entorno.
