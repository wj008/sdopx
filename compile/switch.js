"use strict";
var compile_1 = require("../lib/compile");
//很可能不被加入
compile_1.Compile.registerCompile('switch', function (name, args, compile) {
    var _a = args.value, value = _a === void 0 ? null : _a, _b = args.code, code = _b === void 0 ? null : _b;
    if (code === null) {
        if (value === null) {
            compile.addError("The switch tag 'value' is a must.");
        }
        compile.openTag('switch', [null, false]);
        return "switch(" + value + "){ /*";
    }
    compile.openTag('switch', [null, false]);
    return "switch(" + code + "){ /* ";
});
compile_1.Compile.registerCompile('case', function (name, args, compile) {
    var obreak = args.break === void 0 ? true : args.break;
    var values = [];
    for (var item in args) {
        if (/^value[0-9]*$/.test(item)) {
            values.push(args[item]);
        }
    }
    if (values.length == 0) {
        compile.addError("The case tag 'value' is a must.");
    }
    var _a = compile.closeTag(['switch', 'case']), tag = _a[0], data = _a[1];
    var output = [];
    if (tag == 'switch') {
        output.push(' */');
    }
    else {
        if (data[1]) {
            output.push('break;');
        }
    }
    compile.openTag('case', [null, obreak]);
    for (var i = 0; i < values.length; i++) {
        output.push('case ' + values[i] + ' :');
    }
    return output.join('\n');
});
compile_1.Compile.registerCompile('default', function (name, args, compile) {
    var _a = compile.closeTag(['switch', 'case']), tag = _a[0], data = _a[1];
    var output = [];
    if (tag == 'switch') {
        output.push(' */');
    }
    else {
        if (data[1]) {
            output.push('break;');
        }
    }
    compile.openTag('default', [null, true]);
    output.push('default :');
    return output.join('\n');
});
compile_1.Compile.registerCompile('switch_close', function (name, compile) {
    var _a = compile.closeTag(['switch', 'default', 'case']), tag = _a[0], data = _a[1];
    var output = [];
    if (tag == 'switch') {
        output.push(' */');
    }
    else {
        if (data[1]) {
            output.push('break;');
        }
    }
    output.push('}');
    return output.join('\n');
});
//# sourceMappingURL=switch.js.map