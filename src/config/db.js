import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Validação das variáveis de ambiente
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL não está definida no arquivo .env');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY não está definida no arquivo .env');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Teste de conexão
supabase.from('users').select('count').limit(1)
  .then(() => console.log('✅ Conexão com Supabase estabelecida'))
  .catch(err => console.error('❌ Erro na conexão com Supabase:', err));

export default supabase;
