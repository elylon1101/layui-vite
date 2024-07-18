import { config } from "../config.js";
import { PageUtils } from "../framework/PageUtils.js";
import { CacheService } from "../CacheService.js";

export class Http {

    static newFetch = Http.createFetchWithTimeout(10 * 1000)

    static createFetchWithTimeout(timeout = 1000) {
        return function (url, options) {
            return new Promise((resolve, reject) => {
                const signalController = new AbortController();
                fetch(url, { ...options, signal: signalController.signal }).then(resolve, reject)
                setTimeout(() => {
                    reject(new Error(`fetch timeout`))
                    signalController.abort()
                }, timeout)
            })
        }
    }

    static async get(url, data = {}, options = { openLoad: true, showMsg: true }) {
        let loadIndex;
        if (options?.openLoad) loadIndex = layui.layer.load(0, { id: 'RequestLoad' })
        if (data) {
            let param = Object.keys(data).map(key => `&${ key }=${ data[key] }`).join('')
            if (url.includes('?')) {
                url += '&' + param;
            } else {
                url += '?' + param
            }
        }
        try {
            let res = await Http.newFetch(config.API_URI + url, { headers: { [config.TOKEN]: CacheService.token } }).then(resp => resp.json());
            return await Http.requestSuccess(res, loadIndex, options);
        } catch (e) {
            loadIndex && layui.layer.close(loadIndex);
            if (!(e.code && e.msg)) {
                let msg = `网络异常`;
                layui.layer.msg(msg)
            }
            return Promise.reject(e)
        }
    }

    static async post(url, data = {}, options = { openLoad: true, showMsg: true }) {
        let loadIndex;
        if (options?.openLoad) loadIndex = layui.layer.load(0, { id: 'RequestLoad' })
        try {
            let res = await Http.newFetch(config.API_URI + url, {
                method: `POST`,
                headers:
                    {
                        [config.TOKEN]: CacheService.token,
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                body: JSON.stringify(data)
            }).then(resp => resp.json());
            return await Http.requestSuccess(res, loadIndex, options);
        } catch (e) {
            loadIndex && layui.layer.close(loadIndex);
            if (!(e.code && e.msg)) {
                let msg = `网络异常`;
                layui.layer.msg(msg)
            }
            return Promise.reject(e)
        }
    }

    static async requestSuccess(res, loadIndex, options) {
        loadIndex && layui.layer.close(loadIndex);
        if (res.code === config.RESPONSE.STATUS_CODE.OK) {
            return res;
        } else if (res.code === config.RESPONSE.STATUS_CODE.LOGOUT) {
            //清空本地记录的 token
            CacheService.token = undefined
            options.showMsg && layui.layer.msg('登录已过期')
            await PageUtils.toLogin();
            return Promise.reject(res)
        } else {
            let msg = `${ res[config.RESPONSE.MSG_NAME] || '请求失败：返回状态码异常' }`;
            options.showMsg && layui.layer.msg(msg)
            return Promise.reject(res)
        }
    }
}
