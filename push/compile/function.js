"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('function', function (name, args, compile) {
    var _a = args.fn, fn = _a === void 0 ? null : _a;
    //起始
    if (fn === null) {
        compile.addError('The function tag \'fn\' is must.');
    }
    if (typeof fn !== 'string') {
        compile.addError('The function tag \'fn\' is invalid.');
    }
    fn = fn.replace(/(^['"])|(['"]$)/g, '');
    if (!/^\w+$/.test(fn)) {
        compile.addError('The function tag \'fn\' is invalid.');
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
    output.push("$_sdopx.funcMap['" + fn + "']=function(" + prefix + ",__out,$_sdopx){var __echo=__out.echo,__raw=__out.raw;");
    output.push(tdefs.join('\n'));
    compile.openTag('function', [prefix, fn]);
    var str = output.join('\n');
    return output.join('\n');
});
compile_1.Compile.registerCompile('function_close', function (name, compile) {
    var _a = compile.closeTag(['function']), data = _a[1];
    compile.removeVar(data[0]);
    return "}";
});
