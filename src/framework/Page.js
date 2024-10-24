import { Rtpl } from "./Rtpl.js";
import { PageManage } from "./PageManage.js";
import { PageUtils } from "./PageUtils.js";

export class Page {
    el
    node
    pagePath
    renderData = {}
    param = undefined

    static tplMap = new Map()

    static animName = 'layui-anim layui-anim-fadein'

    constructor(el, node, pagePath, param) {
        this.id = PageManage.id++
        this.el = el
        this.node = node
        this.pagePath = pagePath
        this.param = param
        this.destroyLastPage()
    }

    destroyLastPage() {
        if (!this.el) return
        let $Element = layui.$(this.el)[0];
        if (!$Element) return
        let oldPage = $Element.getAttribute('page');
        let previousPage = PageManage.getPageByKey(oldPage);
        if (previousPage) {
            previousPage.destroyed.call(previousPage)
            PageManage.deletePage(previousPage)
            previousPage.__proto__ = null
            previousPage = null
        }
        $Element.setAttribute('page', PageManage.genPageKey(this.el, this.pagePath))
    }

    async start() {
        try {
            await this.onLoad()
            await this.render()
            await this.onShow()
            /**
             * 自动绑定事件，在onShow之后执行
             * 给页面片段里面所有带有click属性的元素注册点击事件
             * 注意：只会给node里面的元素绑定事件，后续动态添加的需要手动绑定事件，可以使用this.bindClickEvent(handler)
             */
            this.bindClickEventByHtml(this.node)
        } catch (e) {
            console.log(e)
        }
    }

    /**
     * 渲染页面
     * @returns {Promise<void>}
     */
    async render() {
        if (this.node) {
            new Rtpl(this).start(layui.$(this.el)[0], this.node.replaceAll('\r\n', ''))
            layui.$(this.el).find(`.admin-page`).removeClass(Page.animName).addClass(Page.animName)
            layui.form.render()
            layui.element.render()
            PageManage.addPage(this)
            console.log("页面被创建", this.el, this.pagePath);
        }
    }

    /**
     * 页面加载后渲染前执行
     * @returns {Promise<void>}
     */
    async onLoad() {

    }

    /**
     * 页面渲染后执行
     * @returns {Promise<void>}
     */
    async onShow() {

    }

    /**
     * 绑定点击事件
     * @param {string|string[]} handlers 事件处理函数名称
     */
    bindClickEvent(...handlers) {
        handlers?.flat().forEach(event => {
            layui.$(`[click="${ event }"]`).off('click').on('click', this[event]?.bind(this))
        })
    }

    bindClickEventByHtml(html) {
        if (!html) return;
        // 找出字符串里面所有包含的lay-event属性并获取属性值
        let layEvent = html.match(/click="[^"]*"/g)?.map(match => match.slice(7, -1))?.filter(x => x !== '')
        this.bindClickEvent(layEvent)
    }

    destroyed() {
        console.log("页面被销毁", this.el, this.pagePath);
    }

    refresh() {
        PageUtils.openLastPage(this).then()
    }
}
