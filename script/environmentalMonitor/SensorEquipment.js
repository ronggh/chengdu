var serseid = "";
var deviceId = "";
var landDeverData = "";
var timeHistoryData = "";
var deviceName = "";
var sensorIndex = 0;
$(function() {
  GetUserAreaList(); //获取地块
  $(document).on("click", ".primary .level_one .operate .alerm", function() {
    serseid = $(this).attr("suid");
    deviceId = $(this).attr("deviceId");
    deviceIdAlerm = $(this).attr("deviceId");
    var add_manage_Tpl = document.getElementById("alerm_popup").innerHTML;
    var alermTop = laytpl(add_manage_Tpl).render({}, function(html) {
      layer.open({
        id: "alerm_pop",
        type: 1,
        content: html,
        title: ["报警设置"],
        area: ["600px", "400px"],
        success: function(index, layero) {
          $("#alerm_pop .layui-tab .layui-tab-title li").on(
            "click",
            function() {
              $(this)
                .addClass("layui-this selected")
                .siblings()
                .removeClass("layui-this selected");
              $(" .layui-tab-content .layui-tab-item")
                .eq($(this).index())
                .addClass("layui-show")
                .siblings()
                .removeClass("layui-show");
            }
          );
          $.each(landDeverData.data, function(index, item) {
            if (deviceId == item.DeviceID) {
              if (item.Slots[0].Alarm) {
                var index = "";
                var EnableHigh = item.Slots[0].Alarm.EnableHigh;
                var HighValue = item.Slots[0].Alarm.HighValue;
                var EnableLow = item.Slots[0].Alarm.EnableLow;
                var LowValue = item.Slots[0].Alarm.LowValue;
                if (
                  EnableHigh == true &&
                  HighValue != null &&
                  EnableLow == false &&
                  LowValue == null
                ) {
                  index = 0;
                  $("#alerm_pop .layui-tab .layui-tab-title li")
                    .eq(index)
                    .addClass("layui-this selected")
                    .siblings()
                    .removeClass("layui-this selected");
                  $(" .layui-tab-content .layui-tab-item")
                    .eq(index)
                    .addClass("layui-show")
                    .siblings()
                    .removeClass("layui-show");
                  $(".layui-tab-content .layui-show")
                    .find("input")
                    .eq(1)
                    .val(LowValue);
                  $(".layui-tab-content .layui-show")
                    .find("input")
                    .eq(0)
                    .val(HighValue);
                } else if (
                  EnableHigh == false &&
                  HighValue == null &&
                  EnableLow == true &&
                  LowValue != null
                ) {
                  index = 1;
                  $("#alerm_pop .layui-tab .layui-tab-title li")
                    .eq(index)
                    .addClass("layui-this selected")
                    .siblings()
                    .removeClass("layui-this selected");
                  $(" .layui-tab-content .layui-tab-item")
                    .eq(index)
                    .addClass("layui-show")
                    .siblings()
                    .removeClass("layui-show");
                  $(".layui-tab-content .layui-show")
                    .find("input")
                    .eq(1)
                    .val(HighValue);
                  $(".layui-tab-content .layui-show")
                    .find("input")
                    .eq(0)
                    .val(LowValue);
                } else if (
                  EnableHigh == true &&
                  HighValue != null &&
                  EnableLow == true &&
                  LowValue != null
                ) {
                  if (HighValue < LowValue) {
                    index = 2;
                    $("#alerm_pop .layui-tab .layui-tab-title li")
                      .eq(index)
                      .addClass("layui-this selected")
                      .siblings()
                      .removeClass("layui-this selected");
                    $(" .layui-tab-content .layui-tab-item")
                      .eq(index)
                      .addClass("layui-show")
                      .siblings()
                      .removeClass("layui-show");
                    $(".layui-tab-content .layui-show")
                      .find("input")
                      .eq(1)
                      .val(LowValue);
                    $(".layui-tab-content .layui-show")
                      .find("input")
                      .eq(0)
                      .val(HighValue);
                  }
                  if (HighValue == LowValue) {
                    index = 3;
                    $("#alerm_pop .layui-tab .layui-tab-title li")
                      .eq(index)
                      .addClass("layui-this selected")
                      .siblings()
                      .removeClass("layui-this selected");
                    $(" .layui-tab-content .layui-tab-item")
                      .eq(index)
                      .addClass("layui-show")
                      .siblings()
                      .removeClass("layui-show");
                    $(".layui-tab-content .layui-show")
                      .find("input")
                      .eq(1)
                      .val(HighValue);
                    $(".layui-tab-content .layui-show")
                      .find("input")
                      .eq(0)
                      .val(LowValue);
                  }
                  if (HighValue > LowValue) {
                    index = 4;
                    $("#alerm_pop .layui-tab .layui-tab-title li")
                      .eq(index)
                      .addClass("layui-this selected")
                      .siblings()
                      .removeClass("layui-this selected");
                    $(" .layui-tab-content .layui-tab-item")
                      .eq(index)
                      .addClass("layui-show")
                      .siblings()
                      .removeClass("layui-show");
                    $(".layui-tab-content .layui-show")
                      .find("input")
                      .eq(1)
                      .val(HighValue);
                    $(".layui-tab-content .layui-show")
                      .find("input")
                      .eq(0)
                      .val(LowValue);
                  }
                }
              }
            }
          });
        }
      });
    });
  });
  $("#qixiang")
    .css("display", "none")
    .find("ul")
    .html("");
  $("#qita")
    .css("display", "none")
    .find("ul")
    .html("");
  $("#turang")
    .css("display", "none")
    .find("ul")
    .html("");
  $("#shuizhi")
    .css("display", "none")
    .find("ul")
    .html("");
  $("#kongqi")
    .css("display", "none")
    .find("ul")
    .html("");
  /*设备控制 刷新数据*/
  $(".Refresh").click(function() {
    $(this)
      .find("img")
      .addClass("refresh");
    var obj = this;
    setTimeout(function() {
      $(obj)
        .find("img")
        .removeClass("refresh");
      GetArea($("#area").val());
    }, 500);
  });
  //自动刷新
  sensoreq = setInterval(function() {
    if ($('input[name="sensorTimer"]').length == 0) {
      clearInterval(sensoreq);
      return;
    }
    GetArea($("#area").val());
  }, 180 * 1000);
});
//新增或者编辑报警设置
function alermSure() {
  var EnableHigh, HighValue, EnableLow, LowValue, Condition;
  var index = $(".layui-tab-content .layui-tab-item").index(
    $(".layui-tab-content .layui-show")
  );
  var value1 = $(".layui-tab-content .layui-show")
    .find("input")
    .eq(0)
    .val();
  var value2 = $(".layui-tab-content .layui-show")
    .find("input")
    .eq(1)
    .val();
  if (index == 0 && !(!!value1 && !isNaN(value1))) {
    layer.msg("请输入正确触发条件范围", {
      icon: 2,
      time: 1500
    });
    return false;
  } else if (index == 1 && !(!!value1 && !isNaN(value1))) {
    layer.msg("请输入正确触发条件范围", {
      icon: 2,
      time: 1500
    });
    return false;
  } else if (
    index == 2 &&
    (!(!!value2 && !isNaN(value2)) ||
      !(!!value1 && !isNaN(value1)) ||
      value2 * 1 <= value1 * 1)
  ) {
    layer.msg("请输入正确触发条件范围", {
      icon: 2,
      time: 1500
    });
    return false;
  } else if (index == 3 && !(!!value1 && !isNaN(value1))) {
    layer.msg("请输入正确触发条件范围", {
      icon: 2,
      time: 1500
    });
    return false;
  } else if (
    index == 4 &&
    (!(!!value2 && !isNaN(value2)) ||
      !(!!value1 && !isNaN(value1)) ||
      value2 * 1 <= value1 * 1)
  ) {
    layer.msg("请输入正确触发条件范围", {
      icon: 2,
      time: 1500
    });
    return false;
  }

  switch (index) {
    case 0:
      EnableHigh = true;
      HighValue = value1;
      EnableLow = false;
      LowValue = null;
      Condition = Condition + "＞" + value1 + "触发";
      break;
    case 1:
      EnableHigh = false;
      HighValue = null;
      EnableLow = true;
      LowValue = value1;
      Condition = Condition + "＜" + value1 + "触发";
      break;
    case 2:
      EnableHigh = true;
      HighValue = value1;
      EnableLow = true;
      LowValue = value2;
      Condition = Condition + value1 + "＜x＜" + value2 + "触发";
      break;
    case 3:
      EnableHigh = true;
      HighValue = value1;
      EnableLow = true;
      LowValue = value1;
      Condition = Condition + "＝" + value1 + "触发";
      break;
    case 4:
      EnableHigh = true;
      HighValue = value2;
      EnableLow = true;
      LowValue = value1;
      Condition = Condition + "＞" + value2 + "或＜" + value1 + "触发";
      break;
  }
  var entityJson = {
    SUID: serseid,
    EnableHigh: EnableHigh,
    HighValue: HighValue,
    EnableLow: EnableLow,
    LowValue: LowValue
  };
  $.each(landDeverData.data, function(index, item) {
    if (deviceId == item.DeviceID) {
      if (item.Slots[0].Alarm) {
        var param = cloneObjectFn(paramList);
        param["entity"] = getUTF8(entityJson);
        var postdata = GetPostData(param, "alarm", "update");
        postFnajax(postdata).then(function(res) {
          var alermRes = JSON.parse(res);
          if (alermRes.result.code == 200) {
            layer.msg(
              "设置报警成功",
              {
                time: 1500
              },
              function() {
                layer.closeAll();
                GetArea($("#area").val());
              }
            );
          } else {
            layer.msg(alermRes.result.msg, {
              time: 1500
            });
          }
        });
      } else {
        var param = cloneObjectFn(paramList);
        param["entity"] = getUTF8(entityJson);
        var postdata = GetPostData(param, "alarm", "insert");
        postFnajax(postdata).then(function(res) {
          var alermRes = JSON.parse(res);
          if (alermRes.result.code == 200) {
            layer.msg(
              "设置报警成功",
              {
                time: 1500
              },
              function() {
                layer.closeAll();
                GetArea($("#area").val());
              }
            );
          } else {
            layer.msg(alermRes.result.msg, {
              time: 1500
            });
          }
        });
      }
    }
  });
}
//清除报警设置
function clearAlerm() {
  var param = cloneObjectFn(paramList);
  param["id"] = serseid;
  var postdata = GetPostData(param, "alarm", "delete");
  postFnajax(postdata).then(function(res) {
    var alermRes = JSON.parse(res);
    if (alermRes.result.code == 200) {
      layer.msg(
        "报警清除成功",
        {
          time: 1500
        },
        function() {
          layer.closeAll();
          GetArea($("#area").val());
        }
      );
    } else {
      layer.msg(alermRes.result.msg, {
        time: 1500
      });
    }
  });
}

