import { config } from "../config.js";
import { PageUtils } from "../framework/PageUtils.js";
import { CacheService } from "../CacheService.js";

/**
 * 代理table.render方法，拦截登录过期的问题
 * @type {object}
 */
layui.table.render = new Proxy(layui.table.render, {
    apply: function (target, that, args) {
        args[0].limits = args[0].limits ?? [10, 20, 30, 40, 50, 80, 100]
        if (args[0].url) {
            if (args[0].url.indexOf(config.API_URI) === -1) args[0].url = config.API_URI + args[0].url
            if (args[0].done) {
                args[0].done = new Proxy(args[0].done, {
                    apply(target, thisArg, argArray) {
                        if (argArray[0].code === config.RESPONSE.STATUS_CODE.LOGOUT) {
                            //清空本地记录的 token
                            CacheService.token = undefined
                            layui.layer.msg('登录已过期')
                            PageUtils.toLogin().then();
                            return
                        }
                        return target.apply(thisArg, argArray)
                    }
                })
            } else {
                args[0].done = (res) => {
                    if (res.code === config.RESPONSE.STATUS_CODE.LOGOUT) {
                        //清空本地记录的 token
                        CacheService.token = undefined
                        layui.layer.msg('登录已过期')
                        PageUtils.toLogin().then();
                    }
                }
            }
        }
        args[0].headers = { ...args[0].headers, ...headers }
        return target.apply(that, args)
    }
});

layui.form.verify({
    pass: [
        /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}/
        , '密码必须8位以上，且必须包含数字，大写字母，小写字母，特殊符号'
    ]
    , noOrPass: [
        /^$|(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}/
        , '密码必须8位以上，且必须包含数字，大写字母，小写字母，特殊符号'
    ]
    , simplePass: [
        /(?=.*[0-9])(?=.*[a-zA-Z]).{6,}/
        , '密码必须6位以上，且必须包含数字，字母'
    ]
    , noOrSimplePass: [
        /^$|(?=.*[0-9])(?=.*[a-zA-Z]).{6,}/
        , '密码必须6位以上，且必须包含数字，字母'
    ]
    //确认密码
    , repass: function (value) {
        if (value !== layui.$('#LAY_password').val()) {
            return '两次密码输入不一致';
        }
    }
    , money: function (value) {
        if (!/^(0|[1-9]\d*)(\s|$|\.\d{1,2}\b)/.test(value)) {
            return '金额只能为正两位小数';
        }
    }
    , noOrMoney: function (value) {
        if (!/^$|(0|[1-9]\d*)(\s|$|\.\d{1,2}\b)/.test(value)) {
            return '金额只能为正两位小数';
        }
    }
    , phone: function (value) {
        if (!/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(value)) {
            return '请输入正确的手机号';
        }
    }
});