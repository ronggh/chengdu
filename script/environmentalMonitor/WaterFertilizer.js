var Interval = false;
var timeHistoryData = "";
var deviceName = "";
var tabletemp = "";
var tableDeviceID = "";
var tabletitle = "";
$(function () {
    $(".Refresh").click(function () {
        $(this).find("img").addClass("refresh");
        var obj = this;
        setTimeout(function () {
            $(obj).find("img").removeClass("refresh");
            //alert("刷新数据1");
            // console.log($("#area").val())
            GetArea($("#area").val())
        }, 500);
    });
    GetUserAreaList(); //获取地块
    setInterval(function () {
        if (Interval) {
            GetArea($("#area").val());
        }
    }, 15000);
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
    //历史记录 历史记录 历史记录 弹出层 ---------开始-----------
    $(document).on("click", ".primary .level_one .operate .history", function () {
        $("#dateTimeDiv").hide();
        var deviceId = $(this).attr("deviceId");
        var deviceName = $(this).attr("deviceName");
        var slotId = $(this).attr("slotId");
        var deviceTypeId = $(this).attr("deviceTypeId");
        // alert("1111");
        // console.log(deviceId);
        // console.log(deviceName);
        // console.log(slotId);
        // console.log(deviceTypeId);
        GetHistory(deviceId, deviceName, slotId, deviceTypeId);
    });
    //导出excel 高级模式
    $("#chart .chartbtn .btnmore").bind('click', function () {
        // alert()
        // array.length = 0;
        var str = Device + ":" + ExcelSlotId + ":" + $("#" + Device).attr("title");
        // array.push(str);
        layer.closeAll();
        // console.log(window.location.href)
        window.location.href =
            "http://192.168.2.142:8008/index.html#/environmentalMonitor/olddatamode"
        // LoadAction('iot/olddatamode', 1);
    });
    //点击事件调取历史记录
    $(document).on("click", "#equirementcontrol .equirecon .equireitem span.olddata", function () {
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
        // console.log("00000");
        // console.log(res);
        var landSelect = "";
        var landData = JSON.parse(res);
        $.each(landData.data, function (index, data) {
            landSelect = landSelect + '<option value="' + data.LandID + '">' + data.LandName +
                '</option>'
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
    var param = cloneObjectFn(paramList);
    param["landId"] = landId;
    var postdata = GetPostData(param, "iot", "getIotDeviceInfo");
    // delete postdata.params.userID;
    postFnajax(postdata).then(function (res) {
        // console.log("1111111111");
        // console.log(res);
        // var CONTROLLER = 0;
        var SENSOR = 0;
        $("#tabNav2").html("");
        $("#qita ul").html("");
        var result = JSON.parse(res);
        // alert("1111111")
        $.each(result.data, function (indes, item) {
            if (item.DeviceTypeID == 2103) {
                // alert("2222")
                if (item.DeviceCategory == "INTEGRATED") {
                    // alert("33333333")
                    // CONTROLLER++;
                    // if (result.data[i].IsOnline != 1)   
                    // CONTROLLEROut++;
                    $("#equirementcontrol").css("display", "block");
                    var Device = ""; //开关停
                    $.each(item.Slots, function (index1, item1) {
                        // alert("444444");
                        if (item1.SensorTypeID == 32512) {
                            if (item.IsOnline != 1) {
                                Device +=
                                    "<div class=\"equireitem twoswitch unlive\" DeviceID=\"" +
                                    item1.SUID + "\" SlotType=\"" + item1.SUID + "\">";
                            } else {
                                Device +=
                                    "<div class=\"equireitem twoswitch \" DeviceID=\"" +
                                    item1.SUID + "\" SlotType=\"" + item1.SUID + "\">";
                            }

                            Device += "<span>" + item1.SlotName + "</span>";
                            Device += "<span class=\"controlswitch\">";
                            if (item1.Data == 1) { //开
                                Device += "<span class=\"conitem\">关</span>";
                                Device += "<span class=\"conitem active\">开</span>";
                                Device +=
                                    "<span class=\"switch\" style=\"left:66.8%;background-color:#5cb948\"></span>";
                            }
                            if (item1.Data == 0) { //关
                                Device += "<span class=\"conitem active\">关</span>";
                                Device += "<span class=\"conitem\">开</span>";
                                Device +=
                                    "<span class=\"switch\" style=\"left:0%;background-color:#fe4d4d\"></span>";
                            }
                            Device += "</span>";
                            if (item1.Data != 1 || item1.Data != 0)
                                Device += "<span class=\"unlive\">已离线</span>";
                            Device += "<span class=\"olddata\"></span>";
                            Device += "</div>";
                        }
                    })
                    $("#tabNav2").append(Device);
                    $.each(item.Slots, function (index1, item1) {
                        // alert("444444");
                        if (item1.SensorTypeID != 32512) {
                            var img = '../../images/sensor_white/' + item1.SensorTypeID +
                                '.png';
                            var danger = "level_two";
                            if (item1.Alarm != null) {
                                danger = (item1.Alarm.ThreatLevel != -1 && item1.Alarm
                                        .ThreatLevel != 0) == true ? "level_two danger" :
                                    "level_two";
                            }
                            var Device = "";
                            Device += "<li class=\"" + danger + "\" id=\"" + item1.SUID +
                                "\">";
                            Device += " <div class=\"label\">";
                            Device += "<img src=\"" + img +
                                "\" style=\"width:18px;\" alt=\"\">";
                            Device += item1.SlotName;
                            Device += "</div>";
                            Device += "<div class=\"wrap_border\">";
                            if (item1.IsOnline != 1) {
                                Device += "<div class=\"detail hidden\">";
                            } else {
                                Device += "<div class=\"detail\">";
                            }
                            var value = SensorNumException(item1.Data);
                            Device += "<div class=\"creact_num\"><span>" + value +
                                "</span><sup>" + NullEmpty(item1.Unit) + "</sup></div>";

                            Device += "</div>";
                            if (item.IsOnline != 1)
                                Device += "<div class=\"offline_detail\"></div>";
                            Device += "<div class=\"fresh_time clearfix\">";
                            Device += "<div class=\"fl\">";

                            if (item.IsOnline != 1) {
                                Device += "<span class=\"offline_status\">离线</span>";
                            }
                            Device += "</div>";
                            if (item.IsOnline != 1) {
                                Device += " <div class=\"fr hidden\">" + NullEmpty(item1
                                    .Time) + "</div>";
                            } else {
                                Device += " <div class=\"fr\">" + timeago(NullEmpty(item1
                                    .Time)) + "</div>";
                            }
                            Device += "</div>";
                            Device += "<div class=\"operate clearfix\">";
                            Device += "<div class=\"fl\">";
                            Device +=
                                "<img src=\"../../images/alert.png\" alt=\"\"></div>"; //报警设置
                            Device +=
                                "<div class=\"history fr\" data-typeid=\"7288\" deviceId=\"" +
                                item.DeviceID + "\" deviceName=\"" + item1.SlotName +
                                "\" slotId=\"" + item1.SlotID + "\" deviceTypeId=\"" + item1
                                .SensorTypeID + "\" >";
                            Device +=
                                "<img src=\"../../images/history.png\" alt=\"\">历史数据</div>";
                            Device += "</div>";
                            Device += "</div>";
                            Device += "</li>";
                            // if (item.Tags.length == 0) {
                            $("#qita ul").append(Device);
                            $("#qita").css("display", "block");
                            // }
                        }
                    })
                }
            }
        })
    })
}

function SensorNumException(num) {
    if (num != null) {
        return num;
    }
    return "";
};
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
    // param["day"] = time;
    var postdata = GetPostData(param, "iot", "getControlHistory"); //实时数据中的历史记录
    postFnajax(postdata).then(function (res) {
        // console.log("tttttt")
        // console.log(res);
        // console.log(param)
        var Result = JSON.parse(res);
        if (typeof (Result.result.Msg) != "undefined") {
            location.reload();
        }
        if (Result.result.code = "200") {
            $("#switch tbody").html("");
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
                    $("#switch").hide();
                    $(".layui-layer-shade").remove();
                    //按钮【按钮二】的回调
                    //return false 开启该代码可禁止点击该按钮关闭
                },
                btn2: function (index, layero) {
                    $("#switch").hide();
                    $(".layui-layer-shade").remove();
                    //按钮【按钮二】的回调
                    //return false 开启该代码可禁止点击该按钮关闭
                },
                cancel: function () {
                    $("#switch").hide();
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
            $("#switch").css("display", "block");
        }
    })
}

//echart表格加载
function echartinitfn(deviceId, slotId, timeDate) {
    var deviceId = deviceId;
    var Unit = "";
    var time;
    if (timeDate.length > 10) {
        time = timeDate.split(" - ")
    }
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
            if (time) {
                param["start"] = time[0];
                param["end"] = time[1];
            } else {
                param["day"] = timeDate;
            }
            param["slot"] = slotId;
            var postdata = GetPostData(param, "iot", "getDeviceSlotHistory"); //实时数据中的历史记录
            postFnajax(postdata).then(function (res) {
                // console.log("<<<<<<<< 实时数据 >>>>>>>>")
                // console.log(param);
                // console.log(res);
                var result = JSON.parse(res);
                var data = [];
                Unit = result.data.Unit;
                var elcelData = result.data.HistoryData;
                $.each(result.data.HistoryData, function (i, item) {
                    XAxisData.push((item.Time).replace(/T/g, " "));
                    data.push(item.Data);
                });
                timeHistoryData = elcelData;
                series.push(new SetList(result.data.DeviceName, 'line', data));
                legendData.push(result.data.DeviceName);
                var ww = iframeW();
                layer.open({
                    title: '历史数据',
                    type: 1,
                    area: [ww * 0.7 + "px", '520px'],
                    content: $("#chart"),
                    btn: ['关闭'],
                    yes: function (index, layero) {
                        layer.closeAll();
                        $("#chart").css("display", "none");
                        $(".layui-layer-shade").remove();
                        //按钮【按钮二】的回调
                        //return false 开启该代码可禁止点击该按钮关闭
                    },
                    cancel: function () {
                        $("#chart").css("display", "none");
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
                        $("#chart").css({'z-index':200000})
                    },
                });
                $("#chart").css("display", "block")
                $("#echartcontain").css({
                    "width": ww * 0.65 + "px"
                });
                echartfn('', legendData, Unit, XAxisData, series, ec);
            });
        }
    );
}

function echartfn(qname, legendData, danwei, time, series, obj) {
    deviceName = legendData;
    var myChart = obj.init(document.getElementById('echartcontain'));
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
        series: series
    };
    myChart.setOption(option);
}

$(".btnexcel").on("click", function () {
    // alert("12121");
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
    // console.log(str);
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
    // console.log(str);
    // console.log(1111)
    if (str == null)
        return "";
    return str;
}

function GetHistory(deviceId, name, slotId, deviceTypeId) {
    $("#dateTime").val("");
    $(".chartbtn ul li").removeClass("active");
    $(".chartbtn ul li").eq(0).addClass("active");
    ExcelSlotId = slotId;
    ExcelTypeID = deviceTypeId;
    Device = deviceId;
    /*获取每个类别的typeid，例如土壤类下面铅离子的typeid，用于ajax请求获取历史数据渲染echarts表*/
    //var typeid = $(this).data("typeid");
    var id = deviceId + ":" + slotId + ",";
    ExcelDeviceId = id;
    var timeDate = -1
    echartinitfn(deviceId, slotId, timeDate);
}
// 操作记录
$(document).on("click", "#switch ul li", function () {

    $("#dateTime2").val("");
    $("#switch tbody").html("");
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
    timeDate = $(this).attr("time");
    if ($(this).index() != 3) {
        $("#dateswitch").hide();
        tableCont(tableDeviceID, timeDate, tabletemp, tabletitle);
    }else{
        $("#dateswitch").show();
    }
})
// 历史记录
$(document).on("click", ".chartbtn ul li", function () {
    $("#dateTime").val("");
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
    timeDate = $(this).attr("time");
    if ($(this).index() != 3) {
        $("#dateTimeDiv").hide();
        echartinitfn(Device, ExcelSlotId, timeDate);
    }else{
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
            echartinitfn(Device, ExcelSlotId, value);
        }
    });
    laydate.render({
        elem: '#dateTime2',
        range: true,
        theme: '#389bff',
        done: function (value, date, endDate) {
            $("#switch tbody").html("");
            tableCont(tableDeviceID, value, tabletemp, tabletitle);
        }
    });
})
function SetList(name, type, data) {
    this.name = name;
    this.type = type;
    this.data = data;
}

function iframeW() {
    var iframeW = $("body").width() - $("#za_slide").width() - 30;
    return iframeW;
}