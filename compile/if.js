"use strict";
const compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('if', (name, args, compile) => {
    compile.openTag('if');
    return `if(${args.code}){`;
});
compile_1.Compile.registerCompile('else', (name, args, compile) => {
    compile.closeTag(['if', 'elseif']);
    compile.openTag('else');
    return `} else {`;
});
compile_1.Compile.registerCompile('elseif', (name, args, compile) => {
    compile.closeTag(['if', 'elseif']);
    compile.openTag('elseif');
    return `} else if(${args.code}){`;
});
compile_1.Compile.registerCompile('if_close', (name, compile) => {
    compile.closeTag(['if', 'else', 'elseif']);
    return `}`;
});
//# sourceMappingURL=if.js.map