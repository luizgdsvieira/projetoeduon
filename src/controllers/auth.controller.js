// src/controllers/auth.controller.js
import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';

// Login único: tenta funcionário (com escola_id) e aluno
export async function login(req, res) {
  const { email, senha, licenca } = req.body; // licenca opcional: se fornecer, limita busca àquela escola
  try {
    // Se licenca informada, resolve escola_id
    let escolaId = null;
    if (licenca) {
      const r = await pool.query('SELECT id FROM escolas WHERE licenca = $1 AND ativo = true', [licenca]);
      if (r.rows.length === 0) return res.status(401).json({ message: 'Licença inválida' });
      escolaId = r.rows[0].id;
    }

    // 1) procurar funcionario (se escolaId definido, usa; senão procura across? melhor exigir licenca para login)
    if (!escolaId) return res.status(400).json({ message: 'licenca é necessária para login' });

    let q = await pool.query('SELECT id, nome, email, senha, role FROM funcionarios WHERE email=$1 AND escola_id=$2', [email, escolaId]);
    if (q.rows.length > 0) {
      const f = q.rows[0];
      const ok = await bcrypt.compare(senha, f.senha);
      if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });
      const token = jwt.sign({ id: f.id, role: f.role, escola_id: escolaId }, SECRET, { expiresIn: EXPIRES_IN });
      return res.json({ token, user: { id: f.id, nome: f.nome, email: f.email, role: f.role, escola_id: escolaId } });
    }

    // 2) procurar aluno
    q = await pool.query('SELECT id, nome, email, senha FROM alunos WHERE email=$1 AND escola_id=$2', [email, escolaId]);
    if (q.rows.length > 0) {
      const a = q.rows[0];
      const ok = await bcrypt.compare(senha, a.senha);
      if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });
      const token = jwt.sign({ id: a.id, role: 'aluno', escola_id: escolaId }, SECRET, { expiresIn: EXPIRES_IN });
      return res.json({ token, user: { id: a.id, nome: a.nome, email: a.email, role: 'aluno', escola_id: escolaId } });
    }

    return res.status(404).json({ message: 'Usuário não encontrado' });
  } catch (err) {
    console.error('Auth.login error:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

// Registrar escola (só você/admin do sistema ou por processo comercial)
export async function registerEscola(req, res) {
  const { nome, cnpj, email } = req.body;
  try {
    // gerar licenca
    const licenca = 'LIC-' + Math.random().toString(36).slice(2, 10).toUpperCase();
    const r = await pool.query('INSERT INTO escolas (nome, cnpj, email, licenca) VALUES ($1,$2,$3,$4) RETURNING id, licenca', [nome, cnpj, email, licenca]);
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('registerEscola', err);
    res.status(500).json({ message: 'Erro ao criar escola' });
  }
}

// Registrar funcionário (requer licenca)
export async function registerFuncionario(req, res) {
  const { nome, email, senha, cargo, role = 'funcionario', licenca } = req.body;
  try {
    const r = await pool.query('SELECT id FROM escolas WHERE licenca=$1 AND ativo=true', [licenca]);
    if (r.rows.length === 0) return res.status(400).json({ message: 'Licença inválida' });
    const escolaId = r.rows[0].id;
    const hashed = await bcrypt.hash(senha, 10);
    const ins = await pool.query('INSERT INTO funcionarios (escola_id, nome, email, senha, cargo, role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id', [escolaId, nome, email, hashed, cargo, role]);
    res.status(201).json({ id: ins.rows[0].id });
  } catch (err) {
    console.error('registerFuncionario', err);
    res.status(500).json({ message: 'Erro ao registrar funcionário' });
  }
}

// Registrar aluno (requere licenca)
export async function registerAluno(req, res) {
  const { nome, email, senha, matricula, ano, turma, turno, idade, licenca } = req.body;
  try {
    const r = await pool.query('SELECT id FROM escolas WHERE licenca=$1 AND ativo=true', [licenca]);
    if (r.rows.length === 0) return res.status(400).json({ message: 'Licença inválida' });
    const escolaId = r.rows[0].id;
    const hashed = await bcrypt.hash(senha, 10);
    const ins = await pool.query(
      'INSERT INTO alunos (escola_id, nome, email, senha, matricula, ano, turma, turno, idade) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
      [escolaId, nome, email, hashed, matricula, ano, turma, turno, idade]
    );
    res.status(201).json({ id: ins.rows[0].id });
  } catch (err) {
    console.error('registerAluno', err);
    res.status(500).json({ message: 'Erro ao registrar aluno' });
  }
}
