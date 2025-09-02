import jwt from 'jsonwebtoken';
export function generateQrToken(alunoId, escolaId) {
  return jwt.sign({ aluno_id: alunoId, escola_id: escolaId, type: 'qr' }, process.env.JWT_SECRET, { expiresIn: '10m' });
}
