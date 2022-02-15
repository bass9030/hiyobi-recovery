const { default: axios } = require('axios');
var express = require('express');
var createError = require('http-errors');
var rotuer = express.Router();
//var { get_galleryids_for_query, get_galleryids_for_querys, get_galleryids_for_recent, get_galleryids_for_popular, get_galleryInfo_for_galleryid } = require('../search');
const hitomi = require('node-hitomi').default;
const db = require('better-sqlite3')('./tag.db', {verbose: console.log});

const splitRex = /(artist|female|male|character|group|series|type|tag|남|여|여성|남성):/g;

rotuer.get('/recent', (req, res, next) => {
    let page = req.query.page;
    if(!page) page = 1;

    hitomi.getIds({
        range: {
            startIndex: (page - 1) * 20,
            endIndex: (page - 1) * 20 + 19
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
        const type = tags[i];
        const name = tags[i].split(splitRex)[2];
        switch(type.split(':')[0]) {
            case 'female':
            case '여':
                tagJSON.type = 'female'
                break;
            case 'male':
            case '남':
                tagJSON.type = 'male'
                break;

            default:
                tagJSON.type = tags[i].split(':')[0];
                break
        }
        tagJSON.name = name;
        tagJSON = convertOriginalTag(tagJSON);
        result.push(tagJSON);
    }

    return result;
}
/**
 * return korean tag to english tag
 * @param {hitomi.Tag} tag 
 * @param {hitomi.Tag} Converted tag
 */
function convertOriginalTag(tag) {
    let type;
    switch(tag.type) {
        case '여':
        case '여성':
            type = 'female'
            break;
        case '남':
        case '남성': 
            type = 'male'
            break;
        default:
            type = tag.type
            break;
    }
    const result = db.prepare(`SELECT * FROM tags WHERE ${type} = 1 AND korean = ?;`).get(tag.name);
    return {
        type: type,
        name: result.english.replace(/[-._!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/g, '-').replace(/ /g, `_`)
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
            startIndex: (page - 1) * 20,
            endIndex: (page - 1) * 20 + 19
        }
    }).then(e => {
        res.json(e);
    })
});

rotuer.get('/galleryinfo', (req, res, next) => {
    let galleryid = parseInt(req.query.id);
    
    hitomi.getGallery(galleryid).then(result => {
        
        let i = 0;
        result.artists.forEach(e => {
            let translate = db.prepare("SELECT * FROM tags WHERE artist = 1 AND english = ?;").get(e)
            //console.log(translate)
            if(translate) if(translate.korean) result.artists[i] = translate.korean;
            i++;
        })

        i = 0;
        result.groups.forEach(e => {
            let translate = db.prepare("SELECT * FROM tags WHERE 'group' = 1 AND english = ?;").get(e)
            if(translate) if(translate.korean) result.groups[i] = translate.korean;
            i++;
        })

        i = 0;
        result.series.forEach(e => {
            let translate = db.prepare("SELECT * FROM tags WHERE series = 1 AND english = ?;").get(e)
            //console.log(translate)
            if(translate) if(translate.korean) result.series[i] = translate.korean;
            i++;
        })

        i = 0;
        result.characters.forEach(e => {
            let translate = db.prepare("SELECT * FROM tags WHERE character = 1 AND english = ?;").get(e)
            //console.log(translate)
            if(translate) if(translate.korean) result.characters[i] = translate.korean;
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
            }
            i++;
        })

        res.json(result)
    });
})

rotuer.get('/getimage', (req,res,next) => {
    axios.get(req.query.url, {
        responseType: 'arraybuffer',
        headers: {
            'Referer': "https://hitomi.la/reader/" + req.query.galid + ".html"
        }
    }).then(response => {
        res.send(Buffer.from(response.data, 'binary').toString('base64'));
    })
})

module.exports = rotuer;