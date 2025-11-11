import supabase from '../config/db.js';
import qrcodeUtil from '../utils/qrcode.js';

/**
 * Verifica o QR Code de um aluno.
 * Espera receber no body: { token: string }
 */
export async function verifyQrCode(req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token do QR Code é obrigatório.' });
    }

    // Verifica o token
    const payload = qrcodeUtil.verifyStudentQrToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'QR Code inválido ou expirado.' });
    }

    // Busca o aluno no Supabase
    const { data: aluno, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', payload.student_id)
      .eq('school_id', payload.school_id)
      .single();

    if (error || !aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }

    return res.json({
      valid: true,
      aluno,
    });
  } catch (err) {
    console.error('Erro ao verificar QR Code:', err);
    return res.status(500).json({ error: 'Erro interno ao verificar QR Code' });
  }
}
