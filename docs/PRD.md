# PRD — Plataforma de partidas de juegos de mesa

## Estado del documento

- **Fase:** 0 — Foundation
- **Estado:** baseline aprobada; extensión Marketplace de Fase 6 en revisión
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
- Validar si señales diferenciadas de reputación y fiabilidad ayudan a decidir quedar con personas desconocidas.
- Validar si publicar y descubrir juegos de la comunidad aporta valor como segundo eje sin reducir la prioridad de las partidas.
- Proteger privacidad, accesibilidad y simplicidad desde el diseño.

## No objetivos

- Construir una red social generalista o maximizar interacción social no vinculada a partidas.
- Construir una plataforma de comercio electrónico completa, procesar pagos o resolver logística de compraventa e intercambio.
- Ofrecer comunicación en tiempo real.
- Construir un sistema productivo de reputación, publicación de reseñas, recomendación algorítmica o gamificación. El prototipo solo representa señales simuladas para validar la hipótesis de confianza.
- Gestionar clubes, tiendas o comunidades complejas.
- Rastrear al usuario, usar geolocalización continua o GPS en tiempo real, o publicar innecesariamente una ubicación precisa.
- Optimizar todavía monetización, crecimiento viral o métricas comerciales no validadas.

## Usuarios iniciales

### Jugador que busca partida

Quiere localizar una oportunidad compatible por juego, fecha y zona, entender sus condiciones y obtener una plaza.

### Organizador de partida

Quiere publicar una quedada, cubrir plazas y consultar quién participará sin una gestión compleja.

Una misma persona puede adoptar ambos roles. La segmentación por experiencia, frecuencia o tamaño de ciudad es una hipótesis pendiente de investigación.

### Miembro que publica o busca un juego

Como extensión secundaria, una persona de la comunidad puede ofrecer un juego en venta o intercambio, o descubrir anuncios de otras personas. Este rol no desplaza al jugador ni al organizador y no presupone una actividad comercial profesional.

## User stories principales

- Como jugador, quiero crear un perfil básico para presentarme e identificar mis partidas.
- Como jugador, quiero consultar partidas disponibles para saber qué opciones tengo.
- Como jugador, quiero filtrar partidas por criterios esenciales para reducir opciones irrelevantes.
- Como jugador, quiero ver el detalle de una partida para decidir si me encaja.
- Como jugador, quiero consultar señales comprensibles sobre quien organiza para valorar si me inspira confianza antes de solicitar plaza.
- Como organizador, quiero crear una partida indicando juego, fecha y hora, ciudad o zona y aforo máximo para encontrar participantes.
- Como jugador, quiero solicitar una plaza y conocer si está pendiente o aceptada para no confundir una solicitud con una participación confirmada.
- Como participante u organizador, quiero consultar la lista de participantes para conocer el estado de la partida.
- Como jugador, quiero consultar las partidas que organizo o en las que participo para gestionarlas desde un único lugar.
- Como propietario, quiero publicar y gestionar un anuncio sencillo para ofrecer un juego en venta o intercambio.
- Como miembro de la comunidad, quiero descubrir juegos disponibles y consultar su información antes de expresar interés.
- Como persona interesada, quiero señalar mi interés de forma privada sin exponer datos de contacto.

## Requisitos funcionales del MVP 1

### RF-01 — Identidad y perfil básico

El sistema permitirá disponer de una identidad de usuario y crear o editar un perfil básico. Los campos obligatorios y el método de acceso son decisiones pendientes; se aplicará minimización de datos.

### RF-02 — Listado de partidas

El sistema mostrará partidas disponibles con información suficiente para diferenciarlas: juego, fecha y hora, ciudad, zona, distrito o granularidad equivalente, plazas/aforo y estado relevante. Como definición inicial, una partida disponible es futura, no está cancelada y tiene plazas disponibles; esta definición podrá evolucionar.

### RF-03 — Búsqueda y filtros

El jugador podrá reducir el listado al menos por juego, fecha y ciudad, zona, distrito o granularidad equivalente. En el prototipo, Madrid será el contexto fijo y los únicos filtros serán juego, fecha y zona/distrito; no habrá selector de ciudad. La futura ampliación multi-ciudad no debe quedar bloqueada.

### RF-04 — Detalle de partida

El sistema mostrará los datos publicados de la partida, el estado de plazas, la persona organizadora y los participantes que la política de privacidad permita mostrar. En el prototipo, el detalle puede mostrar un nombre de lugar simulado separado de la zona para validar su comprensión; esto no define la visibilidad futura de una dirección exacta.

### RF-05 — Creación de partida

