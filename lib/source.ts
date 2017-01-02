import {Compile} from "./compile";
import {Sdopx} from "../sdopx";
import fs = require('fs');
import utils = require('./utils');

export class Source {

    //数据模板代码
    public content = null;

    public length = 0;
    public isload = false;
    //资源类型
    public type = 'file';
    //资源名称
    public name = null;
    //模板全名
    public tplname = null;
    //文件更新时间
    public timestamp = 0;
    //当前编译偏移量
    public cursor = 0;
    //资源是否存在
    public exitst = false;
    //资源ID
    public uid = null;
    //加载器
    public resource = null;
    //引擎
    public sdopx = null;
    //片段编译位置
    public bound = 0;
    //资源分割标记
    public left_delimiter = '\{';
    public right_delimiter = '\}';
    public left_delimiter_raw = '{';
    public right_delimiter_raw = '}';
    public end_literal = null;

    public constructor(resource, sdopx, tplname, tplid, type, name) {
        this.resource = resource;
        this.sdopx = sdopx;
        this.tplname = tplname;
        this.type = type;
        this.name = name;
        this.uid = tplid;
        this.changDelimiter(this.sdopx.left_delimiter, this.sdopx.rigth_delimiter);
    }

    public changDelimiter(left = '{', right = '}') {
        this.left_delimiter = utils.escapeRegExpChars(left);
        this.right_delimiter = utils.escapeRegExpChars(right);
        this.left_delimiter_raw = left;
        this.right_delimiter_raw = right;
    }

    //加载模板
    public load() {
        let {content='',timestamp=0} =this.resource.fetch(this.name, this.sdopx);
        //let Sdopx = this.sdopx._Sdopx;
        if (content.length > 0 && Sdopx.Filters['pre'] && Sdopx.Filters['pre'] instanceof Array) {
            for (let i = 0; i < Sdopx.Filters['pre'].length; i++) {
                let func = Sdopx.Filters['pre'][i];
                content = func(content, this.sdopx);
            }
        }
        this.content = content;
        this.length = content.length;
        this.timestamp = timestamp;
        this.isload = true;
        this.exitst = true;
        this.cursor = 0;
    }

    //获取资源最后更新时间
    public getTimestamp() {
        this.timestamp = this.resource.getTimestamp(this.name, this.sdopx);
        return this.timestamp;
    }

}