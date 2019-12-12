$(function () {
    TerminalFn.getTerminalList(); //获取列表数据
    TerminalFn.searchForm(); //开启搜索终端
    TerminalFn.ResetOutbox();
});
var TerminalFn = {
    pageLimit: rowCount, //设置本页面的一页显示多少条数据
    pageCurr: 1,
    searchName: '',
    tableRender: function (res) { //表格渲染
        //表格数据渲染
        table.render({
            elem: '#TerminalTable',
            cols: [
                [ //标题栏
                    {
                        type: 'numbers',
                        title: '序号',
                        width: '4%',
                        align: 'center'
                    }, {
                        field: 'TerminalNum',
                        title: '终端号',
                        width: '24%',
                        align: 'center'
                    }, {
                        field: 'TerminalName',
                        title: '终端名称',
                        width: '24%',
                        align: 'center'
                    }, {
                        field: 'CreateTime',
                        title: '创建日期',
                        width: '24%',
                        align: 'center',
                    }, {
                        title: '操作',
                        toolbar: '#table_Terminal',
                        align: 'center',
                        width: '24%',
                        templet: function (d) { }
                    }
                ]
            ],
            data: res.data,
            skin: 'line',
            even: true,
            limit: TerminalFn.pageLimit,
            id: 'TerminalTable'
        })
    },
    getTerminalList: function (searchNameNo) { //获取列表数据-接口+分页
        var param = cloneObjectFn(paramList);
        param["name"] = searchNameNo;
        param["pageSize"] = TerminalFn.pageLimit;
        param["pageIndex"] = TerminalFn.pageCurr;
        if (!searchNameNo) {
            delete param.name;
        }
        AjaxRequest(param, "terminal", "getTerminalListPage").then(function (result) {
            var res = JSON.parse(result)
            $.each(res.data, function (index, item) {
                item.CreateTime = item.CreateTime.replace("T", " ");
            })
            //分页
            laypage.render({
                elem: 'um_pagenation',
                count: res.page.totalData,
                limit: TerminalFn.pageLimit,
                curr: TerminalFn.pageCurr,
                layout: ['count', 'prev', 'page', 'next', 'skip'],
                jump: function (obj, first) {
                    if (!first) {
                        TerminalFn.pageCurr = obj.curr;
                        var param = cloneObjectFn(paramList);
                        param["pageSize"] = TerminalFn.pageLimit;
                        param["pageIndex"] = TerminalFn.pageCurr;
                        AjaxRequest(param, "terminal", "getTerminalListPage").then(function (res) {
                            var res = JSON.parse(res)
                            $.each(res.data, function (index, item) {
                                item.CreateTime = item.CreateTime.replace("T", " ");
                            })
                            TerminalFn.tableRender(res);
                        });
                    }
                }
            });
            TerminalFn.tableRender(res);
        })
    },
    addTerminal: function (opera_type) {
        var title = opera_type == "update" ? '编辑终端' : '新增终端';
        var fun_popup_tpl = document.getElementById('add_Terminal').innerHTML;
        laytpl(fun_popup_tpl).render({}, function (html) {
            layer.open({
                type: 1,
                content: html,
                title: [title, 'font-size:16px;height:46px;line-height:46px;'],
                area: ['500px', '300px'],
                success: function (index, layero) {
                    if (opera_type == 'update') {
                        table.on('row(TerminalTable)', function (obj) {
                            $('input[name="TerminaNo"]').val(obj.data.TerminalNum);
                            $('input[name="TerminaName"]').val(obj.data.TerminalName);
                            $('input[name="TerminalID"]').val(obj.data.ID);
                        })
                    }
                    setTimeout(function () {
                        if (opera_type == 'insert') { //新增
                            TerminalFn.submitPopup('insert');
                        } else { //编辑
                            TerminalFn.submitPopup('update')
                        }
                    }, 0)
                }
            })
        })
    },
    submitPopup: function (opera_type) { //提交/编辑弹窗
        //监听提交
        form.on('submit(submitTerminal)', function (data) {
            // console.log(data)
            if (!zD_tenName.test(data.field.TerminaName.trim())) {
                layer.msg("请输入1-30位英文、数字、下划线组合的终端名称", {
                    time: 1500
                });
                return false;
            }
            if (!zD_tenName.test(data.field.TerminaNo.trim())) {
                layer.msg("请输入1-30位英文、数字、下划线组合的终端号", {
                    time: 1500
                });
                return false;
            }
            var param = cloneObjectFn(paramList);
            var entity = {
                "ID": guid(),
                "TerminalName": data.field.TerminaName.trim(),
                "TerminalNum": data.field.TerminaNo.trim(),
            }
            if (opera_type == "insert") {
                entity.ID = guid();
            };
            if (opera_type == "update") {
                entity.ID = data.field.TerminalID;
            };
            param["entity"] = getUTF8(entity);
            AjaxRequest(param, "terminal", opera_type).then(function (result) {
                var res = JSON.parse(result);
                if (res.result.code == 200) {
                    layer.closeAll();
                    TerminalFn.getTerminalList();
                    layer.msg('操作成功', {
                        time: 2000
                    });
                } else {
                    layer.msg(res.result.msg, {
                        time: 2000
                    });
                }
            })
        })
    },
    //删除终端
    delTerminal: function (TerminalName, TerminalID) {
        var del_user_Tpl = document.getElementById('del_Terminal_popup').innerHTML;
        laytpl(del_user_Tpl).render({
            TerminalName: TerminalName
        }, function (html) {
            layer.open({
                type: 1,
                content: html,
                title: ['删除', 'font-size:16px;height:46px;line-height:46px;'],
                area: ['450px', '200px'],
                btn: ['确定', '取消'],
                btn2: function (index, layero) { },
                yes: function (index, layero) {
                    var param = cloneObjectFn(paramList);
                    param["terminalId"] = TerminalID;
                    AjaxRequest(param, "terminal", "delete").then(function (result) {
                        var res = JSON.parse(result);
                        if (res.result.code == 200) {
                            layer.closeAll();
                            TerminalFn.getTerminalList();
                            layer.msg('删除成功', {
                                time: 2000
                            });
                        } else {
                            layer.msg('删除失败', {
                                time: 2000
                            });
                        }
                    })
                }
            })
        })
    },
    searchForm: function () { //搜索条件
        form.on('submit(Terminal_formSearch)', function (data) {
            TerminalFn.pageCurr = 1;
            TerminalFn.getTerminalList(data.field.device_searchName);
        })
    },
    // 重置
    ResetOutbox: function () { // 重置按钮
        form.on('submit(ResetBtn)', function () {
            $('input[name="device_searchName"]').val('');
            TerminalFn.pageCurr = 1;
            TerminalFn.getTerminalList();
        })
    },
}