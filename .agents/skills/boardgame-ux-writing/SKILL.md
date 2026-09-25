---
name: boardgame-ux-writing
description: Revisar y escribir copy de interfaz para Mesa Abierta y juegos de mesa, especialmente etiquetas, estados de plazas, errores, ayudas y mensajes redundantes.
---

# Escritura UX

Lee el estado real del flujo y las decisiones de producto antes de cambiar
palabras. Consulta `docs/ux/GUIA.md`, secciones 6 y 7, desde la raíz del proyecto.
Mantén el mecanismo de textos/i18n existente; no crear otro por esta revisión.

## Revisión contextual

Evalúa título, explicación, dato, acción y feedback juntos. Cada uno debe añadir
algo útil para la decisión actual. Quita repeticiones de significado dentro de
ese contexto; conserva la repetición que orienta al entrar desde otra ruta o
que hace autónoma una confirmación. No eliminar labels accesibles como si
fueran copy decorativo ni ocultar información solo para acortar la pantalla.

El verbo debe anticipar el efecto real. En Mesa Abierta usa Solicitar plaza
cuando aún debe aprobar el organizador; no escribir Unirme o Ya estás dentro.
El organizador cuenta en el aforo; pendientes no son confirmados. Un interés
en un anuncio no es una reserva ni una transacción. Reviews y fiabilidad no
son garantías de seguridad ni una puntuación única.

Distingue vacío inicial, filtros sin coincidencias y error de carga. El error
explica la recuperación sin culpar; la ayuda previene una duda concreta; el
éxito confirma la consecuencia. No añadir párrafos de instrucciones obvias.
Conserva información necesaria sobre privacidad, acceso y consecuencias.

Verifica singular/plural, cifras, fechas locales, nombres largos y estado tras
recarga. Respeta los idiomas soportados. En i18n, no concatenar frases ni
forzar límites de caracteres que rompan traducciones. Revisa el texto ampliado
en su componente; no aprobar un texto solamente por su longitud.

## Salida

Para una revisión amplia usa `docs/ux/templates/TEXTOS.md`: ruta/estado, texto
actual, propuesta, motivo y condición de verdad. Para una corrección pequeña,
basta con la propuesta junto a su contexto. En trabajo extenso o delicado,
delega una revisión al agente `boardgame_ux_writer`; el responsable implementa.
Las restricciones de auditoría o edición de la petición mantienen prioridad.
