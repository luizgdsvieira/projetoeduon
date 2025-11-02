import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { Router } from 'express';
import { getAll, getById, create } from '../controllers/funcionario.controller.js';

const router = Router();

// Rotas GET
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);

// Rotas POST
router.post('/', authenticate, authorizeRoles('admin'), create);

export default router;