import { Router } from 'express';
import chatController from '../controllers/chat.controller';

const router = Router();

router.get('/model', chatController.getCurrentModel);
router.post('/stream', chatController.streamResponse);
router.post('/stream/regenerate', chatController.regenerateMessage);
router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.createConversation);
router.get('/conversations/:conversationId', chatController.getConversation);
router.delete('/conversations/:conversationId', chatController.deleteConversation);

export default router;