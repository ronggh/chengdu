var temp = "";
var DeviceID = "";
var title = "";
var tableIndex = 0;
$(function () {
    GetUserAreaList(); //获取地块
    conequi = setInterval(function () {
        if($('input[name="controlTimer"]').length == 0){
            clearInterval(conequi);
            return;
        }
        GetArea($("#area").val());
    }, 180*1000);
    $(".Refresh").click(function () {
        $(this).find("img").addClass("refresh");
        var obj = this;
        setTimeout(function () {
            $(obj).find("img").removeClass("refresh");
            GetArea($("#area").val())
        }, 500);
    });
})

$("#switch .switchTime ul li").click(function () {
    $("#dateTime2").val("");
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
    timeDate = $(this).attr("time");
    if ($(this).index() != 3) {
        $("#dateswitch").hide();
        if(tableIndex == $(this).index()){
            return false;
        }
        $("#switch tbody").html("");
        tableIndex = $(this).index();
        tableCont(DeviceID, timeDate, temp, title);
    }else{
        tableIndex = 3;
        $("#dateswitch").show();
    }
})
initLayuifn(['element', 'form', 'table', 'layer', 'laytpl', 'laypage', 'laydate', 'upload', 'tree', 'util', 'transfer'], function () {
    $("#switch tbody").html("");
    form.render();
    laydate.render({
        elem: '#dateTime2',
        range: true,
        theme: '#389bff',
        done: function (value, date, endDate) {
            var timeStart = value.split(' - ')[0];
            var timeEnd = value.split(' - ')[1];
            if (timeStart.slice(0,4) == timeEnd.slice(0,4)) {
                tableCont(DeviceID, value, temp, title);
            } else {
                layer.msg("查询日期不能跨年",{time:1500})
            }
            
        }
    });
})

//获取所有的地块
function GetUserAreaList() {
    var param = cloneObjectFn(paramList);
    param["pageSize"] = 100;
    param["pageIndex"] = 1;
    var postdata = GetPostData(param, "land", "getLandListPage");
    postFnajax(postdata).then(function (res) {
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
    postFnajax(postdata).then(function (res) {
        var CONTROLLER = 0;
        // console.log("<<<<<<<<<控制设备>>>>>>");
        // console.log(res);
        $("#tabNav2").html("");
        var result = JSON.parse(res);
        result.data.sort(function (value1,value2) {
            return value1.DeviceName.localeCompare(value2.DeviceName,'zh-CN') ;
        });
        if (result.data != null) {
            $.each(result.data, function (i) {
                if (result.data[i].Tags.length > 0 && result.data[i].Tags[0].Tag == "水肥机") {
                    //     delete result.data[i];
                }else if (result.data[i].DeviceCategory == "CONTROLLER") {
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
            })
        }
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
            var param = cloneObjectFn(paramList);
            param["deviceId"] = DeviceID;
            param["slot"] = SlotType;
            param["action"] = Action;
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
            var postdata = GetPostData(param, "iot", "sensorControl");
            afterFnajax(postdata).then(function (res) {
            // console.log(param);
            // console.log(res);
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
        tabHistory();
    })
}
function tabHistory(){
    //点击事件调取历史记录
    $("#equirementcontrol .equirecon .equireitem .olddata").on("click", function () {
        $("#dateswitch").hide();
        $("#switch tbody").html("");
        $("#dateTime2").val("");
        $("#switch .switchTime ul li").removeClass("active");
        $("#switch .switchTime ul li").eq(0).addClass("active");
        temp = $(this).closest(".equireitem");
        DeviceID = temp.attr("DeviceID");
        title = temp.find("span").eq(0).text();
        var time = -1
        tableCont(DeviceID, time, temp, title)
    });
}

// 绘制table
function tableCont(DeviceID, time, temp, title) {
    var param = cloneObjectFn(paramList);
    param["deviceId"] = DeviceID;
    param["slot"] = 1;
    if (time.length > 10) {
        param["start"] = time.split(' - ')[0];
        param["end"] = time.split(' - ')[1];
    } else {
        param["day"] = time;
    }
    var postdata = GetPostData(param, "iot", "getControlHistory"); //实时数据中的历史记录
    echesFnajax(postdata).then(function (res) {
        // console.log(res);
        // console.log(postdata);
        var Result = JSON.parse(res);
        if (typeof (Result.result.Msg) != "undefined") {
            location.reload();
        }
        if (Result.result.code = "200") {
            $("#switch tbody").html("");
            if (Result.data) {
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
            } else {
                layer.msg("暂无操作记录", {
                    time: 2500
                });
            }
            // $(".layui-layer-shade").css("display", "none");
            $("#switch").css("display", "block");
        }
    })
}