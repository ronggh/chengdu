var Device = "";
var ExcelSlotId = "";
var timeHistoryData = "";
var deviceName = "";
$(function () {
    GetUserAreaList(); //获取地块
    weaterSta = setInterval(function () {
        if($('input[name="weaterSTimer"]').length == 0){
            clearInterval(weaterSta);
            return;
        }
        GetArea($("#area").val());
    }, 180*1000);
    /*气象站 刷新数据*/
    $(".Refresh").click(function () {
        $(this).find("img").addClass("refresh");
        var obj = this;
        setTimeout(function () {
            $(obj).find("img").removeClass("refresh");
            GetArea($("#area").val())
        }, 500);
    });
});
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
        $("#za_weather").css({
            "display": "none"
        })
        var result = JSON.parse(res);
        if (result.result.code == 200) {
            var tipsIndex = 0;
            $.each(result.data, function (i, item) {
                if (item.DeviceTypeID === 1002) {
                    tipsIndex = 1;
                    $("#za_weather").css({
                        "display": "block"
                    })
                    $.each(item.Slots, function (index, slot) {
                        var value = NullEmpty(slot.Data);
                        value = value + slot.Unit;
                        if (slot.SlotID == 2) //风向特别处理
                            value = windDirectioin(slot.Data);
                        $("#SlotID" + slot.SlotID).find("p").eq(1).text(value);
                        $("#SlotID" + slot.SlotID).attr("deviceId", item.DeviceID);
                        $("#SlotID" + slot.SlotID).attr("deviceName", item.DeviceName);
                        $("#SlotID" + slot.SlotID).attr("slotId", slot.SlotID);
                        $("#SlotID" + slot.SlotID).attr("deviceTypeId", item.DeviceTypeID);
                    })
                }
            })
            if (tipsIndex == 0) {
                layer.msg("此地块无综合气象站", {
                    time: 2500
                });
            }
        };
        $(".secondary .level_two .operate .history,.fertilizer,.common").on("click", function () {
            $("#dateTimeDiv").hide();
            var deviceId = $(this).attr("deviceId");
            var deviceName = $(this).attr("deviceName");
            var slotId = $(this).attr("slotId");
            var deviceTypeId = $(this).attr("deviceTypeId");
            GetHistory(deviceId, name, slotId, deviceTypeId);
        });
    });
}
//保留小数
function numTofixed(num, n, per) {
    if (num != 0) {
        if (arguments.length == 3 && per) {
            num = num * 100;
            return parseInt(num * Math.pow(10, n) + 0.5, 10) / Math.pow(10, n) + "%";
        } else {
            return parseInt(num * Math.pow(10, n) + 0.5, 10) / Math.pow(10, n);
        }
    } else {
        if (arguments.length == 3 && per) {
            return "0%";
        } else {
            return 0;
        }
    }
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
var windDirectioin = function (degree) {
    var direction = "";
    if (degree > 22.5 && degree <= 67.5) { //东北风
        direction = "东北";
    } else if (degree > 67.5 && degree <= 112.5) { //东风
        direction = "东";
    } else if (degree > 112.5 && degree <= 157.5) { //东南风
        direction = "东南";
    } else if (degree > 157.5 && degree <= 202.5) { //南风
        direction = "南";
    } else if (degree > 202.5 && degree <= 247.5) { //西南风
        direction = "西南";
    } else if (degree > 247.5 && degree <= 292.5) { //西风
        direction = "西";
    } else if (degree > 292.5 && degree <= 337.5) { //西北风
        direction = "西北";
    } else if (degree > 337.5 || degree <= 22.5) { //北风
        direction = "北";
    }
    return direction;
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
    //历史记录弹窗中的事件
    var timeDate = -1
    echartinitfn(deviceId, slotId, timeDate);
}
// $(document).on("click", ".chartbtn ul li", function () {

// });
$(".chartbtn ul li").click(function () {
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
            var timeStart = value.split(' - ')[0];
            var timeEnd = value.split(' - ')[1];
            if (timeStart.slice(0,4) == timeEnd.slice(0,4)) {
                echartinitfn(Device, ExcelSlotId, value);
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
