# ADR-003 — Firebase como infraestructura detrás de ports

- **Estado:** aceptada
- **Fecha:** 2026-09-10

## Contexto

Mesa Abierta prevé utilizar Firebase Authentication, Cloud Firestore, Hosting y Emulator Suite. El prototipo actual usa estado en memoria, mientras la arquitectura aprobada separa Domain, Application, Presentation e Infrastructure.

Integrar el SDK directamente en componentes o reglas de dominio reduciría archivos al principio, pero acoplaría el producto a tipos, errores, consultas y ciclos de vida específicos del proveedor. Construir un backend propio desde el inicio tampoco está justificado para los flujos actuales.

## Decisión

Firebase será un detalle de Infrastructure detrás de ports definidos y consumidos por Application.

- Domain y Application no importarán tipos de Firebase.
- Presentation invocará casos de uso y no consultará Firestore o Auth directamente.
- Los adaptadores traducirán identidades, datos y errores del SDK.
- `app` inicializará y compondrá las implementaciones concretas.
- El núcleo del MVP comenzará sin backend propio, usando Client SDK, transacciones y Security Rules probadas.
- Una aceptación de participación será atómica y no podrá superar el aforo.
- Domain conservará la transición de negocio; el adaptador ejecutará esa transición dentro de la operación atómica y Rules validará de forma independiente las restricciones de seguridad.
- La información sensible con audiencia restringida se separará de los documentos públicos que puedan leerse desde cliente.
- Emulator Suite será obligatorio para Auth, Firestore y pruebas de Rules antes de usar entornos remotos.
- Cloud Functions o backend se introducirán solo ante una frontera de confianza o atomicidad que el cliente y Rules no resuelvan de forma sencilla.

No se decide en este ADR el esquema Firestore, el proveedor de login, los índices, las reglas completas ni la UI de autenticación.

## Alternativas consideradas

### Firebase SDK directo desde React

Reduce la indirección inicial, pero mezcla UI, consultas, autorización y errores de proveedor; dificulta las pruebas y filtra Firebase al resto de la aplicación.

### Tipos Firebase en Application o Domain

Evita mapeos, pero convierte snapshots, timestamps e identidad técnica en parte del modelo del producto y bloquea adaptadores alternativos.

### Backend propio o Cloud Functions para todas las operaciones

Centraliza confianza y acceso, pero añade despliegue, latencia y mantenimiento sin necesidad demostrada para el núcleo del MVP.

### Firebase detrás de adaptadores funcionales

Introduce una frontera pequeña y comprobable, mantiene el dominio independiente y permite comenzar client-only. Es la alternativa elegida.

## Consecuencias

### Positivas

- Las reglas de producto permanecen independientes del proveedor.
- Los mocks y Firebase pueden intercambiarse desde la composición.
- Las pruebas de Application pueden usar fakes y las de infraestructura, emuladores.
- Los errores de Firebase no condicionan Presentation.
- Se evita un backend prematuro sin renunciar a introducir operaciones confiables cuando sean necesarias.

### Costes y riesgos

- Será necesario mapear representaciones y mantener contratos claros.
- Firestore impone restricciones de consulta, transacción y autorización que influirán en el esquema posterior.
- La garantía de aforo y el cierre de solicitudes deben diseñarse conjuntamente con el modelo de datos y las Rules.
- Separar datos públicos y restringidos puede requerir más de una lectura.
- La composición client-only dejará de ser suficiente si aparecen cálculos confiables, secretos, webhooks o fan-out.

### Seguimiento

- Diseñar esquema, consultas, transacciones y Rules como una unidad en la fase correspondiente.
- Probar permisos permitidos y denegados en Emulator Suite.
- Verificar concurrentemente la última plaza antes de integrar Firebase remoto.
- Evaluar servidor solo con un requisito de confianza, atomicidad u operación privilegiada demostrado.
