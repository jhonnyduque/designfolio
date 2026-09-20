# Designfolio — Plan maestro de migración SINGLE → FEED

**Versión:** 1.1
**Fecha:** 20 de septiembre de 2026
**Estado:** ✅ F0 FINALIZADA — baseline `5200a42`; F1 ✅ FINALIZADA; F1.5 🔄 EN PROCESO; F2 ⬜ NO INICIADA
**Repositorio de referencia:** `designfolio-new`
**Objetivo:** convertir el **feed** en la experiencia pública principal de Designfolio y retirar progresivamente el **single visual público** sin perder URLs, funcionalidades, SEO, comentarios, acciones sociales ni flujos protegidos del propietario.

---

# 1. Visión del producto

Designfolio debe comportarse como una experiencia centrada en el feed:

```text
DESIGNFOLIO
│
└── FEED = experiencia pública principal
    │
    ├── MÓVIL
    │   ├── Post completo inline
    │   ├── Imagen / vídeo / carrusel
    │   ├── Pinch zoom
    │   ├── Like
    │   ├── Compartir
    │   ├── Autor + título
    │   ├── …más / …menos
    │   ├── Descripción
    │   └── Comentarios → Bottom Sheet
    │
    └── DESKTOP
        ├── Grid de proyectos
        └── Click en proyecto
            ↓
        MODAL DE DETALLE
        ├── Media estable a la izquierda
        ├── Información a la derecha
        ├── Comentarios con scroll propio
        ├── Composer accesible
        └── Cerrar → volver exactamente al mismo punto del grid
```

El proyecto individual continúa teniendo una identidad pública estable mediante:

```text
/proyectos/[slug]
```

pero esa URL deja de implicar necesariamente una página visual “single” tradicional.

---

# 2. Principio rector

> **Designfolio es el feed. Los proyectos se profundizan dentro del feed; no obligan al usuario a abandonar su contexto.**

Esto implica:

- evitar el flujo `feed → single → volver → feed`;
- preservar scroll, filtros, orden y páginas cargadas;
- resolver comentarios e información mediante superficies contextuales;
- mantener un permalink público estable;
- mantener el dashboard y las acciones de propietario separados del flujo público;
- no convertir el feed en un `WorkDetail` gigante.

---

# 3. Arquitectura objetivo

## 3.1 Móvil

El post debe resolver directamente:

```text
Autor / datos

IMAGEN / VIDEO / CARRUSEL

Like   Comentarios   Compartir   Vistas

Autor   Título del proyecto   …más

[expandido]
Descripción
Metadata permitida
…menos
```

Comentarios:

```text
┌──────────────────────────────┐
│            ━━━━━             │
│ Comentarios              ×   │
│                              │
│ comentario                   │
│ comentario                   │
│ comentario                   │
│            ↕                 │
│ comentario                   │
│                              │
│ [ Escribe un comentario… ] ↑ │
└──────────────────────────────┘
```

Características:

- bottom sheet parcial;
- scroll interno;
- composer sticky;
- feed permanece montado;
- teclado no cierra el sheet;
- cerrar el sheet devuelve exactamente al mismo post.

---

## 3.2 Desktop

El grid sigue siendo la superficie principal de descubrimiento.

Al abrir un proyecto:

```text
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   MEDIA                         INFORMACIÓN                 │
│                                                            │
│   ┌───────────────────────┐     Autor                       │
│   │                       │     Título                      │
│   │   Imagen / vídeo      │     Descripción                 │
│   │   / carrusel          │     Categoría / fecha           │
│   │                       │     Acciones                    │
│   │                       │                                │
│   │                       │     Comentarios                 │
│   │                       │     comentario                  │
│   └───────────────────────┘     comentario       ↕          │
│                                  comentario                 │
│                                                            │
│                                  [Añadir comentario…]       │
└────────────────────────────────────────────────────────────┘
```

Principios:

- media estable a la izquierda;
- panel derecho con scroll independiente;
- nada de coordenadas absolutas frágiles;
- composición mediante CSS Grid/Flex;
- composer permanentemente accesible;
- cerrar devuelve al mismo punto del grid.

---

## 3.3 Permalink público

Se conserva:

```text
/proyectos/[slug]
```

Debe servir para:

