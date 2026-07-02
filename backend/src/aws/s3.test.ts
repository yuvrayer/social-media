import { describe, test, expect, jest, beforeEach } from "@jest/globals";

const sendMock = jest.fn(
    async (...args: any[]): Promise<any> => {
        return {};
    }
);

jest.mock("@aws-sdk/client-s3", () => ({
    S3Client: jest.fn(() => ({
        send: sendMock
    })),

    CreateBucketCommand: jest.fn((params) => ({
        type: "CreateBucketCommand",
        params
    })),

    PutBucketCorsCommand: jest.fn((params) => ({
        type: "PutBucketCorsCommand",
        params
    }))
}));

jest.mock("config", () => ({
    get: jest.fn((key: string) => {

        const config: Record<string, any> = {
            "s3.connection": {},

            "s3.isLocalstack": true,

            "s3.bucket": "test-bucket",

            "s3.corsRules": {
                CORSRules: [
                    {
                        AllowedOrigins: ["*"],
                        AllowedMethods: ["GET"],
                        AllowedHeaders: ["*"]
                    }
                ]
            }
        };
        return config[key];
    })
}));

import {
    createAppBucketIfNotExist,
    createBucketIfNotExist
} from "./s3";

describe("S3 Service", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createAppBucketIfNotExist", () => {

        test("should create bucket and apply CORS rules", async () => {

            sendMock
                .mockResolvedValueOnce({})
                .mockResolvedValueOnce({});

            await createAppBucketIfNotExist();

            expect(sendMock)
                .toHaveBeenCalledTimes(2);

            expect(sendMock.mock.calls[0][0].type)
                .toBe("CreateBucketCommand");

            expect(sendMock.mock.calls[0][0].params)
                .toEqual({
                    Bucket: "test-bucket"
                });

            expect(sendMock.mock.calls[1][0].type)
                .toBe("PutBucketCorsCommand");

            expect(sendMock.mock.calls[1][0].params)
                .toEqual({
                    Bucket: "test-bucket",
                    CORSConfiguration: {
                        CORSRules: [
                            {
                                AllowedOrigins: ["*"],
                                AllowedMethods: ["GET"],
                                AllowedHeaders: ["*"]
                            }
                        ]
                    }
                });
        });

        test("should ignore error when bucket already exists", async () => {

            sendMock.mockRejectedValue(
                new Error("BucketAlreadyExists")
            );

            await expect(
                createAppBucketIfNotExist()
            ).resolves.not.toThrow();
        });
    });

    describe("createBucketIfNotExist", () => {

        test("should create custom bucket", async () => {

            sendMock.mockResolvedValue({});
            
            await createBucketIfNotExist("my-bucket");

            expect(sendMock)
                .toHaveBeenCalledTimes(1);

            expect(sendMock.mock.calls[0][0].type)
                .toBe("CreateBucketCommand");

            expect(sendMock.mock.calls[0][0].params)
                .toEqual({
                    Bucket: "my-bucket"
                });
        });

        test("should not throw when bucket creation fails", async () => {
            sendMock.mockRejectedValue(
                new Error("S3 failure")
            );

            await expect(
                createBucketIfNotExist("my-bucket")
            ).resolves.not.toThrow();
        });
    });
});