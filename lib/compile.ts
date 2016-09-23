import {Source} from "./source";
import {Parser} from "./parser";
import {Lexer} from "./lexer";
import {Sdopx} from "../sdopx";
import {Template} from "./template";
import * as CompilePlugins from "../compile";

class Varter {

    public prefix = 'var';
    public data = {};

    public constructor(prefix) {
        this.prefix = prefix;
    }

    public add(name) {
        this.data[name] = this.prefix + '_@key';
    }
}

export class Compile {

    public static Plugins = {};
    //标签栈
    private tag_stack = [];
    //已经关闭
    public closed = false;
    //缓存编译
    private blockData = {};
    private temp_vars = {};
    private varters = {};
    private temp_prefixs = {};
    public source:Source;
    private parser:Parser = null;
    public sdopx:Sdopx = null;
    public tpl:Template = null;

    public constructor(sdopx:Sdopx, tpl:Template) {
        this.sdopx = sdopx;
        this.tpl = tpl;
        this.source = tpl.getSource();
        this.parser = new Parser(sdopx, this, this.source);
    }

    private getSourceInfo(offset = 0) {
        if (offset == 0) {
            offset = this.source.cursor;
        }
        let content = this.source.content.substr(0, offset);
        let temp = content.split('\n');
        let line = temp.length;
        let ofs = temp[line - 1].length;
        return {line: line, offset: ofs, srcname: this.source.tplname};
    }

    public addError(err, offset = 0) {
        let info = this.getSourceInfo(offset);
        this.sdopx.rethrow(err, info.line, info.srcname);
    }

    public compileTemplate() {
        let output = [];
        let i = 0;
        let loop = function () {
            if (this.closed || i >= 100000) {
                return false;
            }
            i++;
            let html_item = this.parser.presHtml();
            if (!html_item) {
                this.closed = true;
                return false;
            }
            if (html_item.code != '') {
                let code = '__raw(' + JSON.stringify(html_item.code) + ');';
                output.push(code);
            }

            if (html_item.next == 'Finish') {
                return false;
            }
            if (html_item.next == 'Init') {
                let tpl_item = this.parser.parsTpl();
                if (!tpl_item) {
                    return false;
                }
                if (Sdopx.debug) {
                    output.push('__line=' + tpl_item.info.line + ',__src=' + JSON.stringify(tpl_item.info.srcname) + ';');
                }
                switch (tpl_item.map) {
                    case Parser.CODE_EXPRESS:
                        if (tpl_item.raw) {
                            output.push('__raw(' + tpl_item.code + ');');
                        }
                        else {
                            output.push('__echo(' + tpl_item.code + ');');
                        }
                        break;
                    case Parser.CODE_ASSIGN:
                        output.push(tpl_item.code + ';');
                        break;
                    case Parser.CODE_TAG:
                    {
                        let name = tpl_item.name;
                        let compfunc = Compile.Plugins[name] || null;
                        let code = null;
                        if (compfunc) {
                            code = compfunc(name, tpl_item.args, this);
                            output.push(code);
                        } else {
                            compfunc = Compile.Plugins['__customize'];
                            code = compfunc(name, tpl_item.args, this);
                            output.push(code);
                        }
                        break;
                    }
                    case Parser.CODE_TAG_END:
                    {
                        let name = tpl_item.name;
                        let compfunc = Compile.Plugins[name + '_close'] || null;
                        let code = null;
                        if (compfunc) {
                            code = compfunc(name, this);
                            output.push(code);
                        } else {
                            compfunc = Compile.Plugins['__customize_close'];
                            code = compfunc(name, this);
                            output.push(code);
                        }
                        break;
                    }
                    default:
                        break;
                }
                return !this.closed;
            }
            if (html_item.next == 'Init_Config') {
                let cfgitem = this.parser.parsConfig();
                if (cfgitem == null) {
                    return false;
                }
                if (Sdopx.debug) {
                    output.push('__line=' + cfgitem.info.line + ',__src=' + JSON.stringify(cfgitem.info.srcname) + ';');
                }
                if (cfgitem.raw) {
                    output.push('__raw(' + cfgitem.code + ');');
                }
                else {
                    output.push('__echo(' + cfgitem.code + ');');
                }
                return !this.closed;
            }
            //处理注释
            if (html_item.next == 'Init_Comment') {
                let cmitem = this.parser.parsComment();
                if (cmitem == null) {
                    return false;
                }
                return !this.closed;
            }

            if (html_item.next == 'Close_Literal') {
                let lit_item = this.parser.parsLiteral();
                if (!lit_item) {
                    return false;
                }
                if (Parser.CODE_TAG_END == lit_item.map) {
                    let name = lit_item.name;
                    let compfunc = Compile.Plugins[name + '_close'];
                    let code = compfunc(name, this);
                    output.push(code);
                }
                return !this.closed;
            }
            return !this.closed;
        };
        while (loop.call(this));
        this.closed = true;
        this.removeVar("var");
        let code = output.join('\n');
        if (this.tag_stack.length > 0) {
            let [tagname,]=this.tag_stack.pop();
            this.addError(`did not find the end tag：'${tagname}'.`);
        }
        return code;
    }

    public getLastPrefix() {
        let [,data=null]=this.getEndTag() || [];
        if (!data) {
            return 'var';
        }
        return data[0] === null ? 'var' : data[0];
    }

    public getTempPrefix(name) {
        if (typeof(this.temp_prefixs[name]) == 'number') {
            this.temp_prefixs[name]++;
            return name + (this.temp_prefixs[name].toString());
        }
        this.temp_prefixs[name] = 0;
        return name;
    }

