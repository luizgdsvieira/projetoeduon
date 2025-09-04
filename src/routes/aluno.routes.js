import { Router } from 'express';
const router = Router();
import { getAll, getById } from '../controllers/aluno.controller.js';
import auth from '../middleware/auth.middleware.js';

router.get('/', auth, getAll);
router.get('/:id', auth, getById);

export default router;
