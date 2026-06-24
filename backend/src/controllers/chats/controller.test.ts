import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

jest.mock('../../models/chat');
jest.mock('../../models/chatParticipant');
jest.mock('../../models/message');
jest.mock('../../models/user');
jest.mock('../../io/io');

import ChatParticipant from '../../models/chatParticipant';
import Message from '../../models/message';
import { createChat, getChatMessages, getChats, IncrementChatParticipant, markChatAsRead, sendChatMessage } from './controller';
import Chat from '../../models/chat';
import socket from '../../io/io';
import { Op } from 'sequelize';

let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

beforeEach(() => {
    consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
});

afterEach(() => {
    consoleErrorSpy.mockRestore();
});

const mockedChat = Chat as jest.Mocked<typeof Chat>;
const mockedChatParticipant = ChatParticipant as jest.Mocked<typeof ChatParticipant>;
const mockedSocket = socket as jest.Mocked<typeof socket>;

describe('sendChatMessage controller', () => {
    const mockReq = {
        userId: 'user-123',
        params: {
            chatId: 'chat-123'
        },
        body: {
            content: 'Hello',
            participantsIds: ['user-456'],
            fromName: 'David'
        }
    } as any;

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as any;

    const mockNext = jest.fn();

    test('creates message successfully', async () => {
        const ChatParticipantMock =
            ChatParticipant as jest.Mocked<typeof ChatParticipant>;

        const MessageMock =
            Message as jest.Mocked<typeof Message>;

        const message = {
            id: 'msg-123',
            content: 'Hello'
        };

        ChatParticipantMock.findOne.mockResolvedValue({
            id: 'participant-1'
        } as any);

        MessageMock.create.mockResolvedValue(
            message as any
        );

        await sendChatMessage(
            mockReq,
            mockRes,
            mockNext
        );

        expect(ChatParticipantMock.findOne)
            .toHaveBeenCalledWith({
                where: {
                    chatId: 'chat-123',
                    userId: 'user-123'
                }
            });

        expect(Chat.update)
            .toHaveBeenCalled();

        expect(MessageMock.create)
            .toHaveBeenCalledWith({
                chatId: 'chat-123',
                senderId: 'user-123',
                content: 'Hello',
                sentThroughStory: ''
            });

        expect(mockRes.status)
            .toHaveBeenCalledWith(201);

        expect(mockRes.json)
            .toHaveBeenCalledWith(message);
    });


    test('returns 400 if content is missing', async () => {

        const req = {
            ...mockReq,
            body: {
                ...mockReq.body,
                content: ''
            }
        };

        await sendChatMessage(
            req,
            mockRes,
            mockNext
        );


        expect(mockRes.status)
            .toHaveBeenCalledWith(400);

        expect(mockRes.json)
            .toHaveBeenCalledWith({
                error: 'Content is required'
            });
    });


    test('returns 403 if user is not participant', async () => {

        const ChatParticipantMock =
            ChatParticipant as jest.Mocked<typeof ChatParticipant>;

        ChatParticipantMock.findOne
            .mockResolvedValue(null);


        await sendChatMessage(
            mockReq,
            mockRes,
            mockNext
        );


        expect(mockRes.status)
            .toHaveBeenCalledWith(403);

        expect(mockRes.json)
            .toHaveBeenCalledWith({
                error: 'Forbidden'
            });
    });


    test('calls socket when message is created', async () => {

        const ChatParticipantMock =
            ChatParticipant as jest.Mocked<typeof ChatParticipant>;

        const MessageMock =
            Message as jest.Mocked<typeof Message>;

        const message = {
            id: 'msg-123'
        };

        ChatParticipantMock.findOne
            .mockResolvedValue({} as any);

        MessageMock.create
            .mockResolvedValue(message as any);

        await sendChatMessage(
            mockReq,
            mockRes,
            mockNext
        );

        expect(socket.emit)
            .toHaveBeenCalledWith(
                'newMessage',
                expect.objectContaining({
                    chatId: 'chat-123',
                    from: 'user-123',
                    message
                })
            );
    });


    test('handles database error', async () => {

        const ChatParticipantMock =
            ChatParticipant as jest.Mocked<typeof ChatParticipant>;


        ChatParticipantMock.findOne
            .mockRejectedValue(
                new Error('DB error')
            );


        await sendChatMessage(
            mockReq,
            mockRes,
            mockNext
        );


        expect(mockRes.status)
            .toHaveBeenCalledWith(500);
    });
});

