import crypto from "crypto";
import dotenv from "dotenv";
import {connect} from './database';
import { Connection, QueryError } from "mysql2";

dotenv.config();
export function sanitize(text: string) {
  let rgxsntz: RegExp = /[`~!@#$%^&*()|+\-=?;:'",.<>\{\}\[\]\\\/]/gi;
  return text.replace(rgxsntz, (match: string, sanitized: string): string => {
    return sanitized;
  });
}

export function get_date() {
  let date: string[] = new Date().toString().split(' ');
  let year: string = date[3];
  let month: string = date[1];
  let day: string = date[2];
  return `${day} of ${month} ${year}`;
}
export function notify(notification:unknown,type:number){
    let types:Set<number> = new Set([1,2,3]);
    let notif_types:string[] = ['ERROR!','SUCCESS!','INFO!'];
    let valid_color:number;
    let notif:string;
    if(!types.has(type)){
      return;
    }
    switch(type){
      case 1:
        valid_color=16726072;
        notif=notif_types[0];
      case 2:
        valid_color=5832543;
        notif=notif_types[1];
      case 3:
        valid_color=47359;
        notif=notif_types[2];
    }
    fetch(<string>process.env.HOOK,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        "content": null,
        "embeds": [
          {
            "description": `\`\`\`${notification}\`\`\``,
            "color": valid_color!,
            "author": {
              "name": notif!
            },
            "footer": {
              "text": `${get_date()}`
            }
          }
        ],
        "attachments": []
      })
    }).catch((err:any)=>{
      console.log('Fetch error.');
    })
  
  
  }
export class Posts {
  private async useDB(query:string,prepared:string[]=[]){
    try{
      let conn:Connection|boolean = await connect();
      if(!conn){
        return;
      }
      return new Promise((resolve,rej)=>{
        conn.query(query,prepared,(err,res)=>{
          if(err){
            rej(err);
            return false;
          }else{
            resolve(res);
             
          }
        }).on('end',()=>{  
          conn.end((err:QueryError)=>{
            if(typeof(err) != "undefined"){
              notify(`DBERR: ${err.stack}\nERRNO: ${err.errno}`,1);
              return false;
            }
          });
        });
      });
    }catch(err){
      notify(`DBERR: ${err.stack}\nERRNO: ${err.errno}`,1);
      return false;
    }
    
  }
  public async GetBlog(page: string, type: string) {
    
    let valid_types:Set<string> = new Set(['posts','guides']);
    if(!valid_types.has(type)){
      return 0;
    }
    let get_blog_query:string = 'SELECT ??.*, basic.author FROM ?? JOIN `basic` ON basic.title = ? AND ??.fname=?;';
    let get_blog_prepare:string[] = [type,type,<string>process.env.BLOG_NAME,type,page];
    let get_blog:any|undefined = JSON.parse(JSON.stringify(await this.useDB(get_blog_query,get_blog_prepare)))[0];
    if(!get_blog){
      return 0;
    }

    if(get_blog['thumbnail'] == "undefined"){
      get_blog['thumbnail']=undefined;
    }
    if(get_blog['thumbnail_alt'] == "undefined"){
      get_blog['thumbnail_alt']=undefined;
    }
    if(get_blog['thumbnail_subtext'] == "undefined"){
      get_blog['thumbnail_subtext']=undefined;
    }
    
    
    interface contents {
      title: string;
      description: string;
      blog: string;
      thumbnail: string | undefined;
      thumbnail_alt: string | undefined;
      thumbnail_sub: string | undefined;
      author: string;
      content: string;
      date: string;
    }
    let build_content:contents={
      title:get_blog['title'],
      description:get_blog['desc'],
      blog:<string>process.env.BLOG_NAME,
      thumbnail:get_blog['thumbnail'],
      thumbnail_alt:get_blog['thumbnail_alt'],
      thumbnail_sub:get_blog['thumbnail_subtext'],
      author:get_blog['author'],
      content:get_blog['content'],
      date:get_blog['timestamp']
    }

    return build_content;
  }

