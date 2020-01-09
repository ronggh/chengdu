var keytimenew = 0;
var keytimeold = 0;
var keytimeoldplus = 0;
var biga = $("style#biga").detach();
var bigb = $("style#bigb").detach();
$(function () {
    GetUserAreaList(); //获取地块
    $(".Refresh").click(function () {
        $(this).find("img").addClass("refresh");
        var obj = this;
        setTimeout(function () {
            $(obj).find("img").removeClass("refresh");
            GetAreamap($("#area").val())
        }, 500);
    });
    $(".plants p.tit span").bind('click', function () {
        $(this).addClass("active").siblings("span").removeClass("active");
        $(".plants .itemjspz").eq($(this).index()).show().siblings(".itemjspz").hide();
    })
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
        GetAreamap($("#area").val()); //进入页面获取地块ID，获取设备渲染页面
        form.on('select(quiz)', function (data) { //切换地块获取设备渲染页面
            GetAreamap(data.value);
        })
    });
};

//根据地块获ID获取地块内的详细信息
function GetAreamap(landId) { //, status, loading
    var param = cloneObjectFn(paramList);
    var postdata = GetPostData(param, "iot", "getIotOverView");
    postFnajax(postdata).then(function (res) {
        var result = JSON.parse(res);
        $.each(result.data, function (index, item) {
            if (item.LandID == landId) {
                var str = '<dl><dt>地块名称：<em>' + item.LandName + '</em></dt><dt>种植作物：<em>' +
                    dataEmpty(item.PlantCropName) + '</em></dt><dt>地块负责人：<em>' + dataEmpty(item
                        .ResponsiblePerson) + '</em></dt><dt>地块介绍：<em>' + dataEmpty(item.LandDesc) +
                    '</em></dt></dl>'
                $("#jianjie").html(str);
                initMap(item);
                drawdbx(item.Points);
                markerCamera(item.Cameras);
                markerDever(item.Devices);


                var sensorDeverzai = []; //传感设备在线
                var sensorDeverli = []; //传感设备离线
                var sensorDeverTotal = [];

                var contDeverzai = []; //控制设备在线
                var contDeverli = []; //控制设备离线
                var contDeverTotal = [];

                var integratedinzai = []; //综合设备在线
                var integratedinout = []; //综合设备离线
                var integratedinTotal = [];

                var cameraTotal = []; //摄像头总
                var camerain = []; //摄像头在线
                var cameraout = []; //摄像头离线

                var PointsArr = []; //地块图形坐标
                // 传感设备：在线，离线，总数,先清一下数据
                $("#sensorin").html(sensorDeverzai.length);
                $("#sensorout").html(sensorDeverli.length);
                $("#sensor_total").html(sensorDeverzai.length + sensorDeverli.length);
                // 控制设备
                $("#controllerin").html(contDeverzai.length);
                $("#controllerout").html(contDeverli.length);
                $("#controller_total").html(contDeverzai.length + contDeverli.length);
                // 综合设备
                $("#integratedin").html(integratedinzai.length);
                $("#integratedout").html(integratedinout.length);
                $("#integrated").html(integratedinzai.length + integratedinout.length);
                // 摄像头
                $("#camerain").html(camerain.length);
                $("#cameraout").html(cameraout.length);
                $("#camera_total").html(camerain.length + cameraout.length)

                $.each(item.Devices, function (index1, item1) {
                    if (item1.DeviceCategory == "SENSOR") {
                        sensorDeverTotal.push(item1);
                        if (item1.IsOnline == 1) {
                            sensorDeverzai.push(item1);
                        } else {
                            sensorDeverli.push(item1);
                        }
                    } else if (item1.DeviceCategory == "CONTROLLER") {
                        contDeverTotal.push(item1);

                        if (item1.IsOnline == 1) {
                            contDeverzai.push(item1);
                        } else {
                            contDeverli.push(item1);
                        }
                    } else if (item1.DeviceCategory == "INTEGRATED") {
                        integratedinTotal.push(item1)

                        if (item1.IsOnline == 1) {
                            integratedinzai.push(item);
                        } else {
                            integratedinout.push(item);
                        }
                    }
                    // 传感设备：在线，离线，总数
                    $("#sensorin").html(sensorDeverzai.length);
                    $("#sensorout").html(sensorDeverli.length);
                    $("#sensor_total").html(sensorDeverzai.length + sensorDeverli.length);
                    // 控制设备
                    $("#controllerin").html(contDeverzai.length);
                    $("#controllerout").html(contDeverli.length);
                    $("#controller_total").html(contDeverzai.length + contDeverli.length);
                    // 综合设备
                    $("#integratedin").html(integratedinzai.length);
                    $("#integratedout").html(integratedinout.length);
                    $("#integrated").html(integratedinzai.length + integratedinout.length);

                });
                //
                sensorinit(sensorDeverTotal); //传感器列表
                controlinit(contDeverTotal); //控制设备
                combineinit(integratedinTotal); //综合设备初始化

                //摄像头列表
                $.each(item.Cameras, function (index1, item1) {
                    cameraTotal.push(item1);
                    if (item1.IsOnline == 1) {
                        camerain.push(item1);
                    } else {
                        cameraout.push(item1);
                    }
                    $("#camerain").html(camerain.length);
                    $("#cameraout").html(cameraout.length);
                    $("#camera_total").html(camerain.length + cameraout.length)
                });

                // 摄像头
                videoinit(cameraTotal);
            }
        })

    })
}

