import { Request, Response, NextFunction } from "express";

export class Handlers {
    NF(req: Request, res: Response, next: NextFunction): void {
        res.status(404);
        res.json({
            "404": "The resource you are looking for could not be found.",
        });
        return;
    }
}
