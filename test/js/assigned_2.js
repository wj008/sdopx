//模板变量赋值测试例子
var path = require('path');
var Sdopx = require("../../sdopx").Sdopx;
//Sdopx.create_runfile = true; //输出编译后的文件

//设置模板路径
Sdopx.view_paths = path.join(__dirname, '../views/');

var opx = new Sdopx();
//以对象的形式一次性赋值
opx.assign({firstname: 'Doug', lastname: 'Evans', meetingPlace: 'New York'});
var outhtml = opx.display('assigned_2');
console.log(outhtml);
