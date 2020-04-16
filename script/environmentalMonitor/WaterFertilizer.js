var timeHistoryData = "";
var deviceName = "";
var tabletemp = "";
var tableDeviceID = "";
var tabletitle = "";
var wfDeviceID = "";
var WatableIndex = 0;
var WasensorIndex = 0;
$(function () {
    $(".Refresh").click(function () {
        $(this).find("img").addClass("refresh");
        var obj = this;
        setTimeout(function () {
            $(obj).find("img").removeClass("refresh");
            GetArea($("#area").val())
        }, 500);
    });
    GetUserAreaList(); //获取地块
    waterfer = setInterval(function () {
        if($('input[name="waterFTimer"]').length == 0){
            clearInterval(waterfer);
            return;
        }
        GetArea($("#area").val());
    }, 180*1000);
    $(document).on("click", ".primary .level_one .operate .alerm", function () {
        serseid = $(this).attr("suid");
        deviceId = $(this).attr("deviceId");
        deviceIdAlerm = $(this).attr("deviceId");
        var add_manage_Tpl = document.getElementById('alerm_popup').innerHTML;
        var alermTop = laytpl(add_manage_Tpl).render({}, function (html) {
            layer.open({
                id: 'alerm_pop',
                type: 1,
                content: html,
                title: ["报警设置"],
                area: ['600px', '400px'],
                success: function (index, layero) {
                    $('#alerm_pop .layui-tab .layui-tab-title li').on('click',
                        function () {
                            $(this).addClass('layui-this selected')
                                .siblings().removeClass(
                                    'layui-this selected');
                            $(" .layui-tab-content .layui-tab-item").eq($(
                                    this).index()).addClass("layui-show")
                                .siblings().removeClass("layui-show");
                        })
                    $.each(landDeverData.data, function (index, item) {
                        if (deviceId == item.DeviceID) {
                            if (item.Slots[0].Alarm) {
                                var index = ""
                                var EnableHigh = item.Slots[0].Alarm
                                    .EnableHigh;
                                var HighValue = item.Slots[0].Alarm
                                    .HighValue;
                                var EnableLow = item.Slots[0].Alarm
                                    .EnableLow;
                                var LowValue = item.Slots[0].Alarm
                                    .LowValue;
                                if (EnableHigh == true && HighValue !=
                                    null && EnableLow == false &&
                                    LowValue == null) {
                                    index = 0
                                } else if (EnableHigh == false &&
                                    HighValue == null && EnableLow ==
                                    true && LowValue != null) {
                                    index = 1
                                } else if (EnableHigh == true &&
                                    HighValue != null && EnableLow ==
                                    true && LowValue != null) {
                                    if (HighValue < LowValue) {
                                        index = 2
                                    }
                                    if (HighValue > LowValue) {
                                        index = 3
                                    }
                                    if (HighValue == LowValue) {
                                        index = 4
                                    }
                                }
                                $('#alerm_pop .layui-tab .layui-tab-title li')
                                    .eq(index).addClass(
                                        'layui-this selected')
                                    .siblings().removeClass(
                                        'layui-this selected');
                                $(" .layui-tab-content .layui-tab-item")
                                    .eq($(this).index()).addClass(
                                        "layui-show").siblings()
                                    .removeClass("layui-show");
                                $(".layui-tab-content .layui-show")
                                    .find("input").eq(0).val(HighValue);
                                $(".layui-tab-content .layui-show")
                                    .find("input").eq(1).val(LowValue);

                            }
                        }
                    })
                }
            })
        })
    });
    $("#qixiang").css("display", "none").find("ul").html("");
    $("#qita").css("display", "none").find("ul").html("");
    $("#turang").css("display", "none").find("ul").html("");
    $("#shuizhi").css("display", "none").find("ul").html("");
    $("#kongqi").css("display", "none").find("ul").html("");
})

