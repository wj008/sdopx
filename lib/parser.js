"use strict";
var lexer_1 = require("./lexer");
var sdopx_1 = require("../sdopx");
var Parser = (function () {
    function Parser(sdopx, compile, source) {
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
    Parser.prototype.getBrock = function (name) {
        if (name === void 0) { name = null; }
        var blocks = this.lexer.getBlocks();
        if (name === null) {
            return blocks;
        }
        return blocks[name] || null;
    };
    //解析HTML
    Parser.prototype.presHtml = function () {
        var item = this.lexer.lexHtml();
        if (!item) {
            return null;
        }
        item.map = Parser.CODE_HTML;
        return item;
    };
    //解析切换符
    Parser.prototype.parsLiteral = function () {
        var temp = { map: Parser.CODE_TAG_END, name: 'literal', node: '' };
        return temp;
    };
    //解析注释
    Parser.prototype.parsComment = function () {
        var item = this.lexer.lexComment();
        if (!item) {
            return null;
        }
        item.map = Parser.CODE_COMMENT;
        return item;
    };
    //解析模板
    Parser.prototype.parsTpl = function () {
        var tree = this.lexer.lexTpl();
        if (!tree) {
            return null;
        }
        this.lexData = tree;
        var ret = this.parsNext();
        if (!ret) {
            return null;
        }
        //解析表达式
        if (ret.map === Parser.CODE_EXPRESS) {
            var exp = this.pars_express();
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
    };
    //解析配置文件
    Parser.prototype.parsConfig = function () {
        var tree = this.lexer.lexConfig();
        if (!tree) {
            return null;
        }
        var item = tree.next();
        if (!tree.testNext('Close_Config')) {
            return null;
        }
        var temp = {
            map: Parser.CODE_CONFIG,
            code: '',
            node: item.node,
            raw: null
        };
        var code = item.value.replace(/(^\s+|\s+$)/g, '');
        var mt = item.value.match(/^\s*(.*)(\|raw)\s*$/);
        if (mt && mt[2]) {
            temp.raw = true;
            code = mt[1].replace(/(^\s+|\s+$)/g, '');
        }
        temp.code = '$_sdopx._config[\'' + code + '\']';
        if (sdopx_1.Sdopx.debug) {
            temp['info'] = tree.getInfo();
        }
        return temp;
    };
    //解析下一组
    Parser.prototype.parsNext = function () {
        var item = this.lexData.next();
        if (item && item.token) {
            var callback = this['pars_' + item.token] || null;
            if (typeof (callback) !== 'function') {
                console.error('pars_' + item.token, 'missing.');
                return null;
            }
            return callback.call(this, item);
        }
        return null;
    };
    //解析表达式
    Parser.prototype.pars_express = function () {
        if (this.lexData.testNext('Close_Tpl', false)) {
            return null;
        }
        var temp = {
            map: Parser.CODE_EXPRESS,
            code: '',
            node: '',
            name: null,
            raw: null
        };
        var have = false;
        var text = '';
        var node = '';
        while (true) {
            var ret = this.parsNext();
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
        return null;
    };
    Parser.prototype.pars_code = function (item) {
        return {
            map: Parser.CODE_EXPRESS,
            code: item.value,
            node: item.node
        };
    };
    Parser.prototype.pars_symbol = function (item) {
        var temp = {
            map: Parser.CODE_EXPRESS,
            code: item.value,
            node: item.node
        };
        temp.code = ' ' + item.value.replace(/(^\s+|\s+$)/g, '') + ' ';
        return temp;
    };
    //变量
    Parser.prototype.pars_var = function (item) {
        var temp = {
            map: Parser.CODE_EXPRESS,
            code: '',
            node: item.node
        };
        // console.log('........', item);
        temp.code = (function (val, compiler) {
            val = val.replace(/(^\s+|\s+$)/g, '');
            var math = item.value.match(/^\$(\w+)/);
            if (!math) {
                return val;
            }
            var key = math[1];
            if (key == 'global') {
                return '$_sdopx._book';
            }
            if (!compiler.hasVar(key)) {
                return '$_sdopx._book[\'' + key + '\']';
            }
            var temp = compiler.getVar(key);
            return temp.replace(/@key/g, key, temp);
        })(item.value, this.compiler);
        return temp;
    };
    //varkey
    Parser.prototype.pars_varkey = function (item) {
        return {
            map: Parser.CODE_EXPRESS,
            code: item.value.replace(/(^\s+|\s+$)/g, ''),
            node: item.node
        };
    };
    Parser.prototype.pars_objkey = function (item) {
        return {
            map: Parser.CODE_EXPRESS,
            code: item.value.replace(/(^\s+|\s+$)/g, ''),
            node: item.node
        };
    };
    Parser.prototype.pars_method = function (item) {
        return {
            map: Parser.CODE_EXPRESS,
            code: item.value.replace(/(^\s+|\s+$)/g, ''),
            node: item.node
        };
    };
    Parser.prototype.pars_func = function (item) {
        var temp = {
            map: Parser.CODE_EXPRESS,
            code: item.value.replace(/(^\s+|\s+$)/g, ''),
            node: item.node
        };
        var mt = temp.code.match(/(\w+)\(/);
        if (mt) {
            var name_1 = mt[1];
            var callback = this.sdopx._Sdopx.Functions[name_1] || null;
            if (typeof (callback) == 'function') {
                temp.code = '__Sdopx.Functions[' + JSON.stringify(name_1) + '](';
            }
        }
        return temp;
    };
    Parser.prototype.pars_string = function (item) {
        var text = item.value.replace(/(^\s+|\s+$)/g, '');
        text = text.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        return {
            map: Parser.CODE_EXPRESS,
            code: text,
            node: item.node
        };
    };
    Parser.prototype.pars_string_open = function (item) {
        var temp = {
            map: Parser.CODE_EXPRESS,
            code: '',
            node: item.node
        };
        var nitem = this.lexData.next();
        if (!nitem) {
            return null;
        }
        //如果后面是字符串
        if (nitem.tag == 'TplString') {
            var ntemp = this.pars_tpl_string(nitem);
            if (!ntemp) {
                return null;
            }
            temp.code = ('\'' + ntemp.code);
            return temp;
        }
        //如果后面是关闭字符串
        if (nitem.tag == 'Close_TplString') {
            var ntemp = this.pars_string_close(nitem);
            if (!ntemp) {
                return null;
            }
            temp.code = ('\'' + ntemp.code);
            return temp;
        }
        //如果后面是代码分界符
        if (nitem.tag == 'Open_TplDelimiter') {
            var ntemp = this.pars_delimi_open(nitem);
            if (!ntemp) {
                return null;
            }
            temp.code = ntemp.code;
            return temp;
        }
        return null;
    };
    Parser.prototype.pars_string_close = function (item) {
        var temp = {
            map: Parser.CODE_EXPRESS,
            code: '\'',
            node: item.node
        };
        var pitem = this.lexData.prev(false);
        //如果前面是结束分界符
        if (pitem.tag == 'Close_TplDelimiter') {
            temp.code = '';
            return temp;
        }
        return temp;
    };
    Parser.prototype.pars_tpl_string = function (item) {
        var temp = {
            map: Parser.CODE_EXPRESS,
            code: '',
            node: item.node
        };
        temp.code = item.value.replace(/\'/g, '\\\'').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
        var nitem = this.lexData.next();
        if (!nitem) {
            return null;
        }
        if (nitem.tag == 'Close_TplString') {
            var ntemp = this.pars_string_close(nitem);
            if (!ntemp) {
                return null;
            }
            temp.code += ntemp.code;
            return temp;
        }
        if (nitem.tag == 'Open_TplDelimiter') {
            var ntemp = this.pars_delimi_open(nitem);
            if (!ntemp) {
                return null;
            }
            temp.code += ('\'' + ntemp.code);
            return temp;
        }
    };
    Parser.prototype.pars_delimi_open = function (item) {
        var temp = {
            map: Parser.CODE_EXPRESS,
            code: '+',
            node: item.node
        };
        var pitem = this.lexData.prev(false);
        if (pitem.tag == 'Open_TplString') {
            temp.code = '';
            return temp;
        }
        return temp;
    };
    Parser.prototype.pars_delimi_close = function (item) {
        var temp = {
            map: Parser.CODE_EXPRESS,
            code: '',
            node: item.node
        };
        var nitem = this.lexData.next();
        if (!nitem) {
            return null;
        }
        if (nitem.tag == 'TplString') {
            var ntemp = this.pars_tpl_string(nitem);
            if (!ntemp) {
                return null;
            }
            temp.code = ('+\'' + ntemp.code);
            return temp;
        }
        if (nitem.tag == 'Close_TplString' || nitem.tag == 'Open_TplDelimiter') {
            var ntemp = this.pars_tpl_string(nitem);
            if (!ntemp) {
                return null;
            }
            temp.code = '';
            temp.code += ntemp.code;
            return temp;
        }
        return null;
    };
    Parser.prototype.pars_tagname = function (item) {
        var temp = {
            map: Parser.CODE_TAG,
            name: '',
            node: item.node,
            args: {}
        };
        temp.name = item.value.replace(/(^\s+|\s+$)/g, '');
        while (true) {
            var item_1 = this.lexData.next();
            if (item_1.tag == 'Close_TagAttr') {
                continue;
            }
            if (item_1.tag == 'Close_Tpl') {
                temp.node = item_1.node;
                return temp;
            }
            if (item_1.tag == 'Open_TagAttr') {
                var ret = this.pars_attr(item_1);
                if (!ret) {
                    return null;
                }
                var name_2 = ret.name.replace(/(^\s+|\s+$)/g, '');
                var exp = this.pars_express();
                if (!exp) {
                    return null;
                }
                temp.args[name_2] = exp.code;
                continue;
            }
            else if (item_1.tag == 'Single_TagAttr') {
                var ret = this.pars_attr(item_1);
                if (!ret) {
                    return null;
                }
                var name_3 = ret.name.replace(/(^\s+|\s+$)/g, '');
                temp.args[name_3] = 'true';
                continue;
            }
            else {
                this.lexData.prev();
                var exp = this.pars_express();
                if (!exp) {
                    return null;
                }
                if (exp) {
                    temp.args['code'] = exp.code;
                }
                temp.node = item_1.node;
                return temp;
            }
        }
        temp.node = item.node;
        return temp;
    };
    //属性
    Parser.prototype.pars_attr = function (item) {
        var temp = {
            map: Parser.CODE_EMPTY,
            name: item.value.replace(/(^\s+|\s+$)/g, '').replace(/=+$/, ''),
            node: item.node
        };
        return temp;
    };
    Parser.prototype.pars_tagcode = function (item) {
        var temp = {
            map: Parser.CODE_TAG,
            name: item.value.replace(/(^\s+|\s+$)/g, ''),
            node: item.node,
            args: { code: '' }
        };
        var ret = this.pars_express();
        if (!ret) {
            return null;
        }
        temp.args.code = ret.code;
        return temp;
    };
    //关闭标签
    Parser.prototype.pars_tagend = function (item) {
        if (!this.lexData.testNext('Close_Tpl')) {
            return null;
        }
        var temp = {
            map: Parser.CODE_TAG_END,
            name: item.value.replace(/(^[\/\s]+|\s+$)/g, ''),
            node: item.node
        };
        return temp;
    };
    Parser.prototype.pars_closetpl = function (item) {
        var temp = {
            map: Parser.CODE_EMPTY,
            node: 'html'
        };
        if (item.tag != 'Close_Tpl') {
            return null;
        }
        return temp;
    };
    Parser.prototype.pars_empty = function (item) {
        return {
            map: Parser.CODE_EMPTY,
            node: item.node
        };
    };
    Parser.prototype.pars_block_open = function (item) {
        var temp = {
            map: Parser.CODE_BLOCK,
            name: 'block',
            node: item.node,
            args: {}
        };
        var lastbk = this.blocks_stack[this.blocks_stack.length - 1] || null;
        if (lastbk) {
            temp.map = Parser.CODE_EMPTY;
        }
        while (true) {
            var item_2 = this.lexData.next();
            if (item_2.map == 'Close_TagAttr') {
                continue;
            }
            if (item_2.map == 'Close_Tpl') {
                temp['start'] = item_2.end;
                continue;
            }
            if (item_2.map == 'Open_TagAttr') {
                var ret = this.pars_attr(item_2);
                if (!ret) {
                    return null;
                }
                var name_4 = ret.name;
                var exp = this.pars_express();
                // let value = this.pars_express_item(false);
                if (!exp) {
                    return null;
                }
                temp.args[name_4] = exp.code;
                continue;
            }
            else if (item_2.map == 'Single_TagAttr') {
                var ret = this.pars_attr(item_2);
                if (!ret) {
                    return null;
                }
                var name_5 = ret.name;
                temp.args[name_5] = 'true';
                continue;
            }
        }
    };
    Parser.prototype.pars_block_close = function (item) {
        var temp = this.blocks_stack[this.blocks_stack.length - 1] || null;
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
    };
    Parser.prototype.pars_modifier = function (item) {
        var temp = {
            map: Parser.CODE_MODIFIER,
            name: item.value.replace(/(^[\|\s]+|\s+$)/g, ''),
            code: '',
            node: item.node
        };
        //移除冒号
        var citem = this.lexData.next();
        if (!(citem && citem.node == 'modifier' && citem.value.replace(/(^\s+|\s+$)/g, '') == ':')) {
            this.lexData.prev();
        }
        return temp;
    };
    Parser.prototype.pars_raw = function (item) {
        var temp = {
            map: Parser.CODE_RAW,
            code: '',
            node: item.node
        };
        //console.log('raw-------------', temp);
        return temp;
    };
    Parser.prototype.assembly_modifier = function (ret, name) {
        var params = [ret.code];
        var mdname = null;
        while (true) {
            var exp = this.pars_express();
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
            var item = this.lexData.next();
            if (item.tag !== 'Comma') {
                this.lexData.prev();
                break;
            }
        }
        var callback = this.sdopx._Sdopx.CompileModifiers[name] || null;
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
    };
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
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map