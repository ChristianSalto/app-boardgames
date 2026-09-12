# ADR-005 — Boundary de Game Listings y contacto privado separado

- **Estado:** aceptada
- **Fecha:** 2026-09-12

## Contexto

La Fase 6 incorpora «Juegos de la comunidad» como segundo eje subordinado a las partidas. El incremento necesita anuncios de venta e intercambio, intereses privados y una forma mínima de continuar fuera del sistema tras una aceptación, sin convertir el producto en ecommerce ni introducir chat.

Guardar datos de contacto en el anuncio facilitaría la lectura, pero Firestore autoriza documentos completos y no oculta campos. Reutilizar el email de Firebase Auth mezclaría identidad técnica con una divulgación de producto que debe ser voluntaria. También era necesario decidir si los intereses debían ser parte del anuncio, una colección global o datos subordinados.

## Decisión

- Crear `game-listings` como boundary propio para anuncios, intereses y el handoff contextual de contacto.
- Mantener fuera pagos, reservas, logística, chat, reputación, Authentication, Player y catálogo global.
- Identificar propietarios e interesados mediante el `PlayerId` transversal ya aprobado, sin importar entidades de `players` ni tipos Firebase.
- Modelar `GameListing` con venta/intercambio, condición cerrada, una imagen por URL agnóstica del proveedor y ciclo terminal `active` → `closed`.
- Modelar `ListingInterest` separado, único por anuncio y Player, con `pending | accepted | declined`. Aceptar no reserva ni cierra.
- Persistir conceptualmente los intereses como `gameListings/{listingId}/interests/{playerId}`.
- Mantener el medio de contacto en `gameListings/{listingId}/contactHandoffs/{playerId}`, separado del anuncio y disponible solo para el propietario y esa persona con interés aceptado.
- No obtener el contacto automáticamente de Firebase Auth. El propietario decide qué dato compartir.
- Mantener Firebase en Infrastructure detrás de ports definidos por Application.

## Alternativas consideradas

### Contacto dentro del anuncio

Reduce documentos, pero expone datos privados a toda audiencia capaz de leer el anuncio y hace frágiles las Rules. Se descarta.

### Contacto en Player o derivado de Authentication

Evita una entrada repetida, pero convierte un dato contextual en atributo general del perfil o reutiliza una credencial para un fin no consentido. Se descarta.

### Intereses en una colección global

Facilita algunas consultas transversales, pero hace menos visible la pertenencia, exige filtros de seguridad más amplios y no mejora los flujos actuales por anuncio. Se mantiene como alternativa futura si aparece una necesidad de consulta global demostrada.

### Intereses embebidos en GameListing

Reduce lecturas iniciales, pero mezcla datos privados con el documento publicable, genera arrays crecientes y aumenta contención. Se descarta.

## Consecuencias

### Positivas

- El anuncio público no contiene email, teléfono ni otro contacto privado.
- Ownership y unicidad del interés se reflejan en la ruta.
- Security Rules pueden distinguir anuncio, relación privada y handoff.
- La sustitución futura del handoff por chat no exige cambiar `GameListing`.
- Domain y Application permanecen independientes de Firebase y Storage.

### Costes y riesgos

- El detalle puede necesitar más de una lectura autorizada.
- Consultas transversales de intereses requerirán `collectionGroup` e índices si llegan a aprobarse.
- 007E deberá probar la relación entre anuncio, interés aceptado y contacto sin relajar permisos.
- Deben decidirse retención y revocación del dato de contacto antes de pruebas públicas.
- La subida de imagen y la estabilidad de su URL siguen pendientes; este ADR no autoriza Storage.

### Seguimiento

- 007C implementará solo Domain, Application y persistencia aprobados, con Emulator Suite.
- 007D integrará Presentation sin acceder directamente a Firebase.
- 007E concretará y probará las Security Rules y los índices del esquema real.