//获取所有的地块
function GetUserAreaList() {
  var param = cloneObjectFn(paramList);
  param["pageSize"] = 100;
  param["pageIndex"] = 1;
  var postdata = GetPostData(param, "land", "getLandListPage");
  postFnajax(postdata).then(function(res) {
    var landSelect = "";
    var landData = JSON.parse(res);
    $.each(landData.data, function(index, data) {
      if (data.SensorCount > 0 && data.FertilizerSensorCount == 0) {
        landSelect =
          landSelect +
          '<option value="' +
          data.LandID +
          '">' +
          data.LandName +
          "</option>";
      }
    });
    $("#area").html(landSelect);
    form.render("select");
    GetArea($("#area").val()); //进入页面获取地块ID，获取设备渲染页面
    form.on("select(quiz)", function(data) {
      //切换地块获取设备渲染页面
      GetArea(data.value);
    });
  });
}
//根据地块获取地块内的设备
function GetArea(landId) {
  //, status, loading
  var param = cloneObjectFn(paramList);
  param["landId"] = landId;
  var postdata = GetPostData(param, "iot", "getIotDeviceInfo");
  postFnajax(postdata).then(function(res) {
    var SENSOR = 0;
    $("#qita ul").html("");
    console.log("<<<<<<<<<<<<<传感器数据>>>>>>>>>>>>");
    console.log(res);
    var result = JSON.parse(res);
    result.data.sort(function(value1, value2) {
      return value1.DeviceName.localeCompare(value2.DeviceName, "zh-CN");
    });
    landDeverData = result;
    $("#qita").css("display", "none");
    $("#qixiang").css("display", "none");
    $("#turang").css("display", "none");
    $("#shuizhi").css("display", "none");
    $("#kongqi").css("display", "none");
    $("#qita ul li").remove();
    $("#qixiang ul li").remove();
    $("#turang ul li").remove();
    $("#shuizhi ul li").remove();
    $("#kongqi ul li").remove();
    $.each(result.data, function(i, item) {
      if (item.DeviceCategory == "SENSOR") {
        SENSOR++;
        var img =
          "../../images/sensor_white/" + item.Slots[0].SensorTypeID + ".png";
        var danger = "level_two";
        if (item.Slots[0].Alarm != null) {
          var EnableHigh = item.Slots[0].Alarm.EnableHigh;
          var HighValue = item.Slots[0].Alarm.HighValue;
          var EnableLow = item.Slots[0].Alarm.EnableLow;
          var LowValue = item.Slots[0].Alarm.LowValue;
          if (
            EnableHigh == true &&
            HighValue != null &&
            EnableLow == false &&
            LowValue == null
          ) {
            danger =
              item.Slots[0].Data > HighValue == true
                ? "level_two danger"
                : "level_two";
          } else if (
            EnableHigh == false &&
            HighValue == null &&
            EnableLow == true &&
            LowValue != null
          ) {
            danger =
              item.Slots[0].Data < LowValue == true
                ? "level_two danger"
                : "level_two";
          } else if (
            EnableHigh == true &&
            HighValue != null &&
            EnableLow == true &&
            LowValue != null
          ) {
            if (HighValue < LowValue) {
              //两值之间
              danger =
                (HighValue < item.Slots[0].Data &&
                  item.Slots[0].Data < LowValue) == true
                  ? "level_two danger"
                  : "level_two";
            }
            if (HighValue == LowValue) {
              danger =
                (HighValue == item.Slots[0].Data) == true
                  ? "level_two danger"
                  : "level_two";
            }
            if (HighValue > LowValue) {
              danger =
                (HighValue < item.Slots[0].Data ||
                  item.Slots[0].Data < LowValue) == true
                  ? "level_two danger"
                  : "level_two";
            }
          }
        }
        var Device = "";
        Device += '<li class="' + danger + '" id="' + item.DeviceID + '">';
        Device += ' <div class="label">';
        Device += '<img src="' + img + '" style="width:18px;" alt="">';
        Device += item.DeviceName;
        Device += "</div>";
        Device += '<div class="wrap_border">';
        if (item.IsOnline != 1) {
          Device += '<div class="detail hidden">';
        } else {
          Device += '<div class="detail">';
        }
        var value = SensorNumException(item.Slots[0].Data);
        Device +=
          '<div class="creact_num"><span>' +
          value +
          "</span><sup>" +
          NullEmpty(item.Slots[0].Unit) +
          "</sup></div>";
        if (item.Slots[0].Alarm != null) {
          var Condition = "";
          var EnableHigh = item.Slots[0].Alarm.EnableHigh == 0 ? false : true;
          var HighValue = item.Slots[0].Alarm.HighValue;
          var EnableLow = item.Slots[0].Alarm.EnableLow == 0 ? false : true;
          var LowValue = item.Slots[0].Alarm.LowValue;
          if (
            EnableHigh == true &&
            HighValue != null &&
            EnableLow == false &&
            LowValue == null
          ) {
            Condition = Condition + "＞" + HighValue + "触发";
            Device += "<span>" + Condition + "</span>";
          } else if (
            EnableHigh == false &&
            HighValue == null &&
            EnableLow == true &&
            LowValue != null
          ) {
            Condition = Condition + "＜" + LowValue + "触发";
            Device += "<span>" + Condition + "</span>";
          } else if (
            EnableHigh == true &&
            HighValue != null &&
            EnableLow == true &&
            LowValue != null
          ) {
            if (HighValue < LowValue) {
              Condition = Condition + HighValue + "＜x＜" + LowValue + "触发";
              Device += "<span>" + Condition + "</span>";
            }
            if (HighValue > LowValue) {
              Condition =
                Condition + "＞" + HighValue + "或＜" + LowValue + "触发";
              Device += "<span>" + Condition + "</span>";
            }
            if (HighValue == LowValue) {
              Condition = Condition + "＝" + HighValue + "触发";
              Device += "<span>" + Condition + "</span>";
            }
          }
        }
        Device += "</div>";
        if (item.IsOnline != 1) Device += '<div class="offline_detail"></div>';
        Device += '<div class="fresh_time clearfix">';
        Device += '<div class="fl">';

        if (item.IsOnline != 1) {
          Device += '<span class="offline_status">离线</span>';
        }
        Device += "</div>";
        if (item.IsOnline != 1) {
          Device +=
            ' <div class="fr hidden">' +
            timeago(NullEmpty(item.Slots[0].Time)) +
            "</div>";
        } else {
          Device +=
            ' <div class="fr">' +
            timeago(NullEmpty(item.Slots[0].Time)) +
            "</div>";
        }
        Device += "</div>";
        Device += '<div class="operate clearfix">';
        Device +=
          '<div class="alerm fl" data-typeid="7288" deviceId="' +
          item.DeviceID +
          '" deviceName="' +
          item.DeviceName +
          '" slotId="' +
          item.Slots[0].SlotID +
          '" deviceTypeId="' +
          item.DeviceTypeID +
          '"' +
          '" SUID = "' +
          item.Slots[0].SUID +
          '">';
        Device += '<img src=".../../images/alert.png" alt="">报警设置</div>';
        Device +=
          '<div class="history fr" data-typeid="7288" deviceId="' +
          item.DeviceID +
          '" deviceName="' +
          item.DeviceName +
          '" slotId="' +
          item.Slots[0].SlotID +
          '" deviceTypeId="' +
          item.DeviceTypeID +
          '" >';
        Device += '<img src="../../images/history.png" alt="">历史数据</div>';
        Device += "</div>";
        Device += "</div>";
        Device += "</li>";
        if (item.Tags.length == 0) {
          $("#qita ul").append(Device);
          $("#qita").css("display", "block");
        } else {
          var index = 0;
          $.each(item.Tags, function(p, item1) {
            if (item1.Tag != "水肥机") {
              switch (item1.Tag) {
                case "气象类":
                  index++;
                  $("#qixiang ul").append(Device);
                  $("#qixiang").css("display", "block");
                  break;
                case "土壤类":
                  index++;
                  $("#turang ul").append(Device);
                  $("#turang").css("display", "block");
                  break;
                case "水质类":
                  index++;
                  $("#shuizhi ul").append(Device);
                  $("#shuizhi").css("display", "block");
                  break;
                case "空气类":
                  index++;
                  $("#kongqi ul").append(Device);
                  $("#kongqi").css("display", "block");
                  break;
              }
              if (index == 0) {
                $("#qita ul").append(Device);
                $("#qita").css("display", "block");
              }
            }
          });
        }
      }
    });
    //历史记录 历史记录 历史记录 弹出层 ---------开始-----------
    $(".primary .level_one .operate .history").on("click", function() {
      $("#dateTimeDiv").hide();
      deviceId = $(this).attr("deviceId");
      var deviceName = $(this).attr("deviceName");
      var slotId = $(this).attr("slotId");
      var deviceTypeId = $(this).attr("deviceTypeId");
      GetHistory(deviceId, name, slotId, deviceTypeId);
    });
  });
}

