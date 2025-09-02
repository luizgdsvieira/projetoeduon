import jwt from 'jsonwebtoken';
import 'dotenv/config';

export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload deve conter id, role, escola_id
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

// middleware factory para checar roles
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    next();
  };
}

// middleware para garantir que o recurso pertence à mesma escola
export function ensureSameEscola(req, res, next) {
  // ex.: escola_id pode vir nos params ou no body, mas o fluxo espera sempre usar req.user.escola_id
  // controllers devem usar req.user.escola_id nas queries
  if (!req.user?.escola_id) return res.status(401).json({ message: 'Escola não definida no token' });
  next();
}
