import {Compile} from "../lib/compile";
class Compile_Extends {

    public static call(name, args, compile:Compile) {
        let {fn=null} = args;
        if (fn === null) {
            compile.addError(`The call tag 'fn' is a must.`);
        }
        let temp = [];
        for (var key in args) {
            if (key == 'fn') {
                continue;
            }
            let val = (args[key] == '' || args[key] == null) ? 'null' : args[key];
            temp.push(`'${key}':${val}`);
        }
        let params = `{${temp.join(',')}}`;
        return `if(typeof sdopx_${fn} =='function'){ sdopx_${fn}(${params},{echo:__echo,raw:__raw},$_sdopx);}`;
    }
}
module.exports = Compile_Extends;
