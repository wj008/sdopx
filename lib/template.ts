import {Sdopx} from "../sdp";
import {Resource} from "./resource";
import {Source} from "./source";
import {Lexer} from "./lexer";
import {Compile} from "./compile";
const utils = require('./utils');

export class Template {

    //缓存编译后的代码
    public static complie_cache = {};

    //模板对象
    public sdopx = null;

    //模板ID
    public tplID = null;

    //父模板
    public parent = null;

    //模板名称
    public tplname = null;

    //模板依赖项
    public property = {dependency: {}, unifunc: null};

    //继承的模板
    public extends_uid = {};

    //需要重新编译
    public recomplie = false;

    //资源
    private source = null;

    private complie = null;

    //构造函数
    public constructor(tplname:string = null, sdopx:Sdopx = null, parent:Template = null) {
        this.tplname = tplname;
        this.sdopx = sdopx || this;
        this.parent = parent;
        if (tplname !== null) {
            this.tplID = this.createTplId(this.tplname);
        }
    }

    //创建模板识别ID
    private createTplId(tplname:string) {
        let {type,name} = Resource.parseResourceName(tplname);
        let temp = this.sdopx.getTemplateJoined() + name;
        temp = temp.replace(/[.\/\\:\|;]/g, '_');
        return temp;
    }

    public getSource():Source {
        if (this.source != null) {
            return this.source;
        }
        this.source = Resource.getTplSource(this);
        return this.source;
    }

    public getCompile():Compile {
        if (this.complie != null) {
            return this.complie;
        }
        this.complie = new Compile(this.sdopx, this);
        return this.complie;
    }

    //创建子模板
    public createChildTemplate(tplname) {
        return new Template(tplname, this.sdopx, this);
    }

    public fetch(tplname:string) {
        this.tplname = tplname;
        this.tplID = this.createTplId(this.tplname);
        return this.fetchTpl();
    }

    //输出模板内容
    private fetchTpl() {
        let codeid = this.tplID;
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
    }

    //运行
    private run(unifunc) {
        let __output = [];
        let self = this;
        //转意输出
        let __echo = function (code) {
            if (code == null) {
                return;
            }
            if (typeof code == 'string') {
                code = utils.escapeXml(code);
            }
            __output.push(String(code));
        };
        //直接输出
        let __raw = function (code) {
            if (code == null) {
                return;
            }
            __output.push(String(code));
        };
        //错误异常
        let __throw = function (e, lineno, filename) {
            self.sdopx.rethrow(e, lineno, filename);
        }
        unifunc.call(null, this.sdopx, __echo, __raw, __throw);
        let out = __output.join('');
        if (Sdopx.Filters['output'] && Sdopx.Filters['output'] instanceof Array) {
            for (let i = 0; i < Sdopx.Filters['output'].length; i++) {
                let func = Sdopx.Filters['output'][i];
                out = func(out, this.sdopx);
            }
        }
        return out;
    }

    //运行模板
    private runTemplate(codeid) {
        if (Template.complie_cache[codeid]) {
            let item = Template.complie_cache[codeid];
            if (this.validProperties(item) && item.unifunc && typeof item.unifunc) {
                return this.run(item.unifunc);
            }
        }
        return this.compileTemplate(codeid);
    }

    //编译运行模板
    private compileTemplate(codeid) {
        let code = this.compileTemplateSource();
        let unifunc = this.writeCachedCompile(code, codeid);
        if (unifunc && typeof unifunc) {
            return this.run(unifunc);
        }
        return this.sdopx._out.toCode();
    }

    //写入缓存
    private writeCachedCompile(code, codeid) {
        try {
            let out = [];
            out.push('var __Sdopx=$_sdopx._Sdopx;');
            if (Sdopx.debug) {
                out.push('var __line=0,__src=\'' + this.source.tplname + '\';');
                out.push('try{');
            }
            out.push(code);
            if (Sdopx.debug) {
                out.push('}catch(e){__throw(e,__line,__src);}');
            }
            code = out.join('\n');
            if (Sdopx.create_runfile) {
                var fs = fs === void 0 ? require('fs') : fs;
                fs.writeFile(codeid + '.js', code);
            }
            let unifunc = new Function('$_sdopx,__echo,__raw,__throw', code);
            this.property.unifunc = unifunc;
            Template.complie_cache[codeid] = this.property;
            return unifunc;
        }
        catch (e) {
            if (e instanceof SyntaxError) {
                e.message += ' while compiling ejs';
            }
            throw e;
        }
        return null;
    }

    //编译资源
    public compileTemplateSource() {
        let source = this.getSource();
        if (!source.isload) {
            source.load();
        }
        this.addDependency(source);
        return this.getCompile().compileTemplate();
    }

    private addDependency(source:Source) {
        if (this.parent) {
            this.parent.addDependency(source);
        }
        let tplid = source.uid;
        this.property.dependency[tplid] = {
            tplname: source.tplname,
            tplid: tplid,
            time: source.getTimestamp()
        }
    }

    private validProperties(item) {
        let {dependency=[]}=item;
        if (!this.sdopx.compile_check) {
            return true;
        }
        if (this.sdopx.force_compile) {
            return false;
        }
        for (let i in dependency) {
            let file = dependency[i];
            let source = Resource.getSource(this.sdopx, file.tplname, file.tplid);
            let mtime = source.getTimestamp();
            if (mtime == 0 || mtime > file.time) {
                return false;
            }
        }
        return true;
    }

    //获取子模板
    public getSubTemplate(tplname, params = {}) {
        let temp = {};
        for (let key in params) {
            let val = params[key];
            if (this.sdopx._book[key] !== void 0) {
                temp[key] = this.sdopx._book[key];
            }
            this.sdopx._book[key] = val;
        }
        let tpl = this.createChildTemplate(tplname);
        let code = tpl.fetchTpl();
        for (let key in params) {
            if (temp[key] !== void 0) {
                this.sdopx._book[key] = temp[key];
            } else {
                delete  this.sdopx._book[key];
            }
        }
        return code;
    }

}