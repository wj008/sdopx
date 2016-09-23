/**
 * Created by wj008 on 16-6-5.
 */

import { SyntaxRules } from './syntaxrules';
import { Source }  from './source';
import { TreeMap }  from './tree_map';
import {Sdopx} from "../sdopx";

/**
 * 词法分词器
 */

export class Lexer {
    //数据源
    private source:Source;
    //规则集合
    private regexp = [];
    private maps = [];
    //标记栈
    private stack = [];
    //词法树
    private tree = null;
    //代码块
    private blocks = null;

    private sdopx = null;

    public constructor(source) {
        this.source = source;
        this.sdopx = source.sdopx;
        if (!source.isload) {
            source.load();
        }
    }

    public getSourceInfo(offset = 0) {
        if (offset == 0) {
            offset = this.source.cursor;
        }
        let content = this.source.content.substr(0, offset);
        let temp = content.split('\n');
        let line = temp.length;
        let ofs = temp[line - 1].length;
        return {line: line, offset: ofs, srcname: this.source.tplname};
    }

    private addError(err, offset = 0) {
        let info = this.getSourceInfo(offset);
        this.sdopx.rethrow(err, info.line, info.srcname);
    }

    //√正则取值
    private retInfo(regexp, offset = null, normal = false) {
        offset = offset === null ? this.source.cursor : offset;
        if (offset >= this.source.bound) {
            //扫描位置超出范围
            this.addError(`Syntax Error:Parsing out of range,offset:${offset},bound:${this.source.bound}`);
            return null;
        }
        let content = this.source.content.substring(offset, this.source.bound);
        var ret = content.match(regexp);
        if (!ret) {
            return null;
        }
        let length = ret[0].length;
        if (length == 0) {
            return null;
        }
        let start = offset + ret.index;
        let end = start + length;
        if (normal) {
            return {idx: 0, val: ret[0], start: start, end: end, len: length};
        }
        ret.shift();
        let idx = -1;
        //值
        let [val='']=ret.filter(function (item, index) {
            if (typeof(item) !== 'undefined') {
                if (idx < 0) {
                    idx = index;
                }
                return true;
            }
            return false;
        });
        if (idx === -1) {
            return null;
        }
        return {idx: idx, val: val, start: start, end: end, len: length};
    }

    //√分析规则
    private analysis(tagname, rules) {
        //console.log(tagname,rules);
        let mode = typeof(rules) == 'number' ? rules : rules.mode;
        let endtags = typeof(rules) == 'number' ? null : rules.flags;
        if (endtags) {
            let end = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
            if (end !== null) {
                if (endtags.constructor == Array) {
                    if (endtags.indexOf(end) < 0) {
                        return;
                    }
                }
                else if (typeof(endtags) === 'string') {
                    if (end != endtags) {
                        return;
                    }
                }
            }
        }
        let exp = SyntaxRules.getRule(tagname);
        switch (mode) {
            case 0:
                this.regexp.push(`^\\s*(${exp.source})`);
                break;
            case 1:
                this.regexp.push(`^(${exp.source})`);
                break;
            case 4:
                this.regexp.push(`^\\s+(${exp.source})`);
                break;
            case 2:
            case 3:
            case 5:
                this.regexp.push(`(${exp.source})`);
                break;
            case 6:
                this.regexp.push(`^\\s*(${exp.source})(?!=)`);
                break;
            default:
                break;
        }
        this.maps.push({tag: tagname, mode: mode});
    }

    //下一位
    private initNext(next) {
        this.regexp = [];
        this.maps = [];
        // console.log('Next',next);
        if (next) {
            for (let tagname in next) {
                if (tagname === 'Expression' || tagname === 'ExpreEnd') {
                    for (let tag in next[tagname]) {
                        this.analysis(tag, next[tagname][tag]);
                    }
                    continue;
                }
                this.analysis(tagname, next[tagname]);
            }

        }
    }

    //查找节点
    public match() {
        var source = this.source;
        if (source.cursor >= source.bound) {
            return null;
        }
        if (this.maps.length == 0 || this.regexp.length == 0) {
            this.addError(`SyntaxRules Error:System rules BUG, not correctly parsing rules, the question may submit comments.`, source.cursor);
            return null;
        }
        let regexp = new RegExp(this.regexp.join('|'));
        // var regexp = new RegExp('^(\\[a-z]+)|^\s*(\\d+)ssd|^(abc)', 'i');
        let content = source.content.substring(source.cursor, source.bound);
        //var content = '333ssds';
        var retinfo = this.retInfo(regexp);
        if (!retinfo) {
            // console.warn('解析错误：', {map: this.maps, regexp: regexp, retinfo: retinfo, content: content});
            return null;
        }
        let {tag=null,mode=null}=this.maps[retinfo.idx];
        if (mode === null || tag === null) {
            //console.warn('解析MAP错误：', {map: this.maps, regexp: regexp, retinfo: retinfo, content: content});
            return null;
        }
        // console.log('命中：', tag, mode, {map: this.maps, regexp: regexp, retinfo: retinfo, content: content});
        // console.warn('命中：', tag, mode);
        let {end,start,val}=retinfo;
        switch (mode) {
            //找接受符号 不包括结束符号
            case 2:
                end = start;
                start = source.cursor;
                val = this.source.content.substring(start, end);
                break;
            //找接受符号 包括结束符号
            case 3:
                end = start + length;
                start = source.cursor;
                val = this.source.content.substring(start, end);
                break;
            default:
                break;
        }
        let token = SyntaxRules.getToken(tag);
        return {tag: tag, value: val, start: start, end: end, token: token, node: null};
    }

