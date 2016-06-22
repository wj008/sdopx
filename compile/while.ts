import {Compile} from "../lib/compile";
class Compile_While {

    public static while(name, args, compile:Compile) {
        compile.openTag('while');
        return `while(${args.code}){`;
    }

    public static while_close(name, compile) {
        compile.closeTag(['while']);
        return `}`;
    }
}
module.exports = Compile_While;
