# Migración de Designfolio a MySQL/Hostinger

Estado: **en curso, solo entorno local. No desplegar a producción.**

> Auditoría forense: 2026-09-16. Revisado contra el código real del checkout
> `C:\Users\Beto\Documents\APP\designfolio-new` (rama `codex/hostinger-mysql-migration`,
> HEAD `953479b` + 47 rutas sin commitear) y contra la base MySQL local en ejecución.
> Cada afirmación de esta sección fue verificada ejecutando el código o consultando la
> base, no leyendo el documento anterior.

---

## 0. Bloqueantes detectados en la auditoría

Estos puntos no estaban en el documento anterior y tienen prioridad sobre todo lo demás.

### B1 — El build está roto — ✅ RESUELTO (2026-09-17, commit `f9ba825`)

`ModerationLogEntry` declaraba el payload del RPC de Supabase mientras
`moderateWorkAction` escribía otro. Ahora el payload se declara como
`Record<string, unknown>` (es JSON sin validar) y el enum se estrecha con un
filtro en vez de un cast. `npm run build` y `npx tsc --noEmit` pasan.

*Diagnóstico original:*

`npm run build` y `npx tsc --noEmit` **fallaban**:

```
lib/server/actions/moderation.ts(80,10): error TS2352
Conversion of type '{ ...payload: Record<string, unknown>... }[]' to type 'ModerationLogEntry[]'
may be a mistake because neither type sufficiently overlaps with the other.
```

El documento anterior afirmaba «Verificaciones realizadas: TypeScript, build de Next.js».
Eso dejó de ser cierto. Ningún despliegue es posible mientras esto no se corrija.

### B2 — Toda la migración está fuera de control de versiones — ✅ RESUELTO (2026-09-16)

Las 47 rutas quedaron en 8 commits temáticos sobre `codex/hostinger-mysql-migration`,
y el proyecto de clase en su estado Supabase quedó congelado en el tag
`aula-v1-supabase` (commit `953479b`).

Matiz sobre el diagnóstico original: el **proyecto de clase sí estaba commiteado y
publicado** en GitHub desde hacía 5 meses. Lo que estaba suelto en disco era
únicamente el trabajo de migración a MySQL encima de él.

*Diagnóstico original:*

`git status` en el checkout principal reporta **47 rutas modificadas o sin seguimiento**,
incluyendo `lib/db/`, `lib/auth.ts`, `lib/server/`, `app/api/`, `drizzle/`, `scripts/` y
este mismo `docs/`. Nada de la migración MySQL está commiteado. Un `git checkout`, un
`git clean` o un fallo de disco borra semanas de trabajo sin recuperación posible.
**Esto se resuelve antes que cualquier otra tarea técnica.**

### B3 — El registro por invitación no puede funcionar (bug estructural)

En `lib/auth.ts`, el hook `databaseHooks.user.create.before` marca el código como usado:

```ts
await getDb().update(invitationCodes)
  .set({ usedBy: user.id, usedAt: now })
```

Pero la fila en `profiles` se crea recién en el hook `after`. Y la migración
`drizzle/0001_whole_frog_thor.sql` define:

```sql
ALTER TABLE `invitation_codes` ADD CONSTRAINT `invitation_codes_used_by_profiles_id_fk`
FOREIGN KEY (`used_by`) REFERENCES `profiles`(`id`) ...
```

El `UPDATE` referencia un `profiles.id` que todavía no existe → **MySQL error 1452** en
cada canje. La base confirma que esto nunca se probó: `invitation_codes` tiene **0 filas**.

Efecto combinado con B4: **hoy nadie puede registrarse salvo el correo de
`BOOTSTRAP_ADMIN_EMAIL`.**

### B4 — No existe forma de generar códigos de invitación en MySQL

No hay ninguna ruta bajo `app/api/` ni server action para crear o listar invitaciones.
`components/moderation/InviteCodesManager.tsx` sigue apuntando a Supabase, y
`components/auth/ClaimInviteCode.tsx` no está renderizado por ningún componente (quedó
huérfano al retirarse el callback OAuth).

