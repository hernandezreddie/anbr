import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
