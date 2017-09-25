//语法规则配置表


export class Rules {

    public static BOUND_TPL = 1; //模板
    public static BOUND_TAG = 2;  //标签中
    public static BOUND_TAG_ATTR = 4; //属性中
    public static BOUND_MODIFIER = 8; //修饰器中
    public static BOUND_ARRAY = 16; //在数组中
    public static BOUND_OBJECT = 32; //在数组中
    public static BOUND_PARENTHESES = 64;//小括号
    public static BOUND_SUBSCRIPT = 128;//中括号
    public static BOUND_FUNCTION = 256;//函数中
    public static BOUND_METHOD = 512;//函数中
    public static BOUND_DYMETHOD = 1024;//函数中
    public static BOUND_TERNARY = 2048;//函数中
    public static BOUND_TPL_STREXP = 4096; //在字符串中的表达式
    public static BOUND_TPL_STRING = 8192;//函数中
    //变量表达式
    private static expression(type = 0) {
        let ret = {
            variable: 0,
            number: 0,
            string: 0,
            openTplString: 0,
            keyWord: 0,
            openArray: 0,//数组
            openObject: 0,
            not: 0,//变量表达式可以 ! 开头
            prefixSymbol: 0,//变量表达式可以 ++? --? +? -? 开头
            prefixVarSymbol: 0,
            openParentheses: 0,
            openFunction: 0,
        };
        if (type == 1) {
            delete ret.prefixSymbol;
            delete ret.prefixVarSymbol;
        }
        return ret;
    }

    //变量表达式尾部
    private static finishExpression = function (type = 0) {
        let data = {
            closeTplDelimiter: {mode: 0, flags: Rules.BOUND_TPL_STREXP},
            closeTpl: {mode: 0, flags: Rules.BOUND_MODIFIER | Rules.BOUND_TAG_ATTR | Rules.BOUND_TAG | Rules.BOUND_TPL},
            closeTagAttr: {mode: 1, flags: Rules.BOUND_MODIFIER | Rules.BOUND_TAG_ATTR},
            closeArray: {mode: 0, flags: Rules.BOUND_ARRAY},//任何数值在数值之间都可以关闭
            closeObject: {mode: 0, flags: Rules.BOUND_OBJECT},
            closeParentheses: {mode: 0, flags: Rules.BOUND_PARENTHESES},
            closeTernary: {mode: 0, flags: Rules.BOUND_TERNARY},
            closeSubscript: {mode: 0, flags: Rules.BOUND_SUBSCRIPT},
            closeFunction: {mode: 0, flags: Rules.BOUND_FUNCTION},
            closeMethod: {mode: 0, flags: Rules.BOUND_METHOD}, //关闭方法
            closeDynamicMethod: {mode: 0, flags: Rules.BOUND_DYMETHOD}, //关闭动态方法
            openTernary: 0,
            openSubscript: 1,
            openMethod: 1,
            varPoint: 1,
            openDynamicMethod: 1,//动态方法
            raw: {mode: 0, flags: Rules.BOUND_MODIFIER | Rules.BOUND_TAG_ATTR | Rules.BOUND_TPL}, //打开修饰符
            modifiers: {mode: 0, flags: Rules.BOUND_MODIFIER | Rules.BOUND_TAG_ATTR | Rules.BOUND_TPL}, //打开修饰符
            symbol: 0,        //支持比较符号等
            suffixSymbol: 0,  //尾部自增自减
            variableSymbol: 0,//支持赋值和比较
            comma: {
                mode: 0,
                flags: Rules.BOUND_ARRAY | Rules.BOUND_PARENTHESES | Rules.BOUND_FUNCTION | Rules.BOUND_METHOD | Rules.BOUND_DYMETHOD | Rules.BOUND_MODIFIER
            },
            objectComma: {mode: 0, flags: Rules.BOUND_OBJECT},
        };
        //1 是数字和常量
        if (type == 3) {
            delete data.openSubscript; //不支持下标
            delete data.openMethod;    //不支持方法
            delete data.varPoint;       //不支持点键名
            delete data.suffixSymbol;   //不支持尾部自增自减
            delete data.variableSymbol; //不支持赋值
            delete data.openDynamicMethod;
        }
        //数组 对象 其他表达式等 不支持 赋值 等 支持下标
        else if (type == 2) {
            delete data.suffixSymbol;       //不支持尾部自增自减
            delete data.variableSymbol;     //不支持赋值和比较
            delete data.openDynamicMethod; //不支持动态方法
        }
        else if (type == 1) {
            delete data.suffixSymbol;       //不支持尾部自增自减
            delete data.variableSymbol;     //不支持赋值和比较
        }
        //变量类型 剔除重复比较属性
        else {
            delete data.symbol; //Symbol 和 VariableSymbol 重复
        }
        return data;
    };