### B5 — Doble fuente de verdad para la autorización de fundador

`app/(protected)/dashboard/moderation/page.tsx` sigue resolviendo identidad y permiso
contra Supabase:

```ts
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase.from("profiles").select("is_founder")...
```

Mientras tanto `app/(protected)/layout.tsx` ya resuelve sesión y perfil contra MySQL vía
Better Auth. `.env.local` **todavía contiene `NEXT_PUBLIC_SUPABASE_URL` y
`NEXT_PUBLIC_SUPABASE_ANON_KEY`**, así que el panel de moderación consulta un proyecto
Supabase vivo y desincronizado de MySQL. Dos sistemas distintos deciden quién es fundador.

### B6 — `scripts/make_founder.ts` promueve a TODOS los usuarios — ✅ RESUELTO (2026-09-17, commit `dd59d68`)

Ahora exige un correo como argumento, resuelve el id en la tabla `user` de Better
Auth y aborta si `NODE_ENV === "production"`. Verificado por sus tres caminos:
sin argumento, con correo inexistente y con `NODE_ENV=production`; ninguno
modifica datos.

Pendiente aparte: los 2 perfiles de la base local siguen siendo fundadores porque
el script viejo ya se ejecutó. Hay que degradar uno para poder probar el camino de
usuario no fundador (ver 3.5).

*Diagnóstico original:*

```ts
await db.update(profiles).set({ isFounder: true });   // sin WHERE
```

Y ya fue ejecutado: la base local tiene 2 perfiles y **ambos con `is_founder = 1`**, uno
de ellos incluso sin onboarding completado. Si este script llega a producción es una
escalada de privilegios total. Debe recibir un `WHERE` por email y una guarda que aborte
si `NODE_ENV === "production"`, o eliminarse.

### B7 — La página pública de proyecto depende del cliente Supabase del navegador

`app/proyectos/[id]/page.tsx` renderiza `components/works/WorkDetail.tsx`, que hace
`createClient()` de `@supabase/ssr` en el cuerpo del componente cliente (línea 71). Si se
retiran las variables `NEXT_PUBLIC_SUPABASE_*` para producción,
`createBrowserClient(undefined!, undefined!)` revienta y **la página pública de cada
proyecto deja de renderizar**. Es decir: retirar Supabase sin migrar `WorkDetail` rompe la
parte visible del sitio, no solo el dashboard.

### B8 — El selector de etiquetas está vacío

`components/works/CreateWorkForm.tsx` consume `hooks/useTaxonomy.ts`, que hoy es un stub:
devuelve `tags: []`, categorías hardcodeadas desde `WORK_CATEGORIES` y funciones
`assignTagsToWork` / `assignCategoryToWork` que retornan `{ success: true }` sin escribir
nada. La base lo confirma: los 2 proyectos publicados tienen `JSON_LENGTH(tags) = 0`, y la
tabla `taxonomy` contiene 1 tag y **0 categorías**. Existe un hook correcto y ya migrado
(`hooks/useTags.ts` → `lib/server/actions/taxonomy.ts`) que el formulario no usa.

---

## 1. Ya migrado y verificado (confirmado por auditoría)

- Base MySQL con Drizzle: 13 tablas creadas y activas (`profiles`, `works`, `likes`,
  `comments`, `notifications`, `invitation_codes`, `taxonomy`, `moderation_log`, más
  `user`, `account`, `session`, `verification` de Better Auth y `__drizzle_migrations`).
  Migraciones `0000` y `0001` aplicadas.
- Autenticación Better Auth: registro email/contraseña, verificación de correo y
  restablecimiento. Verificado en base: 2 usuarios, ambos con `emailVerified = 1`.
- SMTP local vía Mailpit (`compose.mysql.yaml`), `lib/email.ts` con nodemailer.
- Feed público, detalle de proyecto, likes de visitante/usuario, comentarios y
  notificaciones sobre MySQL (`app/api/feed`, `app/api/works/*`, `app/api/notifications`).
