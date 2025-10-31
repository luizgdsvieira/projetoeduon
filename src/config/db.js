import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Validação das variáveis de ambiente
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL não está definida no arquivo .env');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY não está definida no arquivo .env');
}

console.log('🔧 Configurando Supabase client...');
console.log('📡 SUPABASE_URL:', process.env.SUPABASE_URL);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'eduon-api',
      },
    },
  }
);

// Teste de conexão com melhor tratamento de erro
async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error);
      console.error('📋 Detalhes do erro:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Conexão com Supabase estabelecida');
    }
  } catch (err) {
    console.error('❌ Erro ao testar conexão Supabase:', err);
    console.error('📋 Tipo do erro:', err.constructor.name);
    console.error('📋 Mensagem:', err.message);
    if (err.cause) {
      console.error('📋 Causa:', err.cause);
    }
    if (err.stack) {
      console.error('📋 Stack:', err.stack);
    }
  }
}

// Executa teste de conexão
testConnection();

export default supabase;
