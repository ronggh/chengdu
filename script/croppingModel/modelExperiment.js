$(function () {
    laydate.render({
        elem: '#date_experiment',
        range: true,
        theme: '#389bff',
        change: function (value, date, endDate) {
            date_2 = value;
        },
        done: function (value, date, endDate) {
            date_2 = value;
        }
    });
    Modelexperiment.getList();
    Modelexperiment.AutoList();
    //查询
    form.on("submit(experiment_formSearch)", function (data) {
        var moaelChNname = data.field.modelchName;
        var timeStart = data.field.timechName.split(" - ")[0];
        var timeEnd = data.field.timechName.split(" - ")[1];
        Modelexperiment.getList(moaelChNname, timeStart, timeEnd);
    });
    //重置
    form.on("submit(ResetBtn)", function () {
        $('input[name="modelchName"]').val("");
        $('input[name="timechName"]').val("")
        Modelexperiment.getList();
    });
    table.on('tool(experimentTable)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            Modelexperiment.experimentDl(data)
        }
    })
});
var Modelexperiment = {
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
    ModelexperiTable: function (res) {
        table.render({
            elem: '#experimentTable',
            cols: [
                [ //标题栏
                    {
                        type: 'numbers',
                        title: '序号',
                        align: 'center'
                    }, {
                        field: 'Name',
                        title: '名称',
                        align: 'center'
                    }, {
                        field: 'LandName',
                        title: '地块',
                        align: 'center'
                    }, {
                        field: 'CreateTime',
                        title: '创建时间',
                        align: 'center',
                        templet: function (d) {
                            return TimeReplice(d.CreateTime);
                        }
                    }, {
                        field: 'Status',
                        title: '状态',
                        align: 'center',
                    }, {
                        title: '操作',
                        toolbar: '#table_operate',
                        align: 'center',
                    }
                ]
            ],
            data: res.data,
            skin: 'line',
            even: true,
            limit: Modelexperiment.pageLimit,
            id: 'experimentTable'
        })
    },
    getList: function (moaelChNname, timeStart, timeEnd) {
        var param = cloneObjectFn(paramList);
        if (moaelChNname) {
            param["name"] = moaelChNname;
        }
        if (timeStart) {
            param["start"] = timeStart;
        }
        if (timeEnd) {
            param["end"] = timeEnd;
        }
        param["pageSize"] = Modelexperiment.pageLimit;
        param["pageIndex"] = Modelexperiment.pageCurr;
        param["type"] = 1;
        AjaxRequest(param, "model", "getListPage").then(function (res) {
            // console.log("<<<<<<<<模型试验>>>>>>>>");
            // console.log(param);
            // console.log(res);
            var ModelexperiData = JSON.parse(res);
            laypage.render({
                elem: 'um_pagenation',
                count: ModelexperiData.page.totalData,
                limit: Modelexperiment.pageLimit,
                curr: Modelexperiment.pageCurr,
                layout: ['count', 'prev', 'page', 'next', 'skip'],
                jump: function (obj, first) {
                    if (!first) {
                        Modelexperiment.pageCurr = obj.curr;
                        var param = cloneObjectFn(paramList);
                        param["pageSize"] = Modelexperiment.pageLimit;
                        param["pageIndex"] = Modelexperiment.pageCurr;
                        param["type"] = 1;
                        AjaxRequest(param, "model", "getListPage").then(function (res) {
                            var res = JSON.parse(res)
                            Modelexperiment.ModelexperiTable(res);
                        });
                    }
                }
            });
            Modelexperiment.ModelexperiTable(ModelexperiData);
        })
    },
    sddexperiment: function (opera_type, id) {
        Modelexperiment.array = [];
        Modelexperiment.index = 0;
        var title = "新增";
        if (opera_type == "update") {
            title = "编辑";
        }
        if (opera_type == "look") {
            title = "查看";
        }
        var fun_popup_tpl = document.getElementById('add_modelexperiment').innerHTML;
        laytpl(fun_popup_tpl).render({}, function (html) {
            layer.open({
                type: 1,
                content: html,
                title: [title, 'font-size:14px;height:40px;line-height:40px;'],
                area: ['670px', '730px'],
                success: function (index, layero) {
                    $("input").removeAttr("disabled", "disabled");
                    $("select").removeAttr("disabled", "disabled");
                    var Disable = 'layui-btn-disabled';
                    $(".site-action").removeClass(Disable);
                    $('.site-action').removeAttr('disabled', 'disabled');
                    var param = cloneObjectFn(paramList);
                    if (opera_type == "inster") {
                        param['id'] = "469c8d0b-09be-11ea-87af-7cd30ab8a76c"; //番茄的种植模型
                        AjaxRequest(param, "CropStage", "getCropStageInfo").then(function (res) {
                            // console.log(res);
                            var modelData = JSON.parse(res);
                            Modelexperiment.menuTop(modelData.data, "inster");
                            Modelexperiment.submitPopup('insert');
                            Modelexperiment.GetlandList(opera_type);
                        })
                    };
                    if (opera_type == "update") {
                        var param = cloneObjectFn(paramList);
                        param['id'] = id;
                        AjaxRequest(param, "model", "getmodelInfo").then(function (res) {
                            // console.log(res);
                            var modelData = JSON.parse(res);
                            Modelexperiment.menuTop(modelData.data.CropStages, "update");
                            Modelexperiment.submitPopup('update', id);
                            Modelexperiment.GetlandList(opera_type, modelData.data.LandID);
                            $('input[name=landchName').val(modelData.data.Name);
                            $('input[name=timechName').val(modelData.data.StartTime.split("T")[0]);
                            Modelexperiment.getSensorList(modelData.data.LandID);
                        })
                    };
                    if (opera_type == "look") {
                        param['id'] = id;
                        AjaxRequest(param, "model", "getmodelInfo").then(function (res) {
                            var modelData = JSON.parse(res);
                            Modelexperiment.menuTop(modelData.data.CropStages, "update");
                            Modelexperiment.submitPopup('update');
                            Modelexperiment.GetlandList(opera_type, modelData.data.LandID);
                            $('input[name=landchName').val(modelData.data.Name);
                            $('input[name=timechName').val(modelData.data.StartTime.split("T")[0]);
                            Modelexperiment.getSensorList(modelData.data.LandID);
                            $("input").each(function () {
                                $(this).attr("disabled", "disabled");
                            })
                            $("select").each(function () {
                                $(this).attr("disabled", "disabled");
                            })
                            var Disable = 'layui-btn-disabled';
                            $(".site-action").addClass(Disable);
                            $('.site-action').attr('disabled', 'disabled');
                            $('input[name="timechName"]').removeAttr("disabled");
                            $('input[name="modelchName"]').removeAttr("disabled");
                        })
                    };
                }
            })
        })
    },
    submitPopup: function (type, id) {
        form.on('submit(submitAddmodel)', function (data) {
            var Middleinput = [];
            var dayArr = [];
            var dayNum = 0;
            // 模型名称
            if (!one_Person.test(data.field.landchName)) {
                layer.msg('模型名称有误', {
                    time: 1500
                });
                return false;
            }
            $.each($(".popurMiddle input"),function(index,item){
                Middleinput.push($(this).val())
            })
            for(i=0;i<Middleinput.length;i++){
                if (i%2 == 0) {
                    if (Number(Middleinput[i]) >= Number(Middleinput[i+1])) {
                        layer.msg('低值不能大于高值', {
                            time: 1500
                        });
                        return false;
                    }
                }
            }
            $(".popurTop input").each(function (i) {
                dayArr.push($(this).val());
            })
            for (let i = 0; i < dayArr.length; i++) {
                if (Number(dayArr[i]) > 0){
                    dayNum += Number(dayArr[i]);
                }else{
                    layer.msg('持续周期天数错误', {
                        time: 2000
                    })
                    return false;
                }
            }
            $("#stage_params input").each(function () {
                if ($(this).attr("PlarmID") != undefined) {
                    var temp = {
                        "PlarmID": $(this).attr("PlarmID"),
                        "StageID": $(this).attr("StageID"),
                        "Value": $(this).val()
                    };
                    Modelexperiment.array.push(temp);
                }
            })
            var param = cloneObjectFn(paramList);
            var entityJson = {
                "Name": data.field.landchName,
                "Day": dayNum,
                "StartTime": data.field.timechName,
                "CropID": "469c8d0b-09be-11ea-87af-7cd30ab8a76c",
                "LandID": data.field.plantchName,
                "ModelValues": Modelexperiment.array,
            }

            if (type == "update") {
                entityJson.ID = id;
            }
            // console.log(entityJson)；
            param["entity"] = getUTF8(entityJson);
            AjaxRequest(param, "model", type).then(function (res) {
                var res = JSON.parse(res)
                if (res.result.code == 200) {
                    layer.closeAll();
                    Modelexperiment.pageCurr = 1;
                    Modelexperiment.getList();
                    layer.msg('操作成功', {
                        time: 2000
                    });
                } else {
                    layer.msg(res.result.msg, {
                        time: 2000
                    });
                    // 新增后、失败清空数组
                    Modelexperiment.array = [];
                    Modelexperiment.index = 0;
                }
            })
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
                    var param = cloneObjectFn(paramList);
                    param["id"] = tableObj.ID;
                    AjaxRequest(param, "model", "delete").then(function (res) {
                        var resule = JSON.parse(res);
                        if (resule.result.code == 200) {
                            layer.msg('操作成功');
                            layer.close(index);
                            Modelexperiment.getList();
                        } else {
                            layer.msg('操作失败');
                        }
                    });
                },
            })
        })
    },
    menuTop: function (modelData, type) {
        $.each(modelData, function (index, item) {
            if (item.Type == "sensor") {
                $(".first_p").html(item.Name);
                $(".first_p").attr("data_id", item.ID);
                $("#sensor").attr({
                    "key": item.ID
                });
                $.each(item.Params, function (index2, item2) {
                    var temp1 = {
                        "StageID": item.ID,
                        "PlarmID": item2.ID,
                        "Value": item2.Value
                    }
                    Modelexperiment.array.push(temp1);
                    var temp = '<div class="layui-form-item">' +
                        '<label class="layui-form-label deverID" dever_ID = "' + item2.ID + '">' + item2.Name + ':</label>' +
                        '<div class="layui-input-block">' +
                        '<select lay-verify="required" id="' + item2.Type + '" type="' + item2.Type + '" name = "' + item2.ID + '" lay-filter="' + item2.ID + '" value="' + item2.Value + '">' +
                        '</select>' +
                        '</div>' +
                        '</div>';
                    $("#sensor").append(temp);
                    var index = Modelexperiment.index;
                    form.on('select(' + item2.ID + ')', function (data) {
                        var temp = {
                            "StageID": item.ID,
                            "PlarmID": item2.ID,
                            "Value": data.value
                        };
                        Modelexperiment.array.splice(index, 1, temp);
                    });
                    Modelexperiment.index++;
                })
            }
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
                            '<span>持续周期：</span>' +
                            '<input lay-verify="required" PlarmID="' + item2.ID + '" type="number" StageID= "' + item.ID + '"  value="' + item2.Value + '"> &nbsp天' +
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
                            '<input lay-verify="required" PlarmID="' + item2.ID + '" StageID= "' + item.ID + '" type="number" value="' + item2.Value + '">' +
                            '</div>';
                        if (item2.Group != group) {
                            group = item2.Group;
                            temp2.find('.popurMiddle').append(param);
                        } else {
                            temp2.find('#' + item.ID + item2.Group + '').append(' <i></i><input lay-verify="required" PlarmID="' + item2.ID + '" StageID= "' + item.ID + '" type="number"  value="' + item2.Value + '">');
                        }
                    }
                    if (item2.Type == 'select') {
                        var temp = '<div class="popurBottom">' +
                            '<div class="layui-form-item">' +
                            '<label class="layui-form-label" >关联自动化:</label>' +
                            '<div class="layui-input-block">' +
                            '<select lay-verify="required" PlarmID="' + item2.ID + '" StageID= "' + item.ID + '" lay-filter="' + item.ID + item2.ID + '" id = "' + item2.Value + '" value = "' + item2.Value + '">' +
                            Modelexperiment.selectSuto(item2.Value) +
                            '</select>' +
                            '</div>' +
                            '</div>' +
                            '</div>';
                        temp2.find('.Model_popurBottom').append(temp);
                    }
                })
                $("#stage_params").append(temp2);
            }
        });
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
            var index = Modelexperiment.index;
            var filter = $(this).attr("lay-filter");
            var PlarmID = $(this).attr("PlarmID");
            var StageID = $(this).attr("StageID");
            var value = $(this).attr("value");
            var temp = {
                "PlarmID": PlarmID,
                "StageID": StageID,
                "Value": value,
            }
            Modelexperiment.array.push(temp);
            form.on('select(' + filter + ')', function (data) {
                var temp = {
                    "PlarmID": PlarmID,
                    "StageID": StageID,
                    "Value": data.value
                };
                Modelexperiment.array.splice(index, 1, temp);
            });
            Modelexperiment.index++;
        })
        $("#stage li").on("click", function (event) {
            Modelexperiment.tabIndex = $(this).index();
            Modelexperiment.SetDateTime();
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
                Modelexperiment.date_2 = value;
                Modelexperiment.SetDateTime();
            }
        });
        // 时间起止
        $(".popurTop input").on("blur", function () {
            Modelexperiment.SetDateTime();
        })
    },
    //种植地块列表
    GetlandList: function (opera_type, id = 0, LandName) {
        var landSelect
        var param = cloneObjectFn(paramList);
        param["pageSize"] = listCount;
        param["pageIndex"] = 1;
        AjaxRequest(param, "land", "getLandListPage").then(function (res) {
            var landData = JSON.parse(res);
            Modelexperiment.landListData = res;
            if (opera_type == 'inster') {
                landSelect = '<option value="">' + "请选择种植地块" + '</option>';
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
            $("#plandModelLand").html(landSelect);
            form.render('select');
            form.on('select(plandModelLand)', function (data) {
                Modelexperiment.getSensorList(data.value);
            })
        });
    },
    //自动化列表
    AutoList: function () {
        var param = cloneObjectFn(paramList);
        param["pageSize"] = listCount;
        param["pageIndex"] = 1;
        AjaxRequest(param, "automation", "getListPage").then(function (res) {
            // console.log(res);
            var autoData = JSON.parse(res);
            Modelexperiment.autoSelectData = autoData;
        })
    },
    // 根据地块获取地块内的所有设备
    getSensorList: function (landId) {
        var param = cloneObjectFn(paramList);
        param['landId'] = landId;
        AjaxRequest(param, "iot", "getIotDeviceInfo").then(function (res) {
            // console.log(res)
            Modelexperiment.sensorData = JSON.parse(res);
            $("#sensor option").remove();
            Modelexperiment.sensorListOption();
        })
    },
    sensorListOption: function () {
        $.each(Modelexperiment.sensorData.data, function (index, item) {
            var count = $("#" + item.DeviceTypeID).length;
            if (count != 0) {
                var id = $("#" + item.DeviceTypeID).attr("value");
                if ($("#" + item.DeviceTypeID).html() == "") {
                    $("#" + item.DeviceTypeID).append('<option value="">' + "请选择传感设备" + '</option>');
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
        var index = Modelexperiment.tabIndex;
        var day = 0;
        var today = 0 - $(".popurTop input").eq(index).val() * 1 + 2;
        for (var i = 0; i <= index; i++) {
            day += $(".popurTop input").eq(i).val() * 1;
        }
        if (Modelexperiment.date_2 != "" && $(".popurTop input").eq(index).val() != "") {
            var end = Modelexperiment.getNewData(Modelexperiment.date_2, day);
            var start = Modelexperiment.getNewData(end, today);
            $(".timeD").eq(Modelexperiment.tabIndex).html("自：" + start + "~" + end);
        }
    },
    selectSuto: function (id) {
        var autoSelectId = '<option value="">' + "请选择关联自动化" + '</option>';
        $.each(Modelexperiment.autoSelectData.data, function (index, item) {
            if (id == item.ID) {
                autoSelectId += '<option selected value="' + id + '">' + item.Name + '</option>';
            } else {
                autoSelectId += '<option value="' + item.ID + '">' + item.Name + '</option>';
            }
        })
        return autoSelectId;
    }
}