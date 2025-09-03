import { verify } from 'jsonwebtoken';
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;


function authenticate(req, res, next) {
const authHeader = req.headers.authorization;
if (!authHeader) return res.status(401).json({ message: 'Token required' });
const token = authHeader.split(' ')[1];
try {
const payload = verify(token, JWT_SECRET);
req.user = payload;
next();
} catch (err) {
res.status(401).json({ message: 'Invalid token' });
}
}


function authorizeRoles(...roles) {
return (req, res, next) => {
if (!req.user || !roles.includes(req.user.role)) {
return res.status(403).json({ message: 'Forbidden' });
}
next();
};
}


export default { authenticate, authorizeRoles };