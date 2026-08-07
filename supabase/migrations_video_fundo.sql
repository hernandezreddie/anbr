-- Video de fundo da landing (opcional, com prioridade sobre foto_fundo)
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS video_fundo TEXT;