- Identidad de visitante anónimo con cookie httpOnly (`lib/server/actor.ts`).
- Creación de proyectos vía `app/api/works/route.ts`: slug único, validación de título,
  descripción, categoría, cantidad de medios, formato y peso; auto-aprobación de fundador.
- Subida local a `public/uploads/`, bloqueada explícitamente con 503 cuando
  `NODE_ENV === "production"` (`app/api/works/upload/route.ts`).
- Onboarding, perfil, avatar, "Mis proyectos", archivar/restaurar/eliminar y estadísticas
  personales: sin Supabase.
- `proxy.ts` (middleware) limpio de Supabase; solo limpia parámetros de tracking.
- `.gitignore` actualizado: ignora `/public/uploads/`, permite `.env.example`.
- **Taxonomía de lectura y administración de tags**: `hooks/useTags.ts`,
  `hooks/useTagsAdmin.ts` y `app/(protected)/dashboard/moderation/tags/page.tsx` ya operan
  contra `lib/server/actions/taxonomy.ts` con Drizzle.
  *(El documento anterior los listaba como pendientes; ya están hechos.)*

### Advertencia sobre el alcance de "verificado"

La base local demuestra que varios caminos **nunca se ejercitaron**:

| Camino | Evidencia en la base |
|---|---|
| Publicación con video | Los 2 proyectos son `image/jpeg` únicamente. Ningún `video/*`. |
| Cola `pending_review` → aprobar | Ambos entraron como `approved` por auto-aprobación de fundador. |
| Registro de decisiones | `moderation_log` tiene **0 filas**. |
| Canje de invitación | `invitation_codes` tiene **0 filas**. |
| Etiquetado de proyectos | Ambos proyectos con **0 tags**. |

---

## 2. Código muerto — ✅ ELIMINADO (2026-09-17, commit `89327ca`)

El documento anterior listaba estos archivos como «pendientes de migrar». Ninguno
tenía importadores; migrarlos habría sido trabajo desperdiciado. Se borraron:

| Archivo | Motivo |
|---|---|
| `hooks/useCreateWork.ts` (224 líneas) | Reemplazado por `hooks/useCreateWorkMySql.ts` |
| `components/auth/ClaimInviteCode.tsx` (42 líneas) | Ningún componente lo renderizaba |
| `app/auth/callback/route.ts` (39 líneas) | Callback OAuth de Supabase, ruta pública que Better Auth no usa (`socialProviders` vacío) |

Con eso, los archivos con Supabase bajaron de 16 a 13.

Y en sentido inverso, hay código escrito que **no está conectado a nada**:

- `lib/server/actions/moderation.ts` implementa `getModerationQueueAction`,
  `getModerationStatsAction`, `getModerationHistoryAction` y `moderateWorkAction` (con
  escritura en `moderation_log` y notificaciones `work_approved` / `work_rejected`).
  **Ningún archivo lo importa.** El panel sigue usando `hooks/useModeration.ts`, que es
  100 % Supabase y llama a los RPC `moderate_work` y `refresh_feed_scores` de Postgres.
  El trabajo está hecho en ~70 %, solo falta cablearlo — y es el archivo que rompe el
  build (B1).

---

## 3. Pendientes funcionales

### 3.1 Archivos que aún usan Supabase

Estado real hoy: **9 archivos de aplicación + 4 de `lib/supabase/`** = 13.
(El documento anterior listaba 15; 3 ya estaban migrados y 3 más se borraron por muertos.)

| Archivo | Líneas | Refs | Acción |
|---|---:|---:|---|
| `hooks/useModeration.ts` | 190 | 13 | Cablear a `lib/server/actions/moderation.ts` |
| `components/moderation/WorksManager.tsx` | 316 | 9 | Migrar a server actions |
| `components/moderation/UsersManager.tsx` | 326 | 7 | Requiere acciones de admin de usuarios (no existen) |
| `components/moderation/InviteCodesManager.tsx` | 286 | 9 | Requiere API de invitaciones (no existe) |
| `components/works/WorkDetail.tsx` | 654 | 8 | **Ruta pública** — ver B7 |
| `hooks/useTaxonomyAdmin.ts` | 73 | 7 | Migrar o fusionar con `useTagsAdmin` |
| `app/(protected)/dashboard/moderation/page.tsx` | 27 | 4 | Ver B5 |
| `app/(protected)/dashboard/work/[id]/page.tsx` | 82 | 7 | Migrar |
| `app/(protected)/dashboard/profile/[username]/page.tsx` | 36 | 4 | Migrar |
| `lib/supabase/{client,server,storage,avatar}.ts` | — | — | Borrar al final |

