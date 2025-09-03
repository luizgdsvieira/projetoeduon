import { Router } from 'express';
import { createFuncionario } from '../controllers/funcionario.controller';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';
const router = Router();


router.post('/', authenticate, authorizeRoles('admin'), createFuncionario);


export default router;