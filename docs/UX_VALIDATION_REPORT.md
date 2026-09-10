# Informe de validación UX/UI — Fase 3

## Resultado

**GO para Fase 4 — Arquitectura técnica detallada.**

El prototipo es suficientemente claro, usable y coherente como base funcional. La revisión no ha identificado problemas UX críticos que obliguen a rehacer los flujos antes de definir la arquitectura técnica.

## Aspectos validados

- La entrada explica que Mesa Abierta sirve para encontrar personas con quienes jugar a juegos de mesa en Madrid, sin ocultar las partidas tras una introducción extensa.
- Explorar permite identificar partidas, filtrarlas por juego, fecha y zona/distrito y abrir su detalle.
- El detalle presenta juego, momento, zona, lugar, aforo, participantes, organizador y señales de confianza antes de solicitar plaza.
- Solicitar plaza produce un estado pendiente inmediato y explícitamente distinto de una participación confirmada.
- Mis partidas separa las organizadas por el usuario de aquellas en las que participa o ha solicitado plaza.
- La gestión permite aceptar o rechazar solicitudes; al ocupar la última plaza actualiza el aforo y cierra las restantes sin mantenerlas pendientes.
- Crear partida funciona en una sola pantalla y distingue Madrid fijo, zona/distrito, lugar concreto y descripción.
- Los perfiles propios y ajenos aportan contexto personal sin convertir el prototipo en una red social.
- Reputación subjetiva y fiabilidad observable se presentan como señales simuladas diferentes y permiten validar posteriormente la hipótesis de confianza.
- La navegación principal, los estados activos y los breadcrumbs permiten conservar el contexto entre Explorar, Mis partidas, detalle, gestión y perfiles.
- Las vistas principales son utilizables sin desbordamiento horizontal a 360, 430, 768 y 1440 px; la navegación inferior y la cabecera desktop se activan en los contextos previstos.
- Los formularios utilizan controles con nombre accesible, orden de teclado comprensible, foco visible, ayudas y errores asociados mediante texto y atributos de estado.

## Problemas críticos

No se han encontrado problemas críticos que invaliden la arquitectura o los flujos principales.

## Mejoras diferidas

Son trabajo posterior y no bloquean el paso a Fase 4:

- perfección visual y cards definitivas;
- branding definitivo;
- refinamiento de perfiles y reviews;
- microinteracciones y animaciones;
- pulido final de CSS y componentes;
- pruebas con usuarios externos.

## Hipótesis que requieren usuarios reales

- Que una persona nueva comprenda la propuesta de valor sin explicación previa y encuentre una partida adecuada con rapidez.
- Que la diferencia entre solicitud pendiente y participación confirmada se entienda de forma consistente.
- Que el aforo total y la plaza ocupada por quien organiza coincidan con el modelo mental de los usuarios.
- Que zona, lugar y descripción resulten inequívocos al crear y consultar una partida.
- Que reputación y fiabilidad se distingan, aporten confianza útil y no se interpreten como una garantía de seguridad.
- Que la información disponible sea suficiente para decidir quedar con otra persona.
- Que la densidad y jerarquía actuales funcionen en uso real tanto en móvil como en desktop.

Estas hipótesis se validarán con usuarios cuando exista un MVP más cercano a producción. No condicionan el inicio de la arquitectura técnica.

## Recomendación

Avanzar a **Fase 4 — Arquitectura técnica detallada**, manteniendo el alcance funcional validado y el trabajo de refinamiento como backlog no bloqueante.