Al terminar: retirar `@supabase/ssr` y `@supabase/supabase-js` de `package.json` y
eliminar `NEXT_PUBLIC_SUPABASE_*` de `.env.local`.

### 3.2 Moderación

- Cablear `useModeration` a las server actions existentes y corregir el error de tipos (B1).
- **Corregir `getModerationHistoryAction`**: hoy lee de `notifications`, no de
  `moderation_log`. El historial mostrado no es el registro de auditoría, es un efecto
  secundario del mismo.
- Faltan acciones de fundador para **archivar** y **eliminar** proyectos (el enum
  `moderation_log.action` ya contempla `archive` y `delete`; nadie los escribe).
- Falta administración de usuarios: listado, activar/desactivar (`profiles.is_active`) y
  conteo de proyectos.
- Falta administración de **categorías** en `taxonomy` (hoy 0 filas de tipo `category`;
  las categorías vienen hardcodeadas de `types/work.ts`).

### 3.3 Invitaciones

- Corregir el orden de canje (B3): mover el marcado de `used_by` al hook `after`, después
  de crear el perfil, o retirar la FK y validar por aplicación. Envolver creación de
  usuario + perfil + canje en una transacción.
- Crear API de fundador para generar y listar códigos.
- Definir expiración por defecto, revocación y auditoría.
- Mostrar el código en claro una sola vez; en base solo el hash (`hashInviteCode` ya existe
  en `lib/invitations.ts` y usa SHA-256; considerar que un hash sin sal de un código corto
  es enumerable por fuerza bruta — usar códigos de al menos 128 bits de entropía).
- Reescribir `InviteCodesManager` sobre esa API.

### 3.4 Creación de proyectos

- Conectar `CreateWorkForm` a `useTags` en lugar del stub `useTaxonomy` (B8), o completar
  `useTaxonomy` contra `lib/server/actions/taxonomy.ts`.
- Poblar `taxonomy` con las categorías reales.

### 3.5 Pruebas funcionales que faltan ejecutar

- Publicar un proyecto **con video** (nunca se hizo).
- Publicar desde una cuenta **no fundadora** para que entre en `pending_review`.
- Aprobar y rechazar desde el panel, verificando que `moderation_log` recibe la fila y que
  el autor recibe la notificación.

---

## 4. Almacenamiento de producción

Sigue pendiente en su totalidad.

- No usar `public/uploads/` en Hostinger: se pierde en cada despliegue y no escala.
- Elegir almacenamiento S3-compatible: Cloudflare R2, Backblaze B2 o Amazon S3.
- Carga directa firmada, validación por contenido real y borrado de medios huérfanos.
- CDN/dominio de medios y límites de video para producción.

**Hallazgo adicional:** en `app/api/works/route.ts` la validación de pertenencia de los
medios está deshabilitada justamente en producción:

```ts
if (process.env.NODE_ENV !== "production" && images.some(...)) return invalid(...)
```

En producción el campo `images[].url` se acepta sin verificar que apunte al prefijo del
usuario. Al conectar el almacenamiento remoto hay que invertir esa condición y validar
siempre contra el prefijo firmado que emita el backend.

---

## 5. Preparar Hostinger

**Verificado en la cuenta (2026-09-17):**

| | |
|---|---|
| Plan | Business Web Hosting, activo y pagado hasta **2028-10-10** |
| Node.js | **Soportado y en uso**: ya corren 3 apps Node en ese plan (`barberia.jhonnyduque.com`, `app.draeleanagomez.com`, y una más) |
| Subdominio | **`designfolio.jhonnyduque.com` ya está creado** desde 2026-02-11 |
| VPS | Ninguno |

