const safemode = true;

async function renderPage(page = 1) {
    const card = await $.get('/ejs/card.ejs');

    $.get('/api/recent', { page: page }).then((result) => {
        result.result.forEach(e => {
            $.get('/api/galleryinfo', { id: e }).then((gallinfo) => {
                const f = ejs.render(card, {
                    id: e,
                    title: gallinfo.title.display,
                    type: returnPlaneText('type', gallinfo.type),
                    artists: gallinfo.artists.map(f => returnPlaneText('artist', f)).join('<span>, </span>'),
                    original: gallinfo.series.map(f => returnPlaneText('series', f)).join('<span>, </span>'),
                    characters: gallinfo.characters.map(f => returnPlaneText('character', f)).join('<span>, </span>'),
                    tags: gallinfo.tags.map(f => returnTag(f.type, f.name)).join('\n'),
                    page: gallinfo.files.length,
                    href: `/reader/${e}`,
                    language: `<a href="/search?q=language:${gallinfo.languageName.english}">${gallinfo.languageName.local}</a>`,
                    thumbnail: (safemode ? '#': `/api/getimage?image=${JSON.stringify(gallinfo.files[0])}&isThumb=true`),
                })
                //console.log(e, gallinfo.series.map(f => returnPlaneText('series', f)).join('\n'));
                //console.log($('div#content').html());
                $('#content').append(f + '\n');
                $('div#content > a.acard').sort(function (b, a) {
                    //console.log(a.id, b.id)
                    return parseInt(a.id) - parseInt(b.id);
                }).each(function () {
                    var elem = $(this);
                    elem.remove();
                    $(elem).appendTo("#content");
                });
            });
        });
    });
}

function returnPlaneText(type, name) {
    if(name == 'original') return;
    return `<a href="/search?q=${type}:${name}">${name}</a>`
}

function returnTag(type, name) {
    switch(type) {
        case 'female':
        case '???':
            return `<a class="tag" gender="female" href="/search?q=???:${name}">${name}</a>`
        
        case 'male':
        case '???': 
            return `<a class="tag" gender="male" href="/search?q=???:${name}">${name}</a>`

        default: 
            return `<a class="tag" gender="other" href="/search?q=${type}:${name}">${name}</a>`
    }
}