import { Page } from "../../framework/Page.js";
import { Login } from "../login/Login.js";
import { Http } from "../../util/Http.js";
import { MenuUtils } from "../../framework/MenuUtils.js";
import { PageUtils } from "../../framework/PageUtils.js";
import './menu.css'
import './index.css'
import MD5 from "md5-es";
import { default as updatePwdForm } from "./updatePwd.html?raw"
import { CacheService } from "../../CacheService.js";

export class Index extends Page {

    async onLoad() {
        Login.checkDevice();
        await Login.checkLogin()
        Http.get(`system/getConfig`).then(res => CacheService.systemConfig = res.data)
        // 加载菜单
        Http.get(`admin/getMenu`).then(async menuRes => {
            this.renderData.menuDom = MenuUtils.genMenuDom(menuRes.data)
            // 尝试打开最后一次打开的页面，没成功就打开第一个页面
            if (!await PageUtils.openLastPage(this)) {
                await PageUtils.openFirstPage()
            }
        });
        this.renderData = { projectName: `Layui-vite演示站` }
    }

    async onShow() {
        layui.util.event('lay-event', {
            menuLeft: () => {
                layui.layer.msg('展开左侧菜单的操作', { icon: 0 });
            },
            logout: async () => {
                await Http.post(`admin/logout`)
                CacheService.token = undefined
                await PageUtils.toLogin()
            },
            changeScreen: () => {
                this.changeScreen();
            },
            refresh: () => {
                PageUtils.openLastPage(this).then()
            },
            updPwd: () => {
                layui.layer.open({
                    title: `修改密码`
                    , type: 1
                    , content: updatePwdForm
                    , area: [ '480px', '300px' ]
                    , btn: [ '保存', '取消' ]
                    , resize: false
                    , btnAlign: 'c'
                    , success: async () => {
                        layui.form.verify({
                            confirmPassword: function (value, item) {
                                let passwordValue = layui.$(`[lay-filter="updatePwdForm"] [name='newPwd']`).val();
                                if (value !== passwordValue) {
                                    return '两次密码输入不一致';
                                }
                            }
                        });
                        layui.form.render();
                    }
                    , yes: (index) => {
                        layui.form.submit('updatePwdForm', async (formCommitData) => {
                            formCommitData.field.oriPwd = MD5.hash(formCommitData.field.oriPwd);
                            formCommitData.field.newPwd = MD5.hash(formCommitData.field.newPwd);
                            await Http.post(`admin/updPwd`, formCommitData.field)
                            layui.layer.msg('修改成功')
                            layui.layer.close(index);
                        });
                    }
                })
            }
        });
        layui.element.on('nav(menu)', async (elem) => {
            let pagePath = layui.$(elem).data('page');
            if (!pagePath) return
            await PageUtils.openPage(pagePath)
        })
        this.registerTips()
    }

    changeScreen() {
        let SCREEN_FULL = 'layui-icon-screen-full', SCREEN_REST = 'layui-icon-screen-restore'
        let iconElem = layui.$(`.full-screen`);
        if (iconElem.hasClass(SCREEN_FULL)) {
            this.fullScreen();
            iconElem.addClass(SCREEN_REST).removeClass(SCREEN_FULL);
        } else {
            this.exitScreen();
            iconElem.addClass(SCREEN_FULL).removeClass(SCREEN_REST);
        }
    }

    //全屏
    fullScreen() {
        let ele = document.documentElement
        let reqFullScreen = ele.requestFullScreen || ele.webkitRequestFullScreen || ele.mozRequestFullScreen || ele.msRequestFullscreen;
        if (typeof reqFullScreen !== 'undefined' && reqFullScreen) reqFullScreen.call(ele);
    }

    //退出全屏
    exitScreen() {
        let ele = document.documentElement
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    registerTips() {
        layui.$('body').on('mouseenter', '*[lay-tips]', function () {
            let $this = layui.$(this);
            let index = layui.layer.tips($this.attr('lay-tips'), this, { tips: 1, time: -1 });
            $this.data('index', index);
        }).on('mouseleave', '*[lay-tips]', function () {
            layui.layer.close(layui.$(this).data('index'));
        });
    }
}
