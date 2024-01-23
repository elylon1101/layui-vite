export class PageManage {

    static id = 0;

    /**
     *
     * @type {Map<string, Page>}
     */
    static map = new Map();

    /**
     *
     * @param {Page} page
     */
    static addPage(page) {
        this.map.set(this.genPageKey(page.el, page.pagePath), page)
    }

    static getPage(el, pagePath) {
        return this.map.get(this.genPageKey(el, pagePath))
    }

    static getPageByKey(key) {
        return this.map.get(key)
    }

    /**
     *
     * @param {Page} page
     */
    static deletePage(page) {
        this.map.delete(this.genPageKey(page.el, page.pagePath))
    }

    static genPageKey(el, pagePath) {
        return el + ':' + pagePath
    }
}