//google地图初始化
function initMap(landRes) {
    if (landRes == undefined) {
        landRes = {
            "data": {
                "Longitude": "31.044888689703832",
                "Latitude": "121.93403497870327",
                "MapZoom": 12,
            }
        }
    }
    var myLatLng = {
        lat: Number(landRes.Longitude),
        lng: Number(landRes.Latitude)
    };
    map = new google.maps.Map(document.getElementById('mapcontain'), {
        zoom: Number(landRes.MapZoom),
        center: myLatLng,
        scaleControl: true, //地图比例控件
        disableDefaultUI: true, //默认UI
        panControl: true,
        mapTypeControl: true,
        streetViewControl: true,
        overviewMapControl: true,
        rotateControl: true,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        }
    });
}

//根据提供的坐标绘制地块
function drawdbx(polygonobj) {
    var myTrip = [];
    $.each(polygonobj, function (index, item) {
        myTrip.push(new google.maps.LatLng(item.Latitude, item.Longitude))
    })
    var mapPoints = new google.maps.Polygon({
        path: myTrip,
        strokeColor: "#1e9fff",
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: "#1e9fff",
        fillOpacity: 0.5,
        editable: false,
        // geodesic: true,
    })
    mapPoints.setMap(map);
}

//根据设备点绘制设备及摄像头位置
function markerCamera(cameraData) {
    $.each(cameraData, function (index, item) {
        // console.log(Number item.Latitude);
        var markerCa = new google.maps.Marker({
            position: {
                lat: Number(item.Latitude),
                lng: Number(item.Longitude)
            },
            map: map,
            name: item.CameraName,
            value: item.CameraID,
            icon: '../../images/shexiangtouhong@2x.png'
        });
        markerCa.setMap(map);
    })
}

function markerDever(deverData) {
    $.each(deverData, function (index, item) {
        var markerDe = new google.maps.Marker({
            position: {
                lat: Number(item.Latitude),
                lng: Number(item.Longitude)
            },
            map: map,
            name: item.DeviceName,
            value: item.DeviceID,
            icon: '../images/shebei@2x.png'
        });
        markerDe.setMap(map);
    })
}

$(document).ready(function () {
    /*各种设备tab点击切换列表*/
    $(".equip_tit li").on('click', function () {
        var index = $(this).index();
        var name = $(this).closest('li').attr("class");
        $(".equip_tit li").eq(index).addClass("on").siblings().removeClass("on");
        $(".equip_con").find("." + name + "_con").addClass("show").siblings("li").removeClass("show");
    });
})

