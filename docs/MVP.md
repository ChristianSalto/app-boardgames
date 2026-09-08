# Alcance del MVP

## Propósito

El MVP 1 valida una sola apuesta: si facilitar el descubrimiento, la creación y la participación en partidas ayuda a personas que quieren jugar pero no encuentran con quién. No pretende validar todavía una red social completa ni el intercambio de juegos.

## MVP 1

### Perfil e identidad básicos

- Disponer de una identidad para realizar acciones personales.
- Crear y consultar un perfil mínimo, con campos y visibilidad aún por decidir.
- Una misma cuenta puede organizar partidas y participar en partidas creadas por otras personas.

### Descubrimiento de partidas

- Consultar partidas disponibles, entendidas inicialmente como futuras, no canceladas y con plazas disponibles.
- Buscar o filtrar por juego, fecha y ciudad, zona, distrito o granularidad equivalente.
- Consultar detalle con juego, fecha/hora, zona, aforo/plazas, organizador y participantes según privacidad.
- Durante el prototipo, consultar únicamente Madrid y filtrar solo por juego, fecha y zona/distrito; Madrid no será un filtro editable.

### Organización

- Crear una partida.
- Indicar juego, fecha y hora, ciudad, zona, distrito o granularidad equivalente, y número máximo de jugadores.
- Durante el prototipo, mostrar Madrid como contexto fijo y seleccionar únicamente zona o distrito, sin entrada libre o selector de ciudad.
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

Un punto o dirección concreta de encuentro podrá incorporarse posteriormente si el flujo demuestra que es necesario, siempre con minimización de datos, visibilidad controlada, privacidad y acceso solo cuando corresponda. Ese flujo, su UI y cualquier mecanismo de geolocalización no se diseñan en esta fase.

## Guardas contra ampliación accidental

Una capacidad no entra en el MVP por ser técnicamente fácil, habitual en otras plataformas o útil para una futura red social. Para incorporarla debe:

1. resolver un bloqueo demostrado del flujo principal;
2. contar con decisión explícita de `ProductManagerAgent` y revisión humana;
3. actualizar PRD, este documento, riesgos y criterios de aceptación antes de implementarse.

Los detalles habilitadores —por ejemplo autenticación y ciclo de vida de una partida— se mantendrán en su forma mínima. No deben convertirse en productos paralelos.

## Posibles evoluciones posteriores al MVP 1

Sujetas a evidencia, priorización y una fase propia:

- enriquecer perfiles y preferencias de jugadores;
- gestionar colecciones personales de juegos;
- mejorar coordinación antes o después de una partida;
- listas de espera, recurrencia o invitaciones;
- mecanismos proporcionados de confianza, moderación y seguridad;
- descubrimiento más avanzado por intereses o compatibilidad;
- comunidades, clubes o soporte a tiendas;
- funciones sociales especializadas;
- intercambio de juegos.

Esta lista conserva la visión, pero no constituye backlog aprobado.

## Fuera del alcance actual

- feed social;
- seguidores;
- sistema complejo de amigos;
- listas de espera;
- chat en tiempo real;
- reputación y reviews;
- clubes y tiendas;
- recomendaciones mediante IA;
- gamificación;
- gestión avanzada de colecciones;
- intercambio de juegos;
- pagos;
- notificaciones push;
- mapas, *tracking*, geolocalización continua, GPS en tiempo real y publicación innecesaria de ubicación precisa;
- integraciones externas no necesarias para validar los flujos del MVP.

## Decisiones pendientes antes de implementar

- usuario prioritario dentro del contexto conceptual de Madrid;
- contenido y visibilidad del perfil básico;
- método de autenticación;
- ciclo de vida de la partida más allá de la definición inicial de disponibilidad;
- fuente de catálogo externo, si resulta necesaria después del prototipo con datos simulados;
- forma y momento de compartir un punto concreto de encuentro con visibilidad controlada;
- medidas mínimas de seguridad/moderación para pruebas con usuarios;
- plan de medición de la validación.

Las recomendaciones provisionales están en la sección de preguntas abiertas del PRD. Ninguna de estas decisiones autoriza funciones sociales adicionales.