describe('createChat controller', () => {

    const mockReq = {
        userId: 'user-123',
        body: {
            name: 'My Group',
            isGroup: true,
            participantIds: ['user-456', 'user-789']
        },
        imageUrl: 'http://image.com/chat.jpg'
    } as any;

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as any;

    const mockNext = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });


    test('creates a group chat successfully', async () => {

        const chat = {
            id: 'chat-123'
        };


        const fullChat = {
            id: 'chat-123',
            name: 'My Group',
            isGroup: true
        };


        mockedChat.create.mockResolvedValue(
            chat as any
        );


        mockedChatParticipant.bulkCreate.mockResolvedValue(
            [] as any
        );


        mockedChat.findByPk.mockResolvedValue(
            fullChat as any
        );


        await createChat(
            mockReq,
            mockRes,
            mockNext
        );


        expect(mockedChat.create)
            .toHaveBeenCalledWith(
                {
                    name: 'My Group',
                    isGroup: true,
                    photoUrl: 'http://image.com/chat.jpg',
                    updatedAt: expect.any(Date)
                }
            );


        expect(mockedChatParticipant.bulkCreate)
            .toHaveBeenCalledWith([
                {
                    chatId: 'chat-123',
                    userId: 'user-456'
                },
                {
                    chatId: 'chat-123',
                    userId: 'user-789'
                },
                {
                    chatId: 'chat-123',
                    userId: 'user-123'
                }
            ]);


        expect(mockedSocket.emit)
            .toHaveBeenCalledWith(
                'newChat',
                expect.objectContaining({
                    to: [
                        'user-456',
                        'user-789'
                    ],
                    from: 'user-123',
                    chat: fullChat
                })
            );


        expect(mockRes.status)
            .toHaveBeenCalledWith(201);


        expect(mockRes.json)
            .toHaveBeenCalledWith(fullChat);
    });

    test('returns 400 when participantIds is empty', async () => {

        const req = {
            ...mockReq,
            body: {
                ...mockReq.body,
                participantIds: []
            }
        };


        await createChat(
            req,
            mockRes,
            mockNext
        );


        expect(mockRes.status)
            .toHaveBeenCalledWith(400);


        expect(mockRes.json)
            .toHaveBeenCalledWith({
                error: 'participantIds array is required'
            });


        expect(mockedChat.create)
            .not.toHaveBeenCalled();
    });

    test('adds creator to participants if not already included', async () => {

        const chat = {
            id: 'chat-123'
        };


        mockedChat.create.mockResolvedValue(
            chat as any
        );


        mockedChatParticipant.bulkCreate.mockResolvedValue(
            [] as any
        );


        mockedChat.findByPk.mockResolvedValue(
            chat as any
        );


        const req = {
            ...mockReq,
            body: {
                ...mockReq.body,
                participantIds: [
                    'user-456'
                ]
            }
        };


        await createChat(
            req,
            mockRes,
            mockNext
        );


        expect(mockedChatParticipant.bulkCreate)
            .toHaveBeenCalledWith([
                {
                    chatId: 'chat-123',
                    userId: 'user-456'
                },
                {
                    chatId: 'chat-123',
                    userId: 'user-123'
                }
            ]);
    });

    test('does not duplicate creator if already participant', async () => {

        const chat = {
            id: 'chat-123'
        };


        mockedChat.create.mockResolvedValue(
            chat as any
        );


        mockedChatParticipant.bulkCreate.mockResolvedValue(
            [] as any
        );


        mockedChat.findByPk.mockResolvedValue(
            chat as any
        );


        const req = {
            ...mockReq,
            body: {
                ...mockReq.body,
                participantIds: [
                    'user-123'
                ]
            }
        };


        await createChat(
            req,
            mockRes,
            mockNext
        );


        expect(mockedChatParticipant.bulkCreate)
            .toHaveBeenCalledWith([
                {
                    chatId: 'chat-123',
                    userId: 'user-123'
                }
            ]);
    });

    test('creates private chat without group fields', async () => {

        mockedChat.create.mockResolvedValue({
            id: 'chat-123'
        } as any);


        mockedChatParticipant.bulkCreate.mockResolvedValue(
            [] as any
        );


        mockedChat.findByPk.mockResolvedValue({
            id: 'chat-123'
        } as any);


        const req = {
            ...mockReq,
            body: {
                name: 'Private',
                isGroup: false,
                participantIds: [
                    'user-456'
                ]
            },
            imageUrl: 'image.jpg'
        };


        await createChat(
            req,
            mockRes,
            mockNext
        );


        expect(mockedChat.create)
            .toHaveBeenCalledWith(
                expect.objectContaining({
                    name: null,
                    isGroup: false,
                    photoUrl: null
                })
            );
    });

    test('handles database error', async () => {

        mockedChat.create.mockRejectedValue(
            new Error('DB error')
        );


        await createChat(
            mockReq,
            mockRes,
            mockNext
        );


        expect(mockRes.status)
            .toHaveBeenCalledWith(500);


        expect(mockRes.json)
            .toHaveBeenCalledWith({
                error: 'Failed to create chat'
            });
    });

});

