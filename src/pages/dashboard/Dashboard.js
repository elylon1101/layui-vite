import { Page } from "../../framework/Page.js";
import { Http } from "../../util/Http.js";
import { StatusFormatUtils } from "../../util/StatusFormatUtils.js";
import './dashboard.css'
import { PageUtils } from "../../framework/PageUtils.js";
import * as echarts from 'echarts';
// 加载主题
import '../../../public/echartsTheme/them.js'

export class Dashboard extends Page {

    listenEventMsg = undefined

    async onLoad() {
        Http.get(`dashboard/data`).then(res => {
            this.renderData.users = res.data.users
            this.renderData.userVips = res.data.userVips
            this.renderData.orders = res.data.orders
            this.renderData.deliveries = res.data.deliveries
            this.renderData.totalOrderMoney = formatMoney(res.data.totalOrderMoney)
            this.renderData.totalRefundMoney = formatMoney(res.data.totalRefundMoney)
            this.renderData.compensation = res.data.compensation
        });
    }


    onShow() {
        this.renderOrder();
        this.renderOrderEcharts().then();
        layui.util.event('lay-event', {
            showPublishNoticeLayer: async () => {
                await PageUtils.openPage('notify')
            }
        });
    }

    async renderOrderEcharts() {
        let myChart = echarts.init(document.getElementsByClassName('orderCharts')[0], 'echartsTheme');
        let xData = [], data0Line = [], data1Line = [], data2Line = [], data3Line = [], data4Line = [];
        for (let i = 1; i <= 31; i++) {
            xData.push(i);
            data0Line[i] = Math.floor(Math.random() * 1001)
            data1Line[i] = Math.floor(Math.random() * 1001)
            data2Line[i] = Math.floor(Math.random() * 1001)
            data3Line[i] = Math.floor(Math.random() * 1001)
            data4Line[i] = Math.floor(Math.random() * 1001)
        }
        for (let i = 0; i < 5; i++) {
            this.renderData[`orderStatus${ i }`] = Math.floor(Math.random() * 1001)
        }
        myChart.setOption({
            title: { x: 'center', textStyle: { fontSize: 14 } },
            grid: { x: 30, y: 30, x2: 15, y2: 30 },
            tooltip: {
                trigger: "axis",
                backgroundColor: '#2D8CF0', //设置背景图片 rgba格式
                color: "white",
                borderWidth: "0", //边框宽度设置1
                borderColor: "", //设置边框颜色
                textStyle: {
                    color: "white" //设置文字颜色
                },
                formatter: function (data) {
                    return data[0].name + '号<br/>' + data.map(item => `${ item.seriesName }：${ item.value || '0' }单<br/>`).join('');
                }
            },
            legend: {
                data: [ '待支付订单', '待发货订单', '已发货订单', '已收货订单', '已取消订单' ]
            },
            xAxis: [ { type: 'category', boundaryGap: true, data: xData } ],
            yAxis: [ { type: 'value', name: '单', } ],
            color: [ '#16BAAA' ],
            series: [
                { name: '待支付订单', stack: 'order', type: 'bar', smooth: true, itemStyle: { normal: { areaStyle: { type: 'default' } } }, data: data0Line },
                { name: '待发货订单', stack: 'order', type: 'bar', smooth: true, itemStyle: { normal: { areaStyle: { type: 'default' } } }, data: data1Line },
                { name: '已发货订单', stack: 'order', type: 'bar', smooth: true, itemStyle: { normal: { areaStyle: { type: 'default' } } }, data: data2Line },
                { name: '已收货订单', stack: 'order', type: 'bar', smooth: true, itemStyle: { normal: { areaStyle: { type: 'default' } } }, data: data3Line },
                { name: '已取消订单', stack: 'order', type: 'bar', smooth: true, itemStyle: { normal: { areaStyle: { type: 'default' } } }, data: data4Line },
            ]
        });
        window.addEventListener('resize', function () {
            myChart.resize();
        });
    }

    destroyed() {
        super.destroyed();
        this.listenEventMsg && this.listenEventMsg()
    }


    renderOrder() {
        layui.laydate.render({
            elem: '[name="month"]',
            type: 'month',
            theme: 'default',
            value: layui.util.toDateString(new Date(), 'yyyy-MM'),
            done: async function (value, date, endDate) {
                layui.table.reloadData(`table`, { page: { curr: 1 }, where: { month: value } })
            }
        });
        layui.table.render({
            elem: `#table`,
            url: `order/page`,
            height: 472,
            page: true,
            limit: 10,
            cols: [ [
                {
                    field: 'createTime', title: '下单时间', width: 170, templet: function (d) {
                        return layui.util.toDateString(d.createTime);
                    }
                }
                , { field: 'userName', title: '用户', minWidth: 140 }
                , { field: 'orderNo', title: '订单号', width: 180 }
                , { field: 'number', title: 'SKU数量', width: 100 }
                , {
                    field: 'money', title: '金额', width: 100, align: 'center', templet: (d) => {
                        return formatMoney(d.money)
                    }
                }
                , {
                    field: 'status', title: '状态', width: 80, align: 'center', templet: (d) => {
                        return StatusFormatUtils.orderStatus(d.status)
                    }
                }
            ] ]
        });
    }
}