/*传感模块初始化*/
function sensorinit(data) {
    var index = 0;
    $(".equipment .equip_con li.sensor_con  .changeTab .fl img:first").attr("src", "../images/governmenthomedeteal/rootvideo_bplus.png");
    $(".equipment .equip_con li.sensor_con .commonbox").html("");
    if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
            var ulobj = $("<ul class='common' titlename=" + data[i].DeviceName + "></ul>");
            for (var j = 0; j < data[i].Slots.length; j++) {
                index++;
                if (isNaN(data[i].Slots[j].Data)) {
                    var linum = data[i].Slots[j].Data;
                } else {
                    var linum = numTofixed(data[i].Slots[j].Data, 2);
                }
                var liobj = $("<li class='clearfix'><span class='fl'><img src=" + "../images/sensor_white/" + data[i].Slots[j].SensorTypeID + ".png" + " alt=''>" + data[i].DeviceName + "</span><span class='fr'><i>" + dataEmpty(data[i].Slots[j].Data) + "</i>" + data[i].Slots[j].Unit + "</span></li>")
                ulobj.append(liobj);
            }
            $(".equipment .equip_con li.sensor_con .commonbox").append(ulobj);
        }
    } else {
        //暂无传感设备
        $(".equipment .equip_con li.sensor_con .commonbox").empty().append("<div class='nodata'><img src='../images/governmenthomedeteal/nosensor.png' alt='暂无传感设备'><p>暂无传感设备</p></div>");
    }
    if (data.length > 1) {
        $(".equipment .equip_con li.sensor_con .changeTab .fr img:first").attr("src", "../images/governmenthomedeteal/rootvideo_a.png");
        zdyscroll($(".equipment .equip_con li.sensor_con .commonbox"));
    } else {
        $(".equipment .equip_con li.sensor_con .changeTab .fr img:first").attr("src", "../images/governmenthomedeteal/rootvideo_aplus.png");
    }
}

/*控制设备初始化*/
function controlinit(data) {
    var index = 0;
    $(".equipment .equip_con li.control_con .changeTab .fl img:first").attr("src", "../images/governmenthomedeteal/rootvideo_bplus.png");
    $(".equipment .equip_con li.control_con .commonbox").html("");
    if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
            var ulobj = $("<ul class='common' titlename=" + data[i].DeviceName + "></ul>")
            for (var j = 0; j < data[i].Slots.length; j++) {
                index++;
                var status;
                // 1，开，2或0关，3停
                if (data[i].Slots[j].Data == 2 || data[i].Slots[j].Data == 0) {
                    status = "关"
                    var classname = "close";
                } else if ((data[i].Slots[j].Data) == 1) {
                    status = "开"
                    var classname = "open";
                } else if ((data[i].Slots[j].Data) == 3) {
                    status = "停"
                    var classname = "stop";
                } else {
                    status = "离线"
                    var classname = "unline";
                }
                var liobj = $("<li class='clearfix'><span class='fl'>" + data[i].DeviceName + "</span><span class='" + 'fr ' + classname + "'>" + status + "</span></li>")
                ulobj.append(liobj);
            }
            $(".equipment .equip_con li.control_con .commonbox").append(ulobj);
        }
        $(".equipment .equip_con li.control_con .commonbox .commoncon ul.common:first").addClass("commonactive");
    } else {
        //暂无控制设备
        $(".equipment .equip_con li.control_con .commonbox").empty().append("<div class='nodata'><img src='../images/governmenthomedeteal/nocontrols.png' alt='暂无控制设备'><p>暂无控制设备</p></div>");
    }
    if (data.length > 1) {
        $(".equipment .equip_con li.control_con .changeTab .fr img:first").attr("src", "../images/governmenthomedeteal/rootvideo_a.png");
        zdyscroll($(".equipment .equip_con li.control_con .commonbox"));
    } else {
        $(".equipment .equip_con li.control_con .changeTab .fr img:first").attr("src", "../images/governmenthomedeteal/rootvideo_aplus.png");
    }
}

weather = [];
/*综合设备初始化*/
function combineinit(data) {
    // console.log(data);
    $(".equipment .equip_con li.combine_con .weather").remove();
    if (data.length > 0) {
        $(".equipment .equip_con li.combine_con").empty();
        for (var i = 0; i < data.length; i++) {
            // II型气象站 1002
            if (data[i].DeviceTypeID == 1002) {
                weather.push(data[i]);
                if (data[i].IsOnline) {
                    $(".equipment .equip_con li.combine_con").append("<div class=\"weather\"><div class=\"clearfix\"><span class=\"fl\">气象站</span><span class='fr run'><img src='../images/governmenthomedeteal/run_point.png' alt=''>运行中</span></div><div class=\"view_detail\" onclick=\"viewWeather('" + data[i].DeviceID + "')\">查看详情</div></div>");
                } else {
                    $(".equipment .equip_con li.combine_con").append("<div class=\"weather\"><div class=\"clearfix\"><span class=\"fl\">气象站</span><span class='fr unrun'><img src='../images/governmenthomedeteal/unrun_point.png' alt=''>暂未运行</span></div><div class=\"view_detail\" onclick=\"viewWeather('" + data[i].DeviceID + "')\">查看详情</div></div>");
                }
                $("#za_weather").css("display", "block");
            }
        }
    }else{
        $(".equipment .equip_con li.combine_con").empty().append("<div class='nodata'><img src='../images/governmenthomedeteal/nozonghe.png' alt='暂无综合设备'><p>暂无综合设备</p></div>");
        $("#za_weather").css("display", "block");
    }
}

