import { from } from '../config/db';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;


async function login(req, res) {
const { username, password } = req.body;
const { data: user, error } = await from('users')
.select('*')
.eq('username', username)
.single();


if (error || !user) return res.status(401).json({ message: 'Invalid credentials' });


const valid = await compare(password, user.password_hash);
if (!valid) return res.status(401).json({ message: 'Invalid credentials' });


const token = sign({ user_id: user.id, role: user.role, school_id: user.school_id }, JWT_SECRET, { expiresIn: '8h' });
res.json({ accessToken: token, user: { id: user.id, role: user.role, school_id: user.school_id } });
}


export default { login };