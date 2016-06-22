import {Compile} from "../lib/compile";
class Compile_Extends {

    public static extends(name, args, compile:Compile) {
        let {file=null} = args;
        if (file === null) {
            compile.addError(`The extends tag 'file' is a must.`);
        }
        let $_sdopx = compile.sdopx;
        let tpl_name = file;
        try {
            tpl_name = eval('(' + file + ')');
        } catch (e) {
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
    }

}
module.exports = Compile_Extends;
