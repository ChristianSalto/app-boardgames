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

**Estado:** completada. Prototipo funcional aprobado.

## Fase 3 — Validación UX/UI

**Objetivo:** probar el prototipo con usuarios objetivo y convertir observaciones en decisiones.

**Resultados previstos:** plan y evidencia de validación, problemas priorizados, iteraciones necesarias y recomendación de continuidad o ajuste.

**Criterio de salida orientativo:** flujos críticos comprensibles, riesgos de accesibilidad revisados y preguntas de producto necesarias para arquitectura respondidas o aceptadas explícitamente.

**Estado:** completada con recomendación GO.

## Fase 4 — Arquitectura técnica detallada

**Objetivo:** definir límites de dominio y estructura técnica a partir de flujos validados.

**Resultados previstos:** dominios, casos de uso, contratos, dirección de dependencias, estrategia de pruebas, estructura de proyecto y ADRs necesarios.

**Límite:** aplicar Clean/Screaming Architecture y programación funcional con la mínima complejidad; no diseñar funcionalidades posteriores.

**Estado:** completada. Baseline arquitectónico aprobado.

## Fase 5 — Firebase y emuladores

**Objetivo:** preparar la infraestructura mínima segura para los casos de uso aprobados.

**Resultados previstos:** configuración Firebase, Emulator Suite, autenticación elegida, persistencia, adaptadores, índices y reglas de seguridad probadas.

**Límite:** el esquema de datos y las reglas se diseñan en esta fase conforme a contratos reales, no en Foundation.

**Estado:** completada. Authentication, Players, partidas, solicitudes, ciclo de vida y Security Rules validados localmente.

## Fase 6 — Marketplace MVP / Juegos de la comunidad

**Objetivo:** definir y, tras las aprobaciones correspondientes, implementar un segundo eje acotado para publicar y descubrir juegos en venta o intercambio dentro de la comunidad.

**Orientación:** las partidas mantienen prioridad en Explorar. Marketplace comienza como bloque secundario y flujo contextual, sin pagos, envíos, reservas, alquiler ni chat global.

**Resultados previstos:** definición de producto, arquitectura específica posterior, UX proporcionada y un vertical slice de anuncios e interés privado sujeto a revisión.

**Estado:** completada. Producto, arquitectura, prototipo, persistencia Firestore/Storage, flujo multiusuario y Security Rules han superado la revisión de integración de PROMPT-007F.

### Backlog diferido tras el cierre

Este trabajo no bloquea el cierre de Fase 6 y requiere priorización explícita antes de implementarse:

- **Auth visual:** conservar el background aprobado; compactar cards mediante padding y gaps, aproximar inputs y CTA a 50 px, reducir ligeramente iconos y revisar el tamaño de Complete Profile.
- **Game Listings futuro:** valorar `Mis anuncios` como sección propia, manteniendo una futura colección `Mis juegos` separada; UI de Contact Handoff, chat, alquiler, favoritos, búsqueda/filtros avanzados, tiendas, monetización, multi-ciudad/moneda, moderación/reportes y gestión avanzada de imágenes.
- **Técnico:** dividir el bundle cuando lo justifique la evolución del producto; valorar import/export persistente del Emulator Suite; vigilar el error de VM `startTime` observado en el entorno, actualmente no vinculado al código ni bloqueante.

## Fase 7 — Trust & Reputation MVP

**Objetivo:** aportar señales de confianza entre personas que comparten partidas mediante reviews elegibles y trazables, manteniendo reputación subjetiva y fiabilidad factual como conceptos separados.

**Resultados previstos:** definición de producto, arquitectura, UX e implementación incremental de reviews vinculadas a partidas; resumen de reputación íntegro y estados neutrales para Players sin valoraciones.

**Límite:** no incluir attendance/no-shows públicos sin un mecanismo justo de verificación, ni reputación comercial, gamificación, score único de confianza o moderación completa.

**Criterio de salida orientativo:** las reglas de elegibilidad, publicación, visibilidad, agregación y mínimo privilegio están implementadas y validadas sin permitir que el cliente manipule reputación.

**Estado:** en progreso. PROMPT-008A ha definido el alcance de producto y PROMPT-008B la arquitectura; PROMPT-008C todavía no ha comenzado.

## Fase 8 — Perfil y consolidación del MVP

**Objetivo:** completar lo estrictamente necesario del perfil, consolidar el MVP e incorporar únicamente mejoras derivadas de la validación y aprobadas dentro de su alcance.

**Resultados previstos:** perfil básico consolidado según el PRD, correcciones de los flujos del MVP respaldadas por evidencia y preparación de su cierre.

**Nota:** la colección de juegos continúa siendo una capacidad POST-MVP y requiere una nueva decisión explícita de producto. Los anuncios simples de venta/intercambio aprobados en Fase 6 no implican colección personal ni autorizan feed u otras funciones sociales.

## Fases posteriores — Orientación

Según los resultados del MVP podrían abordarse operación y lanzamiento controlado, mejoras de confianza, coordinación, colecciones, comunidades, funciones sociales o Marketplace avanzado. Su orden y contenido no están decididos. Cada iniciativa necesitará evidencia, actualización del PRD/MVP y planificación propia.

## Puerta inmediata

La Fase 7 dispone de definición de producto y arquitectura aprobadas tras PROMPT-008A y PROMPT-008B. El siguiente paso recomendado es PROMPT-008C, limitado a Domain/Application y prototipo UI sin persistencia real; no queda iniciado por este documento.
