import {Compile} from "./lib/compile";
import {Resource} from "./lib/resource";
import {Template} from "./lib/template";
import fs =require('fs');
import crypto=require('crypto');

export class Sdopx extends Template {

    public static version = (function () {
        let {version} = JSON.parse(fs.readFileSync(__dirname + `/package.json`, 'utf-8'));
        return version;
    })();
    public static debug = false;
    public static extension = 'opx';
    public static create_runfile = false;
    public static left_delimiter = '{';
    public static right_delimiter = '}';

    public context = null;

    public _book = {};
    public _plugin = {};
    public _config = {};
    public _Sdopx = Sdopx;
    public static view_paths = './views/';

    //强制编译
    public force_compile = false;
    //检查编译
    public compile_check = true;
    //注册的函数
    public static Functions = {};
    //注册的修饰器
    public static Modifiers = {};
    //注册的修饰器
    public static CompileModifiers = {};
    //注册的过滤器
    public static Filters = {};
    //注册的资源类型
    public static Resources = {};
    //注册的插件
    public static Plugins = {};

    public extends_uid = {};
    //模板目录
    private template_dirs = {};
    private template_index = 0;
    private _joined: string = null;

    public left_delimiter;
    public right_delimiter;

    public constructor(context = null) {
        super();
        this.left_delimiter = Sdopx.left_delimiter || '{';
        this.right_delimiter = Sdopx.right_delimiter || '}';
        let _sdopx = this._book['sdopx'] = {};
        _sdopx['config'] = this._config;
        _sdopx['ldelim'] = this.left_delimiter;
        _sdopx['rdelim'] = this.right_delimiter;
        this.context = context;
        this.setTemplateDir(Sdopx.view_paths);
    }

    public assign(key, value = null) {
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
        } catch (e) {
            this.rethrow('assign error!');
        }
    }

    public assignConfig(key, value = null) {
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
        } catch (e) {
            this.rethrow('assignConfig error!');
        }
    }

    public display(tplname) {
        if (this.context) {
            this.context.write(this.fetch(tplname));
            this.context.end();
            return;
        }
        return this.fetch(tplname);
    }

    //设置模板
    public setTemplateDir(dirnames) {
        this.template_dirs = {};
        this.template_index = 0;
        if (!dirnames) {
            return;
        }
        this._joined = null;
        if (typeof(dirnames) === 'string') {
            this.template_dirs[this.template_index] = dirnames;
            this.template_index++;
        }
        else {
            for (let key in dirnames) {
                let value = dirnames[key];
                if (!(typeof(key) === 'number' || typeof(key) === 'string')) {
                    continue;
                }
                if (typeof(value) !== 'string') {
                    continue;
                }
                this.template_dirs[key] = value;
            }
        }
    }

    //添加模板
    public addTemplateDir(dirnames) {
        if (!dirnames) {
            return;
        }
        this._joined = null;
        if (typeof(dirnames) === 'string') {
            this.template_dirs[this.template_index] = dirnames;
            this.template_index++;
        }
        else {
            for (let key in dirnames) {
                let value = dirnames[key];
                if (!(typeof(key) === 'number' || typeof(key) === 'string')) {
                    continue;
                }
                if (typeof(value) !== 'string') {
                    continue;
                }
                this.template_dirs[key] = value;
            }
        }
    }

    //获取模板
    public getTemplateDir(key = null) {
        if (key === null) {
            return this.template_dirs;
        }
        if (typeof(key) === 'string' || typeof(key) === 'number') {
            return this.template_dirs[key] || null;
        }
        return null;
    }

    //获取路径拼接
    public getTemplateJoined(): string {
        if (this._joined) {
            return this._joined;
        }
        let temp = [];
        for (let i in this.template_dirs) {
            let val = this.template_dirs[i];
            temp.push(val);
        }
        let joined = temp.join(';');
        if (joined[32]) {
            let instance = crypto.createHash('md5');
            instance.update(joined, 'utf8');
            joined = instance.digest('hex') + '_';
        }
        return this._joined = joined;
    }

    //注册资源类型
    public static registerResource(type, sourceObj) {
        Resource.registerResource(type, sourceObj);
    }

    //注册过滤器
    public static registerFilter(type, filter) {
        if (!Sdopx.Filters[type]) {
            Sdopx.Filters[type] = [];
        }
        Sdopx.Filters[type].push(filter);
    }

    //注册函数
    public static registerFunction(name, func) {
        if (typeof(name) !== 'string' || typeof(func) !== 'function') {
            return;
        }
        Sdopx.Functions[name] = func;
    }

    //注册修饰器
    public static registerModifier(name, func) {
        if (typeof(name) !== 'string' || typeof(func) !== 'function') {
            return;
        }
        Sdopx.Modifiers[name] = func;
    }

    //注册修饰器
    public static registerCompileModifier(name, func) {
        if (typeof(name) !== 'string' || typeof(func) !== 'function') {
            return;
        }
        Sdopx.CompileModifiers[name] = func;
    }

    //注册插件
    public static registerPlugin(name, func, type = 1) {
        if (typeof(name) !== 'string' || typeof(func) !== 'function') {
            return;
        }
        if (!(type == 1 || type == 2)) {
            return;
        }
        func.__type = type;
        Sdopx.Plugins[name] = func;
    }

    //注册编译器
    public static registerCompile(name, func = null) {
        Compile.registerCompile(name, func);
    }

    //抛出异常
    public rethrow(err, lineno = null, tplname = null) {
        if (typeof err == 'string') {
            err = new Error(err);
        }
        if (lineno == null || tplname == null) {
            throw err;
        }
        let {type, name}=Resource.parseResourceName(tplname);
        let resource = Resource.getResource(type);
        if (!resource) {
            err.path = tplname;
            err.message = (tplname || Sdopx.extension) + ':'
                + lineno + '\n'
                + err.message;
            throw err;
        }
        let {content = '', timestamp = 0, filepath = tplname} =resource.fetch(name, this.sdopx);
        var lines = content.split('\n')
            , start = Math.max(lineno - 3, 0)
            , end = Math.min(lines.length, lineno + 3);
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

    public addError(err, lineno = null, tplname = null) {
        this.rethrow(err, lineno, tplname);
    }
}
require("./lib/plugins");