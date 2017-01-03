"use strict";
var compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('while', function (name, args, compile) {
    compile.openTag('while');
    return "while(" + args.code + "){";
});
compile_1.Compile.registerCompile('while_close', function (name, compile) {
    compile.closeTag(['while']);
    return "}";
});
//# sourceMappingURL=while.js.map