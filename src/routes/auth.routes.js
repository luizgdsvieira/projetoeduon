/*
import { Router } from 'express';
import { login, registerAluno, registerFuncionario, registerEscola } from '../controllers/auth.controller.js';
const router = Router();

router.post('/login', login);
router.post('/register/escola', registerEscola); // opcional
router.post('/register/funcionario', registerFuncionario);
router.post('/register/aluno', registerAluno);

export default router;
*/

// auth.routes.js
import { Router } from 'express';
const router = Router();
import { login } from '../controllers/auth.controller';

// rota de healthcheck
router.get('/health', (req, res) => {
  res.json({ status: 'API EDUON online 🚀' });
});

// login
router.post('/login', login);

export default router;
