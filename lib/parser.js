"use strict";
const lexer_1 = require("./lexer");
const sdopx_1 = require("../sdopx");
class Parser {
    constructor(sdopx, compile, source) {
        this.blocks_stack = [];
        this.blocks = [];
        this.lexer = null;
        this.compiler = null;
        this.sdopx = null;
        this.source = null;
        this.lexData = null;
        this.compiler = compile;
        this.sdopx = sdopx;
        this.lexer = new lexer_1.Lexer(source);
    }
    getBrock(name = null) {
        let blocks = this.lexer.getBlocks();
        if (name === null) {
            return blocks;
        }
        return blocks[name] || null;
    }
    //解析HTML
    presHtml() {
        let item = this.lexer.lexHtml();
        if (!item) {
            return null;
        }
        item.map = Parser.CODE_HTML;
        return item;
    }
    //解析切换符
    parsLiteral() {
        let temp = { map: Parser.CODE_TAG_END, name: 'literal', node: '' };
        return temp;
    }
    //解析注释
    parsComment() {
        let item = this.lexer.lexComment();
        if (!item) {
            return null;
        }
        item.map = Parser.CODE_COMMENT;
        return item;
    }
    //解析模板
    parsTpl() {
        let tree = this.lexer.lexTpl();
        if (!tree) {
            return null;
        }
        this.lexData = tree;
        let ret = this.parsNext();
        if (!ret) {
            return null;
        }
        //解析表达式
        if (ret.map === Parser.CODE_EXPRESS) {
            let exp = this.pars_express();
            if (!exp) {
                if (this.lexData.testNext('Close_Tpl', false)) {
                    if (sdopx_1.Sdopx.debug) {
                        ret.info = tree.getInfo();
                    }
                    return ret;
                }
                return null;
            }
            if (exp.code !== null) {
                ret.code = ret.code + exp.code;
            }
            if (exp.map === Parser.CODE_MODIFIER) {
                this.assembly_modifier(ret, exp.name);
            }
            if (exp.map === Parser.CODE_RAW) {
                ret.raw = true;
            }
        }
        //解析表达式
        if (ret.map === Parser.CODE_EXPRESS) {
            if (tree[1] && tree[1].tag == 'Variable' && tree[2] && tree[2].value == '=') {
                ret.map = Parser.CODE_ASSIGN;
            }
        }
        if (sdopx_1.Sdopx.debug) {
            ret.info = tree.getInfo();
        }
        return ret;
    }
    //解析配置文件
    parsConfig() {
        let tree = this.lexer.lexConfig();
        if (!tree) {
            return null;
        }
        let item = tree.next();
        if (!tree.testNext('Close_Config')) {
            return null;
        }
        let temp = {
            map: Parser.CODE_CONFIG,
            code: '',
            node: item.node,
            raw: null,
        };
        let code = item.value.replace(/(^\s+|\s+$)/g, '');
        let mt = item.value.match(/^\s*(.*)(\|raw)\s*$/);
        if (mt && mt[2]) {
            temp.raw = true;
            code = mt[1].replace(/(^\s+|\s+$)/g, '');
        }
        var keys = code.split('.');
        if (keys.length > 1) {
            temp.code = '$_sdopx._config[\'' + keys[0] + '\']';
            keys.shift();
            let lcode = keys.join('.');
            temp.code += '.' + lcode;
        }
        else {
            temp.code = '$_sdopx._config[\'' + code + '\']';
        }
        if (sdopx_1.Sdopx.debug) {
            temp['info'] = tree.getInfo();
        }
        return temp;
    }
    //解析下一组
    parsNext() {
        let item = this.lexData.next();
        if (item && item.token) {
            let callback = this['pars_' + item.token] || null;
            if (typeof (callback) !== 'function') {
                //console.error('pars_' + item.token, 'missing.');
                return null;
            }
            return callback.call(this, item);
        }
        return null;
    }
    //解析表达式
    pars_express() {
        if (this.lexData.testNext('Close_Tpl', false)) {
            return null;
        }
        let temp = {
            map: Parser.CODE_EXPRESS,
            code: '',
            node: '',
            name: null,
            raw: null,
        };
        let have = false;
        let text = '';
        let node = '';
        while (true) {
            let ret = this.parsNext();
            if (!ret) {
                if (!have) {
                    return null;
                }
                temp.code = text;
                temp.node = node;
                return temp;
            }
            if (ret.map == Parser.CODE_MODIFIER) {
                temp.map = Parser.CODE_MODIFIER;
                if (!have) {
                    temp.code = null;
                }
                else {
                    temp.code = text;
                }
                temp.node = node;
                temp.name = ret.name;
                return temp;
            }
            if (ret.map == Parser.CODE_RAW) {
                temp.map = Parser.CODE_RAW;
                if (!have) {
                    temp.code = null;
                }
                else {
                    temp.code = text;
                }
                temp.node = node;
                temp.raw = true;
                temp.name = ret.name;
                return temp;
            }
            //如果非表达式
            if (ret.map != Parser.CODE_EXPRESS) {
                if (ret) {
                    this.lexData.prev();
                }
                if (!have) {
                    return null;
                }
                temp.code = text;
                temp.node = node;
                return temp;
            }
            have = true;
            text += ret.code;
            node = ret.node;
        }
    }
    pars_code(item) {
        return {
            map: Parser.CODE_EXPRESS,
            code: item.value,
            node: item.node
        };
    }
    pars_symbol(item) {
        let temp = {
            map: Parser.CODE_EXPRESS,
            code: item.value,
            node: item.node
        };
        temp.code = ' ' + item.value.replace(/(^\s+|\s+$)/g, '') + ' ';
        return temp;
    }
    //变量
    pars_var(item) {
        let temp = {
            map: Parser.CODE_EXPRESS,
            code: '',
            node: item.node,
        };
        // console.log('........', item);
        temp.code = (function (val, compiler) {
            val = val.replace(/(^\s+|\s+$)/g, '');
            let math = item.value.match(/^\$(\w+)/);
            if (!math) {
                return val;
            }
            let key = math[1];
            if (key == 'global') {
                return '$_sdopx._book';
            }
            if (!compiler.hasVar(key)) {
                return '$_sdopx._book[\'' + key + '\']';
            }
            let temp = compiler.getVar(key);
            return temp.replace(/@key/g, key, temp);
        })(item.value, this.compiler);
        return temp;
    }
    //varkey
    pars_varkey(item) {
        return {
            map: Parser.CODE_EXPRESS,
            code: item.value.replace(/(^\s+|\s+$)/g, ''),
            node: item.node
        };
    }
    pars_objkey(item) {
        return {
            map: Parser.CODE_EXPRESS,
            code: item.value.replace(/(^\s+|\s+$)/g, ''),
            node: item.node
        };
    }
    pars_method(item) {
        return {
            map: Parser.CODE_EXPRESS,
            code: item.value.replace(/(^\s+|\s+$)/g, ''),
            node: item.node
        };
    }
    pars_func(item) {
        let temp = {
            map: Parser.CODE_EXPRESS,
            code: item.value.replace(/(^\s+|\s+$)/g, ''),
            node: item.node
        };
        let mt = temp.code.match(/(\w+)\(/);
        if (mt) {
            let name = mt[1];
            let callback = this.sdopx._Sdopx.Functions[name] || null;
            if (typeof (callback) == 'function') {
                temp.code = '__Sdopx.Functions[' + JSON.stringify(name) + '](';
            }
        }
        return temp;
    }
    pars_string(item) {
        let text = item.value.replace(/(^\s+|\s+$)/g, '');
        text = text.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        return {
            map: Parser.CODE_EXPRESS,
            code: text,
            node: item.node
        };
    }
    pars_string_open(item) {
        let temp = {
            map: Parser.CODE_EXPRESS,
            code: '',
            node: item.node
        };
        let nitem = this.lexData.next();
        if (!nitem) {
            return null;
        }
        //如果后面是字符串
        if (nitem.tag == 'TplString') {
            let ntemp = this.pars_tpl_string(nitem);
            if (!ntemp) {
                return null;
            }
            temp.code = ('\'' + ntemp.code);
            return temp;
        }
        //如果后面是关闭字符串
        if (nitem.tag == 'Close_TplString') {
            let ntemp = this.pars_string_close(nitem);
            if (!ntemp) {
                return null;
            }
            temp.code = ('\'' + ntemp.code);
            return temp;
        }
        //如果后面是代码分界符
        if (nitem.tag == 'Open_TplDelimiter') {
            let ntemp = this.pars_delimi_open(nitem);
            if (!ntemp) {
                return null;
            }
            temp.code = ntemp.code;
            return temp;
        }
        return null;
    }
    pars_string_close(item) {
        let temp = {
            map: Parser.CODE_EXPRESS,
            code: '\'',
            node: item.node
        };
        let pitem = this.lexData.prev(false);
        //如果前面是结束分界符
        if (pitem.tag == 'Close_TplDelimiter') {
            temp.code = '';
            return temp;
        }
        return temp;
    }
    pars_tpl_string(item) {
        let temp = {
            map: Parser.CODE_EXPRESS,
            code: '',
            node: item.node
        };
        temp.code = item.value.replace(/\'/g, '\\\'').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        let nitem = this.lexData.next();
        if (!nitem) {
            return null;
        }
        if (nitem.tag == 'Close_TplString') {
            let ntemp = this.pars_string_close(nitem);
            if (!ntemp) {
                return null;
            }
            temp.code += ntemp.code;
            return temp;
        }
        if (nitem.tag == 'Open_TplDelimiter') {
            let ntemp = this.pars_delimi_open(nitem);
            if (!ntemp) {
                return null;
            }
            temp.code += ('\'' + ntemp.code);
            return temp;
        }
    }
    pars_delimi_open(item) {
        let temp = {
            map: Parser.CODE_EXPRESS,
            code: '+',
            node: item.node
        };
        let pitem = this.lexData.prev(false);
        if (pitem.tag == 'Open_TplString') {
            temp.code = '';
            return temp;
        }
        return temp;
    }
    pars_delimi_close(item) {
        let temp = {
            map: Parser.CODE_EXPRESS,
            code: '',
            node: item.node
        };
        let nitem = this.lexData.next();
        if (!nitem) {
            return null;
        }
        if (nitem.tag == 'TplString') {
            let ntemp = this.pars_tpl_string(nitem);
            if (!ntemp) {
                return null;
            }
            temp.code = ('+\'' + ntemp.code);
            return temp;
        }
        if (nitem.tag == 'Close_TplString' || nitem.tag == 'Open_TplDelimiter') {
            let ntemp = this.pars_tpl_string(nitem);
            if (!ntemp) {
                return null;
            }
            temp.code = '';
            temp.code += ntemp.code;
            return temp;
        }
        return null;
    }
    pars_tagname(item) {
        let temp = {
            map: Parser.CODE_TAG,
            name: '',
            node: item.node,
            args: {}
        };
        temp.name = item.value.replace(/(^\s+|\s+$)/g, '');
        while (true) {
            let item = this.lexData.next();
            if (item.tag == 'Close_TagAttr') {
                continue;
            }
            if (item.tag == 'Close_Tpl') {
                temp.node = item.node;
                return temp;
            }
            if (item.tag == 'Open_TagAttr') {
                let ret = this.pars_attr(item);
                if (!ret) {
                    return null;
                }
                let name = ret.name.replace(/(^\s+|\s+$)/g, '');
                let exp = this.pars_express();
                if (!exp) {
                    return null;
                }
                temp.args[name] = exp.code;
                continue;
            }
            else if (item.tag == 'Single_TagAttr') {
                let ret = this.pars_attr(item);
                if (!ret) {
                    return null;
                }
                let name = ret.name.replace(/(^\s+|\s+$)/g, '');
                temp.args[name] = 'true';
                continue;
            }
            else {
                this.lexData.prev();
                let exp = this.pars_express();
                if (!exp) {
                    return null;
                }
                if (exp) {
                    temp.args['code'] = exp.code;
                }
                temp.node = item.node;
                return temp;
            }
        }
    }
    //属性
    pars_attr(item) {
        let temp = {
            map: Parser.CODE_EMPTY,
            name: item.value.replace(/(^\s+|\s+$)/g, '').replace(/=+$/, ''),
            node: item.node
        };
        return temp;
    }
    pars_tagcode(item) {
        let temp = {
            map: Parser.CODE_TAG,
            name: item.value.replace(/(^\s+|\s+$)/g, ''),
            node: item.node,
            args: { code: '' }
        };
        let ret = this.pars_express();
        if (!ret) {
            return null;
        }
        temp.args.code = ret.code;
        return temp;
    }
    //关闭标签
    pars_tagend(item) {
        if (!this.lexData.testNext('Close_Tpl')) {
            return null;
        }
        let temp = {
            map: Parser.CODE_TAG_END,
            name: item.value.replace(/(^[\/\s]+|\s+$)/g, ''),
            node: item.node
        };
        return temp;
    }
    pars_closetpl(item) {
        let temp = {
            map: Parser.CODE_EMPTY,
            node: 'html',
        };
        if (item.tag != 'Close_Tpl') {
            return null;
        }
        return temp;
    }
    pars_empty(item) {
        return {
            map: Parser.CODE_EMPTY,
            node: item.node,
        };
    }
    pars_block_open(item) {
        let temp = {
            map: Parser.CODE_BLOCK,
            name: 'block',
            node: item.node,
            args: {},
        };
        let lastbk = this.blocks_stack[this.blocks_stack.length - 1] || null;
        if (lastbk) {
            temp.map = Parser.CODE_EMPTY;
        }
        while (true) {
            let item = this.lexData.next();
            if (item.map == 'Close_TagAttr') {
                continue;
            }
            if (item.map == 'Close_Tpl') {
                temp['start'] = item.end;
                continue;
            }
            if (item.map == 'Open_TagAttr') {
                let ret = this.pars_attr(item);
                if (!ret) {
                    return null;
                }
                let name = ret.name;
                let exp = this.pars_express();
                // let value = this.pars_express_item(false);
                if (!exp) {
                    return null;
                }
                temp.args[name] = exp.code;
                continue;
            }
            else if (item.map == 'Single_TagAttr') {
                let ret = this.pars_attr(item);
                if (!ret) {
                    return null;
                }
                let name = ret.name;
                temp.args[name] = 'true';
                continue;
            }
        }
    }
    pars_block_close(item) {
        let temp = this.blocks_stack[this.blocks_stack.length - 1] || null;
        if (!temp) {
            return null;
        }
        this.blocks_stack.pop();
        temp.map = Parser.CODE_EMPTY;
        temp.name = 'block';
        temp.end = item.start;
        if (!temp.args.name) {
            return null;
        }
        this.blocks[temp.args.name] = temp;
        return temp;
    }
    pars_modifier(item) {
        let temp = {
            map: Parser.CODE_MODIFIER,
            name: item.value.replace(/(^[\|\s]+|\s+$)/g, ''),
            code: '',
            node: item.node
        };
        //移除冒号
        let citem = this.lexData.next();
        if (!(citem && citem.node == 'modifier' && citem.value.replace(/(^\s+|\s+$)/g, '') == ':')) {
            this.lexData.prev();
        }
        return temp;
    }
    pars_raw(item) {
        let temp = {
            map: Parser.CODE_RAW,
            code: '',
            node: item.node
        };
        //console.log('raw-------------', temp);
        return temp;
    }
    assembly_modifier(ret, name) {
        let params = [ret.code];
        let mdname = null;
        while (true) {
            let exp = this.pars_express();
            if (exp === null) {
                break;
            }
            if (exp.map === Parser.CODE_MODIFIER) {
                mdname = exp.name;
                if (exp.code !== null) {
                    params.push(exp.code);
                }
                break;
            }
            if (exp.map === Parser.CODE_RAW) {
                ret.raw = true;
                if (exp.code !== null) {
                    params.push(exp.code);
                }
                break;
            }
            if (exp.code) {
                params.push(exp.code);
            }
            let item = this.lexData.next();
            if (item.tag !== 'Comma') {
                this.lexData.prev();
                break;
            }
        }
        let callback = this.sdopx._Sdopx.CompileModifiers[name] || null;
        if (typeof (callback) == 'function') {
            ret.code = callback.call(null, params, this.compiler);
        }
        else {
            callback = this.sdopx._Sdopx.Modifiers[name] || null;
            if (typeof (callback) == 'function') {
                ret.code = '__Sdopx.Modifiers[' + JSON.stringify(name) + '](' + params.join(',') + ')';
            }
        }
        if (mdname) {
            this.assembly_modifier(ret, mdname);
        }
        return ret;
    }
}
Parser.CODE_HTML = 'html';
Parser.CODE_EXPRESS = 'exp';
Parser.CODE_ASSIGN = 'assign';
Parser.CODE_CONFIG = 'conf';
Parser.CODE_TAG = 'tag';
Parser.CODE_TAG_END = 'tagend';
Parser.CODE_BLOCK = 'block';
Parser.CODE_EMPTY = 'empty';
Parser.CODE_COMMENT = 'comment';
Parser.CODE_MODIFIER = 'modifier';
Parser.CODE_RAW = 'raw';
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map