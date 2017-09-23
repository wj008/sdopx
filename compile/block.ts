import {Compile} from "../lib/compile";

Compile.registerCompile('block', (tagname, args, compile: Compile) => {
    let {name = null, hide = false} = args;
    if (name === null) {
        compile.addError(`The block tag 'name' is a must.`);
    }
    name = name.replace(/^['"]+|['"]+$/g, '');
    if (name == '' || !/\w+/.test(name)) {
        compile.addError(`block tag attribute syntax error in 'name', mast be string`);
    }
    let offset = compile.source.cursor;
    let block = compile.getParentBlock(name);
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

Compile.registerCompile('block_close', (tagname, compile: Compile) => {
    let [, data] = compile.closeTag(['block']);
    let code = data[1] || '';
    return code;
});

