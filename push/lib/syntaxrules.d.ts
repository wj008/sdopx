export declare class Rules {
    static BOUND_TPL: number;
    static BOUND_TAG: number;
    static BOUND_TAG_ATTR: number;
    static BOUND_MODIFIER: number;
    static BOUND_ARRAY: number;
    static BOUND_OBJECT: number;
    static BOUND_PARENTHESES: number;
    static BOUND_SUBSCRIPT: number;
    static BOUND_FUNCTION: number;
    static BOUND_METHOD: number;
    static BOUND_DYMETHOD: number;
    static BOUND_TERNARY: number;
    static BOUND_TPL_STREXP: number;
    static BOUND_TPL_STRING: number;
    private static expression(type?);
    private static finishExpression;
    static init(): {
        next: {
            openTpl: number;
        };
    };
    static initConfig(): {
        next: {
            openConfig: number;
        };
    };
    static openConfig(): {
        rule: RegExp;
        next: {
            configKey: number;
        };
    };
    static configKey(): {
        rule: RegExp;
        token: string;
        next: {
            closeConfig: number;
        };
    };
    static closeConfig(): {
        rule: RegExp;
        next: {
            finish: number;
        };
    };
    static closeLiteral(): {
        next: {
            finish: number;
        };
    };
    static openTpl(): {
        rule: RegExp;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        } & {
            openCodeTag: number;
            openTag: number;
            endTag: number;
        };
        open: number;
    };
    static openTag(): {
        rule: RegExp;
        token: string;
        next: {
            closeTpl: {
                mode: number;
                flags: number;
            };
            openTagAttr: number;
            singleTagAttr: number;
        };
        open: number;
    };
    static openCodeTag(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        };
        open: number;
    };
    static endTag(): {
        rule: RegExp;
        token: string;
        next: {
            closeTpl: {
                mode: number;
                flags: number;
            };
        };
    };
    static openTagAttr(): {
        rule: RegExp;
        token: string;
        next: {
            varKeyWord: number;
        } & {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        };
        open: number;
    };
    static singleTagAttr(): {
        rule: RegExp;
        token: string;
        next: {
            openTagAttr: number;
            singleTagAttr: number;
            closeTpl: number;
        };
    };
    static closeTagAttr(): {
        rule: RegExp;
        close: number;
        token: string;
        next: {
            openTagAttr: number;
            singleTagAttr: number;
            closeTpl: {
                mode: number;
                flags: number;
            };
        };
    };
    static closeTpl(): {
        rule: RegExp;
        token: string;
        next: {
            finish: number;
        };
        close: number;
    };
    static number(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
    };
    static varKeyWord(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
    };
    static variable(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
    };
    static string(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
    };
    static openTplString(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplString: number;
            openTplDelimiter: number;
            tplString: number;
        };
        open: number;
    };
    static tplString(): {
        rule: RegExp;
        token: string;
        next: {
            openTplDelimiter: number;
            closeTplString: number;
        };
    };
    static closeTplString(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
        close: number;
    };
    static openTplDelimiter(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        };
        open: number;
    };
    static closeTplDelimiter(): {
        rule: RegExp;
        token: string;
        next: {
            openTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTplString: {
                mode: number;
                flags: number;
            };
            tplString: number;
        };
        close: number;
    };
    static keyWord(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
    };
    static varPoint(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
    };
    static comma(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        };
    };
    static colons(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        };
    };
    static objectComma(): {
        rule: RegExp;
        token: string;
        next: {
            objectKey: {
                mode: number;
                flags: number;
            };
        };
    };
    static not(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        };
    };
    static prefixSymbol(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        };
    };
    static prefixVarSymbol(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
        };
    };
    static suffixSymbol(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
    };
    static symbol(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        };
    };
    static variableSymbol(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        };
    };
    static openArray(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        } & {
            closeArray: {
                mode: number;
                flags: number;
            };
        };
        open: number;
    };
    static closeArray(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
        close: number;
    };
    static openObject(): {
        rule: RegExp;
        token: string;
        next: {
            objectKey: number;
            closeObject: {
                mode: number;
                flags: number;
            };
        };
        open: number;
    };
    static objectKey(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        };
    };
    static closeObject(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
        close: number;
    };
    static openSubscript(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        };
        open: number;
    };
    static closeSubscript(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
        close: number;
    };
    static openParentheses(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        };
        open: number;
    };
    static closeParentheses(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
        close: number;
    };
    static openTernary(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        };
        open: number;
    };
    static closeTernary(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        };
        close: number;
    };
    static openFunction(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        } & {
            closeFunction: {
                mode: number;
                flags: number;
            };
        };
        open: number;
    };
    static closeFunction(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
        close: number;
    };
    static openMethod(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        } & {
            closeMethod: {
                mode: number;
                flags: number;
            };
        };
        open: number;
    };
    static closeMethod(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
        close: number;
    };
    static openDynamicMethod(): {
        rule: RegExp;
        token: string;
        next: {
            variable: number;
            number: number;
            string: number;
            openTplString: number;
            keyWord: number;
            openArray: number;
            openObject: number;
            not: number;
            prefixSymbol: number;
            prefixVarSymbol: number;
            openParentheses: number;
            openFunction: number;
        } & {
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
        };
        open: number;
    };
    static closeDynamicMethod(): {
        rule: RegExp;
        token: string;
        next: {
            closeTplDelimiter: {
                mode: number;
                flags: number;
            };
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
            closeArray: {
                mode: number;
                flags: number;
            };
            closeObject: {
                mode: number;
                flags: number;
            };
            closeParentheses: {
                mode: number;
                flags: number;
            };
            closeTernary: {
                mode: number;
                flags: number;
            };
            closeSubscript: {
                mode: number;
                flags: number;
            };
            closeFunction: {
                mode: number;
                flags: number;
            };
            closeMethod: {
                mode: number;
                flags: number;
            };
            closeDynamicMethod: {
                mode: number;
                flags: number;
            };
            openTernary: number;
            openSubscript: number;
            openMethod: number;
            varPoint: number;
            openDynamicMethod: number;
            raw: {
                mode: number;
                flags: number;
            };
            modifiers: {
                mode: number;
                flags: number;
            };
            symbol: number;
            suffixSymbol: number;
            variableSymbol: number;
            comma: {
                mode: number;
                flags: number;
            };
            objectComma: {
                mode: number;
                flags: number;
            };
        };
        close: number;
    };
    static modifiers(): {
        rule: RegExp;
        token: string;
        next: {
            colons: number;
            modifiers: number;
            closeTpl: {
                mode: number;
                flags: number;
            };
            closeTagAttr: {
                mode: number;
                flags: number;
            };
        };
        open: number;
    };
    static raw(): {
        rule: RegExp;
        token: string;
        next: {
            closeTpl: {
                mode: number;
                flags: number;
            };
        };
    };
}
export declare class SyntaxRules {
    static delimiter: {
        left: string;
        right: string;
    };
    static getRule(tag: any): any;
    static getToken(tag: any): any;
    static getNext(tag: any): any;
    static getClose(tag: any): any;
    static getOpen(tag: any): any;
    static reset(left: any, right: any): void;
}
