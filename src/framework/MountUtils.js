import { Page } from "./Page.js";

export class MountUtils {

    static async mount(pagePath, el, param) {
        if (!pagePath) {
            throw Error(`pagePath is undefined`);
        }
        let pagePathSplit = pagePath.split('/');
        let jsName = pagePathSplit[pagePathSplit.length - 1];
        let filePath = pagePath;
        if (pagePathSplit.length > 1) {
            filePath = pagePathSplit.slice(0, -1).join('/');
        }
        let Module = await import(`../pages/${ filePath }/${ MountUtils.firstUpperCase(jsName) }.js`)
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
        let Node = await import(`../pages/${ filePath }/${ jsName }.html?raw`)
        let pageIns = new Module[paths[0]](el, Node.default, pagePath, param);
        await pageIns.start()
        return pageIns;
    }

    static firstUpperCase(str) {
        return str.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
    }
}
