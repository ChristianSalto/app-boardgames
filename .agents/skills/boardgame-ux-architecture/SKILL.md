---
name: boardgame-ux-architecture
description: Auditar y refactorizar la arquitectura UX de Mesa Abierta y apps sociales de juegos de mesa cuando cambien navegación, recorridos, jerarquía de tareas o estructura de pantallas.
---

# Arquitectura UX de juegos de mesa

Lee las instrucciones vigentes, tarea activa y decisiones de producto. Las rutas
de documentos de esta skill son relativas a la raíz del repositorio instalado.
En Mesa Abierta, empieza por `docs/ux/ADAPTACION_MESA_ABIERTA.md` y contrasta su
referencia con el código actual. Consulta `docs/ux/GUIA.md`, secciones 2, 3 y 9.

## Decisiones que cambian el trabajo

- Reutiliza estrategia, inventario y roles existentes. No abrir otra jerarquía
  de agentes ni sustituir PRD/MVP con la guía. En Mesa Abierta Producto coordina,
  UX diseña, Frontend implementa y QA revisa independientemente.
- Inventaría rutas, guards, enlaces directos y retornos por tarea y rol. Cita
  implementación y evidencia; distingue hecho, hipótesis y recomendación.
- Prioriza el recorrido que ya aporta valor. En Mesa Abierta: explorar →
  detalle → solicitar plaza → resultado. Login, perfil y beta gate son
  dependencias; anuncios y reputación conservan su alcance aprobado.
- Distingue juego, sesión, solicitud y confirmación. No importar unión directa,
  chat, mapa, lista de espera o pantallas de Cruxmatch que no existen aquí.
- Las decisiones aprobadas de navegación tienen prioridad sobre ejemplos de la
  guía. Propón cambios con razones y evidencia, no por preferencia estética.

## Procedimiento proporcional

En una auditoría, no edites producto. En un refactor autorizado, prepara baseline
del recorrido, mapa actual y propuesto, correspondencia de rutas y criterios
observables; después implementa por medio del responsable existente. No exigir
aprobación adicional para decisiones reversibles ya cubiertas por la petición.
Eleva únicamente conflictos materiales de alcance o instrucciones.

Revisa dónde se pierde contexto: filtros, scroll, entidad por ID, origen,
autenticación, drafts y salida del modal. Trata persistencia y permisos como
contratos que deben conservarse, no como detalles visuales.

Divide por recorridos completos, no por sustituir todos los botones y después
todas las páginas. Para un refactor sustancial, delega una revisión de rutas al
agente `boardgame_ux_architect` según `docs/ux/OPERACION.md`; no le asignes
implementación ni autoridad de producto. Usa la skill de pantallas para el lote
y la de validación antes del cierre. Si no hay delegación, declara la limitación.

## Entrega

Actualiza el inventario existente con tareas, estados, rutas y hallazgos.
Devuelve un lote priorizado con criterio de salida y riesgos. Usa las plantillas
CONTEXTO o AUDITORIA de `docs/ux/templates/` solo si falta equivalente.
No declares resultados de uso sin haber observado personas o interacciones.
