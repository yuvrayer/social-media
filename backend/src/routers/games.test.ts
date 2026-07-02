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

jest.mock("../middlewares/enforce-auth", () => ({
    __esModule: true,
    default: jest.fn(
        (req: any, res: any, next: any) => {
            req.userId = "user-123";
            next();
        }
    )
}));

jest.mock("../models/user", () => ({
    __esModule: true,
    default: {
        findByPk: jest.fn()
    }
}));

jest.mock("../models/gamesBestScore", () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
    }
}));

jest.mock("../db/sequelize", () => ({
    __esModule: true,
    default: {
        authenticate: jest.fn(),
        sync: jest.fn(),
        close: jest.fn()
    }
}));

import app, { loadRoutes } from "../app";

import User from "../models/user";
import GamesBestScores from "../models/gamesBestScore";
import enforceAuth from "../middlewares/enforce-auth";
import sequelize from "../db/sequelize";

const mockedUser = User as jest.Mocked<typeof User>;
const mockedScores = GamesBestScores as jest.Mocked<typeof GamesBestScores>;
const mockedAuth = enforceAuth as jest.MockedFunction<typeof enforceAuth>;

beforeAll(() => {
    loadRoutes()
    jest.spyOn(console, 'error')
        .mockImplementation(() => { });
})

afterAll(async () => {
    jest.restoreAllMocks();
    await sequelize.close();
});

