# Wireframes textuales — Fase 1

## Convenciones

Wireframes de baja fidelidad para 360–430 px. Los corchetes representan controles; las etiquetas de estado son texto visible, no colores. No representan branding, estilos, componentes técnicos ni medidas exactas.

## WF-01 — Explorar con resultados

```text
┌──────────────────────────────────┐
│ Explorar                 Madrid  │
├──────────────────────────────────┤
│ Encuentra gente con quien jugar  │
│ a juegos de mesa en Madrid.      │
│                                  │
│ Juego                            │
│ [ Buscar juego…                ] │
│                                  │
│ Fecha                            │
│ [✓ Cualquiera] [ Hoy ]           │
│ [ Próx. 7 días] [ Este finde ]   │
│ [ Zona: todas ▼       ]          │
│                                  │
│ 6 partidas disponibles           │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Terraforming Mars            │ │
│ │ Vie 18 sep · 19:00           │ │
│ │ Chamberí · Madrid            │ │
│ │ Organiza: Lucía              │ │
│ │ 2/4 confirmados · 2 plazas   │ │
│ │ [ Ver partida ]              │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Azul                         │ │
│ │ Sáb 19 sep · 17:30           │ │
│ │ Retiro · Madrid              │ │
│ │ Organiza: Diego              │ │
│ │ 3/5 confirmados · 2 plazas   │ │
│ │ [ Ver partida ]              │ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│ Explorar | Mis partidas | Crear  │
│                     | Perfil     │
└──────────────────────────────────┘
```

La fecha más próxima aparece primero. Madrid es contexto fijo: no hay selector de ciudad, control de orden, mapa ni filtros avanzados.

### Variantes vacías

```text
Sin partidas disponibles

Todavía no hay partidas futuras con plazas en Madrid.
[ Crear una partida ]
```

```text
No hay resultados

Ninguna partida coincide con «Dune» y «Retiro».
[ Limpiar filtros ]
```

Error: «No pudimos cargar las partidas» + `[ Reintentar ]`. Loading conserva el título, filtros y espacios de tarjetas sin anunciar resultados inexistentes.

## WF-02 — Detalle disponible

```text
┌──────────────────────────────────┐
│ Explorar / Terraforming Mars     │
├──────────────────────────────────┤
│ DETALLE DE PARTIDA               │
│ Terraforming Mars                │
│                                  │
│ Viernes, 18 de septiembre        │
│ 19:00                            │
│ Café Manuela                     │
│ Chamberí · Madrid                │
│                                  │
│ 2/4 confirmados                  │
│ Quedan 2 plazas                  │
│                                  │
│ Organiza                         │
│ (A) Lucía                        │
│ Reputación 4,9 ★ · 31 valorac.   │
│ Fiabilidad 24/24 asistencias     │
│ [ Ver perfil y opiniones ]       │
│                                  │
│ Sobre la partida                 │
│ Partida tranquila. Explicamos    │
│ reglas antes de empezar.         │
│                                  │
│ Participantes confirmados        │
│ (A) Lucía · organizadora         │
│ (M) Marcos                       │
│                                  │
│ [ Solicitar plaza ]              │
│ Tu solicitud deberá ser aceptada │
│ por la persona organizadora.     │
├──────────────────────────────────┤
│ Explorar | Mis partidas | Crear  │
│                     | Perfil     │
└──────────────────────────────────┘
```

El nombre del lugar es simulado y se diferencia de zona y descripción. No se exige una dirección postal; la visibilidad futura del punto exacto sigue pendiente.

### WF-02A — Solicitud pendiente

```text
┌──────────────────────────────────┐
│ Solicitud enviada                │
│ Pendiente de respuesta           │
│                                  │
│ Aún no tienes plaza confirmada.  │
│ La partida mantiene 2/4 personas │
│ confirmadas.                     │
│                                  │
│ [ Ver en Mis partidas ]          │
└──────────────────────────────────┘
```

Variantes equivalentes sustituyen este panel:

- **Confirmada:** «Tu participación está confirmada».
- **Completa:** «No quedan plazas disponibles».
- **Completada durante la espera:** «La partida se ha completado. Tu solicitud no llegó a confirmarse porque ya no quedan plazas».
- **Cancelada:** «La partida ha sido cancelada».
- **Pasada:** «Esta partida ya se celebró».
- **No aceptada:** «Tu solicitud no ha sido aceptada».

