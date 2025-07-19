import { NextFunction, Request, Response } from "express";
import Post from "../../models/post";
import postIncludes from "../common/post-includes";
import Follow from "../../models/follow";

export async function getFeed(req: Request<{ userId: string }>, res: Response, next: NextFunction) {
    try {
        const userId = req.params.userId

        const following = await Follow.findAll({
            where: { followerId: userId },
            attributes: ['followeeId']
        })

        const followeeIds = following.map(f => f.followeeId)

        const posts = await Post.findAll({
            where: {
                userId: followeeIds
            },
            ...postIncludes,
            order: [['createdAt', 'DESC']]
        })

        res.json({ posts: posts, postsNum: posts.length })

        // example how to do the same with RAW QUERY using sequelize:
        // const feed = await sequelize.query(`
        //     select	posts.*
        //     from 	posts
        //     JOIN	follows on posts.user_id = follows.followee_id
        //     AND		follows.follower_id = ?
        //     ORDER BY created_at DESC
        // `, {
        //     replacements: [ userId ],
        //     model: Post
        // })        

        // await Promise.all(feed.map(post => post.reload({...postIncludes})))

        // res.json(feed)
    } catch (e) {
        next(e)
    }
}