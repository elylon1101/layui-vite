import { Request } from "./Request.js";

/**
 * @typedef {Object} RenderSelectOptions
 * @property {string} selector DOM选择器
 * @property {string} url 数据请求地址
 * @property {any} reqData 请求参数
 * @property {string} [valueKey=id] 数据中value的key @default id
 * @property {string} [nameKey=name] 数据中name的key @default name
 * @property {function} [getName] 获取选项显示的值，如果有该接口则默认使用该方法获取显示值，否则使用nameKey来获取显示值
 * @property {any} [selectValue] 选择的值
 * @property {string} [defaultValue=''] 默认选项的默认值 @default ''
 * @property {string} defaultText 默认选项的默认文本
 */
export class FormUtils {

    /**
     * 渲染下拉框
     * @param  {RenderSelectOptions} options
     * @return {Promise<void>}
     */
    async renderSelect(options) {
        options.valueKey = options.valueKey || 'id';
        options.nameKey = options.nameKey || 'name';
        options.defaultValue = options.defaultValue || '';
        let res = await Request.get(options.url, options.reqData);
        let dom = res.data.map(item => `<option value="${ item[options.valueKey] }" ${ item[options.valueKey] === options.selectValue ? 'selected ' : '' }>${ options.getName ? options.getName(item) : item[options.nameKey] }</option>`).join(' ')
        layui.$(options.selector).empty().append(`<option value="${ options.defaultValue }">${ options.defaultText }</option>`).append(dom);
        layui.form.render('select');
    }
}
