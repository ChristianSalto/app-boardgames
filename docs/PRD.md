# PRD — Plataforma de partidas de juegos de mesa

## Estado del documento

- **Fase:** 0 — Foundation
- **Estado:** aprobada tras revisión humana; Fase 0 completada
- **Referencia de alcance:** `MVP.md`
- **Naturaleza:** definición inicial basada en hipótesis; requiere validación con usuarios.

## Contexto

Se plantea una aplicación web SPA especializada en juegos de mesa. La visión futura incluye funciones sociales, perfiles, colecciones e intercambio, pero el primer producto debe concentrarse en conectar jugadores mediante partidas y quedadas.

Tecnologías ya decididas para fases posteriores:

- frontend SPA con React, TypeScript y Vite;
- Firebase como BaaS, previsiblemente Authentication, Cloud Firestore, Hosting, Emulator Suite y Storage solo cuando sea necesario;
- TypeScript en modo estricto, CSS con ITCSS, diseño *mobile first* y accesibilidad WCAG 2.2 AA.

Estas decisiones no autorizan su configuración o implementación durante la Fase 0.

## Problema

La persona quiere jugar a juegos de mesa, pero le cuesta encontrar gente con quien jugar. Todavía no existe evidencia suficiente para atribuir la dificultad a una única causa. El MVP probará si una oferta visible de partidas y un flujo sencillo para organizarlas y participar mejora esa situación.

## Objetivos

- Permitir descubrir partidas relevantes por juego, fecha y ciudad o zona.
- Permitir publicar una partida con la información mínima para que otras personas decidan participar.
- Permitir solicitar participación, gestionarla mediante aceptación o rechazo del organizador y hacer visible quién está confirmado.
- Permitir a cada persona consultar las partidas que organiza o en las que participa.
- Aprender qué fricciones impiden pasar de la intención de jugar a una participación acordada.
- Proteger privacidad, accesibilidad y simplicidad desde el diseño.

## No objetivos

- Construir una red social generalista o maximizar interacción social no vinculada a partidas.
- Resolver compraventa, intercambio, pagos o logística de juegos.
- Ofrecer comunicación en tiempo real.
- Crear sistemas de reputación, reseñas, recomendación algorítmica o gamificación.
- Gestionar clubes, tiendas o comunidades complejas.
- Rastrear al usuario, usar geolocalización continua o GPS en tiempo real, o publicar innecesariamente una ubicación precisa.
- Optimizar todavía monetización, crecimiento viral o métricas comerciales no validadas.

## Usuarios iniciales

### Jugador que busca partida

Quiere localizar una oportunidad compatible por juego, fecha y zona, entender sus condiciones y obtener una plaza.

### Organizador de partida

Quiere publicar una quedada, cubrir plazas y consultar quién participará sin una gestión compleja.

Una misma persona puede adoptar ambos roles. La segmentación por experiencia, frecuencia o tamaño de ciudad es una hipótesis pendiente de investigación.

## User stories principales

- Como jugador, quiero crear un perfil básico para presentarme e identificar mis partidas.
- Como jugador, quiero consultar partidas disponibles para saber qué opciones tengo.
- Como jugador, quiero filtrar partidas por criterios esenciales para reducir opciones irrelevantes.
- Como jugador, quiero ver el detalle de una partida para decidir si me encaja.
- Como organizador, quiero crear una partida indicando juego, fecha y hora, ciudad o zona y aforo máximo para encontrar participantes.
- Como jugador, quiero solicitar una plaza y conocer si está pendiente o aceptada para no confundir una solicitud con una participación confirmada.
- Como participante u organizador, quiero consultar la lista de participantes para conocer el estado de la partida.
- Como jugador, quiero consultar las partidas que organizo o en las que participo para gestionarlas desde un único lugar.

## Requisitos funcionales del MVP 1

### RF-01 — Identidad y perfil básico

El sistema permitirá disponer de una identidad de usuario y crear o editar un perfil básico. Los campos obligatorios y el método de acceso son decisiones pendientes; se aplicará minimización de datos.

### RF-02 — Listado de partidas

El sistema mostrará partidas disponibles con información suficiente para diferenciarlas: juego, fecha y hora, ciudad, zona, distrito o granularidad equivalente, plazas/aforo y estado relevante. Como definición inicial, una partida disponible es futura, no está cancelada y tiene plazas disponibles; esta definición podrá evolucionar.

### RF-03 — Búsqueda y filtros

El jugador podrá reducir el listado al menos por juego, fecha y ciudad, zona, distrito o granularidad equivalente. En el prototipo, Madrid será el contexto fijo y los únicos filtros serán juego, fecha y zona/distrito; no habrá selector de ciudad. La futura ampliación multi-ciudad no debe quedar bloqueada.

### RF-04 — Detalle de partida

El sistema mostrará los datos publicados de la partida, el estado de plazas, la persona organizadora y los participantes que la política de privacidad permita mostrar.

