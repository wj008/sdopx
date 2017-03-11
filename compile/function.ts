import {Compile} from "../lib/compile";

Compile.registerCompile('function', (name, args, compile: Compile) => {
    let {fn = null} = args;
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
    let tdefs = [];
    let temp = [];
    let output = [];
    let prefix = compile.getTempPrefix('params');
    let vars = compile.getVarter(prefix);
    for (var key in args) {
        if (key == 'fn') {
            continue;
        }
        let value = args[key];
        vars.add(key);
        temp.push(prefix + '_' + key);
        tdefs.push(`var ${prefix}_${key}=${prefix}['${key}']===void 0 ? ${value} : ${prefix}['${key}'];`);
    }
    compile.addVar(vars);
    output.push(`$_sdopx.funcMap['${fn}']=function(${prefix},__out,$_sdopx){var __echo=__out.echo,__raw=__out.raw;`);
    output.push(tdefs.join('\n'));
    compile.openTag('function', [prefix, fn]);
    let str = output.join('\n');
    return output.join('\n');
});

Compile.registerCompile('function_close', (name, compile: Compile) => {
    let [, data]= compile.closeTag(['function']);
    compile.removeVar(data[0]);
    return `}`;
});

