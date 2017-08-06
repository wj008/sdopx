"use strict";
/**
 * Created by wj008 on 16-6-5.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var syntaxrules_1 = require("./syntaxrules");
var tree_map_1 = require("./tree_map");
var sdopx_1 = require("../sdopx");
/**
 * 词法分词器
 */
var Lexer = (function () {
    function Lexer(source) {
        //规则集合
        this.regexp = [];
        //
        this.maps = [];
        //标记栈
        this.stack = [];
        //词法树
        this.tree = null;
        //代码块
        this.blocks = null;
        this.sdopx = null;
        this.source = source;
        this.sdopx = source.sdopx;
        if (!source.isload) {
            source.load();
        }
    }
    Lexer.prototype.getSourceInfo = function (offset) {
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
    Lexer.prototype.addError = function (err, offset) {
        if (offset === void 0) { offset = 0; }
        var info = this.getSourceInfo(offset);
        this.sdopx.rethrow(err, info.line, info.srcname);
    };
    //√正则取值
    Lexer.prototype.retInfo = function (regexp, offset, normal) {
        if (offset === void 0) { offset = null; }
        if (normal === void 0) { normal = false; }
        offset = offset === null ? this.source.cursor : offset;
        if (offset >= this.source.bound) {
            //扫描位置超出范围
            this.addError("Syntax Error:Parsing out of range,offset:" + offset + ",bound:" + this.source.bound);
            return null;
        }
        var content = this.source.content.substring(offset, this.source.bound);
        var ret = content.match(regexp);
        if (!ret) {
            return null;
        }
        var length = ret[0].length;
        if (length == 0) {
            return null;
        }
        var start = offset + ret.index;
        var end = start + length;
        if (normal) {
            return { idx: 0, val: ret[0], start: start, end: end, len: length };
        }
        ret.shift();
        var idx = -1;
        //值
        var _a = ret.filter(function (item, index) {
            if (typeof (item) !== 'undefined') {
                if (idx < 0) {
                    idx = index;
                }
                return true;
            }
            return false;
        })[0], val = _a === void 0 ? '' : _a;
        if (idx === -1) {
            return null;
        }
        return { idx: idx, val: val, start: start, end: end, len: length };
    };
    //√分析规则
    Lexer.prototype.analysis = function (tagname, rules) {
        //console.log(tagname,rules);
        var mode = typeof (rules) == 'number' ? rules : rules.mode;
        var flags = typeof (rules) == 'number' ? null : rules.flags;
        if (flags) {
            var end = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
            if (end !== null && (flags & end) == 0) {
                return;
            }
        }
        var exp = syntaxrules_1.SyntaxRules.getRule(tagname);
        switch (mode) {
            case 0:
                this.regexp.push("^\\s*(" + exp.source + ")");
                break;
            case 1:
                this.regexp.push("^(" + exp.source + ")");
                break;
            case 4:
                this.regexp.push("^\\s+(" + exp.source + ")");
                break;
            case 2:
            case 3:
            case 5:
                this.regexp.push("(" + exp.source + ")");
                break;
            case 6:
                this.regexp.push("^\\s*(" + exp.source + ")(?!=)");
                break;
            default:
                break;
        }
        this.maps.push({ tag: tagname, mode: mode });
    };
    //下一位
    Lexer.prototype.initNext = function (next) {
        this.regexp = [];
        this.maps = [];
        // console.log('Next', next);
        if (next) {
            for (var tagname in next) {
                this.analysis(tagname, next[tagname]);
            }
        }
    };
    //查找节点
    Lexer.prototype.match = function () {
        var source = this.source;
        if (source.cursor >= source.bound) {
            return null;
        }
        if (this.maps.length == 0 || this.regexp.length == 0) {
            this.addError("SyntaxRules Error:System rules BUG, not correctly parsing rules, the question may submit comments.", source.cursor);
            return null;
        }
        var regexp = new RegExp(this.regexp.join('|'));
        // var regexp = new RegExp('^(\\[a-z]+)|^\s*(\\d+)ssd|^(abc)', 'i');
        var content = source.content.substring(source.cursor, source.bound);
        //var content = '333ssds';
        var retinfo = this.retInfo(regexp);
        if (!retinfo) {
            // console.warn('解析错误：', {map: this.maps, regexp: regexp, retinfo: retinfo, content: content});
            return null;
        }
        var _a = this.maps[retinfo.idx], _b = _a.tag, tag = _b === void 0 ? null : _b, _c = _a.mode, mode = _c === void 0 ? null : _c;
        if (mode === null || tag === null) {
            //console.warn('解析MAP错误：', {map: this.maps, regexp: regexp, retinfo: retinfo, content: content});
            return null;
        }
        // console.log('命中：', tag, mode, {map: this.maps, regexp: regexp, retinfo: retinfo, content: content});
        // console.warn('命中：', tag, mode);
        var end = retinfo.end, start = retinfo.start, val = retinfo.val, len = retinfo.len;
        switch (mode) {
            //找接受符号 不包括结束符号
            case 2:
                end = start;
                start = source.cursor;
                val = this.source.content.substring(start, end);
                break;
            //找接受符号 包括结束符号
            case 3:
                end = start + len;
                start = source.cursor;
                val = this.source.content.substring(start, end);
                break;
            default:
                break;
        }
        var token = syntaxrules_1.SyntaxRules.getToken(tag);
        return { tag: tag, value: val, start: start, end: end, token: token, node: null };
    };
    //解析模板
    Lexer.prototype.lexTpl = function () {
        var source = this.source;
        if (source.bound == 0) {
            source.bound = source.length;
        }
        if (source.cursor >= source.bound) {
            this.addError("Syntax Error:Parsing out of range,offset " + source.cursor + ",bound " + source.bound);
            return null;
        }
        syntaxrules_1.SyntaxRules.reset(source.left_delimiter, source.right_delimiter);
        this.stack = []; //清空栈
        var tree = this.tree = new tree_map_1.TreeMap();
        if (sdopx_1.Sdopx.debug) {
            tree.setInfo(this.getSourceInfo());
        }
        var tag = 'init';
        do {
            var next = syntaxrules_1.SyntaxRules.getNext(tag);
            this.initNext(next);
            var data = this.match();
            if (data === null) {
                this.addError("Syntax Error:Error parsing template, grammar suitable match is not found\uFF0Ctag:'" + tag + "'", source.cursor);
                return null;
            }
            tag = data.tag;
            source.cursor = data.end;
            if (tag === 'closeTpl') {
                // console.error('栈数据：', this.stack);
                data.node = 'html';
                tree.push(data);
                return tree;
            }
            //存栈
            var open_1 = syntaxrules_1.SyntaxRules.getOpen(tag);
            if (open_1 !== null) {
                //打开是时候清理
                if (open_1 == syntaxrules_1.Rules.BOUND_TAG_ATTR) {
                    var endflag = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
                    while (endflag && ((syntaxrules_1.Rules.BOUND_MODIFIER | syntaxrules_1.Rules.BOUND_TAG_ATTR) & endflag) > 0) {
                        this.stack.pop();
                        endflag = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
                    }
                }
                if (open_1 == syntaxrules_1.Rules.BOUND_MODIFIER) {
                    var endflag = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
                    while (endflag && (syntaxrules_1.Rules.BOUND_MODIFIER & endflag) > 0) {
                        this.stack.pop();
                        endflag = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
                    }
                }
                this.stack.push(open_1);
                // console.error('===栈数据===：', this.stack);
            }
            //离栈
            var close_1 = syntaxrules_1.SyntaxRules.getClose(tag);
            if (close_1 !== null) {
                var endflag = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
                if ((close_1 & endflag) == 0) {
                    this.addError("Syntax Error:Error parsing template, the appropriate tag end region not found", source.cursor);
                    return null;
                }
                this.stack.pop();
            }
            data.node = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
            tree.push(data);
        } while (true);
    };
    //解析HTML代码
    Lexer.prototype.lexHtml = function () {
        var source = this.source;
        if (source.bound == 0) {
            source.bound = source.length;
        }
        if (source.cursor >= source.bound) {
            return null;
        }
        syntaxrules_1.SyntaxRules.reset(source.left_delimiter, source.right_delimiter);
        //找模板开始标记
        var ret = this.retInfo(new RegExp(source.left_delimiter), null, true);
        //找交换符号标记
        if (source.end_literal) {
            var ret2 = this.retInfo(source.end_literal, null, true);
            if (ret2 && (!ret || ret2.start <= ret.start)) {
                var code_1 = source.content.substring(source.cursor, ret2.start);
                source.cursor = ret2.end; //是开始还是结束
                return { map: '', code: code_1, next: 'closeLiteral' };
            }
        }
        //到尾部都没找到模板
        if (!ret) {
            return { map: '', code: source.content.substring(source.cursor, source.bound), next: 'finish' };
        }
        var code = source.content.substring(source.cursor, ret.start);
        source.cursor = ret.start;
        var next = null;
        if (1 + ret.end < source.length) {
            var char = source.content.substr(ret.end, 1);
            switch (char) {
                case '#':
                    next = 'initConfig';
                    break;
                case '*':
                    next = 'initComment';
                    break;
                default:
                    next = 'init';
            }
        }
        return { map: '', code: code, next: next };
    };
    //注释的地方
    Lexer.prototype.lexComment = function () {
        var source = this.source;
        if (source.cursor >= source.length) {
            //已经到达尾部
            this.addError("Syntax Error:Parsing out of range,offset:" + source.cursor + ",bound:" + source.bound);
            return null;
        }
        syntaxrules_1.SyntaxRules.reset(source.left_delimiter, source.right_delimiter);
        var ret = this.retInfo(new RegExp(source.left_delimiter + '\\*'), null, true);
        if (!ret) {
            //没有找到注释开始标记
            this.addError("Syntax Error:Did not find the comment start tag:'" + source.left_delimiter_raw + "*'", source.cursor);
            return null;
        }
        source.cursor = ret.end;
        ret = this.retInfo(new RegExp('\\*' + source.right_delimiter), null, true);
        if (!ret) {
            //没有找到注释结束标记
            this.addError("Syntax Error:Did not find the comment start tag:'*" + source.right_delimiter_raw + "*'", source.cursor);
            return null;
        }
        source.cursor = ret.end;
        return { map: '', code: '', next: 'html' };
    };
    //解析配置项
    Lexer.prototype.lexConfig = function () {
        var source = this.source;
        this.stack = [];
        if (source.bound == 0) {
            source.bound = source.length;
        }
        if (source.cursor >= source.bound) {
            this.addError("Syntax Error:Parsing out of range,offset:" + source.cursor + ",bound:" + source.bound);
            return null;
        }
        syntaxrules_1.SyntaxRules.reset(source.left_delimiter, source.right_delimiter);
        var tree = this.tree = new tree_map_1.TreeMap();
        if (sdopx_1.Sdopx.debug) {
            tree.setInfo(this.getSourceInfo());
        }
        var tag = 'initConfig';
        do {
            var next = syntaxrules_1.SyntaxRules.getNext(tag);
            this.initNext(next);
            var data = this.match();
            if (data === null) {
                this.addError("Error parsing template configuration items syntax error,tag:'" + tag + "'", source.cursor);
                return null;
            }
            tag = data.tag;
            source.cursor = data.end;
            data.node = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
            if (tag === 'closeConfig') {
                tree.push(data);
                return tree;
            }
            tree.push(data);
        } while (true);
    };
    //获取板块数据
    Lexer.prototype.getBlocks = function () {
        if (this.blocks !== null) {
            return this.blocks;
        }
        this.findBrocks();
        return this.blocks;
    };
    //查找Block块
    Lexer.prototype.findBrocks = function () {
        var source = this.source;
        //语法标签切换
        syntaxrules_1.SyntaxRules.reset(source.left_delimiter, source.right_delimiter);
        var left = source.left_delimiter;
        var right = source.right_delimiter;
        //block栈
        var block_stack = [];
        var blocks = [];
        var offset = 0;
        var regexp = new RegExp(left + '(block)\\s+|' + left + '(/block)\\s*' + right);
        while (offset < source.length) {
            var content = source.content.substr(offset);
            //临时记录未完成的block
            var item = {
                content: '',
                begin: 0,
                start: 0,
                over: 0,
                end: 0,
                name: '',
                append: false,
                prepend: false,
                hide: false,
                nocache: false
            };
            //查找’{blick ‘和 {/blocl }
            var ret = this.retInfo(regexp, offset);
            if (!ret) {
                //info:没有找到任何block标记
                break;
            }
            //将位置移到查找尾部
            offset = ret.end;
            if (ret.val == 'block') {
                item.begin = ret.start;
            }
            if (ret.val === '/block') {
                item.over = ret.start;
                item.end = ret.end;
                if (block_stack.length == 0) {
                    //error:多余的blick标记
                    this.addError("Syntax Error:Error parsing template, extra tag : '" + source.left_delimiter_raw + "/block" + source.right_delimiter_raw + "'", offset);
                    return;
                }
                var temp = block_stack.pop();
                //这里的结束标记包括结束节点本身的内容
                temp.end = ret.end;
                temp.over = ret.start;
                temp.content = source.content.substring(temp.start, temp.over);
                //将block 完整内容和位置记录
                blocks.push(temp);
                continue;
            }
            while (ret) {
                var regexp_1 = new RegExp('^(name)=\\s*|^(append|prepend|hide|nocache)\\s*|^(' + right + ')');
                //扫描属性数据
                ret = this.retInfo(regexp_1, offset);
                if (!ret) {
                    //没有找到任何block 属性了
                    break;
                }
                //将位置移到查找尾部
                var attr = ret.val;
                offset = ret.end;
                //如果属性是name 查找属性值
                if (attr === 'name') {
                    var regexp_2 = new RegExp("^(\\w+)\\s*|^'(\\w+)'\\s*|^\"(\\w+)\"\\s*");
                    var retm = this.retInfo(regexp_2, offset);
                    if (!retm || retm.val.length === 0) {
                        //error:查找属性值失败
                        this.addError("Syntax Error:Error parsing template, name Invalid property value in the block tag.", offset);
                        return null;
                    }
                    //将位置移到查找尾部
                    offset = retm.end;
                    item.name = retm.val;
                }
                else if (source.right_delimiter_raw == attr) {
                    //这里的start 是从开始节点以后的内容
                    item.start = offset;
                    block_stack.push(item);
                    break;
                }
                else {
                    item[attr] = true;
                }
            }
        }
        this.blocks = {};
        blocks.reverse();
        //装载
        for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
            var block = blocks_1[_i];
            if (!block.name || block.name.length == 0) {
                continue;
            }
            var name_1 = block.name;
            if (this.blocks[name_1]) {
                this.blocks[name_1].push(block);
            }
            else {
                this.blocks[name_1] = [block];
            }
        }
    };
    return Lexer;
}());
exports.Lexer = Lexer;
