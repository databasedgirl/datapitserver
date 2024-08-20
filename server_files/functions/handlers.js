"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handlers = void 0;
class Handlers {
    NF(req, res, next) {
        res.status(404);
        res.json({
            "404": "The resource you are looking for could not be found.",
        });
        return;
    }
}
exports.Handlers = Handlers;
