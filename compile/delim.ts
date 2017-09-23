import {Compile} from "../lib/compile";

Compile.registerCompile('ldelim', (name, args, compile: Compile) => {
    return '__raw(' + JSON.stringify(compile.source.left_delimiter_raw) + ');';
});

Compile.registerCompile('rdelim', (name, args, compile: Compile) => {
    return '__raw(' + JSON.stringify(compile.source.right_delimiter_raw) + ');';
});

Compile.registerCompile('literal', (name, args, compile: Compile) => {
    let {left = null, right = null} = args;
    var $_sdopx = compile.sdopx, delim_left = '', delim_right = '', literal = false;
    if (left || right) {
        try {
            delim_left = eval('(' + left + ')');
        } catch (e) {
            compile.addError('left delimiter parsing error');
        }
        try {
            delim_right = eval('(' + right + ')');
        } catch (e) {
            compile.addError('right delimiter parsing error');
        }
        if (!delim_left || typeof(delim_left) !== 'string' || delim_left.trim() == '') {
            compile.addError('left delimiter can not be empty');
        }
        if (!delim_right || typeof(delim_right) !== 'string' || delim_right.trim() == '') {
            compile.addError('right delimiter can not be empty');
        }
        delim_left = delim_left.trim();
        delim_right = delim_right.trim();
    } else {
        literal = true;
    }
    compile.source.end_literal = new RegExp(compile.source.left_delimiter + '/literal' + compile.source.right_delimiter);
    compile.openTag('literal', [null, literal, compile.source.literal, compile.source.left_delimiter_raw, compile.source.right_delimiter_raw]);
    if (literal) {
        compile.source.literal = true;
    } else {
        compile.source.changDelimiter(delim_left, delim_right);
    }
    return '';
});

Compile.registerCompile('literal_close', (name, compile: Compile) => {
    let [, data] = compile.closeTag(['literal']);
    let [, literal, old_literal, old_left, old_right] = data;
    if (literal) {
        compile.source.literal = old_literal;
    } else {
        compile.source.changDelimiter(old_left, old_right);
    }
    return '';
});

