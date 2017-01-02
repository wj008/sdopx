"use strict";
/**
 * Created by Administrator on 2016/6/9.
 */
class TreeMap {
    constructor() {
        this.data = null;
        this.index = 0;
        //当前行
        this.info = null;
        this.data = [];
    }
    setInfo(info) {
        this.info = info;
    }
    getInfo() {
        return this.info;
    }
    each(func) {
        for (let i = 0; i < this.data.length; i++) {
            if (func(i, this.data[i]) === false) {
                return;
            }
        }
    }
    reset() {
        this.index = 0;
    }
    next(move = true) {
        let idx = this.index + 1;
        if (move) {
            this.index++;
        }
        return idx >= this.data.length ? null : this.data[idx];
    }
    prev(move = true) {
        let idx = this.index - 1;
        if (move) {
            this.index--;
        }
        return idx < 0 ? null : this.data[idx];
    }
    end() {
        return this.data.length == 0 ? null : this.data[this.data.length - 1];
    }
    //测试下
    testNext(map, move = true) {
        let idx = this.index + 1;
        let item = idx >= this.data.length ? null : this.data[idx];
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
    }
    current() {
        return (this.index < 0 || this.index >= this.data.length) ? null : this.data[this.index];
    }
    pop() {
        return this.data.pop();
    }
    push(item) {
        this.data.push(item);
    }
    get(index) {
        return (index < 0 || index >= this.data.length) ? null : this.data[index];
    }
}
exports.TreeMap = TreeMap;
//# sourceMappingURL=tree_map.js.map