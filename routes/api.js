const { default: axios } = require('axios');
var express = require('express');
var createError = require('http-errors');
var rotuer = express.Router();
//var { get_galleryids_for_query, get_galleryids_for_querys, get_galleryids_for_recent, get_galleryids_for_popular, get_galleryInfo_for_galleryid } = require('../search');
const hitomi = require('node-hitomi').default;
const db = require('better-sqlite3')('./tag.db', {verbose: console.log});

rotuer.get('/recent', (req, res, next) => {
    let page = req.query.page;
    if(!page) page = 1;

    hitomi.getIds({
        tags: {
            type:'language',
            name: 'korean'
        },
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
    /*get_galleryids_for_recent(page).then(result => {
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
    });*/
});

rotuer.get('/popular', (req, res, next) => {
    let page = req.query.page; 
    if(!page) page = 1;
    get_galleryids_for_popular(page).then(result => res.send(result));
})

rotuer.get('/search', async (req, res, next) => {
    let page = req.query.page;
    if(req.query.query == undefined){
        res.status(404);
        res.send([]);
        return;
    }
    if (!page) page = 1;
    get_galleryids_for_querys(req.query.query.replace(/ /g, '_').replace(/\|/g, ' ')).then((result) => {
        if (result.length == 0) res.status(404);
        else res.status(200);
        let cuttingResult = [];
        for(let i = ((page <= 1) ? 0 : 15 * (page - 1)); i < ((page <= 1) ? 15 : 15 * page); i++) cuttingResult.push(result[i]);
        cuttingResult = cuttingResult.filter(e => { return e != null; });
        res.send(cuttingResult);
    }).catch(() => {
        res.status(404);
        res.send([]);
        return;
    });
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
            if(translate) if(translate.korean) result.tags[i].name = translate.korean;
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