/**
 * Created by Administrator on 2016/6/9.
 */
export class TreeMap {

    private data = null;
    private index = 0;

    //当前行
    private info = null;


    public setInfo(info) {
        this.info = info;
    }

    public getInfo() {
        return this.info;
    }

    public constructor() {
        this.data = [];
    }

    public each(func) {
        for (let i = 0; i < this.data.length; i++) {
            if (func(i, this.data[i]) === false) {
                return;
            }
        }
    }

    public reset() {
        this.index = 0;
    }

    public next(move = true) {
        let idx = this.index + 1;
        if (move) {
            this.index++;
        }
        return idx >= this.data.length ? null : this.data[idx];
    }

    public prev(move = true) {
        let idx = this.index - 1;
        if (move) {
            this.index--;
        }
        return idx < 0 ? null : this.data[idx];
    }

    public end() {
        return this.data.length == 0 ? null : this.data[this.data.length - 1];
    }

    //测试下
    public testNext(map, move = true) {
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

    public current() {
        return (this.index < 0 || this.index >= this.data.length) ? null : this.data[this.index];
    }

    public pop() {
        return this.data.pop();
    }

    public push(item) {
        this.data.push(item);
    }

    public get(index) {
        return (index < 0 || index >= this.data.length) ? null : this.data[index];
    }

}
