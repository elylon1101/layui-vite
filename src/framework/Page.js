import { Rtpl } from "./Rtpl.js";
import { PageManage } from "./PageManage.js";

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
        } catch (e) {
            console.log(e)
        }
    }

    render() {
        if (this.node) {
            new Rtpl(this).start(layui.$(this.el)[0], this.node.replaceAll('\r\n', ''))
            layui.$(this.el).find(`.admin-page`).removeClass(Page.animName).addClass(Page.animName)
            layui.form.render()
            layui.element.render()
            PageManage.addPage(this)
            console.log("页面被创建", this.el, this.pagePath);
        }
    }

    onLoad() {

    }

    onShow() {

    }

    destroyed() {
        console.log("页面被销毁", this.el, this.pagePath);
    }
}
