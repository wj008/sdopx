//测试分界符号指定 可使用命令行直接运行
var path = require('path');
var Sdopx = require("../../sdopx").Sdopx;
//Sdopx.create_runfile = true; //输出编译后的文件

//设置模板路径
Sdopx.view_paths = path.join(__dirname, '../views/');


var opx = new Sdopx();
//注册变量 简单的变量 (非数组/对象)
opx.assign('bar', 'bar');
opx.assign('name', 'name');
opx.assign('bool', true);
opx.assign('option', {bar: 'option1_bar', name: 'option_name'});
var outhtml = opx.display('modefier_option');
console.log(outhtml);