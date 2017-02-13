import {Compile} from "../lib/compile";

Compile.registerCompile('include', (name, args, compile: Compile) => {
    let {file = null} = args;
    if (file === null) {
        compile.addError(`The include tag 'file' is a must.`);
    }
    delete args.file;
    var isoutput = true;
    try {
        isoutput = eval(args.output === void 0 ? 'true' : args.output);
    } catch (e) {
    }
    delete args.output;
    let output = [];
    if (isoutput) {
        output.push('__raw(');
    }
    let argsmap = {};
    for (let key in args) {
        let val = (args[key] == '' || args[key] == null) ? 'null' : args[key];
        argsmap[key] = val;
    }
    //将目标零时变量注入到模板
    for (let vkey of compile.getVarKeys()) {
        let val = compile.getVar(vkey, true);
        argsmap[vkey] = val;
    }
    let temp = [];
    for (let key in argsmap) {
        temp.push(`'${key}':${argsmap[key]}`);
    }
    output.push(`$_sdopx.getSubTemplate(${file},{${temp.join(',')}})`);
    if (isoutput) {
        output.push(')');
    }
    output.push(';');
    return output.join('');
});


