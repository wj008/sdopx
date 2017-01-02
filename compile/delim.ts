import {Compile} from "../lib/compile";

Compile.registerCompile('ldelim', (name, args, compile: Compile) => {
    return '__raw(' + JSON.stringify(compile.source.left_delimiter_raw) + ');';
});

Compile.registerCompile('rdelim', (name, args, compile: Compile) => {
    return '__raw(' + JSON.stringify(compile.source.right_delimiter_raw) + ');';
});

Compile.registerCompile('literal', (name, args, compile: Compile) => {
    let {left = `'{@'`, right = `'@}'`}=args;
    var $_sdopx = compile.sdopx;
    let tplleft = '';
    try {
        tplleft = eval('(' + left + ')');
    } catch (e) {
        compile.addError('left delimiter parsing error');
    }
    let tplright = '';
    try {
        tplright = eval('(' + right + ')');
    } catch (e) {
        compile.addError('right delimiter parsing error');
    }
    if (!tplleft || typeof(tplleft) !== 'string' || tplleft == '') {
        compile.addError('left delimiter can not be empty');
    }
    if (!tplright || typeof(tplright) !== 'string' || tplright == '') {
        compile.addError('right delimiter can not be empty');
    }
    let reg = new RegExp(compile.source.left_delimiter + '/literal' + compile.source.right_delimiter);
    compile.source.end_literal = reg;
    compile.openTag('literal', [null, compile.source.left_delimiter_raw, compile.source.right_delimiter_raw]);
    compile.source.changDelimiter(tplleft, tplright);
    return '';
});

Compile.registerCompile('literal_close', (name, compile: Compile) => {
    let [,data]=compile.closeTag(['literal']);
    let [,left,rigth]=data;
    compile.source.changDelimiter(left, rigth);
    return '';
});

