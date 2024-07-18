export class ScanEquipment {

    static scanEquipmentStackId = 0;
    static scanTaskStack = [];

    static inputData = ""
    static inputDataLastTime = undefined

    /**
     * 添加一个打印任务
     * @param callback 任务回调
     * @param manyTimes 是否多次执行
     * @returns {number} 任务id
     */
    static add(callback, manyTimes = true) {
        ScanEquipment.scanTaskStack.push({ id: ++ScanEquipment.scanEquipmentStackId, callback, manyTimes })
        return ScanEquipment.scanEquipmentStackId
    }

    /**
     * 删除一个打印任务
     * @param taskId 任务id
     */
    static delete(taskId) {
        if (taskId === undefined) return
        ScanEquipment.scanTaskStack = ScanEquipment.scanTaskStack.filter(item => item.id !== taskId)
    }

    static run() {
        ScanEquipment.inputData = ""
        ScanEquipment.inputDataLastTime = undefined
        this.boundBarcodeScannerHandler = this._barcodeScannerHandler.bind(this);
        window.addEventListener('keypress', this.boundBarcodeScannerHandler)
    }

    static stop() {
        window.removeEventListener('keypress', this.boundBarcodeScannerHandler)
    }

    static _result(code) {
        // 取出栈顶元素
        let oneStack = ScanEquipment.scanTaskStack.pop();
        console.log("扫码枪扫码结果：" + code, oneStack)
        if (!oneStack) return
        let { callback, manyTimes } = oneStack;
        if (manyTimes) {
            ScanEquipment.scanTaskStack.push(oneStack);
        }
        callback(code)
    }

    static _barcodeScannerHandler(event) {
        let currTime = performance.now();
        let inputString = event.key;
        if (!this.inputDataLastTime || currTime - this.inputDataLastTime <= 500) {// 扫码枪有效输入间隔毫秒
            if (inputString === 'Enter') {
                // 阻止事件冒泡和默认行为
                event.stopPropagation();
                event.preventDefault();
                event.stopImmediatePropagation()
                let resData = ScanEquipment.inputData;
                ScanEquipment.inputData = "";
                ScanEquipment.inputDataLastTime = undefined;
                if (resData.length > 0) {
                    this._result(resData)
                }
                return
            } else {
                // 不是enter要最加最新的输入字符
                ScanEquipment.inputData += inputString;
            }
        } else {
            // 输入间隔大于200毫秒，认为不是扫码枪输入内容，清空并储存本次输入
            ScanEquipment.inputData = event.key;
        }
        ScanEquipment.inputDataLastTime = currTime;
    }
}