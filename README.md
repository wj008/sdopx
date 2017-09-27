###  1. 什么是 Sdopx
Sdopx是一款用于 nodejs 的后端渲染模板引擎，目前版本是1.2.15, 与php语言中的smarty模板引擎相似度极高，可以说是 smarty 的 nodejs 版本。
相对于其他js模板引擎，具有功能齐全，语法直观,性能超高，以及编写的模板容易维护等特点。使得开发和维护模板有很好的体验。是新一代的模板引擎。总得来说，它的特性如下：

	成熟方案：Sdopx语法风格借鉴于Smarty，如果有过Smarty经验的开发者，可以很快速的掌握其语法结构，使用方式。
	非常简单：即使没有smarty经验也容易学习，只要半小时就能通过半学半猜完全掌握用法。拒绝其他模板引擎那种非人性化的语法和习俗。同时也能支持html 标签，使得开发CMS系统比较容易。
    超高的性能：Sdopx 是编译型模板引擎，第一次解析模板将会编译到内存并且常驻内存，再次采访是不再编译，运行效率和 EJS 相当，但功能却比EJS要多得多。
	功能强大：Sdopx 支持模板嵌套，模板继承写法，也支持模板函数的写法，可以很方便的组织维护页面每部分的代码。
    易于整合：Sdopx 能很容易的与各种web框架整合，如 Express KOA ThinkJs BeaconJs 乃至可直接用原生 http 模块。
    扩展和个性化：Sdopx 支持自定义属性，标签，语法块，插件，函数，修饰器，数据源，前置后置过滤器等。
    安全性高：Sdopx 默认输出为HTML实体，防止页面XSS脚本攻击，保障代码安全。

### 2. 安装
2.1. 安装
```
npm install sdopx
```
案例 1
```javascript
const http = require('http');
const path = require('path');
const Sdopx = require('sdopx').Sdopx;
//全局设置模板位置
Sdopx.view_paths = path.join(__dirname, 'views');
const server = http.createServer((req, res) => {
	var opx = new Sdopx();
	opx.assign('title', 'hello sdopx');
	var outhtml = opx.display('index');
	res.end(outhtml);
});
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8000);
```
案例 2
```javascript
const http = require('http');
const path = require('path');
const Sdopx = require('sdopx').Sdopx;
const server = http.createServer((req, res) => {
	var opx = new Sdopx(res);
	//设置模板目录
	opx.setTemplateDir(path.join(__dirname, 'views'));
	opx.assign('title', 'hello sdopx');
	opx.display('index');
});
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8000);
```
模板代码
/views/index.opx

```html
<html>
<head>
    <title>{$title}</title>
</head>
<body>
<h3>{$title}</h3>
</body>
</html>
```



如果是 **Express.js** 则安装  opx
```
npm install opx
```
设置模板引擎 为 opx
```javascript
var express = require('express');
const path = require('path');
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'opx');
app.get('/', function (req, res) {
    res.render('index', { title: 'hello sdopx' });
});
app.listen(8000);
```
如果是 **KOA.js**  则安装 koa-opx

```
npm install koa-opx
```
代码如下：

```javascript
const Koa = require('koa');
const opx = require('koa-opx');

const app = new Koa();
app.use(opx(__dirname + '/views'));
app.use(async function (ctx) {
    await ctx.render('index', {title: 'hello sdopx'});
});

app.listen(8000);
```

如果是 **ThinkJs**  则安装 think-view-opx
```
npm install think-view-opx
```
修改adapter文件使用 sdopx 引擎
```javascript
/*  src/config/adapter.js */

const opx=require('think-view-opx');

exports.view = {
  type: 'opx',
  common: {
    viewPath: path.join(think.ROOT_PATH, 'view'),
    sep: '_',
    extname: '.html'
  },
  opx: {
    handle: opx
  }
};

```
