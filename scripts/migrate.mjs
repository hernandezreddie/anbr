import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ifsjouhcndmcfqjfawta.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlmc2pvdWhjbmRtY2ZxamZhd3RhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgyNjQzNSwiZXhwIjoyMTAwNDAyNDM1fQ.FyAsc2Tjc1z3rPa_QER1AmgIT-Pdmwnc09v2hSqL4xo'
);

const sql = `
ALTER TABLE servicos ADD COLUMN IF NOT EXISTS tipo_preco TEXT DEFAULT 'por_hora' CHECK (tipo_preco IN ('por_hora', 'fixo'));
ALTER TABLE servicos ADD COLUMN IF NOT EXISTS preco_fixo DECIMAL(10,2) DEFAULT 0;
ALTER TABLE servicos ADD COLUMN IF NOT EXISTS duracao_minutos INT DEFAULT 60;
`;

async function run() {
  const { data, error } = await supabase.rpc('pg_query', { query_text: sql });
  console.log('pg_query result:', JSON.stringify({ data, error }));
  
  // Fallback: try to add columns via direct REST API
  if (error) {
    console.log('pg_query not available, trying direct migration...');
    const { data: d2, error: e2 } = await supabase.from('servicos').select('tipo_preco').limit(1);
    console.log('Check tipo_preco exists:', JSON.stringify({ d2, e2 }));
  }
}
run().catch(console.error);