//获取所有的地块
function GetUserAreaList() {
    var param = cloneObjectFn(paramList);
    param["pageSize"] = 100;
    param["pageIndex"] = 1;
    var postdata = GetPostData(param, "land", "getLandListPage");
    postFnajax(postdata).then(function (res) {
        // console.log(res);
        var landSelect = "";
        var landData = JSON.parse(res);
        $.each(landData.data, function (index, data) {
            if(data.FertilizerSensorCount != 0 || data.FertilizerControllerCount != 0){
                landSelect = landSelect + '<option value="' + data.LandID + '">' + data.LandName +
                '</option>'
            }
        })
        $("#area").html(landSelect);
        form.render('select');
        GetArea($("#area").val()); //进入页面获取地块ID，获取设备渲染页面
        form.on('select(quiz)', function (data) { //切换地块获取设备渲染页面
            GetArea(data.value);
        })
    });
};
//根据地块获取地块内的设备
function GetArea(landId) { //, status, loading
    var CONTROLLER = 0;
    var SENSOR = 0;
    var param = cloneObjectFn(paramList);
    param["landId"] = landId;
    var postdata = GetPostData(param, "iot", "getIotDeviceInfo");
    postFnajax(postdata).then(function (res) {
        // console.log(res);
        $("#tabNav2").html("");
        $("#qita ul").html("");
        var result = JSON.parse(res);
        result.data.sort(function (value1,value2) {
            return value1.DeviceName.localeCompare(value2.DeviceName,'zh-CN') ;
        });
        $.each(result.data, function (i) {
            if (result.data[i].Tags.length > 0 && result.data[i].Tags[0].Tag == "水肥机" && result.data[i].DeviceCategory == "CONTROLLER") {
                //     delete result.data[i];
                wfDeviceID = result.data[i].DeviceID;
                CONTROLLER++;
                if (result.data[i].IsOnline != 1)
                    CONTROLLER++;
                $("#equirementcontrol").css("display", "block");
                var Device = ""; //开关停
                if ((result.data[i].DeviceTypeID == 13) || (result.data[i].DeviceTypeID ==
                        4001)) {
                    if (result.data[i].IsOnline != 1)
                        Device += "<div class=\"equireitem unlive\" DeviceID=\"" + result.data[
                            i].DeviceID + "\" SlotType=\"" + result.data[i].Slots[0].SlotID +
                        "\">";
                    else
                        Device += "<div class=\"equireitem\" DeviceID=\"" + result.data[i]
                        .DeviceID + "\" SlotType=\"" + result.data[i].Slots[0].SlotID + "\">";
                    Device += "<span>" + result.data[i].DeviceName + "</span>";
                    Device += "<span class=\"controlswitch\">";
                    if (result.data[i].Slots[0].Data == 1) { //开
                        Device += "<span class=\"conitem\">关</span>";
                        Device += "<span class=\"conitem\">停</span>";
                        Device += "<span class=\"conitem active\">开</span>";
                        Device +=
                            "<span class=\"switch\" style=\"left:66.8%;background-color:#5cb948\"></span>";
                    } else if (result.data[i].Slots[0].Data == 2) { //关
                        Device += "<span class=\"conitem active\">关</span>";
                        Device += "<span class=\"conitem\">停</span>";
                        Device += "<span class=\"conitem\">开</span>";
                        Device +=
                            "<span class=\"switch\" style=\"left:0%;background-color:#fe4d4d\"></span>";
                    } else if (result.data[i].Slots[0].Data == 3) { //停
                        Device += "<span class=\"conitem\">关</span>";
                        Device += "<span class=\"conitem active\">停</span>";
                        Device += "<span class=\"conitem\">开</span>";
                        Device +=
                            "<span class=\"switch\" style=\"left:34%;background-color:#f9b72c\"></span>";
                    }
                    Device += "</span>";
                    if (result.data[i].IsOnline != 1)
                        Device += "<span class=\"unlive\">已离线</span>";

                    Device += "<span class=\"olddata\"></span>";
                    Device += "</div>";
                } else if ((result.data[i].DeviceTypeID == 14) || (result.data[i]
                        .DeviceTypeID == 4002)) {
                    if (result.data[i].IsOnline != 1) {
                        Device += "<div class=\"equireitem twoswitch unlive\" DeviceID=\"" +
                            result.data[i].DeviceID + "\" SlotType=\"" + result.data[i].Slots[0]
                            .SlotID + "\">";
                    } else {
                        Device += "<div class=\"equireitem twoswitch\" DeviceID=\"" + result
                            .data[i].DeviceID + "\" SlotType=\"" + result.data[i].Slots[0]
                            .SlotID + "\">";
                    }
                    Device += "<span>" + result.data[i].DeviceName + "</span>";
                    Device += "<span class=\"controlswitch\">";
                    if (result.data[i].Slots[0].Data == 1) { //开
                        Device += "<span class=\"conitem\">关</span>";
                        Device += "<span class=\"conitem active\">开</span>";
                        Device +=
                            "<span class=\"switch\" style=\"left:66.8%;background-color:#5cb948\"></span>";
                    } else if (result.data[i].Slots[0].Data == 0) { //关
                        Device += "<span class=\"conitem active\">关</span>";
                        Device += "<span class=\"conitem\">开</span>";
                        Device +=
                            "<span class=\"switch\" style=\"left:0%;background-color:#fe4d4d\"></span>";
                    }
                    Device += "</span>";
                    if (result.data[i].IsOnline != 1)
                        Device += "<span class=\"unlive\">已离线</span>";
                    Device += "<span class=\"olddata\"></span>";
                    Device += "</div>";
                }
                $("#tabNav2").append(Device);
            }
            if (result.data[i].DeviceCategory == "SENSOR") {
                var img = '../../images/sensor_white/' + result.data[i].Slots[0].SensorTypeID + '.png';
                var danger = "level_two";
                var Device = "";
                Device += "<li class=\"" + danger + "\" id=\"" + result.data[i].DeviceID + "\">";
                Device += " <div class=\"label\">";
                Device += "<img src=\"" + img + "\" style=\"width:18px;\" alt=\"\">";
                Device += result.data[i].DeviceName;
                Device += "</div>";
                Device += "<div class=\"wrap_border\">";
                if (result.data[i].IsOnline != 1) {
                    Device += "<div class=\"detail hidden\">";
                } else {
                    Device += "<div class=\"detail\">";
                }
                var value = SensorNumException(result.data[i].Slots[0].Data);
                Device += "<div class=\"creact_num\"><span>" + value + "</span><sup>" + NullEmpty(
                    result.data[i].Slots[0].Unit) + "</sup></div>";
                Device += "</div>";
                if (result.data[i].IsOnline != 1)
                    Device += "<div class=\"offline_detail\"></div>";
                Device += "<div class=\"fresh_time clearfix\">";
                Device += "<div class=\"fl\">";

                if (result.data[i].IsOnline != 1) {
                    Device += "<span class=\"offline_status\">离线</span>";
                }
                Device += "</div>";
                if (result.data[i].IsOnline != 1) {
                    Device += " <div class=\"fr hidden\">" + NullEmpty(result.data[i].Slots[0].Time) +
                        "</div>";
                } else {
                    Device += " <div class=\"fr\">" + timeago(NullEmpty(result.data[i].Slots[0].Time)) +
                        "</div>";
                }
                Device += "</div>";
                Device += "<div class=\"operate clearfix\">";
                Device += "<div class=\"history fr\" data-typeid=\"7288\" deviceId=\"" + result.data[i]
                    .DeviceID + "\" deviceName=\"" + result.data[i].DeviceName + "\" slotId=\"" + result.data[i].Slots[
                        0].SlotID + "\" deviceTypeId=\"" + result.data[i].DeviceTypeID + "\" >";
                Device += "<img src=\"../../images/history.png\" alt=\"\">历史数据</div>";
                Device += "</div>";
                Device += "</div>";
                Device += "</li>";
                $.each(result.data[i].Tags, function (p, item1) {
                    if (item1.Tag == "水肥机") {
                        SENSOR++;
                        $("#qita ul").append(Device);
                        $("#qita").css("display", "block");
                    }
                });
            }
        });
        if (CONTROLLER > 0 || SENSOR >0) {
            $(".setUp").css({'display':'block'})
        }else{
            $(".setUp").css({'display':'none'});
        }
        //历史记录 历史记录 历史记录 弹出层 ---------开始-----------
        $(".primary .level_one .operate .history").on("click", function () {
            $("#dateTimeDiv").hide();
            var deviceId = $(this).attr("deviceId");
            var deviceName = $(this).attr("deviceName");
            var slotId = $(this).attr("slotId");
            var deviceTypeId = $(this).attr("deviceTypeId");
            GetHistory(deviceId, deviceName, slotId, deviceTypeId);
        });
        //点击事件调取历史记录
        $("#equirementcontrol .equirecon .equireitem span.olddata").on("click", function () {
            $("#dateswitch").hide();
            $("#switch tbody").html("");
            $("#dateTime2").val("");
            $("#switch .switchTime ul li").removeClass("active");
            $("#switch .switchTime ul li").eq(0).addClass("active");
            tabletemp = $(this).closest(".equireitem");
            tableDeviceID = tabletemp.attr("DeviceID");
            tabletitle = tabletemp.find("span").eq(0).text();
            var time  = -1;
            tableCont(tableDeviceID, time, tabletemp, tabletitle)
        });
        //设备可控制开关 样式控制
        SwitchCss();
    })
}

