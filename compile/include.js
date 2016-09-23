"use strict";
var Compile_Include = (function () {
    function Compile_Include() {
    }
    Compile_Include.include = function (name, args, compile) {
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
    };
    return Compile_Include;
}());
module.exports = Compile_Include;
//# sourceMappingURL=include.js.map