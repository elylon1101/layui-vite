export class CommonUtils {

    /**
     * 编码中文字符串
     * @param {*} str
     * @returns
     */
    static encodeURIForChinese(str) {
        return encodeURIComponent(str).replace(/%20/g, '+');
    }
        
    /**
     * 解码中文字符串
     * @param {*} str
     * @returns
     */
    static decodeURIForChinese(str) {
        return decodeURIComponent(String(str).replace(/\+/g, '%20'));
    }
}