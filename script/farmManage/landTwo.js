$(function () {
    landTwo.twoLandInfo();
    landTwo.selectChange();
})
var landTwo = {
    map: null,
    drawingManager: [],
    allShape: [],
    shape: [],
    nowareaindex: 0,
    newpolygon: "",
    landTwoid: decodeURIComponent(atob((location.href).split("&id=")[1])),
    twoLandInfo: function () {
        var param = cloneObjectFn(paramList);
        param['landId'] = landTwo.landTwoid;
        var postdata = GetPostData(param, "land", "getLandInfo");
        postFnajax(postdata).then(function (res) {
            var landTwoData = JSON.parse(res);
            if (landTwoData.data.LandPoints.length == 0) {
                // alert()
                landTwo.initMap()
                landTwo.removefirsthelp(true); //首次绘制
                // landTwo.fistLandState = true;
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
        // alert("222")
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
        landTwo.map = new google.maps.Map(document.getElementById('createmaparea'), {
            zoom: Number(landTwoData.data.MapZoom),
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
        $("#createmap .maphelptext").find("span").html("依次打点以绘制地块,鼠标左键双击或地块轮廓闭合时可结束绘制,结束后可拖拽边界点来修改轮廓。");
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
        var newdrawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: ['polygon']
            },
            markerOptions: {
                icon: './pointer.png'
            },
            polygonOptions: {
                strokeColor: "#399afb",
                fillColor: "#399afb",
                fillOpacity: 0.5,
                strokeWeight: 2,
                clickable: true,
                editable: true,
                strokeStyle: 'dashed',
                zIndex: (landTwo.drawingManager.length) + 1
            }
        });
        newdrawingManager.setMap(landTwo.map);
        newdrawingManager.addListener('polygoncomplete', landTwo.shapecomplete); //添加完成事件事件监听
        newdrawingManager.addListener('overlaycomplete', landTwo.overlaycomplete); //添加编辑事件监听
        landTwo.drawingManager.push(newdrawingManager);
    },
    // 多边形 闭合时回调    //绘制的多边形地块闭合后 可拖拽地块点改变地块形状
    shapecomplete: function (e) {
        var index = e.zIndex - 1;
        landTwo.drawingManager[index].setDrawingMode(null);
        if (landTwo.shape[index] != null) {
            landTwo.shape[index].setMap(null);
        }
        //清除上一个围栏叠加层
        landTwo.shape[index] = e;
        landTwo.shape[index].setMap(landTwo.map);
        $("#createmap .maphelptext span").html("可拖拽边界点来修改轮廓");
        $("#createmap .mapcomplete span.mc_edit").css({
            "display": "inline-block"
        });
        $("#createmap .mapcomplete").fadeIn('fast');
    },
    // 绘制地块完成闭合后触发
    overlaycomplete: function (e) {
        if (e.type == google.maps.drawing.OverlayType.POLYGON) {
            var newShape = e.overlay;
            newShape.colorindex = 0;
            landTwo.allShape.push(newShape);
            landTwo.nowareaindex = landTwo.allShape.length - 1;
            newShape.type = e.type;
            var array = newShape.getPath().getArray();
            google.maps.event.addListener(newShape, 'click', function () {});
            google.maps.event.addListener(newShape.getPath(), 'insert_at', function () {});
            google.maps.event.addListener(newShape.getPath(), 'set_at', function () {});
        }
        $("#createmap").unbind('mouseenter');
        $("#createmap").unbind('mouseleave');
        $("#createmap").unbind('click');
        $("#createmap .maphelp").remove();
    },
    //   绘制地块闭合后  点击下一步执行     //提交地块信息(第二步)
    savepolygonpathfn: function () {
        landTwo.editareamenu(landTwo.allShape[landTwo.nowareaindex]);
        if (landTwo.allShape[landTwo.nowareaindex].edit) {
            landTwo.editpolygonstate(landTwo.allShape[landTwo.nowareaindex], landTwo.allShape[landTwo.nowareaindex].strokeColor, false);
        } else {
            landTwo.editpolygonfn(landTwo.allShape[landTwo.nowareaindex], false);
        }
        var coordinateData = landTwo.ReturnLonLat();
        var param = cloneObjectFn(paramList);
        var entityJson = {
            "LandID": landTwo.landTwoid,
            "Longitude": coordinateData[1].center[0], //经度数值大
            "Latitude": coordinateData[1].center[1],
            "MapZoom": coordinateData[1].zoom,
        }
        var coordinatePath = coordinateData[0][0].path;
        var landPoint = []
        for (var i = 0; i < coordinatePath.length; i++) {
            var landPoints = {
                "LandID": landTwo.landTwoid,
                "Index": i + 1,
                "Longitude": coordinatePath[i][1],
                "Latitude": coordinatePath[i][0]
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
    //   修改普通多边形状态
    editpolygonstate: function (obj, edit) {
        obj.setOptions({
            strokeColor: "#399afb",
            fillColor: "#399afb",
            editable: edit,
        })
        obj.strokeColor = "#399afb";
        obj.editable = edit;
    },
    // 修改地块状态，，由可编辑变成不可编辑
    editpolygonfn: function (obj, edit) {
        obj.setOptions({
            strokeColor: "#399afb",
            fillColor: "#399afb",
            fillOpacity: 0.5,
            strokeWeight: 2,
            clickable: true,
            editable: edit,
            strokeStyle: 'dashed'
        })
    },
    //     //闭合后 修改点的回调 统计点坐标
    ReturnLonLat: function () {
        var farmobj = {};
        var polygondata = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < landTwo.allShape.length; i++) {
            var arr = landTwo.allShape[i].getPath().getArray();
            var polygonobj = {
                "path": []
            };
            for (var j = 0; j < arr.length; j++) {
                bounds.extend(arr[j]);
                var pathpointer = []
                pathpointer.push(arr[j].lat());
                pathpointer.push(arr[j].lng());
                (polygonobj.path).push(pathpointer);
            };
            polygonobj.areacolor = landTwo.allShape[i].strokeColor;
            polygonobj.colorindex = landTwo.allShape[i].colorindex;
            polygonobj.areaname = landTwo.allShape[i].areaname;
            polygondata.push(polygonobj);
        }
        farmobj.center = [];
        farmobj.center.push(bounds.getCenter().lat());
        farmobj.center.push(bounds.getCenter().lng());
        farmobj.zoom = landTwo.map.getZoom();
        return [polygondata, farmobj];
    },
    //  闭合后 重新绘制   <--点击 重新绘制 执行 -->
    exitpolygonpathfn: function () {
        $("#createmap .mapcomplete").fadeOut('fast');
        if ($("#createmap .mapcomplete span.mc_edit_exit").html() == "取消本次修改") {

            $("#createmap .mapeditlist").css("right", "-210px");
            $("#createmap .mapeditarea .areaedit").show().siblings(".carameedit").hide();
            $("#createmap .mapeditarea").animate({
                "right": "0px"
            }, 200, function () {
                $("#createmap .mapcomplete span.mc_edit_exit").html("放弃本次编辑");
            });
            $("#createmap .maphelptext").slideUp('fast');
            if (landTwo.allShape[landTwo.nowareaindex].edit) {

                landTwo.allShape[landTwo.nowareaindex].setPaths(temppath);
                landTwo.editpolygonstate(landTwo.allShape[landTwo.nowareaindex], landTwo.allShape[landTwo.nowareaindex].strokeColor, true)
            } else {

                landTwo.allShape[landTwo.nowareaindex].setPaths(temppath);
                landTwo.editpolygonfn(landTwo.allShape[landTwo.nowareaindex], true);
            }
        } else if ($("#createmap .mapcomplete span.mc_edit_exit").html() != "取消本次修改" && $("#createmap .mapeditlist .maplistcon ul li").length > 0) {

            $("#createmap .maphelptext").slideUp('fast');
            $("#createmap .mapeditarea").css("right", "-210px");
            $("#createmap .mapeditlist").animate({
                "right": "0px"
            }, 200);
            if (!landTwo.allShape[landTwo.nowareaindex].edit) {

                landTwo.allShape[landTwo.nowareaindex].setMap(null);
                landTwo.allShape.splice(landTwo.nowareaindex, 1);
            }
        } else {

            $("#createmap .maphelptext").find("span").html("依次打点以绘制地块,鼠标左键双击或地块轮廓闭合时可结束绘制,结束后可拖拽边界点来修改轮廓。");
            if (!landTwo.allShape[landTwo.nowareaindex].edit) {

                landTwo.allShape[landTwo.nowareaindex].setMap(null);
                landTwo.allShape.splice(landTwo.nowareaindex, 1);
            }
            layer.msg('请在地图上打点重新绘制', {
                time: 1500
            });
            landTwo.drawPolygonMap();
        }
    },
    //   地块编辑 初始化 和修改
    editareamenu: function (obj) {
        // console.log(6666)
        // console.log(arguments)
        if (arguments.length == 0) {
            $("#createmap .mapeditarea input.polygonname").val();
            $("#createmap .mapeditnc .polygoncolors span:first").addClass("colorbtnactive").siblings("span").removeClass("colorbtnactive");
        } else {
            if (obj) {
                // console.log(obj)
                $("#createmap .mapeditnc>p.mapareanamebox span.planttextlength").html("");
                if ($("#createmap .mapeditarea").data("mapeditareaname") && $("#createmap .mapeditarea").data("mapeditareaname") != "") {
                    $("#createmap .mapeditarea input.polygonname").val($("#createmap .mapeditarea").data("mapeditareaname"));
                } else {
                    $("#createmap .mapeditarea input.polygonname").val(obj.areaname);
                }
                $("#createmap .mapeditnc .polygoncolors span").eq(obj.colorindex).addClass("colorbtnactive").siblings("span").removeClass("colorbtnactive");
            }
        }
    },
    //地区三级联动监听
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
    //改变地图中心，重新
    mapLatLngchange: function (zoom) {
        var address = $("#companypicker select.pa").val() + $("#companypicker select.pb").val() + $("#companypicker select.pc").val() + $("#whiteaddress").val();
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            address: address
        }, function (results, status) {
            if (results.length == 0 || status == "ZERO_RESULTS") {
                layer.msg('未搜索到该地址', {
                    time: 1500
                });
            } else {
                //判断解析状态
                if (status == google.maps.GeocoderStatus.OK) {
                    landTwo.map.setCenter(results[0].geometry.location);
                    landTwo.map.setZoom(zoom);
                } else {
                    return false;
                }
            }
        });
    }, //  点击编辑绘制对应的地块
    drawdbx: function (polygonobj) {
        $("#createmap .maphelptext").slideDown('fast');
        $("#createmap .maphelptext span").html("可拖拽边界点来修改轮廓");
        $("#createmap .mapcomplete span.mc_edit_new").remove();
        $("#createmap .mapcomplete span.mc_edit").css({
            "display": "inline-block"
        });
        $("#createmap .mapcomplete").fadeIn('fast');
        var myTrip = [];
        for (var i in polygonobj) {
            var item = new google.maps.LatLng(polygonobj[i][0], polygonobj[i][1]);
            myTrip.push(item);
        }

        landTwo.newpolygon = new google.maps.Polygon({
            path: myTrip,
            strokeColor: "#1e9fff",
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: "#1e9fff",
            fillOpacity: 0.5,
            editable: true,
            geodesic: true,
        });
        landTwo.newpolygon.setMap(landTwo.map);
        landTwo.newpolygon.edit = true;
        landTwo.newpolygon.areaname = polygonobj.areaname;
        if (polygonobj.colorindex) {
            landTwo.newpolygon.colorindex = polygonobj.colorindex;
        } else {
            landTwo.newpolygon.colorindex = 0;
        }
        landTwo.allShape.push(landTwo.newpolygon);
    },
}