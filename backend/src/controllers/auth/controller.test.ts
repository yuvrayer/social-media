import { jest, describe, test, expect, afterEach, afterAll } from '@jest/globals';

jest.mock('config', () => ({
    __esModule: true,
    default: {
        get: jest.fn().mockReturnValue('MySecret')
    },
}));
jest.mock('../../models/user')
jest.mock('jsonwebtoken')

import { v4 } from "uuid";
import { hashPassword, changeDetail, login, signup } from "./controller";
import { Request, Response, NextFunction } from 'express'
import User from '../../models/user'
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
    /*
    success scenarios:
        updates user details and returns new JWT
        uses alreadyPic if no image is uploaded
        allows user to keep the same name
        updates successfully when name is not taken
    
    failure scenarios:
        rejects if name is already in use by another user
        returns not found if no rows were updated
        handles unexpected update response
        calls next when update throws an error
        calls next with error on exception
        calls next if updated user cannot be found
    */

    test('updates user details and returns new JWT', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        const userInstanceMock = {
            id: '123',
            get: jest.fn().mockReturnValue({ id: '123', name: 'newName' })
        }

        UserModelMock.findOne
            .mockResolvedValueOnce({ id: '123' } as any)
            .mockResolvedValueOnce(userInstanceMock as any);
        UserModelMock.update
            .mockResolvedValueOnce([1] as any);

        (jwt.sign as jest.Mock).mockReturnValue('mockJwt');

        await changeDetail(mockReq, mockRes, mockNext)

        expect(UserModelMock.update).toHaveBeenCalledWith(
            { name: 'newName', profileImgUrl: 'http://new.image/url.jpg' },
            { where: { id: '123' } }
        )
        expect(mockRes.json).toHaveBeenCalledWith({ jwt: 'mockJwt' })
        expect(mockNext).not.toHaveBeenCalled();
    })

    test('uses alreadyPic if no image is uploaded', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        const userInstanceMock = {
            id: '123',
            get: jest.fn().mockReturnValue({
                id: '123',
                name: 'newName'
            })
        };

        const noImageReq = {
            ...mockReq,
            imageUrl: undefined,
            body: {
                ...mockReq.body,
                alreadyPic: 'http://old.image/pic.jpg'
            }
        } as unknown as Request;

        UserModelMock.findOne
            .mockResolvedValueOnce({ id: '123' } as any)
            .mockResolvedValueOnce(userInstanceMock as any);

        UserModelMock.update
            .mockResolvedValueOnce([1] as any);

        (jwt.sign as jest.Mock)
            .mockReturnValue('mockJwt');

        await changeDetail(noImageReq, mockRes, mockNext);

        expect(UserModelMock.update).toHaveBeenCalledWith(
            {
                name: 'newName',
                profileImgUrl: 'http://old.image/pic.jpg'
            },
            {
                where: { id: '123' }
            }
        );
    });

    test('allows user to keep the same name', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        const userInstanceMock = {
            id: '123',
            get: jest.fn().mockReturnValue({
                id: '123',
                name: 'newName'
            })
        };

        UserModelMock.findOne
            .mockResolvedValueOnce({ id: '123' } as any) // same user
            .mockResolvedValueOnce(userInstanceMock as any);

        UserModelMock.update.mockResolvedValueOnce([1] as any);

        (jwt.sign as jest.Mock).mockReturnValue('mockJwt');

        await changeDetail(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();

        expect(mockRes.json).toHaveBeenCalledWith({
            jwt: 'mockJwt'
        });
    });

    test('updates successfully when name is not taken', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        const userInstanceMock = {
            id: '123',
            get: jest.fn().mockReturnValue({
                id: '123',
                name: 'newName'
            })
        };

        UserModelMock.findOne
            .mockResolvedValueOnce(null) // no user has this name
            .mockResolvedValueOnce(userInstanceMock as any); // after update

        UserModelMock.update
            .mockResolvedValueOnce([1] as any);

        (jwt.sign as jest.Mock)
            .mockReturnValue('mockJwt');

        await changeDetail(mockReq, mockRes, mockNext);

        expect(UserModelMock.update).toHaveBeenCalledWith(
            {
                name: 'newName',
                profileImgUrl: 'http://new.image/url.jpg'
            },
            {
                where: { id: '123' }
            }
        );

        expect(mockRes.json).toHaveBeenCalledWith({
            jwt: 'mockJwt'
        });

        expect(mockNext).not.toHaveBeenCalled();
    });

    test('rejects if name is already in use by another user', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        UserModelMock.findOne.mockResolvedValue({
            id: '999'
        } as any);

        await changeDetail(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));

        const err = (mockNext as jest.Mock).mock.calls[0][0] as AppError;

        expect(err.status).toBe(StatusCodes.CONFLICT);
    });

    test('returns not found if no rows were updated', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        UserModelMock.findOne.mockResolvedValue({
            id: '123'
        } as any);

        UserModelMock.update.mockResolvedValue([0] as any);

        await changeDetail(mockReq, mockRes, mockNext);

        expect(UserModelMock.update).toHaveBeenCalledWith(
            {
                name: 'newName',
                profileImgUrl: 'http://new.image/url.jpg'
            },
            {
                where: { id: '123' }
            }
        );

        expect(mockNext).toHaveBeenCalledWith(
            expect.any(AppError)
        );

        expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('handles unexpected update response', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        UserModelMock.findOne.mockResolvedValueOnce({
            id: '123'
        } as any);

        UserModelMock.update.mockResolvedValueOnce(
            undefined as any
        );

        await changeDetail(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.any(Error)
        );
    });

    test('calls next when update throws an error', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        UserModelMock.findOne.mockResolvedValueOnce({
            id: '123'
        } as any);

        UserModelMock.update.mockRejectedValueOnce(
            new Error('DB update failed')
        );

        await changeDetail(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.any(Error)
        );

        expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('calls next with error on exception', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        UserModelMock.findOne.mockRejectedValue(
            new Error('DB error')
        );

        await changeDetail(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    test('calls next if updated user cannot be found', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        UserModelMock.findOne
            .mockResolvedValueOnce({ id: '123' } as any) // name check
            .mockResolvedValueOnce(null); // after update

        UserModelMock.update
            .mockResolvedValueOnce([1] as any);

        await changeDetail(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.any(Error)
        );
        const err = (mockNext as jest.Mock)
            .mock.calls[0][0] as AppError;

        expect(err.status).toBe(StatusCodes.NOT_FOUND);

        expect(mockRes.json).not.toHaveBeenCalled();
    });
})

