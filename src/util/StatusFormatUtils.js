export class StatusFormatUtils {

    static orderStatus(status) {
        switch (status) {
            case 0:
                return `<span class="layui-badge">待支付</span>`
            case 1:
                return `<span class="layui-badge layui-bg-cyan">待发货</span>`
            case 2:
                return `<span class="layui-badge layui-bg-blue">已发货</span>`
            case 3:
                return `<span class="layui-badge layui-bg-green">已收货</span>`
            case 4:
                return `<span class="layui-badge layui-bg-orange">已取消</span>`
            default:
                return ''
        }
    }

    static contractStatus(status) {
        switch (status) {
            case 0:
                return `<span class="layui-badge layui-bg-gray">未签约</span>`
            case 1:
                return `<span class="layui-badge layui-bg-green">已签约</span>`
            default:
                return ''
        }
    }

    static communityStatus(status) {
        switch (status) {
            case 0:
                return `<span class="layui-badge layui-bg-green">正常</span>`
            case 1:
                return `<span class="layui-badge layui-bg-orange">冻结</span>`
            default:
                return ''
        }
    }

    static adminType(type) {
        switch (type) {
            case 0:
                return `<span class="layui-badge layui-bg-blue">超管</span>`
            case 1:
                return `<span class="layui-badge layui-bg-green">普通</span>`
            default:
                return ''
        }
    }

    static sex(sex) {
        switch (sex) {
            case 0:
                return `<span class="layui-badge layui-bg-gray">未知</span>`
            case 1:
                return `<span class="layui-badge layui-bg-blue">男</span>`
            case 2:
                return `<span class="layui-badge layui-bg-green">女</span>`
            default:
                return ''
        }
    }

    static userIdentify(identify) {
        switch (identify) {
            case 0:
                return `<span class="layui-badge layui-bg-gray">未认证</span>`
            case 1:
                return `<span class="layui-badge layui-bg-green">业主</span>`
            case 2:
                return `<span class="layui-badge layui-bg-blue">租户</span>`
            default:
                return ''
        }
    }
}
