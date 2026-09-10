# ADR-002 — Arquitectura de aplicación frontend

- **Estado:** aceptada
- **Fecha:** 2026-09-10

## Contexto

El prototipo React conserva partidas, jugadores e identidad simulada en un Context y combina coordinación de flujos con estado de interfaz. Esta solución ha servido para validar el producto, pero la futura incorporación de persistencia y autenticación requiere separar reglas, casos de uso y efectos sin rehacer la interfaz ni introducir infraestructura prematura.

La arquitectura de dominio aprobada exige que React y Firebase sean detalles externos. Al mismo tiempo, el tamaño actual del MVP no justifica un framework de estado, un contenedor de dependencias ni una capa ceremonial para cada operación.

## Decisión

La arquitectura frontend evolucionará de manera incremental con estas reglas:

- Domain contendrá datos inmutables y reglas puras comprobables sin React.
- Application representará intenciones de producto que coordinan reglas, identidad o efectos mediante funciones de caso de uso.
- Presentation conservará render, interacción y estado puramente visual; las pages y hooks adaptarán casos de uso a React.
- Infrastructure implementará los puertos definidos por Application y traducirá tipos externos.
- El estado de UI será local por defecto. React Context se usará de forma limitada para composición e información en memoria compartida entre rutas durante la migración.
- `app` será la raíz de composición de routing, adaptadores, casos de uso y providers.
- Los casos de uso recibirán dependencias explícitas mediante funciones y objetos pequeños de dependencias nombradas.
- Los puertos vivirán en la capa Application del feature que los consume; infraestructura los implementará posteriormente.

No se introducen Redux, Zustand, React Query, frameworks de DI, service locators, singletons ni clases manager. Tampoco se decide aún la estrategia de caché de datos persistentes.

## Alternativas consideradas

### Mantener `PrototypeContext` como arquitectura definitiva

Es la opción con menos cambios inmediatos, pero convertiría Context en repositorio, coordinador y estado global. Complicaría las pruebas y la sustitución de datos simulados por persistencia real.

### Introducir ahora una librería de estado o server state

Podría resolver necesidades futuras de caché y sincronización, pero esas necesidades aún no se han medido. Añadiría una dependencia y decisiones de API antes de disponer de Firebase o consultas reales.

### Consumir Firebase directamente desde hooks y componentes

Reduciría inicialmente archivos y wiring, pero acoplaría presentación a infraestructura, filtraría tipos externos al negocio y dificultaría probar reglas y sustituir adaptadores.

### Clases de servicio y contenedor de inyección

Harían uniforme la construcción de dependencias, pero introducirían estado implícito, indirección y complejidad innecesaria frente a funciones y composición explícita.

## Consecuencias

### Positivas

- Las reglas de negocio podrán probarse sin React ni Firebase.
- El prototipo podrá migrarse flujo a flujo y mantenerse operativo.
- Los adaptadores en memoria y Firebase podrán intercambiarse desde `app`.
- La presentación conservará componentes simples y estado local cuando sea suficiente.
- Las dependencias y efectos serán visibles en los casos de uso.

### Costes y riesgos

- La composición manual exige disciplina para evitar imports directos de infraestructura.
- Durante la transición coexistirán temporalmente el Context actual y nuevos límites.
- Será necesario decidir más adelante cómo cachear y sincronizar datos persistentes.
- Un exceso de casos de uso o interfaces podría recrear arquitectura ceremonial; cada abstracción debe superar el criterio de necesidad definido.

### Seguimiento

- Migrar primero reglas y mutaciones de mayor riesgo.
- Mantener pruebas en cada frontera antes de sustituir mocks.
- Revisar Context y estrategia de server state al introducir persistencia real.

