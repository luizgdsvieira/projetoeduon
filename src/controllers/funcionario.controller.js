import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

// Função para criar um novo funcionário
export async function createFuncionario(req, res) {
  try {
    // Apenas um admin pode criar um novo funcionário.
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem criar funcionários.' });
    }
    const escolaId = req.user.escola_id;
    const { nome, email, senha, matricula, role, idade } = req.body;
    const hashed = await bcrypt.hash(senha, 10);
    const r = await pool.query(
      'INSERT INTO funcionarios (escola_id, nome, email, senha, matricula, role, idade) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [escolaId, nome, email, hashed, matricula, role, idade]
    );
    res.status(201).json({ id: r.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar funcionário.' });
  }
}

// Função para listar todos os funcionários
export async function getAllFuncionarios(req, res) {
  try {
    // Apenas um admin pode listar todos os funcionários.
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem listar todos os funcionários.' });
    }
    const escolaId = req.user.escola_id;
    const r = await pool.query(
      'SELECT id, nome, email, matricula, role, idade FROM funcionarios WHERE escola_id=$1',
      [escolaId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar funcionários.' });
  }
}

// Função para buscar um funcionário por ID
export async function getFuncionarioById(req, res) {
  try {
    const escolaId = req.user.escola_id;
    const { id } = req.params;

    // Um funcionário comum só pode ver o próprio perfil.
    if (req.user.role !== 'admin' && req.user.id !== Number(id)) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode ver o seu próprio perfil.' });
    }
    const r = await pool.query(
      'SELECT id, nome, email, matricula, role, idade FROM funcionarios WHERE id=$1 AND escola_id=$2',
      [id, escolaId]
    );
    if (r.rows.length === 0) {
      return res.status(404).json({ message: 'Funcionário não encontrado.' });
    }
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar funcionário.' });
  }
}

// Função para atualizar um funcionário
export async function updateFuncionario(req, res) {
  try {
    const escolaId = req.user.escola_id;
    const { id } = req.params;

    // Um funcionário comum só pode atualizar o próprio perfil.
    if (req.user.role !== 'admin' && req.user.id !== Number(id)) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode atualizar o seu próprio perfil.' });
    }

    const { nome, email, senha, matricula, role, idade } = req.body;
    let hashed = null;
    if (senha) {
      hashed = await bcrypt.hash(senha, 10);
    }
    const r = await pool.query(
      'UPDATE funcionarios SET nome=$1, email=$2, senha=COALESCE($3, senha), matricula=$4, role=$5, idade=$6 WHERE id=$7 AND escola_id=$8 RETURNING id',
      [nome, email, hashed, matricula, role, idade, id, escolaId]
    );
    if (r.rows.length === 0) {
      return res.status(404).json({ message: 'Funcionário não encontrado.' });
    }
    res.json({ message: 'Funcionário atualizado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar funcionário.' });
  }
}

// Função para deletar um funcionário
export async function deleteFuncionario(req, res) {
  try {
    // Apenas um admin pode deletar um funcionário.
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem deletar funcionários.' });
    }
    const escolaId = req.user.escola_id;
    const { id } = req.params;
    const r = await pool.query(
      'DELETE FROM funcionarios WHERE id=$1 AND escola_id=$2 RETURNING id',
      [id, escolaId]
    );
    if (r.rows.length === 0) {
      return res.status(404).json({ message: 'Funcionário não encontrado.' });
    }
    res.json({ message: 'Funcionário deletado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao deletar funcionário.' });
  }
}