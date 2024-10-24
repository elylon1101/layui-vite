export class DateUtils {

    /**
     * 当前日期
     * 格式：yyyy-MM-dd
     * @type {string}
     */
    static today = layui.util.toDateString(new Date(), 'yyyy-MM-dd')
    /**
     * 当前月份
     * 格式：yyyy-MM
     * @type {string}
     */
    static thisMonth = layui.util.toDateString(new Date(), 'yyyy-MM')

    /**
     * 当前年份
     * 格式：yyyy
     * @type {string}
     */
    static thisYear = layui.util.toDateString(new Date(), 'yyyy')

    static todayRange = layui.util.toDateString(new Date(), 'yyyy-MM-dd') + ` ~ ` + layui.util.toDateString(new Date(), 'yyyy-MM-dd')
    static thisMonthDayRange = layui.util.toDateString(new Date(), 'yyyy-MM') + '-01' + ` ~ ` + layui.util.toDateString(new Date(), 'yyyy-MM-dd')

    /**
     * 获取指定月份的总天数
     * @param month yyyy-MM
     */
    static getMonthDays(month) {
        let date = new Date(month);
        //将当前月份加1，下移到下一个月
        date.setMonth(date.getMonth() + 1);
        //将当前的日期置为0，
        date.setDate(0);
        //再获取天数即取上个月的最后一天的天数
        return date.getDate();
    }

    /**
     * 计算两个日期的自然日天数
     */
    static diffUTCDays(begin, end) {
        let beginDate = begin ? new Date(begin) : new Date();
        let endDate = end ? new Date(end) : new Date();
        // 每天有24小时 * 3600秒 * 1000毫秒
        let beginUtcDay = Math.floor(beginDate / 86400000);
        let endUtcDay = Math.floor(endDate / 86400000);
        return endUtcDay - beginUtcDay;
    }

    static getNowTime() {
        return Date.now();
    }
}