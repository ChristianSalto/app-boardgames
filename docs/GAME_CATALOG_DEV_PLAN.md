# BETA-R02D3 — Catálogo inicial DEV y plan de publicación

**Estado:** propuesta local para revisión humana. No se ha consultado ni modificado cloud. Este documento no autoriza bootstrap o despliegue.

## Catálogo exacto

Fuente: `tests/fixtures/catalogGames.ts`, arreglo `catalogGames`, con ocho entradas. `searchCatalogGames` añade una novena entrada de prueba, `ticket-to-ride` / Ticket to Ride / «Aventureros al Tren», que **no** pertenece al lote inicial. La fixture de anuncios de Marketplace tampoco es fuente para este catálogo.

| gameId (`games/{id}`) | Nombre canónico (`name`) | Aliases | Motivo de alias |
| --- | --- | --- | --- |
| `terraforming-mars` | Terraforming Mars | Ninguno | No existe alias declarado para esta entrada. |
| `dune-imperium` | Dune: Imperium | Ninguno | No existe alias declarado para esta entrada. |
| `wingspan` | Wingspan | Ninguno | No existe alias declarado para esta entrada. |
| `azul` | Azul | Ninguno | No existe alias declarado para esta entrada. |
| `root` | Root | Ninguno | No existe alias declarado para esta entrada. |
| `brass-birmingham` | Brass: Birmingham | Ninguno | No existe alias declarado para esta entrada. |
| `7-wonders` | 7 Wonders | Ninguno | No existe alias declarado para esta entrada. |
| `ark-nova` | Ark Nova | Ninguno | No existe alias declarado para esta entrada. |

Documento esperado: solo `{ name: '<nombre canónico>' }`; `aliases` se omite, no se guarda como lista vacía ni se almacena `gameId` dentro del documento. El ID es el del documento Firestore. El adaptador actual lee `name` y `aliases` opcional.

Los ocho IDs son literales internos de la fixture, únicos y válidos conforme a `isValidGameId`. No se derivan de BGG ni existe un generador en el flujo actual. **Son aptos para persistencia si se congelan como identidad inmutable:** jamás volver a generarlos desde el nombre visible, traducción o idioma. Parecen slugs descriptivos; esto invita a renombrarlos cuando cambie un título, cosa que debe prohibirse. IDs opacos serían una opción para altas futuras, sin cambiar estos ocho ahora. Si cambia un nombre canónico, habrá que revisar aparte las Rules que exigen igualdad exacta `gameId/gameName` al crear o cambiar de juego y el fallback de partidas históricas en Explorar. D3 no cambia nombres ni migra sesiones.

## Contrato del bootstrap propuesto

Diseñar y, **tras revisión manual**, implementar `scripts/bootstrap-game-catalog-dev.mjs` con `firebase-admin` como dependencia de desarrollo directa y lockfile actualizado. No existe Admin SDK en las dependencias actuales. El script importará solo `catalogGames`, no `searchCatalogGames`, para evitar duplicar datos. El runtime local es Node 24 y puede cargar la fixture TypeScript con `--experimental-strip-types`; se deberá fijar/verificar Node antes de ejecutarlo. No usar SDK cliente: las Rules deniegan escrituras de clientes en `games` y Admin requiere protección explícita del destino.

