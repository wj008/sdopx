import {Compile} from "../lib/compile";
class Compile_If {

    public static if(name, args, compile:Compile) {
        compile.openTag('if');
        return `if(${args.code}){`;
    }

    public static  else(name, args, compile:Compile) {
        compile.closeTag(['if', 'elseif']);
        compile.openTag('else');
        return `} else {`;
    }

    public static elseif(name, args, compile:Compile) {
        compile.closeTag(['if', 'elseif']);
        compile.openTag('elseif');
        return `} else if(${args.code}){`;
    }

    public static if_close(name, compile) {
        compile.closeTag(['if', 'else', 'elseif']);
        return `}`;
    }
}
module.exports = Compile_If;
