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
    polygonLayer:null,
    markerCameraLayers:[],//摄像头的图层集合
    markerDeverLayers:[],//设备的图层集合
    cameraLayer:[],//存储摄像头点的图层
    DeverLayer:[],//存储设备点的图层
    vameraArr: [],//存储摄像头的数组
    deverceaArr: [], //设备坐标表格数据   //设备打出的点的集合
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
            var landTwoData = JSON.parse(res);
            threeInfoFn.initMap(landTwoData); //初始化地图
            var path = []; // 对地块坐标进行整合
            var arr = [];
            $.each(landTwoData.data.LandPoints, function (index, item) {
                arr.push(item.Latitude, item.Longitude)
            });
            for (let i = 0; i < arr.length / 2; i++) {
                path.push(arr.slice(2 * i, 2 + 2 * i))
            };
            // 绘制对应的地块
            threeInfoFn.drawdbx(path);
            threeInfoFn.markerCamera(landTwoData.data.LandCameras);//摄像头标记
            threeInfoFn.markerDever(landTwoData.data.LandDevices);  //设备标记
        })
    },
    //初始化地图
    initMap: function (landRes) {
        var satelliteMap = L.tileLayer.chinaProvider('Google.Satellite.Map', {  
            maxZoom: 22,  
            minZoom: 5  
        });
        var googleimga = L.tileLayer.chinaProvider('Google.Satellite.Annotion', {  
                maxZoom: 22,  
                minZoom: 5  
            });
        var googleimage = L.layerGroup([satelliteMap, googleimga]);  
        if (landRes == undefined) {
            landRes = {
                "data": {
                    "Longitude": "39.90484185919572",
                    "Latitude": "116.4108939005555",
                    "MapZoom": 12,
                }
            }
        }
        var myLatLng = {
            lat: Number(landRes.data.Longitude),
            lng: Number(landRes.data.Latitude)
        };
        threeInfoFn.map = L.map("createmaparea", {  
            center: myLatLng,  
            zoom: Number(landRes.data.MapZoom),  
            layers: [googleimage],  
            zoomControl: false,
            editable: true,
        });  
    },
    //根据设备点绘制设备及摄像头位置
    markerCamera: function (cameraData) {
        threeInfoFn.vameraArr = [];
        for (var i = 0; i < cameraData.length; i++) {
            var icon3 = L.icon({
                iconUrl: './images/shexiangtouhong@2x.png',
                iconSize: [20, 26],
                CameraID:cameraData[i].ID
            });
            var marker3 =L.marker([cameraData[i].Latitude,cameraData[i].Longitude], { icon: icon3 });//(小值、大值)
            threeInfoFn.markerCameraLayers.push(marker3);
            threeInfoFn.cameraLayer = L.layerGroup(threeInfoFn.markerCameraLayers);
            threeInfoFn.map.addLayer(threeInfoFn.cameraLayer);
            // 对已有的摄像头点进行格式转换
            var cameraJson = {};
            cameraJson.CameraID = cameraData[i].ID;
            cameraJson.CameraName = cameraData[i].CameraName;
            cameraJson.Latitude = cameraData[i].Latitude;
            cameraJson.Longitude = cameraData[i].Longitude;
            threeInfoFn.vameraArr.push(cameraJson);
            threeInfoFn.cameraPintArr.push([cameraJson]);
        }
        threeInfoFn.cameraTableFn(threeInfoFn.vameraArr);
    },
    markerDever: function (deverData) {
        threeInfoFn.deverceaArr = [];
        for (var i = 0; i < deverData.length; i++) {
            var icon3 = L.icon({
                iconUrl: './images/shebei@2x.png',
                iconSize: [20, 26],
                DeviceID: deverData[i].DeviceID,
            });
            var deverMarker3 = L.marker([deverData[i].Latitude,deverData[i].Longitude], { icon: icon3 });//(小值、大值)
            threeInfoFn.markerDeverLayers.push(deverMarker3);
            threeInfoFn.DeverLayer = L.layerGroup(threeInfoFn.markerDeverLayers);
            threeInfoFn.map.addLayer(threeInfoFn.DeverLayer);
            //设备点坐标结构重绘制
            var deverceJson = {};
            deverceJson.DeviceID = deverData[i].DeviceID;
            deverceJson.DeviceName = deverData[i].DeviceName;
            deverceJson.Latitude = deverData[i].Latitude;
            deverceJson.Longitude = deverData[i].Longitude;
            threeInfoFn.deverceaArr.push(deverceJson);
            threeInfoFn.deverPintArr.push([deverceJson]);
        }
        threeInfoFn.deverTableFn(threeInfoFn.deverceaArr);
    },

    //  编辑绘制对应的地块
    drawdbx: function (polygonobj) {
        threeInfoFn.polygonLayer = L.polygon(polygonobj);
        threeInfoFn.map.addLayer(threeInfoFn.polygonLayer);

        threeInfoFn.polygonLayer.addEventListener('click', function (event) {
            // console.log(event);
        //     //摄像头打点操作
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
        //     //设备打点操作
            if (threeInfoFn.deverPintData) {//threeInfoFn.deverPintData 设备ID  设备名称
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
    },
    //   地块上摄像头标记的初始化  <-- 添加摄像头的点 -->
    addmarkerpointerfn: function (pointer, editinit) {
        $("#landManage .CameraTab").css('display', 'block');
        var cameraArr = editinit.split(",");
        var icon3 = L.icon({
            iconUrl: './images/shexiangtouhong@2x.png',
            iconSize: [20, 26],
            CameraID:cameraArr[0],
        });
        var marker3 =L.marker([pointer.latlng.lat,pointer.latlng.lng], { icon: icon3 });//(小值、大值)
        threeInfoFn.markerCameraLayers.push(marker3);
        threeInfoFn.cameraLayer = L.layerGroup(threeInfoFn.markerCameraLayers);
        threeInfoFn.map.addLayer(threeInfoFn.cameraLayer);
        // 对摄像头点进行格式转换
        var cameraJson = {};
        cameraJson.CameraID = cameraArr[0];
        cameraJson.CameraName = cameraArr[1];
        cameraJson.Latitude = pointer.latlng.lat;
        cameraJson.Longitude = pointer.latlng.lng;
        threeInfoFn.vameraArr.push(cameraJson);
        threeInfoFn.cameraPintArr.push([cameraJson]);
        threeInfoFn.cameraTableFn(threeInfoFn.vameraArr);
    },
    //绘制摄像头表格
    cameraTableFn: function (cvameraArrdata) {
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
            for (var index = 0; index < threeInfoFn.markerCameraLayers.length; index++) {
                if (obj.data.CameraID == threeInfoFn.markerCameraLayers[index].options.icon.options.CameraID) {
                    threeInfoFn.cameraLayer.clearLayers()
                    threeInfoFn.markerCameraLayers.splice(index, 1); //原数组数据
                    threeInfoFn.cameraLayer = L.layerGroup(threeInfoFn.markerCameraLayers);
                    threeInfoFn.map.addLayer(threeInfoFn.cameraLayer);
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
            threeInfoFn.selectFunction(threeInfoFn.devSelectData, threeInfoFn.camSelectData)
        })
    },
    //  地块上添加设备点  
    addmarkerDevercefn: function (pointer, editinit) {
        $("#landManage .deverceTab").css('display', 'block');
        var devArr = editinit.split(",");
        var icon3 = L.icon({
            iconUrl: './images/shebei@2x.png',
            iconSize: [20, 26],
            DeviceID: devArr[0],
        });
        var deverMarker3 = L.marker([pointer.latlng.lat,pointer.latlng.lng], { icon: icon3 });//(小值、大值)
        threeInfoFn.markerDeverLayers.push(deverMarker3);
        threeInfoFn.DeverLayer = L.layerGroup(threeInfoFn.markerDeverLayers);
        threeInfoFn.map.addLayer(threeInfoFn.DeverLayer);
         //设备点坐标结构重绘制
        var deverceJson = {};
        deverceJson.DeviceID = devArr[0];
        deverceJson.DeviceName = devArr[1];
        deverceJson.Latitude = pointer.latlng.lat;
        deverceJson.Longitude = pointer.latlng.lng;
        threeInfoFn.deverceaArr.push(deverceJson);
        threeInfoFn.deverPintArr.push([deverceJson]);
        threeInfoFn.deverTableFn(threeInfoFn.deverceaArr);
    },
    deverTableFn: function (deverceaTableArr) {
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
            for (var index = 0; index < threeInfoFn.markerDeverLayers.length; index++) {
                if (obj.data.DeviceID == threeInfoFn.markerDeverLayers[index].options.icon.options.DeviceID) {
                    threeInfoFn.DeverLayer.clearLayers()
                    threeInfoFn.markerDeverLayers.splice(index, 1); //原数组数据
                    threeInfoFn.DeverLayer = L.layerGroup(threeInfoFn.markerDeverLayers);
                    threeInfoFn.map.addLayer(threeInfoFn.DeverLayer);
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
        if (threeInfoFn.vameraArr.length == 0 && threeInfoFn.deverceaArr == 0) {
            layer.msg("请至少选择一个设备或摄像头", {
                time: 1500
            })
            return false;
        } else {
            var cameraMarkerArr = [];
            var deverceMarkerArr = [];
            $.each(threeInfoFn.vameraArr, function (index, item) {
                var cameraMarkerData = {
                    "CameraID": item.CameraID,
                    "LandID": threeInfoFn.landTwoid,
                    "Longitude": item.Longitude,
                    "Latitude": item.Latitude,
                };
                cameraMarkerArr.push(cameraMarkerData);
            })
            $.each(threeInfoFn.deverceaArr, function (index, item) {
                var deverceMarkerData = {
                    "DeviceID": item.DeviceID,
                    "LandID": threeInfoFn.landTwoid,
                    "Longitude": item.Longitude,
                    "Latitude": item.Latitude,
                };
                deverceMarkerArr.push(deverceMarkerData);
            })
            var entityJson = {
                "LandCameras": cameraMarkerArr,
                "LandDevices": deverceMarkerArr,
            }
            console.log(entityJson);
            var param = cloneObjectFn(paramList);
            param["entity"] = getUTF8(entityJson);
            param["id"] = threeInfoFn.landTwoid;
            var postdata = GetPostData(param, "land", "SetLandDeviceCamera");
            postFnajax(postdata).then(function (res) {
                console.log(res);
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
    // 设备摄像头下拉框数据
    devCam: function () {
        //设备
        var param = cloneObjectFn(paramList);
        param['status'] = 0;
        var postdata = GetPostData(param, "land", "getDeviceList");
        postFnajax(postdata).then(function (res) {
            // console.log(res);
            var deviceSelectData = JSON.parse(res);
            threeInfoFn.devSelectData = deviceSelectData;
            //摄像头
            param = cloneObjectFn(paramList);
            param['status'] = 0;
            var postdata = GetPostData(param, "land", "getCameraList"); //status 0
            postFnajax(postdata).then(function (res) {
                var cameraSelectData = JSON.parse(res);
                threeInfoFn.camSelectData = cameraSelectData;
                threeInfoFn.selectFunction(threeInfoFn.devSelectData, threeInfoFn.camSelectData)
            });
        });
    },

    //渲染设备和摄像头下拉列表
    selectFunction: function (deviceSelectData, cameraSelectData) {
        var deviceSelect = '<option value="">请选择设备</option>';
        var cameraSelect = '<option value="">请选择摄像头</option>';
        $.each(deviceSelectData.data, function (index, item) {
            deviceSelect = deviceSelect + '<option value=' + item.DeviceID + "," + item.DeviceName + '>' + item.DeviceName + '</option>';
        })
        $.each(cameraSelectData.data, function (index, item) {
            cameraSelect = cameraSelect + '<option value=' + item.CameraID + "," + item.CameraName + '>' + item.CameraName + '</option>';
        })
        $('#deviceSelect').html(deviceSelect);
        $('#cameraData').html(cameraSelect);
        form.render('select');
    },
}