- El comportamiento por defecto será **dry-run de solo lectura**. Exigir `--project mesa-abierta-dev` siempre. La escritura exige además `--apply --confirm-project mesa-abierta-dev`. Rechazar argumentos desconocidos, `FIRESTORE_EMULATOR_HOST` en la operación DEV y variables explícitas de proyecto contradictorias. Verificar el proyecto real de las credenciales ADC/servicio antes de inicializar Firestore; inicializar con proyecto literal `mesa-abierta-dev` y base `(default)`. No mostrar credenciales ni guardar claves en Git. Usar identidad administrativa limitada al proyecto DEV. La sesión de Firebase CLI no sustituye necesariamente las credenciales ADC del Admin SDK.
- Validar ocho IDs únicos, formato y nombre; no aceptar aliases nuevos. Leer la colección `games` completa: si hay IDs ajenos al lote, abortar para revisión. Clasificar por ID como **CREAR** (ausente), **SIN CAMBIOS** (documento exactamente `{name}`) o **CONFLICTO / ACTUALIZARÍA** (campos o valores distintos). Mostrar IDs y recuentos de las tres clases. En este bootstrap `ACTUALIZARÍA` significa bloqueo: ninguna actualización automática está autorizada.
- Ante cualquier conflicto, abortar antes de escribir. Con `--apply`, crear todos los ausentes en un único batch atómico con `WriteBatch.create` (precondición de inexistencia), sin `set`, merge ni upsert. Una carrera entre lectura y creación hace fallar el batch entero. Releer los ocho tras commit y exigir igualdad exacta. Repetir tras éxito produce `CREAR 0 / SIN CAMBIOS 8 / CONFLICTO 0`, sin escrituras. Código de salida no cero para destino/credenciales dudosos, extras, conflictos, fallo de commit o verificación.
- Probar antes la clasificación, carrera y fallos con adaptador falso o Emulator local; no ejecutar aún dry-run ni apply sobre DEV.

