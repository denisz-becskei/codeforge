import { Router } from 'express';
import chatController from '../controllers/chat.controller';

const router = Router();

router.post('/message', chatController.handleMessage);
router.post('/stream', chatController.streamResponse);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:conversationId', chatController.getConversation);
router.delete('/conversations/:conversationId', chatController.deleteConversation);

export default router;