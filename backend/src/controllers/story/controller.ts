import { NextFunction, Request, Response } from "express";
import Story from "../../models/story";
import StoryViews from "../../models/sawStory";
import { UploadedFile } from "express-fileupload";
import Follow from "../../models/follow";
import StoryArchive from "../../models/storyArchive";
import io from "../../io/io";

export async function getStoryList(req: Request<{ currentUserId: string }>, res: Response, next: NextFunction) {
    try {
        const currentUserId = req.params.currentUserId
        const follows = await Follow.findAll({
            where: { followerId: currentUserId }
        });

        const followingIds = follows.map(f => f.followeeId);

        // Optionally include current user's own stories too
        followingIds.push(currentUserId);

        const stories = await Story.findAll({
            where: {
                userId: followingIds
            },
            order: [['createdAt', 'DESC']]
        });
        res.json(stories)
    } catch (e) {
        next(e);
    }
}


export async function getUserStories(req: Request<{ userId: string }>, res: Response, next: NextFunction) {
    try {
        const userId = req.params.userId
        const stories = await Story.findAll({
            where:
            {
                userId: userId
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

async function deleteStoryFromDatabase(id: string, userId: string, storyImgUrl: string, profileImgUrl: string, name: string) {
    try {
        await StoryArchive.create({
            id,
            userId,
            storyImgUrl,
            profileImgUrl,
            name
        })
        const story = await Story.destroy({
            where: {
                userId,
                id
            }
        })

        await StoryViews.destroy({
            where: {
                storyId: id
            }
        })

        const follows = await Follow.findAll({
            where: { followeeId: userId }
        })
        const followsArray = follows.map(item => item.followerId)

        io.emit('deletedStory', {
            to: followsArray, //my followers
            storyId: id
        })

        return (story)
    } catch (e) {
        console.error(e);
        throw e;
    }
}


export async function deleteStory(req: Request<{ userId: string, storyId: string }>, res: Response, next: NextFunction) {
    try {
        const { userId, storyId } = req.params
        const existStory = await Story.findOne({
            where: {
                userId,
                id: storyId
            }
        })
        if (!existStory) {
            return res.status(404).json({
                message: "Story not found"
            });
        }
        //archive
        const deletedStory = await deleteStoryFromDatabase(
            existStory.id,
            existStory.userId,
            existStory.storyImgUrl,
            existStory.profileImgUrl,
            existStory.name
        );

        res.json(deletedStory)
    } catch (e) {
        next(e)
    }
}

export async function addSaw(req: Request<{}, {}, { userIdUploaded: string, userIdSaw: string, storyId: string }>, res: Response, next: NextFunction) {
    try {
        const { userIdUploaded, userIdSaw, storyId } = req.body
        const alreadyExist = await StoryViews.findOne({
            where: {
                userIdUploaded,
                userIdSaw,
                storyId
            }
        })
        if (!alreadyExist) {
            try {
                const storyAdd = await StoryViews.create({ userIdUploaded, userIdSaw, storyId })
                res.json(storyAdd)
            } catch (e) {
                next(e)
            }
        } else {
            res.json(alreadyExist)
        }
    } catch (e) {
        next(e);
    }
}


export async function addStory(req: Request<{}, {}, { userId: string, profileImgUrl: string, name: string }>, res: Response, next: NextFunction) {
    try {
        const storyImage = req?.files?.storyImage as UploadedFile
        const story = await Story.create({
            userId: req.body.userId,
            storyImgUrl: storyImage.name,
            profileImgUrl: req.body.profileImgUrl,
            name: req.body.name
        })

        setTimeout(async () => {
            try {
                const existStory = await Story.findOne({
                    where: {
                        userId: req.body.userId,
                        id: story.id
                    }
                })
                if (!existStory) return

                await deleteStoryFromDatabase(
                    existStory.id,
                    existStory.userId,
                    existStory.storyImgUrl,
                    existStory.profileImgUrl,
                    existStory.name
                );
                console.log("Story deleted after 5 minutes.");
            } catch (err) {
                console.error("Failed to delete story after timeout:", err);
            }
        }, 5 * 60 * 1000)  // 5 min

        const follows = await Follow.findAll({
            where: { followeeId: req.body.userId }
        })
        const followsArray = follows.map(item => item.followerId)

        io.emit('newStory', {
            to: followsArray, //my followers
            story
        })

        res.json(story)
    } catch (e) {
        next(e);
    }
}


export async function getUserStoriesHistory(req: Request, res: Response, next: NextFunction) {
    try {
        const stories = await StoryArchive.findAll({
            where: {
                userId: req.userId
            }
        })
        res.json(stories)
    } catch (e) {
        next(e);
    }
}