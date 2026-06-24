import config from "config"
import { jest } from "@jest/globals";

jest.mock("../io/io", () => ({
    __esModule: true,
    default: {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        disconnect: jest.fn()
    }
}));

jest.mock('@aws-sdk/lib-storage', () => ({
    Upload: jest.fn().mockImplementation(() => ({
        done: async () => ({
            Bucket: 'test-bucket',
            Key: 'test-image.jpg',
        }),
    })),
}));

jest.mock('../aws/sqs', () => ({
    __esModule: true,
    default: {
        send: async () => ({})
    },
    queueUrl: 'test-queue'
}));

import app, { loadRoutes } from "../app"
import request from 'supertest'
import { sign } from "jsonwebtoken"
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import User from "../models/user";
import sequelize from "../db/sequelize"
import Post from "../models/post";

beforeAll(async () => {
    loadRoutes();

    await sequelize.sync({ force: true })

    await User.create({
        id: '1230ae30-dc4f-4752-bd84-092956f5c633',
        username: 'testuser',
        email: 'test@test.com',
        password: 'password',
        name: `Test User`
    });
})

afterAll(async () => {
    await sequelize.close();
});

describe('profile router tests', () => {
    describe('/userid endpoint test', () => {
        // test all the exceptions before...

        test('it should return 401 if no authorization header', async () => {
            const result = await request(app).get('/profile/1230ae30-dc4f-4752-bd84-092956f5c633')
            expect(result.statusCode).toBe(401)
        })

        test('it should return an array of posts', async () => {
            const id = '1230ae30-dc4f-4752-bd84-092956f5c633'
            const jwt = sign({ id: id }, config.get<string>('app.jwtSecret'))

            const result = await request(app)
                .get(`/profile/${id}`)
                .set({ 'Authorization': `Bearer ${jwt}` })
            expect(result.statusCode).toBe(200)
            expect(result.body).toHaveProperty('posts')
            expect(result.body).toHaveProperty('postsNum')

            expect(Array.isArray(result.body.posts)).toBe(true)

            if (result.body.posts.length > 0) {
                const post = result.body.posts[0]
                expect(post).toHaveProperty('id')
                expect(post).toHaveProperty('userId')
                expect(post).toHaveProperty('title')
                expect(post).toHaveProperty('body')
                expect(post).toHaveProperty('imageUrl')
            }
        })
    })

    let createdPostId: string;

    describe('POST /posts (createPost)', () => {
        test('should create a post and return it', async () => {
            const id = '1230ae30-dc4f-4752-bd84-092956f5c633'
            const jwt = sign({ id: id }, config.get<string>('app.jwtSecret'))

            const res = await request(app)
                .post('/profile')
                .set('Authorization', `Bearer ${jwt}`)
                .set('x-client-id', 'test-client')
                .send({
                    title: 'Test Title',
                    body: 'This is the post body',
                });

            expect(res.statusCode).toBe(200)
            expect(res.body).toHaveProperty('id')
            expect(res.body).toHaveProperty('title', 'Test Title')
            expect(res.body).toHaveProperty('body', 'This is the post body')
            expect(res.body).toHaveProperty('userId', '1230ae30-dc4f-4752-bd84-092956f5c633')

            createdPostId = res.body.id
        });
    });

    describe('GET /post/:id (getPost)', () => {
        test('should return the created post', async () => {
            const id = '1230ae30-dc4f-4752-bd84-092956f5c633'
            const jwt = sign({ id: id }, config.get<string>('app.jwtSecret'))
            const res = await request(app)
                .get(`/profile/post/${createdPostId}`)
                .set('Authorization', `Bearer ${jwt}`)

            expect(res.statusCode).toBe(200)
            expect(res.body).toHaveProperty('id', createdPostId)
            expect(res.body).toHaveProperty('title', 'Test Title')
        });

        test('should return 404 for non-existing post', async () => {
            const id = '1230ae30-dc4f-4752-bd84-092956f5c633'
            const jwt = sign({ id: id }, config.get<string>('app.jwtSecret'))
            const res = await request(app)
                .get('/profile/post/non-existing-id')
                .set('Authorization', `Bearer ${jwt}`)

            expect(res.statusCode).toBe(404)
            expect(res.body).toHaveProperty('error', 'Not Found')
            expect(res.body.message).toContain('does not exist')
        });
    });

    describe('PATCH /profile/:id (updatePost)', () => {
        const id = '1230ae30-dc4f-4752-bd84-092956f5c633'
        const jwt = sign({ id: id }, config.get<string>('app.jwtSecret'))
        test('should update the post- no imageUrl given', async () => {
            const before = await Post.findByPk(createdPostId);
            const res = await request(app)
                .patch(`/profile/${createdPostId}`)
                .set('Authorization', `Bearer ${jwt}`)
                .send({
                    title: 'Updated Title',
                    body: 'Updated body content',
                });

            expect(res.statusCode).toBe(200)
            expect(res.body).toHaveProperty('title', 'Updated Title')
            expect(res.body).toHaveProperty('body', 'Updated body content')
            expect(res.body.imageUrl).toBe(before?.imageUrl);

        });

        test('should update the post- imageUrl given', async () => {
            const res = await request(app)
                .patch(`/profile/${createdPostId}`)
                .set('Authorization', `Bearer ${jwt}`)
                .field('title', 'Updated Title')
                .field('body', 'Updated body content')
                .attach(
                    'postImage',
                    Buffer.from('fake image'),
                    {
                        filename: 'test.jpg',
                        contentType: 'image/jpeg'
                    }
                )

            expect(res.statusCode).toBe(200)
            expect(res.body).toHaveProperty('title', 'Updated Title')
            expect(res.body).toHaveProperty('body', 'Updated body content')
            expect(res.body.imageUrl).toBe("test-bucket/test-image.jpg");

        });

        test('should return error if post does not exist', async () => {
            const res = await request(app)
                .patch('/profile/non-existent-id')
                .set('Authorization', `Bearer ${jwt}`)
                .send({ title: 'xxxxxxxxxxxx', body: 'xxxxxxxxxxxxxxxxxxxxxxxx' })

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'Not Found');
            expect(res.body).toHaveProperty('message', expect.stringContaining('does not exist'));
        });

        test('should return unprocessable entity if title is less than 10 chars', async () => {
            const res = await request(app)
                .patch(`/profile/${createdPostId}`)
                .set('Authorization', `Bearer ${jwt}`)
                .send({ title: 'xx', body: 'xxxxxxxxxxxxxxxxxxxxxxxx' })

            expect(res.statusCode).toBe(422);
        });

        test('should return unprocessable entity if title is more than 40 chars', async () => {
            const res = await request(app)
                .patch(`/profile/${createdPostId}`)
                .set('Authorization', `Bearer ${jwt}`)
                .send({ title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', body: 'xxxxxxxxxxxxxxxxxxxxxxxx' })

            expect(res.statusCode).toBe(422);
        });

        test('should return unprocessable entity if body is less than 20 chars', async () => {
            const res = await request(app)
                .patch(`/profile/${createdPostId}`)
                .set('Authorization', `Bearer ${jwt}`)
                .send({ title: 'xxxxxxxxxxxxxxxxxxxxxxxx', body: 'xx' })

            expect(res.statusCode).toBe(422);
        });
    });

    describe('DELETE /profile/:id (deletePost)', () => {
        test('should delete the post', async () => {
            const id = '1230ae30-dc4f-4752-bd84-092956f5c633'
            const jwt = sign({ id: id }, config.get<string>('app.jwtSecret'))
            const res = await request(app)
                .delete(`/profile/${createdPostId}`)
                .set('Authorization', `Bearer ${jwt}`)

            expect(res.statusCode).toBe(200)
            expect(res.body).toEqual({ success: true })

            const deletedPost = await Post.findByPk(createdPostId)

            expect(deletedPost).toBeNull()
        })
    });

    test('should return 404 when trying to delete non-existent post', async () => {
        const id = '1230ae30-dc4f-4752-bd84-092956f5c633'
        const jwt = sign({ id: id }, config.get<string>('app.jwtSecret'))
        const res = await request(app)
            .delete(`/profile/${createdPostId}`) // already deleted
            .set('Authorization', `Bearer ${jwt}`)

        expect(res.statusCode).toBe(404)
    });
});
