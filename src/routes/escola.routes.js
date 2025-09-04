import { Router } from 'express';
const router = Router();
import { getSchool } from '../controllers/escola.controller.js';
import auth from '../middleware/auth.middleware.js';

router.get('/', auth, getSchool);

export default router;
