import { Request, Response, NextFunction } from "express";
import {notify} from './functions';
export class Handlers {
    public NF(req: Request, res: Response, next: NextFunction): void {
        if(req.url != '/' && req.url != '/favicon.ico'){
            notify(`404 NOT FOUND: ${req.url}`,3);
        }
        res.status(404);
        res.json({
            "404": "The resource you are looking for could not be found.",
        });
        return;
    }
    public ErrHandle(err:any,req:Request,res:Response,next:NextFunction){
        res.status(500);
        notify(err,1);
        next();
    }
}
