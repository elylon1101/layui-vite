import { Page } from "../../framework/Page.js";
import { default as addOrEditDemandForm } from "../demand/addOrEditDemandForm.html?raw"

export class Test extends Page {

    interval

    async onLoad() {
        this.renderData = {
            community: 0,
            contract: 0,
            demand: 0,
            orders: [{ name: '第1个订单' }, { name: '第2个订单' }],
            renderDataStr: '',
            auto: 0,
            htmlDom: ` <span>v-html直接插入的数据<i class="layui-icon layui-icon-face-smile"></i></span>`
        }
    }

    onShow() {
        let that = this;
        this.interval = setInterval(() => {
            console.log(JSON.stringify(this.renderData))
            that.renderData.auto++
        }, 1000);
        /*layui.util.event('lay-event', {
            showAddDemandLayer: () => {
                this.addOrEditDemand()
            }
        });*/
    }


    destroyed() {
        super.destroyed();
        this.interval && clearInterval(this.interval)
    }

    addOrEditDemand() {
        layui.layer.open({
            title: `编辑需求`
            , type: 1
            , content: addOrEditDemandForm
            , area: ['950px', '620px']
            , btn: ['绑定', '取消']
            // , resize: false
            , btnAlign: 'c'
            , success: async () => {
                layui.form.render();
            }
            , yes: function (index) {

                return false;
            }
        })
    }

    addContract() {
        this.renderData.contract = Number(this.renderData.contract) + 1
    }

    addOrder() {
        this.renderData.orders.push({ name: `第${ this.renderData.orders.length + 1 }个订单` })
    }

    deleteOrder(index) {
        this.renderData.orders.splice(index, 1)
    }
}
