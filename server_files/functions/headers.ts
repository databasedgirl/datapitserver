import {Request, Response, NextFunction} from 'express';

export class Headers{
    cors_ACAO(req:Request,res:Response,next:NextFunction): void{
        res.header('Access-Control-Allow-Origin',process.env.FRONT_HOST);
        next();
    }
}