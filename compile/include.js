"use strict";
var compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('include', function (name, args, compile) {
    var _a = args.file, file = _a === void 0 ? null : _a;
    if (file === null) {
        compile.addError("The include tag 'file' is a must.");
    }
    delete args.file;
    var isoutput = true;
    try {
        isoutput = eval(args.output === void 0 ? 'true' : args.output);
    }
    catch (e) {
    }
    delete args.output;
    var output = [];
    if (isoutput) {
        output.push('__raw(');
    }
    var temp = [];
    for (var key in args) {
        var val = (args[key] == '' || args[key] == null) ? 'null' : args[key];
        temp.push("'" + key + "':" + val);
    }
    output.push("$_sdopx.getSubTemplate(" + file + ",{" + temp.join(',') + "})");
    if (isoutput) {
        output.push(')');
    }
    output.push(';');
    return output.join('');
});
//# sourceMappingURL=include.js.map