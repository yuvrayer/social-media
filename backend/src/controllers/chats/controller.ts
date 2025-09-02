import { NextFunction, Request, Response } from "express";
import Chat from "../../models/chat";
import ChatParticipant from "../../models/chatParticipant";
import Message from "../../models/message";
import User from "../../models/user";
import socket from "../../io/io";
import { Op } from "sequelize";

// GET /all - get all chats for logged user
export async function getChats(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;

        const chats = await Chat.findAll({
            include: [
                {
                    model: ChatParticipant,
                    where: { userId },
                    attributes: ['unreadMessages'], // get unread messages for this user
                    required: true,
                },
                {
                    model: User,
                    as: 'participants',
                    attributes: ['id', 'name', 'username', 'profileImgUrl'],
                    through: { attributes: [] },
                }
            ],
            order: [['updated_at', 'DESC']],
        });

        const chatsWithDetails = await Promise.all(chats.map(async chat => {
            const latestMessage = await Message.findOne({
                where: { chatId: chat.id },
                order: [['createdAt', 'DESC']],
                include: [{
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username', 'name', 'profileImgUrl']
                }]
            });

            const participant = chat.ChatParticipants?.[0];
            const unreadMessages = participant?.unreadMessages ?? 0;

            return {
                ...chat.toJSON(),
                lastMessage: latestMessage ?? null,
                unreadMessages
            };
        }));

        res.json(chatsWithDetails);
    } catch (error) {
        console.error("Failed to get chats:", error);
        res.status(500).json({ error: "Failed to get chats" });
    }
}



// POST /create - create a new chat (group or private)
export async function createChat(req: Request<{}, {}, { name: string, isGroup: boolean, participantIds: string[] }>, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        const { name, isGroup, participantIds } = req.body;

        const photoUrl = req.imageUrl ?? null

        if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
            return res.status(400).json({ error: 'participantIds array is required' });
        }

        // Create chat record
        const chat = await Chat.create({
            name: isGroup ? name : null,
            isGroup: !!isGroup,
            photoUrl: isGroup ? photoUrl : null
        });

        // Add participants (including creator)
        const allParticipants = Array.from(new Set([...participantIds, userId]));

        const chatParticipants = allParticipants.map((pid: string) => ({
            chatId: chat.id,
            userId: pid,
        }));

        await ChatParticipant.bulkCreate(chatParticipants);

        const fullChat = await Chat.findByPk(chat.id, {
            include: [{
                model: User,
                as: 'participants',
                attributes: ['id', 'name', 'profileImgUrl'], // only select needed fields
                through: { attributes: [] } // hide join table
            }]
        });

        socket.emit('newChat', {
            to: req.body.participantIds,
            from: userId,
            chat
        })

        res.status(201).json(fullChat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create chat" });
    }
}

// GET /messages/:chatId - get all messages in a chat
export async function getChatMessages(req: Request<{ chatId: string }>, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        const { chatId } = req.params;

        // Check if user is participant
        const participant = await ChatParticipant.findOne({ where: { chatId, userId } });
        if (!participant) return res.status(403).json({ error: "Forbidden" });


        const messages = await Message.findAll({
            where: { chatId },
            order: [["created_at", "ASC"]],
            include: [{
                model: User,
                as: `sender`,
                attributes: ["id", "username", "name", "profileImgUrl"]
            }],
        });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get messages" });
    }
}

// POST /messages/:chatId - send a message
export async function sendChatMessages(req: Request<{ chatId: string }, {}, { content: string | number, participantsIds: string[] }>, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        const { chatId } = req.params;
        const { content } = req.body;

        if (!content) return res.status(400).json({ error: "Content is required" });

        // Check if user is participant
        const participant = await ChatParticipant.findOne({ where: { chatId, userId } });
        if (!participant) return res.status(403).json({ error: "Forbidden" });

        const message = await Message.create({
            chatId,
            senderId: userId,
            content,
        });

        await ChatParticipant.increment(
            { unreadMessages: 1 },
            {
                where: {
                    chatId,
                    userId: { [Op.ne]: userId }, // Sequelize's "not equal" operator
                }
            }
        );

        socket.emit('newMessage', {
            to: req.body.participantsIds,
            chatId,
            from: userId,
            message
        })

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to send message" });
    }
}
