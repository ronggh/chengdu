$(function () {
    initLayuifn(['element', 'form', 'table', 'layer', 'laytpl', 'laypage', 'laydate', 'upload', 'tree', 'util', 'transfer'], function () {
        form.render();
        organManageFn.getList() //  获取机构列表
        organManageFn.searchForm() //  查询
        organManageFn.ResetOutbox()
    });
});
var organManageFn = {
    pageLimit: rowCount, //设置本页面的一页显示多少条数据
    pageCurr: 1,
    orgname: "",
    address: "",
    legalperson: "",
    State: null,
    tableRender: function (res) { //表格渲染
        table.render({
            elem: '#organManageTable',
            id: 'organManageTable',
            cols: [
                [ //标题栏
                    {
                        type: 'numbers',
                        title: '序号'
                    }, {
                        field: 'OrgName',
                        title: '机构名称',
                        align: 'center'
                    }, {
                        field: 'OrgAddress',
                        title: '地址',
                        align: 'center',
                        templet: function (d) {
                            return d.OrgAddress == null ? '/' : d.OrgAddress;
                        }
                    }, {
                        field: 'LegalPerson',
                        title: '法人代表',
                        align: 'center',
                        templet: function (d) {
                            return d.LegalPerson == null ? '/' : d.LegalPerson;
                        }
                    }, {
                        field: 'RegisteredCapital',
                        title: '注册资金(万元)',
                        align: 'center',
                        templet: function (d) {
                            return d.RegisteredCapital == null ? '/' : d.RegisteredCapital;
                        }
                    }, {
                        field: 'OrgMobile',
                        title: '联系电话',
                        align: 'center',
                        templet: function (d) {
                            return d.OrgMobile == null ? '/' : d.OrgMobile;
                        }
                    }, {
                        field: 'FName',
                        title: '上级机构',
                        align: 'center',
                        templet: function (d) {
                            return d.FName == '——' ? '无上级机构' : d.FName;
                        }
                    }, {
                        field: 'IsValid',
                        title: '状态',
                        align: 'center',
                        templet: function (d) {
                            switch (d.IsValid) {
                                case 1:
                                    return '启用';
                                    break;
                                case 0:
                                    return '禁用';
                            }
                        }
                    }, {
                        title: '操作',
                        align: 'center',
                        width: 135,
                        toolbar: '#table_operate'
                    }
                ]
            ],
            skin: 'line',
            id: 'manageTable',
            data: res.data,
            even: true,
            limit: organManageFn.pageLimit
        });
    },
    getList: function (search_orgname, search_address, search_legalperson, search_State) { //获取列表数据-接口+分页
        var param = cloneObjectFn(paramList);
        param["name"] = search_orgname || "";
        param["address"] = search_address || "";
        param["legalperson"] = search_legalperson || "";
        param["status"] = search_State || null;
        param["pageSize"] = organManageFn.pageLimit;
        param["pageIndex"] = organManageFn.pageCurr;
        var postdata = GetPostData(param, "org", "getListPage");
        if (postdata.params.name == "") {
            delete postdata.params.name
        };
        if (postdata.params.address == "") {
            delete postdata.params.address
        };
        if (postdata.params.legalperson == "") {
            delete postdata.params.legalperson
        };
        if (postdata.params.status == null) {
            delete postdata.params.status
        };
        postFnajax(postdata).then(function (res) {
            // console.log("<<<<<<<<<<<<list>>>>>>>>>>>")
            // console.log(res);
            var res = JSON.parse(res)
            laypage.render({
                elem: 'og_pagenation',
                count: res.page.totalData,
                limit: organManageFn.pageLimit,
                curr: organManageFn.pageCurr,
                layout: ['count', 'prev', 'page', 'next', 'skip'],
                jump: function (obj, first) {
                    if (!first) {
                        organManageFn.pageCurr = obj.curr;
                        var param = cloneObjectFn(paramList);
                        param["pageSize"] = organManageFn.pageLimit;
                        param["pageIndex"] = organManageFn.pageCurr;
                        var postdata = GetPostData(param, "org", "getListPage");
                        postFnajax(postdata).then(function (res) {
                            var res = JSON.parse(res)
                            organManageFn.tableRender(res);
                        });
                    }
                }
            });
            organManageFn.tableRender(res);
        });
    },
    stateChangeFn: function (id, IsValid) { //修改功能状态
        var param = cloneObjectFn(paramList);
        var entityJson = {
            ID: id,
            IsValid: IsValid == 1 ? 0 : 1
        };
        param["entity"] = getUTF8(entityJson);
        var postdata = GetPostData(param, "org", "updateStatus");
        postFnajax(postdata).then(function (res) {
            var res = JSON.parse(res)
            if (res.result.code == 200) {
                layer.msg('修改成功');
                organManageFn.getList();
            }
        })
    },
    addOrgPop: function (opera_type) { //新增/编辑功能
        var title = opera_type == 'insert' ? '新增机构' : '编辑机构';
        var org_popup_tpl = document.getElementById('add_organ_popup').innerHTML;
        laytpl(org_popup_tpl).render({}, function (html) {
            layer.open({
                type: 1,
                content: html,
                title: [title, 'font-size:16px;height:46px;line-height:46px;'],
                area: ['500px', '600px'],
                success: function (index, layero) {
                    var tableObj;
                    if (opera_type == 'update') {
                        table.on('row(organManageTable)', function (obj) {
                            tableObj = obj.data;
                            if (tableObj.FName == "——") {
                                tableObj.FName = "不选择机构"
                            }
                            $('input[name="OrgId"]').val(tableObj.ID);
                            $('input[name="OrgName"]').val(tableObj.OrgName);
                            $('input[name="OrgAddress"]').val(tableObj.OrgAddress);
                            $('input[name="LegalPerson"]').val(tableObj.LegalPerson);
                            $('input[name="RegisteredCapital"]').val(tableObj.RegisteredCapital);
                            $('input[name="OrgMobile"]').val(tableObj.OrgMobile);
                            $('input[name="FatherId"]').val(tableObj.FID);
                            $('.popup_Org .value_ft').html(tableObj.FName).addClass('active');
                            $('select[name="IsValid"]>option[value="' + tableObj.IsValid + '"]').attr('selected', 'selected');
                        });
                    }
                    //先获取上面的数据
                    setTimeout(function () {
                        form.render();
                        //zTree配置
                        var settingOrg = {
                            data: {
                                simpleData: {
                                    enable: true
                                }
                            },
                            callback: {
                                onClick: onClickOrg,
                            }
                        };
                        var param = cloneObjectFn(paramList);
                        var postdata = GetPostData(param, "org", "getList");
                        postFnajax(postdata).then(function (res) {
                            var res = JSON.parse(res);
                            var zNodes = [{
                                id: $("input[name = orgid]").val(),
                                name: $("input[name = orgNameone]").val(),
                                open: true,
                                pId: ""
                            }];
                            res.data.forEach(function (item, index) {
                                var nodeT = {
                                    id: '',
                                    pId: '',
                                    name: "",
                                    open: true
                                };
                                nodeT.id = item.ID;
                                nodeT.name = item.OrgName;
                                nodeT.pId = item.FID;
                                if (opera_type == 'update') {
                                    if ($('input[name="ID"]').val() == item.ID) {
                                        showOrgName = item.OrgName;
                                        $('input[name="FID"]').val(item.FID);
                                    }
                                }
                                zNodes.push(nodeT);
                            });
                            $.fn.zTree.init($("#treeOrg"), settingOrg, zNodes);
                        });
                        //上级机构点击后的回调
                        function onClickOrg(e, treeId, treeNode) {
                            $('.popup_Org .value_ft').html(treeNode.name).addClass('active');
                            $('input[name="FatherId"]').val(treeNode.id);
                            $('#OrgBox').addClass('hidden');
                        }
                        $('.popup_Org .value_ft').on('click', function () {
                            showMenuOrg();
                        })

                        function showMenuOrg() {
                            $('#OrgBox').removeClass('hidden');
                            $("body").bind("mousedown", onBodyDownOrg);
                        }

                        function hideMenuOrg() {
                            $('#OrgBox').addClass('hidden');
                            $("body").unbind("mousedown", onBodyDownOrg);
                        }

                        function onBodyDownOrg(event) {
                            if (!(event.target.id == "OrgBox" || event.target.id == "treeOrg" || $(event.target).parents("#OrgBox").length > 0)) {
                                hideMenuOrg();
                            }
                        }
                    }, 0)
                    organManageFn.tijiao(opera_type)
                }
            })
        })
    },
    tijiao: function (opera_type) {
        //提交
        form.on('submit(submitAddOrg)', function (data) {
            // console.log(data)
            if (!two_fiveName.test(data.field.OrgName)) {
                layer.msg("请输入2-50位英文、数字、汉字组合的机构名称", {
                    time: 1500
                });
                return false;
            }
            if (!two_fiveName.test(data.field.OrgAddress)) {
                layer.msg("请输入2-50位英文、数字、汉字组合的地址", {
                    time: 1500
                });
                return false;
            }
            if (data.field.LegalPerson != "") {
                if (!one_Person.test(data.field.LegalPerson)) {
                    layer.msg("请输入2-20位英文、数字、汉字组合的法人", {
                        time: 1500
                    });
                    return false;
                }
            }
            if (data.field.RegisteredCapital != "") {
                if (!capitalNumbwe.test(data.field.RegisteredCapital)) {
                    layer.msg("请输入1-10位数字的注册资金", {
                        time: 1500
                    });
                    return false;
                }
            }
            var entityJson = {
                "OrgName": data.field.OrgName,
                "IsValid": data.field.IsValid,
                "FID": data.field.FatherId,
                "LegalPerson": data.field.LegalPerson,
                "OrgAddress": data.field.OrgAddress,
                "OrgMobile": data.field.OrgMobile,
                "RegisteredCapital": data.field.RegisteredCapital
            }
            if (opera_type == 'update') {
                entityJson.ID = data.field.OrgId;
                var param = cloneObjectFn(paramList);
                param["entity"] = getUTF8(entityJson);
                var postdata = GetPostData(param, "org", "update");
                postFnajax(postdata).then(function (res) {
                    var res = JSON.parse(res);
                    if (res) {
                        if (res.result.code == 200) {
                            layer.msg('编辑成功');
                            organManageFn.getList();
                            layer.closeAll()
                        } else {
                            layer.msg('编辑失败')
                        }
                    }
                });
            } else {
                if (data.field.FatherId == "") {
                    delete entityJson.FID;
                }
                var param = cloneObjectFn(paramList);
                param["entity"] = getUTF8(entityJson);
                var postdata = GetPostData(param, "org", "insert");
                postFnajax(postdata).then(function (res) {
                    var res = JSON.parse(res);
                    if (res.result.code == 200) {
                        layer.msg('操作成功', {
                            time: 1500
                        });
                        organManageFn.getList();
                        layer.closeAll();
                    } else {
                        layer.msg(res.result.msg, {
                            time: 1500
                        });
                    }
                })
            }
        })
    },
    delOrganPop: function (orgName, orgid) { //删除用户
        var trLength; //删除时需要判断当前页是否只剩一个
        var del_org_tpl = document.getElementById('del_org_popup').innerHTML;
        laytpl(del_org_tpl).render({
            orgName: orgName
        }, function (html) {
            layer.open({
                id: 'del_org_pop',
                type: 1,
                content: html,
                title: ['删除', 'font-size:16px;height:46px;line-height:46px;'],
                area: ['450px', '200px'],
                btn: ['确定', '取消'],
                btn2: function (index, layero) {},
                yes: function (index, layero) {
                    var entityJson = {
                        "ID": orgid
                    }
                    var param = cloneObjectFn(paramList);
                    param["entity"] = getUTF8(entityJson);
                    var postdata = GetPostData(param, "org", "delete");
                    postFnajax(postdata).then(function (res) {
                        var res = JSON.parse(res);
                        if (res.result.code == 200) {
                            layer.msg('删除成功');
                            layer.close(index);
                            if (trLength == 1) {
                                organManageFn.pageCurr == 1 ? 1 : organManageFn.pageCurr--;
                            }
                            organManageFn.getList();
                        } else if (res.result.code == 500) {
                            layer.close(index);
                            layer.msg(res.result.msg);
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
    //查询
    searchForm: function () {
        form.on('submit(org_formSearch)', function (data) {
            organManageFn.orgname = data.field.orgname;
            organManageFn.address = data.field.address;
            organManageFn.legalperson = data.field.legalperson;
            if (data.field.State == -1) {
                organManageFn.State = null;
            } else {
                organManageFn.State = data.field.State;
            }
            organManageFn.pageCurr = 1;
            organManageFn.getList(organManageFn.orgname, organManageFn.address, organManageFn.legalperson, organManageFn.State);
        })
    },
    // 重置
    ResetOutbox: function () {
        form.on('submit(ResetBtn)', function () {
            $('input[name="address"]').val('');
            $('input[name="legalperson"]').val('');
            $('input[name="orgname"]').val('');
            form.val("organManage_ser", {
                "State": -1
            })
            organManageFn.getList();
        })
    }
}