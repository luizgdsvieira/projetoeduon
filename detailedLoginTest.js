import supabase from './src/config/db.js';
import bcrypt from 'bcrypt';

// Teste detalhado do login
async function detailedLoginTest() {
  try {
    console.log('🔍 TESTE DETALHADO DE LOGIN');
    console.log('============================');
    
    const username = 'admin@teste.com';
    const password = '123456';
    
    console.log(`📧 Username: ${username}`);
    console.log(`🔐 Password: ${password}`);
    
    // 1. Buscar usuário
    console.log('\n1️⃣ Buscando usuário no banco...');
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na consulta:', error);
      return;
    }
    
    console.log(`📊 Usuários encontrados: ${users.length}`);
    
    if (users.length === 0) {
      console.log('❌ NENHUM USUÁRIO ENCONTRADO!');
      return;
    }
    
    const user = users[0];
    console.log('👤 Usuário encontrado:', {
      id: user.id,
      username: user.username,
      role: user.role,
      school_id: user.school_id,
      password_hash_length: user.password_hash?.length || 0
    });
    
    // 2. Testar senha
    console.log('\n2️⃣ Testando senha...');
    const match = await bcrypt.compare(password, user.password_hash);
    console.log(`🔐 Senha correta: ${match ? '✅ SIM' : '❌ NÃO'}`);
    
    if (!match) {
      console.log('❌ SENHA INCORRETA!');
      return;
    }
    
    // 3. Simular resposta da API
    console.log('\n3️⃣ Simulando resposta da API...');
    const mockResponse = {
      token: 'mock_token_here',
      role: user.role,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        school_id: user.school_id
      }
    };
    
    console.log('✅ Resposta simulada:', mockResponse);
    console.log('\n🎉 LOGIN DEVERIA FUNCIONAR!');
    
  } catch (err) {
    console.error('🔥 Erro no teste:', err);
  }
}

detailedLoginTest();