En ningún caso un estado depende solo de color.

## WF-02B — Detalle del organizador

```text
┌──────────────────────────────────┐
│ ‹ Mis partidas    Tu partida     │
├──────────────────────────────────┤
│ Terraforming Mars                │
│ Vie 18 sep · 19:00               │
│ Chamberí · Madrid                │
│                                  │
│ 3/4 confirmados · 1 plaza        │
│ 2 solicitudes pendientes         │
│                                  │
│ Solicitudes                      │
│ ┌──────────────────────────────┐ │
│ │ (S) Sara                    │ │
│ │ Madrid · Retiro             │ │
│ │ «Me gustan juegos medios…»  │ │
│ │ [ Ver perfil ]              │ │
│ │ [ Aceptar ] [ Rechazar ]    │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ (J) Javier                  │ │
│ │ Madrid                      │ │
│ │ [ Ver perfil ]              │ │
│ │ [ Aceptar ] [ Rechazar ]    │ │
│ └──────────────────────────────┘ │
│                                  │
│ Participantes confirmados        │
│ Lucía · organizadora             │
│ Marcos                           │
│ Irene                            │
└──────────────────────────────────┘
```

Tras aceptar, la persona pasa a confirmados y el contador cambia. Si se ocupa la última plaza, la partida pasa a completa y las demás solicitudes dejan de figurar como pendientes; no permanecen acciones Aceptar/Rechazar sobre ellas.

La persona cuya solicitud no llegó a confirmarse ve:

```text
┌──────────────────────────────────┐
│ La partida se ha completado      │
│                                  │
│ Tu solicitud no llegó a          │
│ confirmarse porque ya no quedan  │
│ plazas.                          │
│                                  │
│ [ Ver en Mis partidas ]          │
└──────────────────────────────────┘
```

Este resultado no se etiqueta como rechazo del organizador y no crea una lista de espera.

## WF-03 — Crear partida

```text
┌──────────────────────────────────┐
│ ‹ Volver       Crear partida     │
├──────────────────────────────────┤
│ Todos los campos con * son       │
│ obligatorios.                    │
│                                  │
│ Juego *                          │
│ [ Seleccionar juego simulado ▼ ] │
│                                  │
│ Fecha *          Hora *          │
│ [ dd/mm/aaaa ]   [ --:-- ]       │
│                                  │
│ Ciudad                           │
│ Madrid · contexto fijo           │
│                                  │
│ Zona o distrito *                │
│ [ Chamberí                    ▼ ] │
│                                  │
│ Lugar de la partida (opcional)   │
│ [ Ej. Café Manuela             ] │
│ Nombre de local o punto conocido │
│                                  │
│ Aforo total *                    │
│ [ 4                            ] │
│ Te contamos dentro del aforo:    │
│ quedarían 3 plazas.              │
│                                  │
│ Descripción (opcional)           │
│ [                              ] │
│ [                              ] │
│                                  │
│ [ Publicar partida ]             │
└──────────────────────────────────┘
```

Madrid no es un campo editable ni ofrece selector de ciudad. Zona, lugar y descripción son campos distintos; el lugar no exige una dirección particular. En error, un resumen al inicio dice qué debe corregirse y cada campo muestra su mensaje. Los datos introducidos se conservan. En éxito se abre WF-02B con «Partida publicada».

## WF-04 — Mis partidas

### Organizadas por mí

```text
┌──────────────────────────────────┐
│ Mis partidas                     │
├──────────────────────────────────┤
│ [ Organizadas por mí ]           │
│ [ Participo / he solicitado ]    │
│                                  │
│ Terraforming Mars                │
│ Vie 18 sep · Chamberí            │
│ Abierta · 2 plazas               │
│ 2 solicitudes pendientes         │
│ [ Gestionar ]                    │
│                                  │
│ Carcassonne                      │
│ Dom 20 sep · Centro              │
│ Completa · 4/4                   │
│ [ Ver partida ]                  │
├──────────────────────────────────┤
│ Explorar | Mis partidas | Crear  │
│                     | Perfil     │
└──────────────────────────────────┘
```

Vacío: «Aún no has organizado partidas» + `[ Crear partida ]`.

### Participo / he solicitado