  private Build_Individual_Preview(info:string){
    interface previews_content {
      type: string;
      title: string;
      description: string;
      thumbnail: string | undefined;
      thumbnail_alt: string | undefined;
      date: string;
    };
    interface previews {
      [post_ep: string]: previews_content;
    };
    let template:previews = {};
    Object.keys(JSON.parse(info)).forEach((idx:string)=>{
      let result:any = JSON.parse(info)[idx];
      let path:string = result['fname'];
      if(result['thumbnail'] == "undefined" && result['thumbnail_alt'] == "undefined"){
        result['thumbnail']=undefined;
        result['thumbnail_alt']=undefined;
      }
      template[path]={
        type:result['type'],
        title:result['title'],
        description:result['desc'],
        thumbnail:result['thumbnail'],
        thumbnail_alt:result['thumbnail_alt'],
        date:result['timestamp']
      }
    })
    return template;
  }
  public async GetBlog_Static(section: string) {
    interface posts_guides {
      posts_pv: string;
      guides_pv: string;
      endpoint: string;
      author: string;
      title: string;
    };
    let options:Set<string> = new Set(['all','posts','guides']);
    if(!options.has(section)){
      return 0;
    } 
    let get_posts_query:string = 'SELECT * FROM `posts`';
    let get_guides_query:string = 'SELECT * FROM `guides`';
    let get_basics_query:string = 'SELECT * FROM `basic`';
    let get_posts:unknown;
    let get_guides:unknown;
    let get_basics:unknown = await this.useDB(get_basics_query);
    let posts:object = {};
    let guides:object = {};
    let author:string;
    let title:string;
    try{
      author = JSON.parse(JSON.stringify(get_basics))[0]['author'];
      title = JSON.parse(JSON.stringify(get_basics))[0]['title'];
    }catch(err){
      notify(`DBERR: ${err.stack}\nERRNO: ${err.errno}`,1);
      return 0;
    }
    
    let posts_guides:posts_guides;
   
    switch(section){
      case "all":
        get_posts = await this.useDB(get_posts_query);
        get_guides = await this.useDB(get_guides_query);
        
        if(!get_posts || !get_guides || !get_basics){
          return;
        }
        if(Object.keys(get_posts).length > 0){
          posts = this.Build_Individual_Preview(JSON.stringify(get_posts));
        }
        if(Object.keys(get_guides).length > 0){
          guides = this.Build_Individual_Preview(JSON.stringify(get_guides));
        }
        posts_guides={
          posts_pv:JSON.stringify(posts),
          guides_pv:JSON.stringify(guides),
          endpoint:'/',
          author:author,
          title:title
        }
        return posts_guides;
    
      case "posts":
        get_posts = await this.useDB(get_posts_query);
        if(!get_posts){
          return;
        }
        if(Object.keys(get_posts).length > 0){
          posts = this.Build_Individual_Preview(JSON.stringify(get_posts));
        }
        posts_guides={
          posts_pv:JSON.stringify(posts),
          guides_pv:JSON.stringify(guides),
          endpoint:'/posts',
          author:author,
          title:title
        }
        return posts_guides;

      case "guides":
        get_guides = await this.useDB(get_guides_query);
        if(!get_guides){
          return;
        }
        if(Object.keys(get_guides).length > 0){
          posts = this.Build_Individual_Preview(JSON.stringify(get_guides));
        }
        posts_guides={
          posts_pv:JSON.stringify(posts),
          guides_pv:JSON.stringify(guides),
          endpoint:'/guides',
          author:author,
          title:title
        }
        return posts_guides;
    }
  };

