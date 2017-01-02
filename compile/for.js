"use strict";
const compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('for', (name, args, compile) => {
    let { start = null, key = null, step = null, lt = null, gt = null, gte = null, lte = null, neq = null, eq = null, to = null } = args;
    //起始
    if (start === null) {
        throw new Error('for 标签中 start 是必须的。');
    }
    //判断重复
    let tpk = null;
    let smycodes = { lt: '<', gt: '>', gte: '>=', lte: '<=', neq: '!=', eq: '==' };
    let smval = 'null';
    for (let i in args) {
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
    let prefix = compile.getTempPrefix('for');
    let vars = compile.getVarter(prefix);
    if (key !== null) {
        vars.add(key);
    }
    let ekey = key === null ? `__${prefix}_i` : `${prefix}_${key}`;
    compile.addVar(vars);
    let output = [];
    let expcode = '';
    if (tpk == 'to') {
        expcode = `(${start}<=${smval})?(${ekey}<=${smval}):(${ekey}>=${smval});`;
        expcode += `${ekey}+=(${start}<=${smval}?${step}:-${step})`;
    }
    else {
        expcode = `${ekey} ${smycodes[tpk]} ${smval};`;
        expcode += `${ekey}+=${step}`;
    }
    output.push(`var __${prefix}_index=0;`);
    output.push(`for(var ${ekey}=${start}; ${expcode}){`);
    compile.openTag('for', [prefix, key]);
    return output.join('\n');
});
compile_1.Compile.registerCompile('forelse', (name, args, compile) => {
    let [, data] = compile.closeTag(['for']);
    let prefix = data[0];
    compile.openTag('forelse', data);
    let output = [];
    output.push('}');
    output.push(`if(__${prefix}_index==0){`);
    return output.join('\n');
});
compile_1.Compile.registerCompile('for_close', (name, compile) => {
    let [, data] = compile.closeTag(['for', 'forelse']);
    compile.removeVar(data[0]);
    let output = [];
    output.push('}');
    return output.join('\n');
});
//# sourceMappingURL=for.js.map