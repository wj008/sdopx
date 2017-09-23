"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by Administrator on 2016/6/9.
 */
var TreeMap = (function () {
    function TreeMap() {
        this.data = null;
        this.index = 0;
        //当前行
        this.info = null;
        this.data = [];
    }
    TreeMap.prototype.setInfo = function (info) {
        this.info = info;
    };
    TreeMap.prototype.getInfo = function () {
        return this.info;
    };
    TreeMap.prototype.each = function (func) {
        for (var i = 0; i < this.data.length; i++) {
            if (func(i, this.data[i]) === false) {
                return;
            }
        }
    };
    TreeMap.prototype.reset = function () {
        this.index = 0;
    };
    TreeMap.prototype.next = function (move) {
        if (move === void 0) { move = true; }
        var idx = this.index + 1;
        if (move) {
            this.index++;
        }
        return idx >= this.data.length ? null : this.data[idx];
    };
    TreeMap.prototype.prev = function (move) {
        if (move === void 0) { move = true; }
        var idx = this.index - 1;
        if (move) {
            this.index--;
        }
        return idx < 0 ? null : this.data[idx];
    };
    TreeMap.prototype.end = function () {
        return this.data.length == 0 ? null : this.data[this.data.length - 1];
    };
    //测试下
    TreeMap.prototype.testNext = function (map, move) {
        if (move === void 0) { move = true; }
        var idx = this.index + 1;
        var item = idx >= this.data.length ? null : this.data[idx];
        if (move) {
            this.index++;
        }
        if (!item) {
            return false;
        }
        if (item.tag == map) {
            return true;
        }
        return false;
    };
    TreeMap.prototype.current = function () {
        return (this.index < 0 || this.index >= this.data.length) ? null : this.data[this.index];
    };
    TreeMap.prototype.pop = function () {
        return this.data.pop();
    };
    TreeMap.prototype.push = function (item) {
        this.data.push(item);
    };
    TreeMap.prototype.get = function (index) {
        return (index < 0 || index >= this.data.length) ? null : this.data[index];
    };
    return TreeMap;
}());
exports.TreeMap = TreeMap;
//# sourceMappingURL=tree_map.js.map