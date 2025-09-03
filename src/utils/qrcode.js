// src/utils/qrcode.js
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_QR_SECRET = process.env.JWT_QR_SECRET || process.env.JWT_SECRET;

async function generateStudentQr(student) {
  // payload mínimo
  const payload = {
    student_id: student.id,
    school_id: student.school_id
  };
  // opcional: expiresIn: '365d' ou sem exp
  const token = jwt.sign(payload, JWT_QR_SECRET, { algorithm: 'HS256' });

  // criar imagem do QR com token (ou URL com token)
  // se quiser armazenar no storage, retorne token e o PNG buffer
  const pngBase64 = await QRCode.toDataURL(token);
  return { token, pngBase64 };
}

function verifyStudentQrToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_QR_SECRET);
    return { valid: true, payload: decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

module.exports = { generateStudentQr, verifyStudentQrToken };
