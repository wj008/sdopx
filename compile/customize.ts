import {Compile} from "../lib/compile";
//自定义的标签
class Compile_Customize {

    public static __customize(name, args, compile:Compile) {
        let Plugins = compile.sdopx._Sdopx.Plugins;
        if (Plugins[name] && Plugins[name].__type == 1 && typeof(Plugins[name]) == 'function') {
            let temp = [];
            for (var key in args) {
                let val = (args[key] == '' || args[key] == null) ? 'null' : args[key];
                temp.push(`'${key}':${val}`);
            }
            let params = `{${temp.join(',')}}`;
            return `__Sdopx.Plugins[${JSON.stringify(name)}](${params},{echo:__echo,raw:__raw},$_sdopx);`;
        }
        if (Plugins[name] && Plugins[name].__type == 2 && typeof(Plugins[name]) == 'function') {
            let {assign=null} = args;
            if (assign === null) {
                compile.addError(`The customize '${name}' tag 'assign' is a must.`);
            }
            assign = assign.replace(/^['"]+|['"]+$/g, '');
            if (assign == '' || !/\w+/.test(assign)) {
                compile.addError(`The customize '${name}' tag 'item' does not match the label attribute syntax`);
            }
            delete args.assign;
            let temp = [];
            for (var key in args) {
                let val = (args[key] == '' || args[key] == null) ? 'null' : args[key];
                temp.push(`'${key}':${val}`);
            }
            let params = `{${temp.join(',')}}`;
            let prefix = compile.getTempPrefix('custom');
            let vars = compile.getVarter(prefix);
            vars.add(assign);
            compile.addVar(vars);
            compile.openTag(name, [prefix, assign]);
            return `__Sdopx.Plugins[${JSON.stringify(name)}](${params},{echo:__echo,raw:__raw},function(${prefix}_${assign}){`;
        }
        compile.addError(`The customize '${name}' tag is not support.`);
    }

    public static __customize_close(tagname, compile) {
        let [,data]=compile.closeTag([tagname]);
        return `},$_sdopx);`;
    }
}
module.exports = Compile_Customize;
