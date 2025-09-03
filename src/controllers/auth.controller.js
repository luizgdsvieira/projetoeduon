// src/controllers/auth.controller.js
import { from } from '../config/db';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

async function login(req, res) {
  const { username, password } = req.body;
  const { data, error } = await from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) return res.status(401).json({ message: 'Usuário não encontrado' });

  const match = await compare(password, data.password_hash);
  if (!match) return res.status(401).json({ message: 'Senha inválida' });

  const token = sign({
    user_id: data.id,
    role: data.role,
    school_id: data.school_id
  }, JWT_SECRET, { expiresIn: '8h' });

  res.json({ accessToken: token, user: { id: data.id, role: data.role, school_id: data.school_id } });
}

export default { login };
