import { Template } from "./template";
import { Source } from "./source";
/**
 * Created by wj008 on 16-6-4.
 */
export declare class Resource {
    static resource_manager: {};
    static compileds: {};
    static registerResource(type: any, sourceObj: any): void;
    static parseResourceName(tplname: any): {
        type: any;
        name: any;
    };
    static getSource(sdopx: any, tplname: any, tplId: any): Source;
    static getTplSource(tpl: Template): Source;
    static getResource(type: any): any;
    static getPath(tplname: any, sdopx: any): any;
}
