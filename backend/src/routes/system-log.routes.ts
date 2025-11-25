import { Router } from 'express';
import * as systemLogController from '../controllers/system-log.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', [authenticate, isAdmin], systemLogController.getAllActivityLogs);

export default router;