Una persona identificada podrá crear una partida indicando, como mínimo:

- juego;
- fecha y hora;
- ciudad, zona, distrito o granularidad equivalente;
- número máximo de jugadores.

El prototipo añade «Lugar de la partida» como texto libre opcional y diferenciado de la zona y la descripción. Se orienta a nombres de locales o puntos reconocibles, no exige una dirección postal y no integra mapas, geocodificación ni servicios de lugares.

En el MVP 1, el juego queda indicado al crear la partida. Esto no establece una obligación para todos los posibles modelos de quedada POST-MVP. El organizador cuenta dentro del aforo total: una partida con aforo de cuatro personas comienza con un organizador y tres plazas disponibles. En el prototipo, Madrid se muestra como contexto fijo y el usuario selecciona únicamente zona o distrito; no introduce otra ciudad. El organizador puede editar los datos publicados sin reducir el aforo por debajo de participantes confirmados, o cancelar la partida sin borrarla; la cancelación impide nuevas solicitudes y conserva el historial mínimo.

### RF-06 — Participación

Una persona identificada podrá solicitar participación. La solicitud quedará pendiente hasta que el organizador la acepte o rechace, o hasta que la partida complete su aforo antes de confirmarla. Solo una aceptación convierte al solicitante en participante confirmado; el sistema impedirá superar el aforo y mostrará los resultados de forma inequívoca. Si se completa el aforo, ninguna solicitud inviable permanecerá pendiente y se explicará que no llegó a confirmarse por falta de plazas, sin implicar rechazo personal. El MVP no incluye lista de espera.

### RF-07 — Participantes

El sistema permitirá consultar participantes confirmados. El organizador podrá consultar por separado las solicitudes pendientes y aceptar o rechazar cada una con visibilidad adecuada al rol. Cuando una aceptación complete el aforo, las restantes dejarán de ser pendientes; la denominación técnica de ese resultado se decidirá en una fase posterior.

### RF-08 — Partidas propias

Una misma cuenta podrá organizar partidas y participar en partidas creadas por otras personas. El usuario podrá consultar por separado o distinguir ambas clases de partida.

### HXP-01 — Señales de confianza en el prototipo

La Fase 2 mostrará datos exclusivamente simulados para comprobar si facilitan la decisión de participar. La representación separará:

- reputación subjetiva: media, número de valoraciones y opiniones recientes;
- fiabilidad observable o derivada: partidas jugadas, asistencias y ausencias sin aviso.

El detalle ofrecerá un resumen compacto de la persona organizadora y el perfil permitirá ampliar la información. No habrá acción para publicar una valoración. Como regla provisional de producto, una futura valoración estará vinculada a una partida finalizada y solo a participantes confirmados que la hayan compartido.

Este experimento no define un requisito funcional de producción ni su modelo técnico. Algoritmo, moderación, derecho de réplica, prevención de fraude, disputas, privacidad y persistencia siguen pendientes antes de producción.

## Extensión funcional aprobada para Fase 6 — Juegos de la comunidad

El Marketplace es un segundo eje subordinado al núcleo de partidas. En Explorar se representa mediante un bloque breve posterior a las partidas y un acceso «Ver todos»; no sustituye el listado principal ni añade por ahora un destino permanente a la navegación global.

### RF-M01 — Publicar anuncio

Una persona identificada con Player podrá publicar un juego indicando una imagen representativa, nombre, descripción, condición, modalidad de venta o intercambio, Madrid y su zona/distrito. El precio será obligatorio únicamente para venta y se expresará en euros durante el piloto; un intercambio no tendrá precio.

### RF-M02 — Descubrir y consultar

Explorar mostrará pocas publicaciones activas y recientes después de las partidas. «Ver todos» abrirá un listado completo, inicialmente ordenado por publicación reciente y reducible por juego, modalidad y zona si el volumen lo necesita. Cada resultado mostrará imagen, juego, condición, modalidad, precio cuando exista y ubicación aproximada. El detalle añadirá descripción, propietario con acceso a su perfil, fecha y estado.

### RF-M03 — Gestionar anuncios propios

El propietario podrá consultar, editar y cerrar sus anuncios desde «Mis anuncios» dentro de su Perfil. No habrá borrado físico ni estado de reserva. Un anuncio cerrado desaparecerá del descubrimiento pero conservará su detalle e historial para las personas relacionadas cuando corresponda.

### RF-M04 — Expresar interés

