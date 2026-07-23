-- ============================================
-- LIVRETA — Dados de Teste
-- Rodar DEPOIS de migrations.sql
-- ============================================

-- 1. Criar usuário de teste no Auth
-- Vá em Authentication > Add User
-- Email: caridad@email.com
-- Senha: 123456
-- Copie o UUID gerado e use abaixo

-- 2. Inserir profissional
INSERT INTO profissionais (slug, nome, slogan, cidade, email, whatsapp, pix_chave, pix_nome, pix_cidade)
VALUES (
  'caridad-teste',
  'Caridad Ceregido',
  'Limpeza profissional de confiança em Curitiba',
  'Curitiba',
  'caridad@email.com',
  '5541984226267',
  '09772499991',
  'CARIDAD CEREGIDO',
  'CURITIBA'
);

-- 3. Configuração visual
INSERT INTO configuracoes (profissional_id, template_id, slogan)
SELECT id, 1, slogan FROM profissionais WHERE slug = 'caridad-teste';

-- 4. Serviços
INSERT INTO servicos (profissional_id, nome, descricao, descricao_curta, horas_base, valor_hora, horas_minimas, ordem)
SELECT p.id, s.nome, s.descricao, s.desc_curta, s.horas, s.vh, s.min, s.ord
FROM profissionais p
CROSS JOIN (VALUES
  ('Limpeza Padrão',   'Manutenção do dia a dia',     'Ideal para limpeza semanal ou quinzenal', 2.5, 30, 3, 1),
  ('Limpeza Pesada',   'Faxina completa e detalhada', 'Recomendado para primeira visita',         2.5, 35, 7, 2),
  ('Comercial',        'Escritórios e lojas',          'Para seu negócio',                         2,   35, 3, 3),
  ('Passadoria',       'Roupas passadas com capricho', 'Por peça ou por hora',                     0,   25, 2, 4)
) AS s(nome, descricao, desc_curta, horas, vh, min, ord)
WHERE p.slug = 'caridad-teste';

-- 5. Adicionais (para TODOS os serviços da Caridad)
INSERT INTO adicionais (profissional_id, nome, preco, horas)
SELECT p.id, a.nome, a.preco, a.horas
FROM profissionais p
CROSS JOIN (VALUES
  ('Área de serviço / lavanderia', 15, 0.5),
  ('Interior de geladeira',        15, 0.5),
  ('Interior de janelas',          30, 1),
  ('Interior de armários',         30, 1.5),
  ('Aspirar tapete ou estofado',   20, 1),
  ('Área externa (até 20m²)',     45, 2),
  ('Passadoria de roupas (+2h)',   50, 2),
  ('Lavar roupas',                 20, 1)
) AS a(nome, preco, horas)
WHERE p.slug = 'caridad-teste';

-- 6. Frequências
INSERT INTO frequencias (profissional_id, nome, slug, desconto, ordem)
SELECT p.id, f.nome, f.slug, f.desconto, f.ordem
FROM profissionais p
CROSS JOIN (VALUES
  ('Pontual',   'pontual',   0,  1),
  ('Mensal',    'mensal',    5,  2),
  ('Quinzenal', 'quinzenal', 10, 3),
  ('Semanal',   'semanal',   15, 4)
) AS f(nome, slug, desconto, ordem)
WHERE p.slug = 'caridad-teste';

-- 7. Vincular usuário ao profissional (SUBSTITUA O UUID)
-- INSERT INTO profiles (id, profissional_id, role)
-- VALUES ('UUID_DO_USUARIO_AQUI', (SELECT id FROM profissionais WHERE slug = 'caridad-teste'), 'owner');