function SensorNumException(num) {
  if (typeof num == "number") {
    return num;
  } else {
    return "";
  }
}

function NullEmpty(str) {
  if (str == null) return "0";
  return str;
}

//点击历史记录事件
function GetHistory(deviceId, name, slotId, deviceTypeId) {
  $("#dateTime").val("");
  $(".chartbtn ul li").removeClass("active");
  $(".chartbtn ul li")
    .eq(0)
    .addClass("active");
  ExcelSlotId = slotId;
  ExcelTypeID = deviceTypeId;
  Device = deviceId;
  var id = deviceId + ":" + slotId + ",";
  ExcelDeviceId = id;
  //历史记录
  var timeDate = "-1";
  echartinitfn(deviceId, slotId, timeDate);
}
$(document).on("click", ".chartbtn ul li", function() {
  $("#dateTime").val("");
  $(this)
    .siblings()
    .removeClass("active");
  $(this).addClass("active");
  timeDate = $(this).attr("time");
  if ($(this).index() != 3) {
    $("#dateTimeDiv").hide();
    if (sensorIndex == $(this).index()) {
      return false;
    }
    sensorIndex = $(this).index();
    echartinitfn(deviceId, ExcelSlotId, timeDate);
  } else {
    sensorIndex = 3;
    $("#dateTimeDiv").show();
  }
});

