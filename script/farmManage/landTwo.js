$(function () {
    landTwo.twoLandInfo();
    landTwo.selectChange();
})
var temp;
var landTwo = {
    map: null,
    points:[],                  //存储点击的经纬度
    polygonLayer: null,         //绘制的多边形图层
    lines:null,                 //实线的样式
    tempLines: null,            //虚线的样式
    plotCoordinates: null,      //存储后台需要的多边形经纬度点
    landTwoid: decodeURIComponent(atob((location.href).split("&id=")[1])),
    twoLandInfo: function () {
        var param = cloneObjectFn(paramList);
        param['landId'] = landTwo.landTwoid;
        var postdata = GetPostData(param, "land", "getLandInfo");
        postFnajax(postdata).then(function (res) {
            // console.log(res);
            var landTwoData = JSON.parse(res);
            if (landTwoData.data.LandPoints.length == 0) {
                landTwo.initMap()
                landTwo.removefirsthelp(true); //首次绘制
            } else {
                landTwo.fistLandState = false;
                landTwo.initMap(landTwoData); //初始化地图
                landTwo.removefirsthelp(false); // // 不是首次绘制
                var path = []; // 对地块坐标进行整合
                var arr = [];
                $.each(landTwoData.data.LandPoints, function (index, item) {
                    arr.push(item.Latitude, item.Longitude)
                });
                for (let i = 0; i < arr.length / 2; i++) {
                    path.push(arr.slice(2 * i, 2 + 2 * i))
                };
                // 点击编辑绘制对应的地块
                landTwo.drawdbx(path);
            }
        })
    },
    // 初始化地图
    initMap: function (landTwoData) {
        // console.log(landTwoData);
        var satelliteMap = L.tileLayer.chinaProvider('Google.Satellite.Map', {  
            maxZoom: 22,  
            minZoom: 5  
        });
        var googleimga = L.tileLayer.chinaProvider('Google.Satellite.Annotion', {  
                maxZoom: 22,  
                minZoom: 5  
            });
        var googleimage = L.layerGroup([satelliteMap, googleimga]);  
        if (landTwoData == undefined) {
            landTwoData = {
                "data": {
                    "Longitude": "39.90484185919572",
                    "Latitude": "116.4108939005555",
                    "MapZoom": 12,
                }
            }
        }
        var myLatLng = {
            lat: Number(landTwoData.data.Longitude),
            lng: Number(landTwoData.data.Latitude)
        };
        landTwo.map = L.map("createmaparea", {  
            center: myLatLng,  
            zoom: Number(landTwoData.data.MapZoom),  
            layers: [googleimage],  
            zoomControl: false,
            editable: true,
            zoomControl: false,//放大缩小控件，不显示
            attributionControl: false//右下角属性控件，不显示
        });  
    },
    //地图首次绘制提示事件 <-- 创建地块时地图上的绘制提示事件 -->
    removefirsthelp: function (bind) {
        if (bind) {
            $("#createmap").bind('mouseenter', function () {
                $("#createmap .maphelp").stop().fadeOut('150', function () {
                    $("#createmap .maphelptext").slideDown('fast');
                    $("#createmap .mapcomplete").fadeIn('fast');
                });
            })
            $("#createmap").bind('mouseleave', function () {
                $("#createmap .maphelp").stop().fadeIn('150');
                $("#createmap .maphelptext").slideUp('fast');
                $("#createmap .mapcomplete").fadeOut('fast');
            })
        } else {
            $("#createmap").unbind('mouseenter');
            $("#createmap").unbind('mouseleave');
            $("#createmap").unbind('click');
            $("#createmap .maphelp").remove();
        }
    },
    //  开始绘制地块
    newpolygonareafn: function () {
        $("#createmap .maphelptext").find("span").html("依次打点以绘制地块,鼠标左键双击可结束绘制,结束后可拖拽边界点来修改轮廓。");
        $("#createmap .mapcomplete span.mc_edit_new").remove();
        $("#createmap .mapcomplete span.mc_edit").css({
            "display": "none"
        });
        // 解绑事件
        $("#createmap").unbind('mouseenter');
        $("#createmap").unbind('mouseleave');
        $("#createmap").unbind('click');
        $("#createmap .maphelp").remove();
        setTimeout(function () {
            landTwo.drawPolygonMap();
        }, 200);
    },
    drawPolygonMap: function () {
        // 单击后确定的实线
        landTwo.lines = new L.polyline([],{
            weight: 3,
            color: '#399afb',
        });
        // 跟随鼠标的虚线
        landTwo.tempLines = new L.polyline([],{
            weight: 3,
            color: '#399afb',
            dashArray: 5,
        });
        landTwo.map.on('click',function(e){
            landTwo.points.push([e.latlng.lat, e.latlng.lng]);//点击的点所在的经纬度
            landTwo.lines.addLatLng(e.latlng);
            landTwo.map.addLayer(landTwo.tempLines);
            landTwo.map.addLayer(landTwo.lines);
        });
        landTwo.map.on('mousemove',function(e){
            // 鼠标移动跟随鼠标移动的虚线
            if (landTwo.points.length > 0) {
                ls = [landTwo.points[landTwo.points.length - 1], [e.latlng.lat, e.latlng.lng], landTwo.points[0]]
                landTwo.tempLines.setLatLngs(ls);
            }
        });
        landTwo.map.on('dblclick',function(e){
            // console.log(landTwo.points);
            landTwo.plotCoordinates = landTwo.points.slice(0,landTwo.points.length-1);//删除双击产生的冗余坐标
            if(landTwo.plotCoordinates.length >= 2){
                // console.log(landTwo.plotCoordinates);
                landTwo.polygonLayer = L.polygon(landTwo.plotCoordinates);
                landTwo.map.addLayer(landTwo.polygonLayer);
                landTwo.map.removeLayer(landTwo.lines); //删除实线
                landTwo.map.removeLayer(landTwo.tempLines); //删除虚线
                landTwo.map.off('click');   // 关闭点击地图绘制地块事件
                $("#createmap .maphelptext span").html("依次打点以绘制地块,鼠标左键双击可结束绘制,结束后可拖拽边界点来修改轮廓。。");
                $("#createmap .mapcomplete span.mc_edit").css({
                    "display": "inline-block"
                });
                $("#createmap .mapcomplete").fadeIn('fast');
            }
        });
    },

    //  闭合后 重新绘制   <--点击 重新绘制 执行 -->
    exitpolygonpathfn: function () {
        $("#createmap .mapcomplete").fadeOut('fast');
        $('g').empty()
        landTwo.map.removeLayer(landTwo.polygonLayer);//删除地块图层
        landTwo.plotCoordinates = null;
        landTwo.points = [];
        landTwo.polygonLayer = null;
        landTwo.lines = null;
        landTwo.tempLines = null;
        landTwo.removefirsthelp(false); // // 不是首次绘制
        landTwo.drawPolygonMap();
    },

    //  闭合后 点击下一步执行     //提交地块信息(第二步)
    savepolygonpathfn: function () {
        // console.log(landTwo.polygonLayer);
        // console.log(landTwo.map);
        var param = cloneObjectFn(paramList);
        var entityJson = {
            "LandID": landTwo.landTwoid,
            "Longitude": (landTwo.polygonLayer._bounds._southWest.lat + landTwo.polygonLayer._bounds._northEast.lat)/2, //经度数值大
            "Latitude": (landTwo.polygonLayer._bounds._southWest.lng + landTwo.polygonLayer._bounds._northEast.lng)/2,
            "MapZoom": landTwo.map._zoom,
        }
        var landPoint = []
        for (var i = 0; i < landTwo.polygonLayer._latlngs[0].length; i++) {
            var landPoints = {
                "LandID": landTwo.landTwoid,
                "Index": i + 1,
                "Longitude": landTwo.polygonLayer._latlngs[0][i].lng,
                "Latitude": landTwo.polygonLayer._latlngs[0][i].lat
            }
            landPoint.push(landPoints);
        }
        entityJson.LandPoints = landPoint;
        param["entity"] = getUTF8(entityJson);
        var postdata = GetPostData(param, "land", "setLandMap");
        postFnajax(postdata).then(function (res) {
            var landResult = JSON.parse(res);
            if (landResult.result.code == 200) {
                layer.msg("地块绘制成功", {
                    time: 1000
                }, function () {
                    LoadAction('landThree', '0', entityJson.LandID)
                });
            } else {
                layer.msg(landResult.result.msg, {
                    time: 1000
                });
            }
        });
    },

    //  点击编辑绘制对应的地块
    drawdbx: function (polygonobj) {
        $("#createmap .maphelptext").slideDown('fast');
        $("#createmap .maphelptext span").html("可拖拽边界点来修改轮廓");
        $("#createmap .mapcomplete span.mc_edit_new").remove();
        $("#createmap .mapcomplete span.mc_edit").css({
            "display": "inline-block"
        });
        $("#createmap .mapcomplete").fadeIn('fast');
        // console.log(polygonobj);
        landTwo.polygonLayer = L.polygon(polygonobj);
        landTwo.map.addLayer(landTwo.polygonLayer);
        landTwo.polygonLayer.enableEdit();
    },

    // //地区三级联动监听
    selectChange: function () {
        $("#companypicker select").bind('click', function () {
            $("#companypicker select").css("color", "#666");
            $(this).unbind('click');
        })
        $("#companypicker select").change(function () {
            setTimeout(function () {
                if ($("#companypicker select.pa option:first").html() != '省、自治区、直辖市') {
                    $("#companypicker select.pa option:first").html('省、自治区、直辖市');
                }
                //var address = $("#companypicker select.pa").val() + $("#companypicker select.pb").val() + $("#companypicker select.pc").val();
                landTwo.mapLatLngchange(15);
            }, 300)
        })
        $(".createmarker input.whiteaddress").bind('change', function () {
            landTwo.mapLatLngchange(15);
        })
        $(".createmarker span.farmmapdingwei").bind('click', function () {
            landTwo.mapLatLngchange(17);
        })
    },
    // //改变地图中心，重新
    mapLatLngchange: function (zoom) {
        var address = $("#companypicker select.pa").val() + $("#companypicker select.pb").val() + $("#companypicker select.pc").val() + $("#whiteaddress").val();
        var geocoder = new AMap.Geocoder();
        geocoder.getLocation(address, function(status, result) {
            if (status === 'complete'&& result.geocodes.length) {
                var lnglat = result.geocodes[0].location;
                landTwo.map.panTo({lat: lnglat.lat, lng: lnglat.lng})
            }else{
                layer.msg('未搜索到该地址', {
                    time: 1500
                });
            }
        })
    }, 
}