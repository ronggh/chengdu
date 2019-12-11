$(function () {
    cameraFunction.getList(); //获取列表
    cameraFunction.searchForm(); // 查询
    cameraFunction.ResetOutbox(); // 重置
});
var cameraFunction = {
    pageLimit: rowCount, //设置本页面的一页显示多少条数据
    pageCurr: 1,
    storeName: null,
    tableRender: function (res) { //表格数据渲染
        table.render({
            elem: '#cameraTable',
            cols: [
                [ //标题栏
                    {
                        type: 'numbers',
                        title: '序号',
                        align: 'center'
                    }, {
                        field: 'CameraName',
                        title: '摄像头名称',
                        align: 'center'
                    }, {
                        field: 'NoSerial',
                        title: '序列号-通道号',
                        align: 'center'
                    }, {
                        field: 'LiveUrl',
                        width: 400,
                        title: '直播地址',
                        align: 'center'
                    }, {
                        title: '操作',
                        toolbar: '#table_operate',
                        align: 'center',
                        templet: function (d) {}
                    }
                ]
            ],
            data: res.data,
            skin: 'line',
            even: true,
            limit: cameraFunction.pageLimit,
            id: 'cameraTable'
        })
    },
    getList: function (storeName) { //获取列表
        var param = cloneObjectFn(paramList);
        param["name"] = storeName || null;
        if (param.name == null) {
            delete param.name;
        }
        param["pageSize"] = cameraFunction.pageLimit;
        param["pageIndex"] = cameraFunction.pageCurr;
        AjaxRequest(param, "camera", "getListPage").then(function (res) {
            var res = JSON.parse(res)
            $.each(res.data, function (index, item) {
                item.NoSerial = item.DeviceSerial + "-" + item.ChannelNo;
            })
            //分页
            laypage.render({
                elem: 'camera_pagenation',
                count: res.page.totalData,
                limit: cameraFunction.pageLimit,
                curr: cameraFunction.pageCurr,
                layout: ['count', 'prev', 'page', 'next', 'skip'],
                jump: function (obj, first) {
                    if (!first) {
                        cameraFunction.pageCurr = obj.curr;
                        var param = cloneObjectFn(paramList);
                        param["pageSize"] = cameraFunction.pageLimit;
                        param["pageIndex"] = cameraFunction.pageCurr;
                        AjaxRequest(param, "camera", "getListPage").then(function (res) {
                            var res = JSON.parse(res)
                            $.each(res.data, function (index, item) {
                                item.NoSerial = item.DeviceSerial + "-" + item.ChannelNo;
                            })
                            cameraFunction.tableRender(res);
                        });
                    }
                }
            });
            cameraFunction.tableRender(res);
        });
    },
    addCamera: function (opera_type) {
        var title = opera_type == "update" ? '编辑摄像头' : '新增摄像头';
        var fun_popup_tpl = document.getElementById('add_Camera').innerHTML;
        laytpl(fun_popup_tpl).render({}, function (html) {
            layer.open({
                type: 1,
                content: html,
                title: [title, 'font-size:16px;height:46px;line-height:46px;'],
                area: ['500px', '480px'],
                success: function (index, layero) {
                    if (opera_type == 'update') {
                        table.on('row(cameraTable)', function (obj) {
                            tableObj = obj.data;
                            $('input[name="cameraNameadd"]').attr('camera_id', tableObj.CameraID);
                            $('input[name="DeviceSerial"]').attr('Org_ID', tableObj.OrgID);
                            $('input[name="cameraNameadd"]').val(tableObj.CameraName);
                            $('input[name="DeviceSerial"]').val(tableObj.DeviceSerial);
                            $('input[name="ChannelNo"]').val(tableObj.ChannelNo);
                            $('textarea[name="LiveUrl"]').val(tableObj.LiveUrl);
                        })
                    }
                    setTimeout(function () {
                        if (opera_type == 'insert') { //新增
                            cameraFunction.submitPopup('insert');
                        } else { //编辑
                            cameraFunction.submitPopup('update')
                        }
                    }, 0)
                }
            })
        })
    },
    submitPopup: function (opera_type) { //提交/编辑弹窗
        //监听提交
        form.on('submit(submitAddcamera)', function (data) {
            //摄像头校验
            if (!two_tenName.test(data.field.cameraNameadd)) {
                layer.msg('请输入2-30位英文数字汉字组合的摄像头名称', {
                    time: 1500
                });
                return false;
            }
            //序列号校验
            if (!serNumber.test(data.field.DeviceSerial)) {
                layer.msg('请输入2-20位英文数字组合的序列号', {
                    time: 1500
                });
                return false;
            }
            //通道号校验
            if (!wayNumber.test(data.field.ChannelNo)) {
                layer.msg('请输入1-20位数字通道号', {
                    time: 1500
                });
                return false;
            }
            //直播地址校验
            if (!videoUrl.test(data.field.LiveUrl)) {
                layer.msg('请输入正确的直播URL地址', {
                    time: 1500
                });
                return false;
            }
            var entityJson = {
                "CameraName": data.field.cameraNameadd,
                "DeviceSerial": data.field.DeviceSerial,
                "ChannelNo": data.field.ChannelNo,
                "LiveUrl": data.field.LiveUrl,
            }
            if (opera_type == 'update') {
                entityJson.CameraID = $('input[name="cameraNameadd"]').attr('camera_id');
                entityJson.OrgID = $('input[name="DeviceSerial"]').attr('Org_ID');
                var param = cloneObjectFn(paramList);
                param["entity"] = getUTF8(entityJson);
                AjaxRequest(param, "camera", "update").then(function (res) {
                    var res = JSON.parse(res)
                    if (res.result.code == 200) {
                        layer.closeAll();
                        cameraFunction.pageCurr = 1;
                        cameraFunction.getList();
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
                var param = cloneObjectFn(paramList);
                param["entity"] = getUTF8(entityJson);
                AjaxRequest(param, "camera", "insert").then(function (res) {
                    var res = JSON.parse(res)
                    if (res.result.code == 200) {
                        layer.closeAll();
                        cameraFunction.pageCurr = 1;
                        cameraFunction.getList();
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
        })
    },
    //删除
    delcamera: function (delectID) {
        table.on('row(cameraTable)', function (obj) {
            var trLength; //删除时需要判断当前页是否只剩一个
            var del_roles_Tpl = document.getElementById('del_camera_popup').innerHTML;
            laytpl(del_roles_Tpl).render(obj.data, function (html) {
                layer.open({
                    id: 'del_camera_pop',
                    type: 1,
                    content: html,
                    title: ['删除', 'font-size:16px;line-height:46px;color: rgba(0, 0, 0, 0.85);'],
                    area: ['450px', '200px'],
                    btn: ['确定', '取消'],
                    yes: function (index, layero) {
                        var param = cloneObjectFn(paramList);
                        param["cameraId"] = delectID;
                        AjaxRequest(param, "camera", "delete").then(function (res) {
                            var resule = JSON.parse(res);
                            if (resule.result.code == "200") {
                                layer.msg('删除成功');
                                layer.close(index);
                                if (trLength == 1) {
                                    cameraFunction.pageCurr == 1 ? 1 : cameraFunction.pageCurr--;
                                }
                                cameraFunction.getList(cameraFunction.searchName, cameraFunction.searchVaild);
                            }
                        });
                    },
                    success: function () {
                        //赋值当前页面还剩几个tr
                        trLength = $('.layui-table>tbody>tr').length;
                    }
                });
            });
        })
    },
    //搜索条件
    searchForm: function () {
        form.on('submit(camera_formSearch)', function (data) {
            cameraFunction.storeName = data.field.cameraName;
            cameraFunction.pageCurr = 1;
            cameraFunction.getList(cameraFunction.storeName);
        })
    },
    // 重置
    ResetOutbox: function () { // 重置按钮
        form.on('submit(ResetBtn)', function () {
            $('input[name="cameraName"]').val('');
            cameraFunction.getList();
        })
    }
}