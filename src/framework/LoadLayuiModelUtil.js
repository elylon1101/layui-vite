export class LoadLayuiModelUtil {
    static async load(path) {
        if (!Array.isArray(path)) {
            path = [path]
        }
        for (let i = 0; i < path.length; i++) {
            let url = path[i]
            await import(`../lib/${ url }.js`)
        }
    }
}
