"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Headers = void 0;
class Headers {
    cors_ACAO(req, res, next) {
        res.header('Access-Control-Allow-Origin', process.env.FRONT_HOST);
        next();
    }
}
exports.Headers = Headers;
