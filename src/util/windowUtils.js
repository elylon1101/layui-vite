import { config } from "../config.js";
import { PageUtils } from "../framework/PageUtils.js";
import { CacheService } from "../CacheService.js";

window.formatMoney = function (money, symbol = '￥') {
    if (money === undefined) {
        return `${ symbol }0.00`
    }
    if (money === Infinity || isNaN(money)) {
        return '-'
    }
    return `${ symbol }${ money.toFixed(2) }`
};

window.hideSubPhone = function (phone) {
    if (!phone) {
        return '';
    }
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

window.headers = {
    [config.TOKEN]: CacheService.token
}

/**
 * 打印机配置
 * @typedef {Object} PrinterConf
 * @property {number} id 配ID
 * @property {string} dno 在线打印机的dno或者本地打印机的唯一标识符
 * @property {number} type 打印机类型  11-票据  22-标签  33-水洗唛打印机
 * @property {number} online 打印机在线状态  0-本地  1-云打印机
 * @property {number} styleId 样式索引下表
 * @property {{[key:string]:any;}} options 打印机设置
 * @property {number} status 打印机状态  0-正常  1-已关闭
 * @property {any} templateConfig 模板配置信息
 */
/**
 * 当前系统打印机配置情况
 * key：打印机类型 11-票据  22-标签  33-水洗唛打印机
 * @type {Map<number, PrinterConf>}
 */
top.window.currentPrinterMap = new Map()