-- Landing por tipo de negocio: copys consistentes por categoría
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS categoria TEXT NOT NULL DEFAULT 'outro';
