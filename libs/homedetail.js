$(document).ready(function () {
    //监听四大类 marke显示
    getshowmode();
    /*各种设备tab点击切换列表*/
    $(".equip_tit li").on('click', function () {
        var index = $(this).index();
        var name = $(this).closest('li').attr("class");
        $(".equip_tit li").eq(index).addClass("on").siblings().removeClass("on");
        $(".equip_con").find("." + name + "_con").addClass("show").siblings("li").removeClass("show");
        //不是企业简介时 marker无选中初始化
        if ($(".canshuvideo .layui-input-block .layui-form-checkbox").eq(index).hasClass("layui-form-checked")) {
            //地图左侧 对应
            if (!$(".equipment .equip_con>li").eq(index).data("index")) {
                $(".equipment .equip_con>li").eq(index).data("index", 0);
                var n = 0;
            } else {
                var n = $(".equipment .equip_con>li").eq(index).data("index");
            }
            markershowfn($(this).attr("class").split(" ")[0], n);
        } else {
            markershowfn();
            //markericoninit(markerobj);
        }
    });
    // initRemotefn(remoteSensing);
    // zdyscroll($("#jianjie"));
})

/*---------------------------------------- 监听checkbox显示内容 start----------------------------------------*/
var newdtitle = ["camera", "sensor", "control", "combine"];
var newdata = [];
function getshowmode() {
    form.on('checkbox(equip_camera)', function (data) {
        toggledata("camera", data.elem.checked);
    });
    form.on('checkbox(equip_sensor)', function (data) {
        toggledata("sensor", data.elem.checked);
    });
    form.on('checkbox(equip_control)', function (data) {
        toggledata("control", data.elem.checked);
    });
    form.on('checkbox(equip_combine)', function (data) {
        toggledata("combine", data.elem.checked);
    });
    form.render();
}
//切换地图marker
function toggledata(name, add) {
    if (add) {
        newdtitle.push(name);
    } else {
        for (var i = 0; i < data.length; i++) {
            if (newdtitle[i] == name) {
                newdtitle.splice(i, 1);
            }
        }
    }
    refreshdata(newdtitle);
}
//勾选后checkbox 重新渲染
function refreshdata(arr) {
    togglemarkershow(arr);
}


/*传感模块初始化*/
function sensorinit(data) {
    // console.log("sensor>>>>>>>>>>>>>>>>>");
    // console.log(data.length);
    // console.log(data);
    var index = 0;
    $(".equipment .equip_con li.sensor_con  .changeTab .fl img:first").attr("src", "../images/governmenthomedeteal/rootvideo_bplus.png");
    $(".equipment .equip_con li.sensor_con .commonbox").html("");

    //
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
        $("#Sensor").next(".layui-form-checkbox").find("span").html("传感设备(" + data.length + "个)");
        $("#Sensor").html("传感设备(" + data.length + "个)");

        // $(".equipment .equip_con li.sensor_con .changeTab p").html(data[0].placeName);
    } else {
        $("#Sensor").next(".layui-form-checkbox").find("span").html("传感设备(" + 0 + "个)");
        $("#Sensor").html("传感设备(" + 0 + "个)");
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
    // console.log("Controller>>>>>>>>>>>>>>>>>");
    // console.log(data.length);
    // console.log(data);

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
        // $("#Controller").attr("title", "控制设备(" + index + "个)");
        $("#Controller").next(".layui-form-checkbox").find("span").html("控制设备(" + data.length + "个)");
        $("#Controller").html("控制设备(" + data.length + "个)");
        //$(".equipment .equip_con li.control_con .changeTab p").html(data[0].DeviceName);
    } else {
        $("#Controller").next(".layui-form-checkbox").find("span").html("控制设备(" + 0 + "个)");
        $("#Controller").html("控制设备(" + 0 + "个)");
        //暂无控制设备
        $(".equipment .equip_con li.control_con .commonbox").empty().append("<div class='nodata'><img src='../images/governmenthomedeteal/nocontrols.png' alt='暂无控制设备'><p>暂无控制设备</p></div>");
    }
    if (data.length > 1) {
        $(".equipment .equip_con li.control_con .changeTab .fr img:first").attr("src", "../images/governmenthomedeteal/rootvideo_a.png");
        zdyscroll($(".equipment .equip_con li.control_con .commonbox"));
    }
    else {
        $(".equipment .equip_con li.control_con .changeTab .fr img:first").attr("src", "../images/governmenthomedeteal/rootvideo_aplus.png");
    }
}

