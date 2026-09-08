# Core User Flows — Fase 1

## Convenciones

- Madrid es el contexto geográfico fijo y preseleccionado del prototipo. No existe selector de ciudad; esto no limita una futura ampliación multi-ciudad.
- «Disponible» significa futura, no cancelada y con plazas confirmadas libres.
- El organizador cuenta dentro del aforo.
- Una solicitud pendiente no es participación confirmada y no ocupa una plaza confirmada.
- Las acciones personales presuponen una identidad simulada en UX/prototipo; no se diseña autenticación.

## FLOW-01 — Descubrir partidas

**Objetivo:** encontrar partidas potencialmente interesantes con la menor fricción.

**Entrada:** apertura de la aplicación o destino Explorar.

**Flujo principal:**

```mermaid
flowchart TD
    A[Entrar en la aplicación] --> B[Explorar partidas en Madrid]
    B --> C[Ver disponibles por fecha próxima]
    C --> D{¿Necesita reducir resultados?}
    D -- No --> E[Elegir una partida]
    D -- Sí --> F[Filtrar por juego, fecha o zona]
    F --> G{¿Hay resultados?}
    G -- Sí --> E
    G -- No --> H[Ver ausencia de resultados]
    H --> I[Limpiar o cambiar filtros]
    I --> C
    E --> J[Consultar detalle]
```

**Información de cada resultado:** juego, fecha/hora, zona y Madrid, organizador, confirmados/aforo, plazas disponibles y «Ver partida».

**Alternativas:**

- Sin ninguna partida disponible: explicar el vacío y ofrecer «Crear partida».
- Sin coincidencias para filtros: conservar filtros visibles y ofrecer «Limpiar filtros».
- Error de carga: conservar contexto y ofrecer «Reintentar».
- Loading: reservar la jerarquía del listado sin presentar datos ficticios como reales.

**Resultado:** el usuario llega al detalle de una partida o entiende cómo ampliar/crear opciones.

## FLOW-02 — Consultar detalle de una partida

**Objetivo:** decidir si solicitar plaza con información suficiente y no excesiva.

```mermaid
flowchart TD
    A[Seleccionar resultado o partida propia] --> B[Cargar detalle]
    B --> C{¿Se puede mostrar?}
    C -- No --> D[Error o no encontrada]
    C -- Sí --> E[Ver juego, fecha, hora y zona]
    E --> F[Ver organizador, aforo y confirmados]
    F --> G[Ver descripción y estado personal]
    G --> H{Rol y estado}
    H -- Puede solicitar --> I[Mostrar Solicitar plaza]
    H -- Pendiente --> J[Mostrar Solicitud pendiente]
    H -- Confirmado --> K[Mostrar Participación confirmada]
    H -- Organizador --> L[Mostrar gestión de solicitudes]
    H -- Completa, cancelada o pasada --> M[Explicar que no admite solicitudes]
```

**Contenido:** juego, fecha, hora, Madrid y zona/distrito, nombre del organizador, aforo total, plazas confirmadas y disponibles, participantes confirmados, descripción opcional y estado del usuario.

El punto exacto de encuentro no se muestra ni se diseña en esta fase. Una solicitud pendiente tampoco aparece dentro de participantes confirmados.

## FLOW-03 — Solicitar participar

**Objetivo:** enviar una solicitud entendiendo que todavía no existe una plaza confirmada.

**Precondición:** usuario identificado, no organizador, sin solicitud previa y partida disponible.

```mermaid
flowchart TD
    A[Detalle disponible] --> B[Solicitar plaza]
    B --> C{¿La solicitud se envía?}
    C -- No --> D[Mostrar error y permitir reintentar]
    C -- Sí --> E[Mostrar Solicitud enviada]
    E --> F[Estado: pendiente]
    F --> G[Ver en Mis partidas]
    F --> H{Resultado}
    H -- Acepta al usuario --> I[Participación confirmada]
    H -- Rechaza al usuario --> J[Solicitud no aceptada]
    H -- Se completa antes --> K[Partida completa y solicitud sin confirmar]
```

**Reglas UX:**

- Mensaje de éxito: «Solicitud enviada. Está pendiente de respuesta; aún no tienes una plaza confirmada».
- No se permite duplicar una solicitud.
- Ya confirmado: mostrar el estado, no la acción.
- Completa: «No quedan plazas disponibles».
- Si la partida se completa mientras la solicitud está pendiente: «La partida se ha completado. Tu solicitud no llegó a confirmarse porque ya no quedan plazas».
- Cancelada: «La partida ha sido cancelada».
- Pasada: «Esta partida ya se celebró».
- Si cambia la disponibilidad durante el envío, explicar el cambio y actualizar el detalle.

## FLOW-04 — Gestionar solicitudes como organizador

**Objetivo:** aceptar o rechazar solicitudes sin superar el aforo.

**Entrada:** Mis partidas → Organizadas por mí → detalle, o acceso directo a una partida propia.

