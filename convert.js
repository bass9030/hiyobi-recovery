// "type:doujinshi","type:manga","type:artistcg","type:gamecg","종류:동인지","종류:망가","종류:Cg아트","종류:게임Cg"
//const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const db = require('better-sqlite3')('./tag.db');

const autocomplete = JSON.parse(fs.readFileSync('./auto.json'));

/**
 * check string is English
 * @param {string} text 
 * @return {bool} is English
 */
function isEnglish(text) {
    return (/[A-Za-z]/g).test(text);
}

function isKorean(text) {
    return (/[가-힣]/g).test(text);
}

fs.writeFileSync('log.txt', '')

let i = 0;
db.exec('BEGIN TRANSACTION;');
// remove all
db.exec('DELETE FROM tags;');
while(true) {
    //console.log(i);
    //console.log(autocomplete[i].split(':')[0]);
    const firstTag = autocomplete[i].split(/(artist|female|male|character|group|series|type|tag|남|여|여성|남성):/g)[2];
    
    let nextTag = '';
    if(autocomplete[i + 1]) nextTag = autocomplete[i+1].split(/(artist|female|male|character|group|series|type|tag|남|여|여성|남성):/g)[2];

    const prefix = autocomplete[i].split(':')[0].replace('남', 'male').replace('여', 'female').replace('남성', 'male').replace('여성', 'female');

    if(isEnglish(firstTag) && isKorean(nextTag)) {
        db.prepare("INSERT INTO tags ('" + prefix + "', english, korean) VALUES (1, ?, ?);").run(firstTag, nextTag);
        //fs.appendFileSync('log.txt', "INSERT INTO tags (" + autocomplete[i].split(':')[0] + ", english, korean) VALUES (1, ?, ?);\n")
        fs.appendFileSync('log.txt', '\n'+i+' translated: ' + firstTag + ' -> ' + nextTag);
        i += 2;
    }else{
        db.prepare("INSERT INTO tags ('" + prefix + "', english) VALUES (1, ?);").run(firstTag);
        //fs.appendFileSync('log.txt', "INSERT INTO tags (" + autocomplete[i].split(':')[0] + ",english) VALUES (1, ?);\n")
        fs.appendFileSync('log.txt', '\n'+i+' non-translated: ' + firstTag);
        i += 1;
    }

    if(autocomplete.length <= i) {
        break;
    }
}
db.exec('END TRANSACTION;');










































































































































































































































































































































































