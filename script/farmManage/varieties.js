$(function () {
    form.render();
    varieties.getList("", ""); //品种的搜索
    varieties.categorySearch();
    varieties.ResetOutbox();
});
var varieties = {
    pageLimit: rowCount, //设置本页面的一页显示多少条数据
    pageCurr: 1,
    params: decodeURIComponent(atob((location.href).split("&id=")[1])),
    tableRender: function (res) { //表格渲染
        //表格数据渲染
        table.render({
            elem: '#manageTable',
            cols: [
                [ //标题栏
                    {
                        type: 'numbers',
                        title: '序号',
                        align: 'center'
                    }, {
                        field: 'CropName',
                        title: '品种',
                        align: 'center'
                    }, {
                        field: 'Status',
                        title: '状态',
                        align: 'center',
                        templet: function (d) {
                            if (d.Status == 1) {
                                return '启用'
                            } else {
                                return '禁用'
                            }
                        }
                    }, {
                        title: '操作',
                        width: 200,
                        align: 'center',
                        toolbar: '#table_operate'
                    }
                ]
            ],
            data: res.data,
            skin: 'line',
            even: true,
            limit: varieties.pageLimit,
            id: 'manageTable'
        })
    },
    // 获取品种列表
    getList: function (searchName, searchVaild) { //获取列表数据-接口+分页
        var param = cloneObjectFn(paramList);
        param["name"] = searchName || '';
        param["category"] = varieties.params;
        param["status"] = searchVaild || "";
        param["pageSize"] = varieties.pageLimit;
        param["pageIndex"] = varieties.pageCurr;
        AjaxRequest(param, "crop", "getCropListPage").then(function (res) {
            var res = JSON.parse(res);
            //分页
            laypage.render({
                elem: 'um_pagenation',
                count: res.page.totalData,
                limit: varieties.pageLimit,
                curr: varieties.pageCurr,
                layout: ['count', 'prev', 'page', 'next', 'skip'],
                jump: function (obj, first) {
                    if (!first) {
                        varieties.pageCurr = obj.curr;
                        var param = cloneObjectFn(paramList);
                        param["name"] = searchName || '';
                        param["category"] = varieties.params;
                        param["status"] = searchVaild || "";
                        param["pageSize"] = varieties.pageLimit;
                        param["pageIndex"] = varieties.pageCurr;
                        AjaxRequest(param, "crop", "getCropListPage").then(function (res) {
                            var res = JSON.parse(res);
                            varieties.tableRender(res);
                        });
                    }
                }
            });
            varieties.tableRender(res);
        });
    },
    //新增或编辑品种
    addcategoryPop: function (opera_type) {
        var title = opera_type == "update" ? '编辑品种' : '新增品种';
        var add_user_Tpl = document.getElementById('add_category').innerHTML;
        laytpl(add_user_Tpl).render({}, function (html) {
            layer.open({
                type: 1,
                content: html,
                title: [title, 'font-size:16px;height:46px;line-height:46px;'],
                area: ['530px', '300px'],
                success: function (index, layero) {
                    if (opera_type == 'update') {
                        table.on('row(manageTable)', function (obj) {
                            tableObj = obj.data;
                            $('input[name="CropName"]').val(tableObj.CropName);
                            $('input[name="CropID"]').val(tableObj.CropID);
                            $('input[name="OrgID"]').val(tableObj.OrgID);
                        })
                    }
                    setTimeout(function () {
                        if (opera_type == 'insert') { //新增
                            varieties.submitPopup('insert');
                        } else { //编辑
                            varieties.submitPopup('update')
                        }
                    }, 0)
                    form.render();
                }
            });
        });
    },
    submitPopup: function (opera_type) { //提交/编辑弹窗
        //监听提交
        form.on('submit(submitAddcategory)', function (data) {
            if (!one_tenName.test(data.field.CropName)) {
                layer.msg("请输入1-30位英文、数字、汉字组合的品种名称", {
                    time: 1500
                });
                return false;
            }
            var entityJson = {
                "CropName": data.field.CropName,
                "CropCategory": varieties.params,
                "Status": data.field.IsValid,
                "Lands": []
            };
            if (opera_type == 'update') {
                entityJson.CropID = data.field.CropID;
            }
            if (opera_type == 'insert') {
                entityJson.CropID = guid();
            }
            var param = cloneObjectFn(paramList);
            param["entity"] = getUTF8(entityJson);
            AjaxRequest(param, "crop", opera_type).then(function (res) {
                var res = JSON.parse(res)
                if (res.result.code == 200) {
                    layer.closeAll();
                    varieties.getList(varieties.name_category, varieties.id_category);
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
    //状态管理
    stateChangeFn: function (ID, Status) {
        var param = cloneObjectFn(paramList);
        param["cropId"] = ID;
        param["status"] = Status == 1 ? 0 : 1;
        AjaxRequest(param, "crop", "setStatus").then(function (res) {
            var res = JSON.parse(res)
            if (res.result.code == 200) {
                layer.msg('修改成功', {
                    time: 1000
                }, function () {
                    varieties.getList();
                });
            } else {
                layer.msg("修改失败", {
                    time: 2000
                });
            }
        })
    },
    //删除品种
    delcropPop: function (Crop, CropID) {
        var del_user_Tpl = document.getElementById('del_category_popup').innerHTML;
        laytpl(del_user_Tpl).render({
            CropName: Crop
        }, function (html) {
            layer.open({
                type: 1,
                content: html,
                title: ['删除', 'font-size:16px;height:46px;line-height:46px;'],
                area: ['450px', '200px'],
                btn: ['确定', '取消'],
                btn2: function (index, layero) {},
                yes: function (index, layero) {
                    var param = cloneObjectFn(paramList);
                    param["cropId"] = CropID;
                    AjaxRequest(param, "crop", "delete").then(function (res) {
                        var res = JSON.parse(res)
                        if (res.result.code == 200) {
                            layer.closeAll();
                            varieties.getList();
                            layer.msg('删除成功', {
                                time: 2000
                            });
                        } else {
                            layer.msg('删除失败', {
                                time: 2000
                            });
                        }
                    })
                },
            });
        });
    },
    // // 品种的搜索
    categorySearch: function () { //搜索条件
        form.on('submit(um_formSearch)', function (data) {
            // console.log(data)
            varieties.pageCurr = 1;
            varieties.getList(data.field.um_searchName, data.field.um_searchState); //获取品类列表
        })
    },
    // 重置
    ResetOutbox: function () { // 重置按钮
        form.on('submit(ResetBtn)', function () {
            $('input[name="um_searchName"]').val('');
            form.val("category_na", {
                "um_searchState": -1
            })
            varieties.pageCurr = 1;
            varieties.getList();
        })
    },
}