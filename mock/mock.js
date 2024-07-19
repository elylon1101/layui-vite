import fetchMock from 'fetch-mock'
import Mock from 'mockjs'
import { config } from "../src/config.js";
import { id } from "mockjs/src/mock/random/misc.js";

// 修改config的请求地址
config.API_URI = ''

/** 登录 **/
fetchMock.post('admin/login', () => {
    return {
        code: 0,
        msg: "success",
        data: {
            token: '1234234234234234234'
        }
    }
})

/** 登录 **/
fetchMock.get('admin/getAdminInfo', () => {
    return {
        code: 0,
        msg: "success",
        data: {
            token: '1234234234234234234',
            type: 1
        }
    }
})

/** index */
fetchMock.get('system/getConfig', () => {
    return {
        code: 0,
        msg: "success",
        data: {
            key: '1234234234234234234',
            aMapKeyWebPage: '7bd387e509a50aa53d90551cba0625aa'
        }
    }
})

/** 地图 */
fetchMock.get('map/markers', () => {
    return {
        code: 0,
        msg: "success",
        data: [
            {
                "id": 26,
                "name": "瑞华天地",
                "prov": "四川省",
                "city": "成都市",
                "zone": "双流区",
                "addr": "剑南大道南段716号(骑龙地铁站D口步行280米)",
                "lng": 104.04409,
                "lat": 30.527847,
            },
            {
                "id": 25,
                "name": "新怡华庭西区",
                "prov": "四川省",
                "city": "成都市",
                "zone": "双流区",
                "addr": "应龙北三路1188号",
                "lng": 104.094047,
                "lat": 30.534313,
            },
            {
                "id": 1,
                "name": "新怡华庭东区",
                "prov": "四川省",
                "city": "成都市",
                "zone": "双流区",
                "addr": "应龙路1199号(观东地铁站A口步行330米)",
                "lng": 104.096696,
                "lat": 30.534545,
            },
            {
                "id": 8,
                "name": "领馆国际城",
                "prov": "四川省",
                "city": "成都市",
                "zone": "双流区",
                "addr": "中和街道梓州大道4111号",
                "lng": 104.086132,
                "lat": 30.536773,
            },
            {
                "id": 9,
                "name": "长冶南阳御龙府2期",
                "prov": "四川省",
                "city": "成都市",
                "zone": "双流区",
                "addr": "中和街道梓州大道4333号长冶南阳御龙府2期",
                "lng": 104.084034,
                "lat": 30.534544,
            },
            {
                "id": 2,
                "name": "朗基和今缘",
                "prov": "四川省",
                "city": "成都市",
                "zone": "双流区",
                "addr": "吉龙一街199号",
                "lng": 104.091287,
                "lat": 30.538804,
            }
        ],
        count: 6
    }
})

fetchMock.get('admin/getMenu', () => {
    return {
        "code": 0,
        "msg": "success",
        "data": [
            {
                "id": 101,
                "fatherId": -1,
                "icon": "layui-icon layui-icon-console",
                "name": "首页",
                "link": "dashboard"
            },
            {
                "id": 102,
                "fatherId": -1,
                "icon": "layui-icon layui-icon-location",
                "name": "地图分布",
                "link": "map"
            },
            {
                "id": 106,
                "fatherId": -1,
                "icon": "layui-icon layui-icon-speaker",
                "name": "通知管理",
                "children": [
                    {
                        "id": 601,
                        "fatherId": 106,
                        "name": "通知管理",
                        "link": "notify"
                    },
                    {
                        "id": 602,
                        "fatherId": 106,
                        "name": "BANNER",
                        "link": "banner"
                    }
                ]
            },
            {
                "id": 110,
                "fatherId": -1,
                "icon": "layui-icon layui-icon-username",
                "name": "账号管理",
                "link": "admin"
            }
        ]
    }
})


/** dashboard */
fetchMock.get('dashboard/data', () => {
    return Mock.mock({
        code: 0,
        data: {
            "users|0-1000": 0,
            "userVips|0-1000": 0,
            "orders|0-10000": 0,
            "deliveries|0-10000": 1,
            "totalOrderMoney|0-10000.02-99": 1,
            "totalRefundMoney|0-10000.02-99": 0,
            "compensation|0-10000": 0,
        },
    })
})

fetchMock.catch({ status: 404 })

Mock.mock(/order\/page/, {
    code: 0,
    "data|10": [
        {
            "createTime": "@DATETIME",
            "userName": "@cname",
            "orderNo": "@id",
            "number|100-999": 1,
            "money|100-999": 1,
            "status|0-4": 0,
        }
    ],
    count: 56
})