    //解析模板
    public lexTpl() {
        var source = this.source;
        if (source.bound == 0) {
            source.bound = source.length;
        }
        if (source.cursor >= source.bound) {
            this.addError(`Syntax Error:Parsing out of range,offset ${source.cursor},bound ${source.bound}`);
            return null;
        }
        SyntaxRules.reset(source.left_delimiter, source.right_delimiter);
        this.stack = [];//清空栈
        let tree = this.tree = new TreeMap();
        if (Sdopx.debug) {
            tree.setInfo(this.getSourceInfo());
        }
        let tag = 'Init';
        do {
            let next = SyntaxRules.getNext(tag);
            this.initNext(next);
            let data = this.match();
            if (data === null) {
                this.addError(`Syntax Error:Error parsing template, grammar suitable match is found，tag:'${tag}'`, source.cursor);
                return null;
            }
            tag = data.tag;
            source.cursor = data.end;
            if (tag === 'Close_Tpl') {
                // console.error('栈数据：', this.stack);
                data.node = 'html';
                tree.push(data);
                return tree;
            }
            //存栈
            let open = SyntaxRules.getOpen(tag);
            if (open !== null) {
                //打开是时候清理
                if (open == 'tagattr') {
                    let endtag = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
                    while (endtag && ['modifier', 'tagattr'].indexOf(endtag) >= 0) {
                        this.stack.pop();
                        endtag = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
                    }
                }
                if (open == 'modifier') {
                    let endtag = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
                    while (endtag && 'modifier' == endtag) {
                        this.stack.pop();
                        endtag = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
                    }
                }
                this.stack.push(open);
                // console.error('===栈数据===：', this.stack);
            }
            //离栈
            let close = SyntaxRules.getClose(tag);
            if (close !== null) {
                let endtag = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
                if (close.indexOf(endtag) < 0) {
                    this.addError(`Syntax Error:Error parsing template, the appropriate tag end region not found，tag:'${endtag}'`, source.cursor);
                    return null;
                }
                this.stack.pop();
            }
            data.node = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
            tree.push(data);
        } while (true);
    }

    //解析HTML代码
    public lexHtml() {
        var source = this.source;
        if (source.bound == 0) {
            source.bound = source.length;
        }
        if (source.cursor >= source.bound) {
            return null;
        }
        SyntaxRules.reset(source.left_delimiter, source.right_delimiter);
        //找模板开始标记
        let ret = this.retInfo(new RegExp(source.left_delimiter), null, true);

        //找交换符号标记
        if (source.end_literal) {
            let ret2 = this.retInfo(source.end_literal, null, true);
            if (ret2 && (!ret || ret2.start <= ret.start)) {
                let code = source.content.substring(source.cursor, ret2.start);
                source.cursor = ret2.end;//是开始还是结束
                return {map: '', code: code, next: 'Close_Literal'};
            }
        }

        //到尾部都没找到模板
        if (!ret) {
            return {map: '', code: source.content.substring(source.cursor, source.bound), next: 'Finish'};
        }

        let code = source.content.substring(source.cursor, ret.start);
        source.cursor = ret.start;
        let next = null;
        if (1 + ret.end < source.length) {
            let char = source.content.substr(ret.end, 1);
            switch (char) {
                case '#':
                    next = 'Init_Config';
                    break;
                case '*':
                    next = 'Init_Comment';
                    break;
                default:
                    next = 'Init';
            }
        }
        return {map: '', code: code, next: next};
    }

