"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('block', function (tagname, args, compile) {
    var _a = args.name, name = _a === void 0 ? null : _a, _b = args.hide, hide = _b === void 0 ? false : _b;
    if (name === null) {
        compile.addError("The block tag 'name' is a must.");
    }
    name = name.replace(/^['"]+|['"]+$/g, '');
    if (name == '' || !/\w+/.test(name)) {
        compile.addError("block tag attribute syntax error in 'name', mast be string");
    }
    var offset = compile.source.cursor;
    var block = compile.getParentBlock(name);
    if (block === null || block.code === null) {
        if (hide) {
            //如果是隐藏标签 移动到尾部
            compile.moveBlockToOver(name, offset);
        }
        compile.openTag('block', [null, '']);
        return '';
    }
    else {
        if (!(block.append || block.prepend)) {
            compile.moveBlockToOver(name, offset);
        }
        if (block.append) {
            compile.openTag('block', [null, block.code]);
            return '';
        }
        compile.openTag('block', [null, '']);
        return block.code || '';
    }
});
compile_1.Compile.registerCompile('block_close', function (tagname, compile) {
    var _a = compile.closeTag(['block']), data = _a[1];
    var code = data[1] || '';
    return code;
});
//# sourceMappingURL=block.js.map