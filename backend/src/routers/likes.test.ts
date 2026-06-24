import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, jest, test } from "@jest/globals";

jest.mock("../io/io", () => ({
    __esModule: true,
    default: {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        disconnect: jest.fn()
    }
}));

jest.mock("../middlewares/enforce-auth", () => {
    return (req: any, res: any, next: any) => {
        req.userId = "user-123";
        next();
    };
});

import app, { loadRoutes } from "../app";
import CommentLikes from "../models/commentLike";
import PostLikes from "../models/postLike";
import sequelize from "../db/sequelize";

beforeAll(() => {
    loadRoutes();
});

afterAll(async () => {
    jest.restoreAllMocks();
    await sequelize.close();
});

describe("Likes Router Tests", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /likes/getAllCommentsLikes", () => {

        test("should return all comment likes", async () => {
            const likes = [
                {
                    id: 1,
                    userId: "user-123",
                    commentId: "comment-1"
                }
            ];

            jest.spyOn(CommentLikes, "findAll")
                .mockResolvedValue(likes as any);

            const res = await request(app)
                .get("/likes/getAllCommentsLikes");

            expect(res.status).toBe(200);
            expect(res.body).toEqual(likes);
        });

        test("should return empty array", async () => {
            jest.spyOn(CommentLikes, "findAll")
                .mockResolvedValue([] as any);

            const res = await request(app)
                .get("/likes/getAllCommentsLikes");

            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        test("should call findAll once", async () => {
            const spy = jest.spyOn(CommentLikes, "findAll")
                .mockResolvedValue([] as any);

            const res = await request(app)
                .get("/likes/getAllCommentsLikes");

            expect(res.status).toBe(200);
            expect(spy).toHaveBeenCalledTimes(1);
        });

        test("should handle database error", async () => {
            jest.spyOn(CommentLikes, "findAll")
                .mockRejectedValue(new Error());

            const res = await request(app)
                .get("/likes/getAllCommentsLikes");

            expect(res.status).toBe(500);
        });
    });

    describe("GET /likes/getAllPostsLikes", () => {

        test("should return all post likes", async () => {
            const likes = [
                {
                    id: 1,
                    userId: "user-123",
                    postId: "post-1"
                }
            ];

            jest.spyOn(PostLikes, "findAll")
                .mockResolvedValue(likes as any);

            const res = await request(app)
                .get("/likes/getAllPostsLikes");

            expect(res.status).toBe(200);
            expect(res.body).toEqual(likes);
        });

        test("should return empty array", async () => {
            jest.spyOn(PostLikes, "findAll")
                .mockResolvedValue([] as any);

            const res = await request(app)
                .get("/likes/getAllPostsLikes");

            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        test("should call findAll once", async () => {
            const spy = jest.spyOn(PostLikes, "findAll")
                .mockResolvedValue([] as any);

            const res = await request(app)
                .get("/likes/getAllPostsLikes");

            expect(res.status).toBe(200);
            expect(spy).toHaveBeenCalledTimes(1);
        });

        test("should handle database error", async () => {
            jest.spyOn(PostLikes, "findAll")
                .mockRejectedValue(new Error());

            const res = await request(app)
                .get("/likes/getAllPostsLikes");

            expect(res.status).toBe(500);
        });
    });

    describe("POST /likes/addComment/:commentId", () => {

        test("should create comment like", async () => {
            const createdLike = {
                id: 1,
                userId: "user-123",
                commentId: "comment-1"
            };

            jest.spyOn(CommentLikes, "create")
                .mockResolvedValue(createdLike as any);

            const res = await request(app)
                .post("/likes/addComment/comment-1");

            expect(res.status).toBe(200);
            expect(res.body).toEqual(createdLike);

            expect(CommentLikes.create)
                .toHaveBeenCalledWith({
                    userId: "user-123",
                    commentId: "comment-1"
                });
        });

        test("should reject empty commentId route", async () => {
            const res = await request(app)
                .post("/likes/addComment/");

            expect(res.status).toBe(404);
        });

        test("should handle duplicate comment like", async () => {
            jest.spyOn(CommentLikes, "create")
                .mockRejectedValue(new Error("duplicate key"));

            const res = await request(app)
                .post("/likes/addComment/comment-1");

            expect(res.status).toBe(500);
        });

        test("should handle database error", async () => {
            jest.spyOn(CommentLikes, "create")
                .mockRejectedValue(new Error());

            const res = await request(app)
                .post("/likes/addComment/comment-1");

            expect(res.status).toBe(500);
        });
    });

    describe("POST /likes/addPost/:postId", () => {

        test("should create post like", async () => {
            const createdLike = {
                id: 1,
                userId: "user-123",
                postId: "post-1"
            };

            jest.spyOn(PostLikes, "create")
                .mockResolvedValue(createdLike as any);

            const res = await request(app)
                .post("/likes/addPost/post-1");

            expect(res.status).toBe(200);
            expect(res.body).toEqual(createdLike);

            expect(PostLikes.create)
                .toHaveBeenCalledWith({
                    userId: "user-123",
                    postId: "post-1"
                });
        });

        test("should reject empty postId route", async () => {
            const res = await request(app)
                .post("/likes/addPost/");

            expect(res.status).toBe(404);
        });

        test("should handle duplicate post like", async () => {
            jest.spyOn(PostLikes, "create")
                .mockRejectedValue(new Error("duplicate key"));

            const res = await request(app)
                .post("/likes/addPost/post-1");

            expect(res.status).toBe(500);
        });

        test("should handle database error", async () => {
            jest.spyOn(PostLikes, "create")
                .mockRejectedValue(new Error());

            const res = await request(app)
                .post("/likes/addPost/post-1");

            expect(res.status).toBe(500);
        });
    });

    describe("DELETE /likes/removeComment/:commentId", () => {

        test("should remove comment like", async () => {
            const spy = jest.spyOn(CommentLikes, "destroy")
                .mockResolvedValue(1);

            const res = await request(app)
                .delete("/likes/removeComment/comment-1");

            expect(res.status).toBe(200);

            expect(res.body).toEqual({
                success: true
            });

            expect(spy).toHaveBeenCalledWith({
                where: {
                    userId: "user-123",
                    commentId: "comment-1"
                }
            });
        });

        test("should return 404 if like does not exist", async () => {
            jest.spyOn(CommentLikes, "destroy")
                .mockResolvedValue(0);

            const res = await request(app)
                .delete("/likes/removeComment/comment-1");

            expect(res.status).toBe(404);
        });

        test("should handle database error", async () => {
            jest.spyOn(CommentLikes, "destroy")
                .mockRejectedValue(new Error());

            const res = await request(app)
                .delete("/likes/removeComment/comment-1");

            expect(res.status).toBe(500);
        });
    });

    describe("DELETE /likes/removePost/:postId", () => {

        test("should remove post like", async () => {
            const spy = jest.spyOn(PostLikes, "destroy")
                .mockResolvedValue(1);

            const res = await request(app)
                .delete("/likes/removePost/post-1");

            expect(res.status).toBe(200);

            expect(res.body).toEqual({
                success: true
            });

            expect(spy).toHaveBeenCalledWith({
                where: {
                    userId: "user-123",
                    postId: "post-1"
                }
            });
        });

        test("should return 404 if like does not exist", async () => {
            jest.spyOn(PostLikes, "destroy")
                .mockResolvedValue(0);

            const res = await request(app)
                .delete("/likes/removePost/post-1");

            expect(res.status).toBe(404);
        });

        test("should handle database error", async () => {
            jest.spyOn(PostLikes, "destroy")
                .mockRejectedValue(new Error());

            const res = await request(app)
                .delete("/likes/removePost/post-1");

            expect(res.status).toBe(500);
        });
    });
});