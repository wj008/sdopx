"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = require("./parser");
var index_1 = require("../index");
var Varter = (function () {
    function Varter(prefix) {
        this.prefix = 'var';
        this.data = {};
        this.prefix = prefix;
    }
    Varter.prototype.add = function (name) {
        this.data[name] = this.prefix + '_@key';
    };
    return Varter;
}());
exports.Varter = Varter;
var Compile = (function () {
    function Compile(sdopx, tpl) {
        //标签栈
        this.tag_stack = [];
        //已经关闭
        this.closed = false;
        //缓存编译
        this.blockCache = {};
        this.temp_vars = {};
        this.varters = {};
        this.temp_prefixs = {};
        this.parser = null;
        this.sdopx = null;
        this.tpl = null;
        this.sdopx = sdopx;
        this.tpl = tpl;
        this.source = tpl.getSource();
        this.parser = new parser_1.Parser(sdopx, this, this.source);
    }
    Compile.prototype.getSourceInfo = function (offset) {
        if (offset === void 0) { offset = 0; }
        if (offset == 0) {
            offset = this.source.cursor;
        }
        var content = this.source.content.substr(0, offset);
        var temp = content.split('\n');
        var line = temp.length;
        var ofs = temp[line - 1].length;
        return { line: line, offset: ofs, srcname: this.source.tplname };
    };
    Compile.prototype.addError = function (err, offset) {
        if (offset === void 0) { offset = 0; }
        var info = this.getSourceInfo(offset);
        this.sdopx.rethrow(err, info.line, info.srcname);
    };
    Compile.prototype.compileTemplate = function () {
        var output = [];
        var i = 0;
        var tagend = false; //标记结束
        var loop = function () {
            if (this.closed || i >= 100000) {
                return false;
            }
            i++;
            var html_item = this.parser.presHtml();
            if (!html_item) {
                this.closed = true;
                return false;
            }
            if (html_item.code.length > 0) {
                if (/(\r\n|\n|r)\s*$/.test(html_item.code)) {
                    html_item.code = html_item.code.replace(/(\r\n|\n|r)\s*$/, '');
                }
                if (html_item.code.length > 0) {
                    var code_1 = '__raw(' + JSON.stringify(html_item.code) + ');';
                    output.push(code_1);
                }
            }
            tagend = false;
            if (html_item.next == 'finish') {
                return false;
            }
            if (html_item.next == 'init') {
                var tpl_item = this.parser.parsTpl();
                if (!tpl_item) {
                    return false;
                }
                if (index_1.Sdopx.debug) {
                    output.push('__line=' + tpl_item.info.line + ';__src=' + JSON.stringify(tpl_item.info.srcname) + ';');
                }
                switch (tpl_item.map) {
                    case parser_1.Parser.CODE_EXPRESS:
                        if (tpl_item.raw) {
                            output.push('__raw(' + tpl_item.code + ');');
                        }
                        else {
                            output.push('__echo(' + tpl_item.code + ');');
                        }
                        break;
                    case parser_1.Parser.CODE_ASSIGN:
                        tagend = true;
                        output.push(tpl_item.code + ';');
                        break;
                    case parser_1.Parser.CODE_TAG: {
                        var name = tpl_item.name;
                        var compfunc = Compile.Plugins[name] || null;
                        var code_2 = null;
                        if (compfunc) {
                            tagend = true;
                            code_2 = compfunc(name, tpl_item.args, this);
                            output.push(code_2);
                        }
                        else {
                            compfunc = Compile.Plugins['__customize'];
                            code_2 = compfunc(name, tpl_item.args, this);
                            output.push(code_2);
                        }
                        break;
                    }
                    case parser_1.Parser.CODE_TAG_END: {
                        var name = tpl_item.name;
                        var compfunc = Compile.Plugins[name + '_close'] || null;
                        var code_3 = null;
                        if (compfunc) {
                            tagend = true;
                            code_3 = compfunc(name, this);
                            output.push(code_3);
                        }
                        else {
                            compfunc = Compile.Plugins['__customize_close'];
                            code_3 = compfunc(name, this);
                            output.push(code_3);
                        }
                        break;
                    }
                    default:
                        break;
                }
                return !this.closed;
            }
            if (html_item.next == 'initConfig') {
                var cfgitem = this.parser.parsConfig();
                if (cfgitem == null) {
                    return false;
                }
                if (index_1.Sdopx.debug) {
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
                var cmitem = this.parser.parsComment();
                if (cmitem == null) {
                    return false;
                }
                return !this.closed;
            }
            if (html_item.next == 'closeLiteral') {
                tagend = true;
                var lit_item = this.parser.parsLiteral();
                if (!lit_item) {
                    return false;
                }
                if (parser_1.Parser.CODE_TAG_END == lit_item.map) {
                    var name = lit_item.name;
                    var compfunc = Compile.Plugins[name + '_close'];
                    var code_4 = compfunc(name, this);
                    output.push(code_4);
                }
                return !this.closed;
            }
            return !this.closed;
        };
        while (loop.call(this))
            ;
        this.closed = true;
        this.removeVar("var");
        var code = output.join('\n');
        if (this.tag_stack.length > 0) {
            var tagname = this.tag_stack.pop()[0];
            this.addError("did not find the end tag\uFF1A'" + tagname + "'.");
        }
        return code;
    };
    Compile.prototype.getLastPrefix = function () {
        var _a = this.getEndTag() || [], _b = _a[1], data = _b === void 0 ? null : _b;
        if (!data) {
            return 'var';
        }
        return data[0] === null ? 'var' : data[0];
    };
    Compile.prototype.getTempPrefix = function (name) {
        if (typeof (this.temp_prefixs[name]) == 'number') {
            this.temp_prefixs[name]++;
            return name + (this.temp_prefixs[name].toString());
        }
        this.temp_prefixs[name] = 0;
        return name;
    };
    Compile.prototype.getVarter = function (prefix) {
        if (!prefix) {
            prefix = 'var';
        }
        if (this.varters[prefix]) {
            return this.varters[prefix];
        }
        this.varters[prefix] = new Varter(prefix);
        return this.varters[prefix];
    };
    //添加定义变量
    Compile.prototype.addVar = function (attrs) {
        for (var key in attrs.data) {
            if (this.temp_vars[key]) {
                var temp = this.temp_vars[key];
                var val = temp[temp.length - 1];
                if (val == attrs.data[key]) {
                    continue;
                }
                temp.push(attrs.data[key]);
            }
            else {
                this.temp_vars[key] = [attrs.data[key]];
            }
        }
    };
    Compile.prototype.getVarKeys = function () {
        return Object.keys(this.temp_vars);
    };
    //获取定义变量
    Compile.prototype.getVar = function (key, replace) {
        if (replace === void 0) { replace = false; }
        var temp = this.temp_vars[key];
        var value = temp[temp.length - 1];
        if (replace) {
            value = value.replace(/@key/g, key, value);
        }
        return value;
    };
    //判断是否有定义
    Compile.prototype.hasVar = function (key) {
        return this.temp_vars[key] && this.temp_vars[key].length > 0;
    };
    //删除临时变量定义
    Compile.prototype.removeVar = function (prefix) {
        if (!prefix) {
            prefix = 'var';
        }
        var attrs = this.varters[prefix] || this.varters['var'] || null;
        if (attrs == null) {
            return false;
        }
        prefix = attrs.prefix;
        delete this.varters[prefix];
        for (var key in attrs.data) {
            var value = attrs.data[key];
            if (!this.hasVar(key)) {
                this.addError('Temporary variable does not exist' + key);
                return false;
            }
            else {
                var end = this.temp_vars[key].pop();
                if (end != value) {
                    this.addError('Temporary variable order release disorder' + key);
                    return false;
                }
                if (this.temp_vars[key].length == 0) {
                    delete this.temp_vars[key];
                }
            }
        }
    };
    //打开标签
    Compile.prototype.openTag = function (tagname, data) {
        if (data === void 0) { data = null; }
        this.tag_stack.push([tagname, data]);
    };
    //结束标签
    Compile.prototype.getEndTag = function () {
        if (this.tag_stack.length == 0) {
            return null;
        }
        return this.tag_stack[this.tag_stack.length - 1];
    };
    Compile.prototype.closeTag = function (tags) {
        tags = typeof (tags) == 'string' ? [tags] : tags;
        if (this.tag_stack.length == 0) {
            this.addError('Extra closing tag' + tags.join(','));
            return null;
        }
        var _a = this.tag_stack.pop(), tagname = _a[0], data = _a[1];
        if (tags.indexOf(tagname) < 0) {
            this.addError('Close tags yet' + tagname);
            return null;
        }
        return [tagname, data];
    };
    Compile.prototype.isInTag = function (tags) {
        if (this.tag_stack.length == 0) {
            return false;
        }
        for (var i = this.tag_stack.length - 1; i >= 0; i--) {
            var item = this.tag_stack[i];
            if (tags.indexOf(item[0]) >= 0) {
                return true;
            }
        }
        return false;
    };
    //是否有block标记
    Compile.prototype.hasBlockCache = function (name) {
        return !(this.blockCache[name] === void 0 || this.blockCache[name] === null);
    };
    //获取节点代码
    Compile.prototype.getBlockCache = function (name) {
        if (!this.hasBlockCache(name)) {
            return null;
        }
        return this.blockCache[name];
    };
    //添加已编译节点
    Compile.prototype.addBlockCache = function (name, block) {
        this.blockCache[name] = block;
    };
    //获取当前块
    Compile.prototype.getCursorBlockInfo = function (name, offset) {
        if (offset === void 0) { offset = 0; }
        if (offset == 0) {
            offset = this.source.cursor;
        }
        var blocks = this.parser.getBrock(name);
        if (blocks === null) {
            return null;
        }
        var blockInfo = null;
        if (blocks.length == 1) {
            blockInfo = blocks[0];
        }
        else {
            for (var i = 0; i < blocks.length; i++) {
                var temp = blocks[i];
                if (temp.start == offset) {
                    blockInfo = temp;
                    break;
                }
            }
        }
        return blockInfo;
    };
    //获取第一块
    Compile.prototype.getFirstBlockInfo = function (name) {
        var blocks = this.parser.getBrock(name);
        if (blocks === null) {
            return null;
        }
        var blockInfo = null;
        if (blocks.length >= 1) {
            blockInfo = blocks[0];
        }
        return blockInfo;
    };
    //移动光标到 End 处
    Compile.prototype.moveBlockToEnd = function (name, offset) {
        if (offset === void 0) { offset = 0; }
        var blockInfo = this.getCursorBlockInfo(name, offset);
        if (blockInfo === null) {
            return false;
        }
        this.source.cursor = blockInfo.end;
        return true;
    };
    //移动光标到Over处
    Compile.prototype.moveBlockToOver = function (name, offset) {
        if (offset === void 0) { offset = 0; }
        var blockInfo = this.getCursorBlockInfo(name, offset);
        if (blockInfo === null) {
            return false;
        }
        this.source.cursor = blockInfo.over;
        return true;
    };
    //编译节点
    Compile.prototype.compileBlock = function (name) {
        //查看是否有编译过的节点
        var block = this.getParentBlock(name);
        var info = this.getFirstBlockInfo(name);
        if (info === null) {
            return block;
        }
        if (info.hide && (block === null || block.code == null)) {
            return null;
        }
        var cursorBlock = { prepend: info.prepend, append: info.append, code: null };
        var offset = this.source.cursor;
        var bound = this.source.bound;
        var closed = this.closed;
        //将光标移到开始处
        this.source.cursor = info.start;
        this.source.bound = info.over;
        this.closed = false;
        var output = null;
        //将光标移到开始处
        if (info.literal) {
            var literal = this.source.literal;
            this.source.literal = true;
            output = this.compileTemplate();
            this.source.literal = literal;
        }
        else if (typeof (info.left) == 'string' && typeof (info.right) == 'string' && info.left.length > 0 && info.right.length > 0) {
            var old_left = this.source.left_delimiter;
            var old_right = this.source.right_delimiter;
            this.source.changDelimiter(info.left, info.right);
            output = this.compileTemplate();
            this.source.changDelimiter(old_left, old_right);
        }
        else {
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
    };
    Compile.prototype.setVarTemp = function (dist) {
        this.temp_vars = dist.temp_vars;
        this.varters = dist.varters;
        this.temp_prefixs = dist.temp_prefixs;
    };
    Compile.prototype.getVarTemp = function () {
        return { temp_vars: this.temp_vars, varters: this.varters, temp_prefixs: this.temp_prefixs };
    };
    //获取父标签的节点
    Compile.prototype.getParentBlock = function (name) {
        if (!this.tpl.parent) {
            return null;
        }
        var block = this.getBlockCache(name);
        if (block) {
            return block;
        }
        var pcomplie = this.tpl.parent.getCompile();
        var temp = pcomplie.getVarTemp();
        pcomplie.setVarTemp(this.getVarTemp());
        block = pcomplie.compileBlock(name);
        pcomplie.setVarTemp(temp);
        //缓存父节点中编译的代码--
        this.addBlockCache(name, block);
        return block;
    };
    //注册编译函数
    Compile.registerCompile = function (type, func) {
        if (func === void 0) { func = null; }
        if (typeof (type) == 'object' && null === func) {
            for (var key in type) {
                if (typeof (key) !== 'string' || typeof (type[key]) !== 'function') {
                    continue;
                }
                Compile.Plugins[key] = type[key];
            }
            return;
        }
        if (typeof (type) !== 'string' || typeof (func) !== 'function') {
            return;
        }
        Compile.Plugins[type] = func;
    };
    Compile.Plugins = {};
    return Compile;
}());
exports.Compile = Compile;
require("../compile");
//# sourceMappingURL=compile.js.map