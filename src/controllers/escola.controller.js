import { from } from '../config/db';


async function createEscola(req, res) {
const { name, cnpj } = req.body;
const { data: escola, error } = await from('schools')
.insert([{ name, cnpj }])
.select('*')
.single();


if (error) return res.status(400).json({ error });
res.json(escola);
}


export default { createEscola };