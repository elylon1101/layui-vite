/**
 * 数组求和
 * @param {function} key 求和字段
 */
Array.prototype.sum = function (key = undefined) {
    if (key) {
        return this.map(key).reduce((a, b) => a + b, 0);
    } else {
        return this.reduce((a, b) => a + b, 0);
    }
}