### RF-05 — Creación de partida

Una persona identificada podrá crear una partida indicando, como mínimo:

- juego;
- fecha y hora;
- ciudad, zona, distrito o granularidad equivalente;
- número máximo de jugadores.

En el MVP 1, el juego queda indicado al crear la partida. Esto no establece una obligación para todos los posibles modelos de quedada POST-MVP. El organizador cuenta dentro del aforo total: una partida con aforo de cuatro personas comienza con un organizador y tres plazas disponibles. En el prototipo, Madrid se muestra como contexto fijo y el usuario selecciona únicamente zona o distrito; no introduce otra ciudad. Las validaciones temporales, edición, cancelación y datos opcionales requieren definición antes del desarrollo del vertical slice.

### RF-06 — Participación

Una persona identificada podrá solicitar participación. La solicitud quedará pendiente hasta que el organizador la acepte o rechace, o hasta que la partida complete su aforo antes de confirmarla. Solo una aceptación convierte al solicitante en participante confirmado; el sistema impedirá superar el aforo y mostrará los resultados de forma inequívoca. Si se completa el aforo, ninguna solicitud inviable permanecerá pendiente y se explicará que no llegó a confirmarse por falta de plazas, sin implicar rechazo personal. El MVP no incluye lista de espera.

### RF-07 — Participantes

El sistema permitirá consultar participantes confirmados. El organizador podrá consultar por separado las solicitudes pendientes y aceptar o rechazar cada una con visibilidad adecuada al rol. Cuando una aceptación complete el aforo, las restantes dejarán de ser pendientes; la denominación técnica de ese resultado se decidirá en una fase posterior.

### RF-08 — Partidas propias

Una misma cuenta podrá organizar partidas y participar en partidas creadas por otras personas. El usuario podrá consultar por separado o distinguir ambas clases de partida.

## Requisitos no funcionales

- **Arquitectura:** Screaming Architecture y Clean Architecture; dominio independiente de React, Firebase, Firestore y APIs externas.
- **Diseño de código:** programación funcional, inmutabilidad, dependencias explícitas y efectos confinados; KISS antes que abstracciones prematuras y DRY aplicado a conocimiento realmente duplicado.
- **Plataforma:** SPA responsive con estrategia *mobile first*.
- **Accesibilidad:** objetivo WCAG 2.2 AA, incluyendo teclado, foco, semántica, contraste y errores comprensibles.
- **Seguridad:** autenticación para acciones personales, autorización por mínimo privilegio, validación en límites confiables y reglas Firebase probadas cuando se implemente.
- **Privacidad:** recoger solo los datos necesarios. El descubrimiento público utilizará ciudad, zona, distrito o granularidad equivalente y excluirá *tracking*, geolocalización continua, GPS en tiempo real y publicación innecesaria de ubicación precisa. Un punto o dirección concreta de encuentro podrá existir posteriormente si el flujo lo requiere, con visibilidad controlada y acceso solo cuando sea necesario; ese flujo aún no está diseñado.
- **Calidad:** TypeScript estricto y pruebas proporcionales al riesgo en dominio, integración e interfaz.
- **Rendimiento:** la experiencia debe ser razonablemente fluida en móvil; los presupuestos cuantitativos se definirán cuando exista prototipo y medición base.
- **Compatibilidad:** navegadores y dispositivos soportados quedan pendientes de definición antes de implementar UI productiva.
- **Idioma:** código futuro en inglés y documentación del proyecto en español.

## Alcance del MVP 1

El MVP 1 cubre el recorrido desde una identidad con perfil básico hasta encontrar o crear una partida, participar y consultar las partidas propias. Mantiene el descubrimiento público deliberadamente simple mediante ciudad, zona, distrito o granularidad equivalente. La descripción precisa de alcance y sus guardas está en `MVP.md`.

## Fuera de alcance

- feed, seguidores y amistades complejas;
- chat en tiempo real;
- reputación y reviews;
- clubes y tiendas;
- recomendaciones mediante IA;
- gamificación;
- colección avanzada e intercambio de juegos;
- pagos y notificaciones push;
- mapas, *tracking*, geolocalización continua, GPS en tiempo real o publicación innecesaria de ubicación precisa;
- cualquier función social no imprescindible para completar el flujo principal.

## Criterios generales de éxito

No se fijan cifras comerciales sin una línea base. El MVP se considerará prometedor si la validación aporta evidencia de que usuarios objetivo pueden:

- comprender la propuesta y completar los flujos críticos sin asistencia material;
- encontrar una partida que consideren relevante o publicar una nueva;
- alcanzar un estado de participación entendido por organizador y jugador;
- identificar claramente cuándo, dónde a nivel de zona y a qué se jugará;
- usar los flujos críticos en móvil y con las necesidades de accesibilidad contempladas;
- expresar que el producto reduce una fricción real frente a su forma actual de organizarse.

