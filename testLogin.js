import supabase from './src/config/db.js';
import bcrypt from 'bcrypt';

// Script para testar o login
async function testLogin() {
  try {
    console.log('🧪 Testando conexão com Supabase...');
    
    // Teste 1: Verificar se a tabela users existe
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao acessar tabela users:', error);
      return;
    }
    
    console.log('✅ Conexão com Supabase OK');
    console.log('📊 Usuários encontrados:', users.length);
    
    if (users.length > 0) {
      console.log('👤 Primeiro usuário:', {
        username: users[0].username,
        role: users[0].role,
        hasPassword: !!users[0].password_hash
      });
      
      // Teste 2: Testar hash de senha
      const testPassword = '123456';
      const isMatch = await bcrypt.compare(testPassword, users[0].password_hash);
      console.log('🔐 Teste de senha "123456":', isMatch ? '✅ CORRETO' : '❌ INCORRETO');
    }
    
  } catch (err) {
    console.error('🔥 Erro no teste:', err);
  }
}

testLogin();
