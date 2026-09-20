# F0 — Línea base y paridad

## Estado

F0: ✅ FINALIZADA

La línea base técnica quedó congelada en `5200a42` el 20 de septiembre de 2026. F1 permanece ⬜ NO INICIADA y requiere una aprobación independiente.

## Objetivo

Documentar la línea base real del comportamiento público y del propietario antes de cambiar la arquitectura del detalle del proyecto.

## Referencia de baseline

- Rama de trabajo: `codex/hostinger-mysql-migration`.
- Commit de congelación: `5200a42` — `fix(views): count visible feed posts reliably`.
- La documentación de cierre queda registrada en un commit documental separado del baseline de código.
- Los archivos ajenos al alcance no forman parte de ninguno de los dos commits.

## A. Rutas y comportamiento actual

### Ruta raíz

- `/`
- renderiza [app/(marketing)/page.tsx](../app/(marketing)/page.tsx)
- ese archivo devuelve `<Feed />` dentro de un contenedor público
- la raíz es el feed público, no un portal de proyectos aislado

### Ruta de listado público

- `/proyectos`
- [app/(marketing)/proyectos/page.tsx](../app/(marketing)/proyectos/page.tsx)
- comportamiento actual: redirección a `/` con `redirect("/")`
- es una ruta de compatibilidad, no la superficie principal

### Ruta de detalle público

- `/proyectos/[id]`
- [app/(marketing)/proyectos/[id]/page.tsx](../app/(marketing)/proyectos/[id]/page.tsx)
- usa `getPublicWork(slugOrId)` desde [lib/works/public.ts](../lib/works/public.ts)
- si la obra existe y `slug != slugOrId`, hace redirect a `/proyectos/${work.slug}`
- si no hay resultado, `notFound()`
- luego renderiza `WorkDetail` con datos públicos y acciones públicas

### Comportamiento de UUID / slug

- `getPublicWork` acepta slug o UUID
- si el valor tiene formato UUID, consulta por `works.id`
- si no, consulta por `works.slug`
- la ruta pública normaliza a slug mediante redirect
- proyecto inexistente: `notFound()`
- proyecto no público: filtrado por `moderationStatus = approved` y `archivedAt is null`
- proyecto archivado: no se devuelve a público
- URL inválida: 404 o redirect si era un UUID que ya se resuelve a slug

## B. Permalink público

### Permalink oficial

- `/proyectos/[slug]`
- la aplicación mantiene ese contrato como URL pública estable

### Evidencia de uso

- [app/(marketing)/proyectos/[id]/page.tsx](../app/(marketing)/proyectos/[id]/page.tsx)
- [components/feed/FeedPost.tsx](../components/feed/FeedPost.tsx)
- [components/feed/MosaicCell.tsx](../components/feed/MosaicCell.tsx)
- [components/works/ShareButton.tsx](../components/works/ShareButton.tsx)
- [components/works/WorkDetail.tsx](../components/works/WorkDetail.tsx)

### Comportamiento actual

- lookup por slug o UUID
- acceso directo posible si el usuario entra a la URL exacta
- refresh conserva la URL y carga el detalle
- canonicalización no existe como metadato dinámico; el layout global solo tiene metadata estática
- ShareButton usa `pathOverride ?? /proyectos/${workId}` y en la vista pública usa `/proyectos/${work.slug ?? work.id}`
- la aplicación no está construida para un único “single visual” exclusivo; el permalink sigue siendo el enlace compartible

## C. Feed baseline

### Archivos principales

- [components/feed/Feed.tsx](../components/feed/Feed.tsx)
- [components/feed/FeedPost.tsx](../components/feed/FeedPost.tsx)
- [components/feed/MosaicCell.tsx](../components/feed/MosaicCell.tsx)
- [components/feed/ZoomableMedia.tsx](../components/feed/ZoomableMedia.tsx)
- [hooks/useFeed.ts](../hooks/useFeed.ts)
- [types/feed.ts](../types/feed.ts)
- [app/api/feed/route.ts](../app/api/feed/route.ts)

### Comportamiento actual verificado

