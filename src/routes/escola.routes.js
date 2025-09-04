import { Router } from 'express';
const router = Router();
import { getSchool } from '../controllers/escola.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

router.get('/', authenticate, getSchool);

export default router;