describe('login tests', () => {
    const mockReq = {
        body: {
            username: 'david',
            password: '123456'
        }
    } as Request;

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    const mockNext = jest.fn() as NextFunction;

    test('returns unauthorized when credentials are wrong', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        UserModelMock.findOne.mockResolvedValueOnce(null);

        await login(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(
            StatusCodes.UNAUTHORIZED
        );

        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'wrong credentials'
        });

        expect(mockNext).toHaveBeenCalledWith(
            expect.any(AppError)
        );

        expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('creates jwt from database user data', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        const dbUser = {
            id: '123',
            username: 'david',
            name: 'David'
        };

        const userInstanceMock = {
            get: jest.fn().mockReturnValue(dbUser)
        };

        UserModelMock.findOne.mockResolvedValueOnce(
            userInstanceMock as any
        );

        (jwt.sign as jest.Mock).mockReturnValue(
            'mockJwt'
        );

        await login(mockReq, mockRes, mockNext);

        expect(userInstanceMock.get).toHaveBeenCalledWith({
            plain: true
        });

        expect(jwt.sign).toHaveBeenCalledWith(
            dbUser,
            'MySecret'
        );

        expect(mockRes.json).toHaveBeenCalledWith({
            jwt: 'mockJwt'
        });
    });

    test('returns jwt when login succeeds', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        const userInstanceMock = {
            get: jest.fn().mockReturnValue({
                id: '123',
                username: 'david'
            })
        };

        UserModelMock.findOne.mockResolvedValueOnce(
            userInstanceMock as any
        );

        (jwt.sign as jest.Mock).mockReturnValue(
            'mockJwt'
        );

        await login(mockReq, mockRes, mockNext);

        expect(jwt.sign).toHaveBeenCalled();

        expect(mockRes.json).toHaveBeenCalledWith({
            jwt: 'mockJwt'
        });

        expect(mockNext).not.toHaveBeenCalled();
    });

    test('calls next when database query fails', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        UserModelMock.findOne.mockRejectedValueOnce(
            new Error('DB error')
        );

        await login(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.any(Error)
        );

        expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('calls next when jwt creation fails', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        const userInstanceMock = {
            get: jest.fn().mockReturnValue({
                id: '123',
                username: 'david'
            })
        };

        UserModelMock.findOne.mockResolvedValueOnce(
            userInstanceMock as any
        );

        (jwt.sign as jest.Mock).mockImplementation(() => {
            throw new Error('JWT error');
        });

        await login(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.any(Error)
        );

        expect(mockRes.json).not.toHaveBeenCalled();
    });
});

