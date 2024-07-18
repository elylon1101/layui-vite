import { config } from "../config.js";
import { MountUtils } from "./MountUtils.js";
import { CacheService } from "../CacheService.js";

export class PageUtils {
    /**
     * 菜单页面容器
     */
    static menuContainer = '#page-body'

    /**
     * 页面缓存
     * @type {string}
     */
    static lastPageCacheKey = 'lastPageCacheKey'

    static get lastPage() {
        return sessionStorage[this.lastPageCacheKey]
    }

    static set lastPage(value) {
        sessionStorage[this.lastPageCacheKey] = value
    }

    /**
     * 打开最后一次打开的页面
     * @param that 当前所在页面对象
     * @return {Promise<boolean>} ture打开成功，false打开失败
     */
    static async openLastPage(that) {
        if (this.lastPage && that.constructor.name.toLowerCase() !== this.lastPage) {
            await this.openPage(this.lastPage)
            return true
        }
        return false
    }

    /**
     * 打开页面
     * @param page 页面名称
     */
    static async openPage(page) {
        await MountUtils.mount(page, this.menuContainer);
        this.openMenuStyle(page);
        this.lastPage = page
    }

    /**
     * 打开第一个菜单
     */
    static async openFirstPage() {
        let page = layui.$(`[lay-filter='menu'] [data-page]:first`).data('page')
        await this.openPage(page)
    }

    static async toLogin() {
        // 关闭掉所有弹出层
        setTimeout(() => {
            layui.layer.closeAll()
        }, 1500)
        return await MountUtils.mount('login', config.MAIN_MOUNT_EL)
    }

    static async toIndex() {
        return await MountUtils.mount('index', config.MAIN_MOUNT_EL)
    }

    /**
     * 打开菜单样式
     * @param page 要打开的页面
     */
    static openMenuStyle(page) {
        layui.$(`[lay-filter='menu'] .layui-this`).removeClass(`layui-this`)
        layui.$(`[lay-filter='menu'] .layui-nav-item`).removeClass(`layui-nav-itemed`)
        let $this = layui.$(`[lay-filter='menu'] [data-page='${ page }']`)
        $this.parent().addClass(`layui-this`)
        $this.parents('.layui-nav-item').addClass('layui-nav-itemed');
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
        // 根据账号类型跳转,管理员类别 0-超管 1-员工
        if (CacheService.adminInfo.type === 0) {
            await PageUtils.toIndex()
        } else {
            // await PageUtils.toWorkspace()
        }
    }
}