```mermaid
flowchart TD
    A[Abrir partida organizada] --> B[Ver solicitudes pendientes]
    B --> C[Revisar perfil básico]
    C --> D{Decisión}
    D -- Rechazar --> E[Confirmar rechazo]
    E --> F[Estado: no aceptada]
    D -- Aceptar --> G{¿Queda plaza?}
    G -- No --> H[Impedir aceptación y actualizar aforo]
    G -- Sí --> I[Confirmar participante]
    I --> J[Actualizar confirmados y plazas]
    J --> K{¿Se completó el aforo?}
    K -- Sí --> L[Marcar completa y retirar de Explorar]
    L --> M[Cerrar las demás solicitudes pendientes por falta de plaza]
    M --> N[Informar sin implicar rechazo personal]
    K -- No --> B
```

**Reglas UX:**

- Una fila pendiente muestra nombre, avatar opcional, zona general, descripción breve y acciones.
- Aceptar vuelve a comprobar capacidad; al confirmarse, mueve a la persona a participantes confirmados.
- Rechazar requiere confirmación breve y no exige motivo.
- Si la partida queda completa, las demás solicitudes dejan de estar pendientes porque ya no pueden obtener plaza y no existe lista de espera.
- Esas personas ven: «La partida se ha completado. Tu solicitud no llegó a confirmarse porque ya no quedan plazas». No se comunica como rechazo personal del organizador.
- No se decide todavía el nombre técnico del resultado ni su modelo de datos.
- Ninguna decisión usa reputación, reviews, badges o scoring.

## FLOW-05 — Crear una partida

**Objetivo:** publicar una partida con un único formulario corto.

```mermaid
flowchart TD
    A[Elegir Crear] --> B[Completar un formulario]
    B --> C[Juego simulado]
    C --> D[Fecha y hora]
    D --> E[Ver Madrid fijo y elegir zona o distrito]
    E --> F[Aforo total y descripción opcional]
    F --> G[Publicar partida]
    G --> H{¿Datos válidos y publicación correcta?}
    H -- No --> I[Mostrar errores y conservar datos]
    I --> B
    H -- Sí --> J[Mostrar Partida publicada]
    J --> K[Abrir detalle como organizador]
```

**Decisión de pantalla:** un solo formulario. Madrid se muestra como contexto fijo, no como campo editable; el usuario elige únicamente zona o distrito. Los seis datos introducidos o seleccionados no justifican pasos adicionales.

**Validaciones UX mínimas:** campos obligatorios identificados, fecha/hora futura y aforo total comprensible. Ayuda de aforo: «Tú cuentas dentro del aforo; con 4 habrá 3 plazas disponibles».

No incluye selector de ciudad, multi-ciudad, recurrencia, torneo, lista de espera, votación, múltiples juegos, mapa, geolocalización, precio o pago. La ampliación futura a otras ciudades continúa siendo posible.

## FLOW-06 — Mis partidas

**Objetivo:** distinguir lo organizado de las solicitudes y participaciones propias.

```mermaid
flowchart TD
    A[Abrir Mis partidas] --> B{Elegir segmento}
    B -- Organizadas por mí --> C[Ver partidas organizadas]
    C --> D[Ver abiertas, completas, canceladas o pasadas]
    D --> E[Abrir detalle y solicitudes]
    B -- Participo / he solicitado --> F[Ver partidas relacionadas]
    F --> G[Identificar pendiente, confirmada, no aceptada, completa sin confirmación, cancelada o pasada]
    G --> H[Abrir detalle]
```

**Reglas UX:**

- Los dos segmentos mantienen recuentos solo si ayudan y los datos son fiables.
- Cada tarjeta muestra la relación del usuario y el estado en texto.
- «Organizada» describe la relación del usuario; abierta/completa/cancelada/pasada describe la partida.
- Vacío en Organizadas: «Aún no has organizado partidas» + «Crear partida».
- Vacío en Participación: «Aún no has solicitado participar» + «Explorar partidas».

## FLOW-07 — Perfil básico

**Objetivo:** comprender quién es otra persona o revisar la propia identidad visible sin funciones de red social.

```mermaid
flowchart TD
    A{Origen} -->|Navegación Perfil| B[Ver perfil propio]
    A -->|Organizador o participante| C[Ver perfil de otra persona]
    B --> D[Ver datos públicos y actividad derivada]
    D --> E[Editar perfil básico]
    E --> F{¿Datos válidos?}
    F -- No --> G[Mostrar errores]
    G --> E
    F -- Sí --> H[Guardar y volver al perfil]
    C --> I[Ver identidad pública mínima]
```

**Perfil propio:** nombre visible, avatar opcional, ciudad, zona/distrito opcional, descripción opcional, actividad derivada útil y «Editar perfil».

**Perfil ajeno:** solo información pública equivalente. No tiene seguir, añadir amistad, puntuar, contactar ni ver datos privados.

La composición sigue siendo una hipótesis UX y no prescribe modelo de datos.
