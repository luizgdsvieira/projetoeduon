import supabase from '../config/db.js';
import bcrypt from 'bcryptjs';

const { hash } = bcrypt;

async function createFuncionario(req, res) {
  const { name, cargo, nascimento, school_id } = req.body;

  const { data: staff, error } = await supabase
    .from('staff')
    .insert([{ name, cargo, nascimento, school_id }])
    .select('*')
    .single();

  if (error) return res.status(400).json({ error });

  const username = `${school_id.slice(0, 6)}-stf-${staff.id.slice(0, 6)}`;
  const passwordPlain = Math.random().toString(36).slice(-8);
  const password_hash = await hash(passwordPlain, 10);

  await supabase.from('users').insert([{ school_id, username, password_hash, role: 'staff', staff_id: staff.id }]);

  res.json({ staff, credentials: { username, password: passwordPlain } });
}

export { createFuncionario };

export const getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('school_id', req.user.school_id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar funcionários:', err);
    res.status(500).json({ error: 'Erro ao buscar funcionários', details: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', req.params.id)
      .eq('school_id', req.user.school_id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar funcionário:', err);
    res.status(500).json({ error: 'Erro ao buscar funcionário', details: err.message });
  }
};

export const create = async (req, res) => {
  try {
    console.log('📥 Dados recebidos para cadastro de funcionário:', req.body);
    console.log('👤 Usuário logado:', req.user);
    
    // Validar campos obrigatórios
    if (!req.body.name && !req.body.nome) {
      return res.status(400).json({ 
        error: 'Nome é obrigatório',
        details: 'O campo name ou nome deve ser fornecido'
      });
    }
    
    // Preparar dados do funcionário
    const funcionario = { 
      name: req.body.name || req.body.nome,
      cargo: req.body.cargo || null,
      nascimento: req.body.nascimento || null,
      school_id: req.user.school_id 
    };
    
    // Remover campos undefined ou vazios (exceto school_id que é obrigatório)
    Object.keys(funcionario).forEach(key => {
      if (key !== 'school_id' && (funcionario[key] === undefined || funcionario[key] === '' || funcionario[key] === null)) {
        delete funcionario[key];
      }
    });
    
    console.log('📝 Dados do funcionário a serem inseridos:', funcionario);
    
    const { data, error } = await supabase
      .from('staff')
      .insert([funcionario])
      .select();
    
    if (error) {
      console.error('❌ Erro do Supabase:', error);
      return res.status(400).json({ 
        error: 'Erro ao cadastrar funcionário', 
        details: error.message,
        code: error.code
      });
    }
    
    console.log('✅ Funcionário cadastrado com sucesso:', data);
    
    // Verificar se data existe e tem elementos
    if (!data || data.length === 0) {
      console.warn('⚠️ Supabase retornou array vazio, mas o insert pode ter funcionado');
      // Buscar o funcionário recém-criado como fallback
      const { data: funcionarioCriado } = await supabase
        .from('staff')
        .select('*')
        .eq('school_id', req.user.school_id)
        .eq('name', funcionario.name)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (funcionarioCriado) {
        return res.status(201).json(funcionarioCriado);
      }
      
      return res.status(201).json({ 
        message: 'Funcionário cadastrado com sucesso',
        name: funcionario.name,
        school_id: funcionario.school_id
      });
    }
    
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('🔥 Erro no controller:', err);
    res.status(500).json({ 
      error: 'Erro ao cadastrar funcionário', 
      details: err.message 
    });
  }
};
