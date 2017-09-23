import {Source} from "./source";
import {Parser} from "./parser";
import {Sdopx} from "../index";
import {Template} from "./template";

export class Varter {

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
    private blockCache = {};
    private temp_vars = {};
    private varters = {};
    private temp_prefixs = {};
    public source: Source;
    private parser: Parser = null;
    public sdopx: Sdopx = null;
    public tpl: Template = null;

    public constructor(sdopx: Sdopx, tpl: Template) {
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
        let tagend = false;//标记结束
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
            if (html_item.code.length > 0) {
                if (/(\r\n|\n|r)\s*$/.test(html_item.code)) {
                    html_item.code = html_item.code.replace(/(\r\n|\n|r)\s*$/, '');
                }
                if (html_item.code.length > 0) {
                    let code = '__raw(' + JSON.stringify(html_item.code) + ');';
                    output.push(code);
                }
            }
            tagend = false;
            if (html_item.next == 'finish') {
                return false;
            }
            if (html_item.next == 'init') {
                let tpl_item = this.parser.parsTpl();
                if (!tpl_item) {
                    return false;
                }
                if (Sdopx.debug) {
                    output.push('__line=' + tpl_item.info.line + ';__src=' + JSON.stringify(tpl_item.info.srcname) + ';');
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
                        tagend = true;
                        output.push(tpl_item.code + ';');
                        break;
                    case Parser.CODE_TAG: {
                        let name = tpl_item.name;
                        let compfunc = Compile.Plugins[name] || null;
                        let code = null;
                        if (compfunc) {
                            tagend = true;
                            code = compfunc(name, tpl_item.args, this);
                            output.push(code);
                        } else {
                            compfunc = Compile.Plugins['__customize'];
                            code = compfunc(name, tpl_item.args, this);
                            output.push(code);
                        }
                        break;
                    }
                    case Parser.CODE_TAG_END: {
                        let name = tpl_item.name;
                        let compfunc = Compile.Plugins[name + '_close'] || null;
                        let code = null;
                        if (compfunc) {
                            tagend = true;
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
            if (html_item.next == 'initConfig') {
                let cfgitem = this.parser.parsConfig();
                if (cfgitem == null) {
                    return false;
                }
                if (Sdopx.debug) {
                    output.push('__line=' + cfgitem.info.line + ';__src=' + JSON.stringify(cfgitem.info.srcname) + ';');
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
            if (html_item.next == 'initComment') {
                tagend = true;
                let cmitem = this.parser.parsComment();
                if (cmitem == null) {
                    return false;
                }
                return !this.closed;
            }

            if (html_item.next == 'closeLiteral') {
                tagend = true;
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
        while (loop.call(this)) ;
        this.closed = true;
        this.removeVar("var");
        let code = output.join('\n');
        if (this.tag_stack.length > 0) {
            let [tagname,] = this.tag_stack.pop();
            this.addError(`did not find the end tag：'${tagname}'.`);
        }
        return code;
    }

    public getLastPrefix() {
        let [, data = null] = this.getEndTag() || [];
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
    public addVar(attrs: Varter) {
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

    public getVarKeys() {
        return Object.keys(this.temp_vars);
    }

    //获取定义变量
    public getVar(key, replace: boolean = false) {
        let temp = this.temp_vars[key];
        let value = temp[temp.length - 1];
        if (replace) {
            value = value.replace(/@key/g, key, value);
        }
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
        let [tagname, data] = this.tag_stack.pop();
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
    public hasBlockCache(name) {
        return !(this.blockCache[name] === void 0 || this.blockCache[name] === null);
    }

    //获取节点代码
    public getBlockCache(name: string): any {
        if (!this.hasBlockCache(name)) {
            return null;
        }
        return this.blockCache[name];
    }

    //添加已编译节点
    public addBlockCache(name: string, block: any) {
        this.blockCache[name] = block;
    }

    //获取当前块
    private getCursorBlockInfo(name, offset = 0): any {
        if (offset == 0) {
            offset = this.source.cursor;
        }
        let blocks = this.parser.getBrock(name);
        if (blocks === null) {
            return null;
        }
        let blockInfo = null;
        if (blocks.length == 1) {
            blockInfo = blocks[0];
        }
        else {
            for (let i = 0; i < blocks.length; i++) {
                let temp = blocks[i];
                if (temp.start == offset) {
                    blockInfo = temp;
                    break;
                }
            }
        }
        return blockInfo;
    }

    //获取第一块
    private getFirstBlockInfo(name): any {
        let blocks = this.parser.getBrock(name);
        if (blocks === null) {
            return null;
        }
        let blockInfo = null;
        if (blocks.length >= 1) {
            blockInfo = blocks[0];
        }
        return blockInfo;
    }

    //移动光标到 End 处
    public moveBlockToEnd(name, offset = 0): boolean {
        let blockInfo = this.getCursorBlockInfo(name, offset);
        if (blockInfo === null) {
            return false;
        }
        this.source.cursor = blockInfo.end;
        return true;
    }

    //移动光标到Over处
    public moveBlockToOver(name, offset = 0): boolean {
        let blockInfo = this.getCursorBlockInfo(name, offset);
        if (blockInfo === null) {
            return false;
        }
        this.source.cursor = blockInfo.over;
        return true;
    }

    //编译节点
    public compileBlock(name): any {
        //查看是否有编译过的节点
        let block = this.getParentBlock(name);
        let info = this.getFirstBlockInfo(name);
        if (info === null) {
            return block;
        }
        if (info.hide && (block === null || block.code == null)) {
            return null;
        }
        let cursorBlock = {prepend: info.prepend, append: info.append, code: null};
        let offset = this.source.cursor;
        let bound = this.source.bound;
        let closed = this.closed;
        //将光标移到开始处
        this.source.cursor = info.start;
        this.source.bound = info.over;
        this.closed = false;
        let output = null;
        //将光标移到开始处
        if (info.literal) {
            let literal = this.source.literal;
            this.source.literal = true;
            output = this.compileTemplate();
            this.source.literal = literal;
        }
        else if (typeof(info.left) == 'string' && typeof(info.right) == 'string' && info.left.length > 0 && info.right.length > 0) {
            let old_left = this.source.left_delimiter;
            let old_right = this.source.right_delimiter;
            this.source.changDelimiter(info.left, info.right);
            output = this.compileTemplate();
            this.source.changDelimiter(old_left, old_right);
        } else {
            output = this.compileTemplate();
        }
        this.closed = closed;
        this.source.cursor = offset;
        this.source.bound = bound;
        if (block != null) {
            if (block.prepend && block.code !== null) {
                output = block.code + '\n' + output;
            }
            else if (block.append && block.code !== null) {
                output = output + '\n' + block.code;
            }
        }
        cursorBlock.code = output;
        return cursorBlock;
    }

    public setVarTemp(dist: any) {
        this.temp_vars = dist.temp_vars;
        this.varters = dist.varters;
        this.temp_prefixs = dist.temp_prefixs;
    }

    public getVarTemp() {
        return {temp_vars: this.temp_vars, varters: this.varters, temp_prefixs: this.temp_prefixs};
    }

    //获取父标签的节点
    public getParentBlock(name) {
        if (!this.tpl.parent) {
            return null;
        }
        let block = this.getBlockCache(name);
        if (block) {
            return block;
        }

        let pcomplie = this.tpl.parent.getCompile();
        let temp = pcomplie.getVarTemp();
        pcomplie.setVarTemp(this.getVarTemp());
        block = pcomplie.compileBlock(name);
        pcomplie.setVarTemp(temp);

        //缓存父节点中编译的代码--
        this.addBlockCache(name, block);
        return block;
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

require("../compile");

