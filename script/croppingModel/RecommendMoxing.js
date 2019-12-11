$(function () {
    laydate.render({
        elem: '#time_Production',
        range: true,
        theme: '#389bff',
        change: function (value, date, endDate) {
            date_2 = value;
        },
        done: function (value, date, endDate) {
            date_2 = value;
        }
    });
    standProduct.getList();
});
var standProduct = {
    pageLimit: rowCount,
    pageCurr: 1,
    index: 0,
    autoSelectId: "",
    array: [],
    sensorData: "",
    tabIndex: 0,
    landListData: "",
    date_2: "",
    timeArrStart: [],
    timeArrEnd: [],
    autoSelectData: "",
    standProductTable: function (res) {
        table.render({
            elem: '#standTable',
            cols: [
                [ //标题栏
                    {
                        type: 'numbers',
                        title: '序号',
                        align: 'center',
                    }, {
                        field: 'ModelName',
                        title: '名称',
                        align: 'center'
                    }, {
                        field: 'StartTime',
                        title: '创建时间',
                        align: 'center',
                        templet: function (d) {
                            return "2019-03-20 13:45:20"
                        }
                    }, {
                        title: '操作',
                        toolbar: '#stand_table',
                        align: 'center',
                    }
                ]
            ],
            data: res.data,
            skin: 'line',
            even: true,
            limit: standProduct.pageLimit,
            id: 'standTable'
        })
    },
    getList: function (moaelChNname, timeStart, timeEnd) {
            var modelData = {"id":0,"result":{"message":"ok","code":200},"data":[{"ID":"db6ca613-ea6f-4f4f-b538-d9900d637ef0","Name":"","Status":"生产中","CreateTime":"2019-11-28T10:26:21","In":null,"Out":null,"Proportion":null,"ModelName":"西红柿标准种植模型-系统内置","LandName":"妮娜皇后111","Day":57,"StartTime":"2019-11-01T00:00:00"}],"page":{"pageIndex":1,"pageSize":6,"totalData":1}}
            standProduct.standProductTable(modelData);
    },
    AddstandProduct: function (opera_type,id) {
        standProduct.array = [];
        standProduct.index = 0;
        var title = "模型名称:西红柿标准种植模型-系统内置";
        var fun_popup_tpl = document.getElementById('add_modelstand').innerHTML;
        laytpl(fun_popup_tpl).render({}, function (html) {
            layer.open({
                type: 1,
                content: html,
                title: [title, 'font-size:14px;height:40px;line-height:40px;'],
                area: ['700px', '360px'],
                success: function (index, layero) {
                    $("input").removeAttr("disabled", "disabled");
                    $("select").removeAttr("disabled", "disabled");
                    var Disable = 'layui-btn-disabled';
                    $(".site-action").removeClass(Disable);
                    $('.site-action').removeAttr('disabled', 'disabled');
                    if (opera_type == "look") {
                        var param = cloneObjectFn(paramList);
                        param['id'] = "1cbea027-9286-45d2-a25e-5b1cfcd8485f";
                        AjaxRequest(param, "model", "getmodelInfo").then(function (res) {
                            // console.log(res);
                            var modelData = JSON.parse(res);
                            standProduct.menuTop(modelData.data.CropStages, "update");
                            standProduct.submitPopup('update', id);
                            standProduct.GetlandList(opera_type, modelData.data.LandID);
                            standProduct.modelList(modelData.data.ModelName);
                            $('input[name=timechName').val(modelData.data.StartTime.split("T")[0]);
                            standProduct.getSensorList(modelData.data.LandID);
                            $("input").each(function () {
                                $(this).attr("disabled", "disabled");
                            })
                            $("select").each(function () {
                                $(this).attr("disabled", "disabled");
                            })
                            var Disable = 'layui-btn-disabled';
                            $(".site-action").addClass(Disable);
                            $('.site-action').attr('disabled', 'disabled');
                            $('input[name="modelchName"]').removeAttr("disabled");
                            $('input[name="timechName"]').removeAttr("disabled");
                        })
                    };
                }
            })
        })
    },
    // 渲染弹窗
    menuTop: function (modelData, type) {
        // console.log(modelData);
        $("#stage li").remove();
        $("#stage_params li").remove();
        $.each(modelData, function (index, item) {
            if (item.Type == "stage") {
                var temp = '<li key="' + item.ID + '">' +
                    '<span>' + item.Name + '</span>' +
                    '</li>';
                $("#stage").append(temp);
                var temp2 = $('<li class="document_info">' +
                    '<div class="Model_popurBottom">' +
                    '</div>' +
                    '</li>');

                var group = 0;
                $.each(item.Params, function (index2, item2) {
                    if (item2.Type == 'input') {
                        var temp = '<div class="popurTop">' +
                            '<span>持续周期 </span>' +
                            '<input PlarmID="' + item2.ID + '" type="text" StageID= "' + item.ID + '"  value="' + item2.Value + '"> &nbsp天' +
                            '<p class="timeD"></p>' +
                            '</div>';
                        temp2.find('.Model_popurBottom').append(temp);
                    }
                    if (item2.Type == 'inputs') {
                        var temp = '<div class="popurMiddle"></div>';
                        if (temp2.find('.popurMiddle').length == 0) {
                            temp2.find('.Model_popurBottom').append(temp);
                        }
                        var param = '<div class="popurMiddleTop" id="' + item.ID + item2.Group + '">' +
                            '<span>' + item2.Name + item2.Unit + '</span>' +
                            '<input PlarmID="' + item2.ID + '" StageID= "' + item.ID + '" type="text" value="' + item2.Value + '">' +
                            '</div>';
                        if (item2.Group != group) {
                            group = item2.Group;
                            temp2.find('.popurMiddle').append(param);
                        } else {
                            temp2.find('#' + item.ID + item2.Group + '').append(' <i></i><input PlarmID="' + item2.ID + '" StageID= "' + item.ID + '" type="text"  value="' + item2.Value + '">');
                        }
                    }
                })
                $("#stage_params").append(temp2);
                form.render('select');
            }
        });
        $("#stage_params li input").attr("disabled", "disabled");
        $("#stage li").each(function (i) {
            if (i == 0) {
                $(this).addClass('first_current');
            } else if (i == $("#stage li").length - 1) {
                $(this).addClass('last_current');
            } else {
                $(this).addClass('center_complete');
            }
        });
        $("#stage_params li").each(function (i) {
            if (i != 0) {
                $(this).hide();
            }
        });
        $(".popurBottom select").each(function (i) {
            var index = standProduct.index;
            // console.log(index);
            var filter = $(this).attr("lay-filter");
            var PlarmID = $(this).attr("PlarmID");
            var StageID = $(this).attr("StageID");
            var value = $(this).attr("value");
            var temp = {
                "PlarmID": PlarmID,
                "StageID": StageID,
                "Value": value,
            }
            standProduct.array.push(temp);
            form.on('select(' + filter + ')', function (data) {
                var temp = {
                    "PlarmID": PlarmID,
                    "StageID": StageID,
                    "Value": data.value
                };
                standProduct.array.splice(index, 1, temp);
            });
            standProduct.index++;
        })
        $("#stage li").on("click", function (event) {
            standProduct.tabIndex = $(this).index();
            standProduct.SetDateTime();
            var index = $(this).index();
            $("#stage li").removeClass('first_current').removeClass('centerki_complete').removeClass('lastki_current').removeClass('center_complete');
            if (index == 0) {
                $("#stage li").eq(index).addClass('first_current');
            } else if (index == $("#stage li").length - 1)
                $("#stage li").eq(index).addClass('lastki_current');
            else
                $("#stage li").eq(index).addClass('centerki_complete');
            $("#stage_params li").hide();
            $("#stage_params li").eq($(this).index()).show();
        })

        laydate.render({
            elem: '#plantStart',
            done: function (value, date, endDate) {
                standProduct.date_2 = value;
                standProduct.SetDateTime();
            }
        });
        // 时间起止
        $(".popurTop input").on("blur", function () {
            standProduct.SetDateTime();
        })
    },
    //删除一行
    experimentDl: function (tableObj) {
        var del_roles_Tpl = document.getElementById('del_exper_popup').innerHTML;
        laytpl(del_roles_Tpl).render(tableObj, function (html) {
            layer.open({
                id: 'del_exper_pop',
                type: 1,
                content: html,
                title: ['删除', 'font-size:16px;height:46px;line-height:46px;'],
                area: ['450px', '200px'],
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    // console.log(tableObj);
                    var param = cloneObjectFn(paramList);
                    param["id"] = tableObj.ID;
                    AjaxRequest(param, "model", "delete").then(function (res) {
                        var resule = JSON.parse(res);
                        if (resule.result.code == 200) {
                            layer.msg('操作成功');
                            layer.close(index);
                            standProduct.getList();
                        } else {
                            layer.msg('操作失败');
                        }
                    });
                },
            })
        })
    },
    lookData: function (data) {},
    // 设置时间
    getNewData: function (dateTemp, days, flag = 0, ) {
        var dateTemp = dateTemp.split("-");
        var nDate = new Date(dateTemp[1] + '-' + dateTemp[2] + '-' + dateTemp[0]); //转换为MM-DD-YYYY格式    
        var millSeconds;
        if (flag == 0) {
            millSeconds = Math.abs(nDate) + ((days - 1) * 24 * 60 * 60 * 1000);
        } else {
            millSeconds = Math.abs(nDate) + (days * 24 * 60 * 60 * 1000);
        }
        var rDate = new Date(millSeconds);
        var year = rDate.getFullYear();
        var month = rDate.getMonth() + 1;
        if (month < 10) month = "0" + month;
        var date = rDate.getDate();
        if (date < 10) date = "0" + date;
        return (year + "-" + month + "-" + date);
    },
    SetDateTime: function () {
        var index = standProduct.tabIndex;
        var day = 0;
        var today = 0 - $(".popurTop input").eq(index).val() * 1 + 2;
        for (var i = 0; i <= index; i++) {
            day += $(".popurTop input").eq(i).val() * 1;
        }
        if (standProduct.date_2 != "" && $(".popurTop input").eq(index).val() != "") {
            var end = standProduct.getNewData(standProduct.date_2, day);
            var start = standProduct.getNewData(end, today);
            $(".timeD").eq(standProduct.tabIndex).html("自：" + start + "~" + end);
        }
    },
    // 模型列表
    modelList: function (name) {
        var param = cloneObjectFn(paramList);
        AjaxRequest(param, "model", "getList").then(function (res) {
            // console.log(res)
            var formalModelData = JSON.parse(res);
            // if (type_open == "insert") {
                var standPselect = '<option value="' + 1 + '">' + "请选择模型列表" + '</option>';
            // }
            $.each(formalModelData.data, function (index, item) {
                if (name == item.Name) {
                    standPselect += '<option selected value="' + item.ID + '">' + item.Name + '</option>';
                } else {
                    standPselect += '<option value="' + item.ID + '">' + item.Name + '</option>';
                }
            })
            $("#plandModelName").html(standPselect);
            form.render('select');
            form.on('select(plandModelName)', function (data) {
                standProduct.getModelInfo(data.value);
                
            })
        })
    },
    // 获取模型内的所有数据
    getModelInfo: function (id) {
        standProduct.array = [];
        standProduct.index = 0;
        var param = cloneObjectFn(paramList);
        param['id'] = id;
        AjaxRequest(param, "model", "getmodelInfo").then(function (res) {
            var modelInfo = JSON.parse(res);
            standProduct.menuTop(modelInfo.data.CropStages, "insert")
            standProduct.sensorListOption();
        })
    },
    // 种植地块列表
    GetlandList: function (opera_type, id = 0, LandName) {
        var landSelect
        var param = cloneObjectFn(paramList);
        param["pageSize"] = listCount;
        param["pageIndex"] = 1;
        AjaxRequest(param, "land", "getLandListPage").then(function (res) {
            var landData = JSON.parse(res);
            standProduct.landListData = res;
            if (opera_type == 'insert') {
                landSelect = '<option value="' + 1 + '">' + "请选择种植地块" + '</option>';
            } else {
                $.each(landData.data, function (index, item) {
                    if (item.LandID == id) {
                        landSelect = '<option value="' + item.LandID + '">' + item.LandName + '</option>';
                    }
                })
            }
            $.each(landData.data, function (index, data) {
                landSelect = landSelect + '<option value="' + data.LandID + '">' + data.LandName +
                    '</option>'
            })
            $("#plandProduction").html(landSelect);
            form.render('select');
            form.on('select(plandProduction)', function (data) {
                standProduct.getSensorList(data.value);
            })
        });
    },
    // 根据地块获取地块内的所有设备
    getSensorList: function (landId) {
        var param = cloneObjectFn(paramList);
        param['landId'] = landId;
        AjaxRequest(param, "iot", "getIotDeviceInfo").then(function (res) {
            // console.log(res);
            standProduct.sensorData = JSON.parse(res);
            $("#sensor option").remove();
            standProduct.sensorListOption();
        })
    },
    sensorListOption: function () {
        $.each(standProduct.sensorData.data, function (index, item) {
            var count = $("#" + item.DeviceTypeID).length;
            if (count != 0) {
                var id = $("#" + item.DeviceTypeID).attr("value");
                if ($("#" + item.DeviceTypeID).html() == "") {
                    $("#" + item.DeviceTypeID).append('<option value="1">' + "请选择传感设备" + '</option>');
                }
                if (id == item.DeviceID) {
                    $("#" + item.DeviceTypeID).append('<option selected value="' + item.DeviceID + '">' + item.DeviceName + '</option>');
                } else {
                    $("#" + item.DeviceTypeID).append('<option value="' + item.DeviceID + '">' + item.DeviceName + '</option>');
                }
            }
        });
        form.render();
    },
    AutoList: function () {
        var param = cloneObjectFn(paramList);
        param["pageSize"] = listCount;
        param["pageIndex"] = 1;
        AjaxRequest(param, "automation", "getListPage").then(function (res) {
            // console.log(res);
            var autoData = JSON.parse(res);
            standProduct.autoSelectData = autoData;
        })
    },
    submitPopup: function (type,id) {
        form.on('submit(submitAddstand)', function (data) {
            var dayNum = 0;
            $("#stage_params input").each(function () {
                if ($(this).attr("PlarmID") != undefined) {
                    var temp = {
                        "PlarmID": $(this).attr("PlarmID"),
                        "StageID": $(this).attr("StageID"),
                        "Value": $(this).val()
                    };
                    standProduct.array.push(temp);
                }
            })
            $(".popurTop input").each(function (i) {
                dayNum += Number($(this).val());
            })
            var param = cloneObjectFn(paramList);
            var entityJson = {
                "ModelID": data.field.plandModelName,
                "Name": "",
                "Day": dayNum,
                "StartTime": data.field.timechName,
                "CropID": "469c8d0b-09be-11ea-87af-7cd30ab8a76c",
                "LandID": data.field.plandProduction,
                "ModelValues": standProduct.array,
            }
            if (type == "update") {
                entityJson.ID = id;
            }
            param["entity"] = getUTF8(entityJson);
            AjaxRequest(param, "model", type).then(function (res) {
                // console.log(res);
                // console.log(entityJson);
                // console.log(param);
                // console.log(type)
                var res = JSON.parse(res)
                if (res.result.code == 200) {
                    layer.closeAll();
                    standProduct.pageCurr = 1;
                    standProduct.getList();
                    layer.msg('操作成功', {
                        time: 2000
                    });
                } else {
                    layer.msg(res.result.msg, {
                        time: 2000
                    });
                    standProduct.array = [];
                    standProduct.index = 0;
                }
            })
        })
    },
}