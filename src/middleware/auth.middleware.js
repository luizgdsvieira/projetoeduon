import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token inválido' });

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, school_id }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token expirado ou inválido' });
  }
};

export const authorizeRoles = (allowedRoles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ error: 'Autorização necessária' });
  }

  if (allowedRoles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado' });
  }
};