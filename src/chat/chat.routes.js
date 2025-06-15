import { Router } from 'express';
import {
  createOrGetChat,
  sendMessage,
  getUserChats,
  getChatById
} from './chat.controller.js';
import { validateJwt } from '../../middlewares/validate.jwt.js';
import { createOrGetChatValidator, sendMessageValidator } from '../../helpers/validators.js';

const api = Router();

api.post('/createchat', [ createOrGetChatValidator], createOrGetChat);
api.post('/message', [ sendMessageValidator], sendMessage);
api.get('/allchat', [validateJwt], getUserChats);
api.get('/get/:chatId', [validateJwt], getChatById);

export default api;