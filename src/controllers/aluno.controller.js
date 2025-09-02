import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

export async function createAluno(req, res) {
  try {
    if (req.user.role !== 'funcionario') return res.status(403).json({ message: 'Apenas funcionários podem criar alunos' });
    const escolaId = req.user.escola_id;
    const { nome, email, senha, matricula, ano, turma, turno, idade } = req.body;
    const hashed = await bcrypt.hash(senha, 10);
    const r = await pool.query('INSERT INTO alunos (escola_id,nome,email,senha,matricula,ano,turma,turno,idade) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id', [escolaId, nome, email, hashed, matricula, ano, turma, turno, idade]);
    res.status(201).json({ id: r.rows[0].id });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Erro' }); }
}

export async function getAllAlunos(req, res) {
  try {
    if (req.user.role !== 'funcionario') return res.status(403).json({ message: 'Apenas funcionários' });
    const escolaId = req.user.escola_id;
    const r = await pool.query('SELECT id,nome,email,matricula,ano,turma,turno,idade FROM alunos WHERE escola_id=$1', [escolaId]);
    res.json(r.rows);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Erro' }); }
}

export async function getAlunoById(req, res) {
  try {
    const escolaId = req.user.escola_id;
    const { id } = req.params;
    // aluno só pode ver seu proprio id
    if (req.user.role === 'aluno' && req.user.id !== Number(id)) return res.status(403).json({ message: 'Acesso negado' });
    const r = await pool.query('SELECT id,nome,email,matricula,ano,turma,turno,idade FROM alunos WHERE id=$1 AND escola_id=$2', [id, escolaId]);
    if (r.rows.length === 0) return res.status(404).json({ message: 'Não encontrado' });
    res.json(r.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Erro' }); }
}

export async function updateAluno(req, res) {
  try {
    const escolaId = req.user.escola_id;
    const { id } = req.params;
    if (req.user.role === 'aluno' && req.user.id !== Number(id)) return res.status(403).json({ message: 'Acesso negado' });
    const { nome, email, senha, matricula, ano, turma, turno, idade } = req.body;
    let hashed = null;
    if (senha) hashed = await bcrypt.hash(senha, 10);
    const r = await pool.query(
      'UPDATE alunos SET nome=$1, email=$2, senha=COALESCE($3,senha), matricula=$4, ano=$5, turma=$6, turno=$7, idade=$8 WHERE id=$9 AND escola_id=$10 RETURNING id',
      [nome, email, hashed, matricula, ano, turma, turno, idade, id, escolaId]
    );
    if (r.rows.length === 0) return res.status(404).json({ message: 'Não encontrado' });
    res.json({ message: 'Atualizado' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Erro' }); }
}

export async function deleteAluno(req, res) {
  try {
    if (req.user.role !== 'funcionario') return res.status(403).json({ message: 'Apenas funcionários' });
    const escolaId = req.user.escola_id;
    const { id } = req.params;
    const r = await pool.query('DELETE FROM alunos WHERE id=$1 AND escola_id=$2 RETURNING id', [id, escolaId]);
    if (r.rows.length === 0) return res.status(404).json({ message: 'Não encontrado' });
    res.json({ message: 'Deletado' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Erro' }); }
}
