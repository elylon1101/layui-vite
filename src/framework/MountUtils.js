import { Page } from "./Page.js";

export class MountUtils {

    static async mount(pagePath, el, param) {
        if (!pagePath) {
            throw Error(`pagePath is undefined`);
        }
        let Module = await import(`../pages/${ pagePath }/${ MountUtils.firstUpperCase(pagePath) }.js`)
        let paths = Object.keys(Module);
        if (!paths || paths.length === 0) {
            throw Error(`page router not find`);
        }
        if (paths.length > 1) {
            throw Error(`page router find many`)
        }
        if (!(Module[paths[0]].prototype instanceof Page)) {
            throw Error(`page:${ pagePath } need extends Page class`)
        }
        let Node = await import(`../pages/${ pagePath }/${ pagePath }.html?raw`)
        let pageIns = new Module[paths[0]](el, Node.default, pagePath, param);
        await pageIns.start()
        return pageIns;
    }

    static firstUpperCase(str) {
        return str.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
    }
}
