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

import { describe, test, expect, jest, beforeEach, beforeAll, afterAll } from '@jest/globals';

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

            expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
        });
    });

    describe('getUserStoriesSeenData', () => {
        test('should return all story views', async () => {
            const req = {} as Request;
            const res = mockRes();

            mockedStoryViews.findAll.mockResolvedValue([{}, {}] as any);

            await getUserStoriesSeenData(req, res as Response, mockNext);

            expect(res.json).toHaveBeenCalledWith([{}, {}]);
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
        });
    });

    describe('addStory', () => {
        beforeAll(() => {
            jest.useFakeTimers();
        });
        afterAll(() => {
            jest.useRealTimers()
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

            jest.advanceTimersByTime(5 * 60 * 1000);

            await Promise.resolve();

            expect(mockedStory.destroy).toHaveBeenCalledWith({
                where: { id: 'abc' },
            });
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

            expect(res.json).toHaveBeenCalledWith(stories);
        });

        test('should call next on error', async () => {
            const req = { userId: '123' } as unknown as Request;
            const res = mockRes();

            const error = new Error('DB error');

            mockedStoryArchive.findAll.mockRejectedValue(error);

            await getUserStoriesHistory(req, res as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});