# Estado de Designfolio

Última revisión: **19 de septiembre de 2026**.

Cada afirmación de aquí está comprobada contra el código real o contra el sitio
en producción, no leyendo otro documento. Es una precaución deliberada: el día
que se escribió esto había en `docs/` dos documentos que afirmaban cosas que ya
no eran ciertas, y ambos indujeron a error.

---

## Dónde vive el proyecto

| | |
|---|---|
| Checkout de trabajo | `C:/Users/Beto/Documents/APP/designfolio-new` |
| Rama de trabajo y de despliegue | `codex/hostinger-mysql-migration` |
| Repositorio | `github.com/jhonnyduque/designfolio` (**público**) |
| Producción | `https://designfolio.jhonnyduque.com` |

**La rama por defecto del repositorio es `main`, pero producción no sale de
ahí.** Hostinger despliega desde `codex/hostinger-mysql-migration`, y cada push
a esa rama despliega solo. Es el punto que más confusión genera: mirar `main`
para saber qué hay arriba da una respuesta equivocada.

`main` sigue decenas de commits atrás y todavía sobre Supabase. No estorba, pero
no es referencia de nada.

---

## Qué hay en producción

| Ruta | Código |
|---|---|
| `/`, `/legal`, `/privacidad`, `/aviso-legal`, `/terminos`, `/cookies` | 200 |
| `/.env` | **403** |

El 403 de `/.env` es la comprobación que pide el runbook: la aplicación vive
dentro de `public_html`, así que conviene confirmar que los archivos sensibles
no se sirven por URL.

---

## Lo que está resuelto

### Pila

La migración de Supabase a MySQL está **completa**. El proyecto corre sobre
`mysql2`, `drizzle-orm` y `better-auth`. No queda ni una dependencia, ni un
archivo, ni una mención de Supabase en el árbol de trabajo.

Sí queda en el **historial de git**, y ahí se queda: reescribir el historial de
un repositorio público ya publicado rompería cualquier clon existente.

### Infraestructura

Los seis pasos del despliegue están hechos: base MySQL, esquema importado,
GitHub conectado, ajustes de compilación, las doce variables de entorno en
hPanel y el despliegue automático de la rama.

Los nombres y el propósito de las variables están en
[`VARIABLES_ENTORNO.md`](VARIABLES_ENTORNO.md). Los valores no se escriben en
ningún archivo del repositorio, porque es público.

### Seguridad

| Qué | Dónde |
|---|---|
| Límite de peticiones | `lib/rate-limit.ts`, en siete rutas de API |
| CAPTCHA | `lib/captcha.ts`, en alta de cuenta y comentarios |
| Validación binaria de archivos | `lib/media-signature.ts` |
| Pertenencia de medios | `app/api/works/route.ts` — se valida **siempre** |

Ese último punto fue un agujero real: la condición llevaba
`NODE_ENV !== "production"`, de modo que justo en el entorno que importa se
aceptaba cualquier URL en `images[].url` sin comprobar de quién era. Está
corregido, y el comentario del código explica por qué la condición es como es.

### Almacenamiento

Los medios se guardan en `MEDIA_ROOT`, **fuera** de la carpeta de la
aplicación, y se sirven por `app/media/[...path]/route.ts` con soporte de
peticiones parciales para poder adelantar vídeo.

Si algún día se borra esa variable, `lib/media-storage.ts` cae a `.media/`
dentro del proyecto y las subidas empiezan a perderse **en silencio** en el
siguiente despliegue. No hay error visible. Conviene no tocarla.

### Gobernanza tipográfica

Hecha. La tipografía se decidía archivo por archivo: 146 usos de `text-[Npx]`
en trece valores distintos y 382 de la escala genérica de Tailwind, donde
`text-sm` hacía de cuerpo pequeño, de etiqueta, de navegación y de acción a la
vez.

Ahora hay **doce roles** declarados una sola vez, en el espacio `--text-*` de
Tailwind v4 dentro de [`app/globals.css`](../app/globals.css):

| Rol | Tamaño | Peso | Interlineado | Tracking |
|---|---|---|---|---|
| `text-display` / `md:text-display-lg` | 30 / 36px | 400 | 1 | −0.02em |
| `text-page-title` | 22px | 600 | 1.2 | −0.015em |
| `text-section` | 18px | 600 | 1.3 | −0.01em |
| `text-subsection` | 16px | 600 | 1.35 | — |
| `text-body` | 15px | 400 | 1.62 | — |
| `text-body-sm` | 13.5px | 400 | 1.5 | — |
| `text-meta` | 12px | 400 | 1.4 | — |
| `text-nav` | 13px | 500 | 1.35 | — |
| `text-label` | 13px | 500 | 1.35 | — |
| `text-action` | 13px | 500 | 1.35 | — |
| `text-helper` | 12px | 400 | 1.45 | — |
| `text-metric` | 20px | 600 | 1.1 | −0.02em |

Dos reglas al usarlos:

