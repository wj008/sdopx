###  1. 什么是 Sdopx
Sdopx是一款用于 nodejs 的后端渲染模板引擎，目前版本是1.2.22, 与php语言中的smarty模板引擎相似度极高，可以说是 smarty 的 nodejs 版本。
相对于其他js模板引擎，具有功能齐全，语法直观,性能超高，以及编写的模板容易维护等特点。使得开发和维护模板有很好的体验。是新一代的模板引擎。总得来说，它的特性如下：

>成熟方案：Sdopx语法风格借鉴于Smarty，如果有过Smarty经验的开发者，可以很快速的掌握其语法结构，使用方式。
>非常简单：即使没有smarty经验也容易学习，只要半小时就能通过半学半猜完全掌握用法。拒绝其他模板引擎那种非人性化的语法和习俗。同时也能支持html 标签，使得开发CMS系统比较容易。
>超高的性能：Sdopx 是编译型模板引擎，第一次解析模板将会编译到内存并且常驻内存，再次采访是不再编译，运行效率和 EJS 相当，但功能却比EJS要多得多。
>功能强大：Sdopx 支持模板嵌套，模板继承写法，也支持模板函数的写法，可以很方便的组织维护页面每部分的代码。
>易于整合：Sdopx 能很容易的与各种web框架整合，如 Express KOA ThinkJs BeaconJs 乃至可直接用原生 http 模块。
>扩展和个性化：Sdopx 支持自定义属性，标签，语法块，插件，函数，修饰器，数据源，前置后置过滤器等。
>安全性高：Sdopx 默认输出为HTML实体，防止页面XSS脚本攻击，保障代码安全。

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
### 快速入门
##### 1 Sdopx 的语法简单使用
代码部分：
```javascript
const http = require('http');
const path = require('path');
const Sdopx = require('sdopx').Sdopx;
const server = http.createServer((req, res) => {

    var opx = new Sdopx(res);
    //设置模板目录
    opx.setTemplateDir(path.join(__dirname, 'views'));

    opx.assign('title', 'hello sdopx');//文本
    opx.assign('list', [{id: 1, name: 'wj008'}, {id: 2, name: 'wj009'}]);//数组
    opx.assign('user', {name: 'wj010', sex: '男', glass: '202'});//对象
    opx.assign('html', '<b>这是一段<span style="color: darkgreen">HTML</span>文本</b>');//html代码
    opx.assign('now', new Date());//时间

    opx.display('index');
});
server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8000);
```
模板文件
index.opx
```html
<html>
<head>
    <title>{$title}</title>
    <meta charset="utf-8"/>
</head>
<body>
    <h3>{$title}</h3>
    <ul>
        {foreach from=$list item=rs}
        <li>{$rs.id}-{$rs.name}</li>
        {/foreach}
    </ul>
    {if $user!=null}

    <ul>
        {foreach from=$user key=k item=v}
        <li>{$k}:{$v}</li>
        {/foreach}
    </ul>

    {/if}
    <div>默认输入：{$html}</div>
    <div>原样输入：{$html|raw}</div>
    <div>当前时间：{$now|date_format:'yyyy-MM-dd HH:mm:ss'}</div>
    </body>
</html>
```
输出结果：

> hello sdopx

> 1-wj008
2-wj009
name:wj010
sex:男
glass:202
默认输入：<b>这是一段<span style="color: darkgreen">HTML</span>文本</b>
原样输入：这是一段HTML文本
当前时间：2017-09-24 11:25:46

Express 写法
```javascript
var express = require('express');
const path = require('path');
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'opx');
app.get('/', function (req, res) {

    var data = {};
    data['title'] = 'hello sdopx';
    data['list'] = [{id: 1, name: 'wj008'}, {id: 2, name: 'wj009'}];
    data['user'] = {name: 'wj010', sex: '男', glass: '202'};
    data['html'] = '<b>这是一段<span style="color: darkgreen">HTML</span>文本</b>';
    data['now'] = new Date();
    res.render('index', data);

});
app.listen(8000);
```
KOA 写法
```javascript
const Koa = require('koa');
const opx = require('koa-opx');
const app = new Koa();
app.use(opx(__dirname + '/views'));
app.use(async function (ctx) {
    var data = {};
    data['title'] = 'hello sdopx';
    data['list'] = [{id: 1, name: 'wj008'}, {id: 2, name: 'wj009'}];
    data['user'] = {name: 'wj010', sex: '男', glass: '202'};
    data['html'] = '<b>这是一段<span style="color: darkgreen">HTML</span>文本</b>';
    data['now'] = new Date();
    await ctx.render('index', data);
});
app.listen(8000);
```
ThinkJs 写法

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
控制器代码：
```javascript
/* src/controller/index.js */
const Base = require('./base.js');

module.exports = class extends Base {
  indexAction() {
    this.assign('title', 'hello sdopx');//文本
    this.assign('list', [{id: 1, name: 'wj008'}, {id: 2, name: 'wj009'}]);//数组
    this.assign('user', {name: 'wj010', sex: '男', glass: '202'});//对象
    this.assign('html', '<b>这是一段<span style="color: darkgreen">HTML</span>文本</b>');//html代码
    this.assign('now', new Date());//时间
    return this.display('index');
  }
};

```
##### 2 语法示例

