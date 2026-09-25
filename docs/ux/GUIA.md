# Arquitectura UX para una app social de juegos de mesa

Una guía de traspaso y refactor para convertir pantallas dispersas en recorridos claros y coherentes. Versión 1.0 · 25 de septiembre de 2026.

Destino de esta entrega: **Mesa Abierta**, repositorio `ChristianSalto/app-boardgames`. Leer primero `ADAPTACION_MESA_ABIERTA.md`: concreta las decisiones ya aprobadas, el primer lote y los límites de los ejemplos generales de esta guía. La adaptación prevalece sobre las propuestas genéricas cuando el producto ya ha decidido otra cosa.

El objetivo es que cada persona reconozca dónde está, comprenda la información que necesita y encuentre la siguiente acción sin esfuerzo innecesario. La simplicidad se obtiene ordenando decisiones, eliminando repeticiones y reutilizando patrones. La compacidad debe conservar legibilidad, controles cómodos y contexto suficiente.

Esta guía se acompaña de skills y agentes que convierten esos criterios en un proceso de trabajo. El primer refactor debe conservar el login, las rutas y los contratos que ya funcionan; primero se establece una línea base y después se migra un recorrido completo. La arquitectura se revisa con evidencia del producto y de sus usuarios.

## 1 Qué transferir de Cruxmatch

Cruxmatch aporta prácticas verificables: tokens compartidos, prioridad de acciones según el estado de la persona, contratos de datos separados de la representación y evidencia visual por plataforma. Su matriz de paridad también registra trabajo parcial; una práctica documentada no certifica que todas sus pantallas estén resueltas.

| Evidencia de origen | Criterio reutilizable | Adaptación a juegos de mesa |
| --- | --- | --- |
| Tokens web y primitivas móviles | Centralizar roles de texto, color, espacio y controles | Reutilizar el sistema del destino y cubrir sus carencias antes de sustituirlo |
| Shell con accesos jerarquizados | Priorizar destinos por tareas reales | Elegir destinos según encontrar, organizar y gestionar sesiones; no copiar Salidas y Mapa |
| Detalle y unión a salida | La acción depende de acceso, plazas y participación | Distinguir Unirme, Solicitar plaza, Solicitud enviada y Plaza confirmada |
| Flujo de auditoría visual | Comparar estados equivalentes antes y después | Mismos datos de prueba, viewport, tema, rol y tamaño de texto |
| Incidencias de tipografía nativa | Verificar texto realmente pintado | No cerrar controles compactos solo porque su label o geometría sean correctos |

No se heredan automáticamente colores, glass, halos, montañas, grandes cabeceras editoriales, economía, ranking ni gamificación. Tampoco se adopta la PWA como referencia si el producto destino tiene otra plataforma principal. La identidad se decide allí.

Las capturas históricas revisadas del feed muestran una cabecera amplia, varios avisos y accesos repetidos. Son evidencia útil para discutir prioridades, pero no un patrón que deba copiarse para obtener máxima compacidad. El detalle de salida sí ilustra una acción persistente contextual; su altura y la información visible también deben reevaluarse en el nuevo producto.

## 2 Decisiones que deben preceder al diseño

Completar `CONTEXTO.md` durante la auditoría. Identificar quién usa el producto, qué quiere conseguir, en qué dispositivo y qué restricción le hace abandonar. Separar observaciones del código, hallazgos de uso e hipótesis. No deducir las necesidades de los usuarios únicamente de los menús existentes.

Definir el recorrido prioritario en una frase: por ejemplo, encontrar una sesión compatible y conseguir una plaza. Contrastar esa hipótesis con el alcance real: una app centrada en colecciones, juegos online o seguimiento de resultados necesita otra arquitectura.

Usar un vocabulario de dominio estable. Propuesta inicial: **juego** es el título del catálogo; **partida** es la sesión organizada en fecha y lugar; **grupo** es una comunidad persistente; **solicitud** es una petición aún no aceptada. Si una quedada incluye varias partidas, tratarla como entidad diferente. Resolver estas relaciones antes de renombrar pantallas.

Separar datos de catálogo de datos de sesión. La duración editorial de un juego no equivale a la hora de fin acordada. El número recomendado de jugadores no equivale a las plazas disponibles. La dificultad del juego no describe la experiencia de cada persona. Estas diferencias deben ser visibles cuando afecten a la decisión de participar.

