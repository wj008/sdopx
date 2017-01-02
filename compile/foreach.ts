import {Compile} from "../lib/compile";

Compile.registerCompile('foreach', (name, args, compile: Compile) => {
    let {from = null, item = null, key = null, attr = null} = args;
    if (from === null) {
        compile.addError(`The foreach tag 'from' is a must.`);
    }
    if (item === null) {
        compile.addError(`The foreach tag 'item' is a must.`);
    }
    item = item.replace(/^['"]+|['"]+$/g, '');
    if (item == '' || !/\w+/.test(item)) {
        compile.addError(`The foreach tag 'item' does not match the label attribute syntax`);
    }
    if (key !== null) {
        key = key.replace(/^['"]+|['"]+$/g, '');
        if (key == '' || !/\w+/.test(key)) {
            compile.addError(`The foreach tag 'key' does not match the label attribute syntax`);
        }
    }
    if (attr !== null) {
        attr = attr.replace(/^['"]+|['"]+$/g, '');
        if (attr == '' || !/\w+/.test(attr)) {
            compile.addError(`The foreach tag 'attr' does not match the label attribute syntax`);
        }
    }
    let prefix = compile.getTempPrefix('each');
    let vars = compile.getVarter(prefix);
    vars.add(item);
    if (key !== null) {
        vars.add(key);
    }
    if (attr !== null) {
        vars.add(attr);
    }
    compile.addVar(vars);
    let output = [];
    output.push(`var __${prefix}_from=(function(f){ if(f instanceof Array){return f; } var t=[];t.__object=true; for(var k in f){ t.push({ key:k, value:f[k]}); }  return t;})(${from});`);
    output.push(`for(var __${prefix}_i=0;__${prefix}_i<__${prefix}_from.length;__${prefix}_i++){ `);
    output.push(`var ${prefix}_${item}=__${prefix}_from.__object?__${prefix}_from[__${prefix}_i].value:__${prefix}_from[__${prefix}_i];`);
    if (key !== null) {
        output.push(`var ${prefix}_${key}=__${prefix}_from.__object?__${prefix}_from[__${prefix}_i].key:__${prefix}_i;`);
    }
    if (attr !== null) {
        output.push(`var ${prefix}_${attr} = { `);
        output.push(`   index:__${prefix}_i,`);
        output.push(`   iteration:__${prefix}_i+1,`);
        output.push(`   total:__${prefix}_from.length,`);
        output.push(`   first:__${prefix}_i==0,`);
        output.push(`   last:__${prefix}_i==__${prefix}_from.length-1`);
        output.push(`};`);
    }
    compile.openTag('foreach', [prefix, key, attr]);
    return output.join('\n');
});

Compile.registerCompile('foreachelse', (name, args, compile: Compile) => {
    let [,data]=compile.closeTag(['foreach']);
    let prefix = data[0];
    compile.openTag('foreachelse', data);
    let output = [];
    output.push('}');
    output.push(`if(__${prefix}_from.length==0){`);
    return output.join('\n');
});

Compile.registerCompile('foreach_close', (name, compile: Compile) => {
    let [,data]= compile.closeTag(['foreach', 'foreachelse']);
    compile.removeVar(data[0]);
    let output = [];
    output.push('}');
    return output.join('\n');
});

