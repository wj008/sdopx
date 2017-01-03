"use strict";
/**
 * Created by Administrator on 2017/1/3.
 */
var regExpChars = /[|\\{}()[\]^$+*?.]/g;
var _ENCODE_HTML_RULES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&#34;",
    "'": "&#39;"
};
function escapeRegExpChars(string) {
    if (!string) {
        return '';
    }
    return String(string).replace(regExpChars, '\\$&');
}
exports.escapeRegExpChars = escapeRegExpChars;
function escapeXml(string) {
    return String(string).replace(/[&<>'"]/g, function (c) {
        return _ENCODE_HTML_RULES[c] || c;
    });
}
exports.escapeXml = escapeXml;
//# sourceMappingURL=utils.js.map