import { Source } from "./source";
import { Sdopx } from "../index";
import { Template } from "./template";
export declare class Varter {
    prefix: string;
    data: {};
    constructor(prefix: any);
    add(name: any): void;
}
export declare class Compile {
    static Plugins: {};
    private tag_stack;
    closed: boolean;
    private blockCache;
    private temp_vars;
    private varters;
    private temp_prefixs;
    source: Source;
    private parser;
    sdopx: Sdopx;
    tpl: Template;
    constructor(sdopx: Sdopx, tpl: Template);
    private getSourceInfo(offset?);
    addError(err: any, offset?: number): void;
    compileTemplate(): string;
    getLastPrefix(): any;
    getTempPrefix(name: any): any;
    getVarter(prefix: any): any;
    addVar(attrs: Varter): void;
    getVarKeys(): string[];
    getVar(key: any, replace?: boolean): any;
    hasVar(key: any): boolean;
    removeVar(prefix: any): boolean;
    openTag(tagname: any, data?: any): void;
    getEndTag(): any;
    closeTag(tags: any): any[];
    isInTag(tags: any): boolean;
    hasBlockCache(name: any): boolean;
    getBlockCache(name: string): any;
    addBlockCache(name: string, block: any): void;
    private getCursorBlockInfo(name, offset?);
    private getFirstBlockInfo(name);
    moveBlockToEnd(name: any, offset?: number): boolean;
    moveBlockToOver(name: any, offset?: number): boolean;
    compileBlock(name: any): any;
    setVarTemp(dist: any): void;
    getVarTemp(): {
        temp_vars: {};
        varters: {};
        temp_prefixs: {};
    };
    getParentBlock(name: any): any;
    static registerCompile(type: any, func?: any): void;
}
