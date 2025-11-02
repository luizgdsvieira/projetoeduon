import supabase from '../config/db.js';

export async function getSchool(req, res) {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', req.user.school_id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar escola:', err);
    res.status(500).json({ error: 'Erro ao buscar escola', details: err.message });
  }
}
