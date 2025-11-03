import { Router } from 'express';
const router = Router();
import { getAll, getById, create } from '../controllers/aluno.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

// Rotas POST
router.post('/', authenticate, authorizeRoles('admin'), create);

// Rotas GET
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);

export default router;
