import { Compile } from "./compile";
import { Sdopx } from "../index";
import { Source } from "./source";
export declare class Parser {
    static CODE_HTML: string;
    static CODE_EXPRESS: string;
    static CODE_ASSIGN: string;
    static CODE_CONFIG: string;
    static CODE_TAG: string;
    static CODE_TAG_END: string;
    static CODE_BLOCK: string;
    static CODE_EMPTY: string;
    static CODE_COMMENT: string;
    static CODE_MODIFIER: string;
    static CODE_RAW: string;
    private blocks_stack;
    blocks: any[];
    private lexer;
    private compiler;
    private sdopx;
    private source;
    private lexData;
    constructor(sdopx: Sdopx, compile: Compile, source: Source);
    getBrock(name?: any): any;
    presHtml(): {
        map: string;
        code: any;
        next: any;
    };
    parsLiteral(): {
        map: string;
        name: string;
        node: string;
    };
    parsComment(): {
        map: string;
        code: string;
        next: string;
    };
    parsTpl(): any;
    parsConfig(): {
        map: string;
        code: string;
        node: any;
        raw: any;
    };
    parsNext(): any;
    pars_express(): {
        map: string;
        code: string;
        node: string;
        name: any;
        raw: any;
    };
    pars_code(item: any): {
        map: string;
        code: any;
        node: any;
    };
    pars_symbol(item: any): {
        map: string;
        code: any;
        node: any;
    };
    pars_var(item: any): {
        map: string;
        code: string;
        node: any;
    };
    pars_varkey(item: any): {
        map: string;
        code: any;
        node: any;
    };
    pars_objkey(item: any): {
        map: string;
        code: any;
        node: any;
    };
    pars_method(item: any): {
        map: string;
        code: any;
        node: any;
    };
    pars_func(item: any): {
        map: string;
        code: any;
        node: any;
    };
    pars_string(item: any): {
        map: string;
        code: any;
        node: any;
    };
    pars_string_open(item: any): {
        map: string;
        code: string;
        node: any;
    };
    pars_string_close(item: any): {
        map: string;
        code: string;
        node: any;
    };
    pars_tpl_string(item: any): {
        map: string;
        code: string;
        node: any;
    };
    pars_delimi_open(item: any): {
        map: string;
        code: string;
        node: any;
    };
    pars_delimi_close(item: any): {
        map: string;
        code: string;
        node: any;
    };
    pars_tagname(item: any): {
        map: string;
        name: string;
        node: any;
        args: {};
    };
    pars_attr(item: any): {
        map: string;
        name: any;
        node: any;
    };
    pars_tagcode(item: any): {
        map: string;
        name: any;
        node: any;
        args: {
            code: string;
        };
    };
    pars_tagend(item: any): {
        map: string;
        name: any;
        node: any;
    };
    pars_closetpl(item: any): {
        map: string;
        node: string;
    };
    pars_empty(item: any): {
        map: string;
        node: any;
    };
    pars_block_open(item: any): any;
    pars_block_close(item: any): any;
    pars_modifier(item: any): {
        map: string;
        name: any;
        code: string;
        node: any;
    };
    pars_raw(item: any): {
        map: string;
        code: string;
        node: any;
    };
    assembly_modifier(ret: any, name: any): any;
}
