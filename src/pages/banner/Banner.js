import { Page } from "../../framework/Page.js";
import { Request } from "../../util/Request.js";
import { config } from "../../config.js";
import { default as addOrEditBannerForm } from "./addOrEditBannerForm.html?raw"
import { createEditor, createToolbar } from "@wangeditor/editor";
import '@wangeditor/editor/dist/css/style.css'

export class Banner extends Page {

    onShow() {
        // 加载小区
        this.renderCommunity(`[lay-filter="queryForm"] [name='commId']`).then()
        this.renderTable()
        layui.form.on('submit(search)', async (data) => {
            layui.table.reloadData(`table`, { page: { curr: 1 }, where: data.field })
        });
        layui.util.event('lay-event', {
            showAddBannerLayer: () => {
                this.showAddBannerLayer()
            }
        });
    }

    renderTable() {
        layui.table.render({
            elem: '#table',
            url: config.API_URI + `banner/page`,
            where: {},
            headers: headers,
            page: true,
            limit: 10,
            limits: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            lineStyle: 'height: 60px;',
            cols: [[
                { field: 'id', title: 'ID编号', width: 100 }
                , {
                    field: 'communityName', title: '通知小区', width: 160, templet: (d) => {
                        return `${ d.commId ? `${ d.communityName }` : '所有小区' }`
                    }
                }
                , {
                    field: 'image', title: 'BANNER图片', minWidth: 140, event: 'qrcode', templet: function (d) {
                        return `<div class="table-image long"><img style="" src="${ d.image }" alt=""></div>`
                    }
                }
                , {
                    field: 'content', title: '内容详情', width: 120, align: 'center', event: 'info', templet: (d) => {
                        return `${ d.content ? `<span style="color: #1e9fff;cursor: pointer;">点击查看</span>` : '-' }`
                    }
                }
                , {
                    field: 'clicks', title: '点击次数', width: 140, align: 'center', templet: (d) => {
                        return `${ d.clicks ?? 0 }次`
                    }
                }
                , {
                    field: 'id', title: '展示时间', width: 300, templet: (d) => {
                        return `${ d.beginTime ? layui.util.toDateString(d.beginTime) : '' }~${ d.endTime ? layui.util.toDateString(d.endTime) : '' }`
                    }
                }
                , {
                    field: 'status', title: '状态', width: 100, align: 'center', templet: (d) => {
                        return `<input type="checkbox" id="${ d.id }" name="status" value="${ d.status }" title="正常|下架" lay-skin="switch" lay-filter="table-data-status" ${ d.status === 0 ? 'checked' : '' }>`
                    }
                }
                , {
                    field: 'createTime', title: '创建时间', width: 170, align: 'center', templet: function (d) {
                        return layui.util.toDateString(d.createTime);
                    }
                }
                , {
                    title: '操作', width: 140, fixed: 'right', align: 'center', templet: function (d) {
                        return `<div class="layui-btn-group">
                                    <span class="layui-btn layui-btn-sm" lay-event="edit">编辑</span>
                                    <span class="layui-btn layui-btn-sm layui-bg-red" lay-event="delete">删除</span>
                                </div>`;
                    }
                }
            ]],
            done: () => {
                layui.layer.photos({ photos: ".table-image", anim: 5 });
            }
        })
        layui.table.on('tool(table)', async (obj) => {
            switch (obj.event) {
                case `edit`:
                    this.showAddBannerLayer(obj.data)
                    break
                case `delete`:
                    layui.layer.confirm('确定要删除当前BANNER吗？', { btnAlign: 'c' }, async function (index) {
                        await Request.post(`banner/delete`, { id: obj.data.id })
                        layui.layer.msg(`删除成功`)
                        layui.layer.close(index);
                        layui.table.reloadData(`table`)
                    });
                    break
                case `info`:
                    layui.layer.open({
                        title: "详情"
                        , type: 1
                        , content: `<div class="info-content">${ obj.data.content }</div>`
                        , maxmin: false
                        , area: ['375px', '650px']
                        , btnAlign: 'c'
                        , shadeClose: true
                        , success: () => {
                            layui.layer.photos({ photos: `.info-content`, anim: 5 });
                        }
                    });
                    break
            }
        });
        layui.form.on('switch(table-data-status)', async (obj) => {
            let status = obj.elem.checked ? 0 : 1
            await Request.post(`banner/addOrEdit`, { id: obj.elem.id, status })
            layui.layer.msg(`状态修改成功`)
        });
    }

