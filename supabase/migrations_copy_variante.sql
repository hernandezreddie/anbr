-- Variantes de texto do site (estilo de copy escolhido no cadastro/painel)
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS copy_variante INT DEFAULT 0;
