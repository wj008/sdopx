import {Compile} from "../lib/compile";

Compile.registerCompile('while', (name, args, compile: Compile) => {
    compile.openTag('while');
    return `while(${args.code}){`;
});

Compile.registerCompile('while_close', (name, compile) => {
    compile.closeTag(['while']);
    return `}`;
});