«Me interesa» creará una señal privada y no vinculante asociada al anuncio y al Player interesado. El propietario podrá verla en «Mis anuncios» y aceptar o declinar el interés; ambos verán el resultado. La aceptación no equivale a compra, reserva o intercambio completado, no revela email o teléfono y no cierra automáticamente el anuncio. El propietario lo cerrará cuando deje de estar disponible.

El MVP no incorpora chat ni pretende completar la transacción dentro de Mesa Abierta. Antes de una prueba pública deberá decidirse si la señal mutua resulta suficiente o si hace falta un mecanismo de coordinación acotado y seguro.

La definición no bloquea monetización futura mediante anuncios destacados, límites ampliados o capacidades premium para jugadores avanzados, organizadores, clubes y tiendas. No se añaden planes, precios, billing, pagos ni reglas comerciales al modelo básico; las funciones esenciales de comunidad deben permanecer accesibles para sostener el crecimiento de la red.

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

La Fase 6 añade un incremento de Marketplace separado y secundario. No modifica la prioridad ni los criterios del núcleo de partidas; su alcance exacto y exclusiones se recogen también en `MVP.md`.

## Fuera de alcance

- feed, seguidores y amistades complejas;
- chat en tiempo real;
- sistema real de reputación, publicación de reviews y cálculo de fiabilidad; el prototipo solo contiene una representación simulada para validar su utilidad;
- clubes y tiendas;
- recomendaciones mediante IA;
- gamificación;
- colección avanzada, alquiler y compraventa/intercambio más allá de los anuncios simples aprobados para Fase 6;
- pagos y notificaciones push;
- mapas, *tracking*, geolocalización continua, GPS en tiempo real o publicación innecesaria de ubicación precisa;
- cualquier función social no imprescindible para completar el flujo principal.

## Criterios generales de éxito

No se fijan cifras comerciales sin una línea base. El MVP se considerará prometedor si la validación aporta evidencia de que usuarios objetivo pueden:

- comprender la propuesta y completar los flujos críticos sin asistencia material;
- encontrar una partida que consideren relevante o publicar una nueva;
- alcanzar un estado de participación entendido por organizador y jugador;
- identificar claramente cuándo, dónde a nivel de zona y a qué se jugará;
- localizar y comprender las señales simuladas de reputación y fiabilidad al decidir si quedar;
- usar los flujos críticos en móvil y con las necesidades de accesibilidad contempladas;
- expresar que el producto reduce una fricción real frente a su forma actual de organizarse.

Antes del lanzamiento de validación se definirá un plan de medición con eventos, muestra, periodo y umbrales. Hasta entonces estos criterios son cualitativos y no equivalen a resultados obtenidos.

## Riesgos

- **Mercado vacío:** pocas partidas visibles reducen el valor para los primeros usuarios.
- **Densidad local:** la utilidad depende de coincidencias geográficas y temporales.
- **Confianza y seguridad:** encontrarse con desconocidos puede frenar la participación; el MVP necesita medidas proporcionadas sin construir reputación completa.
- **Interpretación de señales:** una valoración subjetiva o un dato derivado pueden generar falsa seguridad si se presentan sin contexto; deben distinguirse y validarse con usuarios.
- **Privacidad:** información de zona, perfil y asistencia puede revelar hábitos si se diseña mal.
- **Abandono y plazas desactualizadas:** cancelaciones o ausencias pueden deteriorar la confianza.
- **Confusión de participación:** si solicitud pendiente y confirmación no se distinguen claramente, pueden generarse expectativas incorrectas.
- **Catálogo de juegos:** una fuente externa puede introducir dependencia, licencias, calidad de datos o complejidad prematura.
- **Expansión de alcance:** funciones sociales atractivas pueden desplazar la validación del problema principal.
- **Dilución del núcleo:** el Marketplace puede restar visibilidad a las partidas si ocupa demasiado espacio o navegación principal.
- **Confianza comercial:** anuncios incompletos, condición ambigua o perfiles falsos pueden facilitar fraude o decepción aunque no existan pagos internos.
- **Privacidad y coordinación:** una señal de interés sin un canal seguro posterior puede ser insuficiente, mientras que exponer contacto personal aumentaría el riesgo.
- **Contenido e imágenes:** deben definirse derechos, límites y moderación antes de aceptar publicaciones reales a escala.

## Decisiones iniciales aceptadas

