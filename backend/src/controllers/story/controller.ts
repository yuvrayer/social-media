import { NextFunction, Request, Response } from "express";
import Story from "../../models/story";
import StoryViews from "../../models/sawStory";
import { UploadedFile } from "express-fileupload";

export async function getStoryList(req: Request, res: Response, next: NextFunction) {
    try {
        const stories = await Story.findAll()
        res.json(stories)
    } catch (e) {
        next(e);
    }
}


export async function getUserStories(req: Request<{ userId: string }>, res: Response, next: NextFunction) {
    try {
        const stories = await Story.findAll({
            where:
            {
                userId: req.params.userId
            }
        })
        res.json(stories)
    } catch (e) {
        next(e);
    }
}

export async function getUserStoriesSeenData(req: Request, res: Response, next: NextFunction) {
    try {
        const stories = await StoryViews.findAll()
        res.json(stories)
    } catch (e) {
        next(e);
    }
}


export async function addSaw(req: Request<{}, {}, { userIdUploaded: string, userIdSaw: string }>, res: Response, next: NextFunction) {
    try {
        const userIdUploaded = req.body.userIdUploaded
        const userIdSaw = req.body.userIdSaw
        const storyAdd = await StoryViews.create({ userIdUploaded, userIdSaw })
        res.json(storyAdd)
    } catch (e) {
        next(e);
    }
}


export async function addStory(req: Request<{}, {}, { userId: string, profileImgUrl: string, name: string }>, res: Response, next: NextFunction) {
    try {
        const storyImage = req.files.storyImage as UploadedFile
        const stories = await Story.create({
            userId: req.body.userId,
            storyImgUrl: storyImage.name,
            profileImgUrl: req.body.profileImgUrl,
            name: req.body.name
        })
        res.json(stories)
    } catch (e) {
        next(e);
    }
}