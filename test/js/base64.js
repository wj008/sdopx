/**
 * Created by Administrator on 2017/3/6.
 */
//模板变量赋值测试例子
var path = require('path');
var Sdopx = require("../../push/sdopx").Sdopx;


//设置模板路径
Sdopx.view_paths = path.join(__dirname, '../views/');

var opx = new Sdopx();
opx.assign('title', 'hello sdopx');
opx.assign('foot_content', 'All rights reserved.');
opx.assign('meetingPlace', 'New York');
opx.assign('list', [{id: 1, name: 'aaa'}, {id: 2, name: 'bbb'}]);

let code = new Buffer(`{extends file='3layout'}
{block name=body}
<h1>{$title}</h1>
<p>Welcome to {$meetingPlace}</p>
{for start=1 to=1}
{assign $name='baa'}<-- 改写局部变量
{global $gname='this is global variable!'}<-- 注册一个全局变量
{$gname}<-- 全局变量会显示
{/for}
{$name}<-- 局部变量不会显示
{$gname+'dddddd'}<-- 全局变量会显示
{/block}
{block name=loop}
<li>{$rs.id}-{$rs.name}</li>
{include file="loop.inc"}
{/block}
`).toString('base64');
console.log(code);
var outhtml = opx.display(`base64:` + code);
console.log(outhtml);