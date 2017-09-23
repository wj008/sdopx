"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var resource_1 = require("./resource");
var compile_1 = require("./compile");
var utils = require("./utils");
var fs = require("fs");
var crypto = require("crypto");
var Template = (function () {
    //构造函数
    function Template(tplname, sdopx, parent) {
        if (tplname === void 0) { tplname = null; }
        if (sdopx === void 0) { sdopx = null; }
        if (parent === void 0) { parent = null; }
        //模板对象
        this.sdopx = null;
        //模板ID
        this.tplId = null;
        //父模板
        this.parent = null;
        //模板名称
        this.tplname = null;
        //模板依赖项
        this.property = { dependency: {}, unifunc: null };
        //继承的模板
        this.extends_tplId = {};
        //需要重新编译
        this.recomplie = false;
        //资源
        this.source = null;
        this.complie = null;
        this.tplname = tplname;
        this.sdopx = sdopx || this;
        this.parent = parent;
        if (tplname !== null) {
            this.tplId = this.createTplId(this.tplname);
        }
    }
    //创建模板识别ID
    Template.prototype.createTplId = function (tplname) {
        var _a = resource_1.Resource.parseResourceName(tplname), type = _a.type, name = _a.name;
        if (type !== 'file') {
            var instance = crypto.createHash('md5');
            instance.update(name, 'utf8');
            name = instance.digest('hex');
        }
        var temp = this.sdopx.getTemplateJoined() + name;
        temp = temp.replace(/[.\/\\:\|;]/g, '_');
        return type + '_' + temp;
    };
    Template.prototype.getSource = function () {
        if (this.source != null) {
            return this.source;
        }
        this.source = resource_1.Resource.getTplSource(this);
        return this.source;
    };
    Template.prototype.getCompile = function () {
        if (this.complie != null) {
            return this.complie;
        }
        this.complie = new compile_1.Compile(this.sdopx, this);
        return this.complie;
    };
    //创建子模板
    Template.prototype.createChildTemplate = function (tplname) {
        return new Template(tplname, this.sdopx, this);
    };
    Template.prototype.fetch = function (tplname) {
        this.tplname = tplname;
        this.tplId = this.createTplId(this.tplname);
        return this.fetchTpl();
    };
    //输出模板内容
    Template.prototype.fetchTpl = function () {
        var codeid = this.tplId;
        //如果强制编译
        if (this.sdopx.force_compile) {
            return this.compileTemplate(codeid);
        }
        //如果检查编译
        if (this.sdopx.compile_check) {
            return this.runTemplate(codeid);
        }
        //如果存在缓存检查编译
        if (Template.complie_cache[codeid]) {
            return this.runTemplate(codeid);
        }
        return this.compileTemplate(codeid);
    };
    //运行
    Template.prototype.run = function (unifunc) {
        var __output = [];
        var self = this;
        //转意输出
        var __echo = function (code) {
            if (code == null) {
                return;
            }
            if (typeof code == 'string') {
                code = utils.escapeXml(code);
            }
            __output.push(String(code));
        };
        //直接输出
        var __raw = function (code) {
            if (code == null) {
                return;
            }
            __output.push(String(code));
        };
        //错误异常
        var __throw = function (e, lineno, filename) {
            self.sdopx.rethrow(e, lineno, filename);
        };
        unifunc.call(null, this.sdopx, __echo, __raw, __throw);
        var out = __output.join('');
        if (this === this.sdopx && index_1.Sdopx.Filters['output'] && index_1.Sdopx.Filters['output'] instanceof Array) {
            for (var i = 0; i < index_1.Sdopx.Filters['output'].length; i++) {
                var func = index_1.Sdopx.Filters['output'][i];
                out = func(out, this.sdopx);
            }
        }
        return out;
    };
    //运行模板
    Template.prototype.runTemplate = function (codeid) {
        if (Template.complie_cache[codeid]) {
            var item = Template.complie_cache[codeid];
            if (this.validProperties(item) && item.unifunc && typeof item.unifunc == 'function') {
                return this.run(item.unifunc);
            }
        }
        return this.compileTemplate(codeid);
    };
    //编译运行模板
    Template.prototype.compileTemplate = function (codeid) {
        var code = this.compileTemplateSource();
        var unifunc = this.writeCachedCompile(code, codeid);
        if (unifunc && typeof unifunc) {
            return this.run(unifunc);
        }
        return this.sdopx._out.toCode();
    };
    //写入缓存
    Template.prototype.writeCachedCompile = function (code, codeid) {
        try {
            var out = [];
            out.push('var __Sdopx=$_sdopx._Sdopx;');
            if (index_1.Sdopx.debug) {
                out.push('var __line=0,__src=\'' + this.source.tplname + '\';');
                out.push('try{');
            }
            out.push(code);
            if (index_1.Sdopx.debug) {
                out.push('}catch(e){__throw(e,__line,__src);}');
            }
            code = out.join('\n');
            if (index_1.Sdopx.create_runfile) {
                fs.writeFileSync(codeid + '.js', code);
            }
            var unifunc = new Function('$_sdopx,__echo,__raw,__throw', code);
            this.property.unifunc = unifunc;
            Template.complie_cache[codeid] = this.property;
            return unifunc;
        }
        catch (e) {
            if (e instanceof SyntaxError) {
                e.message += ' while compiling ' + index_1.Sdopx.extension;
            }
            throw e;
        }
    };
    //编译资源
    Template.prototype.compileTemplateSource = function () {
        var source = this.getSource();
        if (!source.isload) {
            source.load();
        }
        this.addDependency(source);
        return this.getCompile().compileTemplate();
    };
    Template.prototype.addDependency = function (source) {
        if (this.parent) {
            this.parent.addDependency(source);
        }
        var tplId = source.tplId;
        this.property.dependency[tplId] = {
            tplname: source.tplname,
            tplId: tplId,
            time: source.getTimestamp()
        };
    };
    Template.prototype.validProperties = function (item) {
        var _a = item.dependency, dependency = _a === void 0 ? [] : _a;
        if (!this.sdopx.compile_check) {
            return true;
        }
        if (this.sdopx.force_compile) {
            return false;
        }
        for (var i in dependency) {
            var file = dependency[i];
            var source = resource_1.Resource.getSource(this.sdopx, file.tplname, file.tplId);
            var mtime = source.getTimestamp();
            if (mtime == 0 || mtime > file.time) {
                return false;
            }
        }
        return true;
    };
    //获取子模板
    Template.prototype.getSubTemplate = function (tplname, params) {
        if (params === void 0) { params = {}; }
        var temp = {};
        for (var key in params) {
            var val = params[key];
            if (this.sdopx._book[key] !== void 0) {
                temp[key] = this.sdopx._book[key];
            }
            this.sdopx._book[key] = val;
        }
        var tpl = this.createChildTemplate(tplname);
        var code = tpl.fetchTpl();
        for (var key in params) {
            if (temp[key] !== void 0) {
                this.sdopx._book[key] = temp[key];
            }
            else {
                delete this.sdopx._book[key];
            }
        }
        return code;
    };
    //缓存编译后的代码
    Template.complie_cache = {};
    return Template;
}());
exports.Template = Template;
//# sourceMappingURL=template.js.map