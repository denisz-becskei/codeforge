import { Router } from 'express';
import chatController from '../controllers/chat.controller';

const router = Router();

router.get('/model', chatController.getCurrentModel);
router.post('/stream', chatController.streamResponse);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:conversationId', chatController.getConversation);
router.delete('/conversations/:conversationId', chatController.deleteConversation);

export default router;