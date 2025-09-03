// src/controllers/aluno.controller.js
import { from } from '../config/db';
import { hash } from 'bcryptjs';
import { generateStudentQr } from '../utils/qrcode';

async function createStudent(req, res) {
  // Este endpoint deve ser usado pelo site/admin (autorizado)
  const { name, matricula, ano, turma, turno, nascimento, school_id } = req.body;

  // Inserir aluno
  const { data: student, error } = await from('students')
    .insert([{ name, matricula, ano, turma, turno, nascimento, school_id }])
    .select('*')
    .single();

  if (error) return res.status(400).json({ error });

  // gerar conta de usuário para o aluno:
  const username = `${school_id.slice(0,6)}-stu-${matricula}`; // exemplo
  const rawPassword = Math.random().toString(36).slice(-8);
  const password_hash = await hash(rawPassword, 10);

  const { data: user, error: uerr } = await from('users')
    .insert([{
      school_id,
      username,
      password_hash,
      role: 'student',
      student_id: student.id
    }]).select('*').single();

  // gerar qrcode
  const { token, pngBase64 } = await generateStudentQr(student);

  // salvar token (opcional) ou path no student
  await from('students').update({ qrcode_token: token }).eq('id', student.id);

  // opcional: armazenar imagem no Storage e gravar URL
  // ...

  res.json({
    student,
    userCredentials: { username, password: rawPassword }, // envie por email/portal seguro
    qr: pngBase64
  });
}

export default { createStudent };
