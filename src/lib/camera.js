/**
 * 1.初始化，渲染组件dom
 * 2.获取摄像头列表
 * 3.打开摄像头
 * 4.拍照
 * 5.断开链接
 */
import { Http } from "../util/Http.js";

layui.define(function (exports) {
    let main = {
        data: {
            width: 350,
            height: 350,
            get video() {
                return document.querySelector('video')
            },
            mediaTrack: undefined,
            cb: undefined,
            mediaStream: undefined
        },
        async render(selector, width, height, cb) {
            this.data.cb = cb;
            this.data.width = width
            this.data.height = height
            layui.$(selector).empty().append(this.initDom());
            await this.getMediaDevices();
        },
        initDom() {
            return `<div class="Flex-center-col" style="position: relative">
                        <video id="video" style="width: ${this.data.width}px;height: ${this.data.height}px;background: hsla(0, 0%, 0%, 0.7);object-fit:fill;"></video>
                        <i class="layui-icon layui-icon-camera capture" lay-event="capture" style="position: absolute;left: 50%;transform: translateX(-50%);bottom: 5px;color: white;font-size: 35px;cursor: pointer;"></i>
                        <button type="button" class="layui-btn layui-btn-xs" style="position: absolute; left: 30px; bottom: 5px;" lay-event="getMediaDevices">切换摄像头</button>
                    </div>`
        },
        async getMediaDevices() {
            let that = this;
            let devices = await navigator.mediaDevices.enumerateDevices();
            console.log(devices);
            const videoInputs = devices.filter(d => d.kind === 'videoinput');
            if (!videoInputs.length) {
                layui.layer.confirm('请接入摄像头', {icon: 3, title: '提示'}, function (index) {
                    layui.layer.close(index);
                    this.getMediaDevices();
                })
            } else if (videoInputs.length === 1) {
                this.connectCamera(videoInputs[0].groupId);
            } else {
                let selectDom = `<div style="display: flex;flex-wrap: wrap;justify-content: space-evenly;">`;
                videoInputs.forEach((d, i) => {
                    selectDom += `<button type="button" class="layui-btn" data-id="${d.groupId}" lay-event="selectCamera" style="margin-left: 0!important;margin-top: 10px;">${d.label}</button>`
                })
                selectDom += `</div>`
                layui.layer.open({
                    title: '选择摄像头', type: 1, content: selectDom, area: ['350px', '216px'], btnAlign: 'c', success(layero, index) {
                        layui.util.event('lay-event', {
                            selectCamera(el) {
                                that.connectCamera(layui.$(el).data('id'))
                                layui.layer.close(index)
                            }
                        });
                    }
                });
            }
        },
        connectCamera(groupId) {
            let that = this;
            that.disconnect();
            navigator.mediaDevices
                .getUserMedia({video: {groupId, width: this.data.width, height: this.data.height}})
                .then(function (stream) {
                    that.data.mediaStream = stream
                    that.data.video.srcObject = stream;
                    that.data.mediaTrack = stream.getTracks()[0];
                    that.data.video.onloadedmetadata = function (e) {
                        that.data.video.play();
                    };
                })
                .catch(console.log);
        },
        disconnect() {
            let that = this;
            if (that.data.mediaTrack) that.data.mediaTrack.stop();
            if (that.data.video) {
                that.data.video.pause();
                that.data.video.srcObject = null;
            }
        },
        hideUpload() {
            layui.$('.capture').addClass("layui-hide")
        },
        showUpload() {
            layui.$('.capture').removeClass("layui-hide")
        },
        listener() {
            let that = this;
            layui.util.event('lay-event', {
                async capture() {
                    if (!that.data.mediaStream) {
                        return
                    }
                    let videoTrack = that.data.mediaStream.getVideoTracks()[0];
                    let imageCapture = new ImageCapture(videoTrack);
                    let takePhoto = await imageCapture.takePhoto();
                    let reader = new FileReader();
                    reader.readAsDataURL(takePhoto);
                    reader.onload = async function (e) {
                        let uploadRes = await Http.post('system/base64UploadFile', {file: e.target.result});
                        console.log(uploadRes)
                        that.data.cb && that.data.cb(uploadRes.data.url)
                    }
                },
                async getMediaDevices() {
                    await that.getMediaDevices()
                }
            });
        }
    }
    main.listener();
    exports('camera', main)
})