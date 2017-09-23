//1测试变量 可使用命令行直接运行

var path = require('path');
var Sdopx = require("../../push/index").Sdopx;
Sdopx.create_runfile = true;

//设置模板路径
Sdopx.view_paths = path.join(__dirname, '../views/');

//注册一个插件用于测试
Sdopx.registerPlugin('func', function (params, out, sdopx) {
    out.raw('hello ' + params.var || '');
});

console.log(Sdopx.view_paths);

var opx = new Sdopx();

//注册变量 简单的变量 (非数组/对象)
opx.assign('foo1', 'hello sdopx');
// 也可以一次注册 多个 如 opx.assign({'foo1':'hello sdopx'});

//注册变量 数组
opx.assign({foo2: ['a', 'b', 'c', 'd', 'f']});
//等同于  opx.assign('foo2',['a','b','c','d','f']);

//注册变量 对象属性
opx.assign('foo3', {bar: 'test3'});

//注册变量 对象属性
opx.assign('bar', 'abc');
opx.assign('foo4', {abc: 'test4'});

//注册一个符合类型变量
opx.assign('fun', {
    hello: function (name) {
        return 'hello ' + name;
    }
});
opx.assign('fun2', {
    test: function (name) {
        return ['hello ' + name];
    }
});

//对象连
function link() {
    var a = 1;
    this.add = function () {
        a++;
        return this;
    }
    this.val = function () {
        return a;
    }
}

opx.assign('obj', new link());

//注册配置项
opx.assignConfig({
    webname: 'test webname',
    cfgobj: {key1: '这是 配置项 "cfgobj.key1" 的值'}
});


//获取输出内容
var outhtml = opx.display('variable');

console.log(outhtml);