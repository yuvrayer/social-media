import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";
import AppError from "../errors/app-error";
import { StatusCodes } from "http-status-codes";

export default function validation(validator: ObjectSchema) {
    return async function (req: Request, res: Response, next: NextFunction) {
        try {
            //send the body into the joi validation
            req.body = await validator.validateAsync(req.body)
            next()
        } catch (e) {
            if (e instanceof Error)
                next(new AppError(StatusCodes.UNPROCESSABLE_ENTITY, e.message))
        }
    }
}
