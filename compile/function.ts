import {Compile} from "../lib/compile";

Compile.registerCompile('function', (name, args, compile: Compile) => {
    let {fn = null} = args;
    //起始
    if (fn === null) {
        throw new Error('The function tag \'fn\' is must.');
    }
    if (!/^\w+$/.test(fn)) {
        throw new Error('The function tag \'fn\' is invalid.');
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
    output.push(`function sdopx_${fn}(${prefix}){`);
    output.push(tdefs.join('\n'));
    compile.openTag('function', [prefix, fn]);
    let str = output.join('\n');
    return output.join('\n');
});

Compile.registerCompile('function_close', (name, compile: Compile) => {
    let [,data]= compile.closeTag(['function']);
    compile.removeVar(data[0]);
    return `}`;
});

