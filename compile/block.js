"use strict";
const compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('block', (tagname, args, compile) => {
    let { name = null, hide = false, append = false, prepend = false } = args;
    if (name === null) {
        compile.addError(`The block tag 'name' is a must.`);
    }
    name = name.replace(/^['"]+|['"]+$/g, '');
    if (name == '' || !/\w+/.test(name)) {
        compile.addError(`block tag attribute syntax error in 'name', mast be string`);
    }
    let offset = compile.source.cursor;
    let code = compile.getBlock(name);
    if (code === null) {
        code = compile.getParentBlock(name);
    }
    if (code === null) {
        if (hide) {
            //如果是隐藏标签 移动到尾部
            compile.moveBlockToOver(name, offset);
        }
        compile.openTag('block', [null, '']);
        return '';
    }
    else {
        if (!(append || prepend)) {
            compile.moveBlockToOver(name, offset);
        }
        if (append) {
            compile.openTag('block', [null, code]);
            return '';
        }
        compile.openTag('block', [null, '']);
        return code;
    }
});
compile_1.Compile.registerCompile('block_close', (tagname, compile) => {
    let [, data] = compile.closeTag(['block']);
    let code = data[1] || '';
    return code;
});
//# sourceMappingURL=block.js.map