Registrar qué existe hoy y qué queda fuera. Chat, solicitudes, invitaciones, costes, lista de espera y ubicación privada son capacidades condicionadas al contrato del producto; esta guía no autoriza construirlas ni cambiar permisos.

## 3 Arquitectura de información y orientación

Inventariar rutas, menús, botones globales, enlaces profundos y destinos tras el login. Para cada acceso, registrar la tarea que permite completar. Fusionar entradas equivalentes y conservar rutas antiguas mediante adaptación o redirección cuando existan enlaces guardados.

Una propuesta inicial para un producto centrado en sesiones es: **Explorar** para encontrar partidas; **Mis partidas** para participaciones y organización; **Mensajes**, solo si tiene entidad y uso frecuente; **Perfil** para identidad y ajustes. Crear partida es una acción y puede vivir como botón contextual. No necesita ocupar una pestaña por simetría visual. Catálogo o Grupos solo pasan al primer nivel si las tareas observadas lo justifican.

Mantener pocas opciones principales y etiquetas estables; el número exacto se justifica con necesidades y espacio. Destino, filtro y acción son conceptos distintos. No llamar Inicio a una pantalla que en realidad solo lista partidas, ni duplicar Explorar y Descubrir con el mismo contenido.

En cada pantalla deben reconocerse el título o entidad, la sección seleccionada cuando exista y la salida esperable. El botón Atrás respeta el recorrido; al entrar por enlace directo existe un retorno seguro a la lista o sección. Cerrar un modal devuelve el foco al disparador. Navegar a un detalle y volver conserva filtros, posición y selección cuando siga teniendo sentido.

Después del login, recuperar el destino solicitado y validar que sigue accesible. Si la sesión expira durante una acción, explicar qué ocurrió y reanudar con los datos recuperables. No enviar siempre al inicio ni repetir onboarding completado. Evitar bucles entre guards, login y rutas protegidas.

## 4 Jerarquía y compacidad

Cada pantalla declara una tarea principal. Ordenar el contenido por su contribución a esa tarea: orientación, información necesaria para decidir, acción y apoyo. Una pantalla exploratoria puede tener múltiples enlaces equivalentes; un formulario o una confirmación debe dejar clara la acción predominante. El énfasis se decide por estado y por región, no contando todos los botones de la página.

La regla de partida es un único nivel de máxima prominencia para la decisión actual. Usar acciones secundarias con menor peso. En un modal, la decisión del modal domina y el fondo queda inactivo. Reservar el estilo destructivo para consecuencias destructivas; una acción deshabilitada no sustituye una explicación de por qué no se puede continuar.

Reducir primero el contenido repetido, después los contenedores y finalmente el espaciado accesorio. Preferir filas para datos homogéneos, tarjetas para entidades independientes y secciones para agrupaciones con significado. Evitar tarjeta dentro de tarjeta y títulos, subtítulos y párrafos que dicen lo mismo.

Las cabeceras grandes se justifican por descubrimiento o identidad. En pantallas de uso frecuente, una cabecera breve deja visibles los primeros resultados y la tarea. Como criterio de revisión, comprobar si en un teléfono de referencia se alcanza a reconocer contenido útil sin atravesar una bienvenida, estadísticas y promociones. No imponer alturas fijas para conseguirlo con texto ampliado.

Mostrar primero la información decisiva y revelar detalles avanzados a demanda. No ocultar fecha, requisitos, coste, consecuencias o estado de plaza si condicionan la acción. La divulgación progresiva reduce decisiones iniciales, pero no debe esconder controles frecuentes ni condiciones importantes.

Mantener superficies de interacción cómodas, texto escalable y espacio entre controles. Una interfaz visualmente densa puede conservar áreas táctiles amplias. No reducir tipografía, recortar etiquetas decisivas o convertir todo en iconos para que quepa.

## 5 Configuración de pantallas con contratos

Antes de implementar una pantalla o cambiar su estructura, completar la ficha `PANTALLA.md`. Es una herramienta de diseño; no exige construir un motor genérico de pantallas basado en JSON. Si la app ya usa configuración declarativa, hacer que represente los mismos contratos.