initLayuifn(
  [
    "element",
    "form",
    "table",
    "layer",
    "laytpl",
    "laypage",
    "laydate",
    "upload",
    "tree",
    "util",
    "transfer"
  ],
  function() {
    form.render();
    laydate.render({
      elem: "#dateTime",
      range: true,
      theme: "#389bff",
      done: function(value, date, endDate) {
        var timeStart = value.split(" - ")[0];
        var timeEnd = value.split(" - ")[1];
        if (timeStart.slice(0, 4) == timeEnd.slice(0, 4)) {
          echartinitfn(deviceId, ExcelSlotId, value);
        } else {
          layer.msg("查询日期不能跨年", { time: 1500 });
        }
      }
    });
  }
);
$(".btnexcel").on("click", function() {
  //列标题，逗号隔开，每一个逗号就是隔开一个单元格
  let str = `日期,数值\n`;
  //增加\t为了不让表格显示科学计数法或者其他格式
  $.each(timeHistoryData, function(index, item) {
    timeHistoryData[index].Time = TimeReplice(timeHistoryData[index].Time);
  });
  for (let i = 0; i < timeHistoryData.length; i++) {
    for (let item in timeHistoryData[i]) {
      str += `${timeHistoryData[i][item] + "\t"},`;
    }
    str += "\n";
  }
  //encodeURIComponent解决中文乱码
  let uri = "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(str);
  //通过创建a标签实现
  var link = document.createElement("a");
  link.href = uri;
  //对下载的文件命名
  link.download = deviceName[0] + "数据表.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

function SetList(name, type, data) {
  this.name = name;
  this.type = type;
  this.data = data;
}
