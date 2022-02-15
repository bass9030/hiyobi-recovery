const db = require(`better-sqlite3`)(`./tag.db`/*, {verbose: console.log}*/);

const t = [`female`, `male`]
for(let i = 0; i < 2; i++) {
    console.log('start convert for ' + t[i])
    db.prepare(`SELECT * FROM tags WHERE ${t[i]} = 1;`).all().forEach(row => {
        db.prepare(`SELECT * FROM tags WHERE ${t[i]} = 1 AND NOT english = ?;`).all(row.english).forEach(row2 => {
            if(row.english.replace(/ /g, ``).replace(/[-._!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/g, '').toLocaleLowerCase() == row2.english.replace(/ /g, ``).replace(/[-._!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/g, '').toLocaleLowerCase()) {
                if(row.korean || row.korean) {
                    if(row.korean) {
                        console.log(`convert ` + row2.english + ` to ` + row.korean);
                        db.prepare(`UPDATE tags SET korean = ? WHERE ${t[i]} = 1 AND english = ?;`).run(row.korean, row2.english);
                    }else{
                        console.log(`convert ` + row.english + ` to ` + row2.korean);
                        db.prepare(`UPDATE tags SET korean = ? WHERE ${t[i]} = 1 AND english = ?;`).run(row2.korean, row.english);
                    }
                }
            }
        })
    });
}