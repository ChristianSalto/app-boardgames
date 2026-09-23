# Alcance del MVP

## Propósito

El MVP 1 valida una sola apuesta: si facilitar el descubrimiento, la creación y la participación en partidas ayuda a personas que quieren jugar pero no encuentran con quién. La Fase 6 incorpora una segunda apuesta acotada: si la misma comunidad obtiene valor al publicar y descubrir juegos en venta o intercambio sin convertir Mesa Abierta en una plataforma de comercio electrónico. La Fase 7 incorpora reviews mínimas entre personas que compartieron una partida para reducir incertidumbre al quedar. Las partidas conservan prioridad funcional y visual.

## MVP 1

### Perfil e identidad básicos

- Disponer de una identidad para realizar acciones personales.
- Crear y consultar un perfil mínimo, con campos y visibilidad aún por decidir.
- Una misma cuenta puede organizar partidas y participar en partidas creadas por otras personas.
- Mostrar reputación subjetiva separada de fiabilidad factual. La Fase 7 sustituirá progresivamente las reviews simuladas por reviews elegibles vinculadas a partidas.

### Trust & Reputation MVP

El prototipo validó que confianza y fiabilidad deben presentarse por separado. La Fase 7 aprueba el primer sistema real de reviews para personas y partidas:

- puntuación entera de 1 a 5 y comentario opcional;
- autor y persona valorada identificados mediante su Player público;
- referencia a la partida y fecha de publicación;
- ambos confirmados en la misma partida pasada y no cancelada;
- organizador y participantes pueden valorarse entre sí, excepto a sí mismos;
- una review por autor, persona valorada y partida;
- review inmutable y no eliminable por el autor desde el flujo normal;
- media y recuento derivados, no editables por el cliente.

Un Player sin reviews se presenta como «Nuevo en Mesa Abierta», no con cero estrellas. Attendance/no-show se mantiene fuera de este incremento porque no existe todavía un mecanismo justo de verificación y disputa. La fiabilidad indicará que no hay datos verificados y no utilizará porcentajes ni un score inventado. `TRUST_REPUTATION_PRODUCT.md` contiene la política completa.

### Descubrimiento de partidas

- Consultar partidas disponibles, entendidas inicialmente como futuras, no canceladas y con plazas disponibles.
- Buscar o filtrar por juego, fecha y ciudad, zona, distrito o granularidad equivalente.
- Consultar detalle con juego, fecha/hora, zona, lugar cuando proceda, aforo/plazas, organizador y participantes según privacidad.
- Durante el prototipo, consultar únicamente Madrid y filtrar solo por juego, fecha y zona/distrito; Madrid no será un filtro editable.

### Organización

- Crear una partida.
- Indicar juego, fecha y hora, ciudad, zona, distrito o granularidad equivalente, y número máximo de jugadores.
- Durante el prototipo, mostrar Madrid como contexto fijo y seleccionar únicamente zona o distrito, sin entrada libre o selector de ciudad.
- Durante el prototipo, permitir un nombre de lugar opcional, separado de zona y descripción, para validar la interfaz sin exigir una dirección postal.
- Contar al organizador dentro del aforo total; con aforo de cuatro personas habrá inicialmente un organizador y tres plazas disponibles.
- Consultar las partidas organizadas por el usuario.

### Participación

- Solicitar participación y mantenerla pendiente hasta la decisión del organizador.
- Permitir al organizador aceptar o rechazar solicitudes.
- Convertir al solicitante en participante confirmado únicamente tras la aceptación.
- Mantener las solicitudes pendientes fuera del recuento de participantes confirmados.
- Cuando una aceptación complete el aforo, cerrar las demás solicitudes pendientes por falta de plazas y comunicarlo sin implicar rechazo personal.
- No mantener solicitudes pendientes sin posibilidad de plaza y no introducir lista de espera.
- Evitar superar el número máximo de jugadores.
- Consultar participantes y estado de participación.
- Consultar partidas en las que el usuario participa.

### Localización inicial y privacidad

El descubrimiento público se limita inicialmente a ciudad, zona, distrito o granularidad equivalente. En el prototipo, Madrid será el contexto fijo y preseleccionado; el usuario trabajará únicamente con sus zonas o distritos. No habrá selector de ciudad ni multi-ciudad real, pero la ampliación futura no debe quedar bloqueada. El MVP 1 no usa mapas, *tracking*, geolocalización continua ni GPS en tiempo real, y no publica ubicación precisa de forma innecesaria.

