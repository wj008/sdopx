"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compile_1 = require("../lib/compile");
compile_1.Compile.registerCompile('assign', function (name, args, compile) {
    var key = args.var || null;
    var _a = args.value, value = _a === void 0 ? null : _a, _b = args.code, code = _b === void 0 ? null : _b;
    if (code == null) {
        if (key === null) {
            compile.addError('The assign tag \'var\' is a must.');
        }
        if (value === null) {
            compile.addError('The assign tag \'value\' is a must.');
        }
        if (key == '' || !/^\w+$/.test(key)) {
            compile.addError("assign tag attribute syntax error in 'var', mast be string");
        }
        if (compile.hasVar(key)) {
            var temp_1 = compile.getVar(key);
            return temp_1.replace(/@key/g, key, temp_1) + ' = ' + value + ';';
        }
        var prefix = compile.getLastPrefix();
        var vars = compile.getVarter(prefix);
        vars.add(key);
        compile.addVar(vars);
        var temp = compile.getVar(key);
        return 'var ' + temp.replace(/@key/g, key, temp) + ' = ' + value + ';';
    }
    else {
        var m = code.match(/^\$_sdopx\._book\['(\w+)'\](.+)/);
        if (!m) {
            return code + ';';
        }
        var key_1 = m[1];
        var other = m[2];
        if (compile.hasVar(key_1)) {
            var temp_2 = compile.getVar(key_1);
            return temp_2.replace(/@key/g, key_1, temp_2) + other + ';';
        }
        var prefix = compile.getLastPrefix();
        var vars = compile.getVarter(prefix);
        vars.add(key_1);
        compile.addVar(vars);
        var temp = compile.getVar(key_1);
        if (/^\s*(=(?!=))/.test(other)) {
            return 'var ' + temp.replace(/@key/g, key_1, temp) + other + ';';
        }
        else {
            return temp.replace(/@key/g, key_1, temp) + other + ';';
        }
    }
});
compile_1.Compile.registerCompile('global', function (name, args, compile) {
    var key = args.var || null;
    var _a = args.value, value = _a === void 0 ? null : _a, _b = args.code, code = _b === void 0 ? null : _b;
    if (code == null) {
        if (key === null) {
            compile.addError('The global tag \'var\' is a must.');
        }
        if (value === null) {
            compile.addError('The global tag \'value\' is a must.');
        }
        if (key == '' || !/^\w+$/.test(key)) {
            compile.addError("global tag attribute syntax error in 'var'.");
        }
        return '$_sdopx._book[\'' + key + '\'] = ' + value + ';';
    }
    else {
        //如果是全局的
        var m = code.match(/^\$_sdopx\._book/);
        if (/^\$_sdopx\._book/.test(code.trim())) {
            return code + ';';
        }
        var mx = code.trim().match(/^[a-z]+[0-9]*_(\w+)(.+)/);
        if (!mx) {
            return code + ';';
        }
        var key_2 = mx[1];
        var other = mx[2];
        return '$_sdopx._book[\'' + key_2 + '\']' + other + ';';
    }
});
