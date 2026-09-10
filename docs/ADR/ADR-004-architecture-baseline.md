# ADR-004 — Baseline arquitectónico de Fase 4

- **Estado:** aceptada
- **Fecha:** 2026-09-10

## Contexto

La Fase 4 ha definido los límites de dominio, la arquitectura de aplicación frontend y la integración futura con Firebase. Antes de implementar era necesario comprobar que ADR-001, ADR-002 y ADR-003 formasen un sistema coherente, sin capas ceremoniales ni dependencias que obligasen a rehacer el producto al introducir persistencia.

La revisión consolidada concluye que no existen bloqueos arquitectónicos. Se han aclarado la ubicación transversal de `PlayerId` y la separación de responsabilidades entre regla de dominio, caso de uso, transacción y Security Rules.

## Decisiones consolidadas

- La estructura principal se organiza por `game-sessions`, `players` y `authentication`, con `app` como composition root y `shared` limitado.
- Reputación permanece inicialmente integrada en `players` como lectura; solo se extraerá cuando tenga reglas y ciclo de vida propios.
- Domain contiene datos inmutables y funciones puras sin React, Firebase o navegador.
- Application contiene casos de uso funcionales y define los ports que consume.
- Presentation renderiza, gestiona interacción y conserva estado puramente visual; no consulta Firebase directamente.
- Infrastructure implementa ports, traduce datos y errores externos y confina los efectos.
- `app` construye adaptadores, casos de uso, routing y providers sin incorporar reglas de negocio.
- El estado React es local por defecto; los hooks se mantienen por feature y Context se limita a identidad, composición y transición del prototipo.
- Las dependencias se inyectan mediante funciones y objetos explícitos, sin framework de DI, service locator, singleton o manager.
- `PlayerId` puede existir como primitiva transversal mínima en `shared/domain`; los datos y reglas de `Player` permanecen en `players`.
- Firebase se integra como Infrastructure detrás de ports de Application y se compone desde `app`.
- El núcleo del MVP comenzará client-only si el esquema permite protegerlo mediante Authentication, transacciones y Security Rules probadas.
- Domain decide las transiciones de aforo y participación; Infrastructure las ejecuta atómicamente; Rules vuelve a validar las restricciones que cruzan el límite de confianza.
- Los datos públicos y los detalles sensibles del encuentro se separarán cuando requieran audiencias diferentes.
- Emulator Suite será obligatorio para Auth, Firestore y pruebas de Rules antes de usar entornos remotos.

## Restricciones

- No importar Firebase en Domain, Application o Presentation.
- No colocar reglas de negocio en componentes, hooks, adaptadores o composition root.
- No convertir `shared` en un contenedor de utilidades, DTOs o servicios genéricos.
- No crear las cuatro capas de cada feature si no contienen una responsabilidad real.
- No crear interfaces, repositories o casos de uso para setters y operaciones locales sin regla o efecto.
- No introducir Redux, Zustand, React Query, frameworks de DI ni backend sin una necesidad demostrada.
- No modelar ni implementar capacidades POST-MVP por anticipado.
- No tratar validación cliente o transacciones como sustitutos de Security Rules.

## Consecuencias

### Positivas

- El dominio puede probarse sin React ni Firebase.
- Los mocks y Firestore podrán intercambiarse desde la composición.
- La migración puede realizarse flujo a flujo sin un refactor big-bang.
- Las responsabilidades de negocio, coordinación, UI, persistencia y autorización quedan separadas.
- Las capacidades futuras pueden añadirse como dominios o extensiones sin crear estructura vacía hoy.

### Costes y riesgos

- Las invariantes críticas deben mantenerse coherentes entre Domain y Security Rules aunque se expresen en tecnologías distintas.
- La composición manual requiere disciplina para evitar imports directos entre capas.
- La estrategia client-only depende de un esquema que permita atomicidad y autorización verificables.
- La separación de datos públicos y restringidos puede requerir varias lecturas y proyecciones.
- Context coexistirá temporalmente con los nuevos casos de uso durante la migración.

## Extensibilidad controlada

Reputation, collections, trades, clubs, chat y subscriptions/monetization podrán constituir dominios propios cuando se aprueben y adquieran reglas independientes. Game voting podrá comenzar como capacidad de `game-sessions` y extraerse si crece. Ninguna de estas posibilidades forma parte de la implementación actual.

## Decisiones que permanecen abiertas

- esquema Firestore, relaciones, proyecciones, consultas e índices;
- representación transaccional de partidas, participantes y solicitudes;
- Security Rules completas para el esquema definitivo;
- provider y flujo de Authentication;
- vinculación material entre identidad autenticada y `PlayerId`;
- contratos y firmas definitivos de casos de uso y ports;
- representación de resultados y errores asíncronos;
- estrategia de caché, sincronización e invalidación;
- límites definitivos de providers y retirada de `PrototypeContext`;
- ciclo de vida ampliado de partidas y solicitudes;
- privacidad, revelación y retención del lugar exacto;
- algoritmo, elegibilidad, moderación y persistencia de reputación;
- framework de testing;
- billing, entitlements y monetización;
- necesidad real de Cloud Functions, backend o Storage.

## Decisión de avance

La arquitectura descrita en `ARCHITECTURE.md`, `FIREBASE_ARCHITECTURE.md` y ADR-001 a ADR-004 pasa a ser el baseline técnico para la implementación. La Fase 4 se considera completada sin bloqueos. La Fase 5 no comienza mediante este ADR.

