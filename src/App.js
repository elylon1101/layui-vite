import 'layui/dist/css/layui.css'
import './comm/app.scss'
import './lib/inputTag.css'
import 'layui'
import './util/layuiUtils.js'
import './util/windowUtils.js'
import './util/prototype.js'
import { PageUtils } from "./framework/PageUtils.js";
import { Permissions } from "./framework/Permissions.js";
import { LoadLayuiModelUtil } from "./framework/LoadLayuiModelUtil.js";
import { Comm } from "./comm/Comm.js";
import { Http } from "./util/Http.js";
import { CacheService } from "./CacheService.js";
import '../public/xm-select.js'
import { config } from "./config.js";
import packageInfo from '../package.json'

export class App {
    static async run() {
        // Comm.checkDevice()
        layui.link('https://at.alicdn.com/t/c/font_4032348_0o5jwugrbk8q.css');

        // 加载layui的第三方库
        LoadLayuiModelUtil.load(["layarea", "inputTag", "image", 'camera']).then(async () => {
            Comm.registerTips()
            // 开启权限
            Permissions.exec();
            // 获取管理员信息
            await Comm.reloadAdminInfo();
            //获取系统配置
            let getConfigPromise = Http.get(`system/getConfig`).then(res => {
                CacheService.systemConfig = res.data
            });
            await Promise.all([getConfigPromise])
            // 进入页面
            this.enter().then();
        })
    }

    /**
     * 进入页面
     */
    static async enter() {
        // 如果未登陆则直接到登录页
        if (!CacheService.token) {
            await PageUtils.toLogin()
            throw new Error('go to login')
        }
        await PageUtils.toIndex()
    }
}