function SensorNumException(num) {
    if (num != null) {
        return num;
    }
    return "";
};
// 开关停
function SwitchCss(){
    //设备可控制开关 样式控制
    $("#equirementcontrol .equirecon .equireitem .controlswitch span").on("click", function () {
        var str = $(this).closest(".equireitem");
        var message = "";
        var temp = $(this);
        var DeviceID = $(this).closest(".equireitem").attr("DeviceID");
        var SlotType = $(this).closest(".equireitem").attr("SlotType");
        var Action = ""
        var value = $(this).html();
        if (value == "开") {
            message = "正在打开……";
            Action = "OPEN";
        } else if (value == "关") {
            message = "正在关闭……";
            Action = "CLOSE";
        } else if (value == "停") {
            message = "正在停止……";
            Action = "STOP";
        }
        if (value == $(this).parent().find('.active').html()) {
            if (value == "开") {
                layer.msg('不能重复开启', {time: 2000});
                return false;
            }
            if (value == "停") {
                layer.msg('不能重复停止', {time: 2000});
                return false;
            }
            if (value == "关") {
                layer.msg('不能重复关闭', {time: 2000});
                return false;
            }
        }
        var param = cloneObjectFn(paramList);
        param["deviceId"] = DeviceID;
        param["slot"] = SlotType;
        param["action"] = Action;
        var postdata = GetPostData(param, "iot", "sensorControl");
        afterFnajax(postdata).then(function (res) {
            var resData = JSON.parse(res);
            if (resData.result.code == 200) { //操作成功
                var switchindex = temp.index();
                temp.addClass("active").siblings("span.conitem").removeClass("active");
                if (temp.closest(".equireitem").hasClass("twoswitch")) {
                    if (switchindex == 0) {
                        temp.siblings("span.switch").animate({
                            "left": "0%"
                        }, 300).css("background-color", "#fe4d4d");
                    } else if (switchindex == 1) {
                        temp.siblings("span.switch").animate({
                            "left": "67%"
                        }, 300).css("background-color", "#5cb948");
                    }
                } else if (switchindex == 1) {
                    temp.siblings("span.switch").animate({
                        "left": switchindex * 33.4 + "%"
                    }, 300).css("background-color", "#f9b72c");
                } else if (switchindex == 2) {
                    temp.siblings("span.switch").animate({
                        "left": switchindex * 33.4 + "%"
                    }, 300).css("background-color", "#5cb948");
                } else {
                    temp.siblings("span.switch").animate({
                        "left": switchindex * 33.4 + "%"
                    }, 300).css("background-color", "#fe4d4d");
                }
                layer.msg('操作成功', {
                    icon: 1,
                    time: 2000
                })
            } else {
                layer.msg('操作失败', {
                    icon: 2,
                    time: 2000
                });
            }
        })
    });
}

