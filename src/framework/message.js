export const customEventKey = 'sync-customEvent'
export const tagPageMsgKey = 'message'

const channel = new BroadcastChannel(`sync-broadcastChannel`)

/**
 * 发送跨页面标签消息
 * @param {string} key 事件名
 * @param {any|void} data 消息内容
 */

export function sendTagPageMsg(key, data = undefined) {
    channel.postMessage({ key, data })
}

/**
 * 监听跨页面标签消息
 * @param {string|string[]} key 事件名
 * @param {(any)=>void} callback 回调函数
 * @returns {()=> void}
 */
export function listenTagPageMsg(key, callback) {
    if (!Array.isArray(key)) key = [key];
    const handler = (e) => {
        if (key.includes(e.data.key)) callback && callback(e.data.data)
    }
    channel.removeEventListener(tagPageMsgKey, handler)
    channel.addEventListener(tagPageMsgKey, handler)
    return () => channel.removeEventListener(tagPageMsgKey, handler)
}

/**
 * 发送自定义消息
 * @param {string} key 事件名
 * @param {any|void} data  消息内容
 */
export function sendEventMsg(key, data = undefined) {
    let event = new CustomEvent(customEventKey, { detail: { key, data } })
    console.debug('派发事件', data)
    top.window.dispatchEvent(event)
}

/**
 * 监听自定义时间
 * @param {string|string[]}  key 事件名
 * @param {(any)=>void} callback 回调函数
 */
export function listenEventMsg(key, callback) {
    if (!Array.isArray(key)) key = [key];
    const handler = (e) => {
        if (key.includes(e.detail.key)) callback && callback(e.detail.data)
    }
    top.window.addEventListener(customEventKey, handler)
    return () => top.window.removeEventListener(customEventKey, handler)
}
