# F1 — Separación de contratos de datos

## Estado inicial

- F0: ✅ FINALIZADA.
- F1: ⬜ NO INICIADA antes de la autorización del 20 de septiembre de 2026.
- Rama: `codex/hostinger-mysql-migration`.
- SHA base: `1425254` (`docs(plan): close F0 baseline audit`).
- Árbol inicial: incluía los nueve archivos modificados del bloque de estabilización pre-F1 y los archivos no rastreados `.claude/`, `.github/`, `.playwright-cli/`, `FRONTEND-UX-AUDIT.md` y `tests/terms.test.ts`. No se eliminaron ni se añadieron a F1.

## Contrato FeedItem

`FeedItem` se mantiene como el contrato del endpoint de feed. Sigue limitado a la tarjeta/post: identidad, media, texto, autor resumido, métricas y fechas. No incorpora permisos, estado de moderación, datos de propietario ni comentarios completos.

Se eliminó la definición duplicada de `WorkImage` en `types/feed.ts`; ahora reutiliza `types/work.ts`.

El contrato de presentación no declara `tags` ni `trending_score`: el feed actual no los consume. El endpoint no se modificó en F1, por lo que cualquier campo extra de transporte continúa siendo ignorado por el cliente.

## Contrato PublicProjectDetail

`PublicProjectDetail` formaliza el detalle que puede recibir cualquier superficie pública:

- `project`: identidad, slug, contenido, categoría, tags, media y fechas públicas;
- `author`: resumen más bio y escuela públicas;
- `metrics`: likes, comentarios, vistas y compartidos;
- `navigation`: vecinos públicos por id/slug.

`getPublicWork` devuelve `PublicProjectDetail | null` y selecciona explícitamente solo esas columnas. Ya no devuelve una fila completa de `works`, por lo que no filtra estado de moderación, fecha de archivado ni otros campos internos a sus consumidores.

## Contrato DashboardProjectDetail

`DashboardProjectDetail` representa el detalle protegido del dashboard. Compone los mismos datos comunes y añade, únicamente en `project`, `moderationStatus` y `archivedAt`; en `viewer` declara `isOwner`, `canEdit`, `canArchive` y `canDelete`.

El nombre no dice "Owner" porque no sería exacto: `getDashboardWork` devuelve `DashboardProjectDetail | null` y mantiene el acceso actual. El propietario puede ver cualquier estado propio; otro usuario autenticado puede ver únicamente una obra aprobada y no archivada, con todas sus capacidades de edición en `false`.

## Tipos compartidos

En `types/project.ts` se crearon solo los tipos con reutilización directa:

- `ProjectMetrics`;
- `ProjectAuthorSummary` y `PublicProjectAuthor`;
- `ProjectNavigation`;
- `PublicProject`;
- `PublicProjectDetail` y `DashboardProjectDetail`.

La media sigue usando el único `WorkImage` existente.

## Consultas públicas

`lib/works/public.ts` conserva nombre, lookup por UUID/slug, filtro aprobado/no archivado, vecinos y contadores. La diferencia es contractual: selecciona columnas públicas de forma explícita y las normaliza al contrato público antes de retornarlas.

## Consultas protegidas

`lib/works/dashboard.ts` conserva sus reglas de acceso y navegación. La consulta normaliza los campos que el dashboard requiere y expone capacidades del viewer en lugar de hacer depender el contrato de una fila cruda de base de datos.

## Transformaciones/adaptadores

`lib/works/detail-adapter.ts` contiene `toLegacyWorkDetailData`. Es un adaptador temporal y pequeño para el `WorkDetail` existente; elimina la transformación duplicada que antes vivía en ambas páginas. No define los contratos de dominio ni modifica la UI. Su retirada o sustitución pertenece a F2.

## Frontera de seguridad pública/protegida

La consulta pública no selecciona email, `isFounder`, `isActive`, aceptación de términos, categorías privadas, estado de moderación, archivado ni permisos. No se detectó una exposición sensible pública adicional durante F1.

## Métricas

`ProjectMetrics` mantiene una definición única para los tres contadores de detalle y el feed sigue usando sus nombres de protocolo en snake_case. La fuente sigue siendo la misma: conteos de likes/comentarios y columnas `viewsCount`/`sharesCount` de `works`.

## Media

No se crearon tipos nuevos de media. `FeedItem`, detalle público, detalle protegido y el adaptador usan `WorkImage` de `types/work.ts`.

## Autor

El feed mantiene su resumen propio de protocolo. Los detalles comparten `ProjectAuthorSummary`; el contrato público añade únicamente `bio` y `school`, ya visibles en el detalle actual. No se exponen email ni campos administrativos.

## Archivos modificados

- `types/feed.ts`
- `lib/works/public.ts`
- `lib/works/dashboard.ts`
- `app/(marketing)/proyectos/[id]/page.tsx`
- `app/(protected)/dashboard/work/[id]/page.tsx`
- `plan/PLAN_MAESTRO_MIGRACION_SINGLE_A_FEED_DESIGNFOLIO.md`

## Archivos nuevos

- `types/project.ts`
- `lib/works/detail-adapter.ts`
- `tests/project-contracts.test.ts`
- este documento.

## Pruebas

- `npx tsc --noEmit --pretty false`: PASS.
- ESLint completo: PASS, 0 errores y 29 advertencias. Frente al baseline de F0, no se introducen errores; el bloque pre-F1 resolvió los 15 errores históricos.
- `npm test`: PASS, 7/7. Se añadió una prueba del adaptador público.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- Navegador local con Docker: PASS para `/` y `/proyectos/memoria-anual-de-fundacion-cultural-3`; feed, permalink, media, métricas, comentarios y compartir permanecen visibles. No se usó producción.
- Dashboard autenticado: no se ejecutó una prueba manual por no disponer de credenciales en esta sesión. La página conserva su markup, acciones y ruta; solo consume el adaptador temporal.

## Riesgos

- `WorkDetail` sigue mezclando UI pública y de propietario; F1 solo aisló los datos. F2 debe extraer piezas visuales sin cambiar los contratos.
- El dashboard manual autenticado queda como verificación obligatoria antes de cerrar una fase que cambie su UI o acciones.

## Desviaciones

- Ninguna de DB, API, routing, UX, feed UI, comentarios o componentes visuales.
- El bloque de estabilización existente se conservó en el árbol y no forma parte conceptual de F1, aunque participa en las validaciones actuales.
- Corrección posterior de F1: `FeedItem` dejó de declarar campos no consumidos (`tags` y `trending_score`) y el contrato protegido se renombró a `DashboardProjectDetail` para no presentar como propietario un acceso autorizado de lectura ajeno. No cambia datos, permisos, API ni UI.

## Gate F1 → F2

Checklist:

- [x] FeedItem explícito y limitado al feed.
- [x] PublicProjectDetail explícito.
- [x] DashboardProjectDetail explícito y fiel a las reglas de acceso existentes.
- [x] La consulta pública no devuelve datos de propietario.
- [x] El dashboard conserva datos y capacidades necesarias.
- [x] Retornos explícitos de `getPublicWork` y `getDashboardWork`.
- [x] Media y métricas comparten una definición coherente.
- [x] WorkDetail, single público y feed se conservan visualmente.
- [x] Sin cambios de UX, routing, DB ni API.
- [x] TypeScript, lint, tests, build y `git diff --check` correctos.

Estado propuesto: ✅ F1 FINALIZADA. F2 permanece ⬜ NO INICIADA hasta una nueva autorización.
