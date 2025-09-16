import supabase from '../src/config/db.js';
import bcrypt from 'bcrypt';

async function main() {
  try {
    // ID da escola de teste (ou você pode criar uma nova escola aqui também)
    const schoolId = 'a143150f-9ac6-4576-8150-23a9268feae9';

    // Cria a senha com bcrypt
    const password = '123456';
    const password_hash = await bcrypt.hash(password, 10);

    // Insere usuário admin
    const { data, error } = await supabase.from('users').insert([
      {
        username: 'admin@teste.com',
        password_hash,
        role: 'admin',
        school_id: schoolId
      }
    ]);

    if (error) throw error;
    console.log('Usuário admin criado com sucesso:', data);
    process.exit(0);
  } catch (err) {
    console.error('Erro ao criar usuário admin:', err);
    process.exit(1);
  }
}

main();
