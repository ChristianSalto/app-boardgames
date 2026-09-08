# Plan de implementación por fases

## Principios del roadmap

- Cada fase reduce una incertidumbre concreta y produce artefactos revisables.
- El detalle se incorpora cuando es necesario; este plan no anticipa diseño técnico de fases futuras.
- `ProductManagerAgent` autoriza el avance después de criterios de salida, revisión aplicable y validación humana en hitos.
- Las fases posteriores pueden cambiar según evidencia. No son compromisos de alcance.

## Fase 0 — Foundation

**Objetivo:** establecer visión, problema, alcance MVP, reglas y gobernanza de agentes.

**Resultados:** visión de producto, PRD inicial, frontera del MVP, roadmap, roles, reglas, workflow y trazabilidad inicial.

**Criterios de salida:** documentos coherentes y revisados; problema y no objetivos explícitos; preguntas abiertas visibles; ausencia de código, dependencias y configuración Firebase.

**Estado:** completada. Foundation aprobada tras revisión humana.

## Fase 1 — UX y User Flows

**Objetivo:** comprender y diseñar los recorridos críticos antes de implementar.

**Resultados previstos:** investigación inicial proporcionada, arquitectura de información, flujos de crear/buscar/ver/solicitar participación/consultar partidas propias, estados clave y wireframes *mobile first* accesibles.

**Criterio de salida orientativo:** los flujos cubren el MVP, resuelven o elevan sus decisiones de producto y pueden prototiparse sin añadir alcance.

**Estado:** completada. UX y Core User Flows aprobados tras revisión humana.

## Fase 2 — Prototipo SPA con datos simulados

**Objetivo:** materializar los flujos aprobados sin depender todavía de Firebase.

**Resultados previstos:** prototipo navegable con identidad, juegos y datos simulados que permita evaluar comprensión, contenido y secuencia de los casos de uso prioritarios. Madrid será el contexto fijo del prototipo, sin selector de ciudad, pero sin limitar una futura ampliación multi-ciudad. No requiere integrar un catálogo externo.

**Límite:** el prototipo no decide la arquitectura productiva ni integra servicios reales.

**Estado:** en revisión. No completada todavía.

## Fase 3 — Validación UX/UI

**Objetivo:** probar el prototipo con usuarios objetivo y convertir observaciones en decisiones.

**Resultados previstos:** plan y evidencia de validación, problemas priorizados, iteraciones necesarias y recomendación de continuidad o ajuste.

**Criterio de salida orientativo:** flujos críticos comprensibles, riesgos de accesibilidad revisados y preguntas de producto necesarias para arquitectura respondidas o aceptadas explícitamente.

## Fase 4 — Arquitectura técnica detallada

**Objetivo:** definir límites de dominio y estructura técnica a partir de flujos validados.

**Resultados previstos:** dominios, casos de uso, contratos, dirección de dependencias, estrategia de pruebas, estructura de proyecto y ADRs necesarios.

**Límite:** aplicar Clean/Screaming Architecture y programación funcional con la mínima complejidad; no diseñar funcionalidades posteriores.

## Fase 5 — Firebase y emuladores

**Objetivo:** preparar la infraestructura mínima segura para los casos de uso aprobados.

**Resultados previstos:** configuración Firebase, Emulator Suite, autenticación elegida, persistencia, adaptadores, índices y reglas de seguridad probadas.

**Límite:** el esquema de datos y las reglas se diseñan en esta fase conforme a contratos reales, no en Foundation.

## Fase 6 — Primer vertical slice

**Objetivo:** entregar un recorrido extremo a extremo pequeño que pruebe arquitectura e infraestructura.

**Orientación:** seleccionar después de las fases anteriores el corte de mayor aprendizaje, previsiblemente identidad/perfil mínimo y publicación o consulta de una partida.

**Resultados previstos:** incremento funcional, pruebas de dominio/integración/UI pertinentes y revisión completa de QA.

## Fase 7 — Buscar y unirse a partidas

**Objetivo:** completar el núcleo de descubrimiento y participación.

**Resultados previstos:** listado, filtros aprobados, detalle, participación, control de aforo, participantes y partidas propias en el alcance definido.

**Criterio de salida orientativo:** recorrido principal verificable de extremo a extremo, accesible, seguro y medible.

## Fase 8 — Perfil y consolidación del MVP

**Objetivo:** completar lo estrictamente necesario del perfil, consolidar el MVP e incorporar únicamente mejoras derivadas de la validación y aprobadas dentro de su alcance.

**Resultados previstos:** perfil básico consolidado según el PRD, correcciones de los flujos del MVP respaldadas por evidencia y preparación de su cierre.

**Nota:** la colección de juegos es una capacidad POST-MVP y requiere una nueva decisión explícita de producto. Esta fase no debe usarse para introducir colección, intercambio, feed u otras funciones sociales.

## Fases posteriores — Orientación

Según los resultados del MVP podrían abordarse operación y lanzamiento controlado, mejoras de confianza, coordinación, colecciones, comunidades, funciones sociales o intercambio. Su orden y contenido no están decididos. Cada iniciativa necesitará evidencia, actualización del PRD/MVP y planificación propia.

## Puerta inmediata

La Fase 2 está en revisión. La Fase 3 es la siguiente fase prevista, pero todavía no ha comenzado y requiere el cierre y la aprobación explícita de esta fase.
