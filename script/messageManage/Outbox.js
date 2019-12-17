$(function () {
    form.render();
    messageManageFn.getList();
    messageManageFn.searchForm(); //开启搜索
    messageManageFn.ResetOutbox(); //重置
    laydate.render({
        elem: '#outBoxTime',
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
    TreeData: [],
    userIDname: [],
    addmessageTip: '',
    messageArr: "",
    msgType: 0,
    tableRender: function (res) { //表格渲
        table.render({
            elem: '#manageTable',
            cols: [
                [ //标题栏
                    {
                        field: 'IsRead',
                        title: '',
                        align: 'center',
                        hide: true,
                        templet: function (d) {
                            return d.IsRead == "0" ? "" : ""; //"<img src='./src/images/xinx_01.png'></<img>":"<img src='./src/images/xinx_02.png'></<img>"
                        }
                    }, {
                        field: 'SendTime',
                        title: '发送时间',
                        align: 'center',
                    }, {
                        field: 'Receivers',
                        title: '接收人',
                        align: 'center',
                        templet: function (d) {
                            return messageManageFn.messagePeople(d)
                        }
                    }, {
                        field: 'MsgName',
                        title: '标题',
                        align: 'center',
                        templet: function (d) {
                            return d.MsgName;
                        }
                    }, {
                        field: 'MsgContent',
                        title: '内容',
                        align: 'center',
                    }, {
                        title: '操作',
                        toolbar: '#manage_operate',
                        align: 'center',
                    }
                ]
            ],
            data: res.data,
            skin: 'line',
            even: true,
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
            // console.log(res)
            var messagRes = JSON.parse(res);
            messageManageFn.messageArr = messagRes;
            $.each(messagRes.data, function (index, item) {
                item.SendTime = item.SendTime.replace("T", " ");
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
                            var messagRes = JSON.parse(res);
                            messageManageFn.messageArr = messagRes;
                            $.each(messagRes.data, function (index, item) {
                                item.SendTime = item.SendTime.replace("T", " ");
                            })
                            messageManageFn.tableRender(messagRes);
                        });
                    }
                }
            });
            messageManageFn.tableRender(messagRes);
        });
    },
    addmessage: function () { //创建消息弹窗
        var add_manage = document.getElementById('add_message').innerHTML;
        laytpl(add_manage).render({}, function (html) {
            messageManageFn.addmessageTip = layer.open({
                id: 'message_add_popup',
                type: 1,
                content: html,
                title: ["信息发送", 'font-size:16px;height:46px;line-height:46px;'],
                area: ['500px', 'auto'],
                success: function (index, layero) {
                    //获取机构和角色信息
                    var param = cloneObjectFn(paramList);
                    param["orgID"] = $("input[name = orgid]").val();
                    param["all"] = 1;
                    AjaxRequest(param, "user", "getList").then(function (res) {
                        var manageOrg = JSON.parse(res);
                        // 改造成需要的数据结构
                        var treeData = []
                        $.each(manageOrg.data, function (i, item) {
                            item.title = item.name;
                            treeData.push(item)
                        });
                        messageManageFn.TreeData = treeData;
                    })
                }
            })
        })
        //确认新增消息
        form.on('submit(submitAddUser)', function (data) {
            if (!one_Person.test(data.field.LoginName.trim())) {
                layer.msg("请输入2-20位英文、数字、汉字组合的消息标题", {
                    time: 1500
                });
                return false;
            }
            if (!one_twoName.test(data.field.mainText)) {
                layer.msg("请输入1-200位英文、数字、汉字组合的消息正文", {
                    time: 1500
                });
                return false;
            }
            var Disable = 'layui-btn-disabled';
            $(".site-action").addClass(Disable);
            $('.site-action').attr('disabled', 'disabled');
            var entityJson = {
                "Title": data.field.LoginName.trim(),
                "Content": data.field.mainText,
                "Receive": messageManageFn.userIDname.toString(),
            };
            var param = cloneObjectFn(paramList);
            param["entity"] = getUTF8(entityJson);
            // console.log(data);
            // console.log(entityJson);
            AjaxRequest(param, "message", "insert").then(function (res) {
                // console.log(res)
                var resule = JSON.parse(res);
                if (resule.result.code == 200) {
                    layer.close(messageManageFn.addmessageTip);
                    layer.msg("发送成功", {
                        time: 2000
                    });
                    messageManageFn.getList();
                }
            })
        });
    },
    changeUser: function () { //选择接收人
        var add_manageUser = document.getElementById('changeUserselect').innerHTML;
        laytpl(add_manageUser).render({}, function (html) {
            var UserselectOpen = layer.open({
                id: 'Userselect',
                type: 1,
                content: html,
                title: ["接收人", 'font-size:16px;height:46px;line-height:46px;'],
                area: ['240px', 'auto'],
                success: function (index, layero) {
                    tree.render({
                        elem: '#changeUserTree',
                        data: messageManageFn.TreeData //data
                            ,
                        showCheckbox: true //是否显示复选框
                            ,
                        id: 'demoId1',
                        oncheck: function (obj) {}
                    });
                    $("#quanxuan").on("click", function () {
                        if (messageManageFn.TreeData[0].checked == undefined) {
                            $("#quanxuan").addClass("layui-form-checked");
                            $.each(messageManageFn.TreeData, function (index, item) {
                                item.checked = true;
                            })
                            tree.render({
                                elem: '#changeUserTree',
                                data: messageManageFn.TreeData //data
                                    ,
                                showCheckbox: true //是否显示复选框
                                    ,
                                id: 'demoId1',
                                onclick: function (obj) {}
                            });
                        } else {
                            $("#quanxuan").removeClass("layui-form-checked")
                            $.each(messageManageFn.TreeData, function (index, item) {
                                delete item.checked;
                            })
                            tree.render({
                                elem: '#changeUserTree',
                                data: messageManageFn.TreeData //data
                                    ,
                                showCheckbox: true //是否显示复选框
                                    ,
                                id: 'demoId1',
                                onclick: function (obj) {}
                            });
                        }
                    })
                }
            })
            //接收人弹窗确认与取消
            $(".UserselectOpen").on("click", function () {
                if (tree.getChecked('demoId1').length == 0) {
                    layer.msg("请选择接收人", {
                        time: 2000
                    });
                } else {
                    messageManageFn.userIDname = [];
                    layer.close(UserselectOpen);
                    var name = [];
                    $.each(tree.getChecked('demoId1'), function (index, item) {
                        // console.log(tree.getChecked('demoId1'));
                        var IDname = [];
                        name.push(item.name)
                        IDname.push(item.id)
                        messageManageFn.userIDname.push(IDname);
                    })
                    $('input[name="Receiver"]').val(name.toString())
                }
            })
            $(".UserselectOpen1").on("click", function () {
                layer.close(UserselectOpen);
            })
        })
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
                success: function (index, layero) {},
            })
        })
    },
    //消息接收人
    messagePeople: function (d) {
        var ReceiverName = "";
        $.each(d.Receivers, function (index, item) {
            ReceiverName = ReceiverName + item.ReceiverName + '、'
        })
        return ReceiverName;
    },
    //删除
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
                    param["msgId"] = tableObj.ID;
                    AjaxRequest(param, "message", "delete").then(function (res) {
                        // console.log(res)
                        var resule = JSON.parse(res);
                        if (resule.result.code == "200") {
                            layer.msg('删除成功');
                            layer.close(index);
                            if (trLength == 1) {
                                messageManageFn.pageCurr == 1 ? 1 : messageManageFn.pageCurr--;
                            }
                            messageManageFn.getList(messageManageFn.searchName, messageManageFn.searchVaild);
                        }
                    });
                },
                success: function () {
                    //赋值当前页面还剩几个tr
                    trLength = $('.layui-table>tbody>tr').length;
                }
            });
        });
    },
    searchForm: function () { //搜索条件
        form.on('submit(outBox_formSearch)', function (data) {
            messageManageFn.rm_searchTitle = data.field.rm_searchTitle; //标题
            messageManageFn.rm_searchName = data.field.rm_searchName //内容
            messageManageFn.startTime_search = data.field.timechName.slice(0, 10);
            messageManageFn.endTime_search = data.field.timechName.slice(13, 23);
            messageManageFn.pageCurr = 1;
            messageManageFn.getList(messageManageFn.rm_searchTitle, messageManageFn.rm_searchName, messageManageFn.startTime_search, messageManageFn.endTime_search);
        })
    },
    ResetOutbox: function () { // 重置按钮
        form.on('submit(ResetBtn)', function () {
            $('input[name="rm_searchTitle"]').val('');
            $('input[name="rm_searchName"]').val('');
            $('input[name="timechName"]').val('');
            messageManageFn.getList();
        })
    }
}