```text
┌──────────────────────────────────┐
│ Mis partidas                     │
├──────────────────────────────────┤
│ [ Organizadas por mí ]           │
│ [ Participo / he solicitado ]    │
│                                  │
│ Azul                             │
│ Sáb 19 sep · Retiro              │
│ Participación confirmada         │
│ [ Ver partida ]                  │
│                                  │
│ Ark Nova                         │
│ Dom 20 sep · Arganzuela          │
│ Solicitud pendiente              │
│ Aún no tienes plaza confirmada   │
│ [ Ver partida ]                  │
│                                  │
│ Dune: Imperium                   │
│ Lun 21 sep · Salamanca           │
│ Solicitud no aceptada            │
│ [ Ver partida ]                  │
│                                  │
│ Catan                            │
│ Mar 22 sep · Moncloa             │
│ La partida se ha completado      │
│ Tu solicitud no se confirmó      │
│ porque ya no quedan plazas       │
│ [ Ver partida ]                  │
└──────────────────────────────────┘
```

Vacío: «Aún no has solicitado participar» + `[ Explorar partidas ]`.

## WF-05 — Perfil propio y ajeno

### Perfil propio

```text
┌──────────────────────────────────┐
│ Perfil                           │
├──────────────────────────────────┤
│        (CR)                      │
│        Carmen Ruiz               │
│        Madrid · Centro           │
│                                  │
│ Me gustan los euros medios y     │
│ aprender juegos nuevos.          │
│                                  │
│ Señales de confianza · simuladas │
│                                  │
│ Reputación                       │
│ 4,8 ★ · 26 valoraciones          │
│ Opiniones de personas con las    │
│ que ha compartido mesa.          │
│                                  │
│ Fiabilidad                       │
│ 17 de 18 partidas asistidas      │
│ 1 ausencia sin aviso             │
│                                  │
│ [ Puntual ] [ Buen ambiente ]    │
│                                  │
│ Opiniones recientes              │
│ ★★★★★                            │
│ «Buen ambiente y explicó el      │
│ juego perfectamente.»            │
│                                  │
│ 3 organizadas · 5 participaciones│
│                                  │
│ [ Editar perfil ]                │
├──────────────────────────────────┤
│ Explorar | Mis partidas | Crear  │
│                     | Perfil     │
└──────────────────────────────────┘
```

«Editar perfil» cambia el contenido a campos simples de nombre, avatar opcional, zona opcional y descripción opcional; Madrid se muestra como contexto fijo y no editable. Guardar vuelve a la vista y muestra confirmación.

### Perfil de otra persona

```text
┌──────────────────────────────────┐
│ ‹ Partida          Organizador   │
├──────────────────────────────────┤
│        (L)                       │
│        Lucía                     │
│        Madrid · Chamberí         │
│                                  │
│ Partidas tranquilas y abiertas   │
│ a personas que están aprendiendo.│
│                                  │
│ Reputación                       │
│ 4,9 ★ · 31 valoraciones          │
│                                  │
│ Fiabilidad                       │
│ 24/24 asistencias · 0 ausencias  │
│                                  │
│ Lo que más destacan              │
│ Explica bien · Acogedora         │
│                                  │
│ Opiniones recientes              │
│ ★★★☆☆ «La partida estuvo bien,   │
│ aunque faltó algo de claridad.»  │
│                                  │
│ 4 organizadas · 6 participaciones│
│                                  │
│ [ Volver a la partida ]          │
└──────────────────────────────────┘
```

No hay seguir, contactar, valorar o añadir amistad. Las opiniones son simuladas y de solo lectura; conceptualmente solo pueden proceder de participantes confirmados que compartieron una partida finalizada.

## Adaptación principal a desktop

- Navegación en cabecera horizontal, sin cambiar nombres.
- WF-01: filtros adaptados al ancho, fecha mediante opciones seleccionables visibles y tarjetas en cuadrícula de dos o tres columnas.
- La cabecera separa «Explorar», «Mis partidas» y «Perfil» de la acción compacta «+ Crear partida».
- WF-02: información a la izquierda y aforo/acción a la derecha; solicitudes del organizador pueden ocupar la segunda columna.
- WF-03: formulario centrado con ancho de lectura moderado, aún en una sola secuencia.
- WF-04: tarjetas en cuadrícula dentro de los mismos dos segmentos.
- WF-05: perfil en un contenedor centrado; no se añaden módulos sociales para llenar espacio.

El orden de lectura, los estados y las acciones se conservan respecto al móvil.