describe('getChatMessages controller', () => {

    const mockReq = {
        userId: 'user-123',
        params: {
            chatId: 'chat-123'
        },
        query: {}
    } as any;

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as any;

    const mockNext = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns messages when user is participant', async () => {

        const ChatParticipantMock =
            ChatParticipant as jest.Mocked<typeof ChatParticipant>;

        const MessageMock =
            Message as jest.Mocked<typeof Message>;


        const messages = [
            {
                id: 'message-1',
                content: 'Hello',
                senderId: 'user-123'
            },
            {
                id: 'message-2',
                content: 'How are you?',
                senderId: 'user-456'
            }
        ];


        ChatParticipantMock.findOne.mockResolvedValue(
            {
                id: 'participant-1'
            } as any
        );


        MessageMock.findAll.mockResolvedValue(
            messages as any
        );


        await getChatMessages(
            mockReq,
            mockRes,
            mockNext
        );


        expect(ChatParticipantMock.findOne)
            .toHaveBeenCalledWith({
                where: {
                    chatId: 'chat-123',
                    userId: 'user-123'
                }
            });


        expect(MessageMock.findAll)
            .toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        chatId: 'chat-123'
                    },
                    order: [
                        [
                            'created_at',
                            'ASC'
                        ]
                    ],
                    limit: 40,
                    offset: 0
                })
            );


        expect(mockRes.json)
            .toHaveBeenCalledWith(messages);
    });

    test('returns 403 when user is not participant', async () => {

        const ChatParticipantMock =
            ChatParticipant as jest.Mocked<typeof ChatParticipant>;


        ChatParticipantMock.findOne
            .mockResolvedValue(null);


        await getChatMessages(
            mockReq,
            mockRes,
            mockNext
        );


        expect(mockRes.status)
            .toHaveBeenCalledWith(403);


        expect(mockRes.json)
            .toHaveBeenCalledWith({
                error: 'Forbidden'
            });


        expect(Message.findAll)
            .not
            .toHaveBeenCalled();
    });

    test('uses pagination parameters', async () => {

        const ChatParticipantMock =
            ChatParticipant as jest.Mocked<typeof ChatParticipant>;

        const MessageMock =
            Message as jest.Mocked<typeof Message>;


        ChatParticipantMock.findOne
            .mockResolvedValue({
                id: 'participant-1'
            } as any);


        MessageMock.findAll
            .mockResolvedValue([] as any);



        const req = {
            ...mockReq,
            query: {
                offset: '20',
                limit: '10'
            }
        };


        await getChatMessages(
            req,
            mockRes,
            mockNext
        );


        expect(MessageMock.findAll)
            .toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 10,
                    offset: 20
                })
            );
    });

    test('uses default pagination values', async () => {

        const ChatParticipantMock =
            ChatParticipant as jest.Mocked<typeof ChatParticipant>;

        const MessageMock =
            Message as jest.Mocked<typeof Message>;


        ChatParticipantMock.findOne
            .mockResolvedValue({
                id: 'participant-1'
            } as any);


        MessageMock.findAll
            .mockResolvedValue([] as any);



        await getChatMessages(
            mockReq,
            mockRes,
            mockNext
        );


        expect(MessageMock.findAll)
            .toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 40,
                    offset: 0
                })
            );
    });

    test('handles database error', async () => {

        const ChatParticipantMock =
            ChatParticipant as jest.Mocked<typeof ChatParticipant>;


        ChatParticipantMock.findOne
            .mockRejectedValue(
                new Error('DB error')
            );


        await getChatMessages(
            mockReq,
            mockRes,
            mockNext
        );


        expect(mockRes.status)
            .toHaveBeenCalledWith(500);


        expect(mockRes.json)
            .toHaveBeenCalledWith({
                error: 'Failed to get messages'
            });
    });

});