- compartir;
- enlaces externos;
- favoritos del navegador;
- SEO;
- Open Graph;
- acceso directo;
- navegación desde perfiles;
- previews sociales.

El permalink es **la identidad pública del proyecto**, no necesariamente una página single visual.

---

## 3.4 Dashboard / propietario

Debe permanecer separado:

```text
PUBLIC DETAIL
→ Feed / modal / sheet

OWNER DETAIL
→ dashboard/work/[id]
→ editar
→ archivar
→ eliminar
→ estados no públicos
```

No trasladar acciones de propietario al feed público.

---

# 4. Reglas de ejecución del roadmap

## 4.1 Un solo plan oficial

Desde este documento se elimina cualquier nomenclatura anterior paralela.

El único plan vigente es:

```text
F0 → F1 → F1.5 → F2 → F3 → F4 → F5 → F6 → F7 → F8 → F9
```

## 4.2 Regla de avance

Una fase no se considera terminada porque “el código esté escrito”. Debe cumplir:

1. implementación terminada;
2. pruebas de la fase aprobadas;
3. regresiones revisadas;
4. fase anterior intacta;
5. reporte técnico entregado;
6. aprobación explícita antes de continuar.

## 4.3 Bloqueos duros

```text
F0 → F1 → F1.5 → F2 → F3
```

Estas fases deben ejecutarse en orden estricto.

Después:

```text
F3
├── F4 móvil
└── F5 desktop
```

F4 y F5 no se bloquean conceptualmente entre sí, pero el orden recomendado es:

```text
F4 → validar → F5
```

Finalmente:

```text
F4 + F5
   ↓
F6 → F7 → F8 → F9
```

No retirar navegación pública al single antes de que móvil, desktop, historial, permalink y deep links estén resueltos.

---

# 5. Fase F0 — Línea base y paridad

## Objetivo

Documentar el comportamiento actual y establecer una línea base verificable antes de redistribuir responsabilidades.

## Debe comprobarse

### Navegación

- `/`
- `/proyectos`
- `/proyectos/[slug]`
- acceso por UUID;
- redirect UUID → slug;
- proyecto inexistente;
- proyecto archivado/no aprobado;
- acceso directo por permalink.

### Interacciones

- like;
- estado de like;
- compartir;
- contador de compartidos;
- comentarios;
- publicación de comentario;
- vistas;
- deduplicación de vistas;
- CAPTCHA;
- cooldown;
- sesión visitante/autenticado.

### Media

- imagen;
- vídeo;
- carrusel;
- swipe;
- pinch zoom;
- doble toque;
- fullscreen si sigue existiendo.

### Dashboard

- editar;
- archivar;
- eliminar;
- pendientes;
- rechazadas;
- archivadas.

## Entregables

- checklist de paridad;
- mapa de rutas;
- mapa de APIs;
- mapa de dependencias;
- lista de funciones exclusivas del single;
- evidencia de pruebas.

## Archivos probables

- `app/(marketing)/proyectos/[id]/page.tsx`
- `components/works/WorkDetail.tsx`
- `lib/works/public.ts`
- `components/feed/FeedPost.tsx`
- `components/feed/MosaicCell.tsx`
- `app/api/works/[id]/*`
- `app/(protected)/dashboard/work/[id]/page.tsx`

## No tocar

- UI;
- CSS;
- rutas;
- DB;
- comportamiento.

## Gate F0 → F1

No avanzar hasta que exista una lista clara de responsabilidades públicas y protegidas.

---

# 6. Fase F1 — Separar contratos de datos

## Objetivo

Separar claramente tres contratos:

```text
FeedItem
PublicProjectDetail
DashboardProjectDetail
```

## Razón

Hoy `WorkDetail` concentra información pública y protegida. Esa mezcla bloquea la retirada segura del single.

## FeedItem

Debe contener solo lo necesario para el feed:

- id;
- slug;
- título;
- descripción;
- categoría;
- media;
- métricas;
- autor básico;
- avatar;
- reputación si ya forma parte del contrato;
- fechas.

No debe incorporar:

- comentarios completos;
- acciones de propietario;
- estados de moderación;
- datos sensibles.

## PublicProjectDetail

Debe poder cargar bajo demanda:

