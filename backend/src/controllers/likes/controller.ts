import { NextFunction, Request, Response } from "express";
import AppError from "../../errors/app-error";
import { StatusCodes } from "http-status-codes";
import CommentLikes from "../../models/commentLike";
import PostLikes from "../../models/postLike";


export async function getAllCommentsLikes(req: Request, res: Response, next: NextFunction) {
    try {
        // Get all requests where the logged-in user is the receiver
        const commentLikes = await CommentLikes.findAll()
        res.json(commentLikes)
    } catch (e) {
        next(e);
    }
}

export async function getAllPostsLikes(req: Request, res: Response, next: NextFunction) {
    try {
        // Get all requests where the logged-in user is the receiver
        const postsLikes = await PostLikes.findAll()
        res.json(postsLikes)
    } catch (e) {
        next(e);
    }
}


export async function addCommentLike(req: Request<{ commentId: string }>, res: Response, next: NextFunction) {
    try {
        const commentId = req.params.commentId
        const userId = req.userId
        const commentLike = await CommentLikes.create({
            userId,
            commentId
        })
        res.json(commentLike)
    } catch (e) {
        next(e)
    }
}

export async function addPostLike(req: Request<{ postId: string }>, res: Response, next: NextFunction) {
    try {
        const postId = req.params.postId
        const userId = req.userId
        const postLike = await PostLikes.create({
            userId,
            postId
        })
        res.json(postLike)
    } catch (e) {
        next(e)
    }
}


export async function removeCommentLike(req: Request<{ commentId: string }>, res: Response, next: NextFunction) {
    try {
        const commentId = req.params.commentId
        const userId = req.userId
        const isUnLiked = await CommentLikes.destroy({
            where: {
                userId,
                commentId
            }
        })
        if (isUnLiked === 0) return next(new AppError(
            StatusCodes.NOT_FOUND,
            'tried to delete not exist record'
        ))
        res.json({ success: true })
    } catch (e) {
        next(e)
    }
}



export async function removePostLike(req: Request<{ postId: string }>, res: Response, next: NextFunction) {
    try {
        const postId = req.params.postId
        const userId = req.userId
        const isUnLiked = await PostLikes.destroy({
            where: {
                userId,
                postId
            }
        })
        if (isUnLiked === 0) return next(new AppError(
            StatusCodes.NOT_FOUND,
            'tried to delete not exist record'
        ))
        res.json({ success: true })
    } catch (e) {
        next(e)
    }
}