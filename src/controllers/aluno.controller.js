import { from } from '../config/db';
import { hash } from 'bcryptjs';
import { generateStudentQr } from '../utils/qrcode';


async function createStudent(req, res) {
const { name, matricula, ano, turma, turno, nascimento, school_id } = req.body;


const { data: student, error } = await from('students')
.insert([{ name, matricula, ano, turma, turno, nascimento, school_id }])
.select('*')
.single();


if (error) return res.status(400).json({ error });


const username = `${school_id.slice(0, 6)}-stu-${matricula}`;
const passwordPlain = Math.random().toString(36).slice(-8);
const password_hash = await hash(passwordPlain, 10);


await from('users').insert([{ school_id, username, password_hash, role: 'student', student_id: student.id }]);


const { token, qrImage } = await generateStudentQr(student);
await from('students').update({ qrcode_token: token }).eq('id', student.id);


res.json({ student, credentials: { username, password: passwordPlain }, qrImage });
}


export default { createStudent };