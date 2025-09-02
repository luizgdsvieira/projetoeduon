import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import * as ctrl from '../controllers/funcionario.controller.js';

const router = Router();

router.post('/', verifyToken, ctrl.createFuncionario);
router.get('/', verifyToken, ctrl.getAllFuncionarios);
router.get('/:id', verifyToken, ctrl.getFuncionarioById);
router.put('/:id', verifyToken, ctrl.updateFuncionario);
router.delete('/:id', verifyToken, ctrl.deleteFuncionario);

export default router;
