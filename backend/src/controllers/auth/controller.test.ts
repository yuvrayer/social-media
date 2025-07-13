jest.mock('config', () => ({
    __esModule: true,
    default: {
        get: jest.fn().mockReturnValue('MySecret')
    },
}));
jest.mock('../../models/User')
jest.mock('jsonwebtoken')

import { v4 } from "uuid";
import { hashPassword } from "./controller";
import { changeDetail } from './controller'
import { Request, Response, NextFunction } from 'express'
import User from '../../models/user' // Adjust path as needed
import AppError from '../../errors/app-error'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

describe('hashPassword tests', () => {
    test('generates password that is valid sha256 output', () => {
        const result = hashPassword(v4())
        expect(result).toBeDefined()
        expect(result.length).toBe(64)
    })
    test('generates the same hashed password for identical input', () => {
        const input = v4()
        const hash1 = hashPassword(input)
        const hash2 = hashPassword(input)
        expect(hash1).toEqual(hash2)
    })
    test('generates a different hash for different passwords', () => {
        const password1 = v4()
        const password2 = v4()
        const hash1 = hashPassword(password1)
        const hash2 = hashPassword(password2)
        expect(hash1).not.toEqual(hash2)
    })
    test('generates a given hash from a given password + secret', () => {
        const hash = hashPassword('123456')
        expect(hash).toBe('7f7737fddd2842bc2afdbf1868aaa8e986b83133a1f010fe96535c15e4584628')
    })
})

describe('changeDetail controller', () => {
    const mockReq = {
        body: {
            name: 'newName',
            id: '123',
            alreadyPic: ''
        },
        imageUrl: 'http://new.image/url.jpg'
    } as unknown as Request

    const mockRes = {
        json: jest.fn()
    } as unknown as Response

    const mockNext = jest.fn() as NextFunction

    test('updates user details and returns new JWT', async () => {
        const mockUser = {
            id: '123',
            get: jest.fn().mockReturnValue({ id: '123', name: 'newName' })
        }

            ; (User.findOne as jest.Mock).mockResolvedValueOnce({ id: '123' }) // for name check
            ; (User.update as jest.Mock).mockResolvedValueOnce([1]) // affected rows
            ; (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser) // after update
            ; (jwt.sign as jest.Mock).mockReturnValue('mockJwt')

        await changeDetail(mockReq, mockRes, mockNext)

        expect(User.update).toHaveBeenCalledWith(
            { name: 'newName', profileImgUrl: 'http://new.image/url.jpg' },
            { where: { id: '123' } }
        )
        expect(mockRes.json).toHaveBeenCalledWith({ jwt: 'mockJwt' })
        expect(mockNext).not.toHaveBeenCalled()
    })

    test('rejects if name is already in use by another user', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({ id: '999' }) // name belongs to different user

        await changeDetail(mockReq, mockRes, mockNext)

        expect(mockNext).toHaveBeenCalledWith(expect.any(AppError))
        const err = (mockNext as jest.Mock).mock.calls[0][0]
        expect(err.status).toBe(StatusCodes.CONFLICT)
    })

    test('returns not found if no rows were updated', async () => {
        ; (User.findOne as jest.Mock).mockResolvedValue({ id: '123' })
            ; (User.update as jest.Mock).mockResolvedValue([0]) // no rows updated

        await changeDetail(mockReq, mockRes, mockNext)

        expect(mockNext).toHaveBeenCalledWith(expect.any(AppError))
        const err = (mockNext as jest.Mock).mock.calls[0][0]
        expect(err.statusCode).toBeUndefined()
    })

    test('uses alreadyPic if no image is uploaded', async () => {
        const mockUser = {
            id: '123',
            get: jest.fn().mockReturnValue({ id: '123', name: 'newName' })
        }

        const noImageReq = {
            ...mockReq,
            imageUrl: undefined,
            body: {
                ...mockReq.body,
                alreadyPic: 'http://old.image/pic.jpg'
            }
        } as unknown as Request

            ; (User.findOne as jest.Mock).mockResolvedValueOnce({ id: '123' })
            ; (User.update as jest.Mock).mockResolvedValueOnce([1])
            ; (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser)
            ; (jwt.sign as jest.Mock).mockReturnValue('mockJwt')

        await changeDetail(noImageReq, mockRes, mockNext)

        expect(User.update).toHaveBeenCalledWith(
            { name: 'newName', profileImgUrl: 'http://old.image/pic.jpg' },
            { where: { id: '123' } }
        )
    })

    test('calls next with error on exception', async () => {
        (User.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));
        await changeDetail(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
})