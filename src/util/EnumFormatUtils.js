export class EnumFormatUtils {

    static shopStatus(status) {
        switch (status) {
            case 0:
                return '<span class="layui-badge layui-bg-green">营业中</span>'
            case 1:
                return '<span class="layui-badge layui-bg-blue">停业中</span>'
            case 2:
                return '<span class="layui-badge layui-bg-orange">已冻结</span>'
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

    static washStatus(status) {
        switch (status) {
            case 10:
                return '<span class="layui-badge layui-bg-orange">送厂中</span>';
            case 20:
                return '<span class="layui-badge layui-bg-green">洗涤中</span>';
            case 21:
                return '<span class="layui-badge layui-bg-black">已外包</span>';
            case 25:
                return '<span class="layui-badge layui-bg-blue">已包装</span>';
            case 27:
                return '<span class="layui-badge layui-bg-blue">即将出厂</span>';
            case 30:
                return '<span class="layui-badge layui-bg-cyan">回店中</span>';
            case 40:
                return '<span class="layui-badge layui-bg">已回店</span>';
            default:
                return '-';
        }
    }
}
