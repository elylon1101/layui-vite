import { Page } from "../../framework/Page.js";
import { config } from "../../config.js";
import { StatusFormatUtils } from "../../util/StatusFormatUtils.js";
import { Http } from "../../util/Http.js";
import MD5 from 'md5-es'
import { default as addOrEditAdminForm } from "./addOrEditAdminForm.html?raw"

export class Admin extends Page {

    onShow() {
        layui.form.on('submit(search)', async (data) => {
            layui.table.reloadData(`table`, { page: { curr: 1 }, where: data.field })
        });
        this.renderTable()
        layui.util.event('lay-event', {
            showAddAdminLayer: () => {
                this.showAddAdminLayer()
            }
        });
    }

    renderTable() {
        layui.table.render({
            elem: '#table',
            url: config.API_URI + `admin/page`,
            where: {},
            headers: headers,
            page: true,
            limit: 10,
            limits: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            lineStyle: 'height: 60px;',
            cols: [[
                { field: 'id', title: '员工ID', width: 100, align: 'center' }
                , { field: 'communityName', title: '所属小区', minWidth: 140 }
                , {
                    field: 'type', title: '角色', width: 100, align: 'center', templet: function (d) {
                        return StatusFormatUtils.adminType(d.type);
                    }
                }
                , { field: 'name', title: '员工姓名', width: 120 }
                , { field: 'phone', title: '联系电话', width: 130 }
                , {
                    field: 'sex', title: '性别', width: 100, align: 'center', templet: function (d) {
                        return StatusFormatUtils.sex(d.sex);
                    }
                }
                , {
                    field: 'loginTime', title: '上次登陆', width: 170, templet: function (d) {
                        return d.loginTime ? layui.util.toDateString(d.loginTime) : ''
                    }
                }
                , {
                    field: 'status', title: '状态', width: 100, align: 'center', templet: (d) => {
                        if (d.type !== 0) {
                            return `<input type="checkbox" id="${ d.id }" name="status" value="${ d.status }" title="正常|冻结" lay-skin="switch" lay-filter="table-data-status" ${ d.status === 0 ? 'checked' : '' }>`
                        } else {
                            return '超管'
                        }
                    }
                }
                , {
                    field: 'createTime', title: '入驻时间', width: 170, templet: function (d) {
                        return layui.util.toDateString(d.createTime);
                    }
                }
                , {
                    title: '操作', width: 120, fixed: 'right', align: 'center', templet: function (d) {
                        if (d.type !== 0) {
                            return `<div class="layui-btn-group">
                                    <span class="layui-btn layui-btn-sm" lay-event="edit">编辑</span>
                                    <span class="layui-btn layui-btn-sm layui-bg-red" lay-event="delete">删除</span>
                                </div>`;
                        } else {
                            return '超管'
                        }

                    }
                }
            ]]
        })
        layui.table.on('tool(table)', async (obj) => {
            switch (obj.event) {
                case `edit`:
                    this.showAddAdminLayer(obj.data)
                    break
                case `delete`:
                    layui.layer.confirm('确定要删除当前管理员信息吗？', { btnAlign: 'c' }, async function (index) {
                        await Http.post(`admin/delete`, { id: obj.data.id })
                        layui.layer.msg(`删除成功`)
                        layui.layer.close(index);
                        layui.table.reloadData(`table`)
                    });
                    break
            }
        });
        layui.form.on('switch(table-data-status)', async (obj) => {
            let status = obj.elem.checked ? 0 : 1
            await Http.post(`admin/edit`, { id: obj.elem.id, status })
            layui.layer.msg(`状态修改成功`)
        });
    }

    showAddAdminLayer(data) {
        layui.layer.open({
            title: data ? `编辑账号` : `新建账号`
            , type: 1
            , content: addOrEditAdminForm
            , area: ['550px', '560px']
            , btn: ['确定', '取消']
            , resize: false
            , btnAlign: 'c'
            , success: async () => {
                // 加载小区
                await this.renderCommunity(`[lay-filter="addOrEditAdminForm"] [name='commId']`)
                if (data) {
                    delete data.pwd
                    layui.$(`[lay-filter="addOrEditAdminForm"] [name='pwd']`).removeAttr('lay-verify')
                }
                layui.form.val(`addOrEditAdminForm`, data)
                layui.form.render();
            }
            , yes: (index) => {
                layui.form.submit('addOrEditAdminForm', async (formCommitData) => {
                    formCommitData.field = { ...data, ...formCommitData.field }
                    if (formCommitData.field.pwd) {
                        formCommitData.field.pwd = MD5.hash(formCommitData.field.pwd);
                    }
                    if (formCommitData.field.id) {
                        await Http.post(`admin/edit`, formCommitData.field)
                    } else {
                        await Http.post(`admin/add`, formCommitData.field)
                    }
                    layui.table.reloadData(`table`)
                    layui.layer.close(index);
                });
            }
        })
    }

    async renderCommunity(el) {
        let communityRes = await Http.get(`community/page`, { limit: 0 }, false);
        let dom = communityRes.data?.map(x => `<option value="${ x.id }">${ x.name }</option>`).join("");
        layui.$(el).html(`<option value="">选择小区</option>` + dom)
        layui.form.render()
    }

}
