"use strict";
var Compile_Function = (function () {
    function Compile_Function() {
    }

    Compile_Function.function = function (name, args, compile) {
        var _a = args.fn, fn = _a === void 0 ? null : _a;
        //起始
        if (fn === null) {
            throw new Error('The function tag \'fn\' is must.');
        }
        if (!/^\w+$/.test(fn)) {
            throw new Error('The function tag \'fn\' is invalid.');
        }
        var tdefs = [];
        var temp = [];
        var output = [];
        var prefix = compile.getTempPrefix('params');
        var vars = compile.getVarter(prefix);
        for (var key in args) {
            if (key == 'fn') {
                continue;
            }
            var value = args[key];
            vars.add(key);
            temp.push(prefix + '_' + key);
            tdefs.push("var " + prefix + "_" + key + "=" + prefix + "['" + key + "']===void 0 ? " + value + " : " + prefix + "['" + key + "'];");
        }
        compile.addVar(vars);
        output.push("function sdopx_" + fn + "(" + prefix + "){");
        output.push(tdefs.join('\n'));
        compile.openTag('function', [prefix, fn]);
        var str = output.join('\n');
        return output.join('\n');
    };
    Compile_Function.function_close = function (name, compile) {
        var _a = compile.closeTag(['function']), data = _a[1];
        compile.removeVar(data[0]);
        return "}";
    };
    return Compile_Function;
}());
module.exports = Compile_Function;
//# sourceMappingURL=function.js.map