export class MenuUtils {

    /**
     * 生成菜单dom
     * @param menuList 菜单列表
     * @param isChild 是否是子菜单
     * @returns {string} 菜单dom
     */
    static genMenuDom(menuList, isChild = false) {
        let dom = ``
        menuList.forEach(menu => {
            // 确定是否有icon
            let icon = menu.icon ? `<i class="${ menu.icon }"></i>` : ''
            // 判断是否有下级
            let hasChildren = menu.children && menu.children.length > 0
            let dataPage = hasChildren || !menu.link ? '' : `data-page="${ menu.link }"`
            dom += `<${ isChild ? `dl` : 'li' } class="layui-nav-item">`
            dom += `<a ${ dataPage } href="javascript:;">${ icon }${ menu.name }</a>`
            if (hasChildren) {
                dom += `<dl class="layui-nav-child">`
                dom += this.genMenuDom(menu.children, true);
                dom += `</dl>`
            }
            dom += `</${ isChild ? `dl` : 'li' }>`
        })
        return dom;
    }
}
