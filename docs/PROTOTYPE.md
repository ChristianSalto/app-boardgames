# Prototipo SPA — Fase 2

## Objetivo

Validar visualmente y mediante interacción los flujos aprobados de descubrimiento, solicitud, gestión, creación y perfiles antes de definir la arquitectura definitiva o integrar infraestructura real. **Mesa Abierta** es un nombre provisional.

## Alcance implementado

- Explorar partidas disponibles en Madrid y filtrar por juego, fecha y zona/distrito.
- Consultar una partida con variantes para usuario potencial, solicitud pendiente, participante confirmado, organizador, completa, cancelada y pasada.
- Solicitar plaza y reflejar inmediatamente el estado pendiente en Mis partidas.
- Aceptar o rechazar solicitudes como organizador.
- Completar el aforo y cerrar las solicitudes restantes sin mantenerlas pendientes ni crear una lista de espera.
- Crear una partida en una pantalla, con Madrid fijo, y mostrarla en Explorar y Mis partidas.
- Consultar y editar el perfil simulado propio y abrir perfiles básicos de otros jugadores.
- Navegación Mobile First y adaptación desktop con Explorar, Mis partidas, Crear y Perfil.

## Datos simulados

La aplicación comienza con Alex Martín como identidad ya iniciada y utiliza jugadores, juegos y partidas creados localmente. Todo el estado vive en memoria y se restablece al recargar. No hay peticiones a APIs ni recursos gráficos externos.

## Cómo ejecutarlo

Requiere Node.js y npm.

```bash
npm install
npm run dev
```

Abrir la URL local mostrada por Vite. Para comprobar la compilación:

```bash
npm run typecheck
npm run build
```

## Flujos disponibles

1. Explorar → abrir una partida → Solicitar plaza → comprobar «Solicitud pendiente» → verla en Mis partidas.
2. Mis partidas → Organizadas por mí → abrir Dune: Imperium → aceptar o rechazar solicitudes.
3. Aceptar la última plaza en Dune: Imperium → comprobar partida completa y cero solicitudes pendientes.
4. Crear → completar formulario → publicar → abrir el detalle → comprobarla en Mis partidas y Explorar.
5. Abrir el nombre de un organizador o participante → consultar su perfil.

## Limitaciones conocidas

- Sin persistencia: recargar recupera los datos iniciales.
- Fechas de partidas generadas respecto al día de ejecución para mantener escenarios futuros y pasados.
- Madrid es fijo durante el prototipo; no hay selector de ciudad.
- No existe comunicación real con las personas ni notificaciones.
- El resultado interno de una solicitud cerrada por aforo es provisional y no define el modelo futuro.
- Las decisiones visuales, densidad de filtros y prominencia de Crear necesitan validación humana.

## Fuera del prototipo

Firebase, backend, APIs, autenticación real, catálogo externo, mapas, geolocalización, punto exacto de encuentro, edición/cancelación de partidas, abandono o retirada de solicitudes, lista de espera, moderación, colección, intercambio, chat, reputación, votación de juegos, pagos, notificaciones push, analytics y demás funciones POST-MVP.
