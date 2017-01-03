"use strict";
var compile_1 = require("../lib/compile");
//自定义的标签
compile_1.Compile.registerCompile('__customize', function (name, args, compile) {
    var Plugins = compile.sdopx._Sdopx.Plugins;
    if (Plugins[name] && Plugins[name].__type == 1 && typeof (Plugins[name]) == 'function') {
        var temp = [];
        for (var key in args) {
            var val = (args[key] == '' || args[key] == null) ? 'null' : args[key];
            temp.push("'" + key + "':" + val);
        }
        var params = "{" + temp.join(',') + "}";
        return "__Sdopx.Plugins[" + JSON.stringify(name) + "](" + params + ",{echo:__echo,raw:__raw},$_sdopx);";
    }
    if (Plugins[name] && Plugins[name].__type == 2 && typeof (Plugins[name]) == 'function') {
        var _a = args.assign, assign = _a === void 0 ? null : _a;
        if (assign === null) {
            compile.addError("The customize '" + name + "' tag 'assign' is a must.");
        }
        assign = assign.replace(/^['"]+|['"]+$/g, '');
        if (assign == '' || !/\w+/.test(assign)) {
            compile.addError("The customize '" + name + "' tag 'item' does not match the label attribute syntax");
        }
        delete args.assign;
        var temp = [];
        for (var key in args) {
            var val = (args[key] == '' || args[key] == null) ? 'null' : args[key];
            temp.push("'" + key + "':" + val);
        }
        var params = "{" + temp.join(',') + "}";
        var prefix = compile.getTempPrefix('custom');
        var vars = compile.getVarter(prefix);
        vars.add(assign);
        compile.addVar(vars);
        compile.openTag(name, [prefix, assign]);
        return "__Sdopx.Plugins[" + JSON.stringify(name) + "](" + params + ",{echo:__echo,raw:__raw},function(" + prefix + "_" + assign + "){";
    }
    if (/^\w+$/.test(name)) {
        var temp = [];
        for (var key in args) {
            var val = (args[key] == '' || args[key] == null) ? 'null' : args[key];
            temp.push("'" + key + "':" + val);
        }
        var params = "{" + temp.join(',') + "}";
        return "if(typeof sdopx_" + name + " =='function'){ sdopx_" + name + "(" + params + ",{echo:__echo,raw:__raw},$_sdopx);}";
    }
    compile.addError("The customize '" + name + "' tag is not support.");
});
compile_1.Compile.registerCompile('__customize_close', function (tagname, compile) {
    var _a = compile.closeTag([tagname]), data = _a[1];
    return "},$_sdopx);";
});
//# sourceMappingURL=customize.js.map