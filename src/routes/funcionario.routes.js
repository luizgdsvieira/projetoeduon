import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { Router } from 'express';
import { createFuncionario } from '../controllers/funcionario.controller.js';
import authMiddleware from '../middleware/auth.middleware.js'; // Mudança aqui!

const router = Router();

router.post(
  '/',
  authMiddleware, // Apenas a exportação padrão
  authMiddleware.authorizeRoles('admin'), // Acesse a função através do objeto
  createFuncionario
);

export default router;