- **Aforo:** el organizador cuenta dentro del aforo total. Con aforo de cuatro personas, existe inicialmente un organizador y tres plazas disponibles.
- **Rol del usuario:** una misma cuenta puede organizar partidas y participar en partidas organizadas por otras personas.
- **Partida disponible:** inicialmente es una partida futura, no cancelada y con plazas disponibles. La definición podrá evolucionar con nueva evidencia.
- **Datos de juegos en el prototipo:** se podrán utilizar juegos y datos simulados durante la Fase 2; no es necesario integrar entonces un catálogo externo.
- **Contexto geográfico del prototipo:** Madrid es fijo y preseleccionado. Explorar muestra partidas de Madrid y Crear permite elegir solo zona/distrito; no existe selector de ciudad. Esto no limita la arquitectura futura a Madrid.
- **Participación:** solicitar una plaza crea una solicitud pendiente. El organizador acepta o rechaza; solo la aceptación confirma al participante. Las solicitudes pendientes no cuentan dentro del aforo confirmado.
- **Cierre por aforo:** cuando una aceptación ocupa la última plaza, la partida queda completa, sale de Explorar y las demás solicitudes dejan de estar pendientes con una explicación de falta de plazas. No existe lista de espera ni se decide todavía el nombre técnico de este resultado.
- **Validación de confianza:** la iteración del prototipo mostrará reputación y fiabilidad simuladas como conceptos diferentes. No se habilita publicar valoraciones ni se aprueba todavía un sistema real.

## Hipótesis iniciales

Estas hipótesis guían el diseño, pero no son decisiones validadas:

- Ciudad o zona ofrece precisión suficiente para evaluar una partida antes de acordar detalles por otros medios.
- Juego, fecha/hora, zona y aforo son los datos mínimos útiles para publicar.
- Las señales de reputación y fiabilidad pueden reducir la incertidumbre al quedar con personas desconocidas; su utilidad y comprensión deben observarse, no asumirse.

## Preguntas abiertas y recomendación provisional

1. **¿Quién es el usuario inicial más urgente dentro del contexto conceptual de Madrid?** Recomendación: entrevistar tanto a buscadores como a organizadores y priorizar según evidencia.
2. **¿Qué datos forman el perfil básico y cuáles son públicos?** Recomendación: comenzar con nombre visible y zona general; añadir solo lo respaldado por un flujo o riesgo concreto.
3. **¿Qué método de autenticación se usará?** Recomendación: elegir en la fase de arquitectura/Firebase según fricción, privacidad y población piloto.
4. **¿Cómo se gestionan abandono de una participación confirmada, retirada voluntaria de una solicitud, partidas pasadas y ausencias?** Edición y cancelación básica ya están definidas; el resto del ciclo de vida debe mantenerse mínimo y no crear un sistema de reputación.
5. **¿Qué catálogo externo, si alguno, se necesitará después del prototipo?** Recomendación: evaluar fuente, licencia y necesidad antes de integrar servicios externos; la Fase 2 usará datos simulados.
6. **¿Qué granularidad y vocabulario se usarán para ciudad, zona o distrito?** Recomendación: texto o selección general normalizada para descubrimiento, sin geolocalización continua ni coordenadas públicas.
7. **¿Cómo y cuándo se compartirá un punto concreto de encuentro sin chat en tiempo real?** Recomendación: investigarlo en los flujos y escoger el mecanismo mínimo, con visibilidad controlada, privacidad y acceso solo cuando sea necesario.
8. **¿Qué medidas mínimas de confianza, bloqueo, denuncia o moderación son imprescindibles para una prueba con usuarios?** Recomendación: realizar evaluación de riesgos antes de pruebas externas; no asumir que estar fuera del núcleo funcional elimina la obligación de seguridad.
9. **¿Qué navegadores, idiomas de interfaz y requisitos legales/regionales se aplican al piloto?** Recomendación: decidirlos antes de producción en función de la audiencia real.
10. **¿Qué evidencia y umbrales permitirán considerar validado el problema?** Recomendación: definir el plan después de investigación inicial y antes de probar el prototipo, sin inventar métricas retrospectivas.
11. **¿La señal privada «Me interesa» aporta valor suficiente sin chat?** Recomendación: validar intención y comprensión antes de añadir conversación; decidir un canal acotado antes de una prueba pública si la coordinación queda bloqueada.
12. **¿Qué condiciones, fotografías y descripciones mínimas evitan anuncios engañosos?** Recomendación: comenzar con una taxonomía breve y una imagen, y revisarla con evidencia.
13. **¿Qué controles de denuncia, moderación y artículos permitidos son imprescindibles?** Recomendación: resolverlos antes de operar con usuarios externos; no tratarlos como parte opcional de producción.
14. **¿Cuándo debe pasar Madrid a multi-ciudad y cómo se tratarán moneda y ámbito geográfico?** Recomendación: mantener Madrid y euros en el piloto sin acoplar la visión a ese contexto.
