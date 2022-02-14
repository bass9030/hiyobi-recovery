var express = require('express');
var router = express.Router();
//const hitomi = require('../search');
const ejs = require('ejs');
const fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
    /*hitomi.get_galleryids_for_recent(((req.query.page) ? req.query.page : 1)).then(result => {
        let render = [];
        new Promise(async (resolve) => {
            for(let i in result) {
                let e = result[i];
                console.log(result);
                console.log(e);
                let galleryinfo = await hitomi.get_galleryInfo_for_galleryid(e);
                render.push(ejs.render(fs.readFileSync('./views/card.ejs', 'utf-8'), {
                    thumbnail: galleryinfo.thumbnail,
                    title: galleryinfo.title,
                    type: galleryinfo.type,
                    characters: galleryinfo.characters.map(f => {
                        return '<a class="other-tag" href="/search?query=character:' + f + '">' + f + '</a>'
                    }).join(''),
                    page: galleryinfo.images.length,
                    artists: galleryinfo.artists.map(f => {
                        return '<a class="other-tag" href="/search?query=artist:' + f + '">' + f + '</a>'
                    }).join(''),
                    groups: galleryinfo.groups.map(f => {
                        return '<a class="other-tag" href="/search?query=group:' + f + '">' + f + '</a>'
                    }).join(''),
                    original: galleryinfo.series.map(f => {
                        return '<a class="other-tag" href="/search?query=series:' + f + '">' + f + '</a>'
                    }).join(''),
                    tags: galleryinfo.tags.map(f => {
                        if(f.female) return '<a class="tag" gender="female" href="/search?query=female:' + f.tag+'">female:' + f.tag + '</a>';
                        else if(f.male) return '<a class="tag" gender="male" href="/search?query=male:' + f.tag+'">male:' + f.tag + '</a>';
                        else return '<a class="tag" href="/search?query=tag:' + f.tag + '">tag:' + f.tag + '</a>';
                    }).join('')
                }));
            }
            resolve();
        }).then(() => {
            res.render('index', { 
                title: 'RE:hiyobi',
                content: render.join('\n')
            });
        });
    })*/
    res.render('index', {
        title: 'Re:hiyobi',
	    page: req.query.page
    });
});

module.exports = router;