    //注释的地方
    public lexComment() {
        let source = this.source;
        if (source.cursor >= source.length) {
            //已经到达尾部
            this.addError(`Syntax Error:Parsing out of range,offset:${source.cursor},bound:${source.bound}`);
            return null;
        }
        SyntaxRules.reset(source.left_delimiter, source.right_delimiter);
        let ret = this.retInfo(new RegExp(source.left_delimiter + '\\*'), null, true);
        if (!ret) {
            //没有找到注释开始标记
            this.addError(`Syntax Error:Did not find the comment start tag:'${source.left_delimiter_raw}*'`, source.cursor);
            return null;
        }
        source.cursor = ret.end;
        ret = this.retInfo(new RegExp('\\*' + source.right_delimiter), null, true);
        if (!ret) {
            //没有找到注释结束标记
            this.addError(`Syntax Error:Did not find the comment start tag:'*${source.right_delimiter_raw}*'`, source.cursor);
            return null;
        }
        source.cursor = ret.end;
        return {map: '', code: '', next: 'html'};
    }

    //解析配置项
    public lexConfig() {
        let source = this.source;
        this.stack = [];
        if (source.bound == 0) {
            source.bound = source.length;
        }
        if (source.cursor >= source.bound) {
            this.addError(`Syntax Error:Parsing out of range,offset:${source.cursor},bound:${source.bound}`);
            return null;
        }
        SyntaxRules.reset(source.left_delimiter, source.right_delimiter);
        let tree = this.tree = new TreeMap();
        if (Sdopx.debug) {
            tree.setInfo(this.getSourceInfo());
        }
        let tag = 'Init_Config';
        do {
            let next = SyntaxRules.getNext(tag);
            this.initNext(next);
            let data = this.match();
            if (data === null) {
                this.addError(`Error parsing template configuration items syntax error,tag:'${tag}'`, source.cursor);
                return null;
            }
            tag = data.tag;
            source.cursor = data.end;
            data.node = this.stack.length == 0 ? null : this.stack[this.stack.length - 1];
            if (tag === 'Close_Config') {
                tree.push(data);
                return tree;
            }
            tree.push(data);
        } while (true);
    }

    //获取板块数据
    public getBlocks() {
        if (this.blocks !== null) {
            return this.blocks;
        }
        this.findBrocks();
        return this.blocks;
    }

    //查找Block块
    private findBrocks() {
        var source = this.source;
        //语法标签切换
        SyntaxRules.reset(source.left_delimiter, source.right_delimiter);
        let left = source.left_delimiter;
        let right = source.right_delimiter;

        //block栈
        let block_stack = [];
        let blocks = [];
        let offset = 0;
        let regexp = new RegExp(left + '(block)\\s+|' + left + '(/block)\\s*' + right);

        while (offset < source.length) {
            let content = source.content.substr(offset);
            //临时记录未完成的block
            let item = {
                content: '',
                begin: 0,
                start: 0,//内容开始
                over: 0,//内容结束
                end: 0,
                name: '',
                append: false,
                prepend: false,
                hide: false,
                nocache: false
            };

            //查找’{blick ‘和 {/blocl }
            let ret = this.retInfo(regexp, offset);
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
                    this.addError(`Syntax Error:Error parsing template, extra tag : '${source.left_delimiter_raw}/block${source.right_delimiter_raw}'`, offset);
                    return;
                }
                let temp = block_stack.pop();
                //这里的结束标记包括结束节点本身的内容
                temp.end = ret.end;
                temp.over = ret.start;
                temp.content = source.content.substring(temp.start, temp.over);
                //将block 完整内容和位置记录
                blocks.push(temp);
                continue;
            }

            while (ret) {
                let regexp = new RegExp('^(name)=\\s*|^(append|prepend|hide|nocache)\\s*|^(' + right + ')');
                //扫描属性数据
                ret = this.retInfo(regexp, offset);
                if (!ret) {
                    //没有找到任何block 属性了
                    break;
                }
                //将位置移到查找尾部
                let attr = ret.val;
                offset = ret.end;
                //如果属性是name 查找属性值
                if (attr === 'name') {
                    let regexp = new RegExp(`^(\\w+)\\s*|^'(\\w+)'\\s*|^"(\\w+)"\\s*`);
                    let retm = this.retInfo(regexp, offset);
                    if (!retm || retm.val.length === 0) {
                        //error:查找属性值失败
                        this.addError(`Syntax Error:Error parsing template, name Invalid property value in the block tag.`, offset);
                        return null;
                    }
                    //将位置移到查找尾部
                    offset = retm.end;
                    item.name = retm.val;
                }
                //如果碰到结束符号
                else if (source.right_delimiter_raw == attr) {
                    //这里的start 是从开始节点以后的内容
                    item.start = offset;
                    block_stack.push(item);
                    break;
                } else {
                    item[attr] = true;
                }
            }
        }
        this.blocks = {};
        blocks.reverse();
        //装载
        for (let block of blocks) {
            if (!block.name || block.name.length == 0) {
                continue;
            }
            let name = block.name;
            if (this.blocks[name]) {
                this.blocks[name].push(block);
            } else {
                this.blocks[name] = [block];
            }
        }

    }

}