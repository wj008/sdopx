export declare class Source {
    content: any;
    length: number;
    isload: boolean;
    type: string;
    name: any;
    tplname: any;
    timestamp: number;
    cursor: number;
    exitst: boolean;
    tplId: any;
    resource: any;
    sdopx: any;
    bound: number;
    left_delimiter: string;
    right_delimiter: string;
    left_delimiter_raw: string;
    right_delimiter_raw: string;
    end_literal: any;
    literal: boolean;
    constructor(resource: any, sdopx: any, tplname: any, tplId: any, type: any, name: any);
    changDelimiter(left?: string, right?: string): void;
    load(): void;
    getTimestamp(): number;
}