| Parte de la ficha | Decisión que debe quedar explícita |
| --- | --- |
| Ruta y contexto | Desde dónde se entra, permisos, entidad por ID y retorno |
| Tarea | Qué resultado busca la persona en este estado |
| Jerarquía | Orden de bloques y qué puede pasar a un nivel secundario |
| Acciones | Label, prioridad, condición, efecto, progreso y recuperación |
| Estados | Carga, contenido, vacío, error, acceso y mutación |
| Texto y componentes | Fuente de copy, tokens y primitivas existentes |
| Validación | Qué conducta y evidencia demuestran que funciona |

En el detalle de una partida, priorizar juego o título de la sesión, fecha y hora, zona, duración prevista, plazas y requisitos que afecten a la participación. La ubicación exacta se muestra según la privacidad real del producto. La nota del anfitrión, material, expansiones y reglas de la casa se ordenan por relevancia; no inventar datos ausentes.

Propuesta de tarjeta compacta: «Azul · Sábado 18:00», seguida de «Gràcia · 90 min · 2 plazas libres» y, si cambia la decisión, «Se explican las reglas». La tarjeta abre el detalle; no necesita otro párrafo describiendo que se puede consultar más información. Un título de sesión diferente del nombre del juego merece su propia línea, porque aporta identidad.

La repetición entre una tarjeta, un detalle y una confirmación es legítima: cada contexto necesita información suficiente. Eliminar redundancia dentro de la misma decisión, no toda repetición del sistema.

## 6 Estados y acciones de participación

El texto del botón describe lo que ocurrirá realmente. La interfaz puede anticipar estados, pero el servidor y los contratos existentes determinan la disponibilidad y el éxito. No declarar plaza confirmada antes de una respuesta autoritativa.

| Estado real | Acción predominante sugerida | Información necesaria |
| --- | --- | --- |
| Visitante y acceso protegido | Iniciar sesión para unirme | Conservar el destino tras autenticarse |
| Plaza disponible y unión directa | Unirme a la partida | Requisitos y consecuencia de confirmar |
| Requiere aprobación | Solicitar plaza | Indicar que depende del anfitrión |
| Solicitud pendiente | Estado Solicitud enviada | Cómo consultar o retirar, si existe esa función |
| Participación confirmada | Ver mi partida o Abrir chat | Solo ofrecer chat si está disponible y autorizado |
| Partida completa | Estado Sin plazas | Lista de espera únicamente si el producto la soporta |
| Anfitrión | Gestionar partida | Acceso a solicitudes o edición según capacidades |
| Cancelada o finalizada | Estado y retorno útil | Retirar acciones de unión y explicar qué sigue disponible |

Añadir una matriz independiente para el estado de red: carga inicial, actualización, error, offline y envío pendiente. Un fallo de carga no es una lista vacía. Si hay datos conservados, mostrar su antigüedad o la limitación pertinente. Prevenir doble envío y permitir reintentar sin duplicar solicitudes.

Ante una plaza agotada durante el envío, conservar el contexto y explicar el resultado real. Si la app admite abandonar una partida, comunicar la consecuencia antes de confirmar cuando sea relevante. No añadir confirmaciones rutinarias a todas las acciones reversibles.

Una barra fija debe reservar espacio para el último elemento y adaptarse al teclado, safe areas y texto ampliado. Si tapa campos o exige alturas rígidas, adoptar una disposición alternativa. La persistencia del botón es un medio para facilitar la tarea.

## 7 Textos que orientan

Mantener un glosario corto y un inventario de copy en el sistema de internacionalización existente. El título identifica; la ayuda resuelve una duda; el botón anticipa una acción; el estado cuenta qué ocurrió. Cada pieza debe tener una función diferente. El idioma base de este kit es español; el producto conserva los idiomas que ya soporte.

| Situación | Texto prescindible o ambiguo | Propuesta contextual |
| --- | --- | --- |
| Encabezado de lista | Partidas / Aquí puedes ver las partidas disponibles | Partidas; añadir zona o filtros solo si aportan contexto |
| Solicitud con aprobación | Unirme / Ya estás dentro | Solicitar plaza / Solicitud enviada. Falta la confirmación del anfitrión |
| Botón final de formulario | Continuar | Publicar partida si la siguiente acción publica |
| Filtros sin coincidencias | No hay partidas | No hay partidas con estos filtros / Quitar filtros |
| Fallo de carga | No se ha encontrado nada | No hemos podido cargar las partidas / Reintentar |
| Primer uso de organización | Aún no tienes nada | Aún no has organizado partidas / Crear partida |