weather = [];

/*综合设备初始化*/
function combineinit(data) {
    $(".equipment .equip_con li.combine_con .weather").remove();

    if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {

            // II型气象站 1002
            if (data[i].DeviceTypeID == 1002) {
                weather.push(data[i]);

                if (data[i].IsOnline) {
                    // alert("111111")
                    $(".equipment .equip_con li.combine_con").append("<div class=\"weather\"><div class=\"clearfix\"><span class=\"fl\">气象站</span><span class='fr run'><img src='../images/governmenthomedeteal/run_point.png' alt=''>运行中</span></div><div class=\"view_detail\" onclick=\"viewWeather('" + data[i].DeviceID + "')\">查看详情</div></div>");
                } else {
                    $(".equipment .equip_con li.combine_con").append("<div class=\"weather\"><div class=\"clearfix\"><span class=\"fl\">气象站</span><span class='fr unrun'><img src='../images/governmenthomedeteal/unrun_point.png' alt=''>暂未运行</span></div><div class=\"view_detail\" onclick=\"viewWeather('" + data[i].DeviceID + "')\">查看详情</div></div>");
                }

                $("#za_weather").css("display", "block");
            }
            //console.log(weather);
        }

        $("#Integrated").next(".layui-form-checkbox").find("span").html("综合设备(" + data.length + "个)");
        $("#Integrated").html("综合设备(" + data.length + "个)");
    }
}

/*摄像头模块初始化*/
function videoinit(videodata) {
    // console.log("videodata>>>>>>>>>>>>>>>>>");
    // console.log(videodata);
    //videolist = videodata;
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
        $("#Camera").next(".layui-form-checkbox").find("span").html("摄像头(" + videodata.length + "个)");
        $("#Camera").html("摄像头(" + videodata.length + "个)");

    } else {
        $("#Camera").next(".layui-form-checkbox").find("span").html("摄像头(" + 0 + "个)");
        $("#Camera").html("摄像头(" + 0 + "个)");
        //暂无视频
        $(".equipment .equip_con li.camera_con .commonbox").empty().append("<div class='nodata'><img src='../images/governmenthomedeteal/nocarame.png' alt='暂无摄像头'><p>暂无摄像头</p></div>");
    }
    if (videodata.length > 1) {
        $(".equipment .equip_con li.camera_con .changeTab .fr img:first").attr("src", "../images/governmenthomedeteal/rootvideo_a.png");
        zdyscroll($(".equipment .equip_con li.camera_con .commonbox"));
    }
    else {
        $(".equipment .equip_con li.camera_con .changeTab .fr img:first").attr("src", "../images/governmenthomedeteal/rootvideo_aplus.png")
    }

}

/*---------------------------------------- 监听checkbox显示内容 end----------------------------------------*/

/*---------------------------------------- 摄像头 传感 控制 综合模块初始化 start----------------------------------------*/

