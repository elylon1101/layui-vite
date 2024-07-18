import { Page } from "../../framework/Page.js";
import { config } from "../../config.js";
import MD5 from 'md5-es'
import { Http } from "../../util/Http.js";
import { LoginCanvasUtil } from "../../util/LoginCanvasUtil.js";
import { PageUtils } from "../../framework/PageUtils.js";
import './login.css'
import { CacheService } from "../../CacheService.js";


export class Login extends Page {

    onLoad() {
        //判断浏览器环境
        Login.checkDevice();
    }


    onShow() {
        LoginCanvasUtil.draw()
        // 记住账号密码
        if (CacheService.loginForm) {
            layui.form.val("loginForm", { account: atob(CacheService.loginForm.account), password: atob(CacheService.loginForm.password), remember: "on" });
        }
        this.loadQrCode()
        layui.util.event('lay-event', { loadQrCode: this.loadQrCode.bind(this) });
        layui.form.on('submit(login-submit)', async (obj) => await this.login(obj.field));
        layui.$(document).on('keypress', function (e) {
            if (e.keyCode === 13) {
                layui.$("[lay-filter='login-submit']").trigger("click");
            }
        });
    }

    destroyed(){
        layui.$(document).off('keypress')
    }

    async login(data) {
        //记住密码
        if (data.remember) {
            CacheService.loginForm = { account: btoa(data.account), password: btoa(data.password), remember: "on" }
        } else {
            CacheService.loginForm = undefined
        }
        data.password = MD5.hash(data.password);
        data.captchaFlag = CacheService.captchaFlag;
        data.type = 0
        let loginRes = await Http.post('admin/login', data);
        CacheService.token = loginRes.data.token
        this.loginSuccess();
    }

    loginSuccess() {
        layui.layer.msg('登录成功，即将跳转...', { offset: '15px', icon: 1, time: 1000 }, async function () {
            await PageUtils.toIndex()
        });
    }

    /**
     * 加载验证码
     */
    loadQrCode() {
        let captchaFlag = Math.floor(Math.random() * 1000000) + "" + new Date().getTime();
        CacheService.captchaFlag = captchaFlag
        layui.$('.captcha').attr("src", config.API_URI + 'admin/captcha?flag=' + captchaFlag);
    }

    static checkDevice() {
        if (layui.device().mobile) {
            let msg = `仅限电脑登录使用，请在谷歌浏览器输入：https://xxx.xxx.com`
            layui.layer.open({ title: '', closeBtn: 0, btn: '', shade: 0.3, content: msg });
            throw new Error(msg)
        }
    }

    static async checkLogin() {
        if (!CacheService.token) {
            await PageUtils.toLogin()
            throw new Error('go to login')
        }
    }
}
