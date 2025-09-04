import { Router } from 'express';
const router = Router();
import { getAll, getById } from '../controllers/aluno.controller';
import auth from '../middleware/auth.middleware';

router.get('/', auth, getAll);
router.get('/:id', auth, getById);

export default router;