function changeHref(url){
	var href='';
	if(url && (/rtmp:/).test(url) && (/open.ys7.com\/openlive/).test(url)){
       	var urlstr=url.split('open.ys7.com/openlive/')[1];
       	if((/\.hd/).test(url)){
       		urlstr=urlstr.split('.hd')[0];
       	}
       	var href='http://hls.open.ys7.com/openlive/'+urlstr+'.hd.m3u8';
    }
	return href;
}
//初始化视频
function initVideo(opt){
	if(!opt.idname || !opt.src || !opt.width || !opt.height){ return false; }
	var options={
	   "m3u8": opt.src,
	   "width" :  opt.width,
	    "height" : opt.height,
	    "autoplay" : true,
	    "coverpic" : {"style": "stretch", "src": opt.poster || ''},
	    "live":true,
	    "flash":false,
	    "preload":false,
	    "x5_player":true,
	    "x5_type":true,
	    "x5_fullscreen":true,
	    "listener":function(msg){
	    	if(!player){return false;}
	    	var loadingobj=msg.src.player.el.querySelector('.vcp-loading');
	    	//进行事件处理
	    	if(msg.type=='error'){
	    		if(player.options.src){
	    			loadingobj.setAttribute("style","display:none;");
	    			player.timer_errordoing=setTimeout(function(){
	    				if(player && !player.playing() && player.errorreload_i<3){	//是否已在播放
	    					console.log('重新loading');
	    					player.load(player.options.src);
	    					player.errorreload_i++;
	    					loadingobj.setAttribute("style","display:block;");
	    				}else{
	    					loadingobj.setAttribute("style","display:none;");
	    				}
	    				clearTimeout(player.timer_errordoing);
		    		},3000)
	    		}
	    	}else{
	    		if(player && player.playing()){	//是否已在播放
					clearTimeout(player.timer_errordoing);
					loadingobj.setAttribute("style","display:none;");
				}
	    	}
	    	if(!player.initreflashbtn){	//初始化
	    		player.initreflashbtn=true;
				var resflashobj=document.createElement('div');
		    	resflashobj.className='vcp-reflashbtn';
		    	resflashobj.addEventListener('click',function(){
		    		// console.log('手动重新loading');
		    		player && player.video && player.video.hls && player.video.hls.stopLoad();
		    		loadingobj.setAttribute("style","display:block;");
		    		clearTimeout(player.timer_errordoing);
					player.load(player.options.src);
		    	})
		    	setTimeout(function(){msg.src.player.el.querySelector('.vcp-controls-panel').appendChild(resflashobj);},600)
			}
	    }
	}
	if(opt.setoptionfn){options=opt.setoptionfn(options);}
	var player =  new TcPlayer(opt.idname,options);
	player.timer_errordoing=null;
	player.errorreload_i=0;
	player.initreflashbtn=false;
	player.stopload=function(){
		player && player.video && player.video.hls && player.video.hls.stopLoad();
		player=null;
	}
	return player;
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
/*---------------------------------------- 摄像头 传感 控制 综合模块初始化 end----------------------------------------*/
//视频播放控制 一次仅播放一个
function playindex(k) {
	window.livevideo && window.livevideo.stopload();
	$("#myPlayer"+k).empty();
	window.livevideo = initVideo({
		"idname":"myPlayer"+k,
		"src":changeHref(videolist[k].videoSrc),
		"width":"320",
		"height":"180",
		"poster":"../images/poster.jpg"
	})
}
/*-------------------------------------------------谷歌地图模块  start-------------------------------------------------*/
var map;
var markers = [];
var markeractive = -1;
var markerclickobj = [];
var allFlightPath = [];
//初始化谷歌地图
function initialize(idname, mapobj, reload) {
    var goodsmappath = farmobj.goodsmappath;
    if (farmobj && farmobj.farmpath.farmcenter[0] != 0) {
        var centerlanlng = new google.maps.LatLng(arrayReverse(farmobj.farmpath.farmcenter)[0], arrayReverse(farmobj.farmpath.farmcenter)[1]);
        var farmzoom = farmobj.zoom;
    } else {
        var centerlanlng = new google.maps.LatLng(35.245619, 107.578125);
        var farmzoom = 4;
    }
    map = new google.maps.Map(document.getElementById(idname), {
        zoom: farmzoom,
        center: centerlanlng,
        mapTypeId: google.maps.MapTypeId.HYBRID
    });
    if (arguments.length == 2) {
        initMarker(data, true);
        markershowfn('camera', 0); //默认选中第一个
        //遍历农场多边形区域绘制
        for (var j = 0; j < goodsmappath.length; j++) {
            drawdbx(goodsmappath[j].polygonobj.pathimg);
        }
    }
}
//marker初始化
function initMarker(data, first) {
    //整理data原始数据
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].list.length; j++) {
            var markeroitem = {};
            if (data[i].type == 'camera') {
                markeroitem.markericon = "../images/governmenthomedeteal/camera_marker.png";
                markeroitem.markeractiveicon = "../images/governmenthomedeteal/camera_marker_on.png";
            } else if (data[i].type == 'sensor') {
                markeroitem.markericon = "../images/governmenthomedeteal/sersor_marker.png";
                markeroitem.markeractiveicon = "../images/governmenthomedeteal/sersor_marker_on.png";
            } else if (data[i].type == 'control') {
                markeroitem.markericon = "../images/governmenthomedeteal/control_marker.png";
                markeroitem.markeractiveicon = "../images/governmenthomedeteal/control_marker_on.png";
            } else if (data[i].type == 'combine') {
                markeroitem.markericon = "../images/governmenthomedeteal/combine_marker.png";
                markeroitem.markeractiveicon = "../images/governmenthomedeteal/combine_marker_on.png";
            }
            markeroitem.location = data[i].list[j].location;
            markeroitem.typeIndex = j;
            markeroitem.type = data[i].type;
            markerclickobj.push(markeroitem);
        }
    }
    //marker分类处理
    var markersarr = [];
    //遍历图标marker
    for (var i = 0; i < markerclickobj.length; i++) {
        if (i == markeractive) {
            var markeritem = { labeltext: '', labelClass: 'map_marks markeractive', type: markerclickobj[i].type, typeindex: i, iconobj: { icon: markerclickobj[i].markeractiveicon, icon: markerclickobj[i].markeractiveicon, iconClass: 'iconbtn', iconsrc: markerclickobj[i].markericon, iconactivesrc: markerclickobj[i].markeractiveicon } };
        } else {
            var markeritem = { labeltext: '', labelClass: 'map_marks', type: markerclickobj[i].type, typeindex: markerclickobj[i].typeIndex, iconobj: { icon: markerclickobj[i].markericon, iconClass: 'iconbtn', iconsrc: markerclickobj[i].markericon, iconactivesrc: markerclickobj[i].markeractiveicon } };
        }
        markeritem.lanlng = arrayReverse(markerclickobj[i].location);
        //new marker对象
        var marker = new ZaCgMarker(map, { latlng: new google.maps.LatLng(markeritem.lanlng[0], markeritem.lanlng[1]), type: markeritem.type, typeindex: markeritem.typeindex, iconsrc: markeritem.iconobj.iconsrc, iconactivesrc: markeritem.iconobj.iconactivesrc, index: i, labelText: markeritem.labeltext, labelClass: markeritem.labelClass, icon: markeritem.iconobj.icon, iconClass: markeritem.iconobj.iconClass });
        markers.push(marker);
    }
    setTimeout(function () { $(".map_marks").css("display", "inline-block"); }, 500);
}
//初始化 多边形绘制农场区域
function drawdbx(obj) {
    var dataarr = obj.path;
    var myTrip = [];
    for (var i in dataarr) {
        var item = new google.maps.LatLng(arrayReverse(dataarr[i])[0], arrayReverse(dataarr[i])[1]);
        myTrip.push(item);
    }
    var flightPath = new google.maps.Polygon({
        path: myTrip,
        strokeColor: obj.strokeColor,
        strokeOpacity: obj.strokeOpacity,
        strokeWeight: obj.strokeWeight,
        fillColor: obj.fillColor,
        fillOpacity: obj.fillOpacity
    });
    flightPath.setMap(map);
    allFlightPath.push(flightPath);
}
//清空多边形
function clearPolygon() {
    for (var i in allFlightPath) {
        allFlightPath[i].setMap(null);
    }
    allFlightPath.length = 0;
}
//marker 修改
function markershowfn(type, active) {
    if (arguments.length == 2) {
        for (var i = 0; i < $("#mapcontain .map_marks").length; i++) {
            var item = $("#mapcontain .map_marks").eq(i);
            if (item.attr("type") == type && item.attr("typeindex") == active) {
                var ii = item.attr("index");
            }
        }
    } else if (arguments.length == 1) {
        var ii = type;
    } else {
        var ii = -1;
    }
    for (var i = 0; i < $("#mapcontain .map_marks").length; i++) {
        if (i == ii && $("#mapcontain .map_marks").eq(i).hasClass("markeractive")) {
            return false;
        } else if (i == ii && !$("#mapcontain .map_marks").eq(i).hasClass("markeractive")) {
            activeredit($("#mapcontain .map_marks").eq(i), true, i);
        } else {
            if ($("#mapcontain .map_marks").eq(i).hasClass("markeractive")) {
                activeredit($("#mapcontain .map_marks").eq(i), false, i);
            }
        }
    }
    function activeredit(obj, add, index) {
        if (add) {
            obj.addClass("markeractive").css("z-index", "103").find("span.iconbtn img").attr("src", obj.attr("iconactivesrc"));
            //obj.find(".map_mark_inner .map_mark_price span.b").html("");
        } else {
            obj.removeClass("markeractive").css("z-index", "102").find("span.iconbtn img").attr("src", obj.attr("iconsrc"));
            //obj.find(".map_mark_inner .map_mark_price span.b").html("");
        }
        if (markers[index]) { markers[index].draw(true); };
    }
}
//marker 更新显示
function togglemarkershow(showarr) {
    for (var i = 0; i < $("#mapcontain .map_marks").length; i++) {
        if (hasClass(showarr, $("#mapcontain .map_marks").eq(i).attr("type"))) {
            $("#mapcontain .map_marks").eq(i).css("display", "block");
        } else {
            $("#mapcontain .map_marks").eq(i).css("display", "none");
        }
    }
    //showarr[i]
    function hasClass(textarr, name) {
        for (var j = 0; j < textarr.length; j++) {
            if (textarr[j] == name) {
                return true;
            }
        }
        return false;
    }
}
//经纬度前后对调
function arrayReverse(arr) {
    if (parseInt(arr[0]) > parseInt(arr[1])) {
        return arr.reverse();
    } else {
        return arr;
    }
}
/************自定义marker  START***********/
function ZaCgMarker(map, options) {
    this.latlng = options.latlng; //设置图标的位置  
    //this.image_ = options.image;  //设置图标的图片  
    this.labelText = options.labelText || '';
    this.labelClass = options.labelClass || 'map_marks';	//设置文字的样式 
    this.type = options.type || '';
    this.typeindex = options.typeindex || 0;
    this.iconsrc = options.iconsrc || '';
    this.iconactivesrc = options.iconactivesrc || '';
    this.icon = options.icon || '';	//marker图标
    this.iconClass = options.iconClass || '';
    this.clickFun = options.clickFun;//注册点击事件  
    this.index = options.index;
    this.map_ = map;
    this.div_ = null;
    google.maps.event.addListener(this, 'dragend', function (event) {    //监听点击事件  
        document.getElementById('j').innerHTML = event.latLng;
    });
    this.setMap(map);
}
//绘制图标，主要用于控制图标的位置  
ZaCgMarker.prototype.draw = function (time) {
    var overlayProjection = this.getProjection();
    var position = overlayProjection.fromLatLngToDivPixel(this.latlng);   //将地理坐标转换成屏幕坐标  
    var div = this.div_;
    if (time) {
        div.style.left = position.x - 20 / 2 + 'px';
        div.style.top = position.y - 24 + 'px';
    } else {
        div.style.left = position.x - 20 / 2 + 'px';
        div.style.top = position.y - 24 + 'px';
    }
}
/************自定义叠加层  START***********/
// con
/*-------------------------------------------------谷歌地图模块  end-------------------------------------------------*/
//左右切换	
function togglebtnfn(ev) {
    if ($(ev).closest("li").data("index")) {
        var index = $(ev).closest("li").data("index");
    } else {
        var index = 0;
        $(ev).closest("li").data("index", 0);
    }
    var thisli = $(ev).closest('li');
    if ($(ev).hasClass("fl")) {
        //左按钮
        if (index >= 1) {
            index--;
            contentashow(thisli, index);
        }
    } else {
        //右按钮
        if (index < thisli.find('.common').length - 1) {
            index++;
            contentashow(thisli, index);
        }
    }
    //地图左侧 对应
    markershowfn($(ev).closest("li").attr("class").split('_')[0], index);
}
//animate切换显示 按钮的显示
function contentashow(obj, i) {
    obj.data("index", i);
    if (!obj.hasClass("camera_con")) {
        if (i <= 0) {
            obj.find('.changeTab .fl img').attr("src", "../images/governmenthomedeteal/rootvideo_bplus.png");
            obj.find('.changeTab .fr img').attr("src", "../images/governmenthomedeteal/rootvideo_a.png");
        } else if (i >= obj.find('.common').length - 1) {
            obj.find('.changeTab .fl img').attr("src", "../images/governmenthomedeteal/rootvideo_b.png");
            obj.find('.changeTab .fr img').attr("src", "../images/governmenthomedeteal/rootvideo_aplus.png");
        } else {
            obj.find('.changeTab .fl img').attr("src", "../images/governmenthomedeteal/rootvideo_b.png");
            obj.find('.changeTab .fr img').attr("src", "../images/governmenthomedeteal/rootvideo_a.png");
        }
        if (obj.hasClass("sensor_con") || obj.hasClass("control_con")) {
            setTimeout(function () {
                var objheight = obj.find(".commonbox .commoncon .common").eq(i).height();
                var firsttop = obj.find(".commonbox .commoncon .common").eq(0).offset().top;
                var activetop = obj.find(".commonbox .commoncon .common").eq(i).offset().top;
                var scrolltop = activetop - firsttop;
                if (objheight < 275) {
                    scrolltop = scrolltop - (275 - objheight) * 0.5;
                }
                obj.find(".commonbox .commoncon .common").eq(i).addClass("commonactive").siblings("ul.common").removeClass("commonactive");
                obj.find(".commonbox .commoncon").slimScroll({ scrollTo: scrolltop });
            }, 100)
        } else {
            obj.find(".commonbox .commoncon").animate({ "left": i * -320 + "px" }, 300);
            obj.find('p.contitle').text(obj.find(".commonbox .commoncon .common").eq(i).attr("titlename"));
        }
    } else {
        if (i <= 0) {
            obj.find('.changeTab .fl img').attr("src", "../images/governmenthomedeteal/rootvideo_bplus.png");
            obj.find('.changeTab .fr img').attr("src", "../images/governmenthomedeteal/rootvideo_a.png");
        } else if (i >= obj.find('.common').length - 1) {
            obj.find('.changeTab .fl img').attr("src", "../images/governmenthomedeteal/rootvideo_b.png");
            obj.find('.changeTab .fr img').attr("src", "../images/governmenthomedeteal/rootvideo_aplus.png");
        } else {
            obj.find('.changeTab .fl img').attr("src", "../images/governmenthomedeteal/rootvideo_b.png");
            obj.find('.changeTab .fr img').attr("src", "../images/governmenthomedeteal/rootvideo_a.png");
        }
        obj.find(".videocontent .videocon").animate({ "left": i * -320 + "px" }, 300);
        obj.find('p.contitle').text(obj.find(".videocontent .common").eq(i).attr("videotitle"));
        $("li.camera_con .videojk .videoitem p.video_title").text("视频监控 (" + (i + 1) + "/" + $(".videocontent .videocon .common").length + ")");
        playindex(i);
    }
}
/*查看气象站*/
function viewWeather(id) {
    // console.log("查看气象站>>>>>>>>>>>>");
    // alert("11111");
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

//新增自定义图层
function addoverlay(paths, srcImage) {
    var boundarr = getCenterfn(paths);
    var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(boundarr[0][0], boundarr[0][1]), new google.maps.LatLng(boundarr[1][0], boundarr[1][1]));
    var overlay = new USGSOverlay(bounds, srcImage, map);
    allOverlay.push(overlay);
}
//清空所有自定义图层
function clearAllOverlay() {
    for (var i in allOverlay) {
        allOverlay[i].onRemove();
    }
    allOverlay.length = 0;
}
var PI = 3.1415926535897932384626;
var gcjwgs_a = 6378245.0;
var gcjwgs_ee = 0.00669342162296594323;
function gcj02towgs84(lng, lat) {
    if (out_of_china(lng, lat)) {
        return [lng, lat]
    }
    else {
        var dlat = transformlat(lng - 105.0, lat - 35.0);
        var dlng = transformlng(lng - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - gcjwgs_ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((gcjwgs_a * (1 - gcjwgs_ee)) / (magic * sqrtmagic) * PI);
        dlng = (dlng * 180.0) / (gcjwgs_a / sqrtmagic * Math.cos(radlat) * PI);
        mglat = lat + dlat;
        mglng = lng + dlng;
        return [lng * 2 - mglng, lat * 2 - mglat]
    }
}
function transformlng(lng, lat) {
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
    return ret
}
function transformlat(lng, lat) {
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
    return ret
}
function out_of_china(lng, lat) {
    return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
}
//获取最小矩形
function getCenterfn(patharr) {
    var patharrx = [];
    var patharry = [];
    for (var i in patharr) {
        patharrx.push(patharr[i][0]);
        patharry.push(patharr[i][1]);
    }
    var minx = Math.min.apply(null, patharrx);
    var miny = Math.min.apply(null, patharry);
    var maxx = Math.max.apply(null, patharrx);
    var maxy = Math.max.apply(null, patharry);
    return [
        [minx, miny],
        [maxx, maxy]
    ];
}
//获取 n位小数
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

