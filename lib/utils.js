'use strict';
var regExpChars = /[|\\{}()[\]^$+*?.]/g;

var _ENCODE_HTML_RULES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&#34;",
    "'": "&#39;"
};

exports.escapeRegExpChars = function (string) {
    if (!string) {
        return '';
    }
    return String(string).replace(regExpChars, '\\$&');
};

exports.escapeXml = function (string) {
    return String(string).replace(/[&<>'"]/g, function (c) {
        return _ENCODE_HTML_RULES[c] || c;
    });
};
