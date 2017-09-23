"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('foreach', function (name, args, compile) {
    var _a = args.from, from = _a === void 0 ? null : _a, _b = args.item, item = _b === void 0 ? null : _b, _c = args.key, key = _c === void 0 ? null : _c, _d = args.attr, attr = _d === void 0 ? null : _d;
    if (from === null) {
        compile.addError("The foreach tag 'from' is a must.");
    }
    if (item === null) {
        compile.addError("The foreach tag 'item' is a must.");
    }
    item = item.replace(/^['"]+|['"]+$/g, '');
    if (item == '' || !/\w+/.test(item)) {
        compile.addError("The foreach tag 'item' does not match the label attribute syntax");
    }
    if (key !== null) {
        key = key.replace(/^['"]+|['"]+$/g, '');
        if (key == '' || !/\w+/.test(key)) {
            compile.addError("The foreach tag 'key' does not match the label attribute syntax");
        }
    }
    if (attr !== null) {
        attr = attr.replace(/^['"]+|['"]+$/g, '');
        if (attr == '' || !/\w+/.test(attr)) {
            compile.addError("The foreach tag 'attr' does not match the label attribute syntax");
        }
    }
    var prefix = compile.getTempPrefix('each');
    var vars = compile.getVarter(prefix);
    vars.add(item);
    if (key !== null) {
        vars.add(key);
    }
    if (attr !== null) {
        vars.add(attr);
    }
    compile.addVar(vars);
    var output = [];
    output.push("var __" + prefix + "_from=(function(f){ if(f instanceof Array){return f; } var t=[];t.__object=true; for(var k in f){ t.push({ key:k, value:f[k]}); }  return t;})(" + from + ");");
    output.push("for(var __" + prefix + "_i=0;__" + prefix + "_i<__" + prefix + "_from.length;__" + prefix + "_i++){ ");
    output.push("var " + prefix + "_" + item + "=__" + prefix + "_from.__object?__" + prefix + "_from[__" + prefix + "_i].value:__" + prefix + "_from[__" + prefix + "_i];");
    if (key !== null) {
        output.push("var " + prefix + "_" + key + "=__" + prefix + "_from.__object?__" + prefix + "_from[__" + prefix + "_i].key:__" + prefix + "_i;");
    }
    if (attr !== null) {
        output.push("var " + prefix + "_" + attr + " = { ");
        output.push("   index:__" + prefix + "_i,");
        output.push("   iteration:__" + prefix + "_i+1,");
        output.push("   total:__" + prefix + "_from.length,");
        output.push("   first:__" + prefix + "_i==0,");
        output.push("   last:__" + prefix + "_i==__" + prefix + "_from.length-1");
        output.push("};");
    }
    compile.openTag('foreach', [prefix, key, attr]);
    return output.join('\n');
});
compile_1.Compile.registerCompile('foreachelse', function (name, args, compile) {
    var _a = compile.closeTag(['foreach']), data = _a[1];
    var prefix = data[0];
    compile.openTag('foreachelse', data);
    var output = [];
    output.push('}');
    output.push("if(__" + prefix + "_from.length==0){");
    return output.join('\n');
});
compile_1.Compile.registerCompile('foreach_close', function (name, compile) {
    var _a = compile.closeTag(['foreach', 'foreachelse']), data = _a[1];
    compile.removeVar(data[0]);
    var output = [];
    output.push('}');
    return output.join('\n');
});
//# sourceMappingURL=foreach.js.map