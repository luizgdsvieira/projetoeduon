import supabase from '../config/db.js';

export async function getAll(req, res) {
  try {
    const { data, error } = await from('students')
      .select('*')
      .eq('school_id', req.user.school_id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
}

export async function getById(req, res) {
  try {
    const { data, error } = await from('students')
      .select('*')
      .eq('id', req.params.id)
      .eq('school_id', req.user.school_id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar aluno' });
  }
}