  private async Write(content: any) {
    if(typeof(content['unpublish']) != 'undefined'){
      let path:string=content['unpublish'];
      let type:string=content['type'];
      let verify_path:string = 'SELECT `fname` FROM ?? WHERE `fname`=?';
      let prepare_verif_path:string[] = [type,path];
      
      let get_existing:unknown = await this.useDB(verify_path,prepare_verif_path);
      if(!get_existing){
        notify('Error unpublishing.',1);
        return;
      }
      if(Object.keys(<string[]>get_existing).length > 0){
        let types:Set<string> = new Set(['posts','guides']);
        if(types.has(type)){
          let unpublish_query:string = 'DELETE FROM ?? WHERE `fname`=?';
          let unpub_prepare:string[] = [type,path];
          if(!this.useDB(unpublish_query,unpub_prepare)){
            notify('Error unpublishing.',1);
            return;
          }else{
            notify(`${path} successfully unpublished on ${type}`,2);
            return;
          }
          
        }else{
          notify('Type not valid.',1);
          return;
        }
      }
    }
    let path:string = Object.keys(content)[0];
    let title:string = content[path]['title'];
    let desc:string = content[path]['description'];
    let type:string = content[path]['type'];
    let thumbnail:string|undefined = content[path]['thumbnail'];
    let thumbnail_alt:string|undefined = content[path]['thumbnail_alt'];
    let thumbnail_sub:string|undefined = content[path]['thumbnail_sub'];
    let content_:string = content[path]['content'];
    let date:string = content[path]['date'];
    

    if(typeof(thumbnail) == "undefined"){
      thumbnail="undefined";
    }
    if(typeof(thumbnail_alt) == "undefined"){
      thumbnail_alt="undefined";
    }
    if(typeof(thumbnail_sub) == "undefined"){
      thumbnail_sub="undefined";
    }
    let verify_path:string = 'SELECT `fname` FROM ?? WHERE `fname`=?';
    let prepare_verif_path:string[] = [type,path];
    let get_existing:unknown = await this.useDB(verify_path,prepare_verif_path);
    if(!get_existing){
      notify('Could not post. Error on lookup.',1);
      return;
    }
    if(Object.keys(get_existing).length == 0){
      let types:Set<string> = new Set(['posts','guides']);
      if(types.has(type)){
        let insert_post:string = 'INSERT INTO ?? (`fname`,`title`,`desc`,`type`,`thumbnail`,`thumbnail_alt`,`thumbnail_subtext`,`content`,`timestamp`) VALUES(?,?,?,?,?,?,?,?,?)';
        let insert_prepare:string[] = [type,path,title,desc,type,thumbnail,thumbnail_alt,thumbnail_sub,content_,date];
        let post:unknown = await this.useDB(insert_post,insert_prepare);
        if(!post){
          notify('Could not post. Error on insertion.',1);
          return;
        }
        notify(`Posted ${path} successfully on ${type}.`,2);
        return;
      }
    }else{
    let types:Set<string> = new Set(['posts','guides']);
    if(types.has(type)){
      let insert_post:string = 'UPDATE ?? SET `fname`=?,`title`=?,`desc`=?,`type`=?,`thumbnail`=?,`thumbnail_alt`=?,`thumbnail_subtext`=?,`content`=?, `timestamp`=?  WHERE `fname`=?';
      let insert_prepare:string[] = [type,path,title,desc,type,thumbnail,thumbnail_alt,thumbnail_sub,content_,date,path];
      let insert_update:unknown = this.useDB(insert_post,insert_prepare);
      if(!insert_update){
        notify('Could not update post. Error on update.',1);
        return;
      }
      notify(`Updated ${path} successfully on ${type}.`,2);
      return;
      }
    }
  }
  private Process(fetched_content: string) {

    //HEADER CONFIGURATIONS
    const eof: string | undefined = process.env.EOF;
    const fnm: string | undefined = process.env.FILENAME_PREFIX;
    const tpx: string | undefined = process.env.TITLE_PREFIX;
    const dpx: string | undefined = process.env.DESCRIPTION_PREFIX;
    const typ: string | undefined = process.env.TYPE_PREFIX;
    const thb: string | undefined = process.env.THUMBNAIL_PREFIX;
    const atb: string | undefined = process.env.THUMBNAIL_ALT_PREFIX;
    const tht: string | undefined = process.env.THUMBNAIL_SUBTEXT_PREFIX;
    const sep: string | undefined = process.env.SEPARATOR;

    let fname: string;
    let title: string;
    let description: string;
    let post_type: string | undefined;
    let thumbnail: string | undefined;
    let thumbnail_alt: string | undefined;
    let thumbnail_sub: string | undefined;

    //FILE READING
    const pre_info: string[] = fetched_content.split('\n');
    const get_info: string[] = [];

    pre_info.forEach(entry => {
      get_info.push(entry.replace('\r', ''));
    })
    //HEADER REGEX DEFINITIONS
    let rgxeof: RegExp = new RegExp(`^${eof}`);
    let rgxfnm: RegExp = new RegExp(`^${fnm}${sep}`);
    let rgxttl: RegExp = new RegExp(`^${tpx}${sep}`);
    let rgxdsc: RegExp = new RegExp(`^${dpx}${sep}`);
    let rgxtyp: RegExp = new RegExp(`^${typ}${sep}`);
    let rgxthb: RegExp = new RegExp(`^${thb}${sep}`);
    let rgxtht: RegExp = new RegExp(`^${tht}${sep}`);
    let rgxatb: RegExp = new RegExp(`^${atb}${sep}`);
    let rgxlnk: RegExp = /\(([^)]+)\)>([^<]+)</g;
    let rgximg: RegExp = /\[(.*?)\]\((.*?)\)\$([^$]*)\$/g;
    let rgxqut: RegExp = /\@\"(.*?)\"\@\=(.*?)\=/g;
    let rgxsiz: RegExp = /\+{1,7}#(.*?)#\;/g;
    let rgxsty: RegExp = /\{\$([BIT]+)\$(.*?)\}/g;