- carga de feed por paginación con `page`, `sort`, `q`
- búsqueda por título, categoría y nombre del autor
- sort: recent, most_voted, most_commented
- infinite scroll: IntersectionObserver con rootMargin 600px
- primera carga y carga siguiente están controladas por `useFeed`
- autor, avatar, título, descripción, categoría, likes, comentarios, compartir, vistas y fecha están en el payload
- `FeedPost` incluye:
  - autor + avatar + categoría
  - `…más` / `…menos`
  - imagen, vídeo, carrusel
  - swipe por imagen
  - dots del carrusel
  - zoomable media
  - like y comentarios count
  - share
  - views
- `MosaicCell` es la versión grid del mismo contenido con overlay de likes/comentarios y vistas
- `ZoomableMedia` implementa pinch temporal en imágenes usadas por `FeedPost`; el cambio de imagen del carrusel se delega mediante `onSwipe` desde `FeedPost`.
- No hay gesto de doble toque implementado actualmente. `MosaicCell` no habilita pinch (`enablePinch={false}`).

## D. Todos los accesos públicos al single

### Tabla de accesos

| Archivo | Elemento | Evento | Destino |
| --- | --- | --- | --- |
| [components/feed/FeedPost.tsx](../components/feed/FeedPost.tsx) | autor y avatar | click / `Link` | `/dashboard/profile/${author_username}` |
| [components/feed/FeedPost.tsx](../components/feed/FeedPost.tsx) | título | click / `Link` | `/proyectos/${slug ?? id}` |
| [components/feed/FeedPost.tsx](../components/feed/FeedPost.tsx) | imagen | tap mediante `ZoomableMedia` | `/proyectos/${slug ?? id}` |
| [components/feed/FeedPost.tsx](../components/feed/FeedPost.tsx) | vídeo y contador de comentarios | click / `Link` | `/proyectos/${slug ?? id}` |
| [components/feed/MosaicCell.tsx](../components/feed/MosaicCell.tsx) | portada de imagen | tap mediante `ZoomableMedia` | `/proyectos/${slug ?? id}` |
| [components/feed/MosaicCell.tsx](../components/feed/MosaicCell.tsx) | overlay de métricas | sin `Link` propio | no navega por sí mismo |
| [components/works/ShareButton.tsx](../components/works/ShareButton.tsx) | compartir | click | `/proyectos/${slug ?? id}` o `/proyectos/${workId}` |
| [components/works/WorkDetail.tsx](../components/works/WorkDetail.tsx) | compartir interno | click | `/proyectos/${work.slug ?? work.id}` |
| [app/(marketing)/proyectos/[id]/page.tsx](../app/(marketing)/proyectos/[id]/page.tsx) | redirección de UUID | runtime | `/proyectos/${work.slug}` |
| [components/profile/UserProfile.tsx](../components/profile/UserProfile.tsx) | obras del perfil | Link hacia dashboard | `/dashboard/work/${id}` |

### Nota

La mayoría de accesos públicos se concentran en rutas de proyecto y no en un “single visual” autoritario aislado; la ruta pública sigue siendo un detalle de proyecto, aunque el layout comparte lógica de detalle con el dashboard.

## E. Single / WorkDetail

### Componente central

- [components/works/WorkDetail.tsx](../components/works/WorkDetail.tsx)

### Responsabilidades que hoy contiene

- media principal
- carrusel + swipe + teclado
- thumbnails / imágenes
- lightbox
- descripción
- categoría
- tags (recibidos en props/datos, pero no renderizados actualmente)
- fecha
- likes
- comentarios count y sección
- composer de comentarios
- compartir
- views tracking
- navegación anterior / siguiente
- owner detection basado en `currentUserId === author.id`
- edición del proyecto
- archivado
- eliminación
- confirmaciones
- permisos de acceso por sesión

### Hallazgo crítico ampliado

El mismo componente se usa para:

- detalle público desde [app/(marketing)/proyectos/[id]/page.tsx](../app/(marketing)/proyectos/[id]/page.tsx)
- detalle propietario desde [app/(protected)/dashboard/work/[id]/page.tsx](../app/(protected)/dashboard/work/[id]/page.tsx)

Esto sigue siendo el bloqueo principal para F1, pero no es suficiente para cerrar F0 por sí solo.

