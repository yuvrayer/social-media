import { Request, Response, NextFunction } from 'express';
import {
    getStoryList,
    getUserStories,
    getUserStoriesSeenData,
    deleteStory,
    addSaw,
    addStory,
    getUserStoriesHistory,
} from '../controllers/story/controller';

import Story from '../models/story';
import StoryViews from '../models/sawStory';
import Follow from '../models/follow';
import StoryArchive from '../models/storyArchive';

import { describe, test, expect, jest, beforeEach, beforeAll, afterAll, afterEach } from '@jest/globals';

// mock modules
jest.mock('../models/story');
jest.mock('../models/sawStory');
jest.mock('../models/follow');
jest.mock('../models/storyArchive');

// strongly typed mocks
const mockedStory = jest.mocked(Story);
const mockedStoryViews = jest.mocked(StoryViews);
const mockedFollow = jest.mocked(Follow);
const mockedStoryArchive = jest.mocked(StoryArchive);

// mock response
export const mockRes = () => {
    const res = {
        status: jest.fn(),
        json: jest.fn(),
    };

    res.status.mockReturnThis();
    res.json.mockReturnThis();

    return res as unknown as Response;
};

// mock next
const mockNext = jest.fn() as unknown as NextFunction;

describe('Story Controller Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getStoryList', () => {
        test('should return followed user stories and own stories', async () => {
            const req = {
                params: { currentUserId: '123' },
            } as unknown as Request<{ currentUserId: string }>;

            const res = mockRes();

            mockedFollow.findAll.mockResolvedValue([
                { followeeId: '234' },
                { followeeId: '345' },
            ] as any);

            mockedStory.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }] as any);

            await getStoryList(req, res as Response, mockNext);

            expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
            expect(mockedFollow.findAll).toHaveBeenCalledWith({
                where: { followerId: '123' }
            });
            expect(mockedStory.findAll).toHaveBeenCalledWith({
                where: {
                    userId: ['234', '345', '123']
                },
                order: [['createdAt', 'DESC']]
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should return only current user stories when user follows nobody', async () => {
            const req = {
                params: { currentUserId: '123' },
            } as unknown as Request<{ currentUserId: string }>;

            const res = mockRes();

            mockedFollow.findAll.mockResolvedValue([]);

            mockedStory.findAll.mockResolvedValue([{ id: 1 }] as any);

            await getStoryList(req, res, mockNext);

            expect(mockedStory.findAll).toHaveBeenCalledWith({
                where: {
                    userId: ['123']
                },
                order: [['createdAt', 'DESC']]
            });

            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
            expect(mockedFollow.findAll).toHaveBeenCalledWith({
                where: {
                    followerId: '123'
                }
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should call next with error if Follow.findAll fails', async () => {
            const req = {
                params: { currentUserId: '123' },
            } as unknown as Request<{ currentUserId: string }>;

            const res = mockRes();

            const error = new Error('DB failure');

            mockedFollow.findAll.mockRejectedValue(error);

            await getStoryList(req, res as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(res.json).not.toHaveBeenCalled();
        });

        test('should call next if Story.findAll fails', async () => {
            const req = {
                params: { currentUserId: '123' },
            } as unknown as Request<{ currentUserId: string }>;

            const res = mockRes();

            mockedFollow.findAll.mockResolvedValue([{ followeeId: '234' }] as any);

            const error = new Error('Story error');
            mockedStory.findAll.mockRejectedValue(error);

            await getStoryList(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('getUserStories', () => {
        test('should return user stories', async () => {
            const req = {
                params: { userId: '123' },
            } as unknown as Request<{ userId: string }>;

            const res = mockRes();

            mockedStory.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }] as any);

            await getUserStories(req, res as Response, mockNext);
            expect(mockedStory.findAll).toHaveBeenCalledWith({
                where: {
                    userId: '123'
                }
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should call next when Story.findAll fails', async () => {
            const req = {
                params: { userId: '123' },
            } as unknown as Request<{ userId: string }>;

            const res = mockRes();

            const error = new Error('DB error');
            mockedStory.findAll.mockRejectedValue(error);

            await getUserStories(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('getUserStoriesSeenData', () => {
        test('should return all story views', async () => {
            const req = {} as Request;
            const res = mockRes();

            mockedStoryViews.findAll.mockResolvedValue([{}, {}] as any);

            await getUserStoriesSeenData(req, res as Response, mockNext);

            expect(res.json).toHaveBeenCalledWith([{}, {}]);
            expect(mockedStoryViews.findAll).toHaveBeenCalled();
        });

        test('should call next when StoryViews.findAll fails', async () => {
            const req = {} as Request;
            const res = mockRes();
            const error = new Error('DB error');

            mockedStoryViews.findAll.mockRejectedValue(error);

            await getUserStoriesSeenData(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('deleteStory', () => {
        test('should delete a story', async () => {
            const req = {
                params: { userId: '123', storyId: 'abc' },
            } as unknown as Request<{ userId: string, storyId: string }>;

            const res = mockRes();

            mockedStory.destroy.mockResolvedValue(1 as any);

            await deleteStory(req, res as Response, mockNext);

            expect(res.json).toHaveBeenCalledWith(1);
            expect(mockedStory.destroy).toHaveBeenCalledWith({
                where: {
                    userId: '123',
                    id: 'abc'
                }
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should call next when destroy fails', async () => {
            const req = {
                params: { userId: '123', storyId: 'abc' },
            } as unknown as Request<{ userId: string, storyId: string }>;

            const res = mockRes();

            const error = new Error('DB error');

            mockedStory.destroy.mockRejectedValue(error);

            await deleteStory(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('addSaw', () => {
        test('should create view if not exists', async () => {
            const req = {
                body: { userIdUploaded: '1', userIdSaw: '2' },
            } as Request;

            const res = mockRes();

            mockedStoryViews.findOne.mockResolvedValue(null);
            mockedStoryViews.create.mockResolvedValue({ id: 10 } as any);

            await addSaw(req, res as Response, mockNext);

            expect(res.json).toHaveBeenCalledWith({ id: 10 });
            expect(mockedStoryViews.findOne).toHaveBeenCalledWith({
                where: {
                    userIdUploaded: '1',
                    userIdSaw: '2'
                }
            });
            expect(mockedStoryViews.create).toHaveBeenCalledWith({
                userIdUploaded: '1',
                userIdSaw: '2'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should return existing view', async () => {
            const req = {
                body: { userIdUploaded: '1', userIdSaw: '2' },
            } as Request;

            const res = mockRes();

            const existing = { id: 99 };

            mockedStoryViews.findOne.mockResolvedValue(existing as any);

            await addSaw(req, res as Response, mockNext);

            expect(res.json).toHaveBeenCalledWith(existing);
            expect(mockedStoryViews.create).not.toHaveBeenCalled();
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should call next if findOne fails', async () => {
            const req = {
                body: { userIdUploaded: '1', userIdSaw: '2' },
            } as Request;

            const res = mockRes();
            const error = new Error('DB error');

            mockedStoryViews.findOne.mockRejectedValue(error);

            await addSaw(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(res.json).not.toHaveBeenCalled();
        });

        test('should call next if create fails', async () => {
            const req = {
                body: { userIdUploaded: '1', userIdSaw: '2' },
            } as Request;

            const res = mockRes();

            mockedStoryViews.findOne.mockResolvedValue(null);

            const error = new Error('Create failed');
            mockedStoryViews.create.mockRejectedValue(error);

            await addSaw(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('addStory', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });
        afterEach(() => {
            jest.runOnlyPendingTimers();
            jest.useRealTimers();
        });

        test('should create story and delete after timeout', async () => {
            const req = {
                body: {
                    userId: '123',
                    profileImgUrl: 'url',
                    name: 'Bob',
                },
                files: {
                    storyImage: { name: 'story.jpg' },
                },
            } as unknown as Request;

            const res = mockRes();

            const created = { id: 'abc' };

            mockedStory.create.mockResolvedValue(created as any);
            mockedStory.destroy.mockResolvedValue(1 as any);

            await addStory(req, res as Response, mockNext);

            expect(res.json).toHaveBeenCalledWith(created);
            expect(mockedStory.create).toHaveBeenCalledWith({
                id: 'abc',
                userId: '123',
                storyImgUrl: 'story.jpg',
                profileImgUrl: 'url',
                name: 'Bob'
            });

            await jest.runOnlyPendingTimersAsync();

            expect(mockedStory.destroy).toHaveBeenCalledWith({
                where: { id: 'abc' },
            });

            expect(mockedStoryArchive.create).toHaveBeenCalledWith({
                userId: '123',
                storyImgUrl: 'story.jpg',
                profileImgUrl: 'url',
                name: 'Bob'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should call next when create fails', async () => {
            const req = {
                body: {
                    userId: '123',
                    profileImgUrl: 'url',
                    name: 'Bob',
                },
                files: {
                    storyImage: { name: 'story.jpg' },
                },
            } as unknown as Request;

            const res = mockRes();

            const error = new Error('Create failed');

            mockedStory.create.mockRejectedValue(error);

            await addStory(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(res.json).not.toHaveBeenCalled();
        });

        test('should handle archive creation failure inside timeout', async () => {
            const req = {
                body: {
                    userId: '123',
                    profileImgUrl: 'url',
                    name: 'Bob',
                },
                files: {
                    storyImage: { name: 'story.jpg' },
                },
            } as unknown as Request;

            const res = mockRes();

            mockedStory.create.mockResolvedValue({ id: 'abc' } as any);

            const archiveError = new Error('Archive failed');

            mockedStoryArchive.create.mockRejectedValue(archiveError);

            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => { });

            await addStory(req, res, mockNext);

            await jest.runOnlyPendingTimersAsync();

            expect(consoleSpy).toHaveBeenCalled();

            expect(mockedStory.destroy).not.toHaveBeenCalled();

            consoleSpy.mockRestore();

            expect(res.json).toHaveBeenCalledWith({ id: 'abc' });
        });

        test('should handle story deletion failure inside timeout', async () => {
            const req = {
                body: {
                    userId: '123',
                    profileImgUrl: 'url',
                    name: 'Bob',
                },
                files: {
                    storyImage: { name: 'story.jpg' },
                },
            } as unknown as Request;

            const res = mockRes();

            mockedStory.create.mockResolvedValue({ id: 'abc' } as any);

            mockedStoryArchive.create.mockResolvedValue({} as any);

            const deleteError = new Error('Delete failed');

            mockedStory.destroy.mockRejectedValue(deleteError);

            const consoleSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => { });

            await addStory(req, res, mockNext);

            await jest.runOnlyPendingTimersAsync();

            expect(mockedStoryArchive.create).toHaveBeenCalled();

            expect(mockedStory.destroy).toHaveBeenCalled();

            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();

            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('getUserStoriesHistory', () => {
        test('should return history', async () => {
            const req = {
                userId: '123',
            } as unknown as Request;

            const res = mockRes();

            const stories = [{ id: 's1' }, { id: 's2' }];

            mockedStoryArchive.findAll.mockResolvedValue(stories as any);

            await getUserStoriesHistory(req, res as Response, mockNext);

            expect(mockedStoryArchive.findAll).toHaveBeenCalledWith({
                where: { userId: '123' },
            });
            expect(mockedStoryArchive.findAll).toHaveBeenCalledTimes(1);

            expect(res.json).toHaveBeenCalledWith(stories);
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should call next on error', async () => {
            const req = { userId: '123' } as unknown as Request;
            const res = mockRes();

            const error = new Error('DB error');

            mockedStoryArchive.findAll.mockRejectedValue(error);

            await getUserStoriesHistory(req, res as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});