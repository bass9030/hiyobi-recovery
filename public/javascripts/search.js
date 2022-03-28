let autocomplete = [];
let controller = new AbortController();
const splitRex = /(artist|작가|female|male|character|캐릭|group|그룹|series|원작|type|종류|tag|태그|남|여|여성|남성):/g;
const safemode = true;

function hangulFirstCompare(a, b) {
	a = a.toString();
    b = b.toString();
    return a.localeCompare(b, 'ko');
}

$(window).on('resize', () => {
    $('#query').width(($('#textbox').width() - $('#tags').width()) - 2);
})

$('#query').on('change', () => {
    var options = $('datalist')[0].options;
    var val = $('#query').val();
    for (var i=0;i<options.length;i++){
        if (options[i].value === val) {
            const e = $.Event('keyup');
            e.keyCode = 13;
            $('#query').trigger(e);
            break;
        }
    }
})

$('#sumbit').click(() => {
    let d = $('#tags').children('a')
    let result = [];
    for(var i = 0; i < d.length ; i++){
        let e = d[i];
        console.log(e);
        result.push(e.innerText);
    }
    $('#content').html('');
    $('#content').append('<img id="loading" style="width: 100%; object-fit:scale-down;" src="/images/loading.gif">');
    let loading = true;
    $.get('/api/search', {'q': result.join('|')}).done(data => {
        data.forEach(e => {
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
                if(loading) {
                    $('#content').html('');
                    loading = false;
                }
                $('#content').append(f + '\n');
                $('#query').resize();
                $('div#content > a.acard').sort(function (b, a) {
                    //console.log(a.id, b.id)
                    return parseInt(a.id) - parseInt(b.id);
                }).each(function () {
                    var elem = $(this);
                    elem.remove();
                    $(elem).appendTo("#content");
                });
            });
        })
    });
})

$('#query').keyup((e) => {
    if(e.keyCode == 13) {
        if($('#query').val().length != 0) {
            const tag = $('#query').val();
            //$('#tags').append('<a class="tag" gender="' + ((tag.split(':')[0].includes('여') || tag.split(':')[0] == 'female') ? 'female' : ((tag.split(':')[0].includes('남') || tag.split(':')[0] == 'male') ? 'male' : 'other')) + '">' + $('#query').val() + '</a>');
            
            $('#query').val('')
            $('#query').focus()
            $('#query').width(($('#textbox').width() - $('#tags').width()) - 2);
        }else{
            $('#sumbit').click();
        }
    }    

    if((/[ㄱ-ㅎ]+/g).test($('#query').val())) return;
    $.get('/api/autocomplete', {q: $('#query').val()}, (data) => {
        autocomplete = data.sort((a,b) => {
            return hangulFirstCompare(a,b)
        });
        let result = '';
        autocomplete.forEach(tag => result += (`<option value="${tag}"/>`));
        $('#autocomplete').html(result);
    })
})

$(window).on('load', () => {
    $.get('/api/autocomplete', (data) => {
        autocomplete = data.sort((a,b) => {
            return hangulFirstCompare(a,b)
        });
        let result = '';
        autocomplete.forEach(tag => result += (`<option value="${tag}"/>`));
        $('#autocomplete').html(result);
    })
})

function returnPlaneText(type, name) {
    if(name == 'original') return;
    return `<a href="/search?q=${type}:${name}">${name}</a>`
}

function returnSearchTag(type, name) {
    switch(type) {
        case 'female':
        case '여':
            return `<a class="tag" gender="female" href="/search?q=여:${name}">${name} <a>X</a></a>`
        
        case 'male':
        case '남': 
            return `<a class="tag" gender="male" href="/search?q=남:${name}">${name} <a>X</a></a>`

        default: 
            return `<a class="tag" gender="other" href="/search?q=${type}:${name}">${name} <a>X</a></a>`
    }
}

function returnTag(type, name) {
    switch(type) {
        case 'female':
        case '여':
            return `<a class="tag" gender="female" href="/search?q=여:${name}">${name}</a>`
        
        case 'male':
        case '남': 
            return `<a class="tag" gender="male" href="/search?q=남:${name}">${name}</a>`

        default: 
            return `<a class="tag" gender="other" href="/search?q=${type}:${name}">${name}</a>`
    }
}