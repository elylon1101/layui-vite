import { config } from "../config.js";

layui.define(function (exports) {
    let main = {
        data: {
            images: [],
            path: '',
            maxLength: 6,
            $body: '',
            $upload: 'upload',
            $uploadStyle: `position: relative; border-radius: 10px; font-size: 30px; background-color: #F5F5F5; color: #898989; cursor: pointer; display: inline-block; width: 100px; height: 100px; text-align: center; line-height: 100px;`,
            $imgItemStyle: `position: relative;`,
            $imgStyle: `width: 100px; height: 100px; object-fit: cover; cursor: pointer; margin-right: 10px; margin-bottom: 10px; border-radius: 10px;`,
            $delImgBtnStyle: `position: absolute; color: white; background-color: tomato; text-align: center; font-size: 12px; padding: 2px 10px; line-height: 20px; border-radius: 20px; cursor: pointer; right: 0; top: -10px;`,

        },
        async render(option) {
            this.data.$body = option.selector;
            this.data.images = option.images || [];
            this.data.path = option.path || ''
            layui.$(this.data.$body).css({'display': 'flex', 'flex-wrap': 'wrap', 'margin-bottom': '0'})
            this.renderImg();
        },
        /**
         * 注册图片上传组件
         */
        registerUpload() {
            let that = this;
            layui.upload.render({
                elem: `.${this.data.$upload}`
                , headers: headers
                , multiple: true
                , url: config.API_URI + 'system/uploadFile?path=' + that.data.path
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
        },
        /**
         * 添加图片
         * @param url 图片地址
         */
        addImage(url) {
            if (this.data.images.length >= this.data.maxLength) {
                return layui.layer.msg(`最多可以上传${this.data.maxLength}张图片`, {icon: 0});
            }
            this.data.images.push(url);
            this.renderImg();
        },
        /**
         * 删除图片
         */
        deleteImage(el) {
            let index = layui.$(el).data('index')
            this.data.images.splice(index, 1)
            this.renderImg();
        },
        /**
         * 渲染图片
         */
        renderImg() {
            let dom = ``;
            this.data.images.forEach((url, index) => {
                dom += `<div style="${this.data.$imgItemStyle}"><img style="${this.data.$imgStyle}" src="${url}"><span style="${this.data.$delImgBtnStyle}" lay-event="deleteImage" data-index="${index}">X</span></div>`;
            })
            if (this.data.images.length < this.data.maxLength) {
                dom += `<div class="${this.data.$upload}" style="${this.data.$uploadStyle}" lay-tips="上传照片，支持多图片上传">+</div>`
            }
            layui.$(this.data.$body).empty().append(dom);
            layui.layer.photos({photos: this.data.$body, anim: 5});
            this.registerUpload();
        },
        /**
         * 获取图片
         */
        getImg() {
            return this.data.images;
        },
        listener() {
            let that = this;
            layui.util.event('lay-event', {
                deleteImage(el) {
                    that.deleteImage(el);
                }
            });
        }
    }
    main.listener();
    exports('image', main)
})