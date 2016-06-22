var fs = require('fs');
var files = fs.readdirSync(__dirname);
if (files) {
    files.forEach(function (path) {
        var m = path.match(/(\w+)\.js$/i);
        if (m && m[1] != 'index') {
            let name = m[1];
            let pulgin = require('./' + name);
            for (let key in pulgin) {
                module.exports[key] = pulgin[key];
            }
        }
    });
}