## F. Dashboard

### Ruta relevante

- [app/(protected)/dashboard/work/[id]/page.tsx](../app/(protected)/dashboard/work/[id]/page.tsx)

### Dependencia

- usa `getDashboardWork(id, session.user.id)`
- luego renderiza `WorkDetail`
- la diferenciación de permisos se hace dentro del mismo `WorkDetail` y en `getDashboardWork`

### Separación actual

- PUBLICO: [lib/works/public.ts](../lib/works/public.ts)
- OWNER/PROTECTED: [lib/works/dashboard.ts](../lib/works/dashboard.ts)
- compartido: [components/works/WorkDetail.tsx](../components/works/WorkDetail.tsx)

No se implementa todavía la separación arquitectónica; solo existe una separación de consultas.

## G. Likes

### Archivos clave

- [components/works/LikeButton.tsx](../components/works/LikeButton.tsx)
- [hooks/useLike.ts](../hooks/useLike.ts)
- [app/api/works/[id]/likes/route.ts](../app/api/works/[id]/likes/route.ts)

### Baseline

- `GET` consulta si el actor ya dio like
- `POST` alterna like
- contador real desde base de datos
- no hay optimistic update explícito; el estado se actualiza con la respuesta del servidor
- depende de `getActor` y del visitante/cookie para sesión anónima
- error de conexión y no encontrado están gestionados

## H. Comentarios

### Archivos clave

- [components/works/CommentsSection.tsx](../components/works/CommentsSection.tsx)
- [hooks/useComments.ts](../hooks/useComments.ts)
- [app/api/works/[id]/comments/route.ts](../app/api/works/[id]/comments/route.ts)

### Baseline

- `GET` devuelve comentarios ordenados por fecha descendente
- límite real visible: 200 comentarios en la API
- `POST` exige contenido y categoría válida
- CAPTCHA para usuarios sin sesión
- cooldown de 60 s por actor
- sesión consultada con `getActor`
- errores y loading manejados por `useComments`
- estado vacío se renderiza en la UI si no hay comentarios

No se modulariza todavía; esta fase no toca este comportamiento.

## I. Share

### Archivos clave

- [components/works/ShareButton.tsx](../components/works/ShareButton.tsx)
- [lib/client/track-share.ts](../lib/client/track-share.ts)
- [app/api/works/[id]/share/route.ts](../app/api/works/[id]/share/route.ts)

### Baseline

- `ShareButton` usa `navigator.clipboard.writeText`
- fallback mínimo: si clipboard falla, no hay reintento forzado y la acción termina sin crash
- la URL final compartida se construye con `window.location.origin + path`
- por defecto apunta a `/proyectos/${workId}` y en la UI pública se reemplaza con `/proyectos/${slug ?? id}`
- contador de compartidos se incrementa de forma deduplicada por sesión y por navegador
- la lógica está basada en `workShareReceipts` en DB

## J. Views

### Archivos clave

- [lib/client/track-view.ts](../lib/client/track-view.ts)
- [lib/views.ts](../lib/views.ts)
- [app/api/works/[id]/view/route.ts](../app/api/works/[id]/view/route.ts)

### Baseline

- la vista se intenta contabilizar con `trackView` desde la UI de feed y detalle
- la deduplicación está por `VIEW_DEDUPLICATION_MS = 24h`
- `origin` debe ser `feed_expand`, `detail_page` o `desktop_overlay`
- la API valida origen y consentimiento de analítica
- no se debe contar la vista del autor del proyecto
- si el usuario no consentía analytics, la vista no cuenta y la respuesta lo indica
- en el feed se intenta contabilizar cuando el post alcanza al menos 50 % de visibilidad
- en el detalle se intenta contabilizar tras 3 s de visibilidad continua
- `feed_expand` es un nombre técnico heredado del origen; no describe ya el disparador real

## K. Media baseline

### Baseline verificado

- imagen: tratada en la grid y feed
- vídeo: renderizado con `video` y controles
- carrusel: manejado en feed y detalle
- swipe: habilitado para cambiar imágenes
- pinch zoom: en `ZoomableMedia`
- doble toque: no está implementado en `ZoomableMedia`; no debe incluirse en la paridad actual hasta que exista una decisión e implementación explícitas
- fullscreen: existe en `WorkDetail` mediante `requestFullscreen()` sobre video

