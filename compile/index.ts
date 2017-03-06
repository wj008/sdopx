let fs = require('fs');
let files = fs.readdirSync(__dirname);
if (files) {
    files.forEach(function (path) {
        let m = path.match(/(\w+)\.js$/i);
        if (m && m[1] != 'index') {
            let name = m[1];
            require('./' + name);
        }
    });
}
