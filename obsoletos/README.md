# Obsoletos

Código que ya no se ejecuta, guardado por si vuelve a hacer falta.

Nada de aquí dentro se compila: `obsoletos` está en el `exclude` del
`tsconfig.json`, y como vive fuera de `app/` tampoco genera rutas. Se puede
leer y copiar de vuelta, pero no participa en la aplicación.

## `etiquetas/`

El subsistema de etiquetas libres, distinto de las **categorías**, que siguen
vivas en `components/works/TaxonomySelector.tsx` y en el panel de Taxonomía.

Era una isla cerrada: la ruta `/dashboard/moderation/tags` no estaba enlazada
desde ningún menú, y su panel no lo abría nadie. `TagSelector` y `useTags` ya
no los importaba ningún archivo.

| Archivo | Qué era |
|---|---|
| `ruta-tags-page.tsx` | La página en `app/(protected)/dashboard/moderation/tags/` |
| `TagsModerationPanel.tsx` | El panel de administración de etiquetas, 447 líneas |
| `useTagsAdmin.ts` | Su hook, solo lo usaba ese panel |
| `TagSelector.tsx` | El selector al publicar. Lo sustituyó `TaxonomySelector` |
| `useTags.ts` | Su hook |

Lo que **no** se movió: `types/tag.ts` y `lib/server/actions/taxonomy.ts`
siguen en su sitio, porque `app/api/works/route.ts` y `useTaxonomy` los usan.

Para revivirlo: devolver los archivos a su ruta original, recrear la carpeta
`app/(protected)/dashboard/moderation/tags/` y añadir el destino al menú de
`DashboardShell.tsx`.

## `sql-supabase/`

Migraciones de cuando el proyecto corría sobre Supabase y PostgreSQL. No se
pueden aplicar a MySQL: usan `jsonb`, `gen_random_uuid()`, políticas de
seguridad por fila y el almacenamiento de Supabase.

Su contenido ya está incorporado al esquema actual, que vive completo en
`sql/deploy-completo.sql`. Se guardan como historia de por qué el esquema es
como es.

## `scripts/`

| Archivo | Por qué ya no hace falta |
|---|---|
| `migrate-media.ts` | Movió los medios de `public/uploads/` a `MEDIA_ROOT`. Un solo uso, ya ejecutado |
| `smoke-mysql.ts` | Prueba de humo de la conexión, de cuando se verificaba la migración |

Los que siguen vivos están en `scripts/`: `seed-demo.ts`, `seed-taxonomy.ts` y
`make_founder.ts`.