El prototipo puede mostrar nombres simulados de locales o puntos reconocibles para validar la diferencia entre zona y lugar. Un punto o dirección concreta real solo podrá incorporarse si el flujo demuestra que es necesario, siempre con minimización de datos, visibilidad controlada, privacidad y acceso solo cuando corresponda. La política definitiva y cualquier mecanismo de geolocalización no se diseñan en esta fase.

## Marketplace MVP — Juegos de la comunidad

### Propósito y prioridad

El Marketplace permite que un Player publique un juego que quiera vender o intercambiar y que otras personas de la comunidad lo descubran. Complementa el encuentro alrededor del hobby, pero no sustituye ni compite con el objetivo principal de encontrar gente con quien jugar.

En Explorar, las partidas aparecen primero. «Juegos de la comunidad» es un bloque secundario con pocas publicaciones recientes y un enlace «Ver todos» al listado completo.

### Modalidades

- **Venta:** requiere un precio positivo expresado en euros durante el piloto.
- **Intercambio:** no requiere precio. Las preferencias concretas pueden explicarse en la descripción; no se añaden todavía `wantedGame` ni `tradeNotes` estructurados.

El alquiler queda preparado como posible evolución, pero permanece fuera porque exigiría disponibilidad temporal, depósitos, devoluciones, daños y penalizaciones.

La condición usa inicialmente cuatro opciones comprensibles: «Precintado», «Como nuevo», «Buen estado» y «Usado / con señales». Cualquier pieza ausente o defecto relevante debe explicarse en la descripción; no se crea una taxonomía más detallada.

### GameListing mínimo

- `id`;
- `ownerId`;
- `gameName`;
- `image`: una imagen representativa;
- `description`;
- `condition`: condición seleccionada de una lista breve y comprensible;
- `listingType`: `sale` o `trade`;
- `price`, únicamente para venta;
- `city`, con Madrid como contexto actual;
- `district`;
- `status`: `active` o `closed`;
- `createdAt`.

No se añaden galería, editorial o versión del juego, idioma, SKU, envío, moneda configurable ni campos comerciales. La descripción debe explicar preferencias de intercambio y cualquier defecto o ausencia relevante.

Los campos introducidos por el propietario son obligatorios salvo `price`, que solo existe y es obligatorio en venta. `id`, `ownerId`, `status` y `createdAt` se asignan por el sistema.

### Ciclo de vida

- El propietario crea un anuncio `active` y puede consultarlo o editarlo.
- Puede cerrarlo cuando el juego deje de estar disponible; pasa a `closed`, sale del descubrimiento y conserva historial.
- No existe hard-delete desde la experiencia normal.
- No existe `reserved`: expresar o aceptar interés no bloquea el anuncio ni garantiza una operación.
- Reabrir un anuncio cerrado queda fuera del primer alcance; podrá evaluarse si aporta valor real.

### Descubrimiento y detalle

- Explorar muestra pocas publicaciones activas y recientes después de las partidas.
- En móvil se usa una lista compacta de pocos elementos para conservar lectura y acceso por teclado; en desktop puede evolucionar a una cuadrícula reducida.
- «Ver todos» abre un listado completo ordenado inicialmente por publicación reciente.
- Los controles máximos previstos son búsqueda por juego, modalidad y zona; solo se incorporarán si el volumen los justifica.
- La card muestra imagen, juego, condición, modalidad, precio si corresponde y Madrid + zona.
- El detalle muestra además descripción, propietario, enlace a su perfil, fecha de publicación y estado. No expone ubicación exacta, email ni teléfono.

### «Me interesa» sin chat

Se recomienda crear un concepto mínimo y privado de interés asociado a un anuncio:

1. una persona identificada pulsa «Me interesa»;
2. el sistema registra una única señal activa para esa persona y anuncio;
3. el propietario ve la persona interesada y su perfil desde «Mis anuncios»;
4. el propietario acepta o declina;
5. ambos ven un resultado inequívoco.

La aceptación representa disposición mutua a continuar, no compra, reserva ni transferencia. No revela credenciales de Firebase ni datos de contacto, y no crea mensajería privada global. El MVP valida descubrimiento e intención; el canal seguro para coordinar la operación deberá decidirse antes de una prueba pública si esta señal resulta insuficiente.

### Mis anuncios

La gestión vive inicialmente como subsección del Perfil propio. Desde allí se crean, consultan, editan y cierran anuncios, y se revisan intereses recibidos. Marketplace no añade un destino permanente a la navegación principal; el listado completo se alcanza desde «Ver todos» en Explorar y puede ofrecer un acceso contextual a publicar o gestionar.

### Nomenclatura conceptual

