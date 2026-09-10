# Visión del producto

## Problema

La hipótesis principal del producto es:

> «Quiero jugar a juegos de mesa, pero me cuesta encontrar gente con quien jugar».

La primera validación debe comprobar si facilitar el descubrimiento, la creación y la participación en partidas reduce esa dificultad. No se presupone todavía qué causa concreta —disponibilidad, afinidad de juegos, distancia, confianza u organización— pesa más; debe investigarse.

## Visión

Crear una plataforma social especializada en juegos de mesa donde las personas puedan encontrar jugadores, organizar partidas y mantener relaciones alrededor de sus intereses lúdicos. La plataforma podrá evolucionar hacia perfiles, colecciones, intercambio y funciones sociales, pero crecerá desde un núcleo útil y validado: conseguir que una persona llegue a una partida adecuada.

## Usuarios objetivo iniciales

- Personas aficionadas que quieren jugar y no disponen de un grupo estable.
- Jugadores que tienen grupo, pero necesitan completar plazas u organizar nuevas sesiones.
- Personas que organizan partidas informales en su ciudad o zona.

Quedan por validar diferencias relevantes entre jugadores nuevos y experimentados, organizadores ocasionales y recurrentes, y contextos urbanos de distinto tamaño.

## Propuesta de valor

Permitir que un jugador encuentre o publique una partida cercana en contexto, comprenda cuándo y a qué se jugará, disponga de señales suficientes para decidir si le inspira confianza, solicite una plaza y conozca claramente si sigue pendiente o ha sido aceptada, con el mínimo esfuerzo y sin publicar innecesariamente una ubicación precisa.

Para quien organiza, ofrecer una forma sencilla de publicar los datos esenciales y conocer las personas participantes.

## Hipótesis prioritaria de confianza

Quedar físicamente con personas desconocidas puede ser una fricción central del problema. Durante el prototipo se validará si mostrar señales simuladas ayuda a decidir con mayor confianza, distinguiendo:

- **reputación:** valoraciones y opiniones subjetivas de personas con las que se ha compartido una partida;
- **fiabilidad:** información de comportamiento observable o derivada, como partidas jugadas, asistencias y ausencias sin aviso.

Esta exploración no equivale a aprobar un sistema productivo de reputación. No se definen todavía cálculo, publicación, moderación, fraude, disputas, privacidad definitiva ni persistencia. Como principio provisional, una futura valoración solo podría emitirse tras una partida finalizada entre personas que hubieran estado confirmadas en ella.

## Horizonte del producto

### Corto plazo

Validar el núcleo de coordinación de partidas: perfil básico, consulta y búsqueda de partidas, detalle, creación, participación, participantes y partidas propias.

### Medio plazo

Si el núcleo demuestra utilidad, mejorar recurrencia y confianza mediante perfiles más completos, colecciones de juegos y mecanismos de coordinación que respondan a evidencia real de uso. Cada incorporación requiere una decisión de alcance propia.

### Largo plazo

Evolucionar hacia una red social especializada que conecte a personas por juegos e intereses y pueda cubrir comunidades, descubrimiento, colecciones e intercambio sin diluir la utilidad principal.

## Capacidades potenciales futuras

Estas capacidades pertenecen a la visión, no al MVP 1:

- feed social y seguidores;
- relaciones de amistad complejas;
- chat en tiempo real;
- sistema productivo de reputación y reseñas;
- clubes, tiendas y comunidades organizadas;
- recomendaciones mediante IA;
- gamificación;
- gestión avanzada de colecciones;
- intercambio de juegos;
- pagos;
- notificaciones push;
- decisión colectiva del juego en una quedada: proponer uno o varios juegos, expresar votos o preferencias y seleccionar finalmente el juego;
- herramientas de localización avanzadas, solo si se justifican y aprueban expresamente.

Su presencia aquí evita perder la dirección a largo plazo, pero no constituye compromiso de implementación ni prioridad. La decisión colectiva del juego es exclusivamente POST-MVP: todavía no se definen algoritmo, desempates, datos, UI, casos de uso ni arquitectura. Su inclusión evita asumir que toda futura quedada deba tener un juego definitivo al crearla; no cambia el requisito del MVP 1 de indicar el juego de cada partida.

## Principios de producto

- **Resolver primero el encuentro:** toda prioridad inicial debe ayudar a encontrar, crear o completar una partida.
- **Aprender antes de ampliar:** una función nueva necesita un problema observado y una hipótesis validable.
- **Simplicidad operativa:** publicar y unirse deben exigir únicamente la información necesaria.
- **Privacidad desde el diseño:** el descubrimiento público usa inicialmente ciudad, zona, distrito o granularidad equivalente. No se contempla *tracking*, geolocalización continua, GPS en tiempo real ni publicación innecesaria de ubicación precisa. Un punto de encuentro concreto podría incorporarse posteriormente si fuese necesario, con minimización, visibilidad controlada y acceso restringido al momento y personas adecuados.
- **Inclusión:** experiencia accesible conforme a WCAG 2.2 AA y usable desde móvil.
- **Confianza progresiva:** validar primero si reputación subjetiva y fiabilidad observable aportan información útil; cualquier mecanismo real de seguridad o reputación deberá ser proporcional a riesgos observados y no convierte el MVP en una red social completa.
- **Transparencia:** distinguir plazas, condiciones y estado de participación con lenguaje claro.
- **Alcance protegido:** las posibilidades futuras no entran accidentalmente en el MVP.
