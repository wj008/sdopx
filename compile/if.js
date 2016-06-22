var Compile_If = (function () {
    function Compile_If() {
    }
    Compile_If.if = function (name, args, compile) {
        compile.openTag('if');
        return "if(" + args.code + "){";
    };
    Compile_If.else = function (name, args, compile) {
        compile.closeTag(['if', 'elseif']);
        compile.openTag('else');
        return "} else {";
    };
    Compile_If.elseif = function (name, args, compile) {
        compile.closeTag(['if', 'elseif']);
        compile.openTag('elseif');
        return "} else if(" + args.code + "){";
    };
    Compile_If.if_close = function (name, compile) {
        compile.closeTag(['if', 'else', 'elseif']);
        return "}";
    };
    return Compile_If;
})();
module.exports = Compile_If;
//# sourceMappingURL=if.js.map