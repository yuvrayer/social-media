import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";
import AppError from "../errors/app-error";
import { StatusCodes } from "http-status-codes";

export default function filesValidation(validator: ObjectSchema) {
    return async function (req: Request, res: Response, next: NextFunction) {
        try {
            //send the files into the joi validation. if there are not files- sends empty object
            req.files = await validator.validateAsync(req.files || {})
            next()
        } catch (e) {
            if (e instanceof Error)
                next(new AppError(StatusCodes.UNPROCESSABLE_ENTITY, e.message))
        }
    }
}