    //IMPORTANT HEADERS LOOKUP AND VERIFICATION
    /*PUBLISH STATUS VERIFICATION*/
    if (get_info[0] == process.env.UNPUBLISH_PREFIX && rgxfnm.test(get_info[1]) && rgxeof.test(<string>get_info.at(-1))) {
      interface unpublish {
        unpublish: string;
        type: string;
      };
      let unpub: unpublish = {
        unpublish: get_info[1].split(`${sep}`)[1],
        type: get_info[4].split(`${sep}`)[1]
      }
      this.Write(unpub);
      return;
    }
    /*FILENAME VERIFICATION*/
    if (!rgxfnm.test(get_info[0])) {
      return;
    }
    if (get_info[0].split(`${sep}`)[1].length < 1) {
      return;
    } else {
      fname = get_info[0].split(`${sep}`)[1];
    }
    /*TITLE VERIFICATION*/
    if (!rgxttl.test(get_info[1])) {
      return;
    }
    if (get_info[1].split(`${sep}`)[1].length < 1) {
      return;
    } else {
      title = get_info[1].split(`${sep}`)[1];
    }
    /*DESCRIPTION VERIFICATION*/
    if (!rgxdsc.test(get_info[2])) {
      return;
    }
    if (get_info[2].split(`${sep}`)[1].length < 1) {
      return;
    } else {
      description = get_info[2].split(`${sep}`)[1];
    }

    /*POST TYPE VERIFICATION*/
    if (!rgxtyp.test(get_info[3])) {
      return;
    }
    if (get_info[3].split(`${sep}`)[1].length < 1) {
      return;
    }
    let allowed: string[] = ['posts', 'guides'];
    allowed.forEach(a => {
      if (get_info[3].split(`${sep}`)[1] == a) {
        post_type = a;
      } else {
        return;
      }
    });
    if (post_type == undefined) {
      return;
    }
    /*THUMBNAIL VERIFICATION*/
    if (rgxthb.test(get_info[4]) && rgxatb.test(get_info[5]) && rgxtht.test(get_info[6]) && get_info[4].split(`${sep}`)[1].length > 0 && get_info[5].split(`${sep}`)[1].length > 0 && get_info[6].split(`${sep}`)[1].length > 0) {
      thumbnail = get_info[4].split(`${sep}`)[1];
      thumbnail_alt = get_info[5].split(`${sep}`)[1];
      thumbnail_sub = get_info[6].split(`${sep}`)[1];
    }
    /*EOF VERIFICATION*/
    if (!rgxeof.test(<string>get_info.at(-1))) {
      return;
    }

    //HEADER STRIPPING
    let get_content: string[] = [];