Esto resuelve la incógnita mayor del plan original —si el hosting aguanta
Next.js persistente— y elimina la necesidad de partir la infraestructura entre
Vercel y Hostinger. Con la app y MySQL en el mismo host, la base se conecta por
`localhost`: sin IPs dinámicas que autorizar ni saturación de conexiones desde
funciones serverless.

Motivo de la migración, para que quede registrado: **Supabase pausó y eliminó la
base de datos por inactividad** en su plan gratuito. Vercel no borró nada. El
problema era de hosting de base de datos, no de frontend.

- Crear base MySQL y usuario exclusivos para Designfolio.
- Crear correo SMTP real (`SMTP_USER` / `SMTP_PASSWORD` hoy no están en `.env.local`; solo
  funciona Mailpit sin autenticación).
- Definir variables de producción: `DATABASE_URL`, `BETTER_AUTH_URL`,
  `BETTER_AUTH_SECRET`, SMTP y almacenamiento.
- Aplicar migraciones MySQL y el esquema de Better Auth (`sql/auth-schema.sql`) en la nueva
  base.
- **Copias de seguridad automáticas: primer paso después de crear la base, no el último.**
  Este proyecto ya perdió todos los datos del curso una vez, sin dump ni export que
  recuperar. El respaldo se configura *antes* de que entre contenido real, no en la fase
  de endurecimiento. Concretamente: un cron job en Hostinger con `mysqldump` diario,
  rotación de al menos 7 días, y **una restauración probada de verdad** sobre una base
  vacía — un backup que nunca se restauró no es un backup.
- ~~Verificar que el hosting soporte Node.js/Next.js persistente~~ — confirmado arriba.

---

## 6. Seguridad y operación antes de producción

- **Retirar o blindar `scripts/make_founder.ts`** (B6) — prioridad máxima.
- Rate limiting en registro, login, comentarios, likes, subida y restablecimiento.
- CAPTCHA o equivalente en registro y formularios de visitante.
- Validación de firma/binario de archivos: `lib/media.ts` hoy confía solo en `file.type`,
  que el navegador controla.
- Restaurar la validación de pertenencia de medios en producción (sección 4).
- Logs de errores con datos sensibles filtrados.
- Monitoreo de disponibilidad, backups y alertas de disco/base.
- Revisión de permisos fundador / usuario / visitante con cuentas reales separadas (hoy
  imposible: los 2 perfiles de la base local son fundadores).

Detalle menor: en `proxy.ts` se eliminan claves mientras se itera
`cleanedUrl.searchParams.keys()`; borrar durante la iteración salta la clave siguiente.
Iterar sobre una copia (`[...keys()]`).

---

## 7. Plan de resolución

### Fase 0 — Asegurar el trabajo — ✅ COMPLETADA (2026-09-16)

1. ✅ Verificado que `.env.local`, `.env.mysql.local` y `public/uploads/` están
   ignorados, y escaneado el árbol en busca de credenciales antes de commitear.
2. ✅ Las 47 rutas quedaron en 8 commits temáticos.
3. ✅ Tag `aula-v1-supabase` sobre `953479b`.
4. ⏳ `git push` de la rama. **No tocar `main`.**

### Fase 1 — Desbloquear el build — ✅ COMPLETADA (2026-09-17)

5. ✅ `f9ba825` — tipos del historial de moderación corregidos.
6. ✅ `dd59d68` — `make_founder.ts` con guarda de producción y correo obligatorio.
7. ✅ `89327ca` — borrados los 3 archivos muertos.

*Criterio de salida:* `npm run build` y `npx tsc --noEmit` pasan. Verificado.

### Fase 2 — Cerrar moderación

7. Reescribir `hooks/useModeration.ts` sobre las server actions existentes.
8. Corregir `getModerationHistoryAction` para leer de `moderation_log` con join a `works` y
   `profiles`.
