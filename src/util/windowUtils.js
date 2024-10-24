import { config } from "../config.js";
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