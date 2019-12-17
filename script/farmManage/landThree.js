$(function () {
    initLayuifn(['element', 'form', 'table', 'layer', 'laytpl', 'laypage', 'laydate', 'upload', 'tree', 'util', 'transfer'], function () {
        form.render();
        form.on('select(cameraData)', function (data) {
            if (data.value != "") {
                threeInfoFn.cameraPintData = data.value;
            }
        });
        //设备下拉框每改变一次可在地块上安装一个
        form.on('select(deviceSelect)', function (data) {
            if (data.value != "") {
                threeInfoFn.deverPintData = data.value;
            }
        });
        table.on('tool(manageTable)', function (obj) {
            var data = obj.data;
            if (obj.event === 'edit') {
                messageManageFn.seemessage(data);
            };
            if (obj.event === 'del') {
                threeInfoFn.delland(data);
            }
        })
    });
    threeInfoFn.devCam();
    threeInfoFn.threeInfo()
});
var threeInfoFn = {
    pageLimit: 12, //设置本页面的一页显示多少条数据
    pageCurr: 1,
    map: null,
    allShape: [],
    oldclimate: [],
    allmarker: [],
    vameraArr: [],
    deverceaArr: [], //设备坐标表格数据   //设备打出的点的集合
    cameraMarker: [], //摄像头点
    deverceMarker: [], //设备点
    nowmarkerindex: 0,
    markersdata: [],
    newpolygon: "",
    camSelectData: "", // 初始化时存储摄像头的数据
    devSelectData: "", //初始化时存储设备的数据
    cameraPintData: "", //记录打的点
    deverPintData: "",
    cameraPintArr: [], //记录打点的摄像头
    deverPintArr: [], //记录设备点的集合
    searchTime: Math.round(new Date(new Date().getFullYear(), new Date().getMonth()).getTime()) + 8 * 60 * 60 * 1000,
    //地块-------------------------------------------------
    landTwoid: decodeURIComponent(atob((location.href).split("&id=")[1])),
    threeInfo: function () {
        var param = cloneObjectFn(paramList);
        param['landId'] = threeInfoFn.landTwoid;
        var postdata = GetPostData(param, "land", "getLandInfo");
        postFnajax(postdata).then(function (res) {
            // console.log(res);
            var landTwoData = JSON.parse(res);
            threeInfoFn.initMap(landTwoData)
            threeInfoFn.initMap(landTwoData); //初始化地图
            threeInfoFn.removefirsthelp(false); // // 不是首次绘制
            var path = []; // 对地块坐标进行整合
            var arr = [];
            $.each(landTwoData.data.LandPoints, function (index, item) {
                arr.push(item.Latitude, item.Longitude)
            });
            for (let i = 0; i < arr.length / 2; i++) {
                path.push(arr.slice(2 * i, 2 + 2 * i))
            };
            // 点击编辑绘制对应的地块
            threeInfoFn.drawdbx(path);
            threeInfoFn.markerCamera(landTwoData.data.LandCameras);
            threeInfoFn.markerDever(landTwoData.data.LandDevices)
        })
    },
    //初始化地图
    initMap: function (landRes) {
        var myLatLng = {
            lat: Number(landRes.data.Longitude),
            lng: Number(landRes.data.Latitude)
        };
        threeInfoFn.map = new google.maps.Map(document.getElementById('createmaparea'), {
            zoom: Number(landRes.data.MapZoom),
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
    //根据设备点绘制设备及摄像头位置
    markerCamera: function (cameraData) {
        // console.log("<<<<<<<< 编辑时摄像头点cameraData >>>>>>>>>>>")
        // console.log(cameraData);
        $.each(cameraData, function (index, item) {
            var marker = new google.maps.Marker({
                position: {
                    lat: Number(item.Latitude),
                    lng: Number(item.Longitude)
                },
                map: threeInfoFn.map,
                name: item.CameraName,
                value: item.CameraID,
                lat: item.Latitude,
                lng: item.Longitude,
                icon: './images/shexiangtouhong@2x.png'
            });
            marker.setMap(threeInfoFn.map);
            threeInfoFn.cameraMarker.push(marker);
            nowmarkerindex = threeInfoFn.cameraMarker.length - 1;
            threeInfoFn.vameraArr = [];
            $.each(threeInfoFn.cameraMarker, function (index, item) {
                var cameraJson = {};
                cameraJson.CameraID = item.value;
                cameraJson.CameraName = item.name;
                cameraJson.Latitude = item.lat;
                cameraJson.Longitude = item.lng;
                threeInfoFn.vameraArr.push(cameraJson)
            });
            threeInfoFn.cameraPintArr.push([item]);
        })
        $("#createmap .mapeditarea .carameedit").find("input,textarea").val("");
        // console.log(threeInfoFn.vameraArr)

        threeInfoFn.cameraTableFn(threeInfoFn.vameraArr);
    },
    markerDever: function (deverData) {
        // console.log("<<<<<<<< 编辑时设备点deverData >>>>>>>>>>>")
        // console.log(deverData);
        $.each(deverData, function (index, item) {
            var marker = new google.maps.Marker({
                position: {
                    lat: Number(item.Latitude),
                    lng: Number(item.Longitude)
                },
                map: threeInfoFn.map,
                name: item.DeviceName,
                value: item.DeviceID,
                lat: item.Latitude,
                lng: item.Longitude,
                icon: './images/shebei@2x.png'
            });
            marker.setMap(threeInfoFn.map);
            threeInfoFn.deverceMarker.push(marker);
            nowmarkerindex = threeInfoFn.deverceMarker.length - 1;
            threeInfoFn.deverceaArr = [];
            //根据设备标记绘制对应的设备表格
            $.each(threeInfoFn.deverceMarker, function (index, item) {
                var deverceJson = {};
                deverceJson.DeviceID = item.value;
                deverceJson.DeviceName = item.name;
                deverceJson.Latitude = item.lat;
                deverceJson.Longitude = item.lng;
                threeInfoFn.deverceaArr.push(deverceJson)
            })
            threeInfoFn.deverPintArr.push([item]);
        })
        $("#createmap .mapeditarea .carameedit").find("input,textarea").val("");
        threeInfoFn.deverTableFn(threeInfoFn.deverceaArr);
    },

    //  编辑绘制对应的地块
    drawdbx: function (polygonobj) {
        var myTrip = [];
        for (var i in polygonobj) {
            var item = new google.maps.LatLng(polygonobj[i][0], polygonobj[i][1]);
            myTrip.push(item);
        }
        // console.log(myTrip)
        threeInfoFn.newpolygon = new google.maps.Polygon({
            path: myTrip,
            strokeColor: "#1e9fff",
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: "#1e9fff",
            fillOpacity: 0.5,
            editable: false,
            geodesic: true,
        });
        threeInfoFn.newpolygon.addListener('click', function (event) {
            //摄像头打点操作
            if (threeInfoFn.cameraPintData) {
                threeInfoFn.addmarkerpointerfn(event, threeInfoFn.cameraPintData);
                var indexArr = '';
                $.each(threeInfoFn.camSelectData.data, function (index, item) {
                    if (item.CameraID == threeInfoFn.cameraPintData.split(",")[0]) {
                        indexArr = index;
                    }
                })
                threeInfoFn.cameraPintArr.push(threeInfoFn.camSelectData.data.splice(indexArr, 1))
                threeInfoFn.selectFunction(threeInfoFn.devSelectData, threeInfoFn.camSelectData)
                threeInfoFn.cameraPintData = "";
            }
            //设备打点操作
            if (threeInfoFn.deverPintData) {
                threeInfoFn.addmarkerDevercefn(event, threeInfoFn.deverPintData);
                var indexArr = "";
                $.each(threeInfoFn.devSelectData.data, function (index, item) {
                    if (item.DeviceID == threeInfoFn.deverPintData.split(",")[0]) {
                        indexArr = index;
                    }
                })
                threeInfoFn.deverPintArr.push(threeInfoFn.devSelectData.data.splice(indexArr, 1))
                threeInfoFn.selectFunction(threeInfoFn.devSelectData, threeInfoFn.camSelectData)
                threeInfoFn.deverPintData = "";
            }
        });

        //摄像头下拉框每改变一次可在地块上安装一个
        threeInfoFn.newpolygon.setMap(threeInfoFn.map);
        threeInfoFn.newpolygon.edit = true;
        threeInfoFn.newpolygon.areaname = polygonobj.areaname;
        if (polygonobj.colorindex) {
            threeInfoFn.newpolygon.colorindex = polygonobj.colorindex;
        } else {
            threeInfoFn.newpolygon.colorindex = 0;
        }
        threeInfoFn.allShape.push(threeInfoFn.newpolygon);
    },
    //   地块上摄像头标记的初始化  <-- 添加摄像头的点 -->
    addmarkerpointerfn: function (pointer, editinit) {
        $("#landManage .CameraTab").css('display', 'block');
        // console.log(editinit)
        var cameraArr = editinit.split(",");
        var marker = new google.maps.Marker({
            position: {
                lat: pointer.latLng.lat(),
                lng: pointer.latLng.lng()
            },
            map: threeInfoFn.map,
            name: cameraArr[1],
            value: cameraArr[0],
            icon: './images/shexiangtouhong@2x.png'
        });
        marker.lat = pointer.latLng.lat();
        marker.lng = pointer.latLng.lng();
        marker.setMap(threeInfoFn.map);
        threeInfoFn.cameraMarker.push(marker); //摄像头坐标点集合
        nowmarkerindex = threeInfoFn.cameraMarker.length - 1;
        threeInfoFn.vameraArr = [];
        $.each(threeInfoFn.cameraMarker, function (index, item) {
            var cameraJson = {};
            cameraJson.CameraID = item.value;
            cameraJson.CameraName = item.name;
            cameraJson.Latitude = item.lat;
            cameraJson.Longitude = item.lng;
            threeInfoFn.vameraArr.push(cameraJson)
        });
        $("#createmap .mapeditarea .carameedit").find("input,textarea").val("");
        threeInfoFn.cameraTableFn(threeInfoFn.vameraArr);
    },
    //绘制摄像头表格
    cameraTableFn: function (cvameraArrdata) {
        // console.log("<<<<<<<<<<<<<  CameraTable的数据 >>>>>>>>>>");
        // console.log(cvameraArrdata);
        table.render({
            elem: '#cameraTab',
            cols: [
                [ //标题栏
                    {
                        type: 'numbers',
                        title: '序号',
                        align: 'center'
                    }, {
                        field: 'CameraName',
                        title: '摄像头名称',
                        align: 'center'
                    }, {
                        field: 'CameraID',
                        title: 'ID',
                        align: 'center'
                    }, {
                        field: 'Latitude',
                        title: '经度',
                        align: 'center'
                    }, {
                        field: 'Longitude',
                        title: '纬度',
                        align: 'center'
                    }, {
                        title: '操作',
                        toolbar: '#cameraTable',
                        align: 'center'
                    }
                ]
            ],
            data: cvameraArrdata,
            skin: 'line',
            even: true,
            limit: 30,
            id: 'cameraTab'
        })
        table.reload('cameraTab', {
            data: cvameraArrdata
        });
    },
    //删除摄像头标记
    delectCameraMarker: function (deverceObj) {
        table.on('row(cameraTab)', function (obj) {
            // 表格对应行的删除
            var oldData = table.cache["cameraTab"];
            oldData.splice(obj.tr.data('index'), 1);
            table.reload('cameraTab', {
                data: oldData
            });

            //地块上对应icon的删除
            for (var index = 0; index < threeInfoFn.cameraMarker.length; index++) {
                if (obj.data.CameraID == threeInfoFn.cameraMarker[index].value) {
                    threeInfoFn.cameraMarker[index].setMap(null); //删除坐标点
                    threeInfoFn.cameraMarker.splice(index, 1); //原数组数据
                }
            }
            //还原摄像头下拉列表
            for (var index = 0; index < threeInfoFn.cameraPintArr.length; index++) {
                if (obj.data.CameraID == threeInfoFn.cameraPintArr[index][0].CameraID) {
                    threeInfoFn.camSelectData.data.push(threeInfoFn.cameraPintArr[index][0]);
                    threeInfoFn.cameraPintArr.splice(index, 1);
                    threeInfoFn.vameraArr.splice(index, 1)
                }
            }
            // console.log("<<<<<<<<< 删除table后摄像头数据 >>>>>>>>>>");
            // console.log(threeInfoFn.camSelectData);
            threeInfoFn.selectFunction(threeInfoFn.devSelectData, threeInfoFn.camSelectData)
        })
    },
    //  地块上添加设备点  
    addmarkerDevercefn: function (pointer, editinit) {
        $("#landManage .deverceTab").css('display', 'block');
        var devArr = editinit.split(",");
        var marker = new google.maps.Marker({ //每个设备标记的对象
            position: {
                lat: pointer.latLng.lat(),
                lng: pointer.latLng.lng()
            },
            map: threeInfoFn.map,
            name: devArr[1],
            value: devArr[0],
            icon: './images/shebei@2x.png'
        });
        marker.lat = pointer.latLng.lat();
        marker.lng = pointer.latLng.lng();
        marker.setMap(threeInfoFn.map);
        threeInfoFn.deverceMarker.push(marker);
        nowmarkerindex = threeInfoFn.deverceMarker.length - 1;
        threeInfoFn.deverceaArr = [];
        //根据设备标记绘制对应的设备表格
        $.each(threeInfoFn.deverceMarker, function (index, item) {
            var deverceJson = {};
            deverceJson.DeviceID = item.value;
            deverceJson.DeviceName = item.name;
            deverceJson.Latitude = item.lat;
            deverceJson.Longitude = item.lng;
            threeInfoFn.deverceaArr.push(deverceJson)
        })
        $("#createmap .mapeditarea .carameedit").find("input,textarea").val("");
        threeInfoFn.deverTableFn(threeInfoFn.deverceaArr);
    },
    deverTableFn: function (deverceaTableArr) {
        // console.log(deverceaTableArr);
        // console.log(deverceaTableArr.length);
        table.render({
            elem: '#deverceTab',
            cols: [
                [ //标题栏
                    {
                        type: 'numbers',
                        title: '序号',
                        align: 'center'
                    }, {
                        field: 'DeviceName',
                        title: '设备名称',
                        align: 'center'
                    }, {
                        field: 'DeviceID',
                        title: 'ID',
                        align: 'center'
                    }, {
                        field: 'Latitude',
                        title: '经度',
                        align: 'center'
                    }, {
                        field: 'Longitude',
                        title: '纬度',
                        align: 'center'
                    }, {
                        title: '操作',
                        toolbar: '#deverceTable',
                        align: 'center'
                    }
                ]
            ],
            data: deverceaTableArr,
            skin: 'line',
            even: true,
            id: 'deverceTab',
            limit: deverceaTableArr.length, 
        })
        table.reload('deverceTab', {
            data: deverceaTableArr
        });
    },
    //删除设备标记
    delectDeverceMarker: function (deverceObj) {
        table.on('row(deverceTab)', function (obj) {
            // 表格对应行的删除
            var oldData = table.cache["deverceTab"];
            oldData.splice(obj.tr.data('index'), 1);
            table.reload('deverceTab', {
                data: oldData
            });
            //地块上对应icon的删除
            for (var index = 0; index < threeInfoFn.deverceMarker.length; index++) {
                if (obj.data.DeviceID == threeInfoFn.deverceMarker[index].value) {
                    threeInfoFn.deverceMarker[index].setMap(null); //删除坐标点
                    threeInfoFn.deverceMarker.splice(index, 1); //删除原数组数据
                }
            }
            //还原设备下拉列表
            for (var index = 0; index < threeInfoFn.deverPintArr.length; index++) {
                if (obj.data.DeviceID == threeInfoFn.deverPintArr[index][0].DeviceID) {
                    threeInfoFn.devSelectData.data.push(threeInfoFn.deverPintArr[index][0])
                    threeInfoFn.deverPintArr.splice(index, 1);
                    threeInfoFn.deverceaArr.splice(index, 1)
                }
            }
            threeInfoFn.selectFunction(threeInfoFn.devSelectData, threeInfoFn.camSelectData)
        })
    },
    // /*-------------------------------------- 地图绘制功能函数 end --------------------------------------*/

    //地图第三步提交数据
    threeSure: function () {
        // console.log(threeInfoFn.cameraMarker)          //摄像头的坐标点
        // console.log(threeInfoFn.deverceMarker)          //设备的坐标点
        if (threeInfoFn.cameraMarker.length == 0 && threeInfoFn.deverceMarker == 0) {
            layer.msg("请至少选择一个设备或摄像头", {
                time: 1500
            })
            return false;
        } else {
            var cameraMarkerArr = [];
            var deverceMarkerArr = [];
            $.each(threeInfoFn.cameraMarker, function (index, item) {
                var cameraMarkerData = {
                    "CameraID": item.value,
                    "LandID": threeInfoFn.landTwoid,
                    "Longitude": item.lng,
                    "Latitude": item.lat,
                };
                cameraMarkerArr.push(cameraMarkerData);
            })
            $.each(threeInfoFn.deverceMarker, function (index, item) {
                var deverceMarkerData = {
                    "DeviceID": item.value,
                    "LandID": threeInfoFn.landTwoid,
                    "Longitude": item.lng,
                    "Latitude": item.lat,
                };
                deverceMarkerArr.push(deverceMarkerData);
            })
            var entityJson = {
                "LandCameras": cameraMarkerArr,
                "LandDevices": deverceMarkerArr,
            }
            var param = cloneObjectFn(paramList);
            param["entity"] = getUTF8(entityJson);
            var postdata = GetPostData(param, "land", "SetLandDeviceCamera");
            postFnajax(postdata).then(function (res) {
                var DeviceCameraRes = JSON.parse(res);
                if (DeviceCameraRes.result.code == 200) {
                    layer.msg("绑定成功", {
                        time: 1500
                    });
                    LoadAction('landManage', '0');
                } else {
                    layer.msg("绑定失败", {
                        time: 1500
                    });
                }
            })

        }
    },
    devCam: function () {
        //设备
        var param = cloneObjectFn(paramList);
        param['status'] = 0;
        var postdata = GetPostData(param, "land", "getDeviceList");
        postFnajax(postdata).then(function (res) {
            // console.log("设备");
            // console.log(res);
            var deviceSelectData = JSON.parse(res);
            threeInfoFn.devSelectData = deviceSelectData;
            //摄像头
            param = cloneObjectFn(paramList);
            param['status'] = 0;
            var postdata = GetPostData(param, "land", "getCameraList"); //status 0
            postFnajax(postdata).then(function (res) {
                // console.log("摄像头");
                // console.log(res);
                // console.log(postdata);
                var cameraSelectData = JSON.parse(res);
                threeInfoFn.camSelectData = cameraSelectData;
                threeInfoFn.selectFunction(threeInfoFn.devSelectData, threeInfoFn.camSelectData)
            });
        });
    },
    //threeInfoFn.DeverCaneraIcon()
    //编辑时重新渲染设备以及摄像头121.87591207512901  ,31.074156893879596
    DeverCaneraIcon: function () {
        var marker = new google.maps.Marker({
            position: {
                lat: 31.074156893879596,
                lng: 121.87591207512901
            },
            map: threeInfoFn.map,
            icon: './images/shexiangtouhong@2x.png'
        });
        marker.lat = pointer[0];
        marker.lng = pointer[1];
        marker.setMap(threeInfoFn.map);
    },

    //渲染设备和摄像头下拉列表
    selectFunction: function (deviceSelectData, cameraSelectData) {
        var deviceSelect = '<option value="">请选择设备</option>';
        var cameraSelect = '<option value="">请选择摄像头</option>';
        // console.log(">>>>>>>>>>>>>>>>>>>>>");
        // console.log(deviceSelectData);
        // console.log(cameraSelectData);
        $.each(deviceSelectData.data, function (index, item) {
            deviceSelect = deviceSelect + '<option value=' + item.DeviceID + "," + item.DeviceName + '>' + item.DeviceName + '</option>';
        })
        $.each(cameraSelectData.data, function (index, item) {
            cameraSelect = cameraSelect + '<option value=' + item.CameraID + "," + item.CameraName + '>' + item.CameraName + '</option>';
        })
        // console.log("<<<<<<<<<<<<<<<<<<<");
        // console.log(deviceSelect);
        // console.log(cameraSelect);
        $('#deviceSelect').html(deviceSelect);
        $('#cameraData').html(cameraSelect);
        form.render('select');
    },
    textmorefn: function (inputobj, textnum, helpobj, nextfn) {
        var flag = true;
        inputobj.on('compositionstart', function () {
            flag = false;
        })
        inputobj.on('compositionend', function () {
            flag = true;
        })
        inputobj.on('input', function () {
            if (helpobj) {
                inputobj.css("border", "1px solid #eee");
            }
            var _this = this;
            setTimeout(function () {
                if (flag) {
                    textchangefn(inputobj, textnum, helpobj, nextfn);
                }
            }, 0)
        })
        threeInfoFn.textchangefn(inputobj, textnum, helpobj, nextfn);
    },
    textchangefn: function (inputobj, textnum, helpobj, nextfn) {
        // var textarr = inputobj.val().split('');
        // var textlength = $.trim(inputobj.val()).length;
        // if (textlength > textnum) {
        //     inputobj.val($.trim(inputobj.val()).substring(0, textnum));
        //     textlength = textnum;
        // }
        // if (helpobj) {
        //     helpobj.html("<i>" + textlength + "</i>" + "/" + textnum);
        //     if (textlength >= textnum) {
        //         helpobj.find("i").css("color", "red");
        //     } else {
        //         helpobj.find("i").css("color", "#c6c6c6");
        //     }
        // }
        // if (nextfn) { nextfn(inputobj); }
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
                    threeInfoFn.map.setCenter(results[0].geometry.location);
                    threeInfoFn.map.setZoom(zoom);
                } else {
                    return false;
                }
            }
        });
    },
}