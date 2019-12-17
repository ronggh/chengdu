$(function () {
    form.render();
    messageManageFn.getList();
    messageManageFn.searchForm(); //开启搜索
    messageManageFn.ResetInbox() //开启重置
    laydate.render({
        elem: '#inboxTime',
        range: true,
        theme: '#389bff',
        change: function (value, date, endDate) {
            date_2 = value;
        },
        done: function (value, date, endDate) {
            date_2 = value;
        }
    });
    table.on('tool(manageTable)', function (obj) {
        var data = obj.data;
        if (obj.event === 'edit') {
            messageManageFn.seemessage(data);
        };
        if (obj.event === 'del') {
            messageManageFn.delmessage(data);
        }
    })
});
var messageManageFn = {
    pageLimit: rowCount, //设置本页面的一页显示多少条数据
    pageCurr: 1,
    rm_searchTitle: '',
    rm_searchName: '',
    startTime_search: '',
    endTime_search: '',
    msgType: 1,
    tableRender: function (res) { //表格渲染
        table.render({
            elem: '#manageTable',
            id: 'roleManageTable',
            cols: [
                [{
                    field: 'IsRead',
                    title: '',
                    align: 'center',
                    hide: true,
                    templet: function (d) {
                        return d.IsRead == "0" ? "" : "" //0是未读，1是已读
                    }
                }, {
                    field: 'SendTime',
                    title: '发送时间',
                    align: 'center',
                }, {
                    field: 'SenderName',
                    title: '发送人',
                    align: 'center',
                }, {
                    field: 'MsgName',
                    title: '标题',
                    align: 'center',
                    templet: function (d) {
                        return messageManageFn.fontW(d.IsRead, d.MsgName);
                    }
                }, {
                    field: 'MsgContent',
                    title: '内容',
                    align: 'center',
                }, {
                    title: '操作',
                    toolbar: '#manage_operate',
                    align: 'center',
                }]
            ],
            data: res.data,
            skin: 'line',
            even: '',
            limit: messageManageFn.pageLimit
        });
    },
    getList: function (rm_searchTitle, rm_searchName, startTime_search, endTime_search) { //获取列表
        var param = cloneObjectFn(paramList);
        param["title"] = rm_searchTitle || '';
        param["content"] = rm_searchName || '';
        param["start"] = startTime_search || '';
        param["end"] = endTime_search || '';
        if (param.title == '') {
            delete param.title;
        }
        if (param.content == '') {
            delete param.content;
        }
        if (param.name == '') {
            delete param.name;
        }
        if (param.start == '') {
            delete param.start;
        }
        if (param.end == '') {
            delete param.end;
        }
        param["pageSize"] = messageManageFn.pageLimit;
        param["pageIndex"] = messageManageFn.pageCurr;
        param["msgType"] = messageManageFn.msgType;
        AjaxRequest(param, "message", "getMsgListPage").then(function (res) {
            var messagRes = JSON.parse(res) //分页
            $.each(messagRes.data, function (index, item) {
                item.SendTime = item.SendTime.replace("T", " ");
                if (messageManageFn.msgType == 1) {

                }
            })
            laypage.render({
                elem: 'manage_pagenation',
                count: messagRes.page.totalData,
                limit: messageManageFn.pageLimit,
                curr: messageManageFn.pageCurr,
                layout: ['count', 'prev', 'page', 'next', 'skip'],
                jump: function (obj, first) {
                    if (!first) {
                        messageManageFn.pageCurr = obj.curr;
                        var param = cloneObjectFn(paramList);
                        param["pageSize"] = messageManageFn.pageLimit;
                        param["pageIndex"] = messageManageFn.pageCurr;
                        param["msgType"] = messageManageFn.msgType;
                        AjaxRequest(param, "message", "getMsgListPage").then(function (res) {
                            var messagRes = JSON.parse(res)
                            $.each(messagRes.data, function (index, item) {
                                item.SendTime = item.SendTime.replace("T", " ");
                            })
                            messageManageFn.tableRender(messagRes);
                        });
                    }
                }
            });
            messageManageFn.tableRender(messagRes);
        })
    },
    //消息有没有读
    fontW: function (start, title) {
        var str = "";
        if (start == 0) {
            str = str + '<i style = "font-weight: bolder">' + title + '</i>'
        }
        if (start == 1) {
            str = title
        }
        return str;
    },
    //查看消息
    seemessage: function (tableObj) {
        var add_manage_Tpl = document.getElementById('add_manage_popup').innerHTML;
        laytpl(add_manage_Tpl).render(tableObj, function (html) {
            layer.open({
                id: 'add_manage_pop',
                type: 1,
                content: html,
                title: ["消息管理", 'font-size:16px;height:46px;line-height:46px;'],
                area: ['520px', 'auto'],
                success: function (index, layero) {
                    var param = cloneObjectFn(paramList);
                    param["msgId"] = tableObj.MsgID;
                    AjaxRequest(param, "message", "setRead").then(function (res) {
                        var resule = JSON.parse(res);
                        if (resule.result.code == 200) {
                            // getMassageIsread()
                        }
                    })
                },
                end: function () {
                    messageManageFn.getList();
                }
            })
        })
    },
    //删除消息
    delmessage: function (tableObj) {
        var trLength; //删除时需要判断当前页是否只剩一个
        var del_roles_Tpl = document.getElementById('del_roles_popup').innerHTML;
        laytpl(del_roles_Tpl).render(tableObj, function (html) {
            layer.open({
                id: 'del_roles_pop',
                type: 1,
                content: html,
                title: ['删除', 'font-size:16px;height:46px;line-height:46px;'],
                area: ['450px', '200px'],
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    var param = cloneObjectFn(paramList);
                    param["msgId"] = tableObj.MsgID;
                    AjaxRequest(param, "message", "deleteMapping").then(function (res) {
                        var resule = JSON.parse(res);
                        if (resule.result.code == 200) {
                            layer.msg('删除成功');
                            layer.close(index);
                            if (trLength == 1) {
                                messageManageFn.pageCurr == 1 ? 1 : messageManageFn.pageCurr--;
                            }
                            messageManageFn.getList(messageManageFn.searchName, messageManageFn.searchVaild);
                        }
                    })
                },
                success: function () {
                    //赋值当前页面还剩几个tr
                    trLength = $('.layui-table>tbody>tr').length;
                }
            });
        });
    },
    searchForm: function () { //搜索条件
        form.on('submit(inbox_formSearch)', function (data) {
            messageManageFn.rm_searchTitle = data.field.rm_searchTitle; //标题
            messageManageFn.rm_searchName = data.field.rm_searchName //内容
            messageManageFn.startTime_search = data.field.timechName.slice(0, 10);
            messageManageFn.endTime_search = data.field.timechName.slice(13, 23);
            messageManageFn.pageCurr = 1;
            messageManageFn.getList(messageManageFn.rm_searchTitle, messageManageFn.rm_searchName, messageManageFn.startTime_search, messageManageFn.endTime_search);
        })
    },
    ResetInbox: function () { // 重置按钮
        form.on('submit(ResetBtn)', function () {
            $('input[name="rm_searchTitle"]').val('');
            $('input[name="rm_searchName"]').val('');
            $('input[name="timechName"]').val('');
            messageManageFn.getList();
        })
    }
}