import supabase from '../config/db.js';
import bcrypt from 'bcryptjs';


const { hash } = bcrypt;


async function createFuncionario(req, res) {
const { name, cargo, nascimento, school_id } = req.body;


const { data: staff, error } = await from('staff')
.insert([{ name, cargo, nascimento, school_id }])
.select('*')
.single();


if (error) return res.status(400).json({ error });


const username = `${school_id.slice(0, 6)}-stf-${staff.id.slice(0, 6)}`;
const passwordPlain = Math.random().toString(36).slice(-8);
const password_hash = await hash(passwordPlain, 10);


await from('users').insert([{ school_id, username, password_hash, role: 'staff', staff_id: staff.id }]);


res.json({ staff, credentials: { username, password: passwordPlain } });
}


export { createFuncionario };

export const create = async (req, res) => {
  try {
    const funcionario = { ...req.body, school_id: req.user.school_id };
    const { data, error } = await supabase.from('staff').insert([funcionario]);
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar funcionário' });
  }
};
