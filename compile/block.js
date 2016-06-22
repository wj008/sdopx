var Compile_Block = (function () {
    function Compile_Block() {
    }
    Compile_Block.block = function (tagname, args, compile) {
        var _a = args.name, name = _a === void 0 ? null : _a, _b = args.hide, hide = _b === void 0 ? false : _b, _c = args.append, append = _c === void 0 ? false : _c, _d = args.prepend, prepend = _d === void 0 ? false : _d;
        if (name === null) {
            compile.addError("The block tag 'name' is a must.");
        }
        name = name.replace(/^['"]+|['"]+$/g, '');
        if (name == '' || !/\w+/.test(name)) {
            compile.addError("block tag attribute syntax error in 'name', mast be string");
        }
        var offset = compile.source.cursor;
        var code = compile.getBlock(name);
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
                compile.moveBlockToEnd(name, offset);
            }
            if (append) {
                compile.openTag('block', [null, code]);
                return '';
            }
            compile.openTag('block', [null, '']);
            return code;
        }
    };
    Compile_Block.block_close = function (tagname, compile) {
        var _a = compile.closeTag(['block']), data = _a[1];
        var code = data[1] || '';
        return code;
    };
    return Compile_Block;
})();
module.exports = Compile_Block;
//# sourceMappingURL=block.js.map