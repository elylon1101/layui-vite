import { CacheService } from "../CacheService.js";

export class Permissions {

    static exec() {
        setInterval(() => {
            layui.each(layui.$('[hasPermissions]'), function (_, item) {
                let oThis = layui.$(item);
                let value = oThis.attr('hasPermissions')
                let type = oThis.attr('lay-skin');
                if (Permissions.hasPermissions(value)) {
                    if (type === 'switch') {
                        oThis.attr('disabled', false);
                        oThis.next()[0].classList.remove('layui-disabled');
                    } else {
                        oThis.show();
                    }
                } else {
                    oThis.hide()
                }
            });
            layui.each(layui.$('[notAdminShow]'), function (_, item) {
                let oThis = layui.$(item);
                let value = oThis.attr('notAdminShow')
                let type = oThis.attr('lay-skin');
                if (Permissions.hasPermissions(value)) {
                    oThis.removeAttr('disabled')
                    oThis.find('select').removeClass('layui-disabled').removeAttr('disabled')
                    oThis.find('input').removeClass('layui-disabled').removeAttr('disabled')
                    if (type === 'switch') {
                        oThis.next().removeClass('layui-checkbox-disabled layui-disabled')
                    }
                } else {
                    oThis.attr('disabled', true);
                    oThis.addClass('layui-disabled')
                    if (type === 'switch') {
                        oThis.next().addClass('layui-checkbox-disabled layui-disabled')
                    }
                    oThis.find('select').addClass('layui-disabled').attr('disabled', true)
                    oThis.find('input').addClass('layui-disabled').attr('disabled', true)
                }
            });
        }, 100)
    }

    /**
     * 判断自己是否是管理员身份
     * @returns {boolean} true:是 false:不是
     */
    static isAdmin() {
        return CacheService.adminInfo.positions === 0
    }

    /**
     * 判断自己是否是员工身份
     * @returns {boolean} true:是 false:不是
     */
    static isStaff() {
        return CacheService.adminInfo.positions === 1
    }

    /**
     * 判断自己是否拥有权限
     * @param commId 小区ID
     * @returns {boolean} true:是 false:否
     */
    static hasPermissions(commId) {
        return Permissions.isAdmin() || CacheService.adminInfo.commId === Number(commId)
    }
}
