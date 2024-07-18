import { config } from "../config.js";
import { PageUtils } from "../framework/PageUtils.js";
import { CacheService } from "../CacheService.js";

/**
 * 代理table.render方法，拦截登录过期的问题
 * @type {object}
 */
layui.table.render = new Proxy(layui.table.render, {
    apply: function (target, that, args) {
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