- datos ampliados del proyecto;
- bio;
- school;
- tags;
- metadata completa;
- permisos públicos necesarios;
- métricas;
- información no presente en FeedItem.

## DashboardProjectDetail

Debe conservar:

- estados no públicos;
- edición;
- archivado;
- eliminación;
- permisos de propietario;
- información necesaria para dashboard.

El nombre describe el alcance real del contrato: el dashboard permite al propietario
ver cualquier estado propio y a otro usuario autenticado ver una obra aprobada no
archivada. Las capacidades de edición siguen siendo exclusivas del propietario.

## Estrategia

Mantener `getPublicWork` temporalmente como referencia hasta demostrar equivalencia.

No eliminar contratos antiguos antes de validar los nuevos.

## Entregables

- tipos separados;
- consulta pública contextual;
- contrato de dashboard independiente;
- pruebas de equivalencia.

## Riesgos

- divergencia de métricas;
- pérdida de campos;
- mezcla accidental de permisos;
- filtrado incorrecto de obras no públicas.

## Gate F1 → F2

El detalle público debe poder obtenerse sin depender de `WorkDetail`.

---

# 7. Fase F1.5 — Media en feed: proporción, reproducción e interacción

## Objetivo

Resolver la presentación real de vídeo en carga y feed, especialmente 1080×1920
(9:16), y retirar las entradas públicas al single sin modificar el formato ni el
almacenamiento de los medios.

## Problema confirmado

La miniatura inicial de carga fuerza 4:3 con `object-cover`, los controles
nativos introducen un play gigante en móvil y el mosaico desktop no reproduce
vídeos al entrar en pantalla. Además, los enlaces de medio, título y comentarios
llevaban al single heredado.

## Contrato visual de media

- La vista principal de un vídeo usa las dimensiones ya guardadas en `WorkImage`
  para respetar su proporción intrínseca; un 1080×1920 se ve 9:16 completo.
- El vídeo principal no usa `object-cover` en móvil; se reproduce inline al
  alcanzar 30% de visibilidad, permanece silenciado y pausa al salir por completo.
- El control de sonido es un botón pequeño, gris y accesible; no hay play gigante
  ni barra de controles del navegador. Solo un vídeo puede reproducirse a la vez.
- Pinch amplía temporalmente el vídeo y el doble tap asegura un like, sin poder
  retirar uno que ya exista.
- La selección inicial usa `object-contain`: conserva completos los 9:16, 4:5 y
  16:9 dentro de una miniatura estable.
- La cuadrícula desktop conserva sus celdas 4:5 como superficie de descubrimiento;
  ahí un recorte centrado puede ser intencionado, pero no se confunde con la
  vista principal del proyecto.
- Las acciones y superficies del feed no abren el single; compartir enlaza al
  ancla del post dentro del feed.
- El botón `+` de cabecera solo se muestra con sesión activa y lleva a crear una
  publicación.

## Superficies incluidas

- selector de archivos y vista previa de publicación (`ImageUploader`, `CreateWorkForm`);
- post móvil (`FeedPost`);
- mosaico desktop (`MosaicCell`);
- cabecera pública, acciones sociales y API de like idempotente.

## Verificación

- vídeo 1080×1920, 1080×1350 y 1920×1080 en selector y post: completo y sin recorte accidental;
- reproducción al 30% de visibilidad, pausa fuera de viewport, sonido apagado y control mínimo;
- pinch y doble tap no disparan navegación ni compiten con carrusel/sonido;
- el `+` no aparece sin sesión activa;
- móvil Chrome Android y Safari iOS, además de desktop;
- TypeScript, ESLint, tests, build y `git diff --check`.

## No tocar

- transcodificación, almacenamiento o esquema de vídeos;
- layout 4:5 deliberado del mosaico desktop;
- dashboard, autenticación, API de feed, vistas, comentarios o formatos admitidos.

## Gate F1.5 → F2

La media debe disponer de proporción confiable, reproducción comprobada y ningún
camino visual al single antes de extraer `ProjectMedia`; F2 no debe reabrir estas
decisiones.

---

# 8. Fase F2 — Extraer piezas reutilizables

## Objetivo

Desacoplar las piezas visuales que hoy están atrapadas dentro de `WorkDetail`.

## Candidatos de alta prioridad

