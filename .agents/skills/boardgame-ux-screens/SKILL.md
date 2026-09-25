---
name: boardgame-ux-screens
description: Diseñar o refactorizar pantallas y componentes de juegos de mesa para mejorar jerarquía, compacidad, orientación, formularios y estados sin cambiar su alcance funcional.
---

# Pantallas claras y compactas

Lee reglas y decisiones visuales del destino. En Mesa Abierta conserva ITCSS,
tokens y la dirección de club moderno. Las referencias siguientes parten de la
raíz: `docs/ux/GUIA.md`, secciones 4, 5, 6 y 8, y la ficha existente de la pantalla.
Si no existe ficha, usa `docs/ux/templates/PANTALLA.md` de forma breve.

## Antes de editar

Comprueba Git. Observa la superficie y registra baseline de los estados que vas
a cambiar con datos locales deterministas. Si no puedes renderizar, avanza en
el trabajo independiente y registra que la validación visual sigue abierta.
Identifica tarea, rol, acción prioritaria, contexto de retorno y componentes.

## Criterios de implementación

- Ordena orientación, información decisiva y acción. Una decisión tiene una
  prioridad visual clara; no imponer un único botón a listas exploratorias o
  elecciones equivalentes. Justifica excepciones según la tarea.
- Compacta eliminando repeticiones y contenedores antes de reducir espacio o
  texto. No esconder fecha, plazas, condición de acceso o consecuencia de una
  acción. El texto ampliado puede necesitar más altura.
- Reutiliza tokens semánticos y variantes demostradas. Evita migrar de framework
  o introducir otro sistema visual. Los formularios cortos existentes no se
  convierten en asistentes por estética.
- Modela carga, error, vacío, contenido, acceso y envío por separado. Las
  acciones dependen del estado real: una solicitud no confirma plaza. No
  simular éxito ni duplicar envíos. Reintentar conserva datos recuperables.
- Respeta HTML semántico, nombres accesibles, foco y teclado. Evita enlaces o
  botones anidados al hacer clicable una tarjeta. Una barra fija no tapa el
  final de la página, mensajes de error ni campos con teclado abierto.
- Conserva filtros, retorno y entidad por ID. Un ajuste visual no modifica las
  reglas de aforo, autorización, estados de solicitud ni reputación.

Renderiza tras un lote coherente, compara con la línea base y usa
`boardgame-ux-writing` si cambia texto. Al terminar, aplica
`boardgame-ux-validation` y entrega evidencia, comportamiento y límites.
No afirmar conformidad de accesibilidad completa a partir de capturas.
