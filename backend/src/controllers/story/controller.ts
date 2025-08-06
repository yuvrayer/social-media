import { NextFunction, Request, Response } from "express";
import Story from "../../models/story";
import StoryViews from "../../models/sawStory";
import { UploadedFile } from "express-fileupload";
import Follow from "../../models/follow";

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

export async function deleteStory(req: Request<{ userId: string, storyId: string }>, res: Response, next: NextFunction) {
    try {
        const { userId, storyId } = req.params
        const deletedStory = await Story.destroy({
            where: {
                userId,
                id: storyId
            }
        })
        res.json(deletedStory)
    } catch (e) {
        alert(e)
    }
}

export async function addSaw(req: Request<{}, {}, { userIdUploaded: string, userIdSaw: string }>, res: Response, next: NextFunction) {
    try {
        const { userIdUploaded, userIdSaw } = req.body
        const alreadyExist = await StoryViews.findOne({
            where: {
                userIdUploaded,
                userIdSaw
            }
        })
        if (!alreadyExist) {
            try {
                const storyAdd = await StoryViews.create({ userIdUploaded, userIdSaw })
                res.json(storyAdd)
            } catch (e) {
                alert(e)
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
        const storyImage = req.files.storyImage as UploadedFile
        const stories = await Story.create({
            userId: req.body.userId,
            storyImgUrl: storyImage.name,
            profileImgUrl: req.body.profileImgUrl,
            name: req.body.name
        })

        setTimeout(async () => {
            try {
                await Story.destroy({
                    where: {
                        id: stories.id
                    }
                });
                console.log("Story deleted after 5 minutes.");
            } catch (err) {
                console.error("Failed to delete story after timeout:", err);
            }
        }, 5 * 60 * 1000); // 5 minutes

        res.json(stories)
    } catch (e) {
        next(e);
    }
}