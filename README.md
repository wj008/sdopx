# sdopx
Embedded JavaScript templates

Use it like php language use smarty template engine

Sdopx 是一个nodejs 的模板引擎，他是PHP 的 Smarty 的 nodejs 实现，但是其实现方式及语法根据JS本身的特性有所改变，并融入新的语法特性及新的好用功能属性， Sdopx 可以支持类似Smarty的方式使用 也可以支持 Express.js 方式使用， Sdopx 几乎支持Smarty 的各种使用习惯，以及扩展相应的属性， 包括 插件注册 函数注册 修饰器注册 数据来源注册 前置后缀过滤器的使用，由于NodeJs的运行机制和PHP本身有所不同，Sdopx 将编译后的代码以创建匿名函数方式直接缓存在内存中， 使得Sdopx在运行效率上大大提高（至少20倍以上），编译后的代码和ejs模板引擎的代码基本类似，所以运行效率和ejs模板引擎相当，甚至有超越ejs模板引擎的时候，

Sdopx的编译是使用本人独创的链条式分支选择模式进行匹配语法结构的，并没有使用任何相应的完全正则或者是复杂的re2c模拟结构，在保证模板实现真正的解析而非单纯替换前提下又大大的改善编译效率 （Sdopx 是一个语言层面的模板引擎，而非简单替换），你可以根据自己需要，定制编译语法，定制插件以及自己的使用方式。

Sdopx 还对PHP的Smarty 插件的开发进行了相应的简化，让插件开发变得随手拈来，Sdopx 还允许开发 头尾配对的标签插件，（这是Smarty 无法支持的）。

Sdopx 是支持模板继承的nodejs模板引擎的，Sdopx 暂时不支持前端JS使用 (后续可能会精简一个前端使用的模板引擎，一个编译缓存型的模板引擎真的合适在前端使用吗？）

#####更多帮助

帮助请看 /doc 文件夹，案例测试文件在 /test 文件夹
继续完善中...



#Installation
```
$ npm install sdopx
```
如果你准备在 Express.js 中使用 请安装
```
$ npm install opx
```
并设置模板引擎为 opx
```js
app.set('view engine', 'opx');
```
####默认views 模板
error.opx
```html
<h1>{$message}}</h1>
<h2>{$error.status}</h2>
<pre>{$error.stack}</pre>
```

layout.opx
```html
<!DOCTYPE html>
<html>
  <head>
    <title>{$title}</title>
    <link rel='stylesheet' href='/stylesheets/style.css' />
  </head>
  <body>
   {block name=body}hello{/block}
  </body>
</html>

```

index.opx
```html
{extends file='layout'}
{block name=body}
<h1>{$title}</h1>
<p>Welcome to {$title}</p>
{/block}
```

使用webstorm 右键设置关联类型为html



#Example
```js
//test1.js
var Sdopx=require("sdopx").Sdopx;
Sdopx.view_paths = './views/';

var sdp=new Sdopx();
sdp.assign('data',[{id:1,name:'test1',date:new Date()},{id:2,name:'test2',date:new Date()}]);
sdp.assign('title','hello sdopx');

res.write(sdp.display('index'));
res.end();
//-----------
//test2.js
var Sdopx=require("sdopx").Sdopx;
Sdopx.view_paths = './views/';

var sdp=new Sdopx(res);
sdp.assign('data',[{id:1,name:'test1',date:new Date()},{id:2,name:'test2',date:new Date()}]);
sdp.assign('title','hello sdopx');
sdp.display('index');

```
index.opx
```html
<html>
<title>{$title}</title>
<body>
<h1>{$title}</h1>

<div>
<ul>
{foreach from=$data item=rs}
{$rs.id}--{$rs.name}--{$rs.date|date_format:'yyyy-MM-dd'}
{/foreach}
</ul>
</div>

</body>

</html>
```
****

###你可以把它看成是 Smarty 一样使用，目前支持的语法
```
#### 循环
{foreach from=$rows item=rs}
{foreachelse}
{/foreach}

{for start=1 to=3}
{forelse}
{/for}

{while $str.length==3+$len }

{/while}
```
### 判断
```
{if $rs.name() == 'wj008'}
{elseif $rs.info==`test{$data.name}test` }
{/if}

{switch value=$a}
{case value=1}
{case value=2}
{case value=3 value1=4 value2=5}
{case value=6}
{default}
{/switch}
```
#### 定义 注册变量
```
{assign $test=`aaaa{$name}`} 注册到局部
{global $test=`aaaa{$name}`} 注册到 全局  
{assign $a++} 
{global $a--} 
```
### 输出和  过滤器
```
{'zzz'}
{'aa
sss'}
{"xxx"}
{\`test:'{$str}'xx\`}
{$name}
{new Date()}

{escape($str)} 可以使用系统自带的函数 或者 注册的函数

{(2*50)} 支持运算

{$str.substr(2,3)} 

{$str.key.substr(2,3)} 

{$str['key'].substr(2,3)} 

{$code|raw}      raw 只能是最后一个修饰器 保存原样输出，如未使用 raw 修饰器则自动转成HTML实体输出

{$code|upper|raw} 转大写且 原样输出
{$code|lower}
{$code|strip_tags} 移除html标签
{$code|default:'空'} 设置默认值

{$time|date_format:'yyyy-MM-dd TT HH:mm:ss'} 日期格式化

{$str|leftpad:6,'0'} 左填充
{$str|rightpad:8,'0'} 右填充

{$str|truncate:40,'...'} 按字符位宽数量截取字符串  中文=2个字符位宽

{$code|nl2br} 换号转成 </br>

{for start=0 to=5}
{cycle values='1,2,3'}
{/for}
输出  1 2 3 1 2 3
{for start=0 to=5}
{cycle values=['1','2','3'] assign=rs}
{$rs}
{/for}
输出  1 2 3 1 2 3  一般用于隔行换色
```
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

输出
```
<html>
<title>hello</title>
<body>
这是一个继承模板测试
</body>
</html>

{block name='test' append}
{block name='test' prepend}
{block name='test' hide} //表示如果没有子项填充 则layout 处的标签不显示
```
同时block 标签中支持 hide ,append ,prepend 表示继承插入的位置 默认是替换
```


{include file="head"} 包含文件
{include file="head.tpl"} 包含其他后缀文件
{include file="string:kxxxcsdsd"} 包含
{include file="dbsource:select * from table where id=1"} //系统没有实现类似资源 自己可以通过扩展注册资源 这里只是演示支持不同的资源类型加载
{include file="head" output=fals} 包含但是不输出任何内容 比如包含一些带有函数的控件模板

{ldelim} 输出左边界符  默认左边界是 {

{ldelim} 输出右边界符  默认右边界是 }
```
###保持原样输出，其实 这里是切换分界符 为  {@ @}
```
{literal}
<script>
var a={name:'xx'}
</script>
{/literal}

{literal}
<script>
var a={name:'{@$name@}'}
</script>
{/literal}
```
主动切换分界符
```
{literal left='<@' right='@>'}
<script>
var a={name:'<@$name@>'}
</script>
{/literal}
```
以上 为 模板的一些简单帮助介绍，其实Sdopx的强大无法估算，新的功能等待你去挖掘，你也可以自定义去扩展你的标签。
