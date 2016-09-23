"use strict";
var Compile_While = (function () {
    function Compile_While() {
    }
    Compile_While.while = function (name, args, compile) {
        compile.openTag('while');
        return "while(" + args.code + "){";
    };
    Compile_While.while_close = function (name, compile) {
        compile.closeTag(['while']);
        return "}";
    };
    return Compile_While;
}());
module.exports = Compile_While;
//# sourceMappingURL=while.js.map