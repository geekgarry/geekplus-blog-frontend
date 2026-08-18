/**
 * IE11：把 axios / @babel/runtime 中的
 *   obj["function"==typeof Symbol&&Symbol.asyncIterator||"@@asyncIterator"]=...
 * 收成
 *   obj["@@asyncIterator"]=...
 * 避免 Chakra SCRIPT1015「缺少字符串」。
 */
module.exports = function ie11SyntaxFixLoader(source) {
  if (typeof source !== "string") return source;
  let out = source;
  out = out.replace(
    /\[["']function["']\s*==\s*typeof Symbol\s*&&\s*Symbol\.asyncIterator\s*\|\|\s*["']@@asyncIterator["']\]/g,
    '["@@asyncIterator"]'
  );
  out = out.replace(
    /\[["']function["']\s*==\s*typeof Symbol\s*&&\s*Symbol\.iterator\s*\|\|\s*["']@@iterator["']\]/g,
    '["@@iterator"]'
  );
  out = out.replace(
    /\[["']undefined["']\s*!=\s*typeof Symbol\s*&&\s*Symbol\.asyncIterator\s*\|\|\s*["']@@asyncIterator["']\]/g,
    '["@@asyncIterator"]'
  );
  out = out.replace(
    /\[["']undefined["']\s*!=\s*typeof Symbol\s*&&\s*Symbol\.iterator\s*\|\|\s*["']@@iterator["']\]/g,
    '["@@iterator"]'
  );
  out = out.replace(
    /(["'])function\1\s*==\s*typeof Symbol\s*&&\s*Symbol\.asyncIterator\s*\|\|\s*(["'])@@?asyncIterator\2/g,
    '"@@asyncIterator"'
  );
  out = out.replace(
    /(["'])function\1\s*==\s*typeof Symbol\s*&&\s*Symbol\.iterator\s*\|\|\s*(["'])@@?iterator\2/g,
    '"@@iterator"'
  );
  return out;
};