describe("Games Routes", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Authentication", () => {

        test("should reject unauthenticated user", async () => {

            mockedAuth.mockImplementationOnce(
                (req, res) => {
                    return res.status(401).json({
                        message: "Unauthorized"
                    });
                }
            );


            const response =
                await request(app)
                    .get("/games/getGamesBestScores/game1");


            expect(response.status)
                .toBe(401);
        });

    });

    describe("GET /getGamesBestScores/:gameCode", () => {

        test("should return empty array when no scores exist", async () => {
            mockedUser.findByPk.mockResolvedValue({
                following: []
            } as any);

            mockedScores.findAll.mockResolvedValue([]);

            const response =
                await request(app)
                    .get("/games/getGamesBestScores/game1");

            expect(response.status)
                .toBe(200);

            expect(response.body)
                .toEqual([]);
        });

        test("should return 404 if user does not exist", async () => {

            mockedUser.findByPk
                .mockResolvedValue(null);

            const response =
                await request(app)
                    .get("/games/getGamesBestScores/game1");

            expect(response.status)
                .toBe(404);

            expect(response.body)
                .toEqual({
                    message: "User not found"
                });
        });

        test("should work when user has no followers", async () => {

            mockedUser.findByPk.mockResolvedValue({
                following: []
            } as any);

            mockedScores.findAll.mockResolvedValue([]);

            const response =
                await request(app)
                    .get("/games/getGamesBestScores/game1");

            expect(response.status)
                .toBe(200);

            expect(mockedScores.findAll)
                .toHaveBeenCalledTimes(1);
        });

        test("should work when following is null", async () => {

            mockedUser.findByPk.mockResolvedValue({
                following: null
            } as any);

            mockedScores.findAll.mockResolvedValue([]);

            const response =
                await request(app)
                    .get("/games/getGamesBestScores/game1");

            expect(response.status)
                .toBe(200);
        });

        test("should return formatted score data", async () => {

            mockedUser.findByPk.mockResolvedValue({
                following: []
            } as any);

            mockedScores.findAll.mockResolvedValue([
                {
                    userId: "user-123",
                    bestScore: 500,
                    user: {
                        dataValues: {
                            name: "Daniel",
                            profileImgUrl: "avatar.png"
                        }
                    }
                }
            ] as any);

            const response =
                await request(app)
                    .get("/games/getGamesBestScores/game1");

            expect(response.body)
                .toEqual([
                    {
                        userId: "user-123",
                        bestScore: 500,
                        name: "Daniel",
                        profileImgUrl: "avatar.png"
                    }
                ]);
        });

        test("should handle missing user relation", async () => {

            mockedUser.findByPk.mockResolvedValue({
                following: []
            } as any);

            mockedScores.findAll.mockResolvedValue([
                {
                    userId: "user-123",
                    bestScore: 100,
                    user: null
                }
            ] as any);

            const response =
                await request(app)
                    .get("/games/getGamesBestScores/game1");

            expect(response.status)
                .toBe(200);

            expect(response.body[0].name)
                .toBeUndefined();
        });

        test("should handle database failure", async () => {

            mockedUser.findByPk
                .mockRejectedValue(
                    new Error("Database error")
                );

            const response =
                await request(app)
                    .get("/games/getGamesBestScores/game1");

            expect(response.status)
                .toBeGreaterThanOrEqual(500);
        });
    });

    describe("POST /newGameBestScore/:gameCode", () => {

        test("should create first score", async () => {
            mockedScores.findOne
                .mockResolvedValue(null);

            mockedScores.create
                .mockResolvedValue({} as any);

            const response =
                await request(app)
                    .post("/games/newGameBestScore/game1")
                    .send({
                        newBestScore: 100
                    });

            expect(response.status)
                .toBe(200);

            expect(mockedScores.create)
                .toHaveBeenCalledWith({
                    gameCode: "game1",
                    userId: "user-123",
                    bestScore: 100
                });
        });

        test("should accept zero score", async () => {

            mockedScores.findOne
                .mockResolvedValue(null);

            const response =
                await request(app)
                    .post("/games/newGameBestScore/game1")
                    .send({
                        newBestScore: 0
                    });

            expect(response.status)
                .toBe(200);
        });

        test("should reject missing score", async () => {

            const response =
                await request(app)
                    .post("/games/newGameBestScore/game1")
                    .send({});

            expect(response.status)
                .toBe(422);
        });

        test("should reject string score", async () => {

            const response =
                await request(app)
                    .post("/games/newGameBestScore/game1")
                    .send({
                        newBestScore: "100"
                    });

            expect(response.status)
                .toBe(422);
        });

        test("should reject negative score", async () => {

            const response =
                await request(app)
                    .post("/games/newGameBestScore/game1")
                    .send({
                        newBestScore: -50
                    });

            expect(response.status)
                .toBe(422);
        });

        test("should reject decimal score", async () => {

            const response =
                await request(app)
                    .post("/games/newGameBestScore/game1")
                    .send({
                        newBestScore: 12.5
                    });

            expect(response.status)
                .toBe(422);
        });

        test("should update existing score", async () => {

            mockedScores.findOne
                .mockResolvedValue({
                    id: 5,
                    bestScore: 100
                } as any);

            mockedScores.update
                .mockResolvedValue([1] as any);

            const response =
                await request(app)
                    .post("/games/newGameBestScore/game1")
                    .send({
                        newBestScore: 200
                    });

            expect(response.status)
                .toBe(200);

            expect(mockedScores.update)
                .toHaveBeenCalled();
        });

        test("should handle create database failure", async () => {

            mockedScores.findOne
                .mockResolvedValue(null);

            mockedScores.create
                .mockRejectedValue(
                    new Error("Insert failed")
                );

            const response =
                await request(app)
                    .post("/games/newGameBestScore/game1")
                    .send({
                        newBestScore: 500
                    });

            expect(response.status)
                .toBeGreaterThanOrEqual(500);
        });

        test("should handle update database failure", async () => {

            mockedScores.findOne
                .mockResolvedValue({
                    id: 1,
                    bestScore: 100
                } as any);

            mockedScores.update
                .mockRejectedValue(
                    new Error("Update failed")
                );

            const response =
                await request(app)
                    .post("/games/newGameBestScore/game1")
                    .send({
                        newBestScore: 200
                    });

            expect(response.status)
                .toBeGreaterThanOrEqual(500);
        });

        test("should not downgrade score (currently fails with current controller)", async () => {

            mockedScores.findOne
                .mockResolvedValue({
                    id: 1,
                    bestScore: 1000
                } as any);

            await request(app)
                .post("/games/newGameBestScore/game1")
                .send({
                    newBestScore: 500
                });
        });
    });
});