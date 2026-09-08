# Reglas obligatorias del proyecto

Estas reglas se aplican a personas y agentes de IA. Deben interpretarse junto con `docs/PRD.md`, `docs/MVP.md` y la tarea activa. Si una regla necesita cambiar, el cambio debe justificarse, revisarse y quedar documentado.

## Alcance y producto

- El problema inicial es encontrar personas con quienes jugar a juegos de mesa.
- El MVP prioriza crear, descubrir y participar en partidas o quedadas.
- No se incorpora una funcionalidad fuera de `docs/MVP.md` sin decisión explícita de producto.
- Intercambio de juegos y red social avanzada permanecen fuera del MVP 1.
- Toda incertidumbre se registra como hipótesis o pregunta abierta; no se presenta como hecho.
- No se comienza una fase hasta que `ProductManagerAgent` confirme los criterios de salida de la anterior.

## Arquitectura

- Aplicar Screaming Architecture: la organización principal expresará conceptos del dominio, no carpetas genéricas como arquitectura dominante.
- Aplicar Clean Architecture: el dominio no dependerá de React, Firebase, Firestore, APIs externas ni otros detalles de infraestructura.
- Firebase será un detalle de infraestructura conectado mediante límites explícitos.
- No fijar la estructura definitiva de carpetas antes de la fase de arquitectura técnica detallada.
- Documentar mediante ADR solo las decisiones técnicas relevantes, con contexto, alternativas y consecuencias.

## TypeScript y programación funcional

- El código de aplicación será TypeScript en modo estricto cuando se inicialice el proyecto.
- Preferir funciones puras, datos inmutables, composición, transformaciones explícitas y funciones pequeñas.
- Confinar efectos secundarios a los límites de UI e infraestructura y hacer explícitas las dependencias.
- Evitar clases innecesarias, estado mutable, herencia como reutilización principal, *singletons* y *managers* genéricos.
- No silenciar errores de tipos sin una justificación localizada y revisable.

## React

- React será una capa de presentación y composición de interfaz, no el hogar de las reglas del dominio.
- La UI no contendrá reglas de negocio ni se acoplará directamente a Firebase cuando exista un límite de aplicación adecuado.
- Los componentes puramente visuales se mantendrán simples; no necesitan depender de casos de uso, contratos ni capas de aplicación.
- No crear abstracciones artificiales para aparentar conformidad con Clean Architecture. KISS tiene prioridad sobre la arquitectura ceremonial.
- Implementar los estados de carga, vacío, error, éxito y deshabilitado que requiera cada flujo.
- No optimizar ni abstraer componentes antes de que exista una necesidad demostrable.

## Firebase, seguridad y privacidad

- Authentication, Firestore, Storage y Hosting se incorporarán solo cuando la fase y el caso de uso lo requieran.
- Desarrollar y probar contra Emulator Suite antes de depender de recursos remotos compartidos.
- Aplicar mínimo privilegio y denegación por defecto en reglas de seguridad.
- Probar las reglas para accesos permitidos y denegados; la validación de cliente nunca sustituye a la autorización del backend.
- Para el descubrimiento público inicial se usará ciudad, zona, distrito o una granularidad equivalente.
- No se contempla *tracking*, geolocalización continua, GPS en tiempo real ni publicación innecesaria de ubicación precisa.
- Un punto o dirección concreta de encuentro podrá incorporarse posteriormente si el flujo lo necesita, con minimización de datos, visibilidad controlada, privacidad y acceso solo cuando sea necesario. Ese flujo no se diseña en la Fase 0.
- No exponer secretos o configuración sensible en el repositorio ni en logs.
- Storage no se añade hasta que exista un archivo necesario para un caso de uso aprobado.

## Testing y calidad

- Cada tarea debe incluir validaciones proporcionales al riesgo y evidencia de su resultado.
- Priorizar pruebas de reglas de dominio y casos de uso; añadir integración en límites de infraestructura y pruebas de UI para flujos críticos.
- Todo defecto corregido debe incorporar una prueba de regresión cuando sea razonable.
- Una prueba no debe depender innecesariamente de red, reloj o estado compartido; esas dependencias se controlan de forma explícita.
- QA revisa contra criterios de aceptación, no contra preferencias personales.

## Accesibilidad y responsive

- Objetivo obligatorio: WCAG 2.2 nivel AA.
- Diseñar e implementar con estrategia *mobile first*.
- Usar HTML semántico, navegación por teclado, foco visible, nombres accesibles, contraste suficiente y mensajes de error comprensibles.
- No comunicar información únicamente por color, posición o animación.
- Incluir accesibilidad en diseño, implementación y revisión; no tratarla como una corrección final.

## CSS

- La arquitectura CSS será ITCSS cuando se implemente la interfaz.
- Mantener la cascada predecible, especificidad controlada y estilos organizados por responsabilidad.
- No introducir todavía estilos ni una estructura CSS definitiva.

## KISS y DRY

- Elegir la solución más sencilla que cubra los requisitos presentes.
- Evitar infraestructura, patrones y extensibilidad basados únicamente en necesidades hipotéticas.
- Eliminar duplicación real de conocimiento, no similitudes accidentales.
- Si una abstracción DRY reduce claridad o anticipa casos no existentes, conservar la solución explícita hasta disponer de evidencia.

## Documentación e idioma

- El código, identificadores y comentarios técnicos futuros estarán en inglés.
- La documentación del proyecto estará en español.
- El PRD es la referencia para requisitos; el MVP, para alcance; `TASK.md`, para estado actual; los ADRs, para decisiones técnicas.
- Actualizar documentación solo cuando cambie la realidad que representa y evitar duplicar contenido extenso entre archivos.
- No inventar métricas, resultados de investigación ni decisiones no aprobadas.

## Gestión del trabajo con IA

- Cada agente opera dentro de su misión y de la tarea asignada en `TASK.md`.
- Separar planificación, implementación y revisión; QA debe aportar revisión independiente.
- Mantener tareas pequeñas, cambios revisables y criterios verificables.
- Registrar intervenciones relevantes en `PROMPTS_LOG.md` mediante un resumen, sin almacenar el prompt completo ni información sensible.
- Un agente no debe ampliar alcance, instalar herramientas, modificar servicios externos ni avanzar de fase sin autorización aplicable.
- Si encuentra un bloqueo material, debe exponer evidencia, impacto y decisión requerida en vez de asumirla.
