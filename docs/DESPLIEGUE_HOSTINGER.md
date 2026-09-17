# Despliegue de Designfolio en Hostinger

Runbook operativo. Para el estado de la migración de código, ver
[MIGRACION_HOSTINGER_PENDIENTES.md](./MIGRACION_HOSTINGER_PENDIENTES.md).

**Regla de oro: el dominio se conecta al final.** Mientras no se toque el DNS,
`designfolio.jhonnyduque.com` sigue apuntando a Vercel y nada de lo que se haga aquí
afecta a lo que hay publicado. Se despliega, se verifica con la URL temporal de
Hostinger, y solo entonces se cambia el dominio.

---

## Estado

| Paso | Estado |
|---|---|
| 1. Base MySQL y usuario | ✅ `u152224864_designfolio` |
| 2. Esquema importado | ✅ 13 tablas, 9 categorías, 4 migraciones registradas |
| 3. Sitio como aplicación Node.js | ⏳ |
| 4. Variables de entorno | ⏳ |
| 5. Despliegue de la rama | ⏳ |
| 6. Respaldo por cron | ⏳ |
| 7. Verificación funcional | ⏳ |
| 8. Conectar dominio y SSL | ⏳ |
| 9. Retirar el proyecto de Vercel | ⏳ |

---

## 3. Sitio como aplicación Node.js

El sitio existe desde 2026-02-11 pero está vacío y como tipo genérico. Hay que
convertirlo en aplicación Node.

**Requisito que hay que confirmar antes de nada: Next.js 16 necesita Node 20 o
superior.** Si el plan solo ofrece Node 18, hay que resolverlo antes de seguir.

Configuración esperada:

| Ajuste | Valor |
|---|---|
| Versión de Node | 20 o superior |
| Comando de instalación | `npm install` (**no** `--omit=dev`: la compilación necesita TypeScript y Tailwind) |
| Comando de compilación | `npm run build` |
| Comando de arranque | `npm start` |
| Puerto | El que provea el entorno; `next start` respeta `PORT` |

El despliegue desde GitHub es preferible: la rama `codex/hostinger-mysql-migration`
ya está publicada y cada cambio posterior se despliega solo.

---

## 4. Variables de entorno

```
DATABASE_URL=mysql://u152224864_designfolio:CONTRASEÑA@localhost:3306/u152224864_designfolio
BETTER_AUTH_URL=https://designfolio.jhonnyduque.com
BETTER_AUTH_SECRET=<32+ caracteres aleatorios>
BOOTSTRAP_ADMIN_EMAIL=<el correo del administrador>
MEDIA_ROOT=/home/u152224864/designfolio-media
SMTP_HOST=<servidor SMTP>
SMTP_PORT=465
SMTP_USER=<buzón>
SMTP_PASSWORD=<contraseña del buzón>
SMTP_FROM=Designfolio <no-reply@jhonnyduque.com>
```

Notas que evitan errores difíciles de diagnosticar:

- **`DATABASE_URL` es una URL.** Si la contraseña contiene `@`, `#`, `/`, `:` o `%`,
  hay que codificarlos o la conexión falla con un mensaje confuso. Lo más simple es
  usar una contraseña solo de letras y números.
- **`BETTER_AUTH_URL` debe ser la URL pública final**, con `https`. Los enlaces de
  verificación de correo y de restablecimiento de contraseña se construyen a partir
  de ella. Durante las pruebas con la URL temporal, ponerla apuntando a esa URL
  temporal y cambiarla al conectar el dominio.
- **`BETTER_AUTH_SECRET`** se genera así y no se reutiliza de desarrollo:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
  ```
- **`MEDIA_ROOT` debe quedar fuera del directorio de la aplicación.** Es el motivo de
  todo el trabajo de almacenamiento: cada despliegue reemplaza la carpeta de la app.
  Hay que crear ese directorio y darle permisos de escritura.
- **No hace falta Remote MySQL.** La aplicación corre en el mismo servidor y se
  conecta por `localhost`, que además es más seguro.

---

## 6. Respaldo por cron

Esto va **antes** de que entre contenido real, no después. Este proyecto ya perdió
una base entera por no tenerlo.

Hostinger hace respaldos diarios del hosting, pero conviene además un volcado propio
de la base, que se restaura sin depender del soporte:

```bash
mysqldump -u u152224864_designfolio -p'CONTRASEÑA' u152224864_designfolio \
  | gzip > /home/u152224864/backups/designfolio-$(date +\%Y\%m\%d).sql.gz
```

Diario, con borrado de los de más de 14 días:

```bash
find /home/u152224864/backups -name 'designfolio-*.sql.gz' -mtime +14 -delete
```

**Probar una restauración de verdad** sobre una base vacía. Un respaldo que nunca se
restauró no es un respaldo, es una suposición.

---

## 7. Verificación funcional

Con la URL temporal, antes de tocar el dominio. En este orden:

1. La portada redirige a `/proyectos` y el feed carga vacío, sin error.
2. Registrar la cuenta de `BOOTSTRAP_ADMIN_EMAIL` en `/register`.
   - El formulario pide código de invitación; para esta cuenta el servidor lo ignora,
     así que sirve cualquier texto.
3. Llega el correo de verificación y el enlace funciona. **Aquí se comprueba SMTP.**
4. Completar el onboarding.
5. Publicar un proyecto con imágenes **y con un video**. El video nunca se probó en
   local: es la comprobación que más falta hace.
6. El proyecto aparece en el feed y su página individual carga los medios.
7. Comprobar los tres ordenamientos: recientes, más votados, más comentados.
8. Dar like y comentar **sin sesión**, desde una ventana privada.
9. Generar un código de invitación desde el panel, registrar una segunda cuenta con
   él, y confirmar que no se puede reutilizar.
10. Publicar con esa segunda cuenta: debe quedar en revisión, no en el feed.
11. Aprobarlo desde el panel y verificar que el autor recibe la notificación.
12. **Desplegar otra vez y confirmar que los medios siguen ahí.** Es la prueba de que
    `MEDIA_ROOT` está bien puesto, y la razón de todo este trabajo.

---

## 8. Conectar dominio y SSL

Solo cuando lo anterior esté comprobado.

1. Conectar `designfolio.jhonnyduque.com` al sitio en Hostinger.
2. Instalar SSL. Hoy figura como no activo porque el dominio no está conectado.
3. Actualizar `BETTER_AUTH_URL` a la URL definitiva y reiniciar la aplicación.
4. Comprobar que `https://designfolio.jhonnyduque.com/proyectos` sirve la versión
   nueva: `/api/feed` debe responder 200, no 404.

---

## 9. Retirar Vercel

Cuando el dominio ya sirva desde Hostinger y esté verificado:

1. Quitar el dominio personalizado del proyecto en Vercel, para que no queden dos
   sitios disputándose el mismo nombre.
2. Conservar el proyecto de Vercel unos días como vía de vuelta, y luego eliminarlo.
3. El proyecto de Supabase ya no existe: no hay nada que retirar ahí.

---

## Pendiente de código, no bloqueante

Rate limiting, CAPTCHA en el registro y validación binaria de archivos —hoy
`lib/media.ts` confía en el tipo que declara el navegador—. Conviene tenerlo antes de
abrir el registro a terceros, pero no impide desplegar y verificar.