Evitar instrucciones obvias como Pulsa aquí, bienvenida repetida, lenguaje técnico, elogios automáticos y mensajes de éxito sin consecuencia. Usar verbos específicos; Continuar sirve si avanza un paso y el contexto deja claro cuál. Un indicador de progreso o estado debe ser accesible y no depender solo del color.

No convertir concisión en ambigüedad. «2/4» puede exigir interpretación; «2 plazas libres» o «2 de 4 participantes» comunica cosas diferentes. Precisar si el anfitrión ocupa plaza. Expresar fechas y horas de forma local y evitar que Hoy siga apareciendo después de medianoche por datos obsoletos.

No usar placeholders como único label. Mostrar ayudas junto a su campo solo si previenen un error probable. El error identifica el problema y cómo resolverlo, conserva lo escrito y se vincula al campo. Revisar plurales, nombres largos, lectores de pantalla e idiomas extensos; evitar concatenar frases que pierdan gramática al traducirse.

## 8 Sistema visual y accesibilidad

Inventariar componentes y tokens antes de añadir otros. Mantener roles semánticos para fondo, superficie, texto principal, texto secundario, acción, peligro, borde y foco. Nombrar tipografía por uso y espacio por una escala reducida. Los valores finales se deciden en el repositorio destino; no trasladar automáticamente los píxeles o fuentes de Cruxmatch.

Estabilizar primero el contenedor de pantalla, cabecera, navegación, botón, campo, fila o tarjeta de partida, filtros, estado de pantalla y diálogo. Una variante debe responder a una diferencia funcional repetida. Evitar un componente universal con docenas de banderas o duplicar la misma regla en cada pantalla.

Para web, usar WCAG 2.2 AA como objetivo: contraste de texto normal de al menos 4,5:1 y de texto grande de 3:1 según su definición; contraste no textual aplicable de 3:1; navegación por teclado y foco visible; contenido adaptable al zoom y reflow. El criterio AA de targets contempla 24 × 24 píxeles CSS o sus excepciones; no equivale a exigir 44 píxeles a todo elemento.

Como decisión de producto, buscar controles táctiles más cómodos, por ejemplo áreas de 44–48 unidades lógicas según plataforma, respetando su guía y la separación. Es una referencia de diseño, no una equivalencia entre px, pt y dp ni una certificación normativa. Verificar texto ampliado y lector en plataformas nativas.

Probar foco al abrir, cerrar y validar formularios; un modal contiene la interacción y devuelve el foco. Las actualizaciones relevantes se anuncian sin moverlo innecesariamente. Revisar nombre, rol y estado accesibles, además del texto realmente visible. En web, comprobar 200 % de zoom y reflow equivalente a 320 píxeles CSS; en nativo, el mayor tamaño de texto admitido por el entorno de prueba.

El movimiento y la transparencia deben tener alternativas cuando las preferencias de accesibilidad lo requieran. Estos controles y cifras no sustituyen una evaluación completa de conformidad. Fuentes normativas y orientación: `FUENTES.md`.

## 9 Refactor gradual del producto existente

| Lote | Trabajo | Condición de salida |
| --- | --- | --- |
| 0 Línea base | Leer reglas y stack; inventariar rutas y componentes; recorrer login y menús; capturar estados | Mapa actual, problemas reproducibles, contratos que conservar y comandos reales |
| 1 Arquitectura | Definir vocabulario, tareas, destinos, retornos y prioridades | Mapa propuesto y correspondencia de rutas antiguas con nuevas |
| 2 Recorrido piloto | Normalizar shell y una ruta de extremo a extremo ya existente | Entrada, decisión, acción y regreso coherentes, sin regresión de sesión |
| 3 Patrones | Extraer componentes demostrados por el piloto y migrar familias de pantallas | Menos duplicación y comportamiento estable por estado |
| 4 Consolidación | Retirar accesos obsoletos, revisar copy y completar evidencias | Enlaces compatibles, deuda registrada y comprobaciones relevantes superadas |

Si solo hay login y menús operativos, el piloto es login → destino previsto → navegación → retorno. No construir todo el dominio de partidas para demostrar el sistema. Si ya hay exploración y unión, ese recorrido permite validar mejor el objetivo principal.

Cada lote tiene alcance, criterios observables, baseline y reversión local. Mantener adaptadores de rutas cuando eviten romper enlaces; retirar componentes antiguos solo después de comprobar sus consumidores. Separar cambios de UI de cambios de backend salvo que el objetivo necesite ambos y estén autorizados.

