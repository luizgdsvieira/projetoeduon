import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';
import { createStudent } from '../controllers/aluno.controller';

const router = Router();

router.post('/', authenticate, authorizeRoles('admin'), createStudent);
// outras rotas: GET /:id, GET /:id/qrcode etc.

export default router;
