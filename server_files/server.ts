import express from "express";
import { Router, Request, Response } from "express";
import dotenv from "dotenv"; 

import { Headers } from "./functions/headers";
import { Handlers } from "./functions/handlers";
import { Posts,sanitize,get_date,notify} from "./functions/functions";



dotenv.config();
const server = express(); 
const router:Router = Router();
const port:string|undefined = process.env.PORT;
const handler = new Handlers();
const header = new Headers(); 
const posts = new Posts(); 


/* SERVER USES */
server.use(router);
server.use(handler.ErrHandle);
server.disable("x-powered-by");

/* ROUTER */
router.use(header.cors_ACAO);

router.post('*.html',(req:Request,res:Response)=>{
    res.header('location','/')
});
router.post('/',async(req:Request,res:Response)=>{
    res.json({previews:await posts.GetBlog_Static('all')});
});
router.get('/ping',(req:Request,res:Response)=>{
    res.send('pong!');
});
router.post('/posts',async(req:Request,res:Response)=>{
    
    res.json({previews:await posts.GetBlog_Static('posts')});
});
router.post('/guides',async(req:Request,res:Response)=>{
    res.json({previews:await posts.GetBlog_Static('guides')});
});
router.post('/p/:blog',async(req:Request,res:Response)=>{
    let param:string|undefined = sanitize(req.params.blog);
    if(param == '' || typeof(param) == "undefined"){
        res.status(404);
        res.json({"404": "The resource you are looking for could not be found."});
        return;
    }
    let blog_response:object|number|undefined = await posts.GetBlog(param,"posts");
    if(blog_response == 0 || typeof(blog_response) == "undefined"){
        res.status(404);
        res.json({"404": "The resource you are looking for could not be found."});
        return;
    }
    res.status(200);
    res.json({blog:blog_response});
});

router.post('/g/:blog',async(req:Request,res:Response)=>{
    let param:string|undefined = sanitize(req.params.blog);
    if(param == '' || typeof(param) == "undefined"){
        res.status(404);
        res.json({"404": "The resource you are looking for could not be found."});
        return;
    }
    let blog_response:object|number|undefined = await posts.GetBlog(param,"guides");
    if(blog_response == 0 || typeof(blog_response) == "undefined"){
        res.status(404);
        res.json({"404": "The resource you are looking for could not be found."});
        return;
    }
    res.status(200);
    res.json({blog:blog_response});
});


router.get('/new/:code/:key',async(req:Request,res:Response)=>{
    let new_post:string|undefined = sanitize(req.params.code);
    let key:string|undefined = req.params.key;
    if(new_post == '' || typeof(new_post) == "undefined" || key == '' || typeof(key) == "undefined" ){
        res.status(404);
        res.json({"404": "The resource you are looking for could not be found."});
        return;
    }
    let fetch_new:number|undefined = await posts.Auth(new_post,key);
    if(fetch_new == 0 || typeof(fetch_new) == "undefined"){
        res.status(404);
        res.json({"404": "The resource you are looking for could not be found."});
        return;
    }
    res.status(200);
    res.json({"200":"Post created successfully!"})
});

router.use(handler.NF);


/* SERVER LISTEN */
server.listen(port, () => {
    notify(`Server started on port ${port} at ${get_date()}`,3)
    console.log(`[+]Server Started at ${get_date()}.`); 
});