describe('getChats controller', () => {

    const mockReq = {
        userId: 'user-123'
    } as any;

    const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
    } as any;

    const mockNext = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns chats with last message and unread messages', async () => {

        const ChatMock =
            Chat as jest.Mocked<typeof Chat>;

        const MessageMock =
            Message as jest.Mocked<typeof Message>;


        const chat = {
            id: 'chat-123',

            ChatParticipants: [
                {
                    unreadMessages: 5
                }
            ],

            toJSON: jest.fn().mockReturnValue({
                id: 'chat-123',
                name: 'Friends'
            })
        };


        const lastMessage = {
            id: 'message-123',
            content: 'Hello'
        };


        ChatMock.findAll.mockResolvedValue([
            chat
        ] as any);


        MessageMock.findOne.mockResolvedValue(
            lastMessage as any
        );


        await getChats(
            mockReq,
            mockRes,
            mockNext
        );


        expect(ChatMock.findAll)
            .toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.any(Array),
                    order: [
                        [
                            'updated_at',
                            'DESC'
                        ]
                    ]
                })
            );


        expect(MessageMock.findOne)
            .toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        chatId: 'chat-123'
                    },
                    order: [
                        [
                            'createdAt',
                            'DESC'
                        ]
                    ]
                })
            );


        expect(mockRes.json)
            .toHaveBeenCalledWith([
                {
                    id: 'chat-123',
                    name: 'Friends',
                    lastMessage,
                    unreadMessages: 5
                }
            ]);
    });

    test('returns null as lastMessage when chat has no messages', async () => {

        const ChatMock =
            Chat as jest.Mocked<typeof Chat>;

        const MessageMock =
            Message as jest.Mocked<typeof Message>;


        const chat = {
            id: 'chat-123',

            ChatParticipants: [
                {
                    unreadMessages: 0
                }
            ],

            toJSON: jest.fn().mockReturnValue({
                id: 'chat-123'
            })
        };


        ChatMock.findAll.mockResolvedValue([
            chat
        ] as any);


        MessageMock.findOne.mockResolvedValue(
            null
        );


        await getChats(
            mockReq,
            mockRes,
            mockNext
        );


        expect(mockRes.json)
            .toHaveBeenCalledWith([
                {
                    id: 'chat-123',
                    lastMessage: null,
                    unreadMessages: 0
                }
            ]);
    });

    test('returns unreadMessages as 0 when participant is missing', async () => {

        const ChatMock =
            Chat as jest.Mocked<typeof Chat>;

        const MessageMock =
            Message as jest.Mocked<typeof Message>;


        const chat = {
            id: 'chat-123',

            ChatParticipants: [],

            toJSON: jest.fn().mockReturnValue({
                id: 'chat-123'
            })
        };


        ChatMock.findAll.mockResolvedValue([
            chat
        ] as any);


        MessageMock.findOne.mockResolvedValue(
            null
        );


        await getChats(
            mockReq,
            mockRes,
            mockNext
        );


        expect(mockRes.json)
            .toHaveBeenCalledWith([
                {
                    id: 'chat-123',
                    lastMessage: null,
                    unreadMessages: 0
                }
            ]);
    });

    test('handles database error', async () => {

        const ChatMock =
            Chat as jest.Mocked<typeof Chat>;


        ChatMock.findAll.mockRejectedValue(
            new Error('DB error')
        );


        await getChats(
            mockReq,
            mockRes,
            mockNext
        );


        expect(mockRes.status)
            .toHaveBeenCalledWith(500);


        expect(mockRes.json)
            .toHaveBeenCalledWith({
                error: 'Failed to get chats'
            });
    });

});

