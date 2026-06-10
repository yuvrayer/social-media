import { Upload } from "@aws-sdk/lib-storage";
import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { v4 } from "uuid";
import config from 'config'
import s3Client, { createBucketIfNotExist } from "../aws/s3";
import sqsClient, { queueUrl } from "../aws/sqs";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

export default async function fileUploader<T extends Record<string,any>>(req: Request<{}, {}, T>, res: Response, next: NextFunction) {
//newStory: boolean, userId: string, storyImgUrl: string
    try {
        //req.files.postImage- through post image
        //req.files.profileImg- through profile image
        //req.body.newStory- through new story image
        //req.files.chatFile- through image that sent in chat
        //req.files.photoFile- through
        if (!req?.files?.postImage && !req?.files?.profileImg && !req.body.newStory && !req?.files?.chatFile && !req?.files?.photoFile) return next()

        //not story
        if (!req.body.newStory) {
            let uploadedImage = null
            //if it is a profile image
            if (req.files?.profileImg) {
                uploadedImage = req.files.profileImg as UploadedFile
            } else if (req.files?.postImage) { uploadedImage = req.files.postImage as UploadedFile } //post image
            else if (req.files?.chatFile) { uploadedImage = req.files.chatFile as UploadedFile } //chat image
            else if (req.files?.photoFile) { uploadedImage = req.files.photoFile as UploadedFile } //photo file

            //sets the appropriate image through the source 
            const upload = new Upload({
                client: s3Client,
                params: {
                    Bucket: config.get<string>('s3.bucket'),
                    Key: `${v4()}${path.extname(uploadedImage?.name? uploadedImage?.name : ``)}`,
                    Body: uploadedImage?.data,
                    ContentType: uploadedImage?.mimetype
                }
            })

            //upload to the database
            const response = await upload.done()
            console.log(response)

            //sends it to the sqs
            const sqsResponse = await sqsClient.send(new SendMessageCommand({
                QueueUrl: queueUrl,
                MessageBody: JSON.stringify({
                    bucket: response.Bucket,
                    key: response.Key
                })
            }))
            console.log(sqsResponse)

            // req.imageUrl = response.Location
            req.imageUrl = `${response.Bucket}/${response.Key}`
        } 
        //if it is a story
        else {
            const uploadedFile = req?.files?.storyImage as UploadedFile

            createBucketIfNotExist(req?.body?.userId ? req?.body?.userId : `a`)

            const upload = new Upload({
                client: s3Client,
                params: {
                    Bucket: req.body.userId,
                    Key: uploadedFile.name,
                    Body: uploadedFile.data,
                    ContentType: uploadedFile.mimetype
                }
            })

            //upload to the database
            const response = await upload.done()
            console.log(response)
        }
    }
    catch (e) {
        next(e)
    }
    next()
}