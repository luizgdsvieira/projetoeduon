import { toDataURL } from 'qrcode';
import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const JWT_QR_SECRET = process.env.JWT_QR_SECRET || process.env.JWT_SECRET;

async function generateStudentQr(student) {
  const payload = { student_id: student.id, school_id: student.school_id };
  const token = sign(payload, JWT_QR_SECRET);
  const qrImage = await toDataURL(token);
  return { token, qrImage };
}

function verifyStudentQrToken(token) {
  try {
    return verify(token, JWT_QR_SECRET);
  } catch (err) {
    return null;
  }
}

export default { generateStudentQr, verifyStudentQrToken };


/*
import { toDataURL } from 'qrcode';
import { sign, verify } from 'jsonwebtoken';
require('dotenv').config();


const JWT_QR_SECRET = process.env.JWT_QR_SECRET || process.env.JWT_SECRET;


async function generateStudentQr(student) {
const payload = { student_id: student.id, school_id: student.school_id };
const token = sign(payload, JWT_QR_SECRET);
const qrImage = await toDataURL(token);
return { token, qrImage };
}


function verifyStudentQrToken(token) {
try {
return verify(token, JWT_QR_SECRET);
} catch (err) {
return null;
}
}


export default { generateStudentQr, verifyStudentQrToken };
*/