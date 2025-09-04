import { Router } from 'express';
const router = Router();
import { getSchool } from '../controllers/escola.controller';
import auth from '../middleware/auth.middleware';

router.get('/', auth, getSchool);

export default router;
