import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import * as ctrl from '../controllers/aluno.controller.js';

const router = Router();

router.post('/', verifyToken, ctrl.createAluno);
router.get('/', verifyToken, ctrl.getAllAlunos);
router.get('/:id', verifyToken, ctrl.getAlunoById);
router.put('/:id', verifyToken, ctrl.updateAluno);
router.delete('/:id', verifyToken, ctrl.deleteAluno);

export default router;

router.post('/alunos/:id/qrcode', verifyToken, authorizeRoles('funcionario'), async (req,res)=>{
  const { id } = req.params;
  const escolaId = req.user.escola_id;
  // validar aluno pertence à escola, etc...
  const token = generateQrToken(id, escolaId);
  // retornar token — o app fiscal transforma em QR image
  res.json({ qr: token });
});

