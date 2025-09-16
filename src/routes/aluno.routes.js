import { Router } from 'express';
const router = Router();
import { getAll, getById, create } from '../controllers/aluno.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';


router.post('/', authenticate, authorizeRoles('admin'), create);
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);
router.get('/', authenticate, authorizeRoles(['aluno']), getAll);

export default router;
