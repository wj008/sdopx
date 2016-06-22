var Compile_Extends = (function () {
    function Compile_Extends() {
    }
    Compile_Extends.extends = function (name, args, compile) {
        var _a = args.file, file = _a === void 0 ? null : _a;
        if (file === null) {
            compile.addError("The extends tag 'file' is a must.");
        }
        var $_sdopx = compile.sdopx;
        var tpl_name = file;
        try {
            tpl_name = eval('(' + file + ')');
        }
        catch (e) {
        }
        var names = tpl_name.split('|');
        if (names.length >= 2) {
            tpl_name = tpl_name.replace(/^extends:/, '');
            tpl_name = 'extends:' + tpl_name;
        }
        var tpl = compile.tpl.createChildTemplate(tpl_name);
        var uid = tpl.getSource().uid;
        if (compile.sdopx.extends_uid[uid]) {
            compile.addError("The extends tag file Repeated references!");
        }
        compile.sdopx.extends_uid[uid] = true;
        compile.closed = true;
        return tpl.compileTemplateSource();
    };
    return Compile_Extends;
})();
module.exports = Compile_Extends;
//# sourceMappingURL=extends.js.map