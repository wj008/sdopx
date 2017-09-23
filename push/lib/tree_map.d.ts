/**
 * Created by Administrator on 2016/6/9.
 */
export declare class TreeMap {
    private data;
    private index;
    private info;
    setInfo(info: any): void;
    getInfo(): any;
    constructor();
    each(func: any): void;
    reset(): void;
    next(move?: boolean): any;
    prev(move?: boolean): any;
    end(): any;
    testNext(map: any, move?: boolean): boolean;
    current(): any;
    pop(): any;
    push(item: any): void;
    get(index: any): any;
}
