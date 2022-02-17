//const { default: axios } = require('axios');

const loadimgs = (galinfo) => {
    //console.log(galinfo);
    let a = 0;
    galinfo.forEach(e => {
        $('div#imgs').append("<img id=\"" + a + "\" class=\"loading\" src=\"/images/loading.gif\">");
        makeRequest(e, a);
        a++;
    })
}

const makeRequest = function(imgInfo, imgNumber) {
    //tlqkf 내서버..
    const ext = (((imgInfo.hasAvif) ? 'avif' : ((imgInfo.hasWebp) ? 'webp' : imgInfo.extension)));
    $.get('/api/getimage', { image: JSON.stringify(imgInfo), isThumb: false }).then((result) => {
        const blob = new Blob(result, { type: 'image/' + ext });
        const url = URL.createObjectURL(blob);
        $("#" + imgNumber).attr('src', url);
        $("#" + imgNumber).attr('class', '');
    }).catch(() => {
        alert(`${imgNumber + 1}번째 이미지 다운로드에 실패했습니다.`);
    })
};