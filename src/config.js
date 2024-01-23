export const config = {
    TOKEN: 'token',
    MAIN_MOUNT_EL: `#app`,
    API_URI: import.meta.env.VITE_API_URI,
    RESPONSE: {
        STATUS_NAME: 'code' //数据状态的字段名称
        , STATUS_CODE: {
            OK: 0 //数据状态一切正常的状态码
            , LOGOUT: 1100 //登录状态失效的状态码
        }
        , MSG_NAME: 'msg' //状态信息的字段名称
        , DATA_NAME: 'data' //数据详情的字段名称
    },
    DATE_FORMAT_DAY: 'yyyy-MM-dd',
    /**
     * 消息key定义
     */
    MESSAGE_KEY:{
        /**
         * 发布需求
         */
        DEMAND_ADD: 'demand_add'
    }
}
