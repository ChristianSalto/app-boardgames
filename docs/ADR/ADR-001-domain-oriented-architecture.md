# ADR-001 — Arquitectura principal orientada al dominio

- **Estado:** aceptada
- **Fecha:** 2026-09-10

## Contexto

El prototipo contiene partidas, jugadores, participación, perfiles e información simulada de confianza. Debe evolucionar hacia una aplicación con persistencia y autenticación sin acoplar las reglas de negocio a React o Firebase.

Una organización global por tipos técnicos —por ejemplo `components`, `services`, `repositories`, `models` y `utils`— dispersaría cada capacidad entre varias carpetas y haría menos visible el propósito del producto. Aplicar cuatro capas completas a cada feature desde el inicio también introduciría estructura sin responsabilidad real.

## Decisión

La estructura principal de `src` se organizará por dominios y capacidades del producto. Los límites actuales son `game-sessions`, `players` y `authentication`, acompañados por `app` como raíz de composición y un `shared` deliberadamente pequeño.

Dentro de cada dominio se separarán conceptualmente `domain`, `application`, `infrastructure` y `presentation` solo cuando exista contenido y una necesidad verificable. La dirección principal será presentación hacia aplicación y aplicación hacia dominio; infraestructura implementará puertos definidos por la aplicación. El dominio no dependerá de React, Firebase ni navegador.

Las capacidades futuras no generarán carpetas vacías. Se incorporarán como dominios propios o extensiones de uno existente cuando producto las apruebe y sus reglas lo justifiquen.

## Alternativas consideradas

### Capas técnicas globales

Una raíz con `components`, `services`, `repositories`, `models` y `utils` resulta familiar, pero agrupa por mecanismo en lugar de negocio, favorece dependencias transversales y dificulta comprender o cambiar un flujo completo.

### Clean Architecture uniforme por feature

Crear siempre las cuatro carpetas y contratos completos reforzaría la separación formal, pero produciría capas vacías, wrappers y abstracciones ceremoniales en un MVP aún pequeño.

### Estructura plana del prototipo

Mantener todos los archivos próximos reduce inicialmente la navegación, pero no establece límites suficientes para integrar persistencia y autenticación sin mezclar reglas, efectos e interfaz.

## Consecuencias

### Positivas

- La estructura expresa el problema de producto y facilita localizar un flujo completo.
- Las reglas pueden probarse sin React, navegador o Firebase.
- Los adaptadores simulados y Firebase pueden sustituirse tras contratos estables.
- Los dominios futuros pueden incorporarse sin reorganizar toda la raíz.
- Cada feature adopta solo la complejidad que necesita.

### Costes y riesgos

- El equipo debe respetar APIs públicas y evitar imports profundos entre dominios.
- Algunas piezas parecidas permanecerán duplicadas hasta demostrar que comparten conocimiento.
- La ubicación de una responsabilidad puede exigir criterio cuando coordina varios dominios.
- La migración desde el prototipo deberá ser incremental para no mezclar refactor e integración de infraestructura en un cambio grande.

### Seguimiento

- Revisar los límites al definir contratos detallados y casos de uso.
- Extraer un dominio nuevo solo cuando aparezcan reglas y ciclo de vida propios.
- Mantener Firebase confinado a infraestructura y ensamblado desde `app`.

