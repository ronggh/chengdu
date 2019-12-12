$(function () {
    form.render();
    categoryFn.categoryGetList();
    categoryFn.categorySearch(); 
    categoryFn.ResetOutbox();

});
var categoryFn = {
    pageLimit: rowCount, //设置本页面的一页显示多少条数据
    pageCurr: 1,
    category_Tip: "",
    // 类别部分
    categoryTable: function (res) {
        _index = 0;
        table.render({
            elem: '#categoryTable',
            cols: [
                [ //标题栏
                    {
                        type: 'numbers',
                        title: '序号',
                        align: 'center',
                        width:"4%",
                    }, {
                        field: 'CategoryName',
                        title: '类别',
                        align: 'center',
                        width:"38%",
                    }, {
                        field: 'IsValid',
                        title: '状态',
                        align: 'center',
                        width:"38%",
                        templet: function (d) {
                            if (d.IsValid == 1) {
                                return '启用'
                            } else {
                                return '禁用'
                            }
                        }
                    }, {
                        title: '操作',
                        width:"20%",
                        align: 'center',
                        toolbar: '#table_category'
                    }
                ]
            ],
            data: res.data,
            skin: 'line',
            even: true,
            limit: categoryFn.pageLimit,
            id: 'categoryTable'
        })
    },
    categoryGetList: function (name, status) {
        var param = cloneObjectFn(paramList);
        param["pageSize"] = categoryFn.pageLimit;
        param["pageIndex"] = categoryFn.pageCurr;
        if (name) {
            param["name"] = name;
        }
        if (status == 0 || status == 1) {
            param["status"] = status;
        }
        AjaxRequest(param, "CropCategory", "getListPage").then(function (res) {
            // console.log(JSON.stringify(param));
            // console.log(res);
            var result = JSON.parse(res);
            laypage.render({
                elem: 'category_pagenation',
                count: result.page.totalData,
                limit: categoryFn.pageLimit,
                curr: categoryFn.pageCurr,
                layout: ['count', 'prev', 'page', 'next', 'skip'],
                jump: function (obj, first) {
                    if (!first) {
                        categoryFn.pageCurr = obj.curr;
                        var param = cloneObjectFn(paramList);
                        param["pageSize"] = categoryFn.pageLimit;
                        param["pageIndex"] = categoryFn.pageCurr;
                        AjaxRequest(param, "CropCategory", "getListPage").then(function (res) {
                            var result = JSON.parse(res);
                            categoryFn.categoryTable(result);
                        });
                    }
                }
            });
            categoryFn.categoryTable(result);
        })
    },
    //新增、编辑具体类别
    AddcategoryFn: function (typeIU, id, IsValid, name) {
        var add_user_Tpl = document.getElementById('category_name').innerHTML;
        laytpl(add_user_Tpl).render({}, function (html) {
            categoryFn.category_Tip = layer.open({
                type: 1,
                content: html,
                title: [typeIU == "insert" ? "新增类别" : "编辑类别", 'font-size:16px;height:46px;line-height:46px;'],
                area: ['500px', '270px'],
                success: function (index, layero) {
                    if (typeIU == "update") {
                        $('input[name="category_name"]').val(name)
                        if (IsValid == 1) {
                            var category_data = '<option value="1">启用</option>' + '<option value="0">禁用</option>'
                        } else {
                            var category_data = '<option value="0">禁用</option>' + '<option value="1">启用</option>'
                        }
                        $('#category_IsValid').html(category_data);
                        form.render('select');
                    } else {
                        form.render('select');
                    }
                    form.on('submit(Addcategory)', function (data) {
                        if (!one_tenName.test(data.field.category_name.trim())) {
                            layer.msg("请输入1-30位英文、数字、汉字组合的类别名称", {
                                time: 1500
                            });
                            return false;
                        }
                        var entityJson = {
                            "CategoryName": data.field.category_name.trim(),
                            "IsValid": data.field.IsValid,
                        };
                        if (typeIU == "update") {
                            entityJson.ID = id;
                        }
                        var param = cloneObjectFn(paramList);
                        param["entity"] = getUTF8(entityJson);
                        AjaxRequest(param, "CropCategory", typeIU).then(function (res) {
                            // console.log(JSON.stringify(entityJson));
                            // console.log(JSON.stringify(param));
                            // console.log(res);
                            var resul = JSON.parse(res);
                            if (resul.result.code == 200) {
                                layer.msg("操作成功", {
                                    time: 1000
                                }, function () {
                                    layer.close(categoryFn.category_Tip);
                                    categoryFn.pageCurr = 1;
                                    categoryFn.categoryGetList(); //获取品类列表
                                })
                            } else {
                                layer.msg(resul.result.msg, {
                                    time: 1500
                                })
                            }
                        })
                    })
                },
            })
        })
    },
    //类别的禁用启用 
    categoryState: function (id, IsValid) {
        var param = cloneObjectFn(paramList);
        entityJson = {
            "ID": id,
            "IsValid": IsValid == "1" ? "0" : "1",
        };
        param["entity"] = getUTF8(entityJson);
        AjaxRequest(param, "CropCategory", "updateStatus").then(function (res) {
            var result = JSON.parse(res);
            if (result.result.code == 200) {
                layer.msg("状态修改成功", {
                    time: 1000
                }, function () {
                    categoryFn.categoryGetList(); //获取品类列表
                })
            } else {
                layer.msg(result.result.msg, {
                    time: 1500
                })
            }
        })
    },
    //删除类别
    delcategoryPop: function (name, id) { //删除用户
        var del_user_Tpl = document.getElementById('delete_category').innerHTML;
        laytpl(del_user_Tpl).render({
            CategoryName: name
        }, function (html) {
            deleopen = layer.open({
                type: 1,
                content: html,
                title: ['删除类别', 'font-size:16px;height:46px;line-height:46px;'],
                area: ['450px', '200px'],
                btn: ['确定', '取消'],
                btn2: function (index, layero) {},
                yes: function (index, layero) {
                    var param = cloneObjectFn(paramList);
                    param["id"] = id;
                    AjaxRequest(param, "CropCategory", "delete").then(function (res) {
                        // console.log(param);
                        // console.log(res);
                        var result = JSON.parse(res);
                        if (result.result.code == 200) {
                            layer.msg("删除成功", {
                                time: 1000
                            }, function () {
                                layer.close(deleopen);
                                categoryFn.pageCurr = 1;
                                categoryFn.categoryGetList(); //获取品类列表
                            })
                        } else {
                            layer.msg(result.result.msg, {
                                time: 1500
                            })
                        }
                    })
                }
            });
        });
    },
    // 类别的搜索
    categorySearch: function () { //搜索条件
        form.on('submit(category_formSearch)', function (data) {
            categoryFn.pageCurr = 1;
            categoryFn.categoryGetList(data.field.category_searchName, data.field.um_searchState); //获取品类列表
        })
    },
    // 重置
    ResetOutbox: function () { // 重置按钮
        form.on('submit(ResetBtn)', function () {
            $('input[name="category_searchName"]').val('');
            form.val("category_look", {
                "um_searchState": -1
            })
            categoryFn.pageCurr = 1;
            categoryFn.categoryGetList();
        })
    },
}