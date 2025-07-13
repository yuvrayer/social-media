import { createComment } from './controller'
import { Request, Response, NextFunction } from 'express'
import Comment from '../../models/comment'
import User from '../../models/user'
import socket from '../../io/io'
import SocketMessages from 'socket-enums-shaharsol'

jest.mock('../../models/comment')
jest.mock('../../models/user')
jest.mock('../../io/io', () => ({
    __esModule: true,
    default: {
        emit: jest.fn()
    }
}))

describe('createComment controller', () => {
    let mockReq: Request<{ postId: string }>
    let mockRes: Response
    let mockNext: NextFunction
    const mockCommentInstance = {
        reload: jest.fn(),
        toJSON: () => ({
            id: 'comment-456',
            content: 'Hello world',
            userId: 'user-123',
            postId: 'post-456',
            User: { id: 'user-123', name: 'Test User' }
        })
    }

    beforeEach(() => {
        mockReq = {
            userId: 'user-123',
            params: { postId: 'post-456' },
            body: { content: 'Hello world' },
            headers: { 'x-client-id': 'test-client-id' }
        } as unknown as Request<{ postId: string }>

        mockRes = {
            json: jest.fn()
        } as unknown as Response

        mockNext = jest.fn()

        jest.clearAllMocks()
    })

    test('creates the comment with correct fields', async () => {
        (Comment.create as jest.Mock).mockResolvedValue(mockCommentInstance)
        mockCommentInstance.reload.mockResolvedValue(undefined)

        await createComment(mockReq, mockRes, mockNext)

        expect(Comment.create).toHaveBeenCalledWith({
            userId: 'user-123',
            postId: 'post-456',
            content: 'Hello world'
        })
    })

    test('reloads the comment with User relation', async () => {
        (Comment.create as jest.Mock).mockResolvedValue(mockCommentInstance)
        mockCommentInstance.reload.mockResolvedValue(undefined)

        await createComment(mockReq, mockRes, mockNext)

        expect(mockCommentInstance.reload).toHaveBeenCalledWith({
            include: [User]
        })
    })

    test('sends the comment as JSON response', async () => {
        (Comment.create as jest.Mock).mockResolvedValue(mockCommentInstance)
        mockCommentInstance.reload.mockResolvedValue(undefined)

        await createComment(mockReq, mockRes, mockNext)

        expect(mockRes.json).toHaveBeenCalledWith(mockCommentInstance)
    })

    test('emits NEW_COMMENT event with correct payload', async () => {
        (Comment.create as jest.Mock).mockResolvedValue(mockCommentInstance)
        mockCommentInstance.reload.mockResolvedValue(undefined)

        await createComment(mockReq, mockRes, mockNext)

        expect(socket.emit).toHaveBeenCalledWith(SocketMessages.NEW_COMMENT, {
            from: 'test-client-id',
            data: mockCommentInstance
        })
    })

    test('calls next with error if something fails', async () => {
        const error = new Error('Create failed')
            ; (Comment.create as jest.Mock).mockRejectedValue(error)

        await createComment(mockReq, mockRes, mockNext)

        expect(mockNext).toHaveBeenCalledWith(error)
    })
})
