//模板变量赋值测试例子
var path = require('path');
var Sdopx = require("../../push/index").Sdopx;
//Sdopx.create_runfile = true; //输出编译后的文件

//设置模板路径
Sdopx.view_paths = path.join(__dirname, '../views/');

var opx = new Sdopx();
opx.assign('title', 'hello sdopx');
opx.assign('foot_content', 'All rights reserved.');
opx.assign('meetingPlace', 'New York');
opx.assign('list', [{id: 1, name: 'aaa'}, {id: 2, name: 'bbb'}]);
var outhtml = opx.display('block3');
console.log(outhtml);