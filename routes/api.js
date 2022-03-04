const { default: axios } = require('axios');
var express = require('express');
var createError = require('http-errors');
var rotuer = express.Router();
const hitomi = require('node-hitomi').default;
const db = require('better-sqlite3')('./tag.db', {verbose: console.log});
let ready = false;
const ImageUrlResolver = new hitomi.ImageUrlResolver();
ImageUrlResolver.synchronize().then(() => ready = true);
const splitRex = /(artist|작가|female|male|character|캐릭|group|그룹|series|원작|type|종류|tag|태그|남|여|여성|남성):/g;

rotuer.get('/recent', (req, res, next) => {
    let page = req.query.page;
    if(!page) page = 1;

    hitomi.getIds({
        range: {
            startIndex: (page - 1) * 25,
            endIndex: (page - 1) * 25 + 24
        }
    }).then((result) => {
        result = result.sort((a, b) => b - a);
        if(result) {
            res.status(200);
            res.send({
                status: res.statusCode,
                result: result
            });
        }else{
            res.status(500);
            res.send({
                status: res.statusCode,
                result: '최근 작품을 가져올 수 없습니다.'
            });
        }
    })
});

rotuer.get('/popular', (req, res, next) => {
    let page = req.query.page; 
    if(!page) page = 1;
    get_galleryids_for_popular(page).then(result => res.send(result));
})

function parseTag(tags) {
    tags = tags.split('|');
    let result = [];
    for(let i in tags) {
        //if(!(Object.keys(tags[i]).includes('type') && Object.keys().includes('name'))) continue;
        let tagJSON = {};
        const type = tags[i].split(':')[0];
        const name = tags[i].split(splitRex)[2];
        const translateType = db.prepare('SELECT * FROM type WHERE korean = ?;').get(type);
        tagJSON.type = (translateType.english ? translateType.english : type);
        tagJSON.name = name;
        console.log(tagJSON)
        tagJSON = convertOriginalTag(tagJSON);
        result.push(tagJSON);
    }

    return result;
}
/**
 * return korean tag to english tag
 * @param {hitomi.Tag} tag 
 * @return {hitomi.Tag} Converted tag
 */
