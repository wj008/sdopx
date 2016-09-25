//模板变量赋值测试例子
var path = require('path');
var Sdopx = require("../../sdopx").Sdopx;
//Sdopx.create_runfile = true; //输出编译后的文件

//设置模板路径
Sdopx.view_paths = path.join(__dirname, '../views/');

var opx = new Sdopx();

//注册变量 简单的变量 (非数组/对象)
opx.assign('firstname', 'Doug');
opx.assign('lastname', 'Evans');
opx.assign('meetingPlace', 'New York');

//数组赋值
opx.assign('Contacts', [
        '555-222-9876',
        'zaphod@slartibartfast.example.com',
        [
            '555-444-3333',
            '555-111-1234'
        ]
    ]
);

//对象变量赋值
opx.assign('data',
    {
        fax: '555-222-9876',
        email: 'zaphod@slartibartfast.example.com',
        phone: {
            home: '555-444-3333',
            cell: '555-111-1234'
        }
    }
);


var outhtml = opx.display('assigned');

console.log(outhtml);