    //初始化 寻找模板标记开始{
    public static init() {
        return {
            next: {openTpl: 1}
        };
    }

    //配置 寻找配置标记 {#
    public static initConfig() {
        return {
            next: {openConfig: 1}
        }
    }

    //打开配置标记
    public static openConfig() {
        return {
            rule: new RegExp(SyntaxRules.delimiter.left + '#'),
            next: {configKey: 0}
        }
    }

    //配置属性值
    public static configKey() {
        return {
            rule: /\w+(?:\.\w+)*(?:\|raw)?/,
            token: 'cfgkey',
            next: {closeConfig: 0}
        };
    }

    //关闭标记
    public static closeConfig() {
        return {
            rule: new RegExp('#' + SyntaxRules.delimiter.right),
            next: {finish: 1}
        };
    }

    //关闭标记
    public static closeLiteral() {
        return {
            next: {
                finish: 1
            }
        }
    };

    //打开模板标记
    public static openTpl() {
        let next = Object.assign(Rules.expression(0), {
            openCodeTag: 1,
            openTag: 1,
            endTag: 1
        });
        return {
            rule: new RegExp(SyntaxRules.delimiter.left),
            next: next,
            open: Rules.BOUND_TPL
        };
    }

    //解析标签
    public static openTag() {
        return {
            rule: new RegExp('(?:\\w+:)?\\w+\\s+|(?:\\w+:)?\\w+(?=' + SyntaxRules.delimiter.right + ')'),
            token: 'tagname',
            next: {
                closeTpl: {mode: 0, flags: Rules.BOUND_TAG | Rules.BOUND_TPL},
                openTagAttr: 6,
                singleTagAttr: 6,
            },
            open: Rules.BOUND_TAG,
        };

    }

    //代码标签
    public static openCodeTag() {
        return {
            rule: /(?:if|else\s*if|while|assign|global|switch)\s+/,
            token: 'tagcode',
            next: Rules.expression(0),
            open: Rules.BOUND_TAG,
        };
    }

    //结束标签
    public static endTag() {
        return {
            rule: /\/(?:\w+:)?\w+/,
            token: 'tagend',
            next: {
                closeTpl: {mode: 0, flags: Rules.BOUND_TPL},
            },
        };
    }

    //标签属性
    public static openTagAttr() {
        let next = Object.assign({
            varKeyWord: 0
        }, Rules.expression(0));
        return {
            rule: /@?\w+=/,
            token: 'attr',
            next: next,
            open: Rules.BOUND_TAG_ATTR,
        };
    }

    //简单标记属性
    public static singleTagAttr() {
        return {
            rule: /\w+/,
            token: 'attr',
            next: {
                openTagAttr: 6,
                singleTagAttr: 6,
                closeTpl: 0,
            },
        };
    }

    //关闭属性
    public static closeTagAttr() {
        return {
            rule: /\s+/,
            close: Rules.BOUND_TAG_ATTR | Rules.BOUND_MODIFIER,
            token: 'empty',
            next: {
                openTagAttr: 6,
                singleTagAttr: 6,
                closeTpl: {mode: 0, flags: Rules.BOUND_TAG | Rules.BOUND_TPL},
            },
        };
    }

    //关闭模板
    public static closeTpl() {
        return {
            rule: new RegExp(SyntaxRules.delimiter.right),
            token: 'closetpl',
            next: {
                finish: 1,
            },
            close: Rules.BOUND_MODIFIER | Rules.BOUND_TAG_ATTR | Rules.BOUND_TPL,
        };
    }

    /*数据类型*/

    //数字
    public static number() {
        return {
            rule: /\d+\.\d+|\d+|\.\d+/,
            token: 'code',
            next: Rules.finishExpression(3),
        };
    }

    //字面定义量
    public static varKeyWord() {
        return {
            rule: new RegExp('\\w+(?=(?:\\s+|' + SyntaxRules.delimiter.right + '))'),
            token: 'code',
            next: Rules.finishExpression(3)
        };
    }

    //变量
    public static variable() {
        return {
            rule: /\$\w+/,
            token: 'var',
            next: Rules.finishExpression(),
        };
    }

    //字符串
    public static string() {
        return {
            rule: /'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"/,
            token: 'string',
            next: Rules.finishExpression(2),
        };
    }

