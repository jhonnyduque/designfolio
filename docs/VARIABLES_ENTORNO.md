# Variables de entorno en producción

## Dónde se configuran

**hPanel → Websites → `designfolio.jhonnyduque.com` → Environment variables**

Enlace directo:

```
https://hpanel.hostinger.com/websites/designfolio.jhonnyduque.com/environment-variables
```

No están en «Avanzado → Node.js». Esa ruta no existe en este panel; en
«Avanzado» solo hay Acceso SSH, Editor de zona DNS y Registro de actividad.

La lista sale paginada de diez en diez. Hay **12 variables**, así que la
número 11 y la 12 están en la segunda página: es fácil darlas por ausentes si
solo se mira la primera.

## Las 12 variables

Aquí solo se anotan los nombres y para qué sirven. **Los valores no se
escriben en este archivo**: el repositorio es público, y varias de estas
variables son secretos. La ruta de `MEDIA_ROOT` tampoco, porque contiene el
usuario de la cuenta de hosting, que es el mismo con el que se entra por SSH.

### Base de datos

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Cadena de conexión a MySQL. La usa Drizzle y también Better Auth. |

### Autenticación

| Variable | Para qué |
|---|---|
| `BETTER_AUTH_SECRET` | Firma las sesiones y la cookie del código de invitación. |
| `BETTER_AUTH_URL` | URL pública del sitio. Better Auth la usa para construir los enlaces de los correos y el retorno de Google. |
| `GOOGLE_CLIENT_ID` | Acceso con Google. Si falta, el botón no se muestra. |
| `GOOGLE_CLIENT_SECRET` | Ídem. Las dos tienen que estar; con una sola, el proveedor no se declara. |
| `BOOTSTRAP_ADMIN_EMAIL` | El correo que recibe el rol de fundador al registrarse. Solo actúa una vez. |

### Correo transaccional

| Variable | Para qué |
|---|---|
| `SMTP_HOST` | Servidor de salida. |
| `SMTP_PORT` | Puerto. Si no está, el código asume 587. |
| `SMTP_USER` | Usuario del buzón. |
| `SMTP_PASSWORD` | Contraseña del buzón. |
| `SMTP_FROM` | Remitente que ve quien recibe el correo. |

Envían la verificación de la cuenta y el restablecimiento de contraseña. Ver
`lib/email.ts`.

### Almacenamiento

| Variable | Para qué |
|---|---|
| `MEDIA_ROOT` | Carpeta donde se guardan avatares y los medios de las obras. |

**Tiene que apuntar fuera de la carpeta de la aplicación.** Cada despliegue
reemplaza `hbuilds/current/`, así que cualquier archivo guardado ahí dentro
desaparecería. Está configurada correctamente, en una carpeta propia dentro
del `home` de la cuenta.

Si un día se borra esta variable, `lib/media-storage.ts` cae a `.media/`
dentro del proyecto y las subidas empiezan a perderse en silencio, sin error
visible, en el siguiente despliegue.

## Cuándo hace falta reconstruir

Casi todas se leen **en tiempo de ejecución**: se cambia el valor, se
reinicia la aplicación y ya está.

La excepción son las que empiezan por `NEXT_PUBLIC_`, que Next incrusta en el
código del navegador **al compilar**. Hoy no hay ninguna configurada, pero si
algún día se añade —por ejemplo `NEXT_PUBLIC_TURNSTILE_SITE_KEY` para el
CAPTCHA— no basta con reiniciar: hay que lanzar un despliegue nuevo.

## Cuidado al mirar esta pantalla

El botón **«Show all values»** destapa todos los secretos a la vez. Conviene
no pulsarlo si hay alguien mirando, y no hacer capturas de pantalla con los
valores visibles.

Si un valor llega a exponerse —en una captura, en un log de compilación, en
un mensaje— hay que darlo por comprometido y rotarlo, no confiar en que nadie
lo haya leído.

## Reflejo en local

En local las mismas variables van en `.env.local`, que está en `.gitignore` y
nunca se commitea. Los nombres son idénticos, así que lo que funciona en un
sitio funciona en el otro.
