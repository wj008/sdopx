import {Compile} from "../lib/compile";

Compile.registerCompile('call', (name, args, compile: Compile) => {
    let {fn = null} = args;
    if (fn === null) {
        compile.addError(`The call tag 'fn' is a must.`);
    }
    if (typeof fn !== 'string') {
        compile.addError('The function tag \'fn\' is invalid.');
    }
    fn = fn.replace(/(^['"])|(['"]$)/g, '');
    let temp = [];
    for (var key in args) {
        if (key == 'fn') {
            continue;
        }
        let val = (args[key] == '' || args[key] == null) ? 'null' : args[key];
        temp.push(`'${key}':${val}`);
    }
    let params = `{${temp.join(',')}}`;
    return `if(typeof $_sdopx.funcMap['${fn}'] =='function'){ $_sdopx.funcMap['${fn}'](${params},{echo:__echo,raw:__raw},$_sdopx);}`;
});

