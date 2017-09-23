import { Sdopx } from "../index";
import { Source } from "./source";
import { Compile } from "./compile";
export declare class Template {
    static complie_cache: {};
    sdopx: any;
    tplId: any;
    parent: any;
    tplname: any;
    property: {
        dependency: {};
        unifunc: any;
    };
    extends_tplId: {};
    recomplie: boolean;
    private source;
    private complie;
    constructor(tplname?: string, sdopx?: Sdopx, parent?: Template);
    private createTplId(tplname);
    getSource(): Source;
    getCompile(): Compile;
    createChildTemplate(tplname: any): Template;
    fetch(tplname: string): any;
    private fetchTpl();
    private run(unifunc);
    private runTemplate(codeid);
    private compileTemplate(codeid);
    private writeCachedCompile(code, codeid);
    compileTemplateSource(): string;
    private addDependency(source);
    private validProperties(item);
    getSubTemplate(tplname: any, params?: {}): any;
}
