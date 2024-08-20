"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const express_2 = require("express");
const dotenv_1 = __importDefault(require("dotenv"));
const headers_1 = require("./functions/headers");
const handlers_1 = require("./functions/handlers");
const functions_1 = require("./functions/functions");
dotenv_1.default.config();
const server = (0, express_1.default)();
const router = (0, express_2.Router)();
const port = process.env.PORT;
const handler = new handlers_1.Handlers();
const header = new headers_1.Headers();
const posts = new functions_1.Posts();
posts.Watch();
/* SERVER USES */
server.use(router);
server.use(express_1.json);
server.disable("x-powered-by");
/* ROUTER */
router.use(header.cors_ACAO);
router.post('*.html', (req, res) => {
    res.header('location', '/');
});
router.post('/', (req, res) => {
    res.json({ previews: posts.GetBlog_Static('all') });
});
router.post('/posts', (req, res) => {
    res.json({ previews: posts.GetBlog_Static('posts') });
});
router.post('/guides', (req, res) => {
    res.json({ previews: posts.GetBlog_Static('guides') });
});
router.post('/p/:blog', (req, res) => {
    let param = (0, functions_1.sanitize)(req.params.blog);
    if (param == '' || typeof (param) == "undefined") {
        res.status(404);
        res.json({ "404": "The resource you are looking for could not be found." });
        return;
    }
    let blog_response = posts.GetBlog(param, "posts");
    if (blog_response == 0 || typeof (blog_response) == "undefined") {
        res.status(404);
        res.json({ "404": "The resource you are looking for could not be found." });
        return;
    }
    res.json({ blog: blog_response });
});
router.post('/g/:blog', (req, res) => {
    let param = (0, functions_1.sanitize)(req.params.blog);
    if (param == '' || typeof (param) == "undefined") {
        res.status(404);
        res.json({ "404": "The resource you are looking for could not be found." });
        return;
    }
    let blog_response = posts.GetBlog(param, "guides");
    if (blog_response == 0 || typeof (blog_response) == "undefined") {
        res.status(404);
        res.json({ "404": "The resource you are looking for could not be found." });
        return;
    }
    res.json({ blog: blog_response });
});
router.post("/ping", (req, res) => {
    console.log(`[+] Website Bumped at ${(0, functions_1.get_date)()}!`);
    res.json({ pong: 1 });
});
router.use(handler.NF);
/* SERVER LISTEN */
server.listen(port, () => {
    console.log(`[+]Server Started at ${(0, functions_1.get_date)()}.`);
});
