import {Compile} from "../lib/compile";
//很可能不被加入
class Compile_Switch {

    public static switch(name, args, compile:Compile) {
        let {value=null, code=null } = args;
        if (code === null) {
            if (value === null) {
                compile.addError(`The switch tag 'value' is a must.`);
            }
            compile.openTag('switch', [null, false]);
            return `switch(${value}){ /*`;
        }
        compile.openTag('switch', [null, false]);
        return `switch(${code}){ /* `;
    }

    public static case(name, args, compile:Compile) {
        let obreak = args.break === void 0 ? true : args.break;
        let values = [];
        for (let item in args) {
            if (/^value[0-9]*$/.test(item)) {
                values.push(args[item]);
            }
        }
        if (values.length == 0) {
            compile.addError(`The case tag 'value' is a must.`);
        }
        let [tag,data]=compile.closeTag(['switch', 'case']);
        let output = [];
        if (tag == 'switch') {
            output.push(' */');
        }
        else {
            if (data[1]) {
                output.push('break;');
            }
        }
        compile.openTag('case', [null, obreak]);
        for (let i = 0; i < values.length; i++) {
            output.push('case ' + values[i] + ' :');
        }
        return output.join('\n');
    }

    public static default(name, args, compile:Compile) {
        let [tag,data]=compile.closeTag(['switch', 'case']);
        let output = [];
        if (tag == 'switch') {
            output.push(' */');
        }
        else {
            if (data[1]) {
                output.push('break;');
            }
        }
        compile.openTag('default', [null, true]);
        output.push('default :');
        return output.join('\n');
    }

    public static switch_close(name, compile) {
        let [tag,data]=compile.closeTag(['switch', 'default', 'case']);
        let output = [];
        if (tag == 'switch') {
            output.push(' */');
        }
        else {
            if (data[1]) {
                output.push('break;');
            }
        }
        output.push('}');
        return output.join('\n');
    }
}
module.exports = Compile_Switch;
