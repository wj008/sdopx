"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('if', function (name, args, compile) {
    compile.openTag('if');
    return "if(" + args.code + "){";
});
compile_1.Compile.registerCompile('else', function (name, args, compile) {
    compile.closeTag(['if', 'elseif']);
    compile.openTag('else');
    return "} else {";
});
compile_1.Compile.registerCompile('elseif', function (name, args, compile) {
    compile.closeTag(['if', 'elseif']);
    compile.openTag('elseif');
    return "} else if(" + args.code + "){";
});
compile_1.Compile.registerCompile('if_close', function (name, compile) {
    compile.closeTag(['if', 'else', 'elseif']);
    return "}";
});
//# sourceMappingURL=if.js.map