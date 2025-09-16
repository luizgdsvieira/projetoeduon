export async function login(req, res) {
  try {
    const { username, password } = req.body;
    console.log("➡️ Tentando login com:", username);

    const { data: users, error } = await supabase.from('users')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (error) {
      console.error("❌ Erro na consulta Supabase:", error);
      throw error;
    }

    console.log("🔎 Resultado da busca no Supabase:", users);

    const user = users[0];
    if (!user) {
      console.warn("⚠️ Usuário não encontrado:", username);
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const match = await compare(password, user.password_hash);
    console.log("🔐 Comparação de senha:", match);

    if (!match) return res.status(401).json({ error: 'Senha inválida' });

    const token = sign(
      { id: user.id, role: user.role, school_id: user.school_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log("✅ Login bem-sucedido para:", username);

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("🔥 Erro no login:", err);
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