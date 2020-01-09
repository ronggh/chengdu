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
    standProduct.AutoList()
    //查询
    form.on("submit(experiment_formSearch)", function (data) {
        var moaelChNname = data.field.modelchName;
        var timeStart = data.field.timechName.split(" - ")[0];
        var timeEnd = data.field.timechName.split(" - ")[1];
        standProduct.pageCurr = 1;
        standProduct.getList(moaelChNname, timeStart, timeEnd);
    });
    //重置
    form.on("submit(ResetBtn)", function () {
        $('input[name="modelchName"]').val("");
        $('input[name="timechName"]').val("")
        standProduct.getList();
    });
    
    table.on('tool(standTable)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            standProduct.experimentDl(data)
        }
    })
});
var standProduct = {
    pageLimit: rowCount,
    pageCurr: 1,
    index: 0,
    autoSelectId: "",
    array: [],
    lookArray: [],
    sensorData: "",
    tabIndex: 0,
    landListData: "",
    date_2: "",
    timeArrStart: [],
    timeArrEnd: [],
    autoSelectData: "",
    sensorTypeID:[],
    standProductTable: function (res) {
        table.render({
            elem: '#standTable',
            cols: [
                [ //标题栏
                    {
                        field:'',
                        title: '序号',
                        align: 'center',
                        width:"8%",
                        templet:function (data) {
                            return (standProduct.pageCurr - 1) * standProduct.pageLimit + data.LAY_INDEX;
                        }
                    },
                    {
                        field: 'LandName',
                        title: '地块',
                        align: 'center'
                    }, {
                        field: 'ModelName',
                        title: '使用模型',
                        align: 'center'
                    }, {
                        field: 'StartTime',
                        title: '开始种植日期',
                        align: 'center',
                        templet: function (d) {
                            return TimeReplice(d.CreateTime);
                        }
                    }, {
                        field: 'Day',
                        title: '生长周期(天)',
                        align: 'center'
                    }, {
                        field: 'Status',
                        title: '状态',
                        align: 'center'
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
        param["pageSize"] = standProduct.pageLimit;
        param["pageIndex"] = standProduct.pageCurr;
        param["type"] = 3;
        AjaxRequest(param, "model", "getListPage").then(function (res) {
            // console.log("<<<<<<<<标准化生产>>>>>>>>");
            // console.log(res);
            var modelData = JSON.parse(res);
            laypage.render({
                elem: 'um_pagenation',
                count: modelData.page.totalData,
                limit: standProduct.pageLimit,
                curr: standProduct.pageCurr,
                layout: ['count', 'prev', 'page', 'next', 'skip'],
                jump: function (obj, first) {
                    if (!first) {
                        standProduct.pageCurr = obj.curr;
                        var param = cloneObjectFn(paramList);
                        param["pageSize"] = standProduct.pageLimit;
                        param["pageIndex"] = standProduct.pageCurr;
                        param["type"] = 3;
                        AjaxRequest(param, "model", "getListPage").then(function (res) {
                            var res = JSON.parse(res)
                            standProduct.standProductTable(res);
                        });
                    }
                }
            });
            standProduct.standProductTable(modelData);
        })
    },
    AddstandProduct: function (opera_type,id) {
        standProduct.array = [];
        standProduct.index = 0;
        var title = "新增";
        if (opera_type == "update") {
            title = "编辑";
        }
        if (opera_type == "look") {
            title = "查看";
        }
        var fun_popup_tpl = document.getElementById('add_modelstand').innerHTML;
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
                    if (opera_type == "insert") {
                        standProduct.sensorTypeID = [];
                        var param = cloneObjectFn(paramList);
                        param['id'] = "469c8d0b-09be-11ea-87af-7cd30ab8a76c"; //番茄的种植模型
                        AjaxRequest(param, "CropStage", "getCropStageInfo").then(function (res) {
                            var modelData = JSON.parse(res);
                            standProduct.menuTop(modelData.data, "insert");
                            standProduct.GetlandList("insert");
                            standProduct.modelList();
                            standProduct.submitPopup("insert");
                        })
                    }
                    if (opera_type == "update") {
                        standProduct.sensorTypeID = [];
                        var param = cloneObjectFn(paramList);
                        param['id'] = id;
                        AjaxRequest(param, "model", "getmodelInfo").then(function (res) {
                            // console.log(res);
                            var modelData = JSON.parse(res);
                            standProduct.menuTop(modelData.data.CropStages, "update");
                            standProduct.submitPopup('update', id);
                            standProduct.GetlandList(opera_type, modelData.data.LandID);
                            standProduct.modelList(modelData.data.ModelName);
                            $('input[name=timechName').val(modelData.data.StartTime.split("T")[0]);
                            standProduct.date_2 = modelData.data.StartTime.split("T")[0];
                            standProduct.SetDateTime();
                            standProduct.getSensorList(modelData.data.LandID);
                        })
                    };
                    if (opera_type == "look") {
                        standProduct.sensorTypeID = [];
                        var param = cloneObjectFn(paramList);
                        param['id'] = id;
                        AjaxRequest(param, "model", "getmodelInfo").then(function (res) {
                            // console.log(res);
                            var modelData = JSON.parse(res);
                            standProduct.menuTop(modelData.data.CropStages, "look");
                            standProduct.submitPopup('look', id);
                            $('input[name=timechName]').val(modelData.data.StartTime.split("T")[0]);
                            standProduct.date_2 = modelData.data.StartTime.split("T")[0];
                            standProduct.SetDateTime();
                            standProduct.GetlandList(opera_type, modelData.data.LandID);
                            standProduct.modelList(modelData.data.ModelName);
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
                            // $('input[name="modelchName"]').removeAttr("disabled");
                            // $('input[name="timechName"]').removeAttr("disabled");
                        })
                    };
                },
                yes: function (index, layero) {
                    layer.close(index);
                    
                    $(".layui-layer-shade").remove();
                },
                cancel: function () {
                    $(".layui-layer-shade").remove();
                },
            })
        })
    },
    // 渲染弹窗
    menuTop: function (modelData, type) {
        // console.log(modelData);
        $("#stage li").remove();
        $("#stage_params li").remove();
        $.each(modelData, function (index, item) {
            if (item.Type == "sensor") {
                    standProduct.lookArray=item.Params;
                $(".first_p").html(item.Name);
                $(".first_p").attr("data_id", item.ID);
                $("#sensor").attr({
                    "key": item.ID
                });
                $("#sensor").html("");
                $.each(item.Params, function (index2, item2) {
                    var temp1 = {
                        "StageID": item.ID,
                        "PlarmID": item2.ID,
                        "Value": item2.Value
                    }
                    standProduct.sensorTypeID.push(item2.Type);
                    standProduct.array.push(temp1);
                    var temp = '<div class="layui-form-item">' +
                        '<label class="layui-form-label deverID" dever_ID = "' + item2.ID + '">' + item2.Name + ' </label>' +
                        '<div class="layui-input-block">' +
                        '<select lay-verify="required" id="' + item2.Type + '" type="' + item2.Type + '" name = "' + item2.ID + '" lay-filter="' + item2.ID + '" value="' + (type=="insert"?'':item2.Value) + '">' +

                        '</select>' +
                        '</div>' +
                        '</div>';
                    $("#sensor").append(temp);
                    form.render()
                    var index = standProduct.index;
                    form.on('select(' + item2.ID + ')', function (data) {
                        var temp = {
                            "StageID": item.ID,
                            "PlarmID": item2.ID,
                            "Value": data.value
                        };
                        standProduct.array.splice(index, 1, temp);
                    });
                    standProduct.index++;
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
                            temp2.find('#' + item.ID + item2.Group + '').append(' <i></i><input PlarmID="' + item2.ID + '" StageID= "' + item.ID + '" type="text"  value="' + item2.Value + '">' + (type == "look"?'<em class= "history" dever_ID="' + item.ID + '" StageID= "' + item2.ID + '" type="text"  value="' + item2.Value + '">查验</em>':""));
                        }
                    }
                    if (item2.Type == 'select') {
                        var temp = '<div class="popurBottom">' +
                            '<div class="layui-form-item">' +
                            '<label class="layui-form-label" >关联自动化 </label>' +
                            '<div class="layui-input-block">' +
                            '<select lay-verify="required" PlarmID="' + item2.ID + '" StageID= "' + item.ID + '" lay-filter="' + item.ID + item2.ID + '" id = "' + item2.Value + '"value = "'+ (type=="insert"?'':item2.Value) +'" >' +
                            // standProduct.autoSelectId +
                            standProduct.selectSuto(type=="insert"?'':item2.Value) +
                            '</select>' +
                            '</div>' +
                            '</div>' +
                            '</div>';
                        temp2.find('.Model_popurBottom').append(temp);
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
        standProduct.tabIndex = 0;
        standProduct.SetDateTime();
        stHistoryClick();
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
            $.each($("#stage_params li .history"),function(i){
                if($(this).parent().parent().parent().find(".timeD").html() != ""){
                    var time = $(this).parent().parent().parent().find(".timeD").html().split("：")[1].split("~");
                    var timeStart = time[0];
                    // 当前时间戳
                    var now = new Date();
                    var old = new Date(timeStart);
                    if(now < old){
                        $(this).css({background:"#ebebe4",color:"rgba(0, 0, 0, 0.65)",border:"1px solid #b7b9be"})
                    }
                }
            })
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
            var standPselect = '<option value="">' + "请选择模型列表" + '</option>';
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
                landSelect = '<option value="">' + "请选择种植地块" + '</option>';
            }
            $.each(landData.data, function (index, data) {
                if (data.LandID == id) {
                    landSelect = landSelect + '<option selected value="' + data.LandID + '">' + data.LandName + '</option>'
                } else {
                    landSelect = landSelect + '<option value="' + data.LandID + '">' + data.LandName + '</option>'
                }
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
        var selectSensorID = ArrRemoval(standProduct.sensorTypeID);
        for(var i = 0; i < selectSensorID.length; i++){
            $("#" + standProduct.sensorTypeID[i]).append('<option value="">' + "请选择传感设备" + '</option>');
        };
        $.each(standProduct.sensorData.data, function (index, item) {
            var count = $("#" + item.DeviceTypeID).length;
            if (count != 0) {
                var id = $("#" + item.DeviceTypeID).attr("value");
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
            var autoData = JSON.parse(res);
            standProduct.autoSelectData = autoData;
        })
    },
    selectSuto: function (id) {
        var autoSelectId = '<option value="">' + "请选择关联自动化" + '</option>';
        $.each(standProduct.autoSelectData.data, function (index, item) {
            if (id == item.ID) {
                autoSelectId += '<option selected value="' + id + '">' + item.Name + '</option>';
            } else {
                autoSelectId += '<option value="' + item.ID + '">' + item.Name + '</option>';
            }
        })
        return autoSelectId;
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
// 查验
function stHistoryClick(){
    $(".popurMiddle .history").on("click", function () {
        var time = $(this).parent().parent().parent().find(".timeD").html().split("：")[1].split("~");
        // console.log(time);
        // console.log($(this).parent().index())
        var deviceId = standProduct.lookArray[$(this).parent().index()].Value;
        var timeStart = time[0];
        var timeend = time[1];
        // 当前时间戳
        var now = new Date();
        var old = new Date(timeStart)
        var inputOne = $(this).parent().find("input").eq(0).val();
        var inputTwo = $(this).parent().find("input").eq(1).val();
        if(now > old){
            stechartinitfn(deviceId, timeStart, timeend,inputOne,inputTwo);
        }
    });
}

//echart表格加载
function stechartinitfn(deviceId, timeStart, timeend, inputOne, inputTwo) {
    var deviceId = deviceId;
    var Unit = "";
    var XAxisData = [];
    var series = [];
    var legendData = [];
    // 路径配置
    require.config({
        paths: {
            echarts: './libs/echarts-2.2.7/build/dist'
        }
    });
    // 使用
    require(
        [
            'echarts',
            'echarts/chart/line'
        ],
        function (ec) {
            var param = cloneObjectFn(paramList);
            param["deviceId"] = deviceId;
            param["start"] = timeStart;
            param["end"] = timeend;
            param["slot"] = "1";
            var postdata = GetPostData(param, "iot", "getDeviceSlotHistory"); //实时数据中的历史记录
            postFnajax(postdata).then(function (res) {
                // console.log("<<<<<<<< 实时数据 >>>>>>>>")
                // console.log(res);
                var result = JSON.parse(res);
                if(result.data.HistoryData.length < 1){
                    layer.msg('暂无数据', {
                        time: 2000
                    });
                    return false;
                }
                var data = [];
                var danwei = result.data.Unit;
                var elcelData = result.data.HistoryData;
                $.each(result.data.HistoryData, function (i, item) {
                    XAxisData.push((item.Time).replace(/T/g, " "));
                    data.push(item.Data);
                });
                timeHistoryData = elcelData;
                legendData.push(result.data.DeviceName);
                var ww = iframeW();
                var openTop = layer.open({
                    title: '查验',
                    type: 1,
                    area: [ww * 0.7 + "px", '520px'],
                    content: $("#chartStand"),
                    btn: ['关闭'],
                    yes: function (index, layero) {
                        layer.close(openTop);
                        $("#chartStand").css("display", "none");
                        $(".OutermostLayer").siblings("layui-layer-shade").remove();
                    },
                    cancel: function () {
                        layer.close(openTop);
                        $("#chartStand").css("display", "none");
                        $(".OutermostLayer").siblings("layui-layer-shade").remove();
                    },
                    success:function(){
                        $.each($(".layui-layer-shade"),function(index,item){
                            if(index>0){
                                $(this).remove();
                            }
                        })
                        var mask = $(".layui-layer-shade");
                        mask.appendTo($(".OutermostLayer").parent());
                        //其中：layero是弹层的DOM对象
                        $(".layui-layer-shade").css({'z-index':2000});
                        $("#chartStand").css({'z-index':200000})
                    }
                });
                $("#chartStand").css("display", "block")
                $("#echartcontainStand").css({
                    "width": ww * 0.65 + "px"
                });
                stechartfn('', legendData, danwei, XAxisData, data, ec,inputOne,inputTwo);
            });
        }
    );
}
function stechartfn(qname, legendData, danwei, time, series, obj,oneLine,twoLine) {
    var myChart = obj.init(document.getElementById('echartcontainStand'));
    var option = {
        animation: true,
        title: {
            text: qname,
            subtext: danwei
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: legendData
        },
        toolbox: {
            show: false,
            feature: {
                mark: {
                    show: true
                },
                dataZoom: {
                    show: true
                },
                dataView: {
                    show: true
                },
                magicType: {
                    show: true,
                    type: ['line', 'bar', 'stack', 'tiled']
                },
                restore: {
                    show: true
                },
                saveAsImage: {
                    show: true
                }
            }
        },
        calculable: true,
        dataZoom: {
            show: true,
            realtime: true,
            start: 60,
            end: 100
        },
        xAxis: [{
            name: '时间',
            type: 'category',
            boundaryGap: false,
            data: time,
            nameTextStyle: {
                color: "#999"
            }
        }],
        yAxis: [{
            type: 'value'
        }],
        series: [{
            data: series,
            type: 'line',
            markLine: {
                data: [
                  [
                    {name:"低值:" + oneLine, xAxis: 0, yAxis: oneLine, symbol: 'line'},
                    {xAxis: 240, yAxis: oneLine, symbol: 'line'},
                  ],
                  [
                    {name:"高值:" + twoLine, xAxis: 0, yAxis: twoLine, symbol: 'line'},
                    {xAxis: 240, yAxis: twoLine, symbol: 'line'},
                  ],
                ],
                lineStyle: {
                  normal: {
                    type: 'solid',
                    color: '#fff',
                  },
                },
            },
        }]
    };
    myChart.setOption(option, true);
}
