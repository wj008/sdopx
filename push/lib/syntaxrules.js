"use strict";
//语法规则配置表
Object.defineProperty(exports, "__esModule", { value: true });
var Rules = (function () {
    function Rules() {
    }
    //变量表达式
    Rules.expression = function (type) {
        if (type === void 0) { type = 0; }
        var ret = {
            variable: 0,
            number: 0,
            string: 0,
            openTplString: 0,
            keyWord: 0,
            openArray: 0,
            openObject: 0,
            not: 0,
            prefixSymbol: 0,
            prefixVarSymbol: 0,
            openParentheses: 0,
            openFunction: 0,
        };
        if (type == 1) {
            delete ret.prefixSymbol;
            delete ret.prefixVarSymbol;
        }
        return ret;
    };
    //初始化 寻找模板标记开始{
    Rules.init = function () {
        return {
            next: { openTpl: 1 }
        };
    };
    //配置 寻找配置标记 {#
    Rules.initConfig = function () {
        return {
            next: { openConfig: 1 }
        };
    };
    //打开配置标记
    Rules.openConfig = function () {
        return {
            rule: new RegExp(SyntaxRules.delimiter.left + '#'),
            next: { configKey: 0 }
        };
    };
    //配置属性值
    Rules.configKey = function () {
        return {
            rule: /\w+(?:\.\w+)*(?:\|raw)?/,
            token: 'cfgkey',
            next: { closeConfig: 0 }
        };
    };
    //关闭标记
    Rules.closeConfig = function () {
        return {
            rule: new RegExp('#' + SyntaxRules.delimiter.right),
            next: { finish: 1 }
        };
    };
    //关闭标记
    Rules.closeLiteral = function () {
        return {
            next: {
                finish: 1
            }
        };
    };
    ;
    //打开模板标记
    Rules.openTpl = function () {
        var next = Object.assign(Rules.expression(0), {
            openCodeTag: 1,
            openTag: 1,
            endTag: 1
        });
        return {
            rule: new RegExp(SyntaxRules.delimiter.left),
            next: next,
            open: Rules.BOUND_TPL
        };
    };
    //解析标签
    Rules.openTag = function () {
        return {
            rule: new RegExp('(?:\\w+:)?\\w+\\s+|(?:\\w+:)?\\w+(?=' + SyntaxRules.delimiter.right + ')'),
            token: 'tagname',
            next: {
                closeTpl: { mode: 0, flags: Rules.BOUND_TAG | Rules.BOUND_TPL },
                openTagAttr: 6,
                singleTagAttr: 6,
            },
            open: Rules.BOUND_TAG,
        };
    };
    //代码标签
    Rules.openCodeTag = function () {
        return {
            rule: /(?:if|else\s*if|while|assign|global|switch)\s+/,
            token: 'tagcode',
            next: Rules.expression(0),
            open: Rules.BOUND_TAG,
        };
    };
    //结束标签
    Rules.endTag = function () {
        return {
            rule: /\/(?:\w+:)?\w+/,
            token: 'tagend',
            next: {
                closeTpl: { mode: 0, flags: Rules.BOUND_TPL },
            },
        };
    };
    //标签属性
    Rules.openTagAttr = function () {
        var next = Object.assign({
            varKeyWord: 0
        }, Rules.expression(0));
        return {
            rule: /@?\w+=/,
            token: 'attr',
            next: next,
            open: Rules.BOUND_TAG_ATTR,
        };
    };
    //简单标记属性
    Rules.singleTagAttr = function () {
        return {
            rule: /\w+/,
            token: 'attr',
            next: {
                openTagAttr: 6,
                singleTagAttr: 6,
                closeTpl: 0,
            },
        };
    };
    //关闭属性
    Rules.closeTagAttr = function () {
        return {
            rule: /\s+/,
            close: Rules.BOUND_TAG_ATTR | Rules.BOUND_MODIFIER,
            token: 'empty',
            next: {
                openTagAttr: 6,
                singleTagAttr: 6,
                closeTpl: { mode: 0, flags: Rules.BOUND_TAG | Rules.BOUND_TPL },
            },
        };
    };
    //关闭模板
    Rules.closeTpl = function () {
        return {
            rule: new RegExp(SyntaxRules.delimiter.right),
            token: 'closetpl',
            next: {
                finish: 1,
            },
            close: Rules.BOUND_MODIFIER | Rules.BOUND_TAG_ATTR | Rules.BOUND_TPL,
        };
    };
    /*数据类型*/
    //数字
    Rules.number = function () {
        return {
            rule: /\d+\.\d+|\d+|\.\d+/,
            token: 'code',
            next: Rules.finishExpression(3),
        };
    };
    //字面定义量
    Rules.varKeyWord = function () {
        return {
            rule: new RegExp('\\w+(?=(?:\\s+|' + SyntaxRules.delimiter.right + '))'),
            token: 'code',
            next: Rules.finishExpression(3)
        };
    };
    //变量
    Rules.variable = function () {
        return {
            rule: /\$\w+/,
            token: 'var',
            next: Rules.finishExpression(),
        };
    };
    //字符串
    Rules.string = function () {
        return {
            rule: /'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"/,
            token: 'string',
            next: Rules.finishExpression(2),
        };
    };
    //打开模板字符串
    Rules.openTplString = function () {
        return {
            rule: /`/,
            token: 'string_open',
            next: {
                closeTplString: 1,
                openTplDelimiter: 1,
                tplString: 1,
            },
            open: Rules.BOUND_TPL_STRING
        };
    };
    //模板字符串
    Rules.tplString = function () {
        return {
            rule: /[^`\{\\]*(?:\\.[^`\{\\]*)*/,
            token: 'tpl_string',
            next: {
                openTplDelimiter: 1,
                closeTplString: 1,
            },
        };
    };
    //关闭模板字符
    Rules.closeTplString = function () {
        return {
            rule: /`/,
            token: 'string_close',
            next: Rules.finishExpression(2),
            close: Rules.BOUND_TPL_STRING
        };
    };
    //打开模板字符串内的表达式
    Rules.openTplDelimiter = function () {
        return {
            rule: /\{/,
            token: 'delimi_open',
            next: Rules.expression(0),
            open: Rules.BOUND_TPL_STREXP
        };
    };
    //关闭模板字符串的表达式
    Rules.closeTplDelimiter = function () {
        return {
            rule: /\}/,
            token: 'delimi_close',
            next: {
                openTplDelimiter: { mode: 1, flags: Rules.BOUND_TPL_STRING },
                closeTplString: { mode: 1, flags: Rules.BOUND_TPL_STRING },
                tplString: 1,
            },
            close: Rules.BOUND_TPL_STREXP
        };
    };
    //关键字 暂时先这3个
    Rules.keyWord = function () {
        return {
            rule: /false|true|null|void\s+0]/,
            token: 'code',
            next: Rules.finishExpression(3)
        };
    };
    //点键名
    Rules.varPoint = function () {
        return {
            rule: /\.\w+/,
            token: 'varkey',
            next: Rules.finishExpression()
        };
    };
    //逗号
    Rules.comma = function () {
        return {
            rule: /,/,
            token: 'code',
            next: Rules.expression()
        };
    };
    //冒号
    Rules.colons = function () {
        return {
            rule: /:/,
            token: 'code',
            next: Rules.expression(),
        };
    };
    //逗号 对象分割逗号
    Rules.objectComma = function () {
        return {
            rule: /,/,
            token: 'code',
            next: {
                objectKey: { mode: 0, flags: Rules.BOUND_OBJECT },
            },
        };
    };
    //取非运算
    Rules.not = function () {
        return {
            rule: /\!+/,
            token: 'code',
            next: Rules.expression()
        };
    };
    //前置++ --
    Rules.prefixSymbol = function () {
        return {
            rule: /\+(?!\+)|\-(?!\-)/,
            token: 'code',
            next: Rules.expression(1),
        };
    };
    //仅变量
    Rules.prefixVarSymbol = function () {
        return {
            rule: /\+\+|\-\-/,
            token: 'code',
            next: {
                variable: 0,
            },
        };
    };
    //后置 ++ --
    Rules.suffixSymbol = function () {
        return {
            rule: /\+\+|\-\-/,
            token: 'code',
            next: Rules.finishExpression(3),
        };
    };
    //比较运算符号 常量可在前面
    Rules.symbol = function () {
        return {
            rule: /===|!==|==|!=|>=|<=|\+|-|\*|\/|%|&&|\|\||>|</,
            token: 'code',
            next: Rules.expression(),
        };
    };
    //符号 变量可以在前面
    Rules.variableSymbol = function () {
        return {
            rule: /===|!==|==|!=|>=|<=|=|\+=|-=|\*=|\/=|%=|\+|-|\*|\/|%|&&|\|\||>|</,
            token: 'code',
            next: Rules.expression(),
        };
    };
    //打开数组
    Rules.openArray = function () {
        return {
            rule: /\[/,
            token: 'code',
            next: Object.assign(Rules.expression(), {
                closeArray: { mode: 0, flags: Rules.BOUND_ARRAY }
            }),
            open: Rules.BOUND_ARRAY
        };
    };
    //关闭数组
    Rules.closeArray = function () {
        return {
            rule: /\]/,
            token: 'code',
            next: Rules.finishExpression(2),
            close: Rules.BOUND_ARRAY
        };
    };
    //打开对象
    Rules.openObject = function () {
        return {
            rule: /\{/,
            token: 'code',
            next: {
                objectKey: 0,
                closeObject: { mode: 0, flags: Rules.BOUND_OBJECT },
            },
            open: Rules.BOUND_OBJECT
        };
    };
    //对象键名
    Rules.objectKey = function () {
        return {
            rule: /\d+\s*\:|\w+\s*\:|'[^'\\]*(?:\\.[^'\\]*)*'\s*\:|"[^"\\]*(?:\\.[^"\\]*)*"\s*\:/,
            token: 'objkey',
            next: Rules.expression(),
        };
    };
    //关闭对象
    Rules.closeObject = function () {
        return {
            rule: /\}/,
            token: 'code',
            next: Rules.finishExpression(2),
            close: Rules.BOUND_OBJECT,
        };
    };
    //打开数组对象下标
    Rules.openSubscript = function () {
        return {
            rule: /\[/,
            token: 'code',
            next: Rules.expression(),
            open: Rules.BOUND_SUBSCRIPT,
        };
    };
    //关闭数组对象下标
    Rules.closeSubscript = function () {
        return {
            rule: /\]/,
            token: 'code',
            next: Rules.finishExpression(1),
            close: Rules.BOUND_SUBSCRIPT,
        };
    };
    //打开括号
    Rules.openParentheses = function () {
        return {
            rule: /\(/,
            token: 'code',
            next: Rules.expression(),
            open: Rules.BOUND_PARENTHESES,
        };
    };
    //关闭括号
    Rules.closeParentheses = function () {
        return {
            rule: /\)/,
            token: 'code',
            next: Rules.finishExpression(),
            close: Rules.BOUND_PARENTHESES,
        };
    };
    //打开三元表达式
    Rules.openTernary = function () {
        return {
            rule: /\?/,
            token: 'code',
            next: Rules.expression(),
            open: Rules.BOUND_TERNARY,
        };
    };
    //关闭三元表达式
    Rules.closeTernary = function () {
        return {
            rule: /\:/,
            token: 'code',
            next: Rules.expression(),
            close: Rules.BOUND_TERNARY,
        };
    };
    //打开内置函数
    Rules.openFunction = function () {
        return {
            rule: /\w+(?:\.\w+)*\(|new\s+\w+(?:\.\w+)*\(/,
            token: 'func',
            next: Object.assign(Rules.expression(), {
                closeFunction: { mode: 0, flags: Rules.BOUND_FUNCTION },
            }),
            open: Rules.BOUND_FUNCTION,
        };
    };
    //关闭函数
    Rules.closeFunction = function () {
        return {
            rule: /\)/,
            token: 'func',
            next: Rules.finishExpression(1),
            close: Rules.BOUND_FUNCTION,
        };
    };
    //方法打开
    Rules.openMethod = function () {
        return {
            rule: /\.\w+\(/,
            token: 'method',
            next: Object.assign(Rules.expression(), {
                closeMethod: { mode: 0, flags: Rules.BOUND_METHOD },
            }),
            open: Rules.BOUND_METHOD,
        };
    };
    //关闭方法
    Rules.closeMethod = function () {
        return {
            rule: /\)/,
            token: 'method',
            next: Rules.finishExpression(1),
            close: Rules.BOUND_METHOD,
        };
    };
    //打开动态方法
    Rules.openDynamicMethod = function () {
        return {
            rule: /\(/,
            token: 'dymethod',
            next: Object.assign(Rules.expression(), {
                closeDynamicMethod: { mode: 0, flags: Rules.BOUND_DYMETHOD },
            }),
            open: Rules.BOUND_DYMETHOD,
        };
    };
    //关闭动态方法
    Rules.closeDynamicMethod = function () {
        return {
            rule: /\)/,
            token: 'dymethod',
            next: Rules.finishExpression(1),
            close: Rules.BOUND_DYMETHOD,
        };
    };
    //修饰符 只有结束标记可以关闭它
    Rules.modifiers = function () {
        return {
            rule: /\|\w+/,
            token: 'modifier',
            next: {
                colons: 0,
                modifiers: 0,
                closeTpl: {
                    mode: 0,
                    flags: Rules.BOUND_MODIFIER | Rules.BOUND_TAG_ATTR | Rules.BOUND_TAG | Rules.BOUND_TPL
                },
                closeTagAttr: { mode: 1, flags: Rules.BOUND_MODIFIER | Rules.BOUND_TAG_ATTR },
            },
            open: Rules.BOUND_MODIFIER,
        };
    };
    //不编码输出
    Rules.raw = function () {
        return {
            rule: new RegExp('\\|raw\\s*(?=' + SyntaxRules.delimiter.right + ')'),
            token: 'raw',
            next: {
                closeTpl: {
                    mode: 0,
                    flags: Rules.BOUND_MODIFIER | Rules.BOUND_TAG_ATTR | Rules.BOUND_TAG | Rules.BOUND_TPL
                },
            },
        };
    };
    Rules.BOUND_TPL = 1; //模板
    Rules.BOUND_TAG = 2; //标签中
    Rules.BOUND_TAG_ATTR = 4; //属性中
    Rules.BOUND_MODIFIER = 8; //修饰器中
    Rules.BOUND_ARRAY = 16; //在数组中
    Rules.BOUND_OBJECT = 32; //在数组中
    Rules.BOUND_PARENTHESES = 64; //小括号
    Rules.BOUND_SUBSCRIPT = 128; //中括号
    Rules.BOUND_FUNCTION = 256; //函数中
    Rules.BOUND_METHOD = 512; //函数中
    Rules.BOUND_DYMETHOD = 1024; //函数中
    Rules.BOUND_TERNARY = 2048; //函数中
    Rules.BOUND_TPL_STREXP = 4096; //在字符串中的表达式
    Rules.BOUND_TPL_STRING = 8192; //函数中
    //变量表达式尾部
    Rules.finishExpression = function (type) {
        if (type === void 0) { type = 0; }
        var data = {
            closeTplDelimiter: { mode: 0, flags: Rules.BOUND_TPL_STREXP },
            closeTpl: { mode: 0, flags: Rules.BOUND_MODIFIER | Rules.BOUND_TAG_ATTR | Rules.BOUND_TAG | Rules.BOUND_TPL },
            closeTagAttr: { mode: 1, flags: Rules.BOUND_MODIFIER | Rules.BOUND_TAG_ATTR },
            closeArray: { mode: 0, flags: Rules.BOUND_ARRAY },
            closeObject: { mode: 0, flags: Rules.BOUND_OBJECT },
            closeParentheses: { mode: 0, flags: Rules.BOUND_PARENTHESES },
            closeTernary: { mode: 0, flags: Rules.BOUND_TERNARY },
            closeSubscript: { mode: 0, flags: Rules.BOUND_SUBSCRIPT },
            closeFunction: { mode: 0, flags: Rules.BOUND_FUNCTION },
            closeMethod: { mode: 0, flags: Rules.BOUND_METHOD },
            closeDynamicMethod: { mode: 0, flags: Rules.BOUND_DYMETHOD },
            openTernary: 0,
            openSubscript: 1,
            openMethod: 1,
            varPoint: 1,
            openDynamicMethod: 1,
            raw: { mode: 0, flags: Rules.BOUND_MODIFIER | Rules.BOUND_TAG_ATTR | Rules.BOUND_TPL },
            modifiers: { mode: 0, flags: Rules.BOUND_MODIFIER | Rules.BOUND_TAG_ATTR | Rules.BOUND_TPL },
            symbol: 0,
            suffixSymbol: 0,
            variableSymbol: 0,
            comma: {
                mode: 0,
                flags: Rules.BOUND_ARRAY | Rules.BOUND_PARENTHESES | Rules.BOUND_FUNCTION | Rules.BOUND_METHOD | Rules.BOUND_DYMETHOD | Rules.BOUND_MODIFIER
            },
            objectComma: { mode: 0, flags: Rules.BOUND_OBJECT },
        };
        //1 是数字和常量
        if (type == 3) {
            delete data.openSubscript; //不支持下标
            delete data.openMethod; //不支持方法
            delete data.varPoint; //不支持点键名
            delete data.suffixSymbol; //不支持尾部自增自减
            delete data.variableSymbol; //不支持赋值
            delete data.openDynamicMethod;
        }
        else if (type == 2) {
            delete data.suffixSymbol; //不支持尾部自增自减
            delete data.variableSymbol; //不支持赋值和比较
            delete data.openDynamicMethod; //不支持动态方法
        }
        else if (type == 1) {
            delete data.suffixSymbol; //不支持尾部自增自减
            delete data.variableSymbol; //不支持赋值和比较
        }
        else {
            delete data.symbol; //Symbol 和 VariableSymbol 重复
        }
        return data;
    };
    return Rules;
}());
exports.Rules = Rules;
var SyntaxRules = (function () {
    function SyntaxRules() {
    }
    SyntaxRules.getRule = function (tag) {
        if (!Rules[tag]) {
            //   console.error('getRule:', tag);
            return null;
        }
        return Rules[tag]().rule;
    };
    SyntaxRules.getToken = function (tag) {
        if (!Rules[tag]) {
            // console.error('getToken:', tag);
            return null;
        }
        return Rules[tag]().token || '';
    };
    SyntaxRules.getNext = function (tag) {
        if (!Rules[tag]) {
            //  console.error('getNext:', tag);
            return null;
        }
        return Rules[tag]().next || null;
    };
    SyntaxRules.getClose = function (tag) {
        if (!Rules[tag]) {
            //  console.error('getClose:', tag);
            return null;
        }
        return Rules[tag]().close || null;
    };
    SyntaxRules.getOpen = function (tag) {
        if (!Rules[tag]) {
            //  console.error('getOpen:', tag);
            return null;
        }
        return Rules[tag]().open || null;
    };
    SyntaxRules.reset = function (left, right) {
        SyntaxRules.delimiter.left = left;
        SyntaxRules.delimiter.right = right;
    };
    SyntaxRules.delimiter = { left: '\\{', right: '\\}' };
    return SyntaxRules;
}());
exports.SyntaxRules = SyntaxRules;
//# sourceMappingURL=syntaxrules.js.map