    for (var i: number = 0; i < Object.keys(get_info).length; i++) {
      if (!rgxfnm.test(get_info[i]) && !rgxttl.test(get_info[i]) && !rgxdsc.test(get_info[i]) && !rgxtyp.test(get_info[i]) && !rgxeof.test(get_info[i]) && !rgxthb.test(get_info[i]) && !rgxatb.test(get_info[i]) && !rgxtht.test(get_info[i])) {
        get_content.push(get_info[i]);
      }
    }
    //POST CONTENT FORMATTING
    for (var i: number = 0; i < get_content.length; i++) {
      if (get_content[i] == '') {
        get_content[i] = '<div id="p-sep"></div>';
      } else {
        get_content[i] = `<div id="post-content" class="relative text-lg font-thin text-mdg w-full sm:clear-both sm:text-justify">${get_content[i]}</div>`;
      }
    }
    let format_imgs: string[] = get_content.map((i) => {
      return i.replace(rgximg, (match: string, src: string, alt: string, img_subtext: string): string => {
        return `<img class="max-sm:min-w-[100px] sm:max-w-xl m-auto" src="${src}" alt="${alt}"><div class="text-center text-sm">${img_subtext}</div>`;
      });
    });

    let format_quotes: string[] = format_imgs.map((i) => {
      return i.replace(rgxqut, (match: string, qts: string, qta: string): string => {
        return `<div class="relative text-qut p-4 bg-qut m-auto max-w-[50em] font-bold font-serif hyphens-auto rounded-md m-2" lang="en"><p class="font-normal">${qts}</p>${qta}</div>`;
      });
    });
    let format_style: string[] = format_quotes.map((i) => {
      return i.replace(rgxsty, (match: string, styles: string, text: string): string => {
        let classes: string[] = [];
        let available_codes: Set<string> = new Set(['B', 'I', 'T']);
        let found_codes: string[] = styles.split('');
        let enumcodes: string[] = Object.keys(found_codes);

        if (enumcodes.length == 3) {
          return <any>format_quotes;
        }
        let findB: number = found_codes.indexOf("B");
        let findT: number = found_codes.indexOf("T");
        if (findB != -1 && findT != -1) {
          return <any>format_quotes;
        }
        found_codes.forEach(codes => {
          if (available_codes.has(codes)) {
            switch (codes) {
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

    let format_sizes: string[] = format_style.map((i) => {
      return i.replace(rgxsiz, (match: string, sized_text: string): string => {
        let separate: string[] = match.split('+');
        let get_last: number = separate.indexOf(<string>separate.at(-1));
        if (get_last == 1) {
          return `<p class="text-xl">${sized_text}</p>`;
        } else {
          return `<p class="text-${get_last}xl text-mdw my-4">${sized_text}</p>`;
        }
      });
    });

    let format_lnks: string[] = format_sizes.map((l) => {
      return l.replace(rgxlnk, (match: string, href: string, lnk: string): string => {
        return `<a href="${href}">${lnk}</a>`;
      });
    });

    //POST LISTING
    interface details_format {
      title: string;
      description: string;
      type: string;
      thumbnail: string | undefined;
      thumbnail_alt: string | undefined;
      thumbnail_sub: string | undefined;
      content: string;
      date: string;
    };
    interface details_iface {
      [name: string]: details_format;
    };

    let details: details_iface = {};
    let content: string = format_lnks.join('');
    let post_url: string = fname;

    let new_date: string = get_date();

    details[post_url] = {
      title: title,
      description: description,
      type: post_type,
      thumbnail: thumbnail,
      thumbnail_alt: thumbnail_alt,
      thumbnail_sub: thumbnail_sub,
      content: content,
      date: new_date
    };

    this.Write(details);
  }
  private async Fetch(code: string) {
    return await fetch(`${<string>process.env.PUBLISHED}${code}`).catch((err:any)=>{notify(`POST FETCH ERR:\n${err}`,1)});
  }
  public async Auth(info: string, provided_key: string) {
    let hash = crypto.createHash(<string>process.env.ALGORITHM).update(provided_key).digest('hex');
    if (hash != process.env.KEY) {
      notify(`AUTH ERR: ${info} - ${provided_key}`,1);
      return 0;
    }

    let content: any = await this.Fetch(info);
    if (content == 'Failed') {
      return 0;
    }
    try{
      let content_text: string|undefined = await content.text();
      this.Process(<string>content_text);
    }catch(err){
      notify(`CONTENT ERR:\nCONTENT:\n${content}\nINFO:\n${info}`,1);
      return 0;
    }
    
    
    

  }
}
