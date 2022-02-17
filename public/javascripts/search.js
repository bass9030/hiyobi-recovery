let autocomplete = [];
let controller = new AbortController();
const splitRex = /(artist|작가|female|male|character|캐릭|group|그룹|series|원작|type|종류|tag|태그|남|여|여성|남성):/g;

function hangulFirstCompare(a, b) {
	a = a.toString();
    b = b.toString();
    return a.localeCompare(b, 'ko');
}

$('#sumbit').click(() => {
    let d = $('#tags').children('li')
    let result = [];
    for(var i = 0; i < d.length ; i++){
        let e = d[i];
        console.log(e);
        result.push(e.innerText);
    }
    document.location.href = '/search?query=' + result.join('|');
})

$('#query').keyup((e) => {
    if(e.keyCode == 13) {
        if($('#query').val().length != 0) {
            $('#tags').append('<a>' + $('#query').val() + '</a>');
            $('#query').val('')
            $('#query').focus()
        }else{
            $('#sumbit').click();
        }
    }    

    if((/[ㄱ-ㅎ]+/g).test($('#query').val())) return;
    $.get('/api/autocomplete', {q: $('#query').val()}, (data) => {
        autocomplete = data.sort((a,b) => {
            //if(a.includes(':')) a = a.split(splitRex)[2]
            //if(b.includes(':')) b = b.split(splitRex)[2]
            return hangulFirstCompare(a,b)
        });
        let result = '';
        autocomplete.forEach(tag => result += (`<option value="${tag}"/>`));
        $('#autocomplete').html(result);
    })
})

$(window).on('load', () => {
    $.get('/api/autocomplete', (data) => {
        console.log(data);
        autocomplete = data.sort((a,b) => {
            //if(a.includes(':')) a = a.split(splitRex)[2]
            //if(b.includes(':')) b = b.split(splitRex)[2]
            return hangulFirstCompare(a,b)
        });
        let result = '';
        autocomplete.forEach(tag => result += (`<option value="${tag}"/>`));
        $('#autocomplete').html(result);
    })
})