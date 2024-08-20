"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Posts = void 0;
exports.sanitize = sanitize;
exports.get_date = get_date;
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const chokidar_1 = __importDefault(require("chokidar"));
dotenv_1.default.config();
function sanitize(text) {
    let rgxsntz = /[`~!@#$%^&*()|+\-=?;:'",.<>\{\}\[\]\\\/]/gi;
    return text.replace(rgxsntz, (match, sanitized) => {
        return sanitized;
    });
}
function get_date() {
    let date = new Date().toString().split(' ');
    let year = date[3];
    let month = date[1];
    let day = date[2];
    return `${day} of ${month} ${year}`;
}
class Posts {
    GetBlog(page, type) {
        let feed = fs_1.default.readFileSync(process.env.FEED_FILE, { encoding: "utf-8" });
        ;
        switch (type) {
            case 'posts':
                let posts = JSON.parse(feed)['posts'];
                let check_posts = new Set(Object.keys(posts));
                if (check_posts.has(page)) {
                    let post_info = posts[page];
                    let title = post_info['title'];
                    let blog = JSON.parse(feed)['title'];
                    let thumbnail = post_info['thumbnail'];
                    let thumbnail_alt = post_info['thumbnail_alt'];
                    let thumbnail_sub = post_info['thumbnail_sub'];
                    let author = JSON.parse(feed)['author']['name'];
                    let content = post_info['content'];
                    let date = post_info['date'];
                    let build_content = {
                        title: title,
                        blog: blog,
                        thumbnail: thumbnail,
                        thumbnail_alt: thumbnail_alt,
                        thumbnail_sub: thumbnail_sub,
                        author: author,
                        content: content,
                        date: date,
                    };
                    return build_content;
                }
                else {
                    return 0;
                }
            case 'guides':
                let guides = JSON.parse(feed)['guides'];
                let check_guides = new Set(Object.keys(guides));
                if (check_guides.has(page)) {
                    let guides_info = guides[page];
                    let title = guides_info['title'];
                    let blog = JSON.parse(feed)['title'];
                    let thumbnail = guides_info['thumbnail'];
                    let thumbnail_alt = guides_info['thumbnail_alt'];
                    let thumbnail_sub = guides_info['thumbnail_sub'];
                    let author = JSON.parse(feed)['author']['name'];
                    let content = guides_info['content'];
                    let date = guides_info['date'];
                    let build_content = {
                        title: title,
                        blog: blog,
                        thumbnail: thumbnail,
                        thumbnail_alt: thumbnail_alt,
                        thumbnail_sub: thumbnail_sub,
                        author: author,
                        content: content,
                        date: date
                    };
                    return build_content;
                }
                else {
                    return 0;
                }
        }
    }
    GetBlog_Static(section) {
        let feed;
        try {
            feed = fs_1.default.readFileSync(process.env.FEED_FILE, { encoding: "utf-8" });
        }
        catch (err) {
            if (err.code == "ENOENT") {
                this.WriteFeedNew();
            }
        }
        finally {
            feed = fs_1.default.readFileSync(process.env.FEED_FILE, { encoding: "utf-8" });
        }
        let posts = JSON.parse(feed)['posts'];
        let guides = JSON.parse(feed)['guides'];
        ;
        ;
        ;
        let posts_preview = {};
        let guides_preview = {};
        Object.keys(posts).forEach((entries) => {
            let posts_content = posts[entries];
            posts_preview[entries] = {
                type: posts_content['type'],
                title: posts_content['title'],
                description: posts_content['description'],
                thumbnail: posts_content['thumbnail'],
                thumbnail_alt: posts_content['thumbnail_alt'],
                date: posts_content['date']
            };
        });
        Object.keys(guides).forEach((entries) => {
            let guides_content = guides[entries];
            guides_preview[entries] = {
                type: guides_content['type'],
                title: guides_content['title'],
                description: guides_content['description'],
                thumbnail: guides_content['thumbnail'],
                thumbnail_alt: guides_content['thumbnail_alt'],
                date: guides_content['date']
            };
        });
        let posts_guides;
        switch (section) {
            case "all":
                posts_guides = {
                    posts_pv: JSON.stringify(posts_preview),
                    guides_pv: JSON.stringify(guides_preview),
                    endpoint: '/',
                    author: JSON.parse(feed)['author']['name'],
                    title: JSON.parse(feed)['title'],
                };
                return posts_guides;
            case "posts":
                posts_guides = {
                    posts_pv: JSON.stringify(posts_preview),
                    guides_pv: "",
                    endpoint: '/posts',
                    author: JSON.parse(feed)['author']['name'],
                    title: JSON.parse(feed)['title'],
                };
                return posts_guides;
            case "guides":
                posts_guides = {
                    posts_pv: "",
                    guides_pv: JSON.stringify(guides_preview),
                    endpoint: '/guides',
                    author: JSON.parse(feed)['author']['name'],
                    title: JSON.parse(feed)['title'],
                };
                return posts_guides;
        }
        ;
    }
    ;
    WriteFeedNew() {
        const fname = process.env.FEED_FILE;
        const author = process.env.AUTHOR;
        const email = process.env.AUTHOR_EMAIL;
        const blog_name = process.env.BLOG_NAME;
        const blog_url = process.env.BLOG_BASE_URL;
        ;
        ;
        const build = {
            title: blog_name,
            base_url: blog_url,
            author: {
                name: author,
                email: email
            },
            posts: {},
            guides: {}
        };
        fs_1.default.writeFileSync(fname, JSON.stringify(build, null, 2));
    }
    Write(content) {
        const feed_file = process.env.FEED_FILE;
        let fetch_feed;
        let posts;
        let guides;
        let content_type;
        let fname = process.env.FEED_FILE;
        try {
            fetch_feed = fs_1.default.readFileSync(feed_file, { encoding: "utf-8" });
        }
        catch (err) {
            if (err.code == "ENOENT") {
                this.WriteFeedNew();
            }
        }
        finally {
            fetch_feed = fs_1.default.readFileSync(feed_file, { encoding: "utf-8" });
        }
        fetch_feed = JSON.parse(fetch_feed);
        content_type = content[Object.keys(content)[0]]['type'];
        let content_entries = Object.keys(content);
        let content_set = new Set(content_entries);
        if (content_type == "posts") {
            posts = fetch_feed['posts'];
            let posts_entries = Object.keys(posts);
            let post_set = new Set(posts_entries);
            for (let content_item of content_set) {
                if (post_set.has(content_item)) {
                    fetch_feed['updated'] = content[content_item]['date'];
                    fetch_feed['posts'][content_item] = content[content_item];
                }
                else {
                    fetch_feed['updated'] = content[content_item]['date'];
                    fetch_feed['posts'][content_item] = content[content_item];
                }
            }
        }
        if (content_type == "guides") {
            guides = fetch_feed['guides'];
            let guides_entries = Object.keys(guides);
            let guides_set = new Set(guides_entries);
            for (let content_item of content_set) {
                if (guides_set.has(content_item)) {
                    fetch_feed['updated'] = content[content_item]['date'];
                    fetch_feed['guides'][content_item] = content[content_item];
                }
                else {
                    fetch_feed['updated'] = content[content_item]['date'];
                    fetch_feed['guides'][content_item] = content[content_item];
                }
            }
        }
        fs_1.default.writeFileSync(fname, JSON.stringify(fetch_feed, null, 2));
    }
    Process(fname) {
        //HEADER CONFIGURATIONS
        const eof = process.env.EOF;
        const tpx = process.env.TITLE_PREFIX;
        const dpx = process.env.DESCRIPTION_PREFIX;
        const typ = process.env.TYPE_PREFIX;
        const thb = process.env.THUMBNAIL_PREFIX;
        const atb = process.env.THUMBNAIL_ALT_PREFIX;
        const tht = process.env.THUMBNAIL_SUBTEXT_PREFIX;
        const sep = process.env.SEPARATOR;
        let title;
        let description;
        let post_type;
        let thumbnail;
        let thumbnail_alt;
        let thumbnail_sub;
        //FILE READING
        const get_info = fs_1.default.readFileSync(fname, { encoding: "utf-8" }).split('\n');
        //HEADER REGEX DEFINITIONS
        let rgxeof = new RegExp(`^${eof}`);
        let rgxttl = new RegExp(`^${tpx}${sep}`);
        let rgxdsc = new RegExp(`^${dpx}${sep}`);
        let rgxtyp = new RegExp(`^${typ}${sep}`);
        let rgxthb = new RegExp(`^${thb}${sep}`);
        let rgxtht = new RegExp(`^${tht}${sep}`);
        let rgxatb = new RegExp(`^${atb}${sep}`);
        let rgxlnk = /\(([^)]+)\)>([^<]+)</g;
        let rgximg = /\[(.*?)\]\((.*?)\)\$([^$]*)\$/g;
        let rgxqut = /\@\"(.*?)\"\@\=(.*?)\=/g;
        let rgxsiz = /\+{1,7}#(.*?)#\;/g;
        let rgxsty = /\{\$([BIT]+)\$(.*?)\}/g;
        //IMPORTANT HEADERS LOOKUP AND VERIFICATION
        /*TITLE VERIFICATION*/
        if (!rgxttl.test(get_info[0])) {
            return;
        }
        if (get_info[0].split(`${sep}`)[1].length < 1) {
            return;
        }
        else {
            title = get_info[0].split(`${sep}`)[1];
        }
        /*DESCRIPTION VERIFICATION*/
        if (!rgxdsc.test(get_info[1])) {
            return;
        }
        if (get_info[1].split(`${sep}`)[1].length < 1) {
            return;
        }
        else {
            description = get_info[1].split(`${sep}`)[1];
        }
        /*POST TYPE VERIFICATION*/
        if (!rgxtyp.test(get_info[2])) {
            return;
        }
        if (get_info[2].split(`${sep}`)[1].length < 1) {
            return;
        }
        let allowed = ['posts', 'guides'];
        allowed.forEach(a => {
            if (get_info[2].split(`${sep}`)[1] == a) {
                post_type = a;
            }
            else {
                return;
            }
        });
        if (post_type == undefined) {
            return;
        }
        /*THUMBNAIL VERIFICATION*/
        if (rgxthb.test(get_info[3]) && rgxatb.test(get_info[4]) && rgxtht.test(get_info[5]) && get_info[3].split(`${sep}`)[1].length > 0 && get_info[4].split(`${sep}`)[1].length > 0 && get_info[5].split(`${sep}`)[1].length > 0) {
            thumbnail = get_info[3].split(`${sep}`)[1];
            thumbnail_alt = get_info[4].split(`${sep}`)[1];
            thumbnail_sub = get_info[5].split(`${sep}`)[1];
        }
        /*EOF VERIFICATION*/
        if (!rgxeof.test(get_info.at(-1))) {
            return;
        }
        //HEADER STRIPPING
        let get_content = [];
        for (var i = 0; i < Object.keys(get_info).length; i++) {
            if (!rgxttl.test(get_info[i]) && !rgxdsc.test(get_info[i]) && !rgxtyp.test(get_info[i]) && !rgxeof.test(get_info[i]) && !rgxthb.test(get_info[i]) && !rgxatb.test(get_info[i]) && !rgxtht.test(get_info[i])) {
                get_content.push(get_info[i]);
            }
        }
        //POST CONTENT FORMATTING
        for (var i = 0; i < get_content.length; i++) {
            if (get_content[i] == '') {
                get_content[i] = '<div id="p-sep"></div>';
            }
            else {
                get_content[i] = `<div id="post-content" class="relative text-lg font-thin text-mdg w-full sm:clear-both sm:text-justify">${get_content[i]}</div>`;
            }
        }
        let format_imgs = get_content.map((i) => {
            return i.replace(rgximg, (match, src, alt, img_subtext) => {
                return `<img class="max-sm:min-w-[100px] sm:max-w-xl m-auto" src="${src}" alt="${alt}"><div class="text-center text-sm">${img_subtext}</div>`;
            });
        });
        let format_quotes = format_imgs.map((i) => {
            return i.replace(rgxqut, (match, qts, qta) => {
                return `<div class="relative text-qut p-4 bg-qut m-auto max-w-[50em] font-bold font-serif hyphens-auto rounded-md m-2" lang="en"><p class="font-normal">${qts}</p>${qta}</div>`;
            });
        });
        let format_style = format_quotes.map((i) => {
            return i.replace(rgxsty, (match, styles, text) => {
                let classes = [];
                let available_codes = new Set(['B', 'I', 'T']);
                let found_codes = styles.split('');
                let enumcodes = Object.keys(found_codes);
                if (enumcodes.length == 3) {
                    return format_quotes;
                }
                let findB = found_codes.indexOf("B");
                let findT = found_codes.indexOf("T");
                if (findB != -1 && findT != -1) {
                    return format_quotes;
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
        let format_sizes = format_style.map((i) => {
            return i.replace(rgxsiz, (match, sized_text) => {
                let separate = match.split('+');
                let get_last = separate.indexOf(separate.at(-1));
                if (get_last == 1) {
                    return `<p class="text-xl">${sized_text}</p>`;
                }
                else {
                    return `<p class="text-${get_last}xl text-mdw my-4">${sized_text}</p>`;
                }
            });
        });
        let format_lnks = format_sizes.map((l) => {
            return l.replace(rgxlnk, (match, href, lnk) => {
                return `<a href="${href}">${lnk}</a>`;
            });
        });
        ;
        ;
        let details = {};
        let content = format_lnks.join('');
        let post_url = fname.split('/')[1].split(process.env.PUBLISH_PREFIX)[1];
        let new_date = get_date();
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
    Watch() {
        const wf = process.env.WRITER;
        const publish = process.env.PUBLISH_PREFIX;
        chokidar_1.default.watch(`${wf}/`).on('all', (e, f) => {
            switch (e) {
                case "change":
                    let rgxchg = new RegExp(`${publish}`);
                    if (rgxchg.test(f)) {
                        this.Process(`${f}`);
                    }
            }
        });
    }
}
exports.Posts = Posts;
