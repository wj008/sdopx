"use strict";
const compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('while', (name, args, compile) => {
    compile.openTag('while');
    return `while(${args.code}){`;
});
compile_1.Compile.registerCompile('while_close', (name, compile) => {
    compile.closeTag(['while']);
    return `}`;
});
//# sourceMappingURL=while.js.map