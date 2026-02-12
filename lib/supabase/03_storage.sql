-- ============================================================
-- Designfolio v2.1 — Storage: Bucket + Policies
-- Ejecutar en Supabase SQL Editor DESPUÉS de 01_init.sql
-- ============================================================

-- Crear bucket para imágenes de obras
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'works',
  'works',
  true,                                    -- público: las URLs son accesibles sin auth
  5242880,                                 -- 5MB max por archivo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- Policies de Storage
-- Estructura de path: works/{user_id}/{work_id}/{filename}
-- ────────────────────────────────────────────────────────────

-- SELECT: público (las imágenes de obras approved son visibles)
CREATE POLICY "Works images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'works');

-- INSERT: solo el dueño puede subir a su carpeta
CREATE POLICY "Users can upload work images to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'works'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: solo el dueño puede actualizar sus imágenes
CREATE POLICY "Users can update own work images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'works'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: solo el dueño puede eliminar sus imágenes
CREATE POLICY "Users can delete own work images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'works'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