describe('IncrementChatParticipant controller', () => {

    const mockReq = {
        body: {
            chatId: 'chat-123',
            userId: 'user-123'
        }
    } as any;

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as any;

    const mockNext = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('increments unread messages for other participants', async () => {

        const ChatParticipantMock =
            ChatParticipant as jest.Mocked<typeof ChatParticipant>;


        ChatParticipantMock.increment.mockResolvedValue(
            [1] as any
        );


        await IncrementChatParticipant(
            mockReq,
            mockRes,
            mockNext
        );


        expect(ChatParticipantMock.increment)
            .toHaveBeenCalledWith(
                {
                    unreadMessages: 1
                },
                {
                    where: {
                        chatId: 'chat-123',
                        userId: {
                            [Op.ne]: 'user-123'
                        }
                    }
                }
            );


        expect(mockNext)
            .not
            .toHaveBeenCalled();
    });

    test('calls next with error when increment fails', async () => {

        const ChatParticipantMock =
            ChatParticipant as jest.Mocked<typeof ChatParticipant>;

        const error = new Error('DB error');

        ChatParticipantMock.increment
            .mockRejectedValue(error);

        await IncrementChatParticipant(
            mockReq,
            mockRes,
            mockNext
        );

        expect(mockNext)
            .toHaveBeenCalledWith(error);

        expect(mockRes.status)
            .not
            .toHaveBeenCalled();

        expect(mockRes.json)
            .not
            .toHaveBeenCalled();
    });

});

describe('markChatAsRead controller', () => {

    const mockReq = {
        userId: 'user-123',
        params: {
            chatId: 'chat-123'
        }
    } as any;

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as any;

    const mockNext = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('marks chat as read successfully', async () => {

        const ChatParticipantMock =
            ChatParticipant as jest.Mocked<typeof ChatParticipant>;


        ChatParticipantMock.update
            .mockResolvedValue(
                [1] as any
            );


        await markChatAsRead(
            mockReq,
            mockRes,
            mockNext
        );


        expect(ChatParticipantMock.update)
            .toHaveBeenCalledWith(
                {
                    unreadMessages: 0
                },
                {
                    where: {
                        chatId: 'chat-123',
                        userId: 'user-123'
                    }
                }
            );


        expect(mockRes.status)
            .toHaveBeenCalledWith(200);


        expect(mockRes.json)
            .toHaveBeenCalledWith(true);
    });

    test('handles database error', async () => {

        const ChatParticipantMock =
            ChatParticipant as jest.Mocked<typeof ChatParticipant>;


        ChatParticipantMock.update
            .mockRejectedValue(
                new Error('DB error')
            );


        await markChatAsRead(
            mockReq,
            mockRes,
            mockNext
        );


        expect(mockRes.status)
            .toHaveBeenCalledWith(500);


        expect(mockRes.json)
            .toHaveBeenCalledWith({
                error: 'Failed to mark chat as read'
            });
    });

});