"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('while', function (name, args, compile) {
    compile.openTag('while');
    return "while(" + args.code + "){";
});
compile_1.Compile.registerCompile('while_close', function (name, compile) {
    compile.closeTag(['while']);
    return "}";
});
