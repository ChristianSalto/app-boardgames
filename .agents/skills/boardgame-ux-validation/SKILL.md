---
name: boardgame-ux-validation
description: Auditar y validar cambios visibles de Mesa Abierta y apps de juegos de mesa con evidencia de interacción, accesibilidad, responsive y regresión antes de cerrar un lote UX.
---

# Validación UX observable

Lee las reglas de validación del repositorio y los criterios del lote.
Consulta `docs/ux/GUIA.md`, secciones 8, 11 y 12. Las rutas se resuelven desde
la raíz. En Mesa Abierta comprueba los comandos del package.json vigente y
`docs/ux/ADAPTACION_MESA_ABIERTA.md`; no copiar comandos de Cruxmatch.

## Selección de pruebas

Comprueba primero el recorrido y los estados cambiados. Un ajuste de copy no
exige repetir todo el backend; un cambio de auth, routing, estado compartido o
participación sí requiere sus pruebas de contrato y regresión. Ejecuta las
exigencias locales además de la inspección visual. No inventes resultados.

Compara antes/después con igual dataset, ruta, rol, viewport, tema y fuente.
Prueba texto largo/ampliado, teclado y foco, scroll, overlays, errores y
estados de envío relevantes. En web revisa móvil y escritorio; en nativo solo
si el producto tiene esas plataformas. Un cambio de token compartido amplía
la muestra a consumidores de distinta densidad. No exigir variantes inexistentes.

Verifica que la persona puede reconocer dónde está, decidir con la información
visible y completar la acción; que su resultado coincide con servidor/contrato
y que el regreso conserva contexto. Distingue lo observado por un revisor de
lo validado con usuarios reales.

La geometría, el árbol accesible y la compilación no certifican los glifos
pintados. Las capturas no certifican orden de foco, lector ni semántica. Ejecuta
y registra cada tipo de comprobación por separado. No afirmar WCAG AA global
con una muestra de pantallas o un escáner automatizado.

## Revisión y cierre

En un flujo o patrón compartido, delega una revisión independiente al agente
`boardgame_ux_reviewer` como apoyo de QAReviewerAgent. Dale criterios y evidencia;
no la conclusión esperada. Clasifica hallazgos por impacto y exige pasos de
reproducción. Si no hay subagentes, informa la falta de independencia; no simules
QA ni cierres aceptación independiente cuando el proyecto la exige.

Registra `passed`, `failed`, `not_run`, `not_applicable` o `blocked_environment`
por comprobación, con razón y evidencia. Una plataforma o estado requerido sin
evidencia permanece pendiente. El código puede estar preparado para revisar
sin que todo el lote esté aceptado. Usa el artefacto vigente o
`docs/ux/templates/LOTE.md`, y actualiza la tarea y deuda reales del repositorio.
