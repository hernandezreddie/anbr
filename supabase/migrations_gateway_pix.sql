-- ============================================
-- FASE 5 — GATEWAY PIX (Mercado Pago)
-- Columnas para cobrança dinâmica + evidência de pagamento
-- Aplicar via Supabase Dashboard → SQL Editor
-- ============================================

ALTER TABLE pagamentos_pix
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS pix_qr_code_base64 TEXT,
  ADD COLUMN IF NOT EXISTS txid TEXT,
  ADD COLUMN IF NOT EXISTS pix_chave TEXT,
  ADD COLUMN IF NOT EXISTS expira_em TIMESTAMPTZ;

-- Índice para lookup rápido do webhook (payment_id do gateway)
CREATE INDEX IF NOT EXISTS idx_pagamentos_pix_payment_id ON pagamentos_pix (payment_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_pix_status ON pagamentos_pix (status);
