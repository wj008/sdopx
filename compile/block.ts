import {Compile} from "../lib/compile";
class Compile_Block {

    public static block(tagname, args, compile:Compile) {
        let {name=null,hide=false,append=false,prepend=false} = args;
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
        } else {
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
    }

    public static block_close(tagname, compile:Compile) {
        let [,data]= compile.closeTag(['block']);
        let code = data[1] || '';
        return code;
    }

}
module.exports = Compile_Block;