- `ProjectMedia`
- `ProjectHeader`
- `ProjectAuthor`
- `ProjectDescription`
- `ProjectMetadata`
- `ProjectActions`

Los nombres son orientativos. Deben adaptarse al código real.

## Reutilizable directamente si ya está estable

- `LikeButton`
- `ShareButton`
- tipos de media;
- APIs existentes;
- reglas de permisos;
- `ZoomableMedia` solo después de revisar su contrato.

## Frontera con F3 y con las superficies contextuales

`CommentList`, `CommentComposer`, CAPTCHA y el hook de comentarios pertenecen a
F3: F2 no los extrae ni los reescribe. F2 puede dejar un punto de inserción de
comentarios, pero no montar ni solicitar comentarios.

Las piezas interactivas que F2 extraiga deben exponer callbacks de intención
(`onOpenComments`, `onOpenProject`) en lugar de decidir navegación o historial.
Así F4 y F5 comparten la misma interfaz y F6 conecta URL/historial una sola vez.
El enlace al permalink sigue siendo el fallback semántico mientras no se active
una superficie contextual.

## No extraer

- `WorkDetail` entero;
- navegación anterior/siguiente completa;
- barra de volver;
- sidebar entero;
- todas las acciones de propietario juntas;
- abstracciones genéricas sin necesidad real.

## Regla

La extracción debe producir piezas pequeñas y específicas, no un nuevo mega-componente universal.

## Verificación

El single actual y el dashboard deben seguir viéndose y funcionando igual después de esta fase.

## Gate F2 → F3

Media, cabecera, descripción, metadata y acciones deben poder renderizarse fuera
de `WorkDetail`; la frontera de comentarios queda lista, pero su implementación
permanece exclusivamente en F3.

---

# 9. Fase F3 — Modularizar comentarios

## Objetivo

Separar comentarios de su layout monolítico actual.

## Problema actual

`CommentsSection` mezcla:

- lista;
- composer;
- validación;
- CAPTCHA;
- cooldown;
- loading;
- errores;
- sesión;
- layout.

## Arquitectura objetivo

```text
CommentExperience
├── CommentList
├── CommentComposer
├── estados de carga/error
└── useComments adaptado
```

## Debe conservarse

- publicación;
- validaciones;
- CAPTCHA;
- cooldown;
- errores;
- sesión;
- permisos;
- orden.

## Evolución recomendada

El límite actual de hasta 200 comentarios puede mantenerse transitoriamente.

Después debe evolucionar hacia:

```text
limit=20 o 30
cursor=...
loadMore()
append
```

## Carga

Los comentarios se cargan **solo cuando el usuario solicita comentarios**.

Nunca cargar comentarios completos para todos los posts del feed/grid.

`useComments` debe poder permanecer inactivo hasta la apertura explícita y
cancelar una solicitud pendiente al cerrar la superficie. F3 define también los
estados vacíos, error y reintento de una sola fuente; F4 y F5 no los duplican.

## Gate F3 → F4/F5

Debe ser posible montar `CommentList + CommentComposer` dentro de una superficie contextual independiente.

---

# 10. Fase F4 — Bottom sheet móvil

## Objetivo

Permitir leer y escribir comentarios sin salir del feed móvil.

## Arquitectura

Componente custom con portal a:

```text
document.body
```

Sin dependencia externa inicialmente.

## Requisitos funcionales

- abrir desde el botón/contador de comentarios;
- mantener FeedPost montado detrás;
- scroll interno;
- composer sticky;
- cierre por botón;
- cierre por gesto si se aprueba;
- cierre por backdrop;
- Escape cuando aplique;
- safe areas;
- retorno de foco;
- restauración exacta del scroll.

El disparador de comentarios usa el callback definido en F2. No intercepta los
gestos de pinch, swipe ni los controles nativos del vídeo; el permalink continúa
siendo un enlace utilizable cuando JavaScript no está disponible.

## Altura

No fijar valores arbitrarios como requisito rígido.

Diseño esperado:

- estado inicial parcial;
- publicación reconocible detrás;
- posibilidad de expansión;
- no tapar innecesariamente toda la pantalla.

## Teclado

Comportamiento deseado:

