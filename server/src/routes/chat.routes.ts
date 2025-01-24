import { Router } from 'express';
import chatController from '../controllers/chat.controller';

const router = Router();

router.post('/message', chatController.handleMessage);
router.get('/conversations', chatController.getConversations);

export default router;