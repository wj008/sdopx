"use strict";
//语法规则配置表
var Rules = (function () {
    function Rules() {
    }
    //变量入口表达式
    Rules.Expression = function (pfx) {
        if (pfx === void 0) { pfx = false; }
        var data = {
            Variable: 0,
            Number: 0,
            String: 0,
            Open_TplString: 0,
            KeyWord: 0,
            Open_Array: 0,
            Open_Object: 0,
            Not: 0,
            PrefixSymbol: 0,
            PrefixVarSymbol: 0,
            Open_Brackets: 0,
            Open_Function: 0
        };
        //如果是前置符号过来的 前面不再允许有前置符号
        if (pfx) {
            delete data.PrefixSymbol;
            delete data.PrefixVarSymbol;
        }
        return data;
    };
    //变量表达式尾部
    Rules.ExpreEnd = function (type) {
        if (type === void 0) { type = 0; }
        var data = {
            Close_TplDelimiter: { mode: 0, flags: ['tplexp'] },
            Close_Tpl: { mode: 0, flags: ['modifier', 'tagattr', 'tag', 'tpl'] },
            Close_TagAttr: { mode: 1, flags: ['modifier', 'tagattr'] },
            Close_Array: { mode: 0, flags: ['array'] },
            Close_Object: { mode: 0, flags: ['object'] },
            Close_Brackets: { mode: 0, flags: ['brackets'] },
            Close_Ternary: { mode: 0, flags: ['ternary'] },
            Close_Subscript: { mode: 0, flags: ['subscript'] },
            Close_Function: { mode: 0, flags: ['function'] },
            Close_Method: { mode: 0, flags: ['method'] },
            Close_DynamicMethod: { mode: 0, flags: ['dymethod'] },
            Open_Ternary: 0,
            Open_Subscript: 1,
            Open_Method: 1,
            VarPoint: 1,
            Open_DynamicMethod: 1,
            Raw: { mode: 0, flags: ['modifier', 'tagattr', 'tpl'] },
            Modifiers: { mode: 0, flags: ['modifier', 'tagattr', 'tpl'] },
            Symbol: 0,
            SuffixSymbol: 0,
            VariableSymbol: 0,
            Comma: { mode: 0, flags: ['array', 'brackets', 'function', 'method', 'dymethod', 'modifier'] },
            Object_Comma: { mode: 0, flags: ['object'] }
        };
        //1 是数字和常量
        if (type == 3) {
            delete data.Open_Subscript; //不支持下标
            delete data.Open_Method; //不支持方法
            delete data.VarPoint; //不支持点键名
            delete data.SuffixSymbol; //不支持尾部自增自减
            delete data.VariableSymbol; //不支持赋值
            delete data.Open_DynamicMethod;
        }
        else if (type == 2) {
            delete data.SuffixSymbol; //不支持尾部自增自减
            delete data.VariableSymbol; //不支持赋值和比较
            delete data.Open_DynamicMethod; //不支持动态方法
        }
        else if (type == 1) {
            delete data.SuffixSymbol; //不支持尾部自增自减
            delete data.VariableSymbol; //不支持赋值和比较
        }
        else {
            delete data.Symbol; //Symbol 和 VariableSymbol 重复
        }
        return data;
    };
    //初始化 寻找模板标记开始{
    Rules.Init = {
        next: { Open_Tpl: 1 }
    };
    //配置 寻找配置标记 {#
    Rules.Init_Config = {
        next: { Open_Config: 1 }
    };
    //打开配置文件标记
    Rules.Open_Config = {
        rule: /\{#/,
        next: { ConfigKey: 0 }
    };
    //配置属性值
    Rules.ConfigKey = {
        rule: /\w+(?:\.\w+)*(?:\|raw)?/,
        token: 'cfgkey',
        next: { Close_Config: 0 }
    };
    //关闭标记
    Rules.Close_Config = {
        rule: /#\}/,
        next: { Finish: 1 }
    };
    //关闭标记
    Rules.Close_Literal = {
        next: { Finish: 1 }
    };
    //打开模板标记
    Rules.Open_Tpl = {
        rule: /\{/,
        next: {
            Expression: Rules.Expression(),
            Open_CodeTag: 1,
            Open_Tag: 1,
            EndTag: 1
        },
        open: 'tpl'
    };
    //解析标签
    Rules.Open_Tag = {
        rule: /(?:\w+:)?\w+\s+|(?:\w+:)?\w+(?=\})/,
        token: 'tagname',
        next: {
            Close_Tpl: { mode: 0, flags: ['tag', 'tpl'] },
            Open_TagAttr: 6,
            Single_TagAttr: 6
        },
        open: 'tag'
    };
    //代码标签
    Rules.Open_CodeTag = {
        rule: /(?:if|else\s*if|while|assign|global|switch)\s+/,
        token: 'tagcode',
        next: Rules.Expression(),
        open: 'tag'
    };
    //结束标签
    Rules.EndTag = {
        rule: /\/(?:\w+:)?\w+/,
        token: 'tagend',
        next: {
            Close_Tpl: { mode: 0, flags: ['tpl'] }
        }
    };
    //标签属性
    Rules.Open_TagAttr = {
        rule: /@?\w+=/,
        token: 'attr',
        next: {
            VarKeyWord: 0,
            Expression: Rules.Expression()
        },
        open: 'tagattr'
    };
    //简单标记属性
    Rules.Single_TagAttr = {
        rule: /\w+/,
        token: 'attr',
        next: {
            Open_TagAttr: 6,
            Single_TagAttr: 6,
            Close_Tpl: 0
        }
    };
    //关闭属性
    Rules.Close_TagAttr = {
        rule: /\s+/,
        close: ['modifier', 'tagattr'],
        token: 'empty',
        next: {
            Open_TagAttr: 6,
            Single_TagAttr: 6,
            Close_Tpl: { mode: 0, flags: ['tag', 'tpl'] }
        }
    };
    //关闭模板
    Rules.Close_Tpl = {
        rule: /\}/,
        token: 'closetpl',
        next: {
            Finish: 1
        },
        close: ['modifier', 'tagattr', 'tpl']
    };
    /*数据类型*/
    //数字
    Rules.Number = {
        rule: /\d+\.\d+|\d+|\.\d+/,
        token: 'code',
        next: Rules.ExpreEnd(3)
    };
    //字面定义量
    Rules.VarKeyWord = {
        rule: /\w+(?=(?:\s+|\}))/,
        token: 'code',
        next: Rules.ExpreEnd(3)
    };
    //变量
    Rules.Variable = {
        rule: /\$\w+/,
        token: 'var',
        next: Rules.ExpreEnd()
    };
    //字符串
    Rules.String = {
        rule: /'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"/,
        token: 'string',
        next: Rules.ExpreEnd(2)
    };
    //打开模板字符串
    Rules.Open_TplString = {
        rule: /`/,
        token: 'string_open',
        next: {
            Close_TplString: 1,
            Open_TplDelimiter: 1,
            TplString: 1
        },
        open: 'tpl_string'
    };
    //模板字符串
    Rules.TplString = {
        rule: /[^`\{\\]*(?:\\.[^`\{\\]*)*/,
        token: 'tpl_string',
        next: {
            Open_TplDelimiter: 1,
            Close_TplString: 1
        }
    };
    //关闭模板字符
    Rules.Close_TplString = {
        rule: /`/,
        token: 'string_close',
        next: Rules.ExpreEnd(2),
        close: 'tpl_string'
    };
    //打开模板字符串内的表达式
    Rules.Open_TplDelimiter = {
        rule: /\{/,
        token: 'delimi_open',
        next: Rules.Expression(),
        open: 'tplexp'
    };
    //关闭模板字符串的表达式
    Rules.Close_TplDelimiter = {
        rule: /\}/,
        token: 'delimi_close',
        next: {
            Open_TplDelimiter: { mode: 1, flags: ['tpl_string'] },
            Close_TplString: { mode: 1, flags: ['tpl_string'] },
            TplString: 1
        },
        close: 'tplexp'
    };
    //关键字 暂时先这3个
    Rules.KeyWord = {
        rule: /false|true|null|void\s+0]/,
        token: 'code',
        next: Rules.ExpreEnd(3)
    };
    //点键名
    Rules.VarPoint = {
        rule: /\.\w+/,
        token: 'varkey',
        next: Rules.ExpreEnd()
    };
    //逗号
    Rules.Comma = {
        rule: /,/,
        token: 'code',
        next: Rules.Expression()
    };
    //冒号
    Rules.Colons = {
        rule: /:/,
        token: 'code',
        next: Rules.Expression()
    };
    //逗号 对象分割逗号
    Rules.Object_Comma = {
        rule: /,/,
        token: 'code',
        next: {
            Object_Key: { mode: 0, flags: ['object'] }
        }
    };
    //取非运算
    Rules.Not = {
        rule: /\!+/,
        token: 'code',
        next: Rules.Expression()
    };
    //前置++ --
    Rules.PrefixSymbol = {
        rule: /\+(?!\+)|\-(?!\-)/,
        token: 'code',
        next: Rules.Expression(true)
    };
    //仅变量
    Rules.PrefixVarSymbol = {
        rule: /\+\+|\-\-/,
        token: 'code',
        next: {
            Variable: 0
        }
    };
    //后置 ++ --
    Rules.SuffixSymbol = {
        rule: /\+\+|\-\-/,
        token: 'code',
        next: Rules.ExpreEnd(3)
    };
    //比较运算符号 常量可在前面
    Rules.Symbol = {
        rule: /===|!==|==|!=|>=|<=|\+|-|\*|\/|%|&&|\|\||>|</,
        token: 'code',
        next: Rules.Expression()
    };
    //符号 变量可以在前面
    Rules.VariableSymbol = {
        rule: /===|!==|==|!=|>=|<=|=|\+=|-=|\*=|\/=|%=|\+|-|\*|\/|%|&&|\|\||>|</,
        token: 'code',
        next: Rules.Expression()
    };
    //打开数组
    Rules.Open_Array = {
        rule: /\[/,
        token: 'code',
        next: {
            Expression: Rules.Expression(),
            Close_Array: { mode: 0, flags: ['array'] }
        },
        open: 'array'
    };
    //关闭数组
    Rules.Close_Array = {
        rule: /\]/,
        token: 'code',
        next: Rules.ExpreEnd(2),
        close: 'array'
    };
    //打开对象
    Rules.Open_Object = {
        rule: /\{/,
        token: 'code',
        next: {
            Object_Key: 0,
            Close_Object: { mode: 0, flags: ['object'] }
        },
        open: 'object'
    };
    //对象键名
    Rules.Object_Key = {
        rule: /\d+\s*\:|\w+\s*\:|'[^'\\]*(?:\\.[^'\\]*)*'\s*\:|"[^"\\]*(?:\\.[^"\\]*)*"\s*\:/,
        token: 'objkey',
        next: Rules.Expression()
    };
    //关闭对象
    Rules.Close_Object = {
        rule: /\}/,
        token: 'code',
        next: Rules.ExpreEnd(2),
        close: 'object'
    };
    //打开数组对象下标
    Rules.Open_Subscript = {
        rule: /\[/,
        token: 'code',
        next: Rules.Expression(),
        open: 'subscript'
    };
    //关闭数组对象下标
    Rules.Close_Subscript = {
        rule: /\]/,
        token: 'code',
        next: Rules.ExpreEnd(1),
        close: 'subscript'
    };
    //打开括号
    Rules.Open_Brackets = {
        rule: /\(/,
        token: 'code',
        next: Rules.Expression(),
        open: 'brackets'
    };
    //关闭括号
    Rules.Close_Brackets = {
        rule: /\)/,
        token: 'code',
        next: Rules.ExpreEnd(),
        close: 'brackets'
    };
    //打开三元表达式
    Rules.Open_Ternary = {
        rule: /\?/,
        token: 'code',
        next: Rules.Expression(),
        open: 'ternary'
    };
    //关闭三元表达式
    Rules.Close_Ternary = {
        rule: /\:/,
        token: 'code',
        next: Rules.Expression(),
        close: 'ternary'
    };
    //打开内置函数
    Rules.Open_Function = {
        rule: /\w+(?:\.\w+)*\(|new\s+\w+(?:\.\w+)*\(/,
        token: 'func',
        next: {
            Expression: Rules.Expression(),
            Close_Function: { mode: 0, flags: ['function'] }
        },
        open: 'function'
    };
    //关闭函数
    Rules.Close_Function = {
        rule: /\)/,
        token: 'func',
        next: Rules.ExpreEnd(1),
        close: 'function'
    };
    //方法打开
    Rules.Open_Method = {
        rule: /\.\w+\(/,
        token: 'method',
        next: {
            Expression: Rules.Expression(),
            Close_Method: { mode: 0, flags: ['method'] }
        },
        open: 'method'
    };
    //关闭方法
    Rules.Close_Method = {
        rule: /\)/,
        token: 'method',
        next: Rules.ExpreEnd(1),
        close: 'method'
    };
    //打开动态方法
    Rules.Open_DynamicMethod = {
        rule: /\(/,
        token: 'dymethod',
        next: {
            Expression: Rules.Expression(),
            Close_DynamicMethod: { mode: 0, flags: ['dymethod'] }
        },
        open: 'dymethod'
    };
    //关闭动态方法
    Rules.Close_DynamicMethod = {
        rule: /\)/,
        token: 'dymethod',
        next: Rules.ExpreEnd(1),
        close: 'dymethod'
    };
    //修饰符 只有结束标记可以关闭它
    Rules.Modifiers = {
        rule: /\|\w+/,
        token: 'modifier',
        next: {
            Colons: 0,
            Modifiers: 0,
            Close_Tpl: { mode: 0, flags: ['modifier', 'tagattr', 'tag', 'tpl'] },
            Close_TagAttr: { mode: 1, flags: ['modifier', 'tagattr'] }
        },
        open: 'modifier'
    };
    //不编码输出
    Rules.Raw = {
        rule: /\|raw\s*(?=\})/,
        token: 'raw',
        next: {
            Close_Tpl: { mode: 0, flags: ['modifier', 'tagattr', 'tag', 'tpl'] }
        }
    };
    return Rules;
}());
var SyntaxRules = (function () {
    function SyntaxRules() {
    }
    SyntaxRules.getRule = function (tag) {
        if (!Rules[tag]) {
            console.error('getRule:', tag);
            return null;
        }
        return Rules[tag].rule;
    };
    SyntaxRules.getToken = function (tag) {
        if (!Rules[tag]) {
            console.error('getToken:', tag);
            return null;
        }
        return Rules[tag].token || '';
    };
    SyntaxRules.getNext = function (tag) {
        if (!Rules[tag]) {
            console.error('getNext:', tag);
            return null;
        }
        return Rules[tag].next || null;
    };
    SyntaxRules.getClose = function (tag) {
        if (!Rules[tag]) {
            console.error('getClose:', tag);
            return null;
        }
        if (Rules[tag].close instanceof Array) {
            return Rules[tag].close;
        }
        else if (typeof (Rules[tag].close) === 'string') {
            return [Rules[tag].close];
        }
        return null;
    };
    SyntaxRules.getOpen = function (tag) {
        if (!Rules[tag]) {
            console.error('getOpen:', tag);
            return null;
        }
        return Rules[tag].open || null;
    };
    SyntaxRules.reset = function (left, right) {
        if (SyntaxRules.delimiter.left == left && SyntaxRules.delimiter.rigth == right) {
            return;
        }
        Rules.Open_Tpl.rule = new RegExp(left);
        Rules.Open_Config.rule = new RegExp(left + '#');
        Rules.Close_Tpl.rule = new RegExp(right);
        Rules.Close_Config.rule = new RegExp('#' + right);
        Rules.Open_Tag.rule = new RegExp('(?:\\w+:)?\\w+\\s+|(?:\\w+:)?\\w+(?=' + right + ')');
        Rules.Raw.rule = new RegExp('\\|raw\\s*(?=' + right + ')');
        Rules.VarKeyWord.rule = new RegExp('\\w+(?=(?:\\s+|' + right + '))');
        SyntaxRules.delimiter.left = left;
        SyntaxRules.delimiter.rigth = right;
    };
    SyntaxRules.delimiter = { left: '\\{', rigth: '\\}' };
    return SyntaxRules;
}());
exports.SyntaxRules = SyntaxRules;
//# sourceMappingURL=syntaxrules.js.map