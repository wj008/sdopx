"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('ldelim', function (name, args, compile) {
    return '__raw(' + JSON.stringify(compile.source.left_delimiter_raw) + ');';
});
compile_1.Compile.registerCompile('rdelim', function (name, args, compile) {
    return '__raw(' + JSON.stringify(compile.source.right_delimiter_raw) + ');';
});
compile_1.Compile.registerCompile('literal', function (name, args, compile) {
    var _a = args.left, left = _a === void 0 ? null : _a, _b = args.right, right = _b === void 0 ? null : _b;
    var $_sdopx = compile.sdopx, delim_left = '', delim_right = '', literal = false;
    if (left || right) {
        try {
            delim_left = eval('(' + left + ')');
        }
        catch (e) {
            compile.addError('left delimiter parsing error');
        }
        try {
            delim_right = eval('(' + right + ')');
        }
        catch (e) {
            compile.addError('right delimiter parsing error');
        }
        if (!delim_left || typeof (delim_left) !== 'string' || delim_left.trim() == '') {
            compile.addError('left delimiter can not be empty');
        }
        if (!delim_right || typeof (delim_right) !== 'string' || delim_right.trim() == '') {
            compile.addError('right delimiter can not be empty');
        }
        delim_left = delim_left.trim();
        delim_right = delim_right.trim();
    }
    else {
        literal = true;
    }
    compile.source.end_literal = new RegExp(compile.source.left_delimiter + '/literal' + compile.source.right_delimiter);
    compile.openTag('literal', [null, literal, compile.source.literal, compile.source.left_delimiter_raw, compile.source.right_delimiter_raw]);
    if (literal) {
        compile.source.literal = true;
    }
    else {
        compile.source.changDelimiter(delim_left, delim_right);
    }
    return '';
});
compile_1.Compile.registerCompile('literal_close', function (name, compile) {
    var _a = compile.closeTag(['literal']), data = _a[1];
    var literal = data[1], old_literal = data[2], old_left = data[3], old_right = data[4];
    if (literal) {
        compile.source.literal = old_literal;
    }
    else {
        compile.source.changDelimiter(old_left, old_right);
    }
    return '';
});
//# sourceMappingURL=delim.js.map