// 操作记录
function tableCont(DeviceID, timeDate, temp, title) {
    var param = cloneObjectFn(paramList);
    var time;
    if (timeDate.length > 10) {
        time = timeDate.split(" - ")
    }
    if (time) {
        param["start"] = time[0];
        param["end"] = time[1];
    } else {
        param["day"] = timeDate;
    }
    param["deviceId"] = DeviceID;
    param["slot"] = 1;
    var postdata = GetPostData(param, "iot", "getControlHistory"); //实时数据中的历史记录
    echesFnajax(postdata).then(function (res) {
        var Result = JSON.parse(res);
        if (typeof (Result.result.Msg) != "undefined") {
            location.reload();
        }
        if (Result.result.code = "200") {
            $("#switch tbody").html("");
            // if (Result.data) {
                $.each(Result.data, function (i) {
                    var temp = "";
                    temp += "<tr>";
                    temp += "<td>" + Result.data[i].UserName + "</td>";
                    if (Result.data[i].Operation == "OPEN")
                        temp += "<td class=\"open\">开</td>";
                    if (Result.data[i].Operation == "CLOSE")
                        temp += "<td class=\"close\">关</td>";
                    if (Result.data[i].Operation == "STOP")
                        temp += "<td class=\"stop\">停</td>";
                    temp += "<td>" + Result.data[i].OperationTime.replace("T", " ") +
                        "</td>";
                    if (Result.data[i].ControlResult == 1)
                        temp += "<td>成功</td>";
                    else
                        temp += "<td class=\"failure\">失败</td>";
                    temp += "</tr>";
                    $("#switch tbody").append(temp);
                });
                layer.open({
                    title: title,
                    type: 1,
                    area: ["600px", '420px'],
                    content: $("#switch"),
                    btn: ['关闭'],
                    yes: function (index, layero) {
                        layer.close(index);
                        WatableIndex = 0;
                        $("#switch").hide();
                        $(".layui-layer-shade").remove();
                        //按钮【按钮二】的回调
                        //return false 开启该代码可禁止点击该按钮关闭
                    },
                    btn2: function (index, layero) {
                        $("#switch").hide();
                        WatableIndex = 0;
                        $(".layui-layer-shade").remove();
                        //按钮【按钮二】的回调
                        //return false 开启该代码可禁止点击该按钮关闭
                    },
                    cancel: function () {
                        $("#switch").hide();
                        WatableIndex = 0;
                        $(".layui-layer-shade").remove();
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
                        $("#switch").css({'z-index':200000})
                    },
                });
            // }else{
            //     layer.msg("暂无操作记录", {
            //         time: 2500
            //     });
            // }
            $("#switch").css("display", "block");
        }
    })
}

