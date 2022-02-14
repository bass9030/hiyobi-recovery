const express = require('express');
const createError = require('http-errors');
const router = express.Router();
//const hitomi = require('../search');


router.get('/:galleryid', (req, res, next) => {
    if(!req.params.galleryid) next(createError(404));
    /*let result = {'title': 'test'};
    res.render('reader', {
        galinfo : result
    });*/
    hitomi.get_galleryInfo_for_galleryid(req.params.galleryid).then(result => {
        res.render('reader', {
            galinfo : result,
            galid: req.params.galleryid
        });
    }).catch(() => createError(404));
});

module.exports = router;
