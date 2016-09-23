"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var compile_1 = require("./lib/compile");
var resource_1 = require("./lib/resource");
var template_1 = require("./lib/template");
var Sdopx = (function (_super) {
    __extends(Sdopx, _super);
    function Sdopx(res) {
        if (res === void 0) { res = null; }
        _super.call(this);
        this.res = null;
        this._book = {};
        this._plugin = {};
        this._config = {};
        this._Sdopx = Sdopx;
        //强制编译
        this.force_compile = false;
        //检查编译
        this.compile_check = true;
        this.extends_uid = {};
        //模板目录
        this.template_dirs = {};
        this.template_index = 0;
        this.res = res;
        this.setTemplateDir(Sdopx.view_paths);
    }
    Sdopx.prototype.assign = function (key, value) {
        if (value === void 0) { value = null; }
        if (typeof key == 'string') {
            this._book[key] = value;
            return;
        }
        try {
            for (var i in key) {
                if (typeof i == 'string') {
                    this.assign(i, key[i]);
                }
            }
        }
        catch (e) {
            this.rethrow('assign error!');
        }
    };
    Sdopx.prototype.display = function (tplname) {
        if (this.res) {
            this.res.write(this.fetch(tplname));
            this.res.end();
            return;
        }
        return this.fetch(tplname);
    };
    //设置模板
    Sdopx.prototype.setTemplateDir = function (dirnames) {
        this.template_dirs = {};
        this.template_index = 0;
        if (!dirnames) {
            return;
        }
        if (typeof (dirnames) === 'string') {
            this.template_dirs[this.template_index] = dirnames;
            this.template_index++;
        }
        else {
            for (var key in dirnames) {
                var value = dirnames[key];
                if (!(typeof (key) === 'number' || typeof (key) === 'string')) {
                    continue;
                }
                if (typeof (value) !== 'string') {
                    continue;
                }
                this.template_dirs[key] = value;
            }
        }
    };
    //添加模板
    Sdopx.prototype.addTemplateDir = function (dirnames) {
        if (!dirnames) {
            return;
        }
        if (typeof (dirnames) === 'string') {
            this.template_dirs[this.template_index] = dirnames;
            this.template_index++;
        }
        else {
            for (var key in dirnames) {
                var value = dirnames[key];
                if (!(typeof (key) === 'number' || typeof (key) === 'string')) {
                    continue;
                }
                if (typeof (value) !== 'string') {
                    continue;
                }
                this.template_dirs[key] = value;
            }
        }
    };
    //获取模板
    Sdopx.prototype.getTemplateDir = function (key) {
        if (key === void 0) { key = null; }
        if (key === null) {
            return this.template_dirs;
        }
        if (typeof (key) === 'string' || typeof (key) === 'number') {
            return this.template_dirs[key] || null;
        }
        return null;
    };
    //获取路径拼接
    Sdopx.prototype.getTemplateJoined = function () {
        var temp = [];
        for (var i in this.template_dirs) {
            var val = this.template_dirs[i];
            temp.push(val);
        }
        return temp.join(';');
    };
    //注册资源类型
    Sdopx.registerResource = function (type, sourceObj) {
        resource_1.Resource.registerResource(type, sourceObj);
    };
    //注册过滤器
    Sdopx.registerFilter = function (type, filter) {
        if (!Sdopx.Filters[type]) {
            Sdopx.Filters[type] = [];
        }
        Sdopx.Filters[type].push(filter);
    };
    //注册函数
    Sdopx.registerFunction = function (name, func) {
        if (typeof (name) !== 'string' || typeof (func) !== 'function') {
            return;
        }
        Sdopx.Functions[name] = func;
    };
    //注册修饰器
    Sdopx.registerModifier = function (name, func) {
        if (typeof (name) !== 'string' || typeof (func) !== 'function') {
            return;
        }
        Sdopx.Modifiers[name] = func;
    };
    //注册修饰器
    Sdopx.registerCompileModifier = function (name, func) {
        if (typeof (name) !== 'string' || typeof (func) !== 'function') {
            return;
        }
        Sdopx.CompileModifiers[name] = func;
    };
    //注册插件
    Sdopx.registerPlugin = function (name, func, type) {
        if (type === void 0) { type = 1; }
        if (typeof (name) !== 'string' || typeof (func) !== 'function') {
            return;
        }
        if (!(type == 1 || type == 2)) {
            return;
        }
        func.__type = type;
        Sdopx.Plugins[name] = func;
    };
    //注册编译器
    Sdopx.registerCompile = function (name, func) {
        if (func === void 0) { func = null; }
        compile_1.Compile.registerCompile(name, func);
    };
    //抛出异常
    Sdopx.prototype.rethrow = function (err, lineno, tplname) {
        if (lineno === void 0) { lineno = null; }
        if (tplname === void 0) { tplname = null; }
        if (typeof err == 'string') {
            err = new Error(err);
        }
        if (lineno == null || tplname == null) {
            throw err;
            return;
        }
        var _a = resource_1.Resource.parseResourceName(tplname), type = _a.type, name = _a.name;
        var resource = resource_1.Resource.getResource(type);
        if (!resource) {
            err.path = tplname;
            err.message = (tplname || 'sdp') + ':'
                + lineno + '\n'
                + err.message;
            throw err;
        }
        var _b = resource.fetch(name, this.sdopx), _c = _b.content, content = _c === void 0 ? '' : _c, _d = _b.timestamp, timestamp = _d === void 0 ? 0 : _d, _e = _b.filepath, filepath = _e === void 0 ? tplname : _e;
        var lines = content.split('\n'), start = Math.max(lineno - 3, 0), end = Math.min(lines.length, lineno + 3);
        var context = lines.slice(start, end).map(function (line, i) {
            var curr = i + start + 1;
            return (curr == lineno ? ' >> ' : '    ')
                + curr
                + '| '
                + line;
        }).join('\n');
        err.path = filepath;
        err.message = (filepath || 'sdp') + ':'
            + lineno + '\n'
            + context + '\n\n'
            + err.message;
        throw err;
    };
    Sdopx.prototype.addError = function (err, lineno, tplname) {
        if (lineno === void 0) { lineno = null; }
        if (tplname === void 0) { tplname = null; }
        this.rethrow(err, lineno, tplname);
    };
    Sdopx.version = '1.0.2';
    Sdopx.debug = false;
    Sdopx.create_runfile = false;
    Sdopx.view_paths = './views/';
    //注册的函数
    Sdopx.Functions = {};
    //注册的修饰器
    Sdopx.Modifiers = {};
    //注册的修饰器
    Sdopx.CompileModifiers = {};
    //注册的过滤器
    Sdopx.Filters = {};
    //注册的资源类型
    Sdopx.Resources = {};
    //注册的插件
    Sdopx.Plugins = {};
    return Sdopx;
}(template_1.Template));
exports.Sdopx = Sdopx;
require('./lib/plugins').register(Sdopx);
//# sourceMappingURL=sdopx.js.map