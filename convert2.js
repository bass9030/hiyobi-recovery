const db = require('better-sqlite3')('./tag.db', {verbose: console.log});

db.prepare('SELECT * FROM tags WHERE male = 1;').all().forEach(row => {
    console.log(row.english);
    db.prepare('SELECT * FROM tags WHERE male = 1;')
});