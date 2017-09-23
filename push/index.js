"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var compile_1 = require("./lib/compile");
var resource_1 = require("./lib/resource");
var template_1 = require("./lib/template");
var fs = require("fs");
var crypto = require("crypto");
var SdopxError = (function (_super) {
    __extends(SdopxError, _super);
    function SdopxError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'SdopxError';
        _this.path = '';
        return _this;
    }
    return SdopxError;
}(Error));
exports.SdopxError = SdopxError;
var Sdopx = (function (_super) {
    __extends(Sdopx, _super);
    function Sdopx(context) {
        if (context === void 0) { context = null; }
        var _this = _super.call(this) || this;
        _this.context = null;
        _this._book = {};
        _this._plugin = {};
        _this._config = {};
        _this._Sdopx = Sdopx;
        //强制编译
        _this.force_compile = false;
        //检查编译
        _this.compile_check = true;
        _this.extends_tplId = {};
        //模板目录
        _this.template_dirs = {};
        _this.template_index = 0;
        _this._joined = null;
        _this.funcMap = {};
        _this.left_delimiter = Sdopx.left_delimiter || '{';
        _this.right_delimiter = Sdopx.right_delimiter || '}';
        var _sdopx = _this._book['sdopx'] = {};
        _sdopx['config'] = _this._config;
        _sdopx['ldelim'] = _this.left_delimiter;
        _sdopx['rdelim'] = _this.right_delimiter;
        _this.context = context;
        _this.setTemplateDir(Sdopx.view_paths);
        return _this;
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
    Sdopx.prototype.assignConfig = function (key, value) {
        if (value === void 0) { value = null; }
        if (typeof key == 'string') {
            this._config[key] = value;
            return;
        }
        try {
            for (var i in key) {
                if (typeof i == 'string') {
                    this.assignConfig(i, key[i]);
                }
            }
        }
        catch (e) {
            this.rethrow('assignConfig error!');
        }
    };
    Sdopx.prototype.display = function (tplname) {
        if (this.context) {
            this.context.write(this.fetch(tplname));
            this.context.end();
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
        this._joined = null;
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
        this._joined = null;
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
        if (this._joined) {
            return this._joined;
        }
        var temp = [];
        for (var i in this.template_dirs) {
            var val = this.template_dirs[i];
            temp.push(val);
        }
        var joined = temp.join(';');
        if (joined[32]) {
            var instance = crypto.createHash('md5');
            instance.update(joined, 'utf8');
            joined = instance.digest('hex') + '_';
        }
        return this._joined = joined;
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
            err = new SdopxError(err);
        }
        if (lineno == null || tplname == null) {
            throw err;
        }
        var _a = resource_1.Resource.parseResourceName(tplname), type = _a.type, name = _a.name;
        var resource = resource_1.Resource.getResource(type);
        if (!resource) {
            err.path = tplname;
            err.stack = (tplname || Sdopx.extension) + ':'
                + lineno + "\n\n" + err.stack;
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
        err.stack = (filepath || Sdopx.extension) + ':'
            + lineno + '\n'
            + context + '\n\n'
            + err.stack;
        throw err;
    };
    Sdopx.prototype.addError = function (err, lineno, tplname) {
        if (lineno === void 0) { lineno = null; }
        if (tplname === void 0) { tplname = null; }
        this.rethrow(err, lineno, tplname);
    };
    Sdopx.version = (function () {
        var version = JSON.parse(fs.readFileSync(__dirname + "/package.json", 'utf-8')).version;
        return version;
    })();
    Sdopx.debug = false;
    Sdopx.extension = 'opx';
    Sdopx.create_runfile = false;
    Sdopx.left_delimiter = '{';
    Sdopx.right_delimiter = '}';
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
require("./lib/plugins");
//# sourceMappingURL=index.js.map