No se modifica este comportamiento en F0.

## L. Search / sort / infinite scroll

### Archivos clave

- [components/feed/Feed.tsx](../components/feed/Feed.tsx)
- [hooks/useFeed.ts](../hooks/useFeed.ts)
- [app/api/feed/route.ts](../app/api/feed/route.ts)
- [types/feed.ts](../types/feed.ts)

### Baseline

- búsqueda por texto
- sort por recent / most_voted / most_commented
- paginación con offset de `page * FEED_PAGE_SIZE`
- carga de segunda página por sentinel + IntersectionObserver
- estado de carga y end-state gestionado por `hasMore`
- no migra a cursor para F0; una migración a cursor no está en la fase actual

## M. SEO actual

### Archivos clave

- [app/layout.tsx](../app/layout.tsx)
- [app/(marketing)/proyectos/[id]/page.tsx](../app/(marketing)/proyectos/[id]/page.tsx)
- [app/(marketing)/page.tsx](../app/(marketing)/page.tsx)

### Baseline

- `app/layout.tsx` define metadata global estática
- no hay `generateMetadata` dinámico por proyecto
- no hay canonical ni Open Graph ni Twitter Card por ruta de proyecto
- la ruta pública comparte metadata global, no metadata por obra
- esto se documenta como estado actual, no como mejora a implementar en F0

## N. Perfil → proyecto

### Acceso representativo

- [components/profile/UserProfile.tsx](../components/profile/UserProfile.tsx)
- [app/(protected)/dashboard/profile/[username]/page.tsx](../app/(protected)/dashboard/profile/[username]/page.tsx)
- [lib/works/dashboard.ts](../lib/works/dashboard.ts)

### Baseline

- el perfil del autor lista obras del usuario
- cada obra del perfil enlaza a `/dashboard/work/${id}` y no a una ruta pública
- no se cambia esto en F0

## O. Mapa de contratos y dependencias

| Superficie | Obtención de datos | Dependencias directas relevantes |
| --- | --- | --- |
| Feed público | `GET /api/feed` mediante `useFeed` | `Feed`, `FeedPost`, `MosaicCell`, `ZoomableMedia` |
| Permalink público | `getPublicWork(slugOrId)` en servidor | `WorkDetail`, `LikeButton`, `ShareButton`, `CommentsSection` |
| Detalle propietario | `getDashboardWork(id, session.user.id)` en servidor | `WorkDetail` y acciones de propietario |
| Likes | `GET`/`POST /api/works/[id]/likes` | `useLike`, `LikeButton`, actor/visitante |
| Comentarios | `GET`/`POST /api/works/[id]/comments` | `useComments`, `CommentsSection`, CAPTCHA y cooldown |
| Compartidos | `POST /api/works/[id]/share` | `ShareButton`, `track-share`, `workShareReceipts` |
| Vistas | `POST /api/works/[id]/view` | `trackView`, consentimiento analytics, `workViewReceipts` |

El acoplamiento de mayor riesgo sigue siendo `WorkDetail`: recibe datos de dos consultas con reglas de acceso distintas y concentra la UI pública y las acciones del propietario.

## P. Evidencia de cierre

F0 documenta y congela la línea base técnica; no certifica todavía recorridos de producción. La comprobación local de navegador se intentó el 20 de septiembre de 2026 y quedó bloqueada porque el servidor local no puede conectar a MySQL en `127.0.0.1:3307` (`ECONNREFUSED`). No se usó producción como sustituto.

Las validaciones funcionales de navegador se repetirán como gate de cada fase que cambie esos recorridos. Deben registrar fecha, entorno, cuenta/visitante utilizado, resultado observado e incidencia si existe.

