const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const hitomi = require('node-hitomi').default;


router.get('/:galleryid', (req, res, next) => {
    console.log(req.params.galleryid);
    if(isNaN(parseInt(req.params.galleryid))) next(createError(404));
    /*let result = {'title': 'test'};
    res.render('reader', {
        galinfo : result
    });*/
    hitomi.getGallery(parseInt(req.params.galleryid)).then(result => {
        res.render('reader', {
            galinfo : result,
        });
    }).catch(() => createError(404));
});

module.exports = router;
