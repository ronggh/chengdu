$(function () {
    form.render('select')
    equipmentFn.equipmentPageList(); //获取列表数据
    equipmentFn.deversearc()
    equipmentFn.ResetOutbox()
});
var equipmentFn = {
    pageLimit: rowCount, //设置本页面的一页显示多少条数据
    pageCurr: 1,
    deverTypeid: "",
    SensorIDC: "",
    params: decodeURIComponent(atob((location.href).split("&id=")[1])),
    equipmentPageList: function (name, start) {
        var param = cloneObjectFn(paramList);
        param["name"] = name;
        param["category"] = start;
        if (name == "" || name == undefined) {
            delete param.name;
        }
        if (start == "" || start == undefined) {
            delete param.category;
        }
        param["pageSize"] = equipmentFn.pageLimit;
        param["pageIndex"] = equipmentFn.pageCurr;
        param["terminalNum"] = equipmentFn.params;
        var postdata = GetPostData(param, "device", "getDeviceListPage");
        postFnajax(postdata).then(function (result) {
            // console.log(result)
            var res = JSON.parse(result);
            //分页
            laypage.render({
                elem: 'Equipment_pagenation',
                count: res.page.totalData,
                limit: equipmentFn.pageLimit,
                curr: equipmentFn.pageCurr,
                layout: ['count', 'prev', 'page', 'next', 'skip'],
                jump: function (obj, first) {
                    if (!first) {
                        equipmentFn.pageCurr = obj.curr;
                        var param = cloneObjectFn(paramList);
                        param["pageSize"] = equipmentFn.pageLimit;
                        param["pageIndex"] = equipmentFn.pageCurr;
                        param["terminalNum"] = equipmentFn.params;
                        var postdata = GetPostData(param, "device", "getDeviceListPage");
                        postFnajax(postdata).then(function (res) {
                            var res = JSON.parse(res)
                            equipmentFn.TableEquipment(res);
                        });
                    }
                }
            });
            equipmentFn.TableEquipment(res);
        })
    },
    TableEquipment: function (res) { //表格渲染
        //表格数据渲染
        table.render({
            elem: '#EquipmentTable',
            cols: [
                [ //标题栏
                    {
                        type: 'numbers',
                        title: '序号',
                        align: 'center'
                    }, {
                        field: 'DeviceName',
                        title: '设备名称',
                        align: 'center'
                    }, {
                        field: 'DeviceTypeID',
                        title: '设备类型ID',
                        align: 'center'
                    },{
                        field: 'DeviceTypeName',
                        title: '设备类型名称',
                        align: 'center'
                    }, {
                        field: 'DeviceCategory',
                        title: '设备类别',
                        align: 'center',
                        templet: function (d) {
                            return equipmentFn.deverType(d);
                        }
                    }, {
                        title: '操作',
                        toolbar: '#table_Equipment',
                        align: 'center',
                        templet: function (d) {}
                    }
                ]
            ],
            data: res.data,
            skin: 'line',
            even: true,
            limit: equipmentFn.pageLimit,
            id: 'EquipmentTable'
        })
    },
    deverType(data) {
        if (data.DeviceCategory == "SENSOR") {
            return "传感设备"
        };
        if (data.DeviceCategory == "CONTROLLER") {
            return "控制设备"
        };
        if (data.DeviceCategory == 'INTEGRATED') {
            return "综合设备"
        }
    },
    //新增、编辑设备
    addEquipment: function (type, id) {
        $("#equipmentManagement").css('display', 'none');
        $("#addEdit_device").css('display', 'block');
        if (type == "insert") {
            $("input[name = deviceName]").val("");
            // table.render()
            // $("#DevTypetable").html("")
            $("input[name = device_Remarks]").val("");
            equipmentFn.tagsList(['352c4595-beb3-4fe9-a315-4b71f2939b8e']);
            equipmentFn.EquipmentTypeName();
            equipmentFn.SensorIDC = "";
            $("input[name = deverID]").val("");
        } else {
            equipmentFn.eitEquipment(id);
            $("input[name = deverID]").val(id);
        }
    },
    //获取设备详情
    eitEquipment: function (id) {
        var param = cloneObjectFn(paramList);
        param["deviceId"] = id;
        var postdata = GetPostData(param, "device", "getDeviceInfo");
        postFnajax(postdata).then(function (res) {
            // console.log("<<<<<<<<<设备详情>>>>>>>>");
            // console.log(res);
            var deverInfoData = JSON.parse(res);
            $("input[name = deviceName]").val(deverInfoData.data.DeviceName); //设备名称
            $("input[name = device_Remarks]").val(deverInfoData.data.DeviceDesc); //设备备注
            equipmentFn.EquipmentTypeName(deverInfoData.data.DeviceTypeID, deverInfoData.data.DeviceTypeName); //类型名称
            equipmentFn.tagsList(deverInfoData.data.Tags); //标签
            equipmentFn.passageWayFn(deverInfoData.data.DeviceTypeID, deverInfoData.data.Slots, ); //通道列表
        })
    },
    //获取设备类型名称
    EquipmentTypeName: function (id, deverName) {
        // alert()
        var param = cloneObjectFn(paramList);
        var postdata = GetPostData(param, "device", "getDeviceTypeList");
        postFnajax(postdata).then(function (res) {
            var result = JSON.parse(res);
            if (id == undefined && deverName == undefined) {
                var EquipmentTypeNameSelect = '<option value = "">' + '请选择设备类型名称' + '</option>'
            } else {
                var EquipmentTypeNameSelect = "<option value = " + id + ">" + id + "-" + deverName + "</option>";               
            }
            $.each(result.data, function (index, item) {
                EquipmentTypeNameSelect = EquipmentTypeNameSelect + '<option value = "' + item.DeviceTypeID + '">' + item.DeviceTypeID + "-" + item.DeviceTypeName + '</option>'
            })
            $("#devicetype_selectName").html(EquipmentTypeNameSelect);
            form.render('select');
        })
        //设备发生改变下方通道表格也发生改变
        form.on('select(device_selectName)', function (data) {
            equipmentFn.deverTypeid = data.value;
            equipmentFn.passageWayFn(data.value);
        });
    },
    //获取标签列表
    tagsList: function (tips) {
        var param = cloneObjectFn(paramList);
        var postdata = GetPostData(param, "device", "getTagList");
        postFnajax(postdata).then(function (res) {
            var tagDataSelect = "";
            var tagData = JSON.parse(res);
            $.each(tagData.data, function (index, item) {
                if (tips[0] == item.ID) {
                    tagDataSelect = tagDataSelect + '<option selected value = "' + item.ID + '">' + item.Tag + '</option>'
                }else{
                    tagDataSelect = tagDataSelect + '<option value = "' + item.ID + '">' + item.Tag + '</option>'
                }
            })
            $("#tagData").html(tagDataSelect);
            form.render('select');
        });
    },
    //设备通道列表
    passageWayFn: function (DeviceTypeID, PlugSensorData) {
        var param = cloneObjectFn(paramList);
        param["deviceType"] = DeviceTypeID;
        var postdata = GetPostData(param, "device", "getSlotTemplateList");
        postFnajax(postdata).then(function (res) {
            // console.log(param)
            // console.log(res);
            var result = JSON.parse(res);
            equipmentFn.DevTypetable(result, PlugSensorData);
        })
    },
    DevTypetable: function (res, PlugSensorData) { //表格渲染
        //表格数据渲染
        table.render({
            elem: '#DevTypetable',
            cols: [
                [ //标题栏
                    {
                        field: 'Slot',
                        title: '通道序号'
                    }, {
                        field: 'SlotName',
                        title: '通道名'
                    }, {
                        field: 'SensorType',
                        title: '类型ID',
                    }, {
                        field: 'SensorName',
                        title: '类型名称'
                    }, {
                        field: 'title',
                        title: '传感器/控制器',
                        unresize: true,
                        templet: function (d) {
                            return equipmentFn.SensorTypeSelect(d.SensorType, PlugSensorData, d.Slot);
                        }
                    }
                ]
            ],
            data: res.data,
            skin: 'line',
            even: true,
            limit: 50,
            id: 'SensorTable'
        })
    },
    //通道中的下拉列表
    SensorTypeSelect: function (SensorType, PlugSensorData, Slot) {
        var param = cloneObjectFn(paramList);
        param["pageSize"] = listCount;
        param["pageIndex"] = 1;
        param["assigned"] = '0';
        param["type"] = SensorType;
        param["terminalNum"] = equipmentFn.params;
        var postdata = GetPostData(param, "device", "getSensorListPage");
        // var test = "";
        // //如果是修改 并且 设备类型
        if (PlugSensorData != undefined) {
            var soltArr = []
            for (var index = 0; index < PlugSensorData.length; index++) {
                soltArr.push(PlugSensorData[index].Slot);
            }
            if (soltArr.indexOf(Slot) != -1) {
                SensorTypeNameSelect = '<select name="deviceSelect" lay-verify="required" id = "deviceSelect" class = "deviceSelect">' + '<option value = ' + PlugSensorData[soltArr.indexOf(Slot)].PlugSensor + '>' + PlugSensorData[soltArr.indexOf(Slot)].DevName + '</option>' + '<option value = "">' + '请选择' + '</option>';
            } else {
                var SensorTypeNameSelect = '<select name="deviceSelect" lay-verify="required" id = "deviceSelect"  class = "deviceSelect">' + '<option value = "">' + '请选择' + '</option>';
            }
        } else {
            var SensorTypeNameSelect = '<select name="deviceSelect" lay-verify="required" id = "deviceSelect"  class = "deviceSelect">' + '<option value = "">' + '请选择' + '</option>';
        }
        $.ajax({
            url: baseUrl + "/v1/iot/Method",
            type: "POST",
            async: false,
            contentType: "application/json",
            data: JSON.stringify(postdata),
            success: function (res) {
                // console.log("<<<<<<<<下拉列表>>>>>>>")
                // console.log(res);
                var result = JSON.parse(res);
                $.each(result.data, function (index, item) {
                    SensorTypeNameSelect = SensorTypeNameSelect + '<option value = "' + item.Suid + '">' + item.DevName + '</option>'
                })
            }
        })
        return SensorTypeNameSelect + '</select>';
    },
    //新增、编辑设备
    EquipmentAddUpdata: function () {
        form.on('submit(submitEquipment)', function (data) {
            // $("#deviceSlotsTable .layui-table-box .layui-table-body .layui-table tr")    //获取长度
            // $(".deviceSelect").siblings().find("dl .layui-this").eq(1).attr("lay-value") //获取每一个的value值
            var PlugSensorArr = []; //PlugSensor传感器ID
            var SlotArr = []; //Slot 对应通道
            for (var index = 0; index < $("#deviceSlotsTable .layui-table-box .layui-table-body .layui-table tr").length; index++) {
                if ($(".deviceSelect").siblings().find("dl .layui-this").eq(index).attr("lay-value") != "0") {
                    SlotArr.push(index + 1);
                    PlugSensorArr.push($(".deviceSelect").siblings().find("dl .layui-this").eq(index).attr("lay-value"));
                }
            }
            // //判断是否出现重复绑定 //去重函数ArrRemoval
            if (ArrRemoval(PlugSensorArr).length != PlugSensorArr.length) {
                layer.msg("传感器出现重复绑定", {
                    time: 1500
                });
                return false;
            }
            if (!two_tenName.test(data.field.deviceName.trim())) {
                layer.msg("请输入2-30位英文、数字、汉字组合的设备名称", {
                    time: 1500
                });
                return false;
            }
            if (data.field.device_Remarks != "") {
                if (!two_tenName.test(data.field.device_Remarks.trim())) {
                    layer.msg("请输入2-30位英文、数字、汉字组合的设备备注", {
                        time: 1500
                    });
                    return false;
                }
            }
            var Slots = [];
            for (let index = 0; index < SlotArr.length; index++) {
                Slots.push({
                    Slot: SlotArr[index],
                    PlugSensor: PlugSensorArr[index]
                })
            }
            var tipArrID = [];
            tipArrID.push(data.field.device_tagData);
            var param = cloneObjectFn(paramList);
            var entityJson = {
                // "DeviceID":guid(),                                   //设备ID
                "DeviceName": data.field.deviceName.trim(), //设备名称
                "DeviceDesc": data.field.device_Remarks.trim(), //备注
                "TerminalNum": equipmentFn.params, //终端号
                "DeviceTypeID": data.field.device_selectName, //设备类型ID
                "Tags": tipArrID,
                "Slots": Slots,
            }
            if ($("input[name = deverID]").val() != "") {
                entityJson.DeviceID = $("input[name = deverID]").val();
                param['entity'] = getUTF8(entityJson);
                var postdata = GetPostData(param, "device", "update");
                postFnajax(postdata).then(function (res) {
                    // console.log(res)
                    // console.log(entityJson);
                    var res = JSON.parse(res);
                    if (res.result.code == 200) {
                        equipmentFn.equipmentPageList();
                        layer.msg('编辑成功', {
                            time: 2000
                        }, function () {
                            var id = decodeURIComponent(atob(location.href.split("&id=")[1]))
                            var  value = decodeURIComponent(atob(location.href.split("&id=")[0].split("?menu=")[1]))
                            LoadAction(value,"",id);
                        });
                    } else {
                        layer.msg("编辑失败："+res.result.msg, {
                            time: 2000
                        });
                    }
                })
            } else {
                entityJson.DeviceID = guid();
                param['entity'] = getUTF8(entityJson);
                var postdata = GetPostData(param, "device", "insert");
                postFnajax(postdata).then(function (res) {
                    // console.log(entityJson)
                    // console.log(res);
                    var res = JSON.parse(res);
                    if (res.result.code == 200) {
                        equipmentFn.equipmentPageList();
                        layer.msg('新增成功', {
                            time: 2000
                        }, function () {
                            var id = decodeURIComponent(atob(location.href.split("&id=")[1]))
                            var  value = decodeURIComponent(atob(location.href.split("&id=")[0].split("?menu=")[1]))
                            LoadAction(value,"",id);
                        });
                    } else {
                        layer.msg("新增失败："+res.result.msg, {
                            time: 2000
                        });
                    }
                })
            }
        });
    },

    // 删除设备
    delDevicePop: function (DeviceName, DeviceID) {
        var trLength; //删除时需要判断当前页是否只剩一个
        var del_dev_tpl = document.getElementById('del_dev_popup').innerHTML;
        laytpl(del_dev_tpl).render({
            DeviceName: DeviceName
        }, function (html) {
            layer.open({
                id: 'del_dev_pop',
                type: 1,
                content: html,
                title: ['删除', 'font-size:16px;height:46px;line-height:46px;'],
                area: ['450px', '200px'],
                btn: ['确定', '取消'],
                btn2: function (index, layero) {},
                yes: function (index, layero) {
                    var param = cloneObjectFn(paramList);
                    param["deviceId"] = DeviceID;
                    var postdata = GetPostData(param, "device", "delete");
                    postFnajax(postdata).then(function (res) {
                        // console.log("<<<<<<删除设备>>>>>")
                        // console.log(res)
                        var result = JSON.parse(res);
                        if (result.result.code == 200) {
                            layer.closeAll();
                            equipmentFn.equipmentPageList()
                            layer.msg("删除成功", {
                                time: 2000
                            });
                        } else {
                            layer.msg(result.result.msg, {
                                time: 2000
                            })
                        }

                    })
                }
            });
        });
    },

    // 设备查询
    deversearc: function () { //搜索条件
        form.on('submit(equipment_formSearch)', function (data) {
            // console.log(data)
            equipmentFn.pageCurr = 1;
            equipmentFn.equipmentPageList(data.field.equipment_searchName, data.field.select_form); //equipmentType,equipment_searchName
        })
    },
    // 重置
    ResetOutbox: function () { // 重置按钮 equipmentType
        form.on('submit(ResetBtn)', function () {
            $('input[name="equipment_searchName"]').val('');
            form.val("equipment_form", {
                "select_form": 0
            })
            equipmentFn.equipmentPageList();
        })
    },
    quxiao: function () {
        var id = decodeURIComponent(atob(location.href.split("&id=")[1]))
        var  value = decodeURIComponent(atob(location.href.split("&id=")[0].split("?menu=")[1]))
        LoadAction(value,"",id)
    }
}