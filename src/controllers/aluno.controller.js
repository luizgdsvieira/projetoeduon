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
    const aluno = { ...req.body, school_id: req.user.school_id };
    const { data, error } = await supabase.from('students').insert([aluno]);
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar aluno' });
  }
}