9. Añadir `archiveWorkAction` / `deleteWorkAction` de fundador, con escritura en
   `moderation_log`.
10. Migrar `app/(protected)/dashboard/moderation/page.tsx` al patrón de
    `app/(protected)/layout.tsx` (Better Auth + Drizzle) y eliminar la doble fuente de
    verdad.
11. Migrar `WorksManager.tsx`.
12. **Prueba:** crear un usuario no fundador, publicar con imágenes y con video, aprobar
    uno y rechazar otro, verificar `moderation_log` y `notifications`.

### Fase 3 — Reabrir el registro

13. Corregir el canje de invitaciones (B3) con transacción y orden correcto.
14. Crear server actions de fundador: generar, listar, revocar códigos (con expiración).
15. Reescribir `InviteCodesManager.tsx`.
16. **Prueba:** generar código, registrar cuenta nueva con él, verificar que queda marcado
    usado y que no se puede reutilizar ni usar uno expirado.

### Fase 4 — Cerrar paneles y retirar Supabase

17. Administración de usuarios (server actions) + `UsersManager.tsx`.
18. Migrar `hooks/useTaxonomyAdmin.ts` y poblar categorías en `taxonomy`.
19. Conectar `CreateWorkForm` al hook de tags real (B8).
20. Migrar `WorkDetail.tsx` (ruta pública), `dashboard/work/[id]` y
    `dashboard/profile/[username]`.
21. Borrar `lib/supabase/`, quitar `@supabase/*` de `package.json`, eliminar
    `NEXT_PUBLIC_SUPABASE_*` de `.env.local`.
22. **Prueba:** `grep -rn supabase app components hooks lib` devuelve vacío y el build pasa.

### Fase 5 — Almacenamiento persistente

23. Elegir proveedor S3-compatible y configurar bucket + credenciales.
24. Implementar carga directa firmada y validación por magic bytes.
25. Invertir la condición de validación de `images[].url` en producción.
26. Borrado de medios huérfanos y límites de video.

### Fase 6 — Endurecimiento y despliegue

27. Rate limiting y CAPTCHA.
28. Logs filtrados, monitoreo, backups con restauración probada.
29. Infraestructura Hostinger: base, usuario, SMTP real, variables.
30. Despliegue de prueba en subdominio, con cuentas separadas de fundador / usuario /
    visitante.
31. Validar producción y **solo entonces** retirar Supabase del proyecto remoto.

### Dependencias

```
F0 ──> F1 ──> F2 ──┬──> F4 ──> F5 ──> F6
                   └──> F3 ──┘
```

F2 y F3 pueden avanzar en paralelo tras F1. F4 requiere ambas. F6 requiere F5.

---

## 8. Comandos locales útiles

```powershell
docker compose -f compose.mysql.yaml up -d
npm run dev
npx drizzle-kit migrate
npx tsc --noEmit
npm run build
```

Mailpit: http://localhost:8025 — MySQL local: `127.0.0.1:3307`

---

## 9. Nota sobre producción actual

**Corrección importante (2026-09-17).** Este documento asumía que había una producción
sana que proteger. No la hay: Supabase eliminó la base de datos, así que
`designfolio-six.vercel.app` sirve el cascarón de Next.js contra un backend que ya no
existe. No hay nada que preservar y sí algo que recuperar, de modo que **desplegar la
migración es ganancia neta**, no riesgo.

Consecuencia práctica: la cautela deja de estar en «no desplegar» y pasa a estar en
«desplegar en el orden correcto».

- Los datos del curso —proyectos, likes y comentarios de los estudiantes— se perdieron
  con la base, de forma definitiva: **no existe dump ni export** (confirmado
  2026-09-17). El tag `aula-v1-supabase` conserva el código, no el contenido. Si el
  aula se reactiva algún día, arranca vacía.
- Sigue vigente B7: retirar las variables `NEXT_PUBLIC_SUPABASE_*` sin haber migrado
  `components/works/WorkDetail.tsx` rompe la página pública de cada proyecto.
- `main` se toca solo cuando el portafolio esté verificado en el subdominio.
