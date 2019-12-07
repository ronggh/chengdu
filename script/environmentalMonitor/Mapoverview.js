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
            //alert("刷新数据1");
            // console.log($("#area").val())
            GetArea($("#area").val())
        }, 500);
    });
    $(".plants p.tit span").bind('click', function () {
        $(this).addClass("active").siblings("span").removeClass("active");
        $(".plants .itemjspz").eq($(this).index()).show().siblings(".itemjspz").hide();
    })
})

//监听键盘事件
$(document).keyup(function (event) {
    $(".equipment").focus();
    if ($("body").width() > 1680) {
        //++
        if (event.keyCode == 187 || event.keyCode == 107 || event.keyCode == 38) {
            keytimeoldplus = 0;
            keytimenew = Date.parse(new Date());
            if (keytimenew - keytimeold <= 800) {
                if ($("style#biga").length == 1 && $("style#bigb").length != 1) {
                    $(".za_conmian").append(bigb);
                } else if ($("style#biga").length != 1 && $("style#bigb").length != 1) {
                    $(".za_conmian").append(biga);
                }
            }
            keytimeold = keytimenew;
        }
        if (event.keyCode == 189 || event.keyCode == 109 || event.keyCode == 40) {
            keytimeold = 0;
            keytimenew = Date.parse(new Date());
            if (keytimenew - keytimeoldplus <= 800) {
                if ($("style#biga").length == 1 && $("style#bigb").length == 1) {
                    bigb = $("style#bigb").detach();
                } else if ($("style#biga").length == 1 && $("style#bigb").length != 1) {
                    biga = $("style#biga").detach();
                }
            }
            keytimeoldplus = keytimenew;
        }
    }
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
            // console.log(data);
            GetArea(data.value);
        })
    });
};

//根据地块获ID获取地块内的详细信息
function GetArea(landId) { //, status, loading
    var param = cloneObjectFn(paramList);
    var postdata = GetPostData(param, "iot", "getIotOverView");
    postFnajax(postdata).then(function (res) {
        // console.log("11111111");
        // console.log(res);
        // console.log(postdata);
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
                // console.log("item>>>>>>>>>>>>>>>>>");
                // console.log(item);
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
        // console.log(item.Latitude, item.Longitude)
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