import {Template} from "./template";
import {Sdopx} from "../sdopx";
import {Source} from "./source";
import fs = require('fs');
import path = require('path');

/**
 * Created by wj008 on 16-6-4.
 */
export class Resource {

    //资源配置
    public static resource_manager = {};

    //已编译好的
    public static compileds = {};

    //添加源
    public static registerResource(type, sourceObj) {
        if (typeof(type) !== 'string') {
            return;
        }
        if (!sourceObj) {
            return;
        }
        if (!sourceObj.fetch || !sourceObj.getTimestamp
            || typeof(sourceObj.fetch) !== 'function' || typeof(sourceObj.getTimestamp) !== 'function') {
            return;
        }
        Resource.resource_manager[type] = sourceObj;
    }

    //获取类型名称
    public static parseResourceName(tplname) {
        let temp = tplname.match(/^(\w+):/);
        if (!temp) {
            return {type: 'file', name: tplname};
        }
        let code = tplname.replace(/^(\w+):/, '');
        return {type: temp[1].toLowerCase(), name: code};
    }

    //获取源数据
    public static getSource(sdopx, tplname, tplId) {
        let {type, name}=Resource.parseResourceName(tplname);
        let resource = Resource.getResource(type);
        return new Source(resource, sdopx, tplname, tplId, type, name);
    }

    //获取源数据
    public static getTplSource(tpl: Template) {
        let sdopx = tpl.sdopx;
        let tplname = tpl.tplname;
        let tplID = tpl.tplId;
        return Resource.getSource(sdopx, tplname, tplID);
    }

    //加载文件数据对象
    public static getResource(type) {
        if (Resource.resource_manager[type]) {
            return Resource.resource_manager[type];
        }
        return null;
    }

    public static getPath(tplname, sdopx) {
        //处理绝对路径
        if (path.sep == '\\') {
            if (/^[A-Z]:/i.test(tplname)) {
                if (fs.existsSync(tplname)) {
                    return tplname;
                }
            }
        } else {
            if (/^\//.test(tplname)) {
                if (fs.existsSync(tplname)) {
                    return tplname;
                }
            }
        }

        let testPath = function (dirname, tplname) {
            let fpath = path.join(dirname, tplname);
            if (!/\.[a-z]+$/i.test(tplname)) {
                let epath = fpath + '.' + Sdopx.extension;
                if (fs.existsSync(epath)) {
                    return epath;
                }
                return null;
            }
            //有自己的后缀
            if (fs.existsSync(fpath)) {
                return fpath;
            }
            //补后缀
            if (fs.existsSync(fpath + '.' + Sdopx.extension)) {
                return fpath + '.' + Sdopx.extension
            }
            return null;
        }
        //公共目录
        if (tplname.substr(0, 1) == '@') {
            let common_path = sdopx.getTemplateDir('common');
            if (!common_path) {
                sdopx.rethrow(`common dir is not defiend!`);
            }
            tplname = tplname.substr(1);
            return testPath(common_path, tplname);
        }
        let tpldirs = sdopx.getTemplateDir();
        for (let key in tpldirs) {
            if (key === 'common') {
                continue;
            }
            let fpath = testPath(tpldirs[key], tplname);
            if (fpath) {
                return fpath;
            }
        }
        return null;
    }

}
//注册文件读取类
Resource.registerResource('file', {
    fetch: function (tplname, sdopx) {
        let filepath = Resource.getPath(tplname, sdopx);
        if (filepath == null) {
            if (!/\.[a-z]+$/i.test(tplname)) {
                tplname += '.' + Sdopx.extension;
            }
            sdopx.rethrow(`file does not exist:'${tplname}'`);
            return {content: '', timestamp: 0, filepath: tplname};
        }
        let state = fs.statSync(filepath);
        if (!state) {
            sdopx.rethrow(`file does not exist:'${filepath}'`);
            return {content: '', timestamp: 0, filepath: filepath};
        }
        let content = fs.readFileSync(filepath).toString().replace(/^\uFEFF/, '');
        let timestamp = new Date(state.mtime).getTime();
        return {content: content, timestamp: timestamp, filepath: filepath};
    },
    getTimestamp: function (tplname, sdopx) {
        let filepath = Resource.getPath(tplname, sdopx);
        if (filepath == null) {
            return 0;
        }
        let state = fs.statSync(filepath);
        return new Date(state.mtime).getTime();
    }
});

//继承资源类型
Resource.registerResource('extends', {
    fetch: function (tplname, sdopx) {
        let names = tplname.split('|');
        if (names.length < 2) {
            sdopx.rethrow(`file does not exist:'${tplname}'`);
        }
        let {type, name}=Resource.parseResourceName(tplname);
        let resource = Resource.getResource(type);
        if (!resource) {
            sdopx.rethrow(`resource does not exist,type:'${type}'`);
        }
        let tplchild = names.pop();
        let extend = names.join('|');
        let {content = '', timestamp = 0} = resource.fetch(tplchild, sdopx);
        content = sdopx.left_delimiter + 'extends file=\'' + extend + '\'' + sdopx.right_delimiter + content;
        return {content: content, timestamp: timestamp};
    },

    getTimestamp: function (tplname, sdopx) {
        let names = tplname.split('|');
        if (names.length < 2) {
            sdopx.rethrow(`file does not exist:'${tplname}'`);
            return 0;
        }
        let {type, name}=Resource.parseResourceName(tplname);
        let resource = Resource.getResource(type);
        if (!resource) {
            sdopx.rethrow(`resource does not exist,type:'${type}'`);
            return 0;
        }
        let tplchild = names.pop();
        return resource.getTimestamp(tplchild, sdopx);
    }
});

Resource.registerResource('string', {
    fetch: function (tplname, sdopx) {
        return {content: tplname, timestamp: 0};
    },
    getTimestamp: function (tplname, sdopx) {
        return -1;
    }
});

Resource.registerResource('base64', {
    fetch: function (tplname, sdopx) {
        let buf = new Buffer(tplname, 'base64')
        return {content: buf.toString('utf8'), timestamp: 0};
    },
    getTimestamp: function (tplname, sdopx) {
        return -1;
    }
});