"use strict";
const compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('extends', (name, args, compile) => {
    let { file = null } = args;
    if (file === null) {
        compile.addError(`The extends tag 'file' is a must.`);
    }
    let $_sdopx = compile.sdopx;
    let tpl_name = file;
    try {
        tpl_name = eval('(' + file + ')');
    }
    catch (e) {
    }
    let names = tpl_name.split('|');
    if (names.length >= 2) {
        tpl_name = tpl_name.replace(/^extends:/, '');
        tpl_name = 'extends:' + tpl_name;
    }
    let tpl = compile.tpl.createChildTemplate(tpl_name);
    let uid = tpl.getSource().uid;
    if (compile.sdopx.extends_uid[uid]) {
        compile.addError(`The extends tag file Repeated references!`);
    }
    compile.sdopx.extends_uid[uid] = true;
    compile.closed = true;
    return tpl.compileTemplateSource();
});
//# sourceMappingURL=extends.js.map