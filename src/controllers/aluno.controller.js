import supabase from '../config/db.js';

export async function getAll(req, res) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', req.user.school_id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar alunos:', err);
    res.status(500).json({ error: 'Erro ao buscar alunos', details: err.message });
  }
}

export async function getById(req, res) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', req.params.id)
      .eq('school_id', req.user.school_id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar aluno:', err);
    res.status(500).json({ error: 'Erro ao buscar aluno', details: err.message });
  }
}

export async function create(req, res) {
  try {
    console.log('📥 Dados recebidos para cadastro:', req.body);
    console.log('👤 Usuário logado:', req.user);
    
    // Validar campos obrigatórios
    if (!req.body.name && !req.body.nome) {
      return res.status(400).json({ 
        error: 'Nome é obrigatório',
        details: 'O campo name ou nome deve ser fornecido'
      });
    }
    
    // Preparar dados do aluno - limpar campos vazios e garantir nome correto
    const aluno = { 
      name: req.body.name || req.body.nome, // Aceita ambos os formatos
      matricula: req.body.matricula || null,
      ano: req.body.ano || null,
      turma: req.body.turma || null,
      turno: req.body.turno || null,
      nascimento: req.body.nascimento || null,
      school_id: req.user.school_id 
    };
    
    // Remover campos undefined ou vazios (exceto school_id que é obrigatório)
    Object.keys(aluno).forEach(key => {
      if (key !== 'school_id' && (aluno[key] === undefined || aluno[key] === '' || aluno[key] === null)) {
        delete aluno[key];
      }
    });
    
    console.log('📝 Dados do aluno a serem inseridos:', aluno);
    
    const { data, error } = await supabase
      .from('students')
      .insert([aluno])
      .select();
    
    if (error) {
      console.error('❌ Erro do Supabase:', error);
      console.error('📋 Código do erro:', error.code);
      console.error('📋 Mensagem:', error.message);
      console.error('📋 Detalhes:', error.details);
      console.error('📋 Hint:', error.hint);
      return res.status(400).json({ 
        error: 'Erro ao cadastrar aluno', 
        details: error.message,
        code: error.code,
        hint: error.hint
      });
    }
    
    console.log('✅ Aluno cadastrado com sucesso:', data);
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('🔥 Erro no controller:', err);
    res.status(500).json({ 
      error: 'Erro ao cadastrar aluno', 
      details: err.message 
    });
  }
}