$(".btnexcel").on("click", function () {
    //列标题，逗号隔开，每一个逗号就是隔开一个单元格
    let str = `日期,数值\n`;
    //增加\t为了不让表格显示科学计数法或者其他格式
    $.each(timeHistoryData,function(index,item){
        timeHistoryData[index].Time = TimeReplice(timeHistoryData[index].Time);
    })
    for (let i = 0; i < timeHistoryData.length; i++) {
        for (let item in timeHistoryData[i]) {
            str += `${timeHistoryData[i][item] + '\t'},`;
        }
        str += '\n';
    }
    //encodeURIComponent解决中文乱码
    let uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
    //通过创建a标签实现
    var link = document.createElement("a");
    link.href = uri;
    //对下载的文件命名
    link.download = deviceName[0] + "数据表.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
})

function NullEmpty(str) {
    if (str == null)
        return "0";
    return str;
}

function GetHistory(deviceId, name, slotId, deviceTypeId) {
    $("#dateTime").val("");
    $(".chartbtn1 ul li").removeClass("active");
    $(".chartbtn1 ul li").eq(0).addClass("active");
    ExcelSlotId = slotId;
    ExcelTypeID = deviceTypeId;
    Device = deviceId;
    /*获取每个类别的typeid，例如土壤类下面铅离子的typeid，用于ajax请求获取历史数据渲染echarts表*/
    //var typeid = $(this).data("typeid");
    var id = deviceId + ":" + slotId + ",";
    ExcelDeviceId = id;
    var timeDate = -1
    // console.log(Device);
    echartinitfn(deviceId, slotId, timeDate);
}
// 操作记录
$(document).on("click", "#switch ul li", function () {
    $("#dateTime2").val("");
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
    timeDate = $(this).attr("time");
    if ($(this).index() != 3) {
        $("#dateswitch").hide();
        if(WatableIndex == $(this).index()){
            return false;
        }
        $("#switch tbody").html("");
        WatableIndex = $(this).index();
        tableCont(tableDeviceID, timeDate, tabletemp, tabletitle);
    }else{
        WatableIndex = 3;
        $("#dateswitch").show();
    }
})

