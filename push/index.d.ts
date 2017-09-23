import { Template } from "./lib/template";
export declare class SdopxError extends Error {
    type: string;
    path: string;
}
export declare class Sdopx extends Template {
    static version: any;
    static debug: boolean;
    static extension: string;
    static create_runfile: boolean;
    static left_delimiter: string;
    static right_delimiter: string;
    context: any;
    _book: {};
    _plugin: {};
    _config: {};
    _Sdopx: typeof Sdopx;
    static view_paths: string;
    force_compile: boolean;
    compile_check: boolean;
    static Functions: {};
    static Modifiers: {};
    static CompileModifiers: {};
    static Filters: {};
    static Resources: {};
    static Plugins: {};
    extends_tplId: {};
    private template_dirs;
    private template_index;
    private _joined;
    left_delimiter: any;
    right_delimiter: any;
    funcMap: {
        [p: string]: Function;
    };
    constructor(context?: any);
    assign(key: any, value?: any): void;
    assignConfig(key: any, value?: any): void;
    display(tplname: any): any;
    setTemplateDir(dirnames: any): void;
    addTemplateDir(dirnames: any): void;
    getTemplateDir(key?: any): any;
    getTemplateJoined(): string;
    static registerResource(type: any, sourceObj: any): void;
    static registerFilter(type: any, filter: any): void;
    static registerFunction(name: any, func: any): void;
    static registerModifier(name: any, func: any): void;
    static registerCompileModifier(name: any, func: any): void;
    static registerPlugin(name: any, func: any, type?: number): void;
    static registerCompile(name: any, func?: any): void;
    rethrow(err: any, lineno?: any, tplname?: any): void;
    addError(err: any, lineno?: any, tplname?: any): void;
}
