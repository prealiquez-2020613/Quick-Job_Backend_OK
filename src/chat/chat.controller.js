import Chat from './chat.model.js';
import User from '../user/user.model.js';
import { getOrCreateChat } from '../../services/chat.service.js';

export const createOrGetChat = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { participantId } = req.body;

    const { chat, isNew } = await getOrCreateChat(userId, participantId);

    return res
      .status(isNew ? 201 : 200)
      .json({ success: true, chat, message: isNew ? 'Chat created' : 'Chat found' });
  } catch (error) {
    return res
      .status(error.message === 'Participant ID is required' ? 400 : 500)
      .json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { chatId, text } = req.body;

    if (!text || !chatId) {
      return res.status(400).json({ success: false, message: 'Message text and chat ID are required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized or chat not found' });
    }

    const message = {
      sender: userId,
      text,
      timestamp: new Date()
    };

    chat.messages.push(message);
    await chat.save();

    return res.status(200).json({ success: true, message: 'Message sent', chat });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.uid;

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'username name surname profileImage')
      .sort({ updatedAt: -1 });

    const formattedChats = chats.map(chat => ({
      _id: chat._id,
      participants: chat.participants,
      lastMessage: chat.messages[chat.messages.length - 1] || null
    }));

    return res.status(200).json({ success: true, chats: formattedChats });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching chats', error: error.message });
  }
};

export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.uid;

    const chat = await Chat.findById(chatId)
      .populate('participants', 'username name surname profileImage')
      .populate('messages.sender', 'username name');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat no encontrado' });
    }

    const participantIds = chat.participants.map(p => p._id.toString());
    const isUserParticipant = participantIds.includes(userId);

    if (!isUserParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.status(200).json({ success: true, chat });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving chat', error: error.message });
  }
};