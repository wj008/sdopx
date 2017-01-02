import {Compile} from "../lib/compile";
Compile.registerCompile('if', (name, args, compile: Compile) => {
    compile.openTag('if');
    return `if(${args.code}){`;
});

Compile.registerCompile('else', (name, args, compile: Compile) => {
    compile.closeTag(['if', 'elseif']);
    compile.openTag('else');
    return `} else {`;
});

Compile.registerCompile('elseif', (name, args, compile: Compile) => {
    compile.closeTag(['if', 'elseif']);
    compile.openTag('elseif');
    return `} else if(${args.code}){`;
});

Compile.registerCompile('if_close', (name, compile) => {
    compile.closeTag(['if', 'else', 'elseif']);
    return `}`;
});