// 历史记录
$(document).on("click", ".chartbtn1 ul li", function () {
    $("#dateTime").val("");
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
    timeDate = $(this).attr("time");
    if ($(this).index() != 3) {
        $("#dateTimeDiv").hide();
        if(WasensorIndex == $(this).index()){
            return false;
        }
        WasensorIndex = $(this).index();
        // console.log(Device);
        echartinitfn(Device, ExcelSlotId, timeDate);
    }else{
        WasensorIndex = 3;
        $("#dateTimeDiv").show();
    }
})

initLayuifn(['element', 'form', 'table', 'layer', 'laytpl', 'laypage', 'laydate', 'upload', 'tree', 'util', 'transfer'], function () {
    form.render();
    laydate.render({
        elem: '#dateTime',
        range: true,
        theme: '#389bff',
        done: function (value, date, endDate) {
            var timeStart = value.split(' - ')[0];
            var timeEnd = value.split(' - ')[1];
            if (timeStart.slice(0,4) == timeEnd.slice(0,4)) {
                echartinitfn(Device, ExcelSlotId, value);
            } else {
                layer.msg("查询日期不能跨年",{time:1500})
            }
        }
    });
    laydate.render({
        elem: '#dateTime2',
        range: true,
        theme: '#389bff',
        done: function (value, date, endDate) {
            $("#switch tbody").html("");
            var timeStart = value.split(' - ')[0];
            var timeEnd = value.split(' - ')[1];
            if (timeStart.slice(0,4) == timeEnd.slice(0,4)) {
                tableCont(tableDeviceID, value, tabletemp, tabletitle);
            } else {
                layer.msg("查询日期不能跨年",{time:1500})
            }
        }
    });
})
function SetList(name, type, data) {
    this.name = name;
    this.type = type;
    this.data = data;
}

function waterFerSet(){
    var fun_popup_tpl = document.getElementById('add_waterFer').innerHTML;
    laytpl(fun_popup_tpl).render({}, function (html) {
        layer.open({
            type: 1,
            content: html,
            title: ["肥速设定", 'font-size:14px;height:40px;line-height:40px;'],
            area: ['670px', '500px'],
            success: function (index, layero) {
                form.render();
                var param = cloneObjectFn(paramList);
                param['LandId'] = $("#area").val();
                AjaxRequest(param, "machineSettings", "getMachine").then(function (res) {
                    // console.log(res)
                    var FertilizerData = JSON.parse(res);
                    if (FertilizerData.result.code==200) {
                        $('input[name="MachineID"]').val(FertilizerData.data.Id);
                        $('input[name="ferSpeedA"]').val(new Number(FertilizerData.data.SpeedA).toFixed(1));
                        $('input[name="ferSpeedB"]').val(new Number(FertilizerData.data.SpeedB).toFixed(1));
                        $('input[name="ferSpeedC"]').val(new Number(FertilizerData.data.SpeedC).toFixed(1));
                        $('input[name="ferSpeedD"]').val(new Number(FertilizerData.data.SpeedD).toFixed(1));
                        $('input[name="ECSmall"]').val(new Number(FertilizerData.data.ECMin).toFixed(1));
                        $('input[name="ECbig"]').val(new Number(FertilizerData.data.ECMax).toFixed(1));
                        $('input[name="PHsmall"]').val(new Number(FertilizerData.data.PHMin).toFixed(1));
                        $('input[name="PHbig"]').val(new Number(FertilizerData.data.PHMax).toFixed(1));
                        $("#ecEnable option[value='"+ FertilizerData.data.ECState +"']").attr("selected","selected");
                        $("#phEnable option[value='"+ FertilizerData.data.PHState +"']").attr("selected","selected");
                    }       
                    form.render();         
                    setUpSubmit();
                })
            }
        })
    })
}

