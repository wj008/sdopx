"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('for', function (name, args, compile) {
    var _a = args.start, start = _a === void 0 ? null : _a, _b = args.key, key = _b === void 0 ? null : _b, _c = args.step, step = _c === void 0 ? null : _c, _d = args.lt, lt = _d === void 0 ? null : _d, _e = args.gt, gt = _e === void 0 ? null : _e, _f = args.gte, gte = _f === void 0 ? null : _f, _g = args.lte, lte = _g === void 0 ? null : _g, _h = args.neq, neq = _h === void 0 ? null : _h, _j = args.eq, eq = _j === void 0 ? null : _j, _k = args.to, to = _k === void 0 ? null : _k;
    //起始
    if (start === null) {
        throw new Error('for 标签中 start 是必须的。');
    }
    //判断重复
    var tpk = null;
    var smycodes = { lt: '<', gt: '>', gte: '>=', lte: '<=', neq: '!=', eq: '==' };
    var smval = 'null';
    for (var i in args) {
        if (i == 'lt' || i == 'gt' || i == 'lte' || i == 'gte' || i == 'neq' || i == 'eq' || i == 'to') {
            if (tpk) {
                throw new Error('for 标签中循环条件重复 ' + tpk + ' 和 ' + i + ' 重复.');
            }
            if (args[i]) {
                tpk = i;
                smval = args[i];
            }
        }
    }
    if (!tpk) {
        compile.addError('Tags for loop condition is lost, lt (less than) gt (greater than) lte (less than or equal) gte (greater than or equal) neq (not equal) eq (equal) and must require a');
    }
    //key只能是变量
    if (key !== null) {
        key = key.replace(/^['"]+|['"]+$/g, '');
        if (key == '' || !/\w+/.test(key)) {
            compile.addError('Does not match the key attribute syntax for tag');
        }
    }
    //默认是1
    if (step === null) {
        step = 1;
    }
    var prefix = compile.getTempPrefix('for');
    var vars = compile.getVarter(prefix);
    if (key !== null) {
        vars.add(key);
    }
    var ekey = key === null ? "__" + prefix + "_i" : prefix + "_" + key;
    compile.addVar(vars);
    var output = [];
    var expcode = '';
    if (tpk == 'to') {
        expcode = "(" + start + "<=" + smval + ")?(" + ekey + "<=" + smval + "):(" + ekey + ">=" + smval + ");";
        expcode += ekey + "+=(" + start + "<=" + smval + "?" + step + ":-" + step + ")";
    }
    else {
        expcode = ekey + " " + smycodes[tpk] + " " + smval + ";";
        expcode += ekey + "+=" + step;
    }
    output.push("var __" + prefix + "_index=0;");
    output.push("for(var " + ekey + "=" + start + "; " + expcode + "){");
    compile.openTag('for', [prefix, key]);
    return output.join('\n');
});
compile_1.Compile.registerCompile('forelse', function (name, args, compile) {
    var _a = compile.closeTag(['for']), data = _a[1];
    var prefix = data[0];
    compile.openTag('forelse', data);
    var output = [];
    output.push('}');
    output.push("if(__" + prefix + "_index==0){");
    return output.join('\n');
});
compile_1.Compile.registerCompile('for_close', function (name, compile) {
    var _a = compile.closeTag(['for', 'forelse']), data = _a[1];
    compile.removeVar(data[0]);
    var output = [];
    output.push('}');
    return output.join('\n');
});
//# sourceMappingURL=for.js.map