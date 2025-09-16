import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { Router } from 'express';
import { createFuncionario } from '../controllers/funcionario.controller.js';


const router = Router();

router.post('/', authenticate, authorizeRoles('admin'), create);
router.post(
  '/',
  authenticate, // Apenas a exportação padrão
  authorizeRoles('admin'), // Acesse a função através do objeto
  createFuncionario
);

export default router;