function setUpSubmit(){
    form.on('submit(setUpSure)', function (data) {
        if (!setUPFer_res.test(data.field.ferSpeedA) || Number(data.field.ferSpeedA) <= 0 || Number(data.field.ferSpeedA) > 11.9) {
            layer.msg('A肥速范围0-11.9之间的一位小数', {
                time: 1500
            });
            return false;
        }
        if (!setUPFer_res.test(data.field.ferSpeedB) || Number(data.field.ferSpeedB) <= 0 || Number(data.field.ferSpeedB) > 11.9) {
            layer.msg('B肥速范围0-11.9之间的一位小数', {
                time: 1500
            });
            return false;
        }
        if (!setUPFer_res.test(data.field.ferSpeedC) || Number(data.field.ferSpeedC) <= 0 || Number(data.field.ferSpeedC) > 11.9) {
            layer.msg('C肥速范围0-11.9之间的一位小数', {
                time: 1500
            });
            return false;
        }
        if (!setUPFer_res.test(data.field.ferSpeedD) || Number(data.field.ferSpeedD) <= 0 || Number(data.field.ferSpeedD) > 11.9) {
            layer.msg('D肥速范围0-11.9之间的一位小数', {
                time: 1500
            });
            return false;
        }
        if (!setUPFer_res.test(data.field.ECSmall) || Number(data.field.ECSmall) <= 0) {
            layer.msg('EC值为大于零的一位小数', {
                time: 1500
            });
            return false;
        }
        if (!setUPFer_res.test(data.field.ECbig) || Number(data.field.ECbig) <= 0) {
            layer.msg('EC值为大于零的一位小数', {
                time: 1500
            });
            return false;
        }
        if (Number(data.field.ECSmall) >= Number(data.field.ECbig)) {
            layer.msg('EC最大值与最小值设置出错', {
                time: 1500
            });
            return false;
        }
        if (!setUPFer_res.test(data.field.PHsmall) || Number(data.field.PHsmall) < 0 || Number(data.field.PHsmall) > 14) {
            layer.msg('PH值0-14间的一位小数', {
                time: 1500
            });
            return false;
        }
        if (!setUPFer_res.test(data.field.PHbig) || Number(data.field.PHbig) < 0 || Number(data.field.PHbig) > 14) {
            layer.msg('PH值0-14间的一位小数', {
                time: 1500
            });
            return false;
        }
        if (Number(data.field.PHsmall) >= Number(data.field.PHbig)) {
            layer.msg('PH最大值与最小值设置出错', {
                time: 1500
            });
            return false;
        }
        var param = cloneObjectFn(paramList);
        var entityjson = {
            "LandId":$("#area").val(),
            "DeviceId":wfDeviceID,
            "SpeedA":data.field.ferSpeedA,
            "SpeedB":data.field.ferSpeedB,
            "SpeedC":data.field.ferSpeedC,
            "SpeedD":data.field.ferSpeedD,
            "ECState":data.field.ecEnable,
            "ECMax":data.field.ECbig,
            "ECMin":data.field.ECSmall,
            "PHState":data.field.phEnable,
            "PHMin":data.field.PHsmall,
            "PHMax":data.field.PHbig,
            "id":data.field.MachineID==""?"016bc235-aa45-430f-9071-dd78e7942f39":data.field.MachineID,
        }
        var type= (data.field.MachineID == ""?"insert":"update");
        param['entity'] = getUTF8(entityjson);
        var postdata = GetPostData(param, "machineSettings", type);
        afterFnajax(postdata).then(function (res) {
            var result = JSON.parse(res);
            var msg = "";
            if (result.result.code == 200) {
                layer.closeAll();
                msg = "操作成功"
            } else {
                msg = "发送失败，设备离线或水肥机配置错误";
            }
            layer.msg(msg, {
                time: 2000
            });
        })
    })
}