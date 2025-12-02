import { Router } from 'express';
import { getAll, getById, create, deleteAluno } from '../controllers/aluno.controller.js';
import { verifyQrCode } from '../controllers/qrcode.controller.js'; // se você tiver esse controller
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

// Rotas GET
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);

// Rota POST - criar aluno (somente admin)
router.post('/', authenticate, authorizeRoles('admin'), create);

// Rota DELETE - deletar aluno (somente admin)
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteAluno);

// Rota POST - verificar QR Code (acesso livre ou autenticado, conforme sua lógica)
router.post('/verify-qrcode', verifyQrCode);

export default router;



/*
import { Router } from 'express';
const router = Router();
import { getAll, getById, create } from '../controllers/aluno.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';


// Rotas POST
router.post('/', authenticate, authorizeRoles('admin'), create);

// Rotas GET
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);
router.post('/', authMiddleware, create);
router.post('/verify-qrcode', verifyQrCode);
router.post('/verify-qrcode', authMiddleware, verifyQrCode);


export default router;
*/