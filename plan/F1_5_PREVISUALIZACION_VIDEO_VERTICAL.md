# F1.5 — Corrección de previsualización de vídeo vertical

## Estado

🔄 EN VALIDACIÓN EN PRODUCCIÓN. F2 permanece ⬜ NO INICIADA.

## Problema corregido

La vista previa de publicación imponía 16:9 y `object-cover`; por eso un vídeo
1080×1920 (9:16) quedaba recortado. El post móvil también imponía un contenedor
4:5 a todos los medios, incluidos los vídeos.

## Implementación

- `lib/media-aspect.ts` convierte dimensiones válidas de `WorkImage` en un
  `aspect-ratio` CSS seguro y conserva 4:5 como fallback para medios antiguos
  sin dimensiones.
- `FeedPost` usa esa proporción para el vídeo principal. Un medio 1080×1920 se
  presenta dentro de una superficie 9:16 y mantiene `object-contain`.
- La vista previa de `CreateWorkForm` comienza en 9:16 para vídeo y se ajusta a
  sus metadatos nativos al cargarlos; ya no usa `object-cover`.
- Las imágenes, miniaturas, carruseles, mosaico desktop, subida, API, DB y rutas
  no fueron modificados.

## Archivos

- `lib/media-aspect.ts` (nuevo)
- `components/feed/FeedPost.tsx`
- `components/works/CreateWorkForm.tsx`
- `tests/media-aspect.test.ts` (nuevo)
- `plan/PLAN_MAESTRO_MIGRACION_SINGLE_A_FEED_DESIGNFOLIO.md`
- este documento.

## Verificación realizada

- `npx tsc --noEmit --pretty false`: PASS.
- ESLint: PASS, 0 errores y 29 advertencias preexistentes.
- `npm test`: PASS, 9/9; incluye proporciones 1080×1920, 1920×1080 y fallback.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- Feed local: carga correctamente.

## Validación pendiente

No había un vídeo 1080×1920 ni sesión de creación disponibles en la base local.
Antes de marcar F1.5 como finalizada deben comprobarse en producción una
publicación nueva vertical y una existente, en móvil real, incluyendo controles,
carrusel y compartir. No se avanza a F2 hasta completar esa comprobación.