Antes del lanzamiento de validación se definirá un plan de medición con eventos, muestra, periodo y umbrales. Hasta entonces estos criterios son cualitativos y no equivalen a resultados obtenidos.

## Riesgos

- **Mercado vacío:** pocas partidas visibles reducen el valor para los primeros usuarios.
- **Densidad local:** la utilidad depende de coincidencias geográficas y temporales.
- **Confianza y seguridad:** encontrarse con desconocidos puede frenar la participación; el MVP necesita medidas proporcionadas sin construir reputación completa.
- **Privacidad:** información de zona, perfil y asistencia puede revelar hábitos si se diseña mal.
- **Abandono y plazas desactualizadas:** cancelaciones o ausencias pueden deteriorar la confianza.
- **Confusión de participación:** si solicitud pendiente y confirmación no se distinguen claramente, pueden generarse expectativas incorrectas.
- **Catálogo de juegos:** una fuente externa puede introducir dependencia, licencias, calidad de datos o complejidad prematura.
- **Expansión de alcance:** funciones sociales atractivas pueden desplazar la validación del problema principal.

## Decisiones iniciales aceptadas

- **Aforo:** el organizador cuenta dentro del aforo total. Con aforo de cuatro personas, existe inicialmente un organizador y tres plazas disponibles.
- **Rol del usuario:** una misma cuenta puede organizar partidas y participar en partidas organizadas por otras personas.
- **Partida disponible:** inicialmente es una partida futura, no cancelada y con plazas disponibles. La definición podrá evolucionar con nueva evidencia.
- **Datos de juegos en el prototipo:** se podrán utilizar juegos y datos simulados durante la Fase 2; no es necesario integrar entonces un catálogo externo.
- **Contexto geográfico del prototipo:** Madrid es fijo y preseleccionado. Explorar muestra partidas de Madrid y Crear permite elegir solo zona/distrito; no existe selector de ciudad. Esto no limita la arquitectura futura a Madrid.
- **Participación:** solicitar una plaza crea una solicitud pendiente. El organizador acepta o rechaza; solo la aceptación confirma al participante. Las solicitudes pendientes no cuentan dentro del aforo confirmado.
- **Cierre por aforo:** cuando una aceptación ocupa la última plaza, la partida queda completa, sale de Explorar y las demás solicitudes dejan de estar pendientes con una explicación de falta de plazas. No existe lista de espera ni se decide todavía el nombre técnico de este resultado.

## Hipótesis iniciales

Estas hipótesis guían el diseño, pero no son decisiones validadas:

- Ciudad o zona ofrece precisión suficiente para evaluar una partida antes de acordar detalles por otros medios.
- Juego, fecha/hora, zona y aforo son los datos mínimos útiles para publicar.

## Preguntas abiertas y recomendación provisional

1. **¿Quién es el usuario inicial más urgente dentro del contexto conceptual de Madrid?** Recomendación: entrevistar tanto a buscadores como a organizadores y priorizar según evidencia.
2. **¿Qué datos forman el perfil básico y cuáles son públicos?** Recomendación: comenzar con nombre visible y zona general; añadir solo lo respaldado por un flujo o riesgo concreto.
3. **¿Qué método de autenticación se usará?** Recomendación: elegir en la fase de arquitectura/Firebase según fricción, privacidad y población piloto.
4. **¿Cómo se gestionan edición, cancelación, abandono de una participación confirmada, retirada voluntaria de una solicitud, partidas pasadas y ausencias?** Recomendación: definir el ciclo de vida mínimo antes del primer vertical slice, sin crear un sistema de reputación.
5. **¿Qué catálogo externo, si alguno, se necesitará después del prototipo?** Recomendación: evaluar fuente, licencia y necesidad antes de integrar servicios externos; la Fase 2 usará datos simulados.
6. **¿Qué granularidad y vocabulario se usarán para ciudad, zona o distrito?** Recomendación: texto o selección general normalizada para descubrimiento, sin geolocalización continua ni coordenadas públicas.
7. **¿Cómo y cuándo se compartirá un punto concreto de encuentro sin chat en tiempo real?** Recomendación: investigarlo en los flujos y escoger el mecanismo mínimo, con visibilidad controlada, privacidad y acceso solo cuando sea necesario.
8. **¿Qué medidas mínimas de confianza, bloqueo, denuncia o moderación son imprescindibles para una prueba con usuarios?** Recomendación: realizar evaluación de riesgos antes de pruebas externas; no asumir que estar fuera del núcleo funcional elimina la obligación de seguridad.
9. **¿Qué navegadores, idiomas de interfaz y requisitos legales/regionales se aplican al piloto?** Recomendación: decidirlos antes de producción en función de la audiencia real.
10. **¿Qué evidencia y umbrales permitirán considerar validado el problema?** Recomendación: definir el plan después de investigación inicial y antes de probar el prototipo, sin inventar métricas retrospectivas.
