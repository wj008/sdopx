import { TreeMap } from './tree_map';
/**
 * 词法分词器
 */
export declare class Lexer {
    private source;
    private regexp;
    private maps;
    private stack;
    private tree;
    private blocks;
    private sdopx;
    constructor(source: any);
    getSourceInfo(offset?: number): {
        line: any;
        offset: any;
        srcname: any;
    };
    private addError(err, offset?);
    private retInfo(regexp, offset?, normal?);
    private analysis(tagname, rules);
    private initNext(next);
    match(): {
        tag: any;
        value: any;
        start: any;
        end: any;
        token: any;
        node: any;
    };
    lexTpl(): TreeMap;
    lexHtml(): {
        map: string;
        code: any;
        next: any;
    };
    lexComment(): {
        map: string;
        code: string;
        next: string;
    };
    lexConfig(): TreeMap;
    getBlocks(): any;
    private findBrocks();
}
