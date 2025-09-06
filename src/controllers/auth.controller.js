import supabase from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { sign } = jwt;
const { compare } = bcrypt;

export async function login(req, res) {
  try {
    const { username, password, school } = req.body;

    // 1. Verifica se a escola existe
    const { data: escolas, error: escolaError } = await supabase
      .from('schools')
      .select('*')
      .eq('name', school)
      .limit(1);

    if (escolaError) throw escolaError;
    if (!escolas || escolas.length === 0) {
      return res.status(401).json({ error: 'Escola não encontrada' });
    }

    const escola = escolas[0];

    // 2. Busca o usuário dentro dessa escola
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('school_id', escola.id)
      .limit(1);

    if (error) throw error;

    const user = users[0];
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado nesta escola' });
    }

    // 3. Verifica senha
    const match = await compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Senha inválida' });

    // 4. Gera token com school_id
    const token = sign(
      { id: user.id, role: user.role, school_id: user.school_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, role: user.role, school: escola.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no login' });
  }
}



/*

import supabase from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { sign } = jwt;
const { compare } = bcrypt;

export async function login(req, res) {
  try {
    const { username, password, school } = req.body;

    const { data: users, error } = await supabase.from('users')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (error) throw error;

    const user = users[0];
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

    const match = await compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Senha inválida' });

    const token = sign(
      { id: user.id, role: user.role, school_id: user.school_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no login' });
  }
}

*/