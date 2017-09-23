"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('extends', function (name, args, compile) {
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
    var tplId = tpl.getSource().tplId;
    if (compile.sdopx.extends_tplId[tplId]) {
        compile.addError("The extends tag file Repeated references!");
    }
    compile.sdopx.extends_tplId[tplId] = true;
    compile.closed = true;
    return tpl.compileTemplateSource();
});
//# sourceMappingURL=extends.js.map