describe('signup tests', () => {
    const mockReq = {
        body: {
            username: 'david',
            password: '123456',
            name: 'David'
        }
    } as Request;

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    const mockNext = jest.fn() as NextFunction;

    test('rejects when username already exists', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        UserModelMock.findOne.mockResolvedValueOnce({
            id: '999'
        } as any);

        await signup(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(
            StatusCodes.CONFLICT
        );

        expect(mockRes.json).toHaveBeenCalledWith({
            field: 'username',
            message: 'Username already taken'
        });

        expect(mockNext).toHaveBeenCalledWith(
            expect.any(AppError)
        );
    });

    test('rejects when name already exists', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        UserModelMock.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ id: '999' } as any);

        await signup(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(
            StatusCodes.CONFLICT
        );

        expect(mockRes.json).toHaveBeenCalledWith({
            field: 'username',
            message: 'Name already taken'
        });

        expect(mockNext).toHaveBeenCalledWith(
            expect.any(AppError)
        );
    });

    test('creates user without profile image', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        const createdUser = {
            get: jest.fn().mockReturnValue({
                id: '123',
                username: 'david',
                name: 'David'
            })
        };

        UserModelMock.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

        UserModelMock.create.mockResolvedValueOnce(
            createdUser as any
        );

        (jwt.sign as jest.Mock).mockReturnValue(
            'mockJwt'
        );

        await signup(mockReq, mockRes, mockNext);

        expect(UserModelMock.create).toHaveBeenCalled();

        expect(mockRes.json).toHaveBeenCalledWith({
            jwt: 'mockJwt'
        });
    });

    test('creates user with uploaded image', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        const req = {
            ...mockReq,
            imageUrl: 'http://image.jpg'
        } as Request;

        const createdUser = {
            get: jest.fn().mockReturnValue({
                id: '123'
            })
        };

        UserModelMock.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

        UserModelMock.create.mockResolvedValueOnce(
            createdUser as any
        );

        (jwt.sign as jest.Mock).mockReturnValue(
            'mockJwt'
        );

        await signup(req, mockRes, mockNext);

        expect(UserModelMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                profileImgUrl: 'http://image.jpg'
            })
        );
    });

    test('calls next when create fails', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        UserModelMock.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

        UserModelMock.create.mockRejectedValueOnce(
            new Error('DB error')
        );

        await signup(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.any(Error)
        );
    });

    test('calls next when jwt creation fails', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        const createdUser = {
            get: jest.fn().mockReturnValue({
                id: '123'
            })
        };

        UserModelMock.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

        UserModelMock.create.mockResolvedValueOnce(
            createdUser as any
        );

        (jwt.sign as jest.Mock).mockImplementation(() => {
            throw new Error('JWT error');
        });

        await signup(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.any(Error)
        );
    });

    test('creates jwt from created user', async () => {
        const UserModelMock = User as jest.Mocked<typeof User>;

        const dbUser = {
            id: '123',
            username: 'david',
            name: 'David'
        };

        const createdUser = {
            get: jest.fn().mockReturnValue(dbUser)
        };

        UserModelMock.findOne
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

        UserModelMock.create.mockResolvedValueOnce(
            createdUser as any
        );

        (jwt.sign as jest.Mock).mockReturnValue(
            'mockJwt'
        );

        await signup(mockReq, mockRes, mockNext);

        expect(jwt.sign).toHaveBeenCalledWith(
            dbUser,
            'MySecret'
        );
    });
})

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    jest.resetAllMocks();
});