    showAddBannerLayer(data) {
        let editor;
        layui.layer.open({
            title: data ? `编辑BANNER` : `新建BANNER`
            , type: 1
            , content: addOrEditBannerForm
            , area: ['600px', '900px']
            , btn: ['确定', '取消']
            , resize: false
            , btnAlign: 'c'
            , success: async () => {
                let initDate = undefined;
                if (data?.beginTime && data?.endTime) {
                    initDate = `${ layui.util.toDateString(data?.beginTime) } - ${ layui.util.toDateString(data?.endTime) }`
                }
                layui.laydate.render({
                    elem: `[lay-filter="addOrEditBannerForm"] [name='time']`,
                    type: 'datetime',
                    value: initDate,
                    range: true
                });
                await this.renderCommunity(`[lay-filter="addOrEditBannerForm"] [name='commId']`)
                layui.form.val(`addOrEditBannerForm`, data)
                let uploadInst = layui.upload.render({
                    elem: '#ID-upload-demo-btn',
                    url: config.API_URI + `system/uploadFile`,
                    headers: headers,
                    before: function (obj) {
                        obj.preview(function (index, file, result) {
                            layui.$('#ID-upload-demo-img').attr('src', result);
                        });
                        layui.element.progress('filter-demo', '0%');
                        layui.layer.msg('上传中', { icon: 16, time: 0 });
                    },
                    done: function (res) {
                        if (res.code > 0) {
                            return layui.layer.msg('上传失败');
                        }
                        layui.$('#ID-upload-demo-text').html("");
                        layui.$(`[lay-filter="addOrEditBannerForm"] [name="image"]`).val(res.data.url);
                    },
                    error: function () {
                        let demoText = layui.$('#ID-upload-demo-text');
                        demoText.html('<span style="color: #FF5722;">上传失败</span> <a class="layui-btn layui-btn-xs demo-reload">重试</a>');
                        demoText.find('.demo-reload').on('click', function () {
                            uploadInst.upload();
                        });
                    },
                    // 进度条
                    progress: function (n, elem, e) {
                        layui.element.progress('filter-demo', n + '%'); // 可配合 layui 进度条元素使用
                        if (n === 100) {
                            layui.layer.msg('上传完毕', { icon: 1 });
                        }
                    }
                });
                layui.$('#ID-upload-demo-img').attr('src', data?.image);
                layui.layer.photos({ photos: `.layui-upload-list`, anim: 5 });

                const editorConfig = {
                    placeholder: '详情',
                    MENU_CONF: {
                        uploadImage: {
                            server: config.API_URI + `system/uploadFile`,
                            fieldName: 'file',
                            headers: headers,
                            customInsert(res, insertFn) {
                                if (res.code !== 0) {
                                    layui.layer.msg(res.msg)
                                    return
                                }
                                insertFn(res.data.url)
                            },
                        }
                    }
                }
                editor = createEditor({ selector: '#editor-container', html: data?.content ?? '', config: editorConfig, mode: 'default', })
                const toolbar = createToolbar({ editor, selector: '#toolbar-container', config: { excludeKeys: ['group-video'] }, mode: 'default' })
                layui.form.render();
            }
            , yes: (index) => {
                layui.form.submit('addOrEditBannerForm', async (formCommitData) => {
                    formCommitData.field = { ...data, ...formCommitData.field }
                    formCommitData.field.content = editor.getHtml()
                    let time = formCommitData.field.time.split(` - `)
                    formCommitData.field.beginTime = time[0]
                    formCommitData.field.endTime = time[1]
                    await Request.post(`banner/addOrEdit`, formCommitData.field)
                    layui.table.reloadData(`table`)
                    layui.layer.close(index);
                });
            }
        })
    }

    async renderCommunity(el) {
        let communityRes = await Request.get(`community/page`, { limit: 0 }, false);
        let dom = communityRes.data?.map(x => `<option value="${ x.id }">${ x.name }</option>`).join("");
        layui.$(el).html(`<option value="">选择小区</option>` + dom)
        layui.form.render()
    }
}
