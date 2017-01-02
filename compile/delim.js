"use strict";
const compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('ldelim', (name, args, compile) => {
    return '__raw(' + JSON.stringify(compile.source.left_delimiter_raw) + ');';
});
compile_1.Compile.registerCompile('rdelim', (name, args, compile) => {
    return '__raw(' + JSON.stringify(compile.source.right_delimiter_raw) + ');';
});
compile_1.Compile.registerCompile('literal', (name, args, compile) => {
    let { left = `'{@'`, right = `'@}'` } = args;
    var $_sdopx = compile.sdopx;
    let tplleft = '';
    try {
        tplleft = eval('(' + left + ')');
    }
    catch (e) {
        compile.addError('left delimiter parsing error');
    }
    let tplright = '';
    try {
        tplright = eval('(' + right + ')');
    }
    catch (e) {
        compile.addError('right delimiter parsing error');
    }
    if (!tplleft || typeof (tplleft) !== 'string' || tplleft == '') {
        compile.addError('left delimiter can not be empty');
    }
    if (!tplright || typeof (tplright) !== 'string' || tplright == '') {
        compile.addError('right delimiter can not be empty');
    }
    let reg = new RegExp(compile.source.left_delimiter + '/literal' + compile.source.right_delimiter);
    compile.source.end_literal = reg;
    compile.openTag('literal', [null, compile.source.left_delimiter_raw, compile.source.right_delimiter_raw]);
    compile.source.changDelimiter(tplleft, tplright);
    return '';
});
compile_1.Compile.registerCompile('literal_close', (name, compile) => {
    let [, data] = compile.closeTag(['literal']);
    let [, left, rigth] = data;
    compile.source.changDelimiter(left, rigth);
    return '';
});
//# sourceMappingURL=delim.js.map