    //打开模板字符串
    public static openTplString() {
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
    }

    //模板字符串
    public static tplString() {
        return {
            rule: /[^`\{\\]*(?:\\.[^`\{\\]*)*/,
            token: 'tpl_string',
            next: {
                openTplDelimiter: 1,
                closeTplString: 1,
            },
        };
    }

    //关闭模板字符
    public static closeTplString() {
        return {
            rule: /`/,
            token: 'string_close',
            next: Rules.finishExpression(2),
            close: Rules.BOUND_TPL_STRING
        };
    }

    //打开模板字符串内的表达式
    public static openTplDelimiter() {
        return {
            rule: /\{/,
            token: 'delimi_open',
            next: Rules.expression(0),
            open: Rules.BOUND_TPL_STREXP
        };
    }


    //关闭模板字符串的表达式
    public static closeTplDelimiter() {
        return {
            rule: /\}/,
            token: 'delimi_close',
            next: {
                openTplDelimiter: {mode: 1, flags: Rules.BOUND_TPL_STRING},
                closeTplString: {mode: 1, flags: Rules.BOUND_TPL_STRING},
                tplString: 1,
            },
            close: Rules.BOUND_TPL_STREXP
        };
    }

    //关键字 暂时先这3个
    public static keyWord() {
        return {
            rule: /false|true|null|void\s+0]|Object|Array/,
            token: 'code',
            next: Rules.finishExpression(3)
        };
    }

    //点键名
    public static varPoint() {
        return {
            rule: /\.\w+/,
            token: 'varkey',
            next: Rules.finishExpression()
        };
    }

    //逗号
    public static comma() {
        return {
            rule: /,/,
            token: 'code',
            next: Rules.expression()
        };
    }

//冒号
    public static colons() {
        return {
            rule: /:/,
            token: 'code',
            next: Rules.expression(),
        };
    }

//逗号 对象分割逗号
    public static objectComma() {
        return {
            rule: /,/,
            token: 'code',
            next: {
                objectKey: {mode: 0, flags: Rules.BOUND_OBJECT},
            },
        };
    }

//取非运算
    public static not() {
        return {
            rule: /\!+/,
            token: 'code',
            next: Rules.expression()
        };
    }

//前置++ --
    public static prefixSymbol() {
        return {
            rule: /\+(?!\+)|\-(?!\-)/,
            token: 'code',
            next: Rules.expression(1),
        };
    }

//仅变量
    public static prefixVarSymbol() {
        return {
            rule: /\+\+|\-\-/,
            token: 'code',
            next: {
                variable: 0,
            },
        };
    }

//后置 ++ --
    public static suffixSymbol() {
        return {
            rule: /\+\+|\-\-/,
            token: 'code',
            next: Rules.finishExpression(3),
        };
    }

//比较运算符号 常量可在前面
    public static symbol() {
        return {
            rule: /===|!==|==|!=|>=|<=|\+|-|\*|\/|%|&&|\|\||>|<|instanceof/,
            token: 'symbol',
            next: Rules.expression(),
        };
    }

//符号 变量可以在前面
    public static variableSymbol() {
        return {
            rule: /===|!==|==|!=|>=|<=|=|\+=|-=|\*=|\/=|%=|\+|-|\*|\/|%|&&|\|\||>|<|instanceof/,
            token: 'symbol',
            next: Rules.expression(),
        };
    }

//打开数组
    public static openArray() {
        return {
            rule: /\[/,
            token: 'code',
            next: Object.assign(Rules.expression(), {
                closeArray: {mode: 0, flags: Rules.BOUND_ARRAY}
            }),
            open: Rules.BOUND_ARRAY
        };
    }

//关闭数组
    public static closeArray() {
        return {
            rule: /\]/,
            token: 'code',
            next: Rules.finishExpression(2),
            close: Rules.BOUND_ARRAY
        };
    }

//打开对象
    public static openObject() {
        return {
            rule: /\{/,
            token: 'code',
            next: {
                objectKey: 0,
                closeObject: {mode: 0, flags: Rules.BOUND_OBJECT},
            },
            open: Rules.BOUND_OBJECT
        };
    }

//对象键名
    public static objectKey() {
        return {
            rule: /\d+\s*\:|\w+\s*\:|'[^'\\]*(?:\\.[^'\\]*)*'\s*\:|"[^"\\]*(?:\\.[^"\\]*)*"\s*\:/,
            token: 'objkey',
            next: Rules.expression(),
        };
    }

//关闭对象
    public static closeObject() {
        return {
            rule: /\}/,
            token: 'code',
            next: Rules.finishExpression(2),
            close: Rules.BOUND_OBJECT,
        };
    }

//打开数组对象下标
    public static openSubscript() {
        return {
            rule: /\[/,
            token: 'code',
            next: Rules.expression(),
            open: Rules.BOUND_SUBSCRIPT,
        };
    }

//关闭数组对象下标
    public static closeSubscript() {
        return {
            rule: /\]/,
            token: 'code',
            next: Rules.finishExpression(1),
            close: Rules.BOUND_SUBSCRIPT,
        };
    }

//打开括号
    public static openParentheses() {
        return {
            rule: /\(/,
            token: 'code',
            next: Rules.expression(),
            open: Rules.BOUND_PARENTHESES,
        };
    }

//关闭括号
    public static closeParentheses() {
        return {
            rule: /\)/,
            token: 'code',
            next: Rules.finishExpression(),
            close: Rules.BOUND_PARENTHESES,
        };
    }

//打开三元表达式
    public static openTernary() {
        return {
            rule: /\?/,
            token: 'code',
            next: Rules.expression(),
            open: Rules.BOUND_TERNARY,
        };
    }

//关闭三元表达式
    public static closeTernary() {
        return {
            rule: /\:/,
            token: 'code',
            next: Rules.expression(),
            close: Rules.BOUND_TERNARY,
        };
    }

//打开内置函数
    public static openFunction() {
        return {
            rule: /\w+(?:\.\w+)*\(|new\s+\w+(?:\.\w+)*\(/,
            token: 'func',
            next: Object.assign(Rules.expression(), {
                closeFunction: {mode: 0, flags: Rules.BOUND_FUNCTION},
            }),
            open: Rules.BOUND_FUNCTION,
        };
    }

//关闭函数
    public static closeFunction() {
        return {
            rule: /\)/,
            token: 'func',
            next: Rules.finishExpression(1),
            close: Rules.BOUND_FUNCTION,
        };
    }

//方法打开
    public static openMethod() {
        return {
            rule: /\.\w+\(/,
            token: 'method',
            next: Object.assign(Rules.expression(), {
                closeMethod: {mode: 0, flags: Rules.BOUND_METHOD},
            }),
            open: Rules.BOUND_METHOD,
        };
    }

//关闭方法
    public static closeMethod() {
        return {
            rule: /\)/,
            token: 'method',
            next: Rules.finishExpression(1),
            close: Rules.BOUND_METHOD,
        };
    }

//打开动态方法
    public static openDynamicMethod() {
        return {
            rule: /\(/,
            token: 'dymethod',
            next: Object.assign(Rules.expression(), {
                closeDynamicMethod: {mode: 0, flags: Rules.BOUND_DYMETHOD},
            }),
            open: Rules.BOUND_DYMETHOD,
        };
    }

//关闭动态方法
    public static closeDynamicMethod() {
        return {
            rule: /\)/,
            token: 'dymethod',
            next: Rules.finishExpression(1),
            close: Rules.BOUND_DYMETHOD,
        };
    }

//修饰符 只有结束标记可以关闭它
    public static modifiers() {
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
                closeTagAttr: {mode: 1, flags: Rules.BOUND_MODIFIER | Rules.BOUND_TAG_ATTR},
            },
            open: Rules.BOUND_MODIFIER,
        };
    }

//不编码输出
    public static raw() {
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
    }

}

export class SyntaxRules {

    public static delimiter = {left: '\\{', right: '\\}'};

    public static getRule(tag) {
        if (!Rules[tag]) {
            //   console.error('getRule:', tag);
            return null;
        }
        return Rules[tag]().rule;
    }

    public static getToken(tag) {
        if (!Rules[tag]) {
            // console.error('getToken:', tag);
            return null;
        }
        return Rules[tag]().token || '';
    }

    public static getNext(tag) {
        if (!Rules[tag]) {
            //  console.error('getNext:', tag);
            return null;
        }
        return Rules[tag]().next || null;
    }

    public static getClose(tag) {
        if (!Rules[tag]) {
            //  console.error('getClose:', tag);
            return null;
        }
        return Rules[tag]().close || null;
    }

    public static getOpen(tag) {
        if (!Rules[tag]) {
            //  console.error('getOpen:', tag);
            return null;
        }
        return Rules[tag]().open || null;
    }

    public static reset(left, right) {
        SyntaxRules.delimiter.left = left;
        SyntaxRules.delimiter.right = right;
    }

}