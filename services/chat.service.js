
import Chat from '../src/chat/chat.model.js';

export const getOrCreateChat = async (userId, participantId) => {
  if (!participantId) {
    throw new Error('Participant ID is required');
  }

  const existingChat = await Chat.findOne({
    participants: { $all: [userId, participantId], $size: 2 },
  });

  if (existingChat) return { chat: existingChat, isNew: false };

  const newChat = new Chat({
    participants: [userId, participantId],
    messages: [],
  });

  await newChat.save();
  return { chat: newChat, isNew: true };
};
