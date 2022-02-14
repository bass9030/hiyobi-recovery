//const { default: axios } = require('axios');

const loadimgs = (galinfo, galid) => {
    //console.log(galinfo);
    let a = 0;
    galinfo.images.forEach(e => {
        console.log(e);
        $('div#imgs').append("<img id=\"" + a + "\" class=\"loading\" src=\"/images/loading.gif\">");
        makeRequest(e, galid, a);
        a++;
    })
}

const makeRequest = function(url, galid, imgNumber) {
    //tlqkf 내서버..
    var request = new XMLHttpRequest();
    request.open('GET', `/api/getimage?url=${url}&galid=${galid}`);
    request.responseType = "text";
    request.onload = function() {
        var base64 = request.response;
        if (base64) {
            var mimetype="image/" + url.split('.')[1];
            $("#" + imgNumber).attr('src', "data:"+mimetype+";base64,"+base64);
            $("#" + imgNumber).attr('class', '');
        }
    };
    request.send();
    /*var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
        var arraybuffer = xhr.response;
        if(arraybuffer) {
            var u8 = new Uint8Array(arrayBuffer);
            var b64encoded = btoa(String.fromCharCode.apply(null, u8));
            var mimetype="image/" + url.split('.')[1]; // or whatever your image mime type is
            $("#" + imgNumber).attr('src', "data:"+mimetype+";base64,"+b64encoded);
            $("#" + imgNumber).attr('class', '');
        }
    }
    xhr.send();*/
    /*fetch(url, {
        headers: {
            'Referer': "https://hitomi.la/reader/" + galid + ".html",
            'Origin': "https://hitomi.la/reader/" + galid + ".html"
        }
    }).then((response) => {
        if (response.ok) {
            response.arrayBuffer().then((arraybuffer) => {
                var u8 = new Uint8Array(arraybuffer);
                var b64encoded = btoa(String.fromCharCode.apply(null, u8));
                var mimetype="image/" + url.split('.')[1]; // or whatever your image mime type is
                $("#" + imgNumber).attr('src', "data:"+mimetype+";base64,"+b64encoded);
                $("#" + imgNumber).attr('class', '');
            });
        }
    })*/
    /*axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
            'Referer': "https://hitomi.la/reader/" + galid + ".html"
        }
    }).then(response => {
        var u8 = new Uint8Array(response.data);
        var b64encoded = btoa(String.fromCharCode.apply(null, u8));
        var mimetype="image/" + url.split('.')[1]; // or whatever your image mime type is
        $("#" + imgNumber).attr('src', "data:"+mimetype+";base64,"+b64encoded);
        $("#" + imgNumber).attr('class', '');
    })*/
};