2.1 输出
```html
--字符串-----------------
{'zzz'}  					-- 字符串输出
{"xxx"}  					-- 字符串输出
{'aa
sss'}    					-- 换行输出
--变量-----------------
{$name}  					-- 变量输出
{new Date()} 				-- 内置函数，或变量输出
{escape($str)}
---运算----------------
{`test{$str}xx`} 		-- 字符串拼接
{(2*50)} 				-- 数学运算表达式输出

{$str.substr(2,3)} 		-- 字符串方法调用 输出
{$str.key.substr(2,3)} 	-- 字符串方法调用 输出
{$str['key'].substr(2,3)}

--修饰符-------------------

{$code|raw}				-- raw 只能是最后一个修饰器 保存原样输出，如未使用 raw 修饰器则自动转成HTML实体输出

{$code|upper|raw} 		--转大写且 原样输出
{$code|lower}
{$code|strip_tags}			--移除html标签
{$code|default:'空'}			--设置默认值

{$time|date_format:'yyyy-MM-dd TT HH:mm:ss'} --日期格式化

{$str|leftpad:6,'0'} 	--左填充
{$str|rightpad:8,'0'} 	--右填充

{$str|truncate:40,'...'} 	--按字符位宽数量截取字符串  中文=2个字符位宽
{$code|nl2br} 				--换号转成 </br>
```
2.2 判断
```html
{if $rs.name == 'wj008'}
	<span>{$rs.name}</span>
{elseif $rs.info==`test{$data.name}test` }
	<span>{$rs.info}</span>
{else}
	<span>cccc</span>
{/if}

{switch value=$a}
	{case value=1}
	<span>a=1</span>
	{case value=2}
	<span>a=2</span>
	{case value=3 value1=4 value2=5}
	<span>a=3 或 a=4 或 a=5</span>
	{case value=6}
	<span>a=6</span>
	{default}
	<span>a=?</span>
{/switch}
```
2.3 循环
```html
<ul>
{foreach from=$list item=rs}
<li>id:{$rs.id},name:{$rs.name}</li>
{foreachelse}
	<li>没有任何数据</li>
{/foreach}
</ul>

<ul>
	{for start=0 to=3 key=i}
	<li>{$list[$i].id}-{$list[$i].name}</li>
	{/for}
</ul>

<ul>
	{for start=$list.length-1 to=0 step=2 key=i}
	<li>{$list[$i].id}-{$list[$i].name}</li>
	{/for}
</ul>

<ul>
	{assign $idx=0}
	{while $idx < $list.length }
	<li>{$list[$idx].id}-{$list[$idx].name}</li>
	{assign $idx++}
	{/while}
</ul>
```
2.4 赋值，注册变量

```html
{assign $temp=`aaaa{$name}`}	--注册到局部
{global $str=`global value.`}	--注册到全局
{assign $a++} 					--局部赋值
{global $a--} 					--全局赋值
```
2.5 包含引入模板文件

```html
{include file="head"}  		--包含文件
{include file="head.tpl"} --包含其他后缀文件
{include file="string:kxxxcsdsd"} --包含字符串源的模板
{include file="dbsource:select * from table where id=1"} //系统没有实现类似资源 自己可以通过扩展注册资源 这里只是演示支持不同的资源类型加载
{include file="head" output=false} 包含但是不输出任何内容 比如包含一些带有函数的控件模板
```

2.6 模板继承

layout.opx
```html
<html>
<title>{block name=title}{/block}</title>
<body>
{block name=testbody}{/block}
</body>
</html>
```
child.opx
```html
{extends file='layout'}
{block name=title}hello{/block}
{block name=testbody}这是一个继承模板测试{/block}
```
