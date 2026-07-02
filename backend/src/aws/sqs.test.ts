import { jest, describe, test, expect, beforeEach, afterAll, beforeAll } from "@jest/globals";

const mockSend = jest.fn(
    async (...args: any[]): Promise<any> => {
        return {};
    }
);

jest.mock("@aws-sdk/client-sqs", () => ({
    SQSClient: jest.fn(() => ({
        send: mockSend
    })),
    CreateQueueCommand: jest.fn((params) => params)
}));

jest.mock("config", () => ({
    get: jest.fn((key: string) => {

        const config: Record<string, any> = {
            "sqs.connection": {},
            "sqs.isLocalstack": true,
            "sqs.queueName": "test-queue"
        };

        return config[key];
    })
}));

import * as sqs from "./sqs";

beforeAll(() => {
    jest.spyOn(console, "log")
        .mockImplementation(() => {});

    jest.spyOn(console, "error")
        .mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe("SQS Service", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });


    describe("createAppQueueIfNotExist", () => {


        test("should create queue and save queue url", async () => {

            mockSend.mockResolvedValue({
                QueueUrl: "http://localhost:4566/test-queue"
            });


            await sqs.createAppQueueIfNotExist();


            expect(mockSend)
                .toHaveBeenCalledTimes(1);

            expect(sqs.queueUrl)
                .toBe("http://localhost:4566/test-queue");
        });



        test("should not throw when queue already exists", async () => {

            mockSend.mockRejectedValue({
                name: "QueueAlreadyExists"
            });

            await expect(
                sqs.createAppQueueIfNotExist()
            ).resolves.not.toThrow();

            expect(mockSend)
                .toHaveBeenCalledTimes(1);
        });



        test("should throw unexpected aws errors", async () => {

            mockSend.mockRejectedValue(
                new Error("AWS error")
            );


            await expect(
                sqs.createAppQueueIfNotExist()
            )
                .rejects
                .toThrow("AWS error");
        });



        test("should throw if queue url is missing", async () => {

            mockSend.mockResolvedValue({});


            await expect(
                sqs.createAppQueueIfNotExist()
            )
                .rejects
                .toThrow();
        });
    });
});