import { config } from "../config.js";
import { CacheService } from "../CacheService.js";
import { Http } from "../util/Http.js";

export class Comm {
    static checkDevice() {
        if (layui.device().mobile) {
            let msg = `仅限电脑登录使用，请在谷歌浏览器输入：https://xxx.xxx.com`
            layui.layer.open({ title: '', closeBtn: 0, btn: '', shade: 0.3, content: msg });
            throw new Error(msg)
        }
    }

    /**
     * 下载
     * @param uri 接口地址
     * @param param 请求参数
     */
    static download(uri, param = {}) {
        layui.layer.load(2, { time: 2 * 1000 });
        let ulrParam = Object.keys(param).map(key => `&${ key }=${ param[key] }`).join('')
        let url = config.API_URI + uri + "?token=" + CacheService.token + "&" + ulrParam;
        let a = document.createElement('a');
        a.style.visibility = 'none';
        a.href = url;
        a.download = "";
        a.click();
        a.remove();
    }

    /**
     * 下载
     * @param uri 接口地址
     * @param param 请求参数
     */
    static downloadOther(uri, param = {}) {
        layui.layer.load(2, { time: 2 * 1000 });
        let ulrParam = Object.keys(param).map(key => `&${ key }=${ param[key] }`).join('')
        let url = uri + "?token=" + CacheService.token + "&" + ulrParam;
        let a = document.createElement('a');
        a.style.visibility = 'none';
        a.href = url;
        a.download = "";
        a.click();
        a.remove();
    }


    /**
     * 切换全屏
     */
    static changeScreen() {
        let SCREEN_FULL = 'layui-icon-screen-full', SCREEN_REST = 'layui-icon-screen-restore'
        let iconElem = layui.$(`.full-screen`);
        if (iconElem.hasClass(SCREEN_FULL)) {
            Comm.fullScreen();
            iconElem.addClass(SCREEN_REST).removeClass(SCREEN_FULL);
        } else {
            Comm.exitScreen();
            iconElem.addClass(SCREEN_FULL).removeClass(SCREEN_REST);
        }
    }

    /**
     * 全屏
     */
    static fullScreen() {
        let ele = document.documentElement
        let reqFullScreen = ele.requestFullScreen || ele.webkitRequestFullScreen || ele.mozRequestFullScreen || ele.msRequestFullscreen;
        if (typeof reqFullScreen !== 'undefined' && reqFullScreen) reqFullScreen.call(ele);
    }


    /**
     * 退出全屏
     */
    static exitScreen() {
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

    /**
     * 注册提示
     */
    static registerTips() {
        layui.$('body').off('mouseenter').on('mouseenter', '*[lay-tips]', function () {
            let $this = layui.$(this);
            let index = layui.layer.tips($this.attr('lay-tips'), this, { tips: 1, time: -1 });
            $this.data('tipsLayerIndex', index);
        }).off('mouseleave').on('mouseleave', '*[lay-tips]', function () {
            layui.layer.close(layui.$(this).data('tipsLayerIndex'));
        });
    }

    /**
     * 重新加载管理员信息
     * @returns {Promise<void>}
     */
    static async reloadAdminInfo() {
        // 获取管理员信息
        let res = await Http.get(`admin/getAdminInfo`, {}, { showMsg: false })
        CacheService.adminTypeChange = !CacheService.adminInfo || CacheService.adminInfo.type === undefined || CacheService.adminInfo?.type !== res.data?.type
        CacheService.adminInfo = res.data
    }

    static async playMp3(url) {
        let audio = document.getElementById('playMp3');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'playMp3';
        }
        audio.src = url;
        try {
            await audio.play();
        } catch (e) {
            if (e.message === 'play() failed because the user didn\'t interact with the document first. https://goo.gl/xX8pDD') {
                layui.layer.alert('由于浏览器限制需要您点击“确定”按钮开启语音提示', {
                    title: '开启语音提示', closeBtn: 0, btnAlign: 'c', yes: async (index, layero) => {
                        audio.muted = false;
                        audio.src = url;
                        await audio.play();
                        layui.layer.close(index);
                    }
                });
            }
        }
    }
}