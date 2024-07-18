import 'layui/dist/css/layui.css'
import './comm/app.scss'
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
import '/xm-select.js?url'

export class App {
    static run() {
        // Comm.checkDevice()

        layui.link('https://at.alicdn.com/t/c/font_4032348_0o5jwugrbk8q.css');

        // 标记是否是electron客户端
        window.isPcClient = window.electronAPI !== undefined

        // 加载layui的第三方库
        LoadLayuiModelUtil.load(["layarea", "inputTag", "image", 'camera']).then(async () => {
            Comm.registerTips()
            // 开启权限
            Permissions.exec();

            // 获取管理员信息
            let res = await Http.get(`admin/getAdminInfo`, {}, { showMsg: false })
            CacheService.adminTypeChange = CacheService.adminInfo?.type !== res.data?.type
            CacheService.adminInfo = res.data

            //获取系统配置
            let getConfigPromise = Http.get(`system/getConfig`).then(res => {
                CacheService.systemConfig = res.data
            });
            // 获取工厂信息
            let getFactoryInfoPromise = Http.get(`admin/getFactoryInfo`).then(res => {
                CacheService.factoryInfo = res.data
            })
            // 获取管理员信息
            let getCurrentPrinterPromise = Http.get('print/getCurrentPrinter').then(res => {
                res.data.forEach(x => {
                    if (x.options) {
                        x.options = JSON.parse(x.options)
                    }
                    top.window.currentPrinterMap.set(x.type, x)
                })
            })

            await Promise.all([getConfigPromise, getFactoryInfoPromise, getCurrentPrinterPromise])

            // 进入页面
            PageUtils.enter().then();
        })
    }
}