El nombre recomendado para la capability es **`game-listings`**. Describe el objeto y sus responsabilidades actuales —anuncios de juegos— mejor que `marketplace`, que puede convertirse en un contenedor genérico de pagos, comercios, logística o promociones. «Marketplace» puede mantenerse como nombre de iniciativa y «Juegos de la comunidad» como etiqueta visible. Esta decisión no prescribe todavía carpetas, capas ni APIs; eso corresponde a 007B.

### Fuera del Marketplace MVP

- pagos, billing, comisiones y protección del comprador;
- envíos, seguimiento, entrega gestionada y logística;
- reservas, depósitos, alquiler, devoluciones, daños y penalizaciones;
- negociación, ofertas, contraofertas, subastas y chat privado global;
- favoritos y alertas;
- reviews específicas de compraventa;
- anuncios destacados, promociones, tiendas, clubes y perfiles comerciales;
- galería de imágenes, catálogo externo obligatorio y valoración automática del juego;
- disputas y un sistema completo de moderación.

Las medidas mínimas de contenido, denuncia, privacidad y seguridad necesarias para una prueba pública deberán decidirse antes de exponer anuncios reales a usuarios externos.

## Guardas contra ampliación accidental

Una capacidad no entra en el MVP por ser técnicamente fácil, habitual en otras plataformas o útil para una futura red social. Para incorporarla debe:

1. resolver un bloqueo demostrado del flujo principal;
2. contar con decisión explícita de `ProductManagerAgent` y revisión humana;
3. actualizar PRD, este documento, riesgos y criterios de aceptación antes de implementarse.

Los detalles habilitadores —por ejemplo autenticación y ciclo de vida de una partida— se mantendrán en su forma mínima. La partida permite edición por su organizador y cancelación sin borrado físico; abandonos, retirada de solicitudes y ausencias siguen diferidos. No deben convertirse en productos paralelos.

## Posibles evoluciones posteriores al MVP 1

Sujetas a evidencia, priorización y una fase propia:

- enriquecer perfiles y preferencias de jugadores;
- gestionar colecciones personales de juegos;
- mejorar coordinación antes o después de una partida;
- listas de espera, recurrencia o invitaciones;
- mecanismos avanzados de confianza, attendance, moderación y seguridad;
- descubrimiento más avanzado por intereses o compatibilidad;
- comunidades, clubes o soporte a tiendas;
- funciones sociales especializadas;
- alquiler, intercambio avanzado y operación profesional del Marketplace.

Esta lista conserva la visión, pero no constituye backlog aprobado.

## Fuera del alcance actual

- feed social;
- seguidores;
- sistema complejo de amigos;
- listas de espera;
- chat en tiempo real;
- attendance/no-show público, score único de confianza y cálculo productivo de fiabilidad;
- categorías múltiples de review, gamificación, rankings, respuestas públicas y moderación completa;
- reputación específica de compraventa, intercambio o tiendas;
- clubes y tiendas;
- recomendaciones mediante IA;
- gamificación;
- gestión avanzada de colecciones;
- alquiler y funciones de compraventa/intercambio no incluidas en el Marketplace MVP;
- pagos;
- notificaciones push;
- mapas, *tracking*, geolocalización continua, GPS en tiempo real y publicación innecesaria de ubicación precisa;
- integraciones externas no necesarias para validar los flujos del MVP.

## Decisiones pendientes antes de implementar

- usuario prioritario dentro del contexto conceptual de Madrid;
- contenido y visibilidad del perfil básico;
- método de autenticación;
- ciclo de vida de la partida más allá de edición, cancelación y la definición inicial de disponibilidad;
- fuente de catálogo externo, si resulta necesaria después del prototipo con datos simulados;
- forma y momento de compartir un punto concreto de encuentro con visibilidad controlada;
- medidas mínimas de seguridad/moderación para pruebas con usuarios;
- condiciones de producción para Trust & Reputation aún no resueltas: reporte, ocultación, moderación, disputas, derecho de réplica, eliminación de cuenta y privacidad legal;
- mecanismo verificable para attendance/no-show, si llega a incorporarse;
- plan de medición de la validación.
- suficiencia de «Me interesa» sin un canal posterior, y mecanismo seguro de coordinación si fuese necesario;
- política mínima de imágenes, contenido permitido, denuncia y moderación del Marketplace;
- taxonomía definitiva de condición y necesidad de preferencias de intercambio estructuradas.

Las recomendaciones provisionales están en la sección de preguntas abiertas del PRD. Ninguna de estas decisiones autoriza funciones sociales adicionales.
