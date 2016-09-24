var path = require('path');
var Sdopx = require("../../sdopx").Sdopx;
//Sdopx.create_runfile=true; //输出编译后的文件

//设置模板路径
Sdopx.view_paths = path.join(__dirname, '../views/');
//更改分解符号
Sdopx.left_delimiter = '{@';
Sdopx.rigth_delimiter = '@}';

var opx = new Sdopx();
//注册变量 简单的变量 (非数组/对象)
opx.assign('foo1', 'hello sdopx');
opx.assign('foo', 'bar');
opx.assign('name', 'Albert');
var outhtml = opx.display('delimiter');
console.log(outhtml);