- **Se elige por función, no por etiqueta.** Un `h2` puede ser Section o
  Subsection según lo que haga en la página. No hay reglas globales de `h1 {}`.
- **El peso del rol es su valor por defecto, no una cárcel.** Tailwind resuelve
  el peso con `var(--tw-font-weight, …)`, así que un `font-semibold` sobre un
  rol sigue ganando. Es lo previsto para los énfasis puntuales: el nombre de un
  autor dentro de un texto pequeño.

La familia visual no se tocó. `body` conserva
`"Syne", "Inter", "Segoe UI", system-ui, sans-serif` y no se carga ninguna
fuente nueva. Gallery Modern quedó replegada a su único uso editorial
aprobado: el titular **Proyectos** del feed.

---

## Pendiente

### 1. Respaldo por cron — sin verificar, y es el riesgo mayor

El runbook documenta el `mysqldump` diario con rotación a 14 días, pero **no se
ha podido confirmar que esté instalado en el servidor**: requiere entrar por
SSH.

Va primero porque, según el propio runbook, *este proyecto ya perdió una base
entera por no tenerlo*. Hostinger respalda el hosting, pero un volcado propio se
restaura sin depender del soporte.

Comprobación: `crontab -l` por SSH, y que haya algo en
`/home/u152224864/backups/`.

### 2. Almacenamiento S3 — la pieza que falta para escalar

`MEDIA_ROOT` funciona y es correcto, pero es una solución de un solo servidor.
Queda por hacer:

- elegir proveedor compatible con S3 (R2, B2 o S3);
- carga directa firmada contra el prefijo que emita el backend;
- borrado de medios huérfanos;
- límites de vídeo y dominio o CDN de medios.

No es urgente mientras el volumen sea el actual.

### 3. Revisión visual de la gobernanza

La migración está aplicada y verificada por código, pero conviene un repaso a
ojo de las pantallas donde un rol consolidó dos tamaños que antes diferían:

- las pestañas del feed —«Para ti» y «Siguiendo»— pasaron de 15px a los 13px
  del rol de navegación;
- las pestañas del panel dejaron de distinguir activo e inactivo por el peso,
  y lo hacen por color y subrayado;
- las cifras de métrica, que estaban en 17px y en 25px, comparten ahora un solo
  rol de 20px;
- los títulos de las cinco páginas legales dejaron Gallery Modern a 30px y
  pasaron a la sans a 22px. Es el cambio más visible de toda la migración, y
  es intencionado.

---

## Deuda conocida

| Qué | Dónde |
|---|---|
| Cada `<li>` va envuelto en su propio `<ul>` | las 5 páginas legales |
| Una tabla Markdown se imprime con las barras verticales literales | `privacidad/page.tsx`, §3 |
| 951 líneas de una plantilla ajena, sin usar | `app/src/index.html` |
| `Syne` e `Inter` se declaran en la pila y **no se cargan nunca** | `globals.css` |
| 7 errores de `react-hooks`, preexistentes | ver más abajo |

Sobre las fuentes: no hay `@font-face` ni `next/font` para Syne ni para Inter, y
`public/fonts/` solo contiene Gallery Modern. Lo que se está viendo es
**Segoe UI / system-ui**. Se deja así a propósito: conservar la familia actual
significa dejar esa pila como está, y añadir Syne sería cambiarla, no
conservarla.

`app/src/index.html` es un resto de la plantilla «Liko» (`lang="zxx"`, clases
`liko-`). No genera ruta en el App Router ni lo importa nadie, pero sigue ahí.

---

## Excepciones tipográficas vivas

Diez valores sueltos sobreviven a la gobernanza, todos a propósito:

| Valor | Dónde | Por qué |
|---|---|---|
| `text-[10px]`, `text-[9px]` | insignias de `DashboardShell`, `NotificationBell`, `ImageUploader`, `WorksManager`, `AuthorDashboard`, `CommentsSection` | Micro-insignias en versalitas, por debajo del rol más pequeño. Subirlas a 12px las engorda y rompe su caja. |
| `text-3xl`, `text-2xl` | `AuthLayout` | El panel izquierdo está congelado por decisión de diseño. |
| `text-lg` | `NotificationBell` | Es la caja de un emoji, no de texto. |
| `leading-[1.5]` | píldora de contador en `DashboardShell` | Geometría de la píldora, no interlineado de lectura. |
| `tracking-[0.06em]` (×2) | epígrafes de la barra lateral | Apertura de versalitas; el rol no define tracking ahí. |

---

## Cómo comprobar que todo sigue en pie

```bash
npx tsc --noEmit
```

```bash
npm run build
```

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://designfolio.jhonnyduque.com/.env
```

Ese último debe responder 403.

`npx eslint app components` devuelve **7 errores preexistentes** de
`react-hooks` (`set-state-in-effect` y `purity`) en `DashboardShell`,
`AuthLayout`, `DemoData`, `Scroller`, `CommentsSection` y `CreateWorkForm`. No
vienen de la gobernanza tipográfica —estaban ya en el commit anterior— y siguen
pendientes de decidir.
