import { config } from "../config.js";

export class ImageUpload {

    images = []
    path = ''
    maxLength = 6
    $body = ''
    $upload = 'upload'
    $uploadStyle = `position: relative; border-radius: 10px; font-size: 30px; background-color: #F5F5F5; color: #898989; cursor: pointer; display: inline-block; width: 100px; height: 100px; text-align: center; line-height: 100px;`
    $imgItemStyle = `position: relative;`
    $imgStyle = `width: 100px; height: 100px; object-fit: cover; cursor: pointer; margin-right: 10px; margin-bottom: 10px; border-radius: 10px;`
    $delImgBtnStyle = `position: absolute; color: white; background-color: tomato; text-align: center; font-size: 12px; padding: 2px 10px; line-height: 20px; border-radius: 20px; cursor: pointer; right: 0; top: -10px;`

    constructor(option) {
        this.$body = option.selector;
        this.images = option.images ?? [];
        this.path = option.path ?? ''
        this.maxLength = option.maxLength ?? 6
        // 是否允许上传
        this.uploadOpen = option.uploadOpen ?? true
        layui.$(this.$body).css({ 'display': 'flex', 'flex-wrap': 'wrap', 'margin-bottom': '0' })
        this.renderImg();
        let that = this;
        layui.util.event('lay-event', {
            deleteImage(el) {
                that.deleteImage(el);
            }
        });
    }

    /**
     * 注册图片上传组件
     */
    registerUpload() {
        let that = this;
        layui.upload.render({
            elem: `.${ this.$upload }`
            , headers: headers
            , multiple: true
            , url: config.API_URI + 'system/uploadFile?path=' + that.path
            , before: function () {
                layui.layer.load();
            }
            , done: function (res) {
                console.debug('上传成功', res)
                layui.layer.closeAll('loading');
                if (res.code !== 0) {
                    layui.layer.msg(res.msg);
                    return;
                }
                that.addImage(res.data.url)
            }
        });
    }

    /**
     * 添加图片
     * @param url 图片地址
     */
    addImage(url) {
        if (this.images.length >= this.maxLength) {
            return layui.layer.msg(`最多可以上传${ this.maxLength }张图片`, { icon: 0 });
        }
        this.images.push(url);
        this.renderImg();
    }

    /**
     * 删除图片
     */
    deleteImage(el) {
        let index = layui.$(el).data('index')
        this.images.splice(index, 1)
        this.renderImg();
    }

    /**
     * 渲染图片
     */
    renderImg() {
        let dom = ``;
        this.images.forEach((url, index) => {
            dom += `<div style="${ this.$imgItemStyle }"><img style="${ this.$imgStyle }" src="${ url }" alt=""><span style="${ this.$delImgBtnStyle }${ this.uploadOpen === false ? '; display:none' : '' }" lay-event="deleteImage" data-index="${ index }">X</span></div>`;
        })
        if (this.images.length < this.maxLength && this.uploadOpen === true) {
            dom += `<div class="${ this.$upload }" style="${ this.$uploadStyle }" lay-tips="上传照片，支持多图片上传">+</div>`
        }
        layui.$(this.$body).empty().append(dom);
        layui.layer.photos({ photos: this.$body, anim: 5 });
        this.registerUpload();
    }

    /**
     * 获取图片
     */
    getImg() {
        return this.images;
    }
}