/*摄像头模块初始化*/
function videoinit(videodata) {
    var index = 0;
    $(".equipment .equip_con li.camera_con .changeTab .fl img:first").attr("src", "../images/governmenthomedeteal/rootvideo_bplus.png");
    $(".equipment .equip_con li.camera_con .commonbox").html("");
    if (videodata.length > 0) {
        var videohtml = '';
        for (var i = 0; i < videodata.length; i++) {
            var ulobj = $("<ul class='common' titlename=" + videodata[i].CameraName + "></ul>");
            index++;
            var status = "在线";
            var classname = "open";
            if(videodata[i].IsOnline == 0){
                status = "离线";
                classname = "unline";
            }
            var liobj = $("<li class='clearfix'><span class='fl'>" + videodata[i].CameraName + "</span><span class='" + 'fr ' + classname + "'>" + status + "</span></li>")
            ulobj.append(liobj);
            $(".equipment .equip_con li.camera_con .commonbox").append(ulobj);
        }
        $(".equipment .equip_con li.camera_con .commonbox .commoncon ul.common:first").addClass("commonactive");
        $(".equip_tit li").eq(0).addClass("on").siblings().removeClass("on");
        $(".equip_con .camera_con").addClass("show").siblings("li").removeClass("show");
    } else {
        //暂无视频
        $(".equipment .equip_con li.camera_con .commonbox").empty().append("<div class='nodata'><img src='../images/governmenthomedeteal/nocarame.png' alt='暂无摄像头'><p>暂无摄像头</p></div>");
    }
    if (videodata.length > 1) {
        $(".equipment .equip_con li.camera_con .changeTab .fr img:first").attr("src", "../images/governmenthomedeteal/rootvideo_a.png");
        zdyscroll($(".equipment .equip_con li.camera_con .commonbox"));
    }else {
        $(".equipment .equip_con li.camera_con .changeTab .fr img:first").attr("src", "../images/governmenthomedeteal/rootvideo_aplus.png")
    }
}

//获取 n位小数
function numTofixed(num,n,per){
	if(num!=0){
		if(arguments.length==3 && per){
			num=num*100;
			return parseInt(num*Math.pow(10,n)+0.5,10)/Math.pow(10,n)+"%"; 
		}else{
			return parseInt(num*Math.pow(10,n)+0.5,10)/Math.pow(10,n); 
		}
	}else{
		if(arguments.length==3 && per){
			return "0%"; 
		}else{
			return 0; 
		}
	}
}

function NullEmpty(str) {
    if (str == null)
        return "0";
    return str;
}

/*查看气象站*/
function viewWeather(id) {
    $.each(weather, function (p, item) {
        if (item.DeviceID == id) {
            $.each(item.Slots, function (index, item2) {
                var value = NullEmpty(item2.Data);
                var unit = item2.Unit;
                value = value + unit;
                if (item2.SlotID == 2) //风向特别处理
                    value = windDirectioin(item2.Data);
                $("#SlotID" + item2.SlotID).find("p").eq(1).text(value);
            })
            return false;
        }
    });
    layer.open({
        title: ['气象站', 'font-size:14px;color:#000;'],
        type: 1,
        skin: 'layui-layer-demo', //样式类名
        closeBtn: 1,//显示关闭按钮
        area: ['850px', '500px'], //宽高
        content: $('#weather_box')
    });
}

/*滚动条初始化*/
function zdyscroll(obj) {
    if (!obj.data("scrollstate")) {
        var height = obj.css("height");
        if (height != undefined) {
            obj.slimScroll({
                width: '320px', //容器宽度,默认无
                height: 'auto', //容器高度,默认250px
                size: '5px', //滚动条宽度,默认7px
                position: 'right', //滚动条位置,可选值:left,right,默认right
                color: '#666', //滚动条颜色,默认#000000
                alwaysVisible: true, //是否禁用隐藏滚动条,默认false
                distance: 0, //距离边框距离,位置由position参数决定,默认1px
                railColor: '#fff', //滚动条背景轨迹颜色,默认#333333
                railOpacity: 0.3, //滚动条背景轨迹透明度,默认0.2
                wheelStep: 10, //滚动条滚动值,默认20
                allowPageScroll: false
            });
        }
        obj.data("scrollstate", true);
    }
}

