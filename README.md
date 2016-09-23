# sdopx
Embedded JavaScript templates

Use it like php language use smarty template engine

#Installation
`
$ npm install sdopx
`

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
var Sdopx=require("./sdopx").Sdopx;
Sdopx.view_paths = './views/';

var sdp=new Sdopx(res);
sdp.assign('data',[{id:1,name:'test1',date:new Date()},{id:2,name:'test2',date:new Date()}]);
sdp.assign('title','hello sdopx');
sdp.display('index');

```
index.sdx
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
layout.sdx
```html
<html>
<title>{block name=title}{/block}</title>
<body>
{block name=testbody}{/block}
</body>
</html>
```

child.sdx
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
