import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';

export async function createFuncionario(req, res) {
  try {
    const escolaId = req.user.escola_id;
    const { nome, email, senha, cargo, role = 'funcionario' } = req.body;
    const hash = await bcrypt.hash(senha, 10);

    const r = await pool.query(
      `insert into funcionarios (escola_id, nome, email, senha, cargo, role)
       values ($1,$2,$3,$4,$5,$6) returning id, nome, email, cargo, role`,
      [escolaId, nome, email, hash, cargo, role]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao criar funcionário' });
  }
}

export async function getAllFuncionarios(req, res) {
  try {
    const escolaId = req.user.escola_id;
    const r = await pool.query(
      `select id, nome, email, cargo, role, created_at
       from funcionarios where escola_id = $1 order by id desc`,
      [escolaId]
    );
    return res.json(r.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao listar funcionários' });
  }
}

export async function getFuncionarioById(req, res) {
  try {
    const escolaId = req.user.escola_id;
    const { id } = req.params;
    const r = await pool.query(
      `select id, nome, email, cargo, role, created_at
       from funcionarios where escola_id = $1 and id = $2`,
      [escolaId, id]
    );
    if (!r.rows.length) return res.status(404).json({ message: 'Não encontrado' });
    return res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao buscar funcionário' });
  }
}

export async function updateFuncionario(req, res) {
  try {
    const escolaId = req.user.escola_id;
    const { id } = req.params;
    const { nome, email, senha, cargo, role } = req.body;

    let set = ['nome = $3', 'email = $4', 'cargo = $5', 'role = $6'];
    const values = [escolaId, id, nome, email, cargo, role];

    if (senha) {
      const hash = await bcrypt.hash(senha, 10);
      set.push('senha = $7');
      values.push(hash);
    }

    const r = await pool.query(
      `update funcionarios set ${set.join(', ')}
       where escola_id = $1 and id = $2
       returning id, nome, email, cargo, role`,
      values
    );

    if (!r.rows.length) return res.status(404).json({ message: 'Não encontrado' });
    return res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao atualizar funcionário' });
  }
}

export async function deleteFuncionario(req, res) {
  try {
    const escolaId = req.user.escola_id;
    const { id } = req.params;
    const r = await pool.query(
      `delete from funcionarios where escola_id = $1 and id = $2 returning id`,
      [escolaId, id]
    );
    if (!r.rows.length) return res.status(404).json({ message: 'Não encontrado' });
    return res.json({ message: 'Funcionário deletado', id: r.rows[0].id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao deletar funcionário' });
  }
}
