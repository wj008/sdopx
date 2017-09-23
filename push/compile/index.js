var fs = require('fs');
var files = fs.readdirSync(__dirname);
if (files) {
    files.forEach(function (path) {
        var m = path.match(/(\w+)\.js$/i);
        if (m && m[1] != 'index') {
            var name = m[1];
            require('./' + name);
        }
    });
}
//# sourceMappingURL=index.js.map