function convertOriginalTag(tag) {
    const result = db.prepare(`SELECT * FROM tags WHERE ${tag.type} = 1 AND korean = ?;`).get(tag.name);
    return {
        type: tag.type,
        name: (result ? result.english : tag.name).replace(/[-._!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/g, '-').replace(/ /g, `_`)
    }
}

rotuer.get('/search', async (req, res, next) => {
    let page = req.query.page;
    if(req.query.q == undefined){
        res.status(404);
        res.send([]);
        return;
    }
    if (!page) page = 1;
    const tags = parseTag(req.query.q);
    console.log(tags);
    hitomi.getIds({
        tags: tags,
        range: {
            startIndex: (page - 1) * 25,
            endIndex: (page - 1) * 25 + 24
        },
        reverseResult: true
    }).then(e => {
        res.json(e);
    })
});

rotuer.get('/autocomplete', (req, res) => {
    if(!req.query.q) req.query.q = '';
    if(req.query.q.trim().length == 0) {
        res.json([]);
    }
    let result = [];
    let type = '';
    if(req.query.q.includes(':')) {
        const translate = db.prepare('SELECT * FROM type WHERE korean = ? OR english = ?;').get(req.query.q.split(':')[0], req.query.q.split(':')[0]);
        if(translate.english) {
            type = `${translate.english} = 1 AND `;
            req.query.q = req.query.q.split(splitRex)[2]
        }
    }
    db.prepare(`SELECT * FROM tags WHERE ${type}(korean LIKE '%' || ? || '%' OR english LIKE '%' || ? || '%') LIMIT 25;`).all(req.query.q, req.query.q).forEach(row => {
        if(row.artist) {
            result.push('artist:' + row.english);
            result.push('작가:' + row.english);
            if(!row.korean) return;
            result.push('artist:' + row.korean);
            result.push('작가:' + row.korean);
        }
        if(row.group) {
            result.push('그룹:' + row.english);
            result.push('group:' + row.english);
            if(!row.korean) return;
            result.push('group:' + row.korean);
            result.push('그룹:' + row.korean);
        }
        if(row.character) {
            result.push('character:' + row.english);
            result.push('캐릭:' + row.english);
            if(!row.korean) return;
            result.push('character:' + row.korean);
            result.push('캐릭:' + row.korean);
        }
        if(row.series) {
            if(row.english.toLocaleLowerCase() == 'original') return;
            result.push('series:' + row.english);
            result.push('원작:' + row.english);
            if(!row.korean) return;
            result.push('series:' + row.korean);
            result.push('원작:' + row.korean);
        }
        if(row.tag) {
            result.push('태그:' + row.english);
            result.push('tag:' + row.english);
            if(!row.korean) return;
            result.push('tag:' + row.korean);
            result.push('태그:' + row.korean);
        }
        if(row.type) {
            result.push('종류:' + row.english);
            result.push('type:' + row.english);
            if(!row.korean) return;
            result.push('type:' + row.korean);
            result.push('종류:' + row.korean);
        }
        if(row.female) {
            result.push('female:'+row.english);
            result.push('여:'+row.english);
            if(!row.korean) return;
            result.push('female:'+row.korean);
            result.push('여:'+row.korean);
        }
        if(row.male) {
            result.push('male:'+row.english);
            result.push('남:'+row.english);
            if(!row.korean) return;
            result.push('male:'+row.korean);
            result.push('남:'+row.korean);
        }
    });
    res.json(result);
})

rotuer.get('/galleryinfo', (req, res, next) => {
    let galleryid = parseInt(req.query.id);
    
    hitomi.getGallery(galleryid).then(result => {
        
        let i = 0;
        result.artists.forEach(e => {
            let translate = db.prepare("SELECT * FROM tags WHERE artist = 1 AND english = ?;").get(e)
            //console.log(translate)
            if(translate) {
                if(translate.korean) result.artists[i] = translate.korean;
            }else db.prepare("INSERT INTO tags (english, artist) VALUES (?, 1);").run(e);
            i++;
        })

        i = 0;
        result.groups.forEach(e => {
            let translate = db.prepare("SELECT * FROM tags WHERE 'group' = 1 AND english = ?;").get(e)
            if(translate){ if(translate.korean) result.groups[i] = translate.korean;
            }else db.prepare("INSERT INTO tags (english, \"group\") VALUES (?, 1);").run(e);
            i++;
        })

        i = 0;
        result.series.forEach(e => {
            let translate = db.prepare("SELECT * FROM tags WHERE series = 1 AND english = ?;").get(e)
            //console.log(translate)
            if(translate) {if(translate.korean) result.series[i] = translate.korean;
            }else db.prepare("INSERT INTO tags (english, series) VALUES (?, 1);").run(e);
            i++;
        })

        i = 0;
        result.characters.forEach(e => {
            let translate = db.prepare("SELECT * FROM tags WHERE character = 1 AND english = ?;").get(e)
            //console.log(translate)
            if(translate){ if(translate.korean) result.characters[i] = translate.korean;
            }else db.prepare("INSERT INTO tags (english, character) VALUES (?, 1);").run(e);
            i++;
        })

        i = 0;
        result.tags.forEach(e => {
            let translate = db.prepare(`SELECT * FROM tags WHERE ${e.type} = 1 AND english = ?;`).get(e.name)
            //console.log(translate)
            if(translate) {
                if(translate.male) {
                    result.tags[i].type = '남';
                }else if(translate.female) {
                    result.tags[i].type = '여';
                }
                if(translate.korean) result.tags[i].name = translate.korean;
                
            }else db.prepare(`INSERT INTO tags (english, ${e.type}) VALUES (?, 1);`).run(e.name);
            i++;
        })

        res.json(result)
    });
})

rotuer.get('/getimage', async (req,res,next) => {
    if(!ready) await ImageUrlResolver.synchronize();
    const image = JSON.parse(req.query.image)
    const isThumb = (req.query.isThumb == 'true');
    const ext = (isThumb ? (image.hasAvif ? 'avif' : image.extension) : (((image.hasAvif) ? 'avif' : ((image.hasWebp) ? 'webp' : image.extension))));
    console.log(image, ext)
    const url = hitomi.getImageUrl(image, ext, {isThumbnail: isThumb})
    console.log(url);
    axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
            'Referer': "https://hitomi.la/"
        }
    }).then(response => {
        res.header('Content-Type', 'image/' + ext);
        res.send(Buffer.from(response.data, 'binary'));
    }).catch(e => {
        res.sendStatus(e.response.status);
    })
})

module.exports = rotuer;