No iniciar el refactor cambiando de framework, proveedor de autenticación o librería de componentes. Revisar primero si el problema proviene de arquitectura de información, duplicación o jerarquía. Reutilizar infraestructura comprobada reduce el riesgo del cambio.

## 10 Skills y agentes en el trabajo diario

El coordinador conserva la visión de conjunto y recomienda modelo según la tarea. El responsable de implementación mantiene la escritura del producto. En Mesa Abierta son funciones distintas: ProductManagerAgent coordina y FrontendAgent implementa. Se usa arquitectura cuando cambien navegación, tareas o entidades; pantallas para layout, estados y patrones; textos para copy; validación para cerrar trabajo visible. Leer solo la documentación que la tarea necesita.

Los agentes especializados emiten decisiones o hallazgos: arquitectura examina recorridos y contratos; escritura revisa términos, acciones y redundancia; revisión busca regresiones, problemas de accesibilidad y evidencia faltante. En tareas sustanciales se delega la revisión aplicable. En ajustes pequeños se aplica la skill sin lanzar tres agentes por rutina.

Cada delegación incluye alcance, rutas, rol de usuario, evidencia disponible, decisión solicitada y archivos que puede leer. Los agentes del kit son revisores sin edición de producto. El coordinador integra hallazgos con el responsable correspondiente, resuelve conflictos con evidencia y documenta excepciones. Una discrepancia estética no justifica reabrir el alcance.

Los archivos `.codex/agents/*.toml` configuran roles en entornos compatibles. `AGENTS.md` fija su activación; las skills se descubren desde `.agents/skills`. Copiar los archivos no ejecuta un refactor ni garantiza una revisión independiente en cualquier herramienta. La comprobación de carga forma parte de la instalación, según `OPERACION.md`.

## 11 Cómo comprobar que mejora

Validar tareas completas con datos locales deterministas: encontrar una partida adecuada, entender si la plaza está confirmada, volver manteniendo filtros y recuperar un error. Observar también a personas con poca experiencia en juegos de mesa; no exigir que interpreten jerga o iconos sin ayuda.

En cada lote, registrar si completan la tarea, dónde dudan, qué errores cometen y si necesitan ayuda. Comparar con la línea base bajo condiciones similares. Tiempo y clics pueden explicar fricción, pero una reducción de ambos no prueba por sí sola una mejora. Las pruebas exploratorias pequeñas detectan problemas; no autorizan conclusiones estadísticas sobre toda la población.

Si existen métricas consentidas, revisar abandono del recorrido y éxito de la acción. No instrumentar datos personales ni añadir un proveedor de analytics como parte implícita de un refactor visual. En un producto temprano, la observación directa y los errores reproducibles pueden ser suficientes para priorizar.

Para cada hallazgo, registrar severidad y evidencia. P0: bloqueo de tarea esencial o consecuencia grave. P1: confusión relevante, inaccesibilidad o pérdida de contexto. P2: fricción con alternativa razonable. P3: consistencia menor. Resolver según impacto, frecuencia observada y alcance; las preferencias visuales no son P0.

## 12 Criterios de entrega y primer paso

Un lote está cerrado cuando la tarea se entiende, los estados y botones dicen la verdad, el contenido decisivo sigue visible, el retorno funciona y las comprobaciones del alcance tienen evidencia. Guardar capturas comparables y resultados de comandos. Diferenciar pruebas superadas, fallidas, no ejecutadas, no aplicables y bloqueadas por entorno.

Una build o un análisis estático no valida la apariencia, el lector de pantalla ni la usabilidad. Si falta una plataforma o un estado necesario, cerrar solo la parte comprobada y dejar pendiente la otra. No ejecutar todas las pruebas del repositorio por inercia; seleccionar las que cubren el riesgo y seguir sus requisitos de release.

Para empezar, integrar el kit, comprobar su carga y ejecutar el prompt de `INICIO.md`. El resultado inicial debe ser un inventario útil, una propuesta argumentada y el primer lote reversible implementado cuando el entorno lo permita. La información que falte se pide de forma concreta mientras continúa el trabajo independiente.

La fuente operativa de este documento es `docs/ux/GUIA.md`. Las fichas viven en `docs/ux/templates/`; se copian únicamente cuando hacen falta. Mantener decisiones vigentes y eliminar reglas que la evidencia contradiga evita convertir el sistema UX en otra fuente de dispersión.
