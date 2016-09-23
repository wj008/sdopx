"use strict";
var sdopx_1 = require("../sdopx");
var fs = require('fs');
var utils = require('./utils');
var Source = (function () {
    function Source(resource, sdopx, tplname, tplid, type, name) {
        //数据模板代码
        this.content = null;
        this.length = 0;
        this.isload = false;
        //资源类型
        this.type = 'file';
        //资源名称
        this.name = null;
        //模板全名
        this.tplname = null;
        //文件更新时间
        this.timestamp = 0;
        //当前编译偏移量
        this.cursor = 0;
        //资源是否存在
        this.exitst = false;
        //资源ID
        this.uid = null;
        //加载器
        this.resource = null;
        //引擎
        this.sdopx = null;
        //片段编译位置
        this.bound = 0;
        //资源分割标记
        this.left_delimiter = '\{';
        this.right_delimiter = '\}';
        this.left_delimiter_raw = '{';
        this.right_delimiter_raw = '}';
        this.end_literal = null;
        this.resource = resource;
        this.sdopx = sdopx;
        this.tplname = tplname;
        this.type = type;
        this.name = name;
        this.uid = tplid;
        this.changDelimiter(this.sdopx.left_delimiter, this.sdopx.rigth_delimiter);
    }
    Source.prototype.changDelimiter = function (left, right) {
        if (left === void 0) { left = '{'; }
        if (right === void 0) { right = '}'; }
        this.left_delimiter = utils.escapeRegExpChars(left);
        this.right_delimiter = utils.escapeRegExpChars(right);
        this.left_delimiter_raw = left;
        this.right_delimiter_raw = right;
    };
    //加载模板
    Source.prototype.load = function () {
        var _a = this.resource.fetch(this.name, this.sdopx), _b = _a.content, content = _b === void 0 ? '' : _b, _c = _a.timestamp, timestamp = _c === void 0 ? 0 : _c;
        //let Sdopx = this.sdopx._Sdopx;
        if (content.length > 0 && sdopx_1.Sdopx.Filters['pre'] && sdopx_1.Sdopx.Filters['pre'] instanceof Array) {
            for (var i = 0; i < sdopx_1.Sdopx.Filters['pre'].length; i++) {
                var func = sdopx_1.Sdopx.Filters['pre'][i];
                content = func(content, this.sdopx);
            }
        }
        this.content = content;
        this.length = content.length;
        this.timestamp = timestamp;
        this.isload = true;
        this.exitst = true;
        this.cursor = 0;
    };
    //获取资源最后更新时间
    Source.prototype.getTimestamp = function () {
        this.timestamp = this.resource.getTimestamp(this.name, this.sdopx);
        return this.timestamp;
    };
    return Source;
}());
exports.Source = Source;
//# sourceMappingURL=source.js.map