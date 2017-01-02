/**
 * Created by Administrator on 2017/1/3.
 */
const regExpChars = /[|\\{}()[\]^$+*?.]/g;

const _ENCODE_HTML_RULES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&#34;",
    "'": "&#39;"
};

export function escapeRegExpChars(string) {
    if (!string) {
        return '';
    }
    return String(string).replace(regExpChars, '\\$&');
}

export function escapeXml(string) {
    return String(string).replace(/[&<>'"]/g, function (c) {
        return _ENCODE_HTML_RULES[c] || c;
    });
}