```text
tap input
→ teclado aparece
→ composer permanece visible

tap fuera del input
→ blur
→ teclado desaparece
→ sheet sigue abierto

Back Android con teclado abierto
→ primero debe permitirse cerrar teclado cuando el navegador/IME lo gestione

Back con teclado cerrado
→ puede cerrar el sheet
```

## APIs web

Prioridad:

- `100dvh`;
- `env(safe-area-inset-bottom)`;
- `focus()/blur()`;
- `scrollIntoView()`;
- `VisualViewport` solo cuando las pruebas reales demuestren necesidad.

## Accesibilidad

- `role="dialog"`;
- `aria-modal="true"`;
- título accesible;
- focus management;
- retorno de foco;
- background inert;
- lector de pantalla;
- pruebas Android/iOS.

## No tocar

- routing público;
- modal desktop;
- SEO;
- dashboard.

## Gate F4

El usuario móvil debe poder:

```text
leer proyecto
→ abrir comentarios
→ leer
→ escribir
→ cerrar
→ seguir exactamente en el mismo post
```

sin navegar al single.

---

# 11. Fase F5 — Modal de detalle desktop

## Objetivo

Abrir proyectos desde el grid sin desmontar el feed.

## Composición

```text
ProjectDetailModal
├── ProjectMedia
├── ProjectHeader
├── ProjectAuthor
├── ProjectDescription
├── ProjectMetadata
├── ProjectActions
├── CommentList
└── CommentComposer
```

## Layout

No usar coordenadas absolutas como arquitectura.

Preferir:

```css
display: grid;
grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
height: min(90dvh, 900px);
```

Los valores finales deben surgir del diseño real.

## Media

- estable a la izquierda;
- imagen/vídeo/carrusel;
- no debe desplazarse al leer comentarios;
- revisar integración con zoom;
- evitar modal → lightbox → segundo modal salvo necesidad real.

## Panel derecho

Debe admitir:

```css
overflow-y: auto;
min-height: 0;
```

Debe contener:

- autor;
- título;
- descripción;
- categoría;
- etiquetas solo si el producto las reactiva;
- fecha;
- métricas;
- acciones;
- comentarios;
- composer.

## Composer

Debe permanecer accesible.

Puede usar sticky si el layout lo requiere.

## Carga

Al abrir proyecto:

```text
FeedItem ligero
→ consulta puntual de detalle
→ abre modal
→ comentarios se cargan solo cuando corresponde
```

## Accesibilidad

- `role="dialog"`;
- `aria-modal`;
- `aria-labelledby`;
- focus trap;
- Escape;
- retorno de foco;
- fondo inert;
- botón de cierre;
- scroll correcto.

## Gate F5

El usuario desktop debe poder completar la interacción pública principal sin visitar el single.

---

# 12. Fase F6 — Estado URL + historial

## Objetivo

Conectar los detalles contextuales al historial del navegador sin desmontar el feed.

## Estrategia prioritaria a validar

Estado contextual:

```text
/?project=slug
```

Permalink público:

```text
/proyectos/[slug]
```

No confundir ambas funciones.

## Flujo esperado

```text
Feed
→ abrir proyecto
→ URL contextual cambia
→ Back cierra detalle
→ Forward vuelve a abrir
```

El feed debe permanecer montado y conservar:

- scroll;
- búsqueda;
- orden;
- páginas cargadas;
- infinite scroll;
- estado de posts.

La implementación debe conservar los parámetros existentes de búsqueda y orden,
usar una única entrada de historial por apertura/cierre y evitar navegación que
remonte o recargue el feed. El valor `project` se valida como slug antes de pedir
el detalle; un slug inválido o inexistente cierra/omite el contexto sin bucles.

## Advertencia

No depender exclusivamente de Intercepting Routes.

La diferencia móvil/desktop debe seguir siendo responsabilidad de la experiencia, no de una ruta que obligue al mismo comportamiento en ambos dispositivos.

## Gate F6

Back/Forward debe funcionar sin perder contexto.

---

# 13. Fase F7 — Permalink, deep links y SEO

## Objetivo

Conservar `/proyectos/[slug]` como contrato público aunque desaparezca la página single visual.

## Metadata dinámica

Debe existir:

- title;
- description;
- canonical;
- `og:title`;
- `og:description`;
- `og:image`;
- `og:url`;
- Twitter card;
- preview de enlace.

