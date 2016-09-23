var fs = require('fs');
var files = fs.readdirSync(__dirname);
if (files) {
    files.forEach(function (path) {
        var m = path.match(/(\w+)\.js$/i);
        if (m && m[1] != 'index') {
            var name_1 = m[1];
            var pulgin = require('./' + name_1);
            for (var key in pulgin) {
                module.exports[key] = pulgin[key];
            }
        }
    });
}
//# sourceMappingURL=index.js.map