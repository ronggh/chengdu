$(function () {
    initLayuifn(['element', 'form', 'table', 'layer', 'laytpl', 'laypage', 'laydate', 'upload', 'tree', 'util', 'transfer'], function () {
        form.render();
    })
    rolesmanageFn.getList();
    rolesmanageFn.searchForm(); //开启搜索
    rolesmanageFn.ResetOutbox();
});
var rolesmanageFn = {
    pageLimit: rowCount, //设置本页面的一页显示多少条数据
    pageCurr: 1,
    searchName: '',
    searchVaild: null,
    powerResult: [], //新增或编辑时传给接口的Tree的数组
    arrSelectMDom: {
        values: []
    },
    UpdataRoleID: '',
    tableRender: function (res) { //表格渲染
        table.render({
            elem: '#roleManageTable',
            id: 'roleManageTable',
            cols: [
                [ //标题栏
                    {
                        type: "numbers",
                        title: '序号',
                        align: 'center'
                    }, {
                        field: 'RoleName',
                        title: '角色名称',
                        align: 'center'
                    }, {
                        field: 'Remark',
                        title: '说明',
                        align: 'center'
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
                                    break;
                            }
                        }
                    }, {
                        title: '用户',
                        toolbar: '#user_name',
                        align: 'center'
                    }, {
                        title: '可用功能',
                        toolbar: '#table_check',
                        align: 'center'
                    }, {
                        field: 'OrgName',
                        title: '所属机构',
                        align: 'center'
                    }, {
                        title: '操作',
                        toolbar: '#table_operate',
                        align: 'center'
                    }
                ]
            ],
            data: res.data,
            skin: 'line',
            even: true,
            limit: rolesmanageFn.pageLimit
        });
    },
    getList: function (searchName, searchVaild) { //获取列表
        var param = cloneObjectFn(paramList);
        param["name"] = searchName || '';
        param["status"] = searchVaild || null;
        param["pageSize"] = rolesmanageFn.pageLimit;
        param["pageIndex"] = rolesmanageFn.pageCurr;

        if (param.name == '') {
            delete param.name;
        }
        if (param.status == null) {
            delete param.status;
        }
        var postdata = GetPostData(param, "role", "getListPage");
        postFnajax(postdata).then(function (res) {
            var res = JSON.parse(res) //分页
            laypage.render({
                elem: 'rm_pagenation',
                count: res.page.totalData,
                limit: rolesmanageFn.pageLimit,
                curr: rolesmanageFn.pageCurr,
                layout: ['count', 'prev', 'page', 'next', 'skip'],
                jump: function (obj, first) {
                    if (!first) {
                        rolesmanageFn.pageCurr = obj.curr;
                        var param = cloneObjectFn(paramList);
                        param["pageSize"] = rolesmanageFn.pageLimit;
                        param["pageIndex"] = rolesmanageFn.pageCurr;
                        var postdata = GetPostData(param, "role", "getListPage");
                        postFnajax(postdata).then(function (res) {
                            var res = JSON.parse(res)
                            rolesmanageFn.tableRender(res);
                        });
                    }
                }
            });
            rolesmanageFn.tableRender(res);
        });
    },
    delRolePop: function (rName, rId) { //删除角色
        var trLength; //删除时需要判断当前页是否只剩一个
        var del_roles_Tpl = document.getElementById('del_roles_popup').innerHTML;
        laytpl(del_roles_Tpl).render({
            rolename: rName
        }, function (html) {
            layer.open({
                id: 'del_roles_pop',
                type: 1,
                content: html,
                title: ['删除', 'font-size:16px;height:46px;line-height:46px;'],
                area: ['450px', '200px'],
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    var entityJson = {
                        RoleID: rId
                    }
                    var param = cloneObjectFn(paramList);
                    param["entity"] = getUTF8(entityJson);
                    var postdata = GetPostData(param, "role", "delete");
                    postFnajax(postdata).then(function (res) {
                        layer.msg('删除成功');
                        layer.close(index);
                        if (trLength == 1) {
                            rolesmanageFn.pageCurr == 1 ? 1 : rolesmanageFn.pageCurr--;
                        }
                        rolesmanageFn.getList(rolesmanageFn.searchName, rolesmanageFn.searchVaild);
                    });
                },
                success: function () {
                    //赋值当前页面还剩几个tr
                    trLength = $('.layui-table>tbody>tr').length;
                }
            });
        });
    },
    stateChangeFn: function (id, IsValid) { //修改用户状态
        var param = cloneObjectFn(paramList);
        var entityJson = {
            RoleID: id,
            IsValid: IsValid == 1 ? 0 : 1
        };
        param["entity"] = getUTF8(entityJson);
        var postdata = GetPostData(param, "role", "updateStatus");
        postFnajax(postdata).then(function (res) {
            var res = JSON.parse(res)
            if (res.result.code == 200) {
                layer.msg('修改成功');
                rolesmanageFn.getList(rolesmanageFn.searchName, rolesmanageFn.searchVaild);
            }
        })
    },
    searchForm: function () { //搜索条件
        form.on('submit(rm_formSearch)', function (data) {
            rolesmanageFn.searchName = data.field.rm_searchName; //赋值全局变量
            rolesmanageFn.pageCurr = 1;
            if (data.field.rm_searchState == -1) {
                rolesmanageFn.searchVaild = null; //显示所有状态
                rolesmanageFn.getList(rolesmanageFn.searchName);
            } else {
                rolesmanageFn.searchVaild = data.field.rm_searchState;
                rolesmanageFn.getList(rolesmanageFn.searchName, rolesmanageFn.searchVaild);
            }
        })
    },
    addRolePop: function (opera_type) {
        var This = this;
        if (opera_type == 'update') {
            var title = '编辑角色';
        } else {
            var title = '新增角色'
        }
        setTimeout(function () {
            form.render(); //zTree配置
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
                // for (let i = 0; i < res.data.length; i++) {     //控制编辑中的上级机构
                //     if(res.data[i].OrgName == $("#organtree").html()){
                //         $('input[name="FID"]').val(res.data[i].ID)
                //     }
                // }
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
                    zNodes.push(nodeT);
                });
                $.fn.zTree.init($("#treeOrg"), settingOrg, zNodes);
            });
            //上级机构点击后的回调
            function onClickOrg(e, treeId, treeNode) {
                $('.popup_Org .value_ft').html(treeNode.name).addClass('active');
                $('input[name="FID"]').val(treeNode.id);
                $('#OrgBox').addClass('hidden');
                $("#orgeUserT").remove();
                $("#orgeUser").append('<div class="layui-input-block" id="orgeUserT"></div>');
                if (opera_type == 'update') {
                    var param = cloneObjectFn(paramList);
                    param["orgID"] = treeNode.id;
                    param["roleID"] = rolesmanageFn.UpdataRoleID;
                    var postdata = GetPostData(param, "user", "getList");
                    postFnajax(postdata).then(function (res) {
                        var res = JSON.parse(res);
                        if (param.orgID == "") {
                            var selectInit = [];
                            selectM({
                                elem: '#orgeUserT',
                                data: selectInit,
                                max: selectInit.length,
                                width: '100%',
                                titName: 'RoleName',
                                idTit: 'RoleID'
                            });
                            $("#orgeUserT .tips").html("请选择所属机构");
                            form.render();
                        } else {
                            selectM({
                                elem: '#orgeUserT',
                                data: res.data,
                                max: res.data.length,
                                width: '100%',
                                titName: 'name',
                                idTit: 'id'
                            });
                            $("#orgeUserT .tips").html("请选择用户角色")
                            form.render();
                        }
                    })
                }
                if (opera_type == 'insert') {
                    var param = cloneObjectFn(paramList);
                    param["orgID"] = treeNode.id;
                    var postdata = GetPostData(param, "user", "getList");
                    postFnajax(postdata).then(function (res) {
                        var res = JSON.parse(res);
                        if (param.orgID == "") {
                            var selectInit = [];
                            selectM({
                                elem: '#orgeUserT',
                                data: selectInit,
                                max: selectInit.length,
                                width: '100%',
                                titName: 'RoleName',
                                idTit: 'RoleID'
                            });
                            $("#orgeUserT .tips").html("请选择所属机构");
                            form.render();
                        } else {
                            selectM({
                                elem: '#orgeUserT',
                                data: res.data,
                                max: res.data.length,
                                width: '100%',
                                titName: 'name',
                                idTit: 'id'
                            });
                            $("#orgeUserT .tips").html("请选择用户角色")
                            form.render();
                        }
                    })
                }
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
            if (opera_type == "insert") {
                var selectInit = [];
                selectM({
                    elem: '#orgeUserT',
                    data: selectInit,
                    max: selectInit.length,
                    width: '100%',
                    titName: 'RoleName',
                    idTit: 'RoleID'
                });
                $("#orgeUserT .tips").html("请选择所属机构");
                form.render();
            }
            setTimeout(function () {
                if (opera_type == 'insert') { //新增
                    rolesmanageFn.submitPopup('insert');
                } else { //编辑
                    rolesmanageFn.submitPopup('update')
                }
            }, 0)
        }, 0)
        if (opera_type == 'update') {
            table.on('row(roleManageTable)', function (obj) { //编辑时回显数据   //Remark角色说明
                var rowObj = obj.data;
                rolesmanageFn.UpdataRoleID = rowObj.RoleID;
                title = '编辑角色';
                $('input[name="RoleName"]').val(rowObj.RoleName);
                $('select[name="IsValid"]>option[value="' + rowObj.IsValid + '"]').attr('selected', 'selected');
                $('input[name="RoleID"]').val(rowObj.RoleID);
                $("#organtree").html(rowObj.OrgName);
                $('.popup_Org .value_ft').html(rowObj.OrgName).addClass('active');
                $('#tarea').val(rowObj.Remark);
                form.render();
                var param = cloneObjectFn(paramList);
                param["roleID"] = rowObj.RoleID;
                var postdata = GetPostData(param, "role", "getRoleInfo");
                postFnajax(postdata).then(function (res) {
                    var res = JSON.parse(res);
                    $('input[name="FID"]').val(res.data.OrgID)
                    rolesmanageFn.arrSelectMDom = selectM({
                        elem: '#orgeUserT',
                        data: res.data.UserList,
                        max: res.data.UserList.length,
                        width: '100%',
                        titName: 'name',
                        idTit: 'id'
                    });
                    setTimeout(function () {
                        form.render();
                        if (opera_type == 'update') {
                            var arr = [];
                            $.each(res.data.UserList, function (indes, item) {
                                if (item.checked) {
                                    arr.push(item.id);
                                }
                            })
                            rolesmanageFn.arrSelectMDom.set(arr);
                        }
                    }, 0)
                    rolesmanageFn.initPowertree(res.data, 'powertree', true);
                });
            });
        }
        var add_roles_Tpl = document.getElementById('add_roles_popup').innerHTML;
        laytpl(add_roles_Tpl).render({}, function (html) {
            layer.open({
                id: 'add_role_pop',
                type: 1,
                content: html,
                title: [title, 'font-size:16px;height:46px;line-height:46px;'],
                area: ['500px', '550px'],
                success: function (index, layero) {
                    form.render();
                    var param = cloneObjectFn(paramList);
                    var postdata = GetPostData(param, "function", "getListPage");
                    postFnajax(postdata).then(function (res) {
                        var res = JSON.parse(res);
                        if (res.result.code == 200) {
                            This.initorgantree(res.data, 'powertree', true);
                        }
                    });
                    setTimeout(function () {
                        if (opera_type == 'insert') { //新增
                            This.submitPopup('insert');
                        } else { //编辑
                            This.submitPopup('update')
                        }
                    }, 0)
                }
            });
        });
    },
    //编辑功能权限DOM树
    initPowertree: function (resdata, dom, stateT) { // 选择权限树   源数据，dom数，是否是编辑状态true/false
        var This = this;
        for (var i = 0; i < resdata.FuncList.length; i++) {
            if (resdata.FuncList[i].checked == true) {
                This.powerResult.push({
                    ID: resdata.FuncList[i].id
                }) //功能权限不修改时保存功能权限的list
            }
        }
        var treelist = resdata.FuncList;
        var setting = {
            check: {
                enable: true
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            view: {
                showIcon: false,
                txtSelectedEnable: true,
                selectedMulti: false,
                curSelectedNode: false
            },
            callback: {
                onCheck: function (event, treeId, treeNode) {
                    var nodes = treeObj.getCheckedNodes(true);
                    This.powerResult.length = 0;
                    for (var j = 0; j < nodes.length; j++) {
                        This.powerResult.push({
                            ID: nodes[j].id
                        })
                    }
                }
            }
        };
        var treeObj = $.fn.zTree.init($("#" + dom + ""), setting, treelist);
        return treeObj;
    },
    //新增角色的功能权限DOM树
    initorgantree: function (resdata, dom, stateT) { // 选择权限树   源数据，dom数，是否是编辑状态true/false
        var This = this;
        var treelist = [];
        This.powerResult.length = 0;
        for (var i = 0; i < resdata.length; i++) {
            var item = {
                id: '',
                pId: '',
                name: "",
                open: true
            };
            item.id = resdata[i]['FuncID'];
            item.pId = resdata[i]['FID'];
            item.name = resdata[i]['FuncName'];
            if (stateT) {
                if (resdata[i]['IsChicked']) { //被选中
                    item.checked = true;
                    This.powerResult.push({
                        FuncID: item.id
                    })
                }
            }
            treelist.push(item);
        }
        var setting = {
            check: {
                enable: true
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            view: {
                showIcon: false,
                txtSelectedEnable: true,
                selectedMulti: false,
                curSelectedNode: false
            },
            callback: {
                onCheck: function (event, treeId, treeNode) {
                    var nodes = treeObj.getCheckedNodes(true);
                    This.powerResult.length = 0;
                    for (var j = 0; j < nodes.length; j++) {
                        This.powerResult.push({
                            ID: nodes[j].id
                        })
                    }
                }
            }
        };
        var treeObj = $.fn.zTree.init($("#" + dom + ""), setting, treelist);
        return treeObj;
    },
    submitPopup: function (opera_type) { //提交/编辑弹窗
        //监听提交
        form.on('submit(submitAddRole)', function (data) {
            var UserList = [];
            if (data.field.orgeUserT != "") {
                var arrUser = data.field.orgeUserT.split(",")
                $.each(arrUser, function (index, item) {
                    UserList.push({
                        "ID": item
                    });
                })
            }
            if (rolesmanageFn.powerResult.length == 0 && opera_type == 'insert') {
                layer.msg('请选择功能权限');
                return false;
            }
            var entityJson;
            if (opera_type == 'update') {
                entityJson = {
                    "RoleName": data.field.RoleName,
                    "IsValid": data.field.IsValid,
                    "FuncList": rolesmanageFn.powerResult, //获取权限功能
                    "RoleID": data.field.RoleID,
                    "OrgID": $('input[name="FID"]').val(), //机构ID
                    "UserList": UserList, //机构内角色
                    "Remark": $("#tarea").val() // 说明
                };
                var param = cloneObjectFn(paramList);
                param["entity"] = getUTF8(entityJson);
                var postdata = GetPostData(param, "role", "update");
                postFnajax(postdata).then(function (result) {
                    var res = JSON.parse(result);
                    if (res.result.code == "200") {
                        layer.msg('编辑成功', {
                            time: 2000
                        });
                        layer.closeAll();
                        rolesmanageFn.pageCurr = 1;
                        rolesmanageFn.getList();
                    } else {
                        layer.msg(res.result.msg, {
                            time: 2000
                        });
                    }
                });
            } else {
                entityJson = {
                    "RoleName": data.field.RoleName,
                    "IsValid": data.field.IsValid,
                    "FuncList": rolesmanageFn.powerResult,
                    "RoleID": guid(),
                    "OrgID": $('input[name="FID"]').val(),
                    "UserList": UserList,
                    "Remark": $("#tarea").val() // 说明
                };
                var param = cloneObjectFn(paramList);
                param["entity"] = getUTF8(entityJson);
                var postdata = GetPostData(param, "role", "insert");
                postFnajax(postdata).then(function (result) {
                    var res = JSON.parse(result);
                    if (res.result.code == "200") {
                        layer.msg('新增成功', {
                            time: 2000
                        });
                        layer.closeAll();
                        rolesmanageFn.pageCurr = 1;
                        rolesmanageFn.getList();
                    } else {
                        layer.msg(res.result.msg, {
                            time: 2000
                        });
                    }
                });
            }
        });
    },
    //查看角色
    userPopup: function (RoleID) {
        var check_power_tpl = document.getElementById('check_Roles').innerHTML;
        laytpl(check_power_tpl).render({}, function (html) {
            layer.open({
                id: 'power_pop',
                type: 1,
                content: html,
                title: ['该角色下的用户', 'font-size:16px;height:46px;line-height:46px;'],
                area: ['auto', "360px"],
                success: function (index, layero) {
                    delete paramList.orgID;
                    delete paramList.all;
                    var param = cloneObjectFn(paramList);
                    param["roleID"] = RoleID;
                    var postdata = GetPostData(param, "user", "getList");
                    postFnajax(postdata).then(function (res) {
                        var res = JSON.parse(res)
                        if (res.result.code == 200) {
                            var resdata = res.data;
                            var treelist = [];
                            for (var i = 0; i < resdata.length; i++) {
                                resdata[i].checked = true;
                                if (resdata[i].checked) {
                                    var item = {
                                        id: '',
                                        pId: '',
                                        name: "",
                                        open: true
                                    };
                                    item.id = resdata[i]['UserID'];
                                    item.pId = resdata[i]['RoleID'];
                                    item.name = resdata[i]['RealName'];
                                    treelist.push(item);
                                    item.chkDisabled = true; //查看时都不可选择
                                    if (resdata[i]['checked']) { //被选中
                                        item.checked = true;
                                    }
                                }
                            }

                            var setting = {
                                check: {
                                    enable: true
                                },
                                data: {
                                    simpleData: {
                                        enable: true
                                    }
                                },
                                view: {
                                    showIcon: false,
                                    txtSelectedEnable: true,
                                    selectedMulti: false,
                                    curSelectedNode: false
                                },
                            };
                            var treeObj = $.fn.zTree.init($("#Viewing_Roles_tree"), setting, treelist);
                        }
                    })
                }
            })
        })
    },
    powerPopup: function (roleId) { //功能权限
        var check_power_tpl = document.getElementById('check_power').innerHTML;
        laytpl(check_power_tpl).render({}, function (html) {
            layer.open({
                id: 'power_pop',
                type: 1,
                content: html,
                title: ['查看功能权限', 'font-size:16px;height:46px;line-height:46px;'],
                area: ['400px', '450px'],
                success: function (index, layero) {
                    //根据userid获取权限数据
                    var param = cloneObjectFn(paramList);
                    param["roleID"] = roleId;
                    var postdata = GetPostData(param, "role", "getRoleInfo");
                    postFnajax(postdata).then(function (res) {
                        var res = JSON.parse(res)
                        if (res.result.code == 200) {
                            var This = this,
                                resdata = res.data.FuncList;
                            var treelist = [];
                            for (var i = 0; i < resdata.length; i++) {
                                var item = {
                                    id: '',
                                    pId: '',
                                    name: "",
                                    open: true
                                };
                                item.id = resdata[i]['id'];
                                item.pId = resdata[i]['pId'];
                                item.name = resdata[i]['name'];
                                treelist.push(item);
                                item.chkDisabled = true; //查看时都不可选择
                                if (resdata[i]['checked']) { //被选中
                                    item.checked = true;
                                }
                            }
                            var setting = {
                                check: {
                                    enable: true
                                },
                                data: {
                                    simpleData: {
                                        enable: true
                                    }
                                },
                                view: {
                                    showIcon: false,
                                    txtSelectedEnable: true,
                                    selectedMulti: false,
                                    curSelectedNode: false
                                },
                            };
                            var treeObj = $.fn.zTree.init($("#check_power_tree"), setting, treelist);
                        }
                    })
                }
            })
        })
    },
    // 重置
    ResetOutbox: function () {
        form.on('submit(ResetBtn)', function () {
            $('input[name="rm_searchName"]').val('');
            form.val("roles_ser", {
                "rm_searchState": -1
            })
            rolesmanageFn.getList();
        })
    }
}