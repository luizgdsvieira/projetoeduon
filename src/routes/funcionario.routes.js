import { Router } from 'express';
import {
  createFuncionario,
  getAllFuncionarios,
  getFuncionarioById,
  updateFuncionario,
  deleteFuncionario
} from '../controllers/funcionario.controller.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

// Somente ADMIN cria/atualiza/exclui funcionários
router.post('/', authMiddleware, authorizeRoles('admin'), createFuncionario);
router.get('/', authMiddleware, authorizeRoles('admin'), getAllFuncionarios);
router.get('/:id', authMiddleware, authorizeRoles('admin'), getFuncionarioById);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateFuncionario);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteFuncionario);

export default router;