## Deep link

Caso crítico:

```text
/proyectos/proyecto-antiguo
```

Ese proyecto puede no estar en las páginas actuales del infinite scroll.

No recorrer páginas hasta encontrarlo.

Debe existir:

```text
consulta puntual por slug
→ cargar proyecto directamente
→ presentar experiencia contextual correspondiente
```

## Acceso sin JavaScript

La ruta `/proyectos/[slug]` debe renderizar contenido legible y semántico en el
servidor. La presentación contextual es una mejora tras hidratar; no puede ser la
única forma de leer un permalink ni depender de que el proyecto esté ya en el feed.

## Compartir

`ShareButton` debe seguir copiando:

```text
/proyectos/[slug]
```

No:

```text
/?project=slug
```

## Gate F7

Un enlace compartido debe abrir correctamente un proyecto aunque no esté cargado previamente en el feed.

---

# 14. Fase F8 — Retirar navegación pública normal al single

## Objetivo

Dejar de enviar usuarios públicos al single tradicional.

## Revisar enlaces desde

- FeedPost;
- media;
- título;
- autor/título;
- comentarios;
- vídeo;
- MosaicCell;
- perfiles públicos;
- cualquier otro acceso público.

## Nuevo comportamiento

### Móvil

- media → interacción media;
- comentarios → bottom sheet;
- `…más` → descripción;
- compartir → permalink;
- autor → perfil;
- acceso profundo solo cuando esté explícitamente definido.

### Desktop

- grid → modal;
- cerrar → grid;
- permalink continúa siendo compartible.

La interceptación contextual debe ser progresiva: si el cliente no está listo o
JavaScript falla, los enlaces públicos conservan su destino `/proyectos/[slug]`.

## Condición

No ejecutar F8 hasta que:

- F4 aprobada;
- F5 aprobada;
- F6 aprobada;
- F7 aprobada.

## Rollback

Mientras F8 no esté validada, conservar temporalmente acceso de emergencia al single.

---

# 15. Fase F9 — Retirar single visual público

## Objetivo

Eliminar definitivamente la experiencia pública tradicional basada en `WorkDetail`.

## Condición previa

Checklist de paridad completa.

## Candidatos a retirar

- página visual single pública tradicional;
- barra pública de volver;
- navegación pública anterior/siguiente;
- sidebar público;
- lightbox público si quedó sustituido;
- consulta pública anterior/siguiente;
- props públicas obsoletas de `WorkDetail`;
- CSS específico del single.

## No eliminar automáticamente

- permalink;
- consulta por slug;
- metadata SEO;
- APIs de comentarios;
- APIs de likes;
- APIs de compartidos;
- APIs de vistas;
- dashboard;
- `getDashboardWork`;
- edición;
- archivado;
- eliminación.

## WorkDetail

F9 significa:

```text
WorkDetail público → retirar
```

No significa necesariamente:

```text
WorkDetail completo → borrar
```

Si el dashboard todavía depende de él, se conserva o se refactoriza en un proyecto posterior.

Antes de retirar cualquier archivo, comprobar con una búsqueda de importaciones
que ninguna ruta pública ni protegida sigue dependiendo de `WorkDetail`; el
dashboard no se modifica por una retirada del single público.

---

# 16. Checklist final de paridad

## Navegación

- [ ] Feed abre detalle contextual.
- [ ] Back cierra detalle.
- [ ] Forward reabre.
- [ ] Scroll se conserva.
- [ ] Search se conserva.
- [ ] Sort se conserva.
- [ ] Infinite scroll se conserva.
- [ ] Deep link funciona.
- [ ] UUID redirige a slug.
- [ ] Proyecto antiguo abre directamente.

## Media

- [ ] Imagen.
- [ ] Vídeo.
- [ ] Carrusel.
- [ ] Swipe.
- [ ] Pinch zoom.
- [ ] Doble toque.
- [ ] Fullscreen de vídeo si continúa siendo necesario.
- [ ] Accesibilidad de controles.

## Interacciones

- [ ] Like.
- [ ] Estado individual de like.
- [ ] Compartir.
- [ ] Contador de shares.
- [ ] Vistas.
- [ ] Deduplicación de vistas.
- [ ] Comentarios.
- [ ] Composer.
- [ ] CAPTCHA.
- [ ] Cooldown.
- [ ] Loading.
- [ ] Errores.
- [ ] Estado vacío.

