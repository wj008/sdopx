"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sdopx_1 = require("../sdopx");
var source_1 = require("./source");
var fs = require("fs");
var path = require("path");
/**
 * Created by wj008 on 16-6-4.
 */
var Resource = (function () {
    function Resource() {
    }
    //添加源
    Resource.registerResource = function (type, sourceObj) {
        if (typeof (type) !== 'string') {
            return;
        }
        if (!sourceObj) {
            return;
        }
        if (!sourceObj.fetch || !sourceObj.getTimestamp
            || typeof (sourceObj.fetch) !== 'function' || typeof (sourceObj.getTimestamp) !== 'function') {
            return;
        }
        Resource.resource_manager[type] = sourceObj;
    };
    //获取类型名称
    Resource.parseResourceName = function (tplname) {
        var temp = tplname.match(/^(\w+):/);
        if (!temp) {
            return { type: 'file', name: tplname };
        }
        var code = tplname.replace(/^(\w+):/, '');
        return { type: temp[1].toLowerCase(), name: code };
    };
    //获取源数据
    Resource.getSource = function (sdopx, tplname, tplId) {
        var _a = Resource.parseResourceName(tplname), type = _a.type, name = _a.name;
        var resource = Resource.getResource(type);
        return new source_1.Source(resource, sdopx, tplname, tplId, type, name);
    };
    //获取源数据
    Resource.getTplSource = function (tpl) {
        var sdopx = tpl.sdopx;
        var tplname = tpl.tplname;
        var tplID = tpl.tplId;
        return Resource.getSource(sdopx, tplname, tplID);
    };
    //加载文件数据对象
    Resource.getResource = function (type) {
        if (Resource.resource_manager[type]) {
            return Resource.resource_manager[type];
        }
        return null;
    };
    Resource.getPath = function (tplname, sdopx) {
        //处理绝对路径
        if (path.sep == '\\') {
            if (/^[A-Z]:/i.test(tplname)) {
                if (fs.existsSync(tplname)) {
                    return tplname;
                }
            }
        }
        else {
            if (/^\//.test(tplname)) {
                if (fs.existsSync(tplname)) {
                    return tplname;
                }
            }
        }
        var testPath = function (dirname, tplname) {
            var fpath = path.join(dirname, tplname);
            if (!/\.[a-z]+$/i.test(tplname)) {
                var epath = fpath + '.' + sdopx_1.Sdopx.extension;
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
            if (fs.existsSync(fpath + '.' + sdopx_1.Sdopx.extension)) {
                return fpath + '.' + sdopx_1.Sdopx.extension;
            }
            return null;
        };
        //公共目录
        if (tplname.substr(0, 1) == '@') {
            var common_path = sdopx.getTemplateDir('common');
            if (!common_path) {
                sdopx.rethrow("common dir is not defiend!");
            }
            tplname = tplname.substr(1);
            return testPath(common_path, tplname);
        }
        var tpldirs = sdopx.getTemplateDir();
        for (var key in tpldirs) {
            if (key === 'common') {
                continue;
            }
            var fpath = testPath(tpldirs[key], tplname);
            if (fpath) {
                return fpath;
            }
        }
        return null;
    };
    //资源配置
    Resource.resource_manager = {};
    //已编译好的
    Resource.compileds = {};
    return Resource;
}());
exports.Resource = Resource;
//注册文件读取类
Resource.registerResource('file', {
    fetch: function (tplname, sdopx) {
        var filepath = Resource.getPath(tplname, sdopx);
        if (filepath == null) {
            if (!/\.[a-z]+$/i.test(tplname)) {
                tplname += '.' + sdopx_1.Sdopx.extension;
            }
            sdopx.rethrow("file does not exist:'" + tplname + "'");
            return { content: '', timestamp: 0, filepath: tplname };
        }
        var state = fs.statSync(filepath);
        if (!state) {
            sdopx.rethrow("file does not exist:'" + filepath + "'");
            return { content: '', timestamp: 0, filepath: filepath };
        }
        var content = fs.readFileSync(filepath).toString().replace(/^\uFEFF/, '');
        var timestamp = new Date(state.mtime).getTime();
        return { content: content, timestamp: timestamp, filepath: filepath };
    },
    getTimestamp: function (tplname, sdopx) {
        var filepath = Resource.getPath(tplname, sdopx);
        if (filepath == null) {
            return 0;
        }
        var state = fs.statSync(filepath);
        return new Date(state.mtime).getTime();
    }
});
//继承资源类型
Resource.registerResource('extends', {
    fetch: function (tplname, sdopx) {
        var names = tplname.split('|');
        if (names.length < 2) {
            sdopx.rethrow("file does not exist:'" + tplname + "'");
        }
        var _a = Resource.parseResourceName(tplname), type = _a.type, name = _a.name;
        var resource = Resource.getResource(type);
        if (!resource) {
            sdopx.rethrow("resource does not exist,type:'" + type + "'");
        }
        var tplchild = names.pop();
        var extend = names.join('|');
        var _b = resource.fetch(tplchild, sdopx), _c = _b.content, content = _c === void 0 ? '' : _c, _d = _b.timestamp, timestamp = _d === void 0 ? 0 : _d;
        content = sdopx.left_delimiter + 'extends file=\'' + extend + '\'' + sdopx.right_delimiter + content;
        return { content: content, timestamp: timestamp };
    },
    getTimestamp: function (tplname, sdopx) {
        var names = tplname.split('|');
        if (names.length < 2) {
            sdopx.rethrow("file does not exist:'" + tplname + "'");
            return 0;
        }
        var _a = Resource.parseResourceName(tplname), type = _a.type, name = _a.name;
        var resource = Resource.getResource(type);
        if (!resource) {
            sdopx.rethrow("resource does not exist,type:'" + type + "'");
            return 0;
        }
        var tplchild = names.pop();
        return resource.getTimestamp(tplchild, sdopx);
    }
});
Resource.registerResource('string', {
    fetch: function (tplname, sdopx) {
        return { content: tplname, timestamp: 0, filepath: 'string' };
    },
    getTimestamp: function (tplname, sdopx) {
        return -1;
    }
});
Resource.registerResource('base64', {
    fetch: function (tplname, sdopx) {
        var buf = new Buffer(tplname, 'base64');
        return { content: buf.toString('utf8'), timestamp: 0, filepath: 'base64' };
    },
    getTimestamp: function (tplname, sdopx) {
        return -1;
    }
});
