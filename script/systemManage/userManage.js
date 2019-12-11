$(function () {
    initLayuifn(['element', 'form', 'table', 'layer', 'laytpl', 'laypage', 'laydate', 'upload', 'tree', 'util', 'transfer'], function () {
        form.render();
    });
    manageFn.getList(); //获取列表数据
    manageFn.searchForm(); //开启搜索
    manageFn.ResetOutbox()
});
var manageFn = {
    pageLimit: rowCount, //设置本页面的一页显示多少条数据
    pageCurr: 1,
    searchName: '',
    searchVaild: null,
    arraySelectM: null,
    arrSelectMDom: {
        values: []
    },
    tableRender: function (res) { //表格渲染所属用户组（角色）、可用功能（这个可以设计成点击弹出树状目录树的形式显示）。
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
                        field: 'UserName',
                        title: '用户名',
                        align: 'center'
                    }, {
                        field: 'RealName',
                        title: '姓名',
                        align: 'center'
                    }, {
                        field: 'Mobile',
                        title: '联系电话',
                        align: 'center',
                        templet: function (d) {
                            return d.Mobile == null ? '/' : d.Mobile;
                        }
                    }, {
                        title: '角色',
                        align: 'center',
                        templet: function (d) {
                            return manageFn.seeUserRole(d);
                        }
                    }, {
                        title: '可用功能',
                        toolbar: '#Use_Function',
                        align: 'center'
                    }, {
                        field: 'OrgName',
                        title: '所属机构',
                        align: 'center',
                        templet: function (d) {
                            return d.OrgName == null ? '/' : d.OrgName;
                        }
                    }, {
                        field: 'UserValid',
                        title: '用户状态',
                        align: 'center',
                        templet: function (d) {
                            if (d.UserValid == 1) {
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
            limit: manageFn.pageLimit,
            id: 'manageTable'
        })
    },
    getList: function (searchName, searchVaild) { //获取列表数据-接口+分页
        var param = cloneObjectFn(paramList);
        param["name"] = searchName || '';
        param["status"] = searchVaild || null;
        param["pageSize"] = manageFn.pageLimit;
        param["pageIndex"] = manageFn.pageCurr;
        if (param.name == '') {
            delete param.name;
        }
        if (param.status == null) {
            delete param.status;
        }
        AjaxRequest(param, "user", "getListPage").then(function (res) {
            var res = JSON.parse(res)
            //分页
            laypage.render({
                elem: 'um_pagenation',
                count: res.page.totalData,
                limit: manageFn.pageLimit,
                curr: manageFn.pageCurr,
                layout: ['count', 'prev', 'page', 'next', 'skip'],
                jump: function (obj, first) {
                    if (!first) {
                        manageFn.pageCurr = obj.curr;
                        var param = cloneObjectFn(paramList);
                        param["pageSize"] = manageFn.pageLimit;
                        param["pageIndex"] = manageFn.pageCurr;
                        AjaxRequest(param, "user", "getListPage").then(function (res) {
                            var res = JSON.parse(res)
                            manageFn.tableRender(res);
                        });
                    }
                }
            });
            manageFn.tableRender(res);
        });
    },
    addUserPop: function (opera_type) { //新增用户
        var title = opera_type == "insert" ? "新增用户" : "编辑用户";
        var tableObj;
        if (opera_type == 'update') {
            table.on('row(manageTable)', function (obj) {
                tableObj = obj.data;
                //获取用户信息
                var param = cloneObjectFn(paramList);
                param["userID"] = tableObj.UserID;
                AjaxRequest(param, "user", "getUserInfo").then(function (res) {
                    var res = JSON.parse(res);
                    manageFn.arrSelectMDom = selectM({
                        elem: '#userRoles',
                        data: res.data.Roles,
                        max: res.data.Roles.length,
                        width: '100%',
                        titName: 'name',
                        idTit: 'id'
                    });
                    var arr = []
                    $.each(res.data.Roles, function (index, item) {
                        if (item.checked) {
                            arr.push(item.id)
                        }
                    })
                    manageFn.arrSelectMDom.set(arr);
                    $('input[name="UserName"]').val(res.data.UserName); //用户名
                    $('input[name="LoginName"]').val(res.data.RealName); //姓名
                    $('input[name="password"]').parent().parent().css("display", "none");
                    $('input[name="phone"]').val(res.data.Mobile); //手机号
                    $('input[name="UserId"]').val(res.data.UserID);
                    $('input[name="OrgId"]').val(res.data.OrgID);
                    $('.popup_Org .value_ft').html(tableObj.OrgName).addClass('active');
                    $('select[name="IsValid"]>option[value="' + res.data.IsValid + '"]').attr('selected', 'selected'); //启用禁用
                    form.render();
                })
            });
        }
        var add_user_Tpl = document.getElementById('add_user_popup').innerHTML;
        laytpl(add_user_Tpl).render({}, function (html) {
            layer.open({
                id: 'add_user_pop',
                type: 1,
                content: html,
                title: [title, 'font-size:16px;height:46px;line-height:46px;'],
                area: ['500px', '600px'],
                success: function (index, layero) {
                    //新增时的随机密码
                    $('input[name="password"]').val(manageFn.randomString());
                    var param = cloneObjectFn(paramList);
                    AjaxRequest(param, "org", "getList").then(function (res) {
                        var res = JSON.parse(res);
                        var zNodes = [{
                            id: $("input[name = orgid]").val(),
                            name: $("input[name = orgNameone]").val(),
                            open: true,
                            pId: ""
                        }];
                        var showOrgName = '';
                        //渲染树级结构
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
                                if ($('input[name="OrgId"]').val() == item.ID) {
                                    showOrgName = item.OrgName;
                                    $('input[name="OrgId"]').val(item.ID);
                                }
                            }
                            zNodes.push(nodeT);
                        });
                        $.fn.zTree.init($("#treeOrg"), settingOrg, zNodes);
                        //编辑时回显行政区域
                        if (showOrgName != '') {
                            $('.popup_Org .value_ft').html(showOrgName).addClass('active');
                        }
                    });
                    //所属机构zTree配置
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
                    //上级机构点击后的回调
                    function onClickOrg(e, treeId, treeNode) {
                        $('.popup_Org .value_ft').html(treeNode.name).addClass('active');
                        $('input[name="OrgId"]').val(treeNode.id);
                        $('#OrgBox').addClass('hidden');
                        $("#userRoles").remove();
                        $("#use").append('<div class="layui-input-block" id="userRoles"></div>');
                        var param = cloneObjectFn(paramList);
                        param["orgID"] = treeNode.id;
                        AjaxRequest(param, "role", "getRole").then(function (res) {
                            var res = JSON.parse(res);
                            selectM({
                                elem: '#userRoles',
                                data: res.data,
                                max: res.data.length,
                                width: '100%',
                                titName: 'name',
                                idTit: 'id'
                            });
                            $("#userRoles .tips").html("请选择用户角色")
                            form.render();
                        })
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
                    };
                    if (opera_type == "insert") {
                        var selectInit = [];
                        selectM({
                            elem: '#userRoles',
                            data: selectInit,
                            max: selectInit.length,
                            width: '100%',
                            titName: 'RoleName',
                            idTit: 'RoleID'
                        });
                        form.render();
                    }
                    setTimeout(function () {
                        if (opera_type == 'insert') { //新增
                            manageFn.submitPopup('insert');
                        } else { //编辑
                            manageFn.submitPopup('update')
                        }
                    }, 0)
                }
            });
        });
    },
    submitPopup: function (opera_type) { //提交/编辑弹窗
        //监听提交
        form.on('submit(submitAddUser)', function (data) {
            if (!userName.test(data.field.UserName)) {
                layer.msg("请输入2-20位英文、数字组合的用户名", {
                    time: 1500
                });
                return false;
            }
            if (!one_Person.test(data.field.LoginName)) {
                layer.msg("请输入2-20位英文、数字、汉字组合的姓名", {
                    time: 1500
                });
                return false;
            }
            if (!myRegcode.test(data.field.password)) {
                layer.msg("请输入6-12位英文、数字组合的密码", {
                    time: 1500
                });
                return false;
            }
            var roles = [];
            if (data.field.userRoles != "") {
                var arrRoles = data.field.userRoles.split(",")
                $.each(arrRoles, function (index, item) {
                    roles.push({
                        "ID": item
                    });
                })
            }
            var entityJson = {
                "Roles": roles,
                "UserName": data.field.UserName,
                "RealName": data.field.LoginName,
                "Mobile": data.field.phone,
                "OrgID": data.field.OrgId,
                "IsValid": data.field.IsValid,
            };

            if (opera_type == 'update') {
                entityJson.UserID = data.field.UserId
                var param = cloneObjectFn(paramList);
                param["entity"] = getUTF8(entityJson);
                AjaxRequest(param, "user", "update").then(function (res) {
                    var res = JSON.parse(res)
                    if (res.Result == false) {
                        layer.msg("编辑失败", {
                            time: 2000
                        });
                    }
                    if (res.result.code == 200) {
                        layer.closeAll();
                        manageFn.pageCurr = 1;
                        manageFn.getList(manageFn.searchName, manageFn.searchVaild);
                        layer.msg('编辑成功', {
                            time: 2000
                        });
                    } else {
                        layer.msg(res.result.msg, {
                            time: 2000
                        });
                    }
                })
            } else {
                entityJson.UserID = guid();
                entityJson.Password = $.md5($.md5($.md5(data.field.password)));
                var param = cloneObjectFn(paramList);
                param["entity"] = getUTF8(entityJson);
                AjaxRequest(param, "user", "insert").then(function (res) {
                    var res = JSON.parse(res);
                    if (res.result.code == 200) {
                        layer.closeAll();
                        manageFn.pageCurr = 1;
                        manageFn.getList();
                        layer.msg('新增成功', {
                            time: 2000
                        });
                    } else {
                        layer.msg(res.result.msg, {
                            time: 2000
                        });
                    }
                })
            }
        });
    },
    delUserPop: function (userName, userid) { //删除用户
        var trLength; //删除时需要判断当前页是否只剩一个
        var del_user_Tpl = document.getElementById('del_user_popup').innerHTML;
        laytpl(del_user_Tpl).render({
            username: userName
        }, function (html) {
            layer.open({
                id: 'del_user_pop',
                type: 1,
                content: html,
                title: ['删除', 'font-size:16px;height:46px;line-height:46px;'],
                area: ['450px', '200px'],
                btn: ['确定', '取消'],
                btn2: function (index, layero) {},
                yes: function (index, layero) {
                    var param = cloneObjectFn(paramList);
                    var entityJson = {
                        "UserID": userid
                    }
                    param["entity"] = getUTF8(entityJson);
                    AjaxRequest(param, "user", "delete").then(function (res) {
                        var res = JSON.parse(res)
                        if (res.result.code == 200) {
                            layer.msg('删除成功');
                            layer.close(index);
                            if (trLength == 1) {
                                manageFn.pageCurr == 1 ? 1 : manageFn.pageCurr--;
                            }
                            manageFn.getList(manageFn.searchName, manageFn.searchVaild);
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
    stateChangeFn: function (id, IsValid) { //修改用户状态
        var entityJson = {
            "UserID": id,
            "IsValid": IsValid == 1 ? 0 : 1
        }
        var param = cloneObjectFn(paramList);
        param["entity"] = getUTF8(entityJson);
        AjaxRequest(param, "user", "updateStatus").then(function (res) {
            var res = JSON.parse(res)
            if (res.result.code == 200) {
                layer.msg('修改成功');
                manageFn.getList(manageFn.searchName, manageFn.searchVaild);
            }
        })
    },
    searchForm: function () { //搜索条件
        form.on('submit(um_formSearch)', function (data) {
            manageFn.searchName = data.field.um_searchName; //赋值全局变量
            manageFn.pageCurr = 1;
            if (data.field.um_searchState == -1) {
                manageFn.searchVaild = null;
                //显示所有状态
                manageFn.getList(manageFn.searchName);
            } else {
                manageFn.searchVaild = data.field.um_searchState;
                manageFn.getList(manageFn.searchName, manageFn.searchVaild);
            }
        })
    },
    // 重置
    ResetOutbox: function () {
        form.on('submit(ResetBtn)', function () {
            $('input[name="um_searchName"]').val('');
            form.val("user_manage", {
                "um_searchState": -1
            })
            manageFn.getList();
        })
    },
    seeUserRole: function (d) { //查看角色
        var seeRoles = "";
        $.each(d.Roles, function (indes, item) {
            seeRoles = seeRoles + item + '、';

        })
        return seeRoles;
    },
    Use_fun: function (userId) { //查看可用功能
        var check_power_tpl = document.getElementById('Use_Fu').innerHTML;
        laytpl(check_power_tpl).render({}, function (html) {
            layer.open({
                id: 'power_pop',
                type: 1,
                content: html,
                title: ['用户可用功能', 'font-size:16px;height:46px;line-height:46px;'],
                area: ['360px', '400px'],
                success: function (index, layero) {
                    var param = cloneObjectFn(paramList);
                    param["userID"] = userId;
                    var postdata = GetPostData(param, "user", "getUserInfo");
                    postFnajax(postdata).then(function (res) {
                        var res = JSON.parse(res)
                        if (res.result.code == 200) {
                            var This = this,
                                resdata = res.data.Functions;
                            var treelist = [];
                            for (var i = 0; i < resdata.length; i++) {
                                resdata[i].checked = true
                                var item = {
                                    id: '',
                                    pId: '',
                                    name: "",
                                    open: true
                                };
                                item.id = resdata[i]['FuncID'];
                                item.pId = resdata[i]['FID'];
                                item.name = resdata[i]['FuncName'];
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
                            var treeObj = $.fn.zTree.init($("#Use_Function_tree"), setting, treelist);
                        }
                    })
                }
            })
        })
    },
    //随机密码
    randomString: function (len) {
        len = 6 || 12;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz234567823456782345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    },
    //修改密码
    dUserPop: function () {
        var editpass_Tpl = document.getElementById('editPass').innerHTML;
        laytpl(editpass_Tpl).render({}, function (html) {
            layer.open({
                id: 'edit_pass_pop',
                type: 1,
                content: html,
                title: ['修改密码', 'font-size:16px;height:46px;line-height:46px;'],
                area: ['500px', '320px'],
                success: function (index, layero) {
                    table.on('row(manageTable)', function (obj) {
                        $('input[name="before"]').val(obj.data.UserName); //姓名
                        form.on('submit(submitPass)', function (data) {
                            var param = cloneObjectFn(paramList);
                            var myRegcode = /^[a-z0-9A-Z]{6,12}$/;
                            if (myRegcode.test($("#after").val())) {
                                param["userID"] = obj.data.UserID;
                                param["after"] = $.md5($.md5($.md5($("#after").val())));
                                var postdata = GetPostData(param, "user", "updatePassword");
                                postFnajax(postdata).then(function (res) {
                                    var passRes = JSON.parse(res);
                                    if (passRes.result.code == 200) {
                                        layer.closeAll();
                                        layer.msg('修改密码成功', {
                                            time: 2000
                                        });
                                    }
                                });
                            } else {
                                layer.msg("请6-12位有效密码", {
                                    time: 1500
                                });
                            };
                        })
                    })
                }
            })
        })
    }
}