## Datos

- [ ] Título.
- [ ] Descripción.
- [ ] Categoría.
- [ ] Tags.
- [ ] Fecha.
- [ ] Autor.
- [ ] Avatar.
- [ ] Bio.
- [ ] School.
- [ ] Métricas.
- [ ] Permisos.

## Propietario

- [ ] Editar.
- [ ] Guardar.
- [ ] Archivar.
- [ ] Eliminar.
- [ ] Confirmar eliminación.
- [ ] Ver pendientes.
- [ ] Ver rechazadas.
- [ ] Ver archivadas.

## SEO

- [ ] Title dinámico.
- [ ] Description dinámica.
- [ ] Canonical.
- [ ] Open Graph.
- [ ] Imagen social.
- [ ] Preview de enlace.
- [ ] Acceso directo.
- [ ] Fallback sin JavaScript cuando corresponda.

## Accesibilidad

- [ ] `aria-modal`.
- [ ] Focus trap.
- [ ] Retorno de foco.
- [ ] Escape.
- [ ] Bottom sheet accesible.
- [ ] Composer usable.
- [ ] Back probado en Android.
- [ ] Lectores de pantalla.
- [ ] Safe areas.

---

# 17. Estrategia de datos y rendimiento

## Siempre en FeedItem

- id;
- slug;
- título;
- descripción;
- categoría;
- media;
- métricas;
- autor básico;
- avatar;
- fechas.

## Bajo demanda al abrir detalle

- bio;
- school;
- tags si se retiran del feed;
- metadata ampliada;
- permisos;
- información completa del autor.

## Bajo demanda al abrir comentarios

- comentarios;
- paginación;
- sesión;
- composer;
- CAPTCHA;
- cooldown.

## Solo propietario

- edición;
- estados de moderación;
- acciones destructivas;
- datos protegidos.

---

# 18. Estrategia de caché y estado

El proyecto actualmente utiliza:

- React state;
- `fetch`;
- hooks propios.

No introducir React Query, SWR, Zustand u otra librería solo por esta migración.

## Evolución mínima

Crear un hook equivalente a:

```text
useProjectDetail(slug)
```

Debe:

- cancelar solicitudes;
- evitar duplicados;
- exponer loading/error/data;
- mantener datos durante cierre/reapertura;
- no recargar innecesariamente.

`useComments` puede evolucionar gradualmente.

---

# 19. Riesgos priorizados

## Alto

1. Eliminar `WorkDetail` antes de separar público/dashboard.
2. Retirar el single sin resolver SEO/Open Graph.
3. Cargar comentarios completos para cada post.
4. Hacer depender deep links del infinite scroll cargado.
5. Romper rutas de propietario.
6. Perder scroll/contexto al manipular historial.

## Medio

1. Reutilizar `CommentsSection` entero en sheet/modal.
2. Intentar un solo renderer universal para móvil y desktop.
3. Mantener 200 comentarios sin paginación.
4. Crear modal sobre modal por conservar lightbox.
5. Duplicar consultas de likes/comentarios.

## Bajo

1. Anterior/siguiente redundante.
2. Barra de volver pública obsoleta.
3. CSS específico del single.
4. Sidebar público que deje de tener utilidad.

---

# 20. Backlog técnico que NO bloquea esta migración

## Paginación del feed

Actualmente basada en `offset`.

Puede sufrir:

- duplicados;
- saltos;
- elementos omitidos si cambia el contenido.

Futuro candidato:

```text
cursor pagination
```

## Estado individual de likes

Cada `LikeButton` puede generar su propia consulta.

Opciones futuras:

- batch;
- estado agregado;
- carga bajo interacción.

No resolver dentro de F0–F9 salvo que aparezca un bloqueo real.

---

# 21. Reglas para Codex / Claude Code / cualquier agente

Toda instrucción de implementación debe comenzar con:

```text
Estamos en Fase Fx.
Ejecuta únicamente esta fase.
No avances a Fy.
```

## Prohibiciones

El agente no debe:

- adelantar fases;
- hacer refactors oportunistas;
- cambiar UX fuera del alcance;
- tocar DB sin autorización explícita;
- cambiar rutas fuera de la fase;
- instalar librerías sin aprobación;
- modificar diseño aprobado;
- eliminar código de rollback antes de validar;
- hacer commit cuando se haya pedido revisión previa.

## Entrega obligatoria por fase

1. archivos modificados;
2. archivos nuevos;
3. diff conceptual;
4. decisiones técnicas;
5. riesgos encontrados;
6. pruebas realizadas;
7. TypeScript;
8. ESLint;
9. tests;
10. `git diff --check`;
11. confirmación de qué NO fue tocado;
12. rollback disponible;
13. estado del gate de la fase.

---

# 22. Matriz rápida de dependencias

| Fase | Depende de | Bloquea a | Puede ejecutarse en paralelo |
|---|---|---|---|
| F0 | — | F1 | No |
| F1 | F0 | F1.5 | No |
| F1.5 | F1 | F2 | No |
| F2 | F1.5 | F3 | No |
| F3 | F2 | F4/F5 | No |
| F4 | F3 | F6 | Sí, técnicamente con F5 |
| F5 | F3 | F6 | Sí, técnicamente con F4 |
| F6 | F4+F5 | F7 | No |
| F7 | F6 | F8 | No |
| F8 | F7 | F9 | No |
| F9 | F8 + paridad completa | — | No |

---

# 23. Estado de progreso

Utilizar esta sección como control dentro del repositorio.

```text
[x] F0 — Línea base y paridad
[x] F1 — Separar contratos de datos
[~] F1.5 — Corregir previsualización de vídeo vertical
[ ] F2 — Extraer piezas reutilizables
[ ] F3 — Modularizar comentarios
[ ] F4 — Bottom sheet móvil
[ ] F5 — Modal desktop
[ ] F6 — Estado URL + historial
[ ] F7 — Permalink, deep links y SEO
[ ] F8 — Retirar navegación pública normal al single
[ ] F9 — Retirar single visual público
```

Actualizar solo después de aprobar cada gate.

---

# 24. Resultado final esperado

Cuando F9 termine, la experiencia pública deberá comportarse así:

```text
MÓVIL
Feed
→ post
→ descripción inline
→ comentarios en sheet
→ comentar
→ cerrar
→ continuar feed

DESKTOP
Grid
→ modal de proyecto
→ media + información + comentarios
→ cerrar
→ mismo punto del grid

PERMALINK
/proyectos/[slug]
→ proyecto identificable y compartible
→ metadata propia
→ acceso directo funcional

DASHBOARD
/dashboard/work/[id]
→ experiencia protegida
→ edición / archivo / eliminación
```

Y deberá desaparecer el patrón:

```text
feed
→ single
→ volver
→ feed
→ single
→ volver
```

---

# 25. Criterio final de éxito

La migración se considera completa solo cuando:

> Un usuario público puede descubrir, entender, ampliar, comentar, compartir e interactuar con un proyecto sin abandonar la experiencia principal del feed; los enlaces directos siguen siendo permanentes y compartibles; el dashboard conserva todas las acciones protegidas; y cerrar cualquier detalle contextual devuelve al usuario exactamente al punto donde estaba.

---

# 26. Decisiones congeladas de este roadmap

- El feed es la experiencia pública principal.
- El single visual público se retirará progresivamente.
- El permalink `/proyectos/[slug]` se conserva.
- El dashboard protegido no se mezcla con el detalle público.
- Móvil usa interacción inline + bottom sheet.
- Desktop usa modal contextual.
- No se incrusta `WorkDetail` entero dentro de modal/sheet.
- Los comentarios se cargan bajo demanda.
- No se descargan comentarios para todos los posts.
- No se usan coordenadas absolutas rígidas para el modal desktop.
- No se elimina código crítico antes de alcanzar paridad.
- Cada fase tiene gate y aprobación antes de avanzar.

---

# 27. Nota de mantenimiento

Este archivo debe tratarse como la fuente de verdad del proyecto **SINGLE → FEED**.

Cuando se apruebe una fase:

1. marcarla como completada;
2. anotar commit/PR correspondiente;
3. registrar desviaciones justificadas;
4. actualizar riesgos;
5. no reescribir decisiones congeladas sin una nueva aprobación explícita.
