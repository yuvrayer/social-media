import { Request, Response } from 'express'
import {
    getStoryList,
    getUserStories,
    getUserStoriesSeenData,
    deleteStory,
    addSaw,
    addStory,
    getUserStoriesHistory,
} from '../controllers/story/controller'

import Story from '../models/story'
import StoryViews from '../models/sawStory'
import Follow from '../models/follow'
import StoryArchive from '../models/storyArchive'

// Mock the Sequelize models
jest.mock('../models/story')
jest.mock('../models/sawStory')
jest.mock('../models/follow')
jest.mock('../models/storyArchive')

const mockRes = () => {
    const res = {} as Response
    res.json = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    return res
}

const mockNext = jest.fn()

describe('Story Controller Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getStoryList', () => {
        test('should return followed user stories and own stories', async () => {
            const req = { params: { currentUserId: '123' } } as Request<{ currentUserId: string }>
            const res = mockRes()

            const follows = [
                { followeeId: '234' },
                { followeeId: '345' }
            ]
            const stories = [{ id: 1 }, { id: 2 }]

                ; (Follow.findAll as jest.Mock).mockResolvedValue(follows)
                ; (Story.findAll as jest.Mock).mockResolvedValue(stories)

            await getStoryList(req, res, mockNext)
            expect(res.json).toHaveBeenCalledWith(stories)
        })

        test('should call next with error if Follow.findAll fails', async () => {
            const req = { params: { currentUserId: '123' } } as Request<{ currentUserId: string }> // mock req
            const res = mockRes() as Response // mock res
            const error = new Error('DB failure') // fake error

                ; (Follow.findAll as jest.Mock).mockRejectedValue(error) // simulate DB error

            await getStoryList(req, res, mockNext) // call controller

            expect(mockNext).toHaveBeenCalledWith(error) // ensure next() is called with error
        })

        test('// should next error if currentUserId is missing', async () => {
            const req = { params: {} } as unknown as Request<{ currentUserId: string }> // no currentUserId
            const res = mockRes()
            await getStoryList(req, res, mockNext) // call controller

            expect(mockNext).toHaveBeenCalled();
            const errorArg = mockNext.mock.calls[0][0];
            expect(errorArg).toBeInstanceOf(Error);
        })
    })

    describe('getUserStories', () => {
        test('should return user stories', async () => {
            const req = { params: { userId: '123' } } as Request<{ userId: string }>
            const res = mockRes()
            const stories = [{ id: 1 }, { id: 2 }]

                ; (Story.findAll as jest.Mock).mockResolvedValue(stories)

            await getUserStories(req, res, mockNext)
            expect(res.json).toHaveBeenCalledWith(stories)
        })
    })

    describe('getUserStoriesSeenData', () => {
        test('should return all story views', async () => {
            const req = {} as Request
            const res = mockRes()
            const views = [{}, {}]

                ; (StoryViews.findAll as jest.Mock).mockResolvedValue(views)

            await getUserStoriesSeenData(req, res, mockNext)
            expect(res.json).toHaveBeenCalledWith(views)
        })
    })

    describe('deleteStory', () => {
        test('should delete a story by userId and storyId', async () => {
            const req = { params: { userId: '123', storyId: 'abc' } } as Request<{ userId: string, storyId: string }>
            const res = mockRes()
                ; (Story.destroy as jest.Mock).mockResolvedValue(1)

            await deleteStory(req, res, mockNext)
            expect(res.json).toHaveBeenCalledWith(1)
        })
    })

    describe('addSaw', () => {
        test('should add story view if not already exists', async () => {
            const req = {
                body: { userIdUploaded: '1', userIdSaw: '2' }
            } as Request
            const res = mockRes()

                ; (StoryViews.findOne as jest.Mock).mockResolvedValue(null)
                ; (StoryViews.create as jest.Mock).mockResolvedValue({ id: 10 })

            await addSaw(req, res, mockNext)
            expect(res.json).toHaveBeenCalledWith({ id: 10 })
        })

        test('should return existing view if already present', async () => {
            const req = {
                body: { userIdUploaded: '1', userIdSaw: '2' }
            } as Request
            const res = mockRes()
            const existing = { id: 99 }

                ; (StoryViews.findOne as jest.Mock).mockResolvedValue(existing)

            await addSaw(req, res, mockNext)
            expect(res.json).toHaveBeenCalledWith(existing)
        })
    })

    describe('addStory', () => {
        beforeAll(() => jest.useFakeTimers())
        afterAll(() => jest.useRealTimers())

        test('should create a story and schedule deletion', async () => {
            const req = {
                body: {
                    userId: '1230ae30-dc4f-4752-bd84-092956f5c633',
                    profileImgUrl: 'url',
                    name: 'Bob'
                },
                files: {
                    storyImage: { name: 'story.jpg' }
                }
            } as unknown as Request
            const res = mockRes()
            const createdStory = { id: 'abc' }

                ; (Story.create as jest.Mock).mockResolvedValue(createdStory)
                ; (Story.destroy as jest.Mock).mockResolvedValue(1)

            await addStory(req, res, mockNext)
            expect(res.json).toHaveBeenCalledWith(createdStory)

            // Fast-forward 5 minutes
            jest.advanceTimersByTime(5 * 60 * 1000)

            //wait for callbacks to resolved
            await Promise.resolve()
            await Promise.resolve()

            expect(Story.destroy).toHaveBeenCalledWith({
                where: { id: 'abc' }
            })
        })
    })

    describe('getUserStoriesHistory', () => {
        test('should return story history for authenticated user', async () => {
            const req = { userId: '1230ae30-dc4f-4752-bd84-092956f5c633' } as Request
            const res = mockRes()
            const stories = [{ id: 's1' }, { id: 's2' }]

                ; (StoryArchive.findAll as jest.Mock).mockResolvedValue(stories)

            await getUserStoriesHistory(req, res, mockNext)

            expect(StoryArchive.findAll).toHaveBeenCalledWith({
                where: { userId: '1230ae30-dc4f-4752-bd84-092956f5c633' }
            })
            expect(res.json).toHaveBeenCalledWith(stories)
        })

        test('should call next with error on failure', async () => {
            const req = { userId: 'user-123' } as Request
            const res = mockRes()
            const error = new Error('DB error')

                ; (StoryArchive.findAll as jest.Mock).mockRejectedValue(error)

            await getUserStoriesHistory(req, res, mockNext)

            expect(mockNext).toHaveBeenCalledWith(error)
        })
    })
})
