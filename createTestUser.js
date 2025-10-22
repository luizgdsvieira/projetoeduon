import supabase from './src/config/db.js';
import bcrypt from 'bcrypt';

async function createTestUser() {
  try {
    console.log('🔧 Criando usuário de teste...');
    
    // Senha de teste
    const password = '123456';
    const password_hash = await bcrypt.hash(password, 10);
    
    // Dados do usuário de teste
    const testUser = {
      username: 'teste@eduon.com',
      password_hash,
      role: 'admin',
      school_id: 'a143150f-9ac6-4576-8150-23a9268feae9' // ID da escola de teste
    };
    
    // Verificar se o usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('username', testUser.username)
      .limit(1);
    
    if (existingUser && existingUser.length > 0) {
      console.log('⚠️ Usuário já existe. Atualizando senha...');
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash })
        .eq('username', testUser.username);
      
      if (updateError) throw updateError;
      console.log('✅ Senha atualizada com sucesso!');
    } else {
      // Criar novo usuário
      const { data, error } = await supabase
        .from('users')
        .insert([testUser]);
      
      if (error) throw error;
      console.log('✅ Usuário de teste criado com sucesso!');
    }
    
    console.log('\n📋 DADOS PARA TESTE:');
    console.log('Username:', testUser.username);
    console.log('Password:', password);
    console.log('Role:', testUser.role);
    
  } catch (err) {
    console.error('🔥 Erro ao criar usuário de teste:', err);
  }
}

createTestUser();
