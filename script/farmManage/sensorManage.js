$(function () {
    sensorFn.sensorPageList(); //获取列表数据
    sensorFn.sensorsearc();
    sensorFn.ResetOutbox();
});
var sensorFn = {
    pageLimit: rowCount, //设置本页面的一页显示多少条数据
    pageCurr: 1,
    searchName: '',
    SensorList: "",
    params: decodeURIComponent(atob((location.href).split("&id=")[1])),
    sensorPageList: function (sensor_searchName) {
        // 获取传感器列表
        var param = cloneObjectFn(paramList);
        param["name"] = sensor_searchName;
        if (sensor_searchName == "") {
            delete param.name;
        }
        param["pageSize"] = sensorFn.pageLimit;
        param["pageIndex"] = sensorFn.pageCurr;
        param["terminalNum"] = sensorFn.params;
        AjaxRequest(param, "sensor", "getSensorListPage").then(function (result) {
            var res = JSON.parse(result)
            $.each(res.data, function (index, item) {
                item.PortTypeName = item.SensorTypeName + "-" + item.PortName;
            })
            //分页
            laypage.render({
                elem: 'Sensor_pagenation',
                count: res.page.totalData,
                limit: sensorFn.pageLimit,
                curr: sensorFn.pageCurr,
                layout: ['count', 'prev', 'page', 'next', 'skip'],
                jump: function (obj, first) {
                    if (!first) {
                        sensorFn.pageCurr = obj.curr;
                        var param = cloneObjectFn(paramList);
                        param["pageSize"] = sensorFn.pageLimit;
                        param["pageIndex"] = sensorFn.pageCurr;
                        param["terminalNum"] = sensorFn.params;
                        AjaxRequest(param, "sensor", "getSensorListPage").then(function (res) {
                            var res = JSON.parse(res)
                            $.each(res.data, function (index, item) {
                                item.PortTypeName = item.SensorTypeName + "-" + item.PortName;
                            })
                            sensorFn.TableSensor(res);
                        });
                    }
                }
            });
            sensorFn.TableSensor(res);
        })
    },
    TableSensor: function (res) { //表格渲染
        //表格数据渲染
        table.render({
            elem: '#SensorTable',
            cols: [
                [ //标题栏
                    {
                        type: 'numbers',
                        title: '序号',
                        align: 'center'
                    }, {
                        field: 'DevName',
                        title: '传感器名称',
                        align: 'center'
                    }, {
                        field: 'Channel',
                        title: '通道',
                        align: 'center'
                    }, {
                        field: 'PortTypeName',
                        title: '传感器类型',
                        align: 'center'
                    }, {
                        title: '操作',
                        toolbar: '#table_Sensor',
                        align: 'center',
                        templet: function (d) {}
                    }
                ]
            ],
            data: res.data,
            skin: 'line',
            even: true,
            limit: sensorFn.pageLimit,
            id: 'SensorTable'
        })
    },
    addSensor: function (opera_type) {
        var title = opera_type == "update" ? '编辑传感器' : '新增传感器';
        var fun_popup_tpl = document.getElementById('add_Sensor').innerHTML;
        laytpl(fun_popup_tpl).render({}, function (html) {
            layer.open({
                type: 1,
                content: html,
                title: [title, 'font-size:16px;height:46px;line-height:46px;'],
                area: ['500px', '340px'],
                success: function (index, layero) {
                    if (opera_type == 'update') {
                        table.on('row(SensorTable)', function (obj) {
                            $('input[name="SUID"]').val(obj.data.Suid); //SensorTelNum
                            $('input[name="sensorName"]').val(obj.data.DevName);
                            $('input[name="passageway"]').val(obj.data.Channel);
                            var param = cloneObjectFn(paramList);
                            AjaxRequest(param, "sensor", "getSensorTypeList").then(function (res) {
                                var SensorTypeData = "";
                                var resSensorList = JSON.parse(res);
                                $.each(resSensorList.data, function (index, item) {
                                    if (obj.data.SensorTypeId == item.SensorTypeID) {
                                        SensorTypeData = item;
                                    }
                                })
                                var sensorTypeSelect = '<option value = ' + SensorTypeData.SensorTypeID + '>' + SensorTypeData.SensorTypeID + "-" + SensorTypeData.SensorTypeName + "-" + SensorTypeData.PortName + '</option>'
                                $.each(resSensorList.data, function (index, item) {
                                    sensorTypeSelect = sensorTypeSelect + '<option value = "' + item.SensorTypeID + '">' + item.SensorTypeID + "-" + item.SensorTypeName + "-" + item.PortName + '</option>'
                                })
                                $("#SensorType").html(sensorTypeSelect);
                                form.render('select');
                            })
                        })
                    }
                    if (opera_type == 'insert') {
                        var param = cloneObjectFn(paramList);
                        var postdata = GetPostData(param, "sensor", "getSensorTypeList");
                        postFnajax(postdata).then(function (res) {
                            var resSensorList = JSON.parse(res);
                            var sensorTypeSelect = '<option value = "">' + '请选择设备类型' + '</option>'
                            $.each(resSensorList.data, function (index, item) {
                                sensorTypeSelect = sensorTypeSelect + '<option value = "' + item.SensorTypeID + '">' + item.SensorTypeID + "-" + item.SensorTypeName + "-" + item.PortName + '</option>'
                            })
                            $("#SensorType").html(sensorTypeSelect);
                            form.render('select');
                        })
                    }
                    setTimeout(function () {
                        if (opera_type == 'insert') { //新增
                            sensorFn.submitsensor('insert');
                        } else { //编辑
                            sensorFn.submitsensor('update')
                        }
                    }, 0)
                }
            })
        })
    },
    //修改
    submitsensor: function (opera_type) {
        form.on('submit(submitSensor)', function (data) {
            if (!two_tenName.test(data.field.sensorName.trim())) {
                layer.msg("请输入2-30位英文、数字、汉字组合的传感器名称", {
                    time: 1500
                });
                return false;
            }
            if (!wayNumber.test(data.field.passageway.trim())) {
                layer.msg("请输入1-20位数字通道号", {
                    time: 1500
                });
                return false;
            }
            var entity = {
                "DevName": data.field.sensorName.trim(),
                "Channel": data.field.passageway.trim(),
                "SensorID": data.field.SensorType,
                "TerminalNum": sensorFn.params,
            }
            if (data.field.SensorType == 0) {
                layer.msg("请选择传感器类型", {
                    time: 2000
                });
                return false;
            }
            if (opera_type == "insert") {
                entity.SUID = guid();
            };
            if (opera_type == "update") {
                entity.SUID = data.field.SUID;
            };
            var param = cloneObjectFn(paramList);
            param["entity"] = getUTF8(entity);
            AjaxRequest(param, "sensor", opera_type).then(function (result) {
                // console.log(result);
                var res = JSON.parse(result);
                if (res.result.code == 200) {
                    layer.closeAll();
                    sensorFn.sensorPageList()
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
    //删除传感器
    delSensor: function (DevName, id) {
        var del_user_Tpl = document.getElementById('del_Sensor_popup').innerHTML;
        laytpl(del_user_Tpl).render({
            DevName: DevName
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
                    param["suid"] = id;
                    AjaxRequest(param, "sensor", "delete").then(function (res) {
                        var result = JSON.parse(res);
                        if (result.result.code == 200) {
                            layer.closeAll();
                            sensorFn.sensorPageList()
                            layer.msg("删除成功", {
                                time: 2000
                            });
                        } else {
                            layer.msg("删除失败", {
                                time: 2000
                            })
                        }
                    })
                }
            })
        })
    },
    //传感器的搜索
    sensorsearc: function () { //搜索条件
        form.on('submit(sensor_formSearch)', function (data) {
            // console.log(data);
            sensorFn.pageCurr = 1;
            sensorFn.sensorPageList(data.field.sensor_searchName);
        })
    },
    // 重置
    ResetOutbox: function () { // 重置按钮
        form.on('submit(ResetBtn)', function () {
            $('input[name="sensor_searchName"]').val('');
            sensorFn.sensorPageList();
        })
    },
}