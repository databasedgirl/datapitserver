import dotenv from "dotenv";
import fs from "fs";
import chokidar from "chokidar";


dotenv.config();
export function sanitize(text:string){
  let rgxsntz:RegExp = /[`~!@#$%^&*()|+\-=?;:'",.<>\{\}\[\]\\\/]/gi;
  return text.replace(rgxsntz,(match:string, sanitized:string): string=>{
    return sanitized;
  });
} 
export function get_date(){
  let date:string[] = new Date().toString().split(' ');
  let year:string = date[3];
  let month:string = date[1];
  let day:string  = date[2];
  return `${day} of ${month} ${year}`;
}
export class Posts {
  GetBlog(page:string,type:string){
    let feed:string = fs.readFileSync(<string>process.env.FEED_FILE,{encoding:"utf-8"});
    interface contents{
      title:string;
      blog:string;
      thumbnail:string|undefined;
      thumbnail_alt:string|undefined;
      thumbnail_sub:string|undefined;
      author:string;
      content:string;
      date:string;
    };
    switch(type){
      case 'posts':
        let posts:string = JSON.parse(feed)['posts'];
        let check_posts:Set<string> = new Set(Object.keys(posts));
        if(check_posts.has(page)){
          let post_info:string = posts[<any>page];
          let title:string = post_info[<any>'title'];
          let blog:string = JSON.parse(feed)['title'];
          let thumbnail:string = post_info[<any>'thumbnail'];
          let thumbnail_alt:string = post_info[<any>'thumbnail_alt'];
          let thumbnail_sub:string = post_info[<any>'thumbnail_sub'];
          let author:string = JSON.parse(feed)['author']['name'];
          let content:string = post_info[<any>'content'];
          let date:string = post_info[<any>'date'];
          let build_content:contents={
            title:title,
            blog:blog,
            thumbnail:thumbnail,
            thumbnail_alt:thumbnail_alt,
            thumbnail_sub:thumbnail_sub,
            author:author,
            content:content,
            date:date,
          }
          return build_content;
        }else{
          return 0;
        }
      case 'guides':
        let guides:string = JSON.parse(feed)['guides'];
        let check_guides:Set<string> = new Set(Object.keys(guides));
        if(check_guides.has(page)){
          let guides_info:string = guides[<any>page];
          let title:string = guides_info[<any>'title'];
          let blog:string = JSON.parse(feed)['title'];
          let thumbnail:string = guides_info[<any>'thumbnail'];
          let thumbnail_alt:string = guides_info[<any>'thumbnail_alt'];
          let thumbnail_sub:string = guides_info[<any>'thumbnail_sub'];
          let author:string = JSON.parse(feed)['author']['name'];
          let content:string = guides_info[<any>'content'];
          let date:string = guides_info[<any>'date'];
          let build_content:contents={
            title:title,
            blog:blog,
            thumbnail:thumbnail,
            thumbnail_alt:thumbnail_alt,
            thumbnail_sub:thumbnail_sub,
            author:author,
            content:content,
            date:date
          }
          return build_content;
        }else{
          return 0;
        }
    }
    
    
  }
  GetBlog_Static(section:string){
    let feed:string
    try{
      feed = fs.readFileSync(<string>process.env.FEED_FILE,{encoding:"utf-8"});
    }catch(err){
      if(err.code == "ENOENT"){
        this.WriteFeedNew();
      }
    }finally{
      feed = fs.readFileSync(<string>process.env.FEED_FILE,{encoding:"utf-8"});
    }
    let posts:string = JSON.parse(feed)['posts'];
    let guides:string = JSON.parse(feed)['guides'];
    interface previews_content{
      type:string;
      title:string;
      description:string;
      thumbnail:string|undefined;
      thumbnail_alt:string|undefined;
      date:string;
    };
    interface previews{
      [post_ep:string]:previews_content;
    };
    interface posts_guides{
      posts_pv:string;
      guides_pv:string;
      endpoint:string;
      author:string;
      title:string;
    };
    let posts_preview:previews={};
    let guides_preview:previews={};
    
  
    Object.keys(posts).forEach((entries:any)=>{
      let posts_content:any = posts[entries];
      posts_preview[entries]={
        type:posts_content['type'],
        title:posts_content['title'],
        description:posts_content['description'],
        thumbnail:posts_content['thumbnail'],
        thumbnail_alt:posts_content['thumbnail_alt'],
        date:posts_content['date']
      }
    });
    Object.keys(guides).forEach((entries:any)=>{
      let guides_content:any = guides[entries];
      guides_preview[entries]={
        type:guides_content['type'],
        title:guides_content['title'],
        description:guides_content['description'],
        thumbnail:guides_content['thumbnail'],
        thumbnail_alt:guides_content['thumbnail_alt'],
        date:guides_content['date']
      }
    });
    
    let posts_guides:posts_guides;
    
    
    switch(section){
      case "all":
        posts_guides={
          posts_pv:JSON.stringify(posts_preview),
          guides_pv:JSON.stringify(guides_preview),
          endpoint:'/',
          author:JSON.parse(feed)['author']['name'],
          title:JSON.parse(feed)['title'],
        };
        return posts_guides;
      case "posts":
        posts_guides={
          posts_pv:JSON.stringify(posts_preview),
          guides_pv:"",
          endpoint:'/posts',
          author:JSON.parse(feed)['author']['name'],
          title:JSON.parse(feed)['title'],
        };
        return posts_guides;
      case "guides":
        posts_guides={
          posts_pv:"",
          guides_pv:JSON.stringify(guides_preview),
          endpoint:'/guides',
          author:JSON.parse(feed)['author']['name'],
          title:JSON.parse(feed)['title'],
        };
        return posts_guides;
    };
   
  };

  WriteFeedNew(){ 
    const fname:string|undefined = process.env.FEED_FILE;
    const author:string|undefined = process.env.AUTHOR;
    const email:string|undefined = process.env.AUTHOR_EMAIL;
    const blog_name:string|undefined = process.env.BLOG_NAME;
    const blog_url:string|undefined  = process.env.BLOG_BASE_URL;
    interface author_details{
      name:string|undefined;
      email:string|undefined;
    };
    interface feed_build{
      title:string|undefined;
      base_url:string|undefined;
      author:author_details;
      posts:object;
      guides:object;
    };
    const build:feed_build={
      title:blog_name,
      base_url:blog_url,
      author:{
        name:author,
        email:email
      },
      posts:{},
      guides:{}
    };
    fs.writeFileSync(<string>fname,JSON.stringify(build,null,2));
  }
  Write(content:any) {
    const feed_file:string|undefined = process.env.FEED_FILE;
    let fetch_feed:any;
    let posts:string;
    let guides:string;
    let content_type:string;
    let fname:string|undefined = process.env.FEED_FILE;
    try{
      fetch_feed = fs.readFileSync(<string>feed_file,{encoding:"utf-8"});
    }catch(err){
      if(err.code == "ENOENT"){
        this.WriteFeedNew();
      }
    }finally{
      fetch_feed = fs.readFileSync(<string>feed_file,{encoding:"utf-8"});
    }
    fetch_feed = JSON.parse(fetch_feed);
    content_type = content[Object.keys(content)[0]]['type'];
    let content_entries:string[] = Object.keys(content);
    let content_set:Set<string> = new Set(content_entries);

   
    if(content_type == "posts"){
      posts = fetch_feed['posts'];
        let posts_entries:string[] = Object.keys(posts);
        let post_set:Set<string> = new Set(posts_entries);
        for(let content_item of content_set){
          if(post_set.has(content_item)){
            fetch_feed['updated'] = content[content_item]['date'];
            fetch_feed['posts'][content_item] = content[content_item];
          }else{
            fetch_feed['updated'] = content[content_item]['date'];
            fetch_feed['posts'][content_item] = content[content_item];
          }
        }
    }
        
    if(content_type == "guides"){
      guides = fetch_feed['guides'];
        let guides_entries:string[] = Object.keys(guides);
        let guides_set:Set<string> = new Set(guides_entries);
        for(let content_item of content_set){
          if(guides_set.has(content_item)){
            fetch_feed['updated'] = content[content_item]['date'];
            fetch_feed['guides'][content_item] = content[content_item];
          }else{
            fetch_feed['updated'] = content[content_item]['date'];
            fetch_feed['guides'][content_item] = content[content_item];
          }
        }
    }
    
    fs.writeFileSync(<string>fname,JSON.stringify(fetch_feed,null,2));
  }

  Process(fname:string) {
    //HEADER CONFIGURATIONS
    const eof:string|undefined = process.env.EOF;
    const tpx:string|undefined = process.env.TITLE_PREFIX;
    const dpx:string|undefined = process.env.DESCRIPTION_PREFIX;
    const typ:string|undefined = process.env.TYPE_PREFIX;
    const thb:string|undefined = process.env.THUMBNAIL_PREFIX;
    const atb:string|undefined = process.env.THUMBNAIL_ALT_PREFIX;
    const tht:string|undefined = process.env.THUMBNAIL_SUBTEXT_PREFIX;
    const sep:string|undefined = process.env.SEPARATOR;

    let title:string;
    let description:string;
    let post_type:string | undefined;
    let thumbnail:string | undefined;
    let thumbnail_alt:string | undefined;
    let thumbnail_sub:string | undefined;
    //FILE READING
    const get_info:string[] = fs.readFileSync(fname,{encoding:"utf-8"}).split('\n');


    //HEADER REGEX DEFINITIONS
    let rgxeof:RegExp = new RegExp(`^${eof}`);
    let rgxttl:RegExp = new RegExp(`^${tpx}${sep}`);
    let rgxdsc:RegExp = new RegExp(`^${dpx}${sep}`);
    let rgxtyp:RegExp = new RegExp(`^${typ}${sep}`);
    let rgxthb:RegExp = new RegExp(`^${thb}${sep}`);
    let rgxtht:RegExp = new RegExp(`^${tht}${sep}`);
    let rgxatb:RegExp = new RegExp(`^${atb}${sep}`);
    let rgxlnk:RegExp = /\(([^)]+)\)>([^<]+)</g;
    let rgximg:RegExp = /\[(.*?)\]\((.*?)\)\$([^$]*)\$/g;
    let rgxqut:RegExp = /\@\"(.*?)\"\@\=(.*?)\=/g;
    let rgxsiz:RegExp = /\+{1,7}#(.*?)#\;/g;
    let rgxsty:RegExp = /\{\$([BIT]+)\$(.*?)\}/g;

    //IMPORTANT HEADERS LOOKUP AND VERIFICATION
    /*TITLE VERIFICATION*/
    if(!rgxttl.test(get_info[0])){ 
      return;
    }
    if(get_info[0].split(`${sep}`)[1].length < 1){
      return;
    }else{
      title=get_info[0].split(`${sep}`)[1];
    }
    /*DESCRIPTION VERIFICATION*/
    if(!rgxdsc.test(get_info[1])){ 
      return;
    }
    if(get_info[1].split(`${sep}`)[1].length < 1){
      return;
    }else{
      description=get_info[1].split(`${sep}`)[1];
    }
    /*POST TYPE VERIFICATION*/
    if(!rgxtyp.test(get_info[2])){
      return;
    }
    if(get_info[2].split(`${sep}`)[1].length < 1){
      return;
    }
    let allowed:string[] = ['posts','guides'];
    allowed.forEach(a=>{
      if(get_info[2].split(`${sep}`)[1] == a){
        post_type=a;
      }else{
        return;
      }
    });
    if(post_type == undefined){
      return;
    }  
    /*THUMBNAIL VERIFICATION*/
    if(rgxthb.test(get_info[3]) && rgxatb.test(get_info[4]) && rgxtht.test(get_info[5]) && get_info[3].split(`${sep}`)[1].length > 0 && get_info[4].split(`${sep}`)[1].length > 0 && get_info[5].split(`${sep}`)[1].length > 0){
      thumbnail = get_info[3].split(`${sep}`)[1];
      thumbnail_alt = get_info[4].split(`${sep}`)[1];
      thumbnail_sub = get_info[5].split(`${sep}`)[1];
    }
    /*EOF VERIFICATION*/
    if(!rgxeof.test(<string>get_info.at(-1))){
      return;
    }

    //HEADER STRIPPING
    let get_content:string[] = [];

    for(var i:number=0;i<Object.keys(get_info).length;i++){
      if(!rgxttl.test(get_info[i]) && !rgxdsc.test(get_info[i]) && !rgxtyp.test(get_info[i]) && !rgxeof.test(get_info[i]) && !rgxthb.test(get_info[i]) && !rgxatb.test(get_info[i]) && !rgxtht.test(get_info[i])){
        get_content.push(get_info[i]);
      }
    }
    //POST CONTENT FORMATTING
    for(var i:number=0;i<get_content.length;i++){
      if(get_content[i] == ''){
        get_content[i] = '<div id="p-sep"></div>';
      }else{
        get_content[i] = `<div id="post-content" class="relative text-lg font-thin text-mdg w-full sm:clear-both sm:text-justify">${get_content[i]}</div>`;
      }
    }
    let format_imgs:string[] = get_content.map((i) => {
      return i.replace(rgximg, (match: string, src: string, alt: string,img_subtext:string): string => {
        return `<img class="max-sm:min-w-[100px] sm:max-w-xl m-auto" src="${src}" alt="${alt}"><div class="text-center text-sm">${img_subtext}</div>`;
      });
    });
    
    let format_quotes:string[] = format_imgs.map((i) => {
      return i.replace(rgxqut, (match: string, qts: string,qta:string): string => {
        return `<div class="relative text-qut p-4 bg-qut m-auto max-w-[50em] font-bold font-serif hyphens-auto rounded-md m-2" lang="en"><p class="font-normal">${qts}</p>${qta}</div>`;
      });
    });
    let format_style:string[] = format_quotes.map((i) => {
      return i.replace(rgxsty, (match: string, styles: string,text:string): string => {
        let classes:string[] = [];
        let available_codes:Set<string> = new Set(['B','I','T']);
        let found_codes:string[] = styles.split('');
        let enumcodes:string[] = Object.keys(found_codes);
        
        if(enumcodes.length == 3){
          return <any>format_quotes;
        }
        let findB:number = found_codes.indexOf("B");
        let findT:number = found_codes.indexOf("T");
        if(findB != -1 && findT != -1 ){
          return <any>format_quotes;
        }
        found_codes.forEach(codes => {
          if(available_codes.has(codes)){
            switch(codes){
              case "B": 
                classes.push('font-bold');
                return;
              case "I":
                classes.push('italic');
                return;
              case "T":
                classes.push('font-thin');
                return;
            }
          }
        });
        return `<span class="${classes.join(" ")}">${text}</span>`;
      });
    });
    
    let format_sizes:string[] = format_style.map((i) => {
      return i.replace(rgxsiz, (match: string, sized_text: string): string => {
        let separate:string[] = match.split('+');
        let get_last:number = separate.indexOf(<string>separate.at(-1));
        if(get_last == 1){
          return `<p class="text-xl">${sized_text}</p>`;
        }else{
          return `<p class="text-${get_last}xl text-mdw my-4">${sized_text}</p>`;
        }
      });
    });
    
    let format_lnks:string[] = format_sizes.map((l) => {
      return l.replace(rgxlnk, (match: string, href: string, lnk: string): string => {
        return `<a href="${href}">${lnk}</a>`;
      });
    });
    
    //POST LISTING
    interface details_format{
      title:string;
      description:string;
      type:string;
      thumbnail:string|undefined;
      thumbnail_alt:string|undefined;
      thumbnail_sub:string|undefined;
      content:string;
      date:string;
    };
    interface details_iface{
      [name:string]:details_format;
    };
    
    let details:details_iface = {};
    let content:string = format_lnks.join('');
    let post_url:string = fname.split('/')[1].split(<string>process.env.PUBLISH_PREFIX)[1];
    let new_date:string = get_date();

    details[post_url]={
       title:title,
       description:description,
       type:post_type,
       thumbnail:thumbnail,
       thumbnail_alt:thumbnail_alt,
       thumbnail_sub:thumbnail_sub,
       content:content,
       date:new_date
    };
    
    this.Write(details);
}
    
  Watch() {
    const wf:string|undefined = process.env.WRITER;
    const publish:string|undefined = process.env.PUBLISH_PREFIX;
    chokidar.watch(`${wf}/`).on('all',(e,f)=>{
      switch(e){
        case "change":
          let rgxchg:RegExp = new RegExp(`${publish}`);
          if(rgxchg.test(<string>f)){
            this.Process(`${<string>f}`);
          }
      }
    });
  }
}
