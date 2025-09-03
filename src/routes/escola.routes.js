import { Router } from 'express';
import { createEscola } from '../controllers/escola.controller';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';
const router = Router();


router.post('/', authenticate, authorizeRoles('admin'), createEscola);


export default router;