import { Router } from 'express';
import { createFuncionario } from '../controllers/funcionario.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
const router = Router();


router.post('/', authenticate, authorizeRoles('admin'), createFuncionario);


export default router;