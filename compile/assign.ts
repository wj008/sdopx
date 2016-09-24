import {Compile} from "../lib/compile";
class Compile_Assign {

    //注册变量
    public static assign(name, args, compile:Compile) {
        let key = args.var || null;
        let {value=null, code=null } = args;
        if (code == null) {
            if (key === null) {
                compile.addError('The assign tag \'var\' is a must.');
            }
            if (value === null) {
                compile.addError('The assign tag \'value\' is a must.');
            }
            if (key == '' || !/^\w+$/.test(key)) {
                compile.addError(`assign tag attribute syntax error in 'var', mast be string`);
            }
            if (compile.hasVar(key)) {
                let temp = compile.getVar(key);
                return temp.replace(/@key/g, key, temp) + ' = ' + value + ';';
            }
            let prefix = compile.getLastPrefix();
            let vars = compile.getVarter(prefix);
            vars.add(key);
            compile.addVar(vars);
            let temp = compile.getVar(key);
            return 'var ' + temp.replace(/@key/g, key, temp) + ' = ' + value + ';';

        } else {
            let m = code.match(/^\$_sdopx\._book\['(\w+)'\](.+)/);
            if (!m) {
                return code + ';';
            }
            let key = m[1];
            let other = m[2];
            if (compile.hasVar(key)) {
                let temp = compile.getVar(key);
                return temp.replace(/@key/g, key, temp) + other + ';';
            }
            let prefix = compile.getLastPrefix();
            let vars = compile.getVarter(prefix);
            vars.add(key);
            compile.addVar(vars);
            let temp = compile.getVar(key);
            if (/^\s*(=(?!=))/.test(other)) {
                return 'var ' + temp.replace(/@key/g, key, temp) + other + ';';
            } else {
                return temp.replace(/@key/g, key, temp) + other + ';';
            }
        }
    }

    //全局注册
    public static global(name, args, compile:Compile) {
        let key = args.var || null;
        let {value=null,code=null } = args;
        if (code == null) {
            if (key === null) {
                compile.addError('The global tag \'var\' is a must.');
            }
            if (value === null) {
                compile.addError('The global tag \'value\' is a must.');
            }
            if (key == '' || !/^\w+$/.test(key)) {
                compile.addError(`global tag attribute syntax error in 'var'.`);
            }
            return '$_sdopx._book[\'' + key + '\'] = ' + value + ';';
        } else {
            //如果是全局的
            let m = code.match(/^\$_sdopx\._book/);
            if (/^\$_sdopx\._book/.test(code.trim())) {
                return code + ';';
            }
            let mx = code.trim().match(/^[a-z]+[0-9]*_(\w+)(.+)/);
            if (!mx) {
                return code + ';';
            }
            let key = mx[1];
            let other = mx[2];
            return '$_sdopx._book[\'' + key + '\']' + other + ';';
        }
    }

}
module.exports = Compile_Assign;