    public getVarter(prefix) {
        if (!prefix) {
            prefix = 'var';
        }
        if (this.varters[prefix]) {
            return this.varters[prefix];
        }
        this.varters[prefix] = new Varter(prefix);
        return this.varters[prefix];
    }

    //添加定义变量
    public addVar(attrs:Varter) {
        for (let key in attrs.data) {
            if (this.temp_vars[key]) {
                let temp = this.temp_vars[key];
                let val = temp[temp.length - 1];
                if (val == attrs.data[key]) {
                    continue;
                }
                temp.push(attrs.data[key]);
            } else {
                this.temp_vars[key] = [attrs.data[key]];
            }
        }
    }

    //获取定义变量
    public getVar(key) {
        let temp = this.temp_vars[key];
        let value = temp[temp.length - 1];
        return value;
    }

    //判断是否有定义
    public hasVar(key) {
        return this.temp_vars[key] && this.temp_vars[key].length > 0;
    }

    //删除临时变量定义
    public removeVar(prefix) {
        if (!prefix) {
            prefix = 'var';
        }
        var attrs = this.varters[prefix] || this.varters['var'] || null;
        if (attrs == null) {
            return false;
        }
        prefix = attrs.prefix;
        delete this.varters[prefix];
        for (let key in attrs.data) {
            let value = attrs.data[key];
            if (!this.hasVar(key)) {
                this.addError('Temporary variable does not exist' + key);
                return false;
            }
            else {
                let end = this.temp_vars[key].pop();
                if (end != value) {
                    this.addError('Temporary variable order release disorder' + key);
                    return false;
                }
                if (this.temp_vars[key].length == 0) {
                    delete this.temp_vars[key];
                }
            }
        }
    }

    //打开标签
    public openTag(tagname, data = null) {
        this.tag_stack.push([tagname, data]);
    }

    //结束标签
    public getEndTag() {
        if (this.tag_stack.length == 0) {
            return null;
        }
        return this.tag_stack[this.tag_stack.length - 1];
    }

    public closeTag(tags) {
        tags = typeof (tags) == 'string' ? [tags] : tags;
        if (this.tag_stack.length == 0) {
            this.addError('Extra closing tag' + tags.join(','));
            return null;
        }
        let [tagname,data]=this.tag_stack.pop();
        if (tags.indexOf(tagname) < 0) {
            this.addError('Close tags yet' + tagname);
            return null;
        }
        return [tagname, data];
    }

    public isInTag(tags) {
        if (this.tag_stack.length == 0) {
            return false;
        }
        for (let i = this.tag_stack.length - 1; i >= 0; i--) {
            let item = this.tag_stack[i];
            if (tags.indexOf(item[0]) >= 0) {
                return true;
            }
        }
        return false;
    }

    //是否有block标记
    public hasBlock(name) {
        return !(this.blockData[name] === void 0 || this.blockData[name] === null);
    }

    //获取节点代码
    public getBlock(name) {
        if (!this.hasBlock(name)) {
            return null;
        }
        return this.blockData[name];
    }

    //添加已编译节点
    public addBlock(name, code) {
        this.blockData[name] = code;
    }

    private getCursorBlock(name, offset = 0) {
        if (offset == 0) {
            offset = this.source.cursor;
        }
        let block = this.parser.getBrock(name);
        if (block === null) {
            return null;
        }
        let ublock = null;
        if (block.length == 1) {
            ublock = block[0];
        }
        else {
            for (let i = 0; i < block.length; i++) {
                let temp = block[i];
                if (temp.start == offset) {
                    ublock = temp;
                    break;
                }
            }
        }
        return ublock;
    }

    public moveBlockToEnd(name, offset = 0) {
        let ublock = this.getCursorBlock(name, offset);
        if (ublock === null) {
            return false;
        }
        this.source.cursor = ublock.end;
        return true;
    }

    public moveBlockToOver(name, offset = 0) {
        let ublock = this.getCursorBlock(name, offset);
        if (ublock === null) {
            return false;
        }
        this.source.cursor = ublock.over;
        return true;
    }

    //编译节点
    public compileBlock(name) {
        let code = this.getBlock(name);
        if (code === null) {
            this.getParentBlock(name);
        }
        let block = this.parser.getBrock(name);
        if (block) {
            let args = block[0];
            let {hide=false,prepend=false,append=false}=args;
            if (hide && code === null) {
                return null;
            }
            if (!(prepend || append) && code !== null) {
                return code;
            }
            let offset = this.source.cursor;
            let bound = this.source.bound;
            let closed = this.closed;
            this.source.cursor = args.start;
            this.source.bound = args.over;
            this.closed = false;
            let output = this.compileTemplate();
            this.closed = closed;
            this.source.cursor = offset;
            this.source.bound = bound;
            if (prepend && code !== null) {
                return code + '\n' + output;
            }
            if (append && code !== null) {
                return output + '\n' + code;
            }
            return output;
        }
        return code;
    }

    //获取父标签的节点
    public getParentBlock(name) {
        if (!this.tpl.parent) {
            return null;
        }
        let pcomplie = this.tpl.parent.getCompile();
        let code = pcomplie.compileBlock(name);
        this.addBlock(name, code);
        return code;
    }

    //注册编译函数
    public static registerCompile(type, func = null) {
        if (typeof(type) == 'object' && null === func) {
            for (let key in type) {
                if (typeof(key) !== 'string' || typeof(type[key]) !== 'function') {
                    continue;
                }
                Compile.Plugins[key] = type[key];
            }
            return;
        }
        if (typeof(type) !== 'string' || typeof(func) !== 'function') {
            return;
        }
        Compile.Plugins[type] = func;
    }
}

for (let key in CompilePlugins) {
    Compile.registerCompile(key, CompilePlugins[key]);
}

//注册foreach
