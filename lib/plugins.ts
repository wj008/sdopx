import {Sdopx} from "../index";

Sdopx.registerModifier('upper', function (str) {
    return String(str).toUpperCase();
});

Sdopx.registerModifier('lower', function (str) {
    return String(str).toLowerCase();
});

Sdopx.registerModifier('strip_tags', function (str) {
    return String(str).replace(/<[^>]*?>/g, '');
});

Sdopx.registerModifier('default', function (str, def = '') {
    if (str == void 0 || str === null || (typeof str === 'string' && str.length == 0)) {
        return def;
    }
    return str;
});

Sdopx.registerModifier('date_format', function (str, format = 'yyyy-MM-dd') {
    let date = null;
    if (str instanceof Date) {
        date = str;
    }
    else if (typeof str == 'number') {
        date = new Date(str);
    }
    else if (typeof(str) == 'string') {
        date = new Date(str);
        if (isNaN(date.getTime()) && /^\d+$/.test(str)) {
            str = parseInt(str, 10);
            date = new Date(str);
        }
    }
    if (date == null || date.toString() == 'Invalid Date' || isNaN(date.getTime())) {
        return str;
    }
    let zeroize = function (value, length = 2) {
        let zeros = '';
        value = String(value);
        for (let i = 0; i < (length - value.length); i++) {
            zeros += '0';
        }
        return zeros + value;
    }
    let mask = format.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|M{1,4}|(?:yyyy|yy)|([hHmstT])\1?|[lLZ])\b/g, function ($0) {
        switch ($0) {
            case 'd':
                return date.getDate();
            case 'dd':
                return zeroize(date.getDate());
            case 'ddd':
                return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][date.getDay()];
            case 'dddd':
                return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
            case 'M':
                return date.getMonth() + 1;
            case 'MM':
                return zeroize(date.getMonth() + 1);
            case 'MMM':
                return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
            case 'MMMM':
                return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()];
            case 'yy':
                return String(date.getFullYear()).substr(2);
            case 'yyyy':
                return date.getFullYear();
            case 'h':
                return date.getHours() % 12 || 12;
            case 'hh':
                return zeroize(date.getHours() % 12 || 12);
            case 'H':
                return date.getHours();
            case 'HH':
                return zeroize(date.getHours());
            case 'm':
                return date.getMinutes();
            case 'mm':
                return zeroize(date.getMinutes());
            case 's':
                return date.getSeconds();
            case 'ss':
                return zeroize(date.getSeconds());
            case 'l':
                return zeroize(date.getMilliseconds(), 3);
            case 'L':
                var m = date.getMilliseconds();
                if (m > 99) m = Math.round(m / 10);
                return zeroize(m);
            case 'tt':
                return date.getHours() < 12 ? 'am' : 'pm';
            case 'TT':
                return date.getHours() < 12 ? 'AM' : 'PM';
            case 'Z':
                return date.toUTCString().match(/[A-Z]+$/);
            default:
                return $0.substr(1, $0.length - 2);
        }
    });
    return mask;
});
//左填充
Sdopx.registerModifier('leftpad', function (str, len = 0, ch = ' ') {
    str = String(str);
    if (len <= str.length) {
        return str;
    }
    len = len - str.length;
    let pad = '';
    for (let i = 0; i < len; i++) {
        pad += ch;
    }
    return pad + str;
});
//右填充
Sdopx.registerModifier('rightpad', function (str, len, ch = ' ') {
    str = String(str);
    if (len <= str.length) {
        return str;
    }
    len = len - str.length;
    let pad = '';
    for (let i = 0; i < len; i++) {
        pad += ch;
    }
    return str + pad;
});

Sdopx.registerModifier('truncate', function (str, len = 60, etc = '') {
    str = String(str);
    if (len <= 0 && (len >> 1) >= str.length) {
        return str;
    }
    let clen = 0;
    for (let i = 0; i < str.length; i++) {
        if ((str.charCodeAt(i) & 0xff00) != 0) {
            clen++;
        }
        clen++;
        if (clen == len && i == str.length - 1) {
            return str;
        }
        if (clen == len && etc == '') {
            return str.substr(0, i);
        }
        if (clen > len) {
            if (etc.length > 0) {
                if (i - 2 < 0) {
                    return str;
                }
                return str.substr(0, i - 2) + etc;
            } else {
                if (i - 1 < 0) {
                    return str;
                }
                return str.substr(0, i - 1);
            }
        }
    }
});

Sdopx.registerModifier('nl2br', function (str) {
    return String(str).replace(/\n/g, '<br/>');
});

Sdopx.registerModifier('option', function (str, opts, def = '') {
    if (!(typeof str == 'string' || typeof str == 'number' || typeof str == 'boolean')) {
        return def;
    }
    if (str === void 0 || str === NaN) {
        return def;
    }
    if (typeof str == 'boolean') {
        if (typeof opts != 'object') {
            if (str) {
                return opts;
            }
            return def;
        }
        str = str === true ? 1 : 0;
    }
    if (typeof opts != 'object') {
        return def;
    }
    try {
        if (opts[str] === void 0) {
            return def;
        }
        return opts[str];
    }
    catch (e) {
        return def;
    }
});

//########################################################################################
//## 函数使用


//## 插件使用
Sdopx.registerPlugin('cycle', function (params, out, sdopx) {
    let cycle_vars = sdopx._temp_cycle_vars = sdopx._temp_cycle_vars || {};
    let {name = 'default', print = true, advance = true, reset = false, values = null, delimiter = ',', assign = null} = params;
    let item = cycle_vars[name] || null;
    if (values === null && item === null) {
        sdopx.addError(`cycle: missing 'values' parameter`);
    } else {
        if (item == null) {
            item = cycle_vars[name] = {};
        }
        if (item.values) {
            if (item.values instanceof Array && values instanceof Array) {
                if (JSON.stringify(item.values) != JSON.stringify(values)) {
                    item.index = 0;
                }
            } else {
                if (item.values != values) {
                    item.index = 0;
                }
            }
        }
        item.values = values;
    }
    item.delimiter = delimiter;
    let cycle_array = null;
    if (item.values instanceof Array) {
        cycle_array = item.values;
    } else {
        cycle_array = item.values.split(item.delimiter);
    }
    if (reset || !item.index) {
        item.index = 0;
    }
    if (assign) {
        print = false;
        sdopx.assign(assign, cycle_array[item.index]);
    }
    let retval = '';
    if (print) {
        retval = cycle_array[item.index];
    }
    if (advance) {
        if (item.index >= cycle_array.length - 1) {
            item.index = 0;
        } else {
            item.index++;
        }
    }
    out.raw(retval);
});
//## 注册插件块
Sdopx.registerPlugin('list', function (params, out, func, sdopx) {
    let {data = []} = params;
    out.raw('<table>');
    for (var i = 0; i < data.length; i++) {
        func(data[i]);
    }
    out.raw('</table>');
}, 2);

