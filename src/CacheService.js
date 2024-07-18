import { config } from "./config.js";

/**
 * 缓存服务
 */
export class CacheService {

    static cacheKey = {
        /**
         * 登录后的token
         */
        token: 'token',
        /**
         * 登录表单
         */
        loginForm: 'loginForm',
        /**
         * 验证码标记
         */
        captchaFlag: 'captchaFlag',
        /**
         * 系统配置
         */
        config: 'config',
        adminInfo: 'adminInfo',
        configSubKey: {
            /**
             * 高德地图web页面的key
             */
            aMapKeyWebPage: 'aMapKeyWebPage'
        }
    }

    /**
     * 获取token
     * @return {string}
     */
    static get token() {
        return sessionStorage.getItem(CacheService.cacheKey.token)
    }

    /**
     * 缓存token
     * @param {string} token 登陆成功后的token
     */
    static set token(token) {
        if (token) {
            sessionStorage.setItem(CacheService.cacheKey.token, token)
            window.headers = {
                [config.TOKEN]: CacheService.token
            }
        } else {
            sessionStorage.removeItem(CacheService.cacheKey.token)
            window.headers = {
                [config.TOKEN]: undefined
            }
        }
    }

    /**
     * 获取登录表单缓存
     * @return {string}
     */
    static get loginForm() {
        return JSON.parse(localStorage.getItem(CacheService.cacheKey.loginForm))
    }

    /**
     * 缓存登录表单缓存
     * @param {string} value 登录表单内容
     */
    static set loginForm(value) {
        if (value) {
            localStorage.setItem(CacheService.cacheKey.loginForm, JSON.stringify(value))
        } else {
            localStorage.removeItem(CacheService.cacheKey.loginForm)
        }
    }

    /**
     * 获取验证码标记
     * @return {string}
     */
    static get captchaFlag() {
        return sessionStorage.getItem(CacheService.cacheKey.captchaFlag)
    }

    /**
     * 缓存验证码标记
     * @param {string} value 验证码标记
     */
    static set captchaFlag(value) {
        sessionStorage.setItem(CacheService.cacheKey.captchaFlag, value)
    }

    /**
     * 获取系统配置信息
     * @return {any}
     */
    static get systemConfig() {
        return JSON.parse(localStorage.getItem(CacheService.cacheKey.config))
    }

    /**
     * 设置系统配置信息
     * @param value
     */
    static set systemConfig(value) {
        if (value) {
            localStorage.setItem(CacheService.cacheKey.config, JSON.stringify(value))
        } else {
            localStorage.removeItem(CacheService.cacheKey.config)
        }
    }

    static get adminInfo() {
        return JSON.parse(localStorage.getItem(CacheService.cacheKey.adminInfo))
    }

    static set adminInfo(value) {
        if (value) {
            localStorage.setItem(CacheService.cacheKey.adminInfo, JSON.stringify(value))
        } else {
            localStorage.removeItem(CacheService.cacheKey.adminInfo)
        }
    }
}
