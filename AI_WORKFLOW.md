# Flujo de trabajo con IA

## Objetivo

Permitir avances pequeños, trazables y revisables sin convertir el proyecto en un proceso burocrático. Cada documento debe resolver una necesidad concreta y cada fase debe producir evidencia suficiente para decidir el siguiente paso.

## Flujo de una tarea

1. **Definir.** `ProductManagerAgent` selecciona una tarea de la fase activa y escribe objetivo, alcance y criterios de aceptación en `TASK.md`.
2. **Comprobar alcance.** Se contrasta la tarea con `docs/PRD.md`, `docs/MVP.md` y `RULES.md`. Cualquier ampliación vuelve a Producto antes de continuar.
3. **Analizar.** El agente especialista identifica entradas, riesgos, dependencias y preguntas. Si falta una decisión material, la eleva; si no, trabaja con las hipótesis registradas.
4. **Decidir lo necesario.** Las decisiones duraderas o con alternativas relevantes se registran en el documento adecuado o, desde la fase arquitectónica, en un ADR. No se documentan decisiones triviales.
5. **Ejecutar.** El responsable realiza el cambio mínimo de la tarea. La implementación solo ocurre en las fases que la permiten.
6. **Validar.** Se ejecutan pruebas y comprobaciones proporcionales al riesgo y se conserva evidencia resumida.
7. **Revisar.** `QAReviewerAgent` contrasta entrega, reglas, arquitectura y criterios; comunica hallazgos concretos y priorizados.
8. **Corregir.** El agente responsable resuelve los hallazgos o documenta por qué requieren una decisión distinta.
9. **Aceptar.** `ProductManagerAgent` confirma los criterios de aceptación. La revisión humana interviene en hitos, cambios de alcance y decisiones relevantes.
10. **Registrar y avanzar.** Se actualizan `TASK.md` y `PROMPTS_LOG.md`. Solo Producto autoriza la siguiente tarea o fase.

## Artefactos mínimos

- `docs/PRD.md`: requisitos y objetivos del producto.
- `docs/MVP.md`: frontera de alcance del MVP 1.
- `TASK.md`: una sola tarea y fase activas, con su estado real.
- `PROMPTS_LOG.md`: índice breve de intervenciones relevantes.
- ADRs: únicamente para decisiones arquitectónicas relevantes, a partir de la fase correspondiente.
- Evidencia de validación: junto a la tarea o cambio, en el formato más ligero que permita reproducirla.

No se crean actas, informes o plantillas adicionales si la información ya tiene un lugar claro.

## Estados y puertas de fase

Una tarea puede estar `Pendiente`, `En curso`, `En revisión`, `Bloqueada` o `Completada`. Un estado no sustituye a la evidencia.

Para cerrar una fase deben cumplirse sus resultados esperados, no quedar hallazgos bloqueantes, estar visibles las preguntas que pasan a la fase siguiente y existir aprobación de `ProductManagerAgent`. El cierre de una fase no autoriza automáticamente trabajo fuera del roadmap.

## Manejo de cambios e incertidumbre

- **Hecho:** información proporcionada o evidencia comprobada.
- **Hipótesis:** supuesto temporal que debe validarse.
- **Recomendación:** opción preferida con su razón, todavía no aprobada.
- **Decisión pendiente:** pregunta con impacto suficiente para requerir validación humana o evidencia.

Un cambio de alcance actualiza primero PRD/MVP y después genera tareas. Los especialistas pueden recomendar cambios, pero no incorporarlos de forma implícita.
