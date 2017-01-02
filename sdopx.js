"use strict";
const compile_1 = require("./lib/compile");
const resource_1 = require("./lib/resource");
const template_1 = require("./lib/template");
class Sdopx extends template_1.Template {
    constructor(res = null) {
        super();
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
        this.left_delimiter = Sdopx.left_delimiter || '{';
        this.rigth_delimiter = Sdopx.rigth_delimiter || '}';
        let _sdopx = this._book['sdopx'] = {};
        _sdopx['config'] = this._config;
        _sdopx['ldelim'] = this.left_delimiter;
        _sdopx['rdelim'] = this.rigth_delimiter;
        this.res = res;
        this.setTemplateDir(Sdopx.view_paths);
    }
    assign(key, value = null) {
        if (typeof key == 'string') {
            this._book[key] = value;
            return;
        }
        try {
            for (let i in key) {
                if (typeof i == 'string') {
                    this.assign(i, key[i]);
                }
            }
        }
        catch (e) {
            this.rethrow('assign error!');
        }
    }
    assignConfig(key, value = null) {
        if (typeof key == 'string') {
            this._config[key] = value;
            return;
        }
        try {
            for (let i in key) {
                if (typeof i == 'string') {
                    this.assignConfig(i, key[i]);
                }
            }
        }
        catch (e) {
            this.rethrow('assignConfig error!');
        }
    }
    display(tplname) {
        if (this.res) {
            this.res.write(this.fetch(tplname));
            this.res.end();
            return;
        }
        return this.fetch(tplname);
    }
    //设置模板
    setTemplateDir(dirnames) {
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
            for (let key in dirnames) {
                let value = dirnames[key];
                if (!(typeof (key) === 'number' || typeof (key) === 'string')) {
                    continue;
                }
                if (typeof (value) !== 'string') {
                    continue;
                }
                this.template_dirs[key] = value;
            }
        }
    }
    //添加模板
    addTemplateDir(dirnames) {
        if (!dirnames) {
            return;
        }
        if (typeof (dirnames) === 'string') {
            this.template_dirs[this.template_index] = dirnames;
            this.template_index++;
        }
        else {
            for (let key in dirnames) {
                let value = dirnames[key];
                if (!(typeof (key) === 'number' || typeof (key) === 'string')) {
                    continue;
                }
                if (typeof (value) !== 'string') {
                    continue;
                }
                this.template_dirs[key] = value;
            }
        }
    }
    //获取模板
    getTemplateDir(key = null) {
        if (key === null) {
            return this.template_dirs;
        }
        if (typeof (key) === 'string' || typeof (key) === 'number') {
            return this.template_dirs[key] || null;
        }
        return null;
    }
    //获取路径拼接
    getTemplateJoined() {
        let temp = [];
        for (let i in this.template_dirs) {
            let val = this.template_dirs[i];
            temp.push(val);
        }
        return temp.join(';');
    }
    //注册资源类型
    static registerResource(type, sourceObj) {
        resource_1.Resource.registerResource(type, sourceObj);
    }
    //注册过滤器
    static registerFilter(type, filter) {
        if (!Sdopx.Filters[type]) {
            Sdopx.Filters[type] = [];
        }
        Sdopx.Filters[type].push(filter);
    }
    //注册函数
    static registerFunction(name, func) {
        if (typeof (name) !== 'string' || typeof (func) !== 'function') {
            return;
        }
        Sdopx.Functions[name] = func;
    }
    //注册修饰器
    static registerModifier(name, func) {
        if (typeof (name) !== 'string' || typeof (func) !== 'function') {
            return;
        }
        Sdopx.Modifiers[name] = func;
    }
    //注册修饰器
    static registerCompileModifier(name, func) {
        if (typeof (name) !== 'string' || typeof (func) !== 'function') {
            return;
        }
        Sdopx.CompileModifiers[name] = func;
    }
    //注册插件
    static registerPlugin(name, func, type = 1) {
        if (typeof (name) !== 'string' || typeof (func) !== 'function') {
            return;
        }
        if (!(type == 1 || type == 2)) {
            return;
        }
        func.__type = type;
        Sdopx.Plugins[name] = func;
    }
    //注册编译器
    static registerCompile(name, func = null) {
        compile_1.Compile.registerCompile(name, func);
    }
    //抛出异常
    rethrow(err, lineno = null, tplname = null) {
        if (typeof err == 'string') {
            err = new Error(err);
        }
        if (lineno == null || tplname == null) {
            throw err;
        }
        let { type, name } = resource_1.Resource.parseResourceName(tplname);
        let resource = resource_1.Resource.getResource(type);
        if (!resource) {
            err.path = tplname;
            err.message = (tplname || Sdopx.extension) + ':'
                + lineno + '\n'
                + err.message;
            throw err;
        }
        let { content = '', timestamp = 0, filepath = tplname } = resource.fetch(name, this.sdopx);
        var lines = content.split('\n'), start = Math.max(lineno - 3, 0), end = Math.min(lines.length, lineno + 3);
        var context = lines.slice(start, end).map(function (line, i) {
            var curr = i + start + 1;
            return (curr == lineno ? ' >> ' : '    ')
                + curr
                + '| '
                + line;
        }).join('\n');
        err.path = filepath;
        err.message = (filepath || Sdopx.extension) + ':'
            + lineno + '\n'
            + context + '\n\n'
            + err.message;
        throw err;
    }
    addError(err, lineno = null, tplname = null) {
        this.rethrow(err, lineno, tplname);
    }
}
Sdopx.version = '1.0.11';
Sdopx.debug = false;
Sdopx.extension = 'opx';
Sdopx.create_runfile = false;
Sdopx.left_delimiter = '{';
Sdopx.rigth_delimiter = '}';
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
exports.Sdopx = Sdopx;
require("./lib/plugins");
//# sourceMappingURL=sdopx.js.map