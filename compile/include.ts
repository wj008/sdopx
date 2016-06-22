import {Compile} from "../lib/compile";
class Compile_Include {

    public static include(name, args, compile:Compile) {
        let {file=null} = args;
        if (file === null) {
            compile.addError(`The include tag 'file' is a must.`);
        }
        delete args.file;
        var isoutput = true;
        try {
            isoutput = eval(args.output === void 0 ? 'true' : args.output);
        } catch (e) {
        }
        delete args.output;
        let output = [];
        if (isoutput) {
            output.push('__raw(');
        }
        let temp = [];
        for (var key in args) {
            let val = (args[key] == '' || args[key] == null) ? 'null' : args[key];
            temp.push(`'${key}':${val}`);
        }
        output.push(`$_sdopx.getSubTemplate(${file},{${temp.join(',')}})`);
        if (isoutput) {
            output.push(')');
        }
        output.push(';');
        return output.join('');
    }

}
module.exports = Compile_Include;