El Admin SDK usa credenciales privilegiadas y omite Rules ([Firebase](https://firebase.google.com/docs/firestore/security/get-started)); `WriteBatch.create` falla si un documento existe y el commit es atómico ([Firestore](https://googleapis.dev/nodejs/firestore/latest/WriteBatch.html)). En D3 se entrega este diseño; **no se instala Admin SDK ni se crea/ejecuta el script** hasta que se aprueben los ocho registros.

## Orden exacto para una tarea posterior autorizada

**Preflight:** fijar un commit revisado que incluya R02D1/D2 y las Rules; hoy hay cambios sin commit. Registrar contenido y versión de las Rules remotas, release anterior de Hosting, cuenta y proyecto. Confirmar que `.env.cloud.local` privado apunta a `mesa-abierta-dev` con `VITE_USE_FIREBASE_EMULATORS=false`, sin imprimir valores sensibles. Verificar Auth, Player y `betaTesters/{uid}.active=true` de Belial/Redon/Pau/Ivy sin inventar UIDs. Implementar y probar localmente el script. Estos comandos son **futuros, no ejecutados en D3**:

```powershell
npm.cmd run typecheck
npm.cmd run test:rules
npm.cmd run test:game-sessions
npm.cmd run build:cloud
git diff --check
```

1. **Rules.** Inspeccionar la versión remota y luego publicar solo `firestore:rules`, no índices, Storage u Hosting. La Rules local acepta sesiones sin `gameId` y exige coincidencia con `games/{id}` cuando hay ID. Por tanto el frontend anterior que crea por nombre sigue funcionando. Verificar lectura/creación anterior y control de acceso beta. El CLI sobrescribe Rules editadas en consola ([Firebase](https://firebase.google.com/docs/rules/manage-deploy)); una divergencia detiene el despliegue.

```powershell
.\node_modules\.bin\firebase.cmd deploy --only firestore:rules --project mesa-abierta-dev
```

2. **Catálogo.** Ya implementado y aprobado el script, ejecutar dry-run. Si DEV sigue vacío, esperar `CREAR 8 / SIN CAMBIOS 0 / CONFLICTO 0`. Cualquier diferencia se revisa antes de continuar. Ejecutar apply y repetir dry-run, esperando ocho sin cambios. No publicar Hosting si falta un juego o existe un conflicto.

```powershell
node --experimental-strip-types scripts/bootstrap-game-catalog-dev.mjs --project mesa-abierta-dev --dry-run
node --experimental-strip-types scripts/bootstrap-game-catalog-dev.mjs --project mesa-abierta-dev --apply --confirm-project mesa-abierta-dev
node --experimental-strip-types scripts/bootstrap-game-catalog-dev.mjs --project mesa-abierta-dev --dry-run
```

3. **Hosting.** Confirmar que `dist` sale del mismo commit y de build en modo cloud para DEV, sin emuladores. `firebase.json` sirve `dist` con rewrite SPA; el script existente `deploy:hosting:dev` fija el proyecto. Publicar solo Hosting y ejecutar el smoke manual. No usar `firebase deploy --dry-run` como prueba sin escritura: el `--help` del CLI instalado advierte que puede habilitar APIs remotas.

```powershell
npm.cmd run build:cloud
npm.cmd run deploy:hosting:dev
```

## Rollback

- **Falla Rules:** detenerse; no iniciar catálogo ni Hosting. Si la versión nueva no quedó activa, conservar la previa. Si se activó y rompe el frontend anterior, publicar la **fuente remota previa** guardada en preflight con un `firebase.json` temporal que apunte a esa copia: `firebase deploy --only firestore:rules --config <config-temporal> --project mesa-abierta-dev`. No suponer que HEAD coincide con las Rules cloud previas.
- **Falla bootstrap:** no publicar Hosting. El batch propuesto es atómico; verificar los ocho, corregir el motivo y repetir dry-run. Los documentos idénticos de un intento previo se omiten. No borrar juegos ni migrar sesiones como rollback rutinario.
- **Falla Hosting:** si no quedó una release nueva, la anterior sigue sirviendo. Si se activó una release defectuosa, usar **Roll back** sobre la release anterior en Firebase Hosting ([procedimiento oficial](https://firebase.google.com/docs/hosting/manage-hosting-resources)). Mantener nuevas Rules y catálogo: son compatibles con el frontend anterior y retirarlos podría bloquear sesiones catalogadas creadas antes del rollback.

## Smoke manual post-deploy (no ejecutar en D3)

Prerequisitos: las cuatro cuentas beta activas y una partida histórica real identificada sin `gameId`. Si no existe, marcar esa comprobación pendiente; no fabricar histórico mediante migración o seed. Verificar también persistencia mediante lectura autorizada, no solo UI.

1. **Belial:** buscar Azul en Crear, seleccionarlo y publicar una partida futura. Confirmar `gameSessions/{id}` con `gameId='azul'` y `gameName='Azul'`; el organizador ocupa plaza.
2. **Redon:** seleccionar Azul en Explorar y encontrar la partida. Comprobar `?game=Azul&gameId=azul`, recarga y regreso desde detalle con filtros/scroll; abrir también `?game=Azul` antiguo y comprobar que filtra sin añadir ID automáticamente.
3. **Belial:** editar sin cambiar el juego y confirmar que mantiene `azul/Azul`; cambiar después a Root y comprobar `root/Root` en documento, Explorar y URL.
4. **Ivy:** usar fallback no catalogado en una partida ordinaria y confirmar `gameName` sin `gameId`, búsqueda textual y que limpiar solo juego conserva fecha/zona.
5. **Pau:** abrir una partida histórica preexistente sin `gameId` y buscarla por texto. Si su nombre coincide con uno de los ocho tras normalización, comprobar que aparece al elegir ese juego catalogado; si no, dejar esa subcondición pendiente. Comprobar exclusión de otro ID con igual nombre visible solo si existe un caso legítimo.

Registrar resultados y IDs de prueba; no crear cuentas ni datos masivos como parte del smoke.

## Riesgos y decisión pendiente

El estado cloud actual (Rules, Hosting, ausencia de `games`) procede del contexto humano; **D3 no lo ha comprobado remotamente**. Antes de autorizar escritura: aprobar los ocho registros, preparar credenciales ADC DEV de alcance mínimo, implementar y probar script/Admin SDK y fijar commit/artefacto. El alias «Aventureros al Tren» es solo del noveno juego de prueba; no hay aliases aprobados para estos ocho. Sin cambios de Marketplace, sesiones históricas ni datos remotos.
