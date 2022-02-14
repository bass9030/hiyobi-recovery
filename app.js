var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//var hitomi = require('./search');

var indexRouter = require('./routes/index');
var readerRouter = require('./routes/reader');
var apiRouter = require('./routes/api');
var searchRouter = require('./routes/search');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/reader', readerRouter)
app.use('/search', searchRouter)
app.use('/api', apiRouter)

app.get('/test', (req, res) => {
    hitomi.get_galleryInfo_for_galleryid(1800988, true).then(result => {
        res.render('card', {
            thumbnail: result.thumbnail,
            title: result.title,
            type: result.type,
            characters: result.characters.map(e => {
                return '<a class="other-tag" href="/search?query=character:' + e + '">' + e + '</a>'
            }).join(''),
            page: result.images.length,
            artists: result.artists.map(e => {
                return '<a class="other-tag" href="/search?query=artist:' + e + '">' + e + '</a>'
            }).join(''),
            groups: result.groups.map(e => {
                return '<a class="other-tag" href="/search?query=group:' + e + '">' + e + '</a>'
            }).join(''),
            original: result.series.map(e => {
                return '<a class="other-tag" href="/search?query=series:' + e + '">' + e + '</a>'
            }).join(''),
	    	tags: result.tags.map(e => {
				if(e.female) return '<a class="tag" gender="female" href="/search?query=female:' + e.tag+'">female:' + e.tag + '</a>';
				else if(e.male) return '<a class="tag" gender="male" href="/search?query=male:' + e.tag+'">male:' + e.tag + '</a>';
				else return '<a class="tag" href="/search?query=tag:' + e.tag + '">tag:' + e.tag + '</a>';
        	}).join('')
        });
    });
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
