var express = require('express');
var router = express.Router();
//const hitomi = require('../search');
const ejs = require('ejs');
const fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Re:hiyobi',
	    page: req.query.page
    });
});

module.exports = router;
