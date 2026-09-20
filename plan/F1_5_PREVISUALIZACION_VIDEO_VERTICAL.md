# F1.5 — Media en feed: proporción, reproducción e interacción

## Estado

🔄 IMPLEMENTADA PENDIENTE DE VALIDACIÓN EN DISPOSITIVO REAL. F2 permanece ⬜ NO INICIADA.

## Problema corregido

La miniatura inicial de carga imponía 4:3 con `object-cover`, el post móvil
mostraba los controles nativos y el mosaico desktop no iniciaba vídeo al entrar
en pantalla. También quedaban enlaces de feed que abrían el single heredado.

## Implementación

- `lib/media-aspect.ts` convierte dimensiones válidas de `WorkImage` en un
  `aspect-ratio` CSS seguro y conserva 4:5 como fallback para medios antiguos
  sin dimensiones.
- `FeedPost` usa esa proporción para el vídeo principal. Un medio 1080×1920 se
  presenta dentro de una superficie 9:16 y mantiene `object-contain`.
- `ImageUploader` conserva los archivos completos con `object-contain`: 9:16,
  4:5 y 16:9 no se recortan en su selección inicial.
- `FeedVideo` reemplaza los controles nativos: inicia al 30% de visibilidad,
  pausa al salir, está silenciado, permite activar sonido con un icono discreto,
  pinch temporal y doble tap para asegurar un like.
- `MosaicCell` reutiliza ese reproductor manteniendo su recorte editorial 4:5.
- El like de doble tap usa `PUT` idempotente: jamás quita un like existente.
- Media, título y comentarios del feed dejan de abrir el single; compartir usa
  el ancla del post en el feed. El `+` de cabecera solo aparece con sesión activa.

## Archivos

- `lib/media-aspect.ts` (nuevo)
- `components/feed/FeedPost.tsx`
- `components/feed/FeedVideo.tsx` (nuevo)
- `components/feed/MosaicCell.tsx`
- `components/feed/ZoomableMedia.tsx`
- `components/works/ImageUploader.tsx`
- `components/works/LikeButton.tsx`
- `hooks/useLike.ts`
- `app/api/works/[id]/likes/route.ts`
- `components/layout/PublicHeader.tsx`
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
publicación nueva vertical y una existente, en móvil real, incluyendo
reproducción, sonido, pinch, doble tap, carrusel y compartir. No se avanza a F2
hasta completar esa comprobación.