| Recorrido | Resultado esperado | Estado |
| --- | --- | --- |
| Feed: búsqueda, orden e infinite scroll | Conservan carga, orden y fin de resultados | Contrato revisado en código; ejecución local bloqueada por DB |
| Feed móvil: media, carrusel, pinch y navegación | Sin pantalla negra ni navegación accidental; sin doble toque prometido | Contrato revisado en código; ejecución local bloqueada por DB |
| Permalink por slug y UUID | Carga, canonicaliza UUID a slug y mantiene 404 cuando corresponde | Contrato revisado en código; ejecución local bloqueada por DB |
| Like, comentario y compartir | Persisten, respetan sesión/visitante y no duplican contadores | Contrato revisado en código; ejecución local bloqueada por DB |
| Vistas y consentimiento | Respetan consentimiento, autor y deduplicación de 24 h | TypeScript, test y lint focalizados correctos; ejecución local bloqueada por DB |
| Dashboard de propietario | Conserva edición, archivado y eliminación protegidos | Contrato revisado en código; ejecución local bloqueada por DB |

## Bugs preexistentes

### 1. Metadata SEO pública insuficiente

- comportamiento: rutas de proyecto no generan metadata específica
- archivo: [app/layout.tsx](../app/layout.tsx), [app/(marketing)/proyectos/[id]/page.tsx](../app/(marketing)/proyectos/[id]/page.tsx)
- severidad: media
- bloquea F1: no

### 2. `WorkDetail` compacta lógica pública y privada

- comportamiento: mismo componente maneja edición, permisos y detalle público
- archivo: [components/works/WorkDetail.tsx](../components/works/WorkDetail.tsx)
- severidad: alta
- bloquea F1: sí

### 3. Permalink y feed comparten la misma superficie sin contrato claro

- comportamiento: detalle, share, feed y dashboard dependen del mismo modelo implícito
- archivos: [components/feed/FeedPost.tsx](../components/feed/FeedPost.tsx), [components/works/ShareButton.tsx](../components/works/ShareButton.tsx), [lib/works/public.ts](../lib/works/public.ts), [lib/works/dashboard.ts](../lib/works/dashboard.ts)
- severidad: alta
- bloquea F1: sí

### 4. Revisión de doble toque / pinch / fullscreen

- comportamiento: media y zoom deben verificarse con pruebas reales antes de migrar
- archivos: [components/feed/ZoomableMedia.tsx](../components/feed/ZoomableMedia.tsx), [components/works/WorkDetail.tsx](../components/works/WorkDetail.tsx)
- severidad: media
- bloquea F1: no, pero sí requiere validación de UX

## Validaciones estáticas ejecutadas — 20 de septiembre de 2026

- `npx tsc --noEmit`
- `npx eslint app components hooks lib types --ext .ts,.tsx --ignore-pattern '.claude/**' --ignore-pattern '.next/**' --ignore-pattern 'node_modules/**'`
- `npx tsx --test tests/**/*.test.ts`
- `npx eslint app/api/works/[id]/view/route.ts components/feed/FeedPost.tsx components/legal/CookieConsentBanner.tsx components/works/WorkDetail.tsx lib/client/track-view.ts`
- `npm run build`
- `git diff --check`

Resultados:

- TypeScript: correcto.
- Tests: 6 de 6 correctos.
- Lint focalizado en los archivos del baseline: 0 errores y 5 advertencias existentes de `no-img-element`.
- Build: correcto; durante la generación registra que Better Auth no puede validar la DB local, coherente con el bloqueo de `127.0.0.1:3307`.
- `git diff --check`: correcto.
- Lint completo: 15 errores y 32 advertencias preexistentes fuera del alcance de F0. Se registran como deuda técnica; F0 no los modifica ni los presenta como validados.

## Resultado de la auditoría F0

F0 queda en estado:

- ✅ FINALIZADA
- F1: ⬜ NO INICIADA

La evidencia documental recoge la línea base real, las rutas, los contratos actuales, el flujo público y del dashboard, y está vinculada al baseline `5200a42`. El bloqueo local de DB y el lint histórico quedan explícitamente registrados para no confundirlos con una paridad de producción certificada.

## Criterio de aprobación del gate

F0 queda aprobada con la autorización explícita del 20 de septiembre de 2026, tras documentar los bloques A-P, bugs preexistentes, resultados estáticos y el commit SHA de baseline. Cualquier fase posterior que altere un recorrido público o protegido debe ejecutar su validación funcional de navegador antes de cerrar su propio gate.
