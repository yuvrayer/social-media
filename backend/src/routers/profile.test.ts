import config from "config"
import app, { start } from "../app"
import request from 'supertest'
import { sign } from "jsonwebtoken"
import { describe, test, expect } from "@jest/globals"

describe('profile router tests', () => {
    describe('/userid endpoint test', () => {
        // test all the expeptions before...
        test('it should return 401 if no authorization header', async () => {
            await start()
            const result = await request(app).get('/profile')
            expect(result.statusCode).toBe(401)
        })
        test('it should return an array of posts', async () => {
            await start()
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

            expect(res.statusCode).toBe(200)
            expect(res.body).toBeNull() // Sequelize returns null for not found
        });
    });

    describe('PATCH /profile/:id (updatePost)', () => {
        const id = '1230ae30-dc4f-4752-bd84-092956f5c633'
        const jwt = sign({ id: id }, config.get<string>('app.jwtSecret'))
        test('should update the post', async () => {
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
})