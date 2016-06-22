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
var Sdopx=require("./sdp").Sdopx;
Sdopx.view_paths = './views/';

var sdp=new Sdopx();
sdp.assgin('data',[{id:1,name:'test1',date:new Date()},{id:2,name:'test2',date:new Date()}]);
sdp.assgin('title','hello sdopx');

res.write(sdp.display('index'));
res.end();
//-----------
//test2.js
var Sdopx=require("./sdp").Sdopx;
Sdopx.view_paths = './views/';

var sdp=new Sdopx(res);
sdp.assgin('data',[{id:1,name:'test1',date:new Date()},{id:2,name:'test2',date:new Date()}]);
sdp.assgin('title','hello sdopx');
sdp.display('index');

```
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
