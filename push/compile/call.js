"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('call', function (name, args, compile) {
    var _a = args.fn, fn = _a === void 0 ? null : _a;
    if (fn === null) {
        compile.addError("The call tag 'fn' is a must.");
    }
    if (typeof fn !== 'string') {
        compile.addError('The function tag \'fn\' is invalid.');
    }
    fn = fn.replace(/(^['"])|(['"]$)/g, '');
    var temp = [];
    for (var key in args) {
        if (key == 'fn') {
            continue;
        }
        var val = (args[key] == '' || args[key] == null) ? 'null' : args[key];
        temp.push("'" + key + "':" + val);
    }
    var params = "{" + temp.join(',') + "}";
    return "if(typeof $_sdopx.funcMap['" + fn + "'] =='function'){ $_sdopx.funcMap['" + fn + "'](" + params + ",{echo:__echo,raw:__raw},$_sdopx);}";
});
//# sourceMappingURL=call.js.map