# Procedencia y fundamentos

Consulta realizada el 25 de septiembre de 2026. Las propuestas del kit son
decisiones de diseño que deben contrastarse con el producto; las referencias
externas no validan automáticamente la implementación.

## Cruxmatch

Se revisó el estado local del repositorio, que incluía cambios sin commit. Las
rutas siguientes son referencias de procedencia de Cruxmatch, no dependencias
necesarias para instalar este kit en Mesa Abierta:

- `RULES.md`: estados distinguibles, accesibilidad, conservación de identidad y gate visual.
- `.agents/skills/cruxmatch-ui-parity/SKILL.md`: flujo de paridad, evidencia y límites de cierre.
- `docs/ui/UI_PARITY_WORKFLOW.md`: lotes, fixtures, capturas y estados de validación.
- `docs/ui/UI_PARITY_MATRIX.md`: alcance verificado y deuda residual, incluidos problemas de recorte tipográfico.
- `src/shared/styles/itcss/1-settings/tokens.css` y `apps/mobile/src/ui/primitives/tokens.ts`: roles visuales, escalas y plataformas. No se certificó equivalencia numérica completa.
- `apps/mobile/src/navigation/BottomTabBar.tsx`: priorización de navegación y acciones.
- `docs/implementations/ui/2026-09-18-mobile-outing-detail-join/IMPLEMENTATION.md`: CTA contextual y distinción entre solicitud y unión.
- Capturas históricas inspeccionadas: `docs/implementations/ui/2026-09-17-mobile-feed-normalization/after/ios/feed.png` y `docs/implementations/ui/2026-09-18-mobile-outing-detail-join/after/android/detail.png`.

La inspección de capturas históricas y código es suficiente para documentar
prácticas y límites; no representa una nueva auditoría en ejecución de toda
Cruxmatch. No se copian datos, imágenes de producto ni recursos de marca al kit.

## Mesa Abierta

La adaptación y los enlaces fijados al commit examinado se encuentran en
[ADAPTACION_MESA_ABIERTA.md](ADAPTACION_MESA_ABIERTA.md). Se revisaron instrucciones,
flujo de trabajo, tarea vigente, requisitos relevantes, estrategia UX, rutas,
shell, exploración, tarjetas, tokens, manifiesto y configuración de runtime.
No se certifica su estado visual ni el resultado actual de sus tests.

## Referencias primarias

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): objetivo y criterios de accesibilidad web. Para targets y foco, consultar los criterios concretos y sus excepciones.
- [Tamaño mínimo de targets](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum): interpretación de 2.5.8.
- [Foco no oculto](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum): interpretación de 2.4.11.
- [Heurísticas de Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/): orientación, estado del sistema, reconocimiento y reducción de información irrelevante.
- [Botones de GOV.UK Design System](https://design-system.service.gov.uk/components/button/): orientación para priorizar la llamada principal a la acción.
- [Skills de Codex](https://learn.chatgpt.com/docs/build-skills): estructura y descubrimiento de skills locales.
- [Instrucciones AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md): integración de instrucciones del repositorio.
- [Subagentes de Codex](https://learn.chatgpt.com/docs/agent-configuration/subagents): agentes TOML de proyecto y herencia de configuración.

## Qué es una recomendación del kit

La propuesta de lotes, las fichas, el reparto de especialidades, los ejemplos de
copy y la prioridad inicial de Explorar son una adaptación razonada. No son
requisitos universales de WCAG ni resultados de investigación con usuarios.
Los tamaños táctiles orientativos, el número de destinos y el uso de tarjetas
se eligen según plataforma y tarea, no como leyes rígidas de diseño.
