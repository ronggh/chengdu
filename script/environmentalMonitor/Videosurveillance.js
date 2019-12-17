var landData;
var DeviceSerial = "";
var ChannelNo = "";
$(function () {
    GetUserAreaList(); //获取地块
    $(".livecontrol .livecontrol_arrow .livevideoitem").click(function () {
        $(this).addClass("videoactive").siblings("div").removeClass("videoactive");
        //控制方向
        var fx = $(this).index();
        if (fx == 0) {
            StartCameraPtz(0);
        } else if (fx == 1) {
            StartCameraPtz(3);
        } else if (fx == 2) {
            StartCameraPtz(2);
        } else if (fx == 3) {
            StartCameraPtz(1);
        } else {
            $(this).siblings("div").removeClass("videoactive");
            StartCameraPtz(-100);
        }
    });
    $(".Refresh").click(function () {
        $(this).find("img").addClass("refresh");
        var obj = this;
        setTimeout(function () {
            $(obj).find("img").removeClass("refresh");
            GetArea($("#area").val())
        }, 500);
    });
    //摄像头 焦距调节
    $(".livecontrol .livecontrol_size .livevideo_small").bind('click',
        function () {
            StartCameraPtz(9);
        });
    $(".livecontrol .livecontrol_size .livevideo_big").bind('click',
        function () {
            StartCameraPtz(8);
        });
    $("#farmlivevideo p span").on('click mouseover', function () {
        $("#farmlivevideo p span").addClass("rotateimg");
        $("#farmlivevideo .popboxselect").fadeIn();
    });
    var timerpopselectplus = null;

    function fadeOutpopboxselectplus() {
        timerpopselectplus = setTimeout(function () {
            $("#farmlivevideo p span").removeClass("rotateimg");
            $("#farmlivevideo .popboxselect").fadeOut();
        }, 500);
    }
    $("#farmlivevideo p span,#farmlivevideo .popboxselect").hover(function () {
        clearTimeout(timerpopselectplus);
    }, function () {
        fadeOutpopboxselectplus();
    });
    $("#farmlivevideo .popboxselect li").bind('click', function () {
        fadeOutpopboxselectplus();
    });
})

function GetUserAreaList() {
    var param = cloneObjectFn(paramList);
    var postdata = GetPostData(param, "iot", "getIotOverView");
    postFnajax(postdata).then(function (res) {
        var landSelect = "";
        landData = JSON.parse(res);
        $.each(landData.data, function (index, item) {
            landSelect = landSelect + '<option value="' + item.LandID + '">' + item.LandName + '</option>'
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
    $("#farmlivevideo").hide();
    $("#Cameras").html("");
    $.each(landData.data, function (index, item) {
        if (item.LandID == landId) {
            $.each(item.Cameras, function (index2, camera) {
                $("#farmlivevideo").show();
                if (index2 == 0) {
                    SetPlayer(camera.LiveUrl, camera.CameraName, camera.DeviceSerial, camera.ChannelNo);
                }
                $("#Cameras").append("<li><a href=\"javascript:SetPlayer('" + camera.LiveUrl + "','" + camera.CameraName + "','" + camera.DeviceSerial + "','" + camera.ChannelNo + "')\">" + camera.CameraName + "</a></li>");
            });
        }

    });
}

function SetPlayer(url, name, deviceSerial, channelNo) {
    DeviceSerial = deviceSerial;
    ChannelNo = channelNo;
    StartCameraPtz(-100);
    $("#Camera").text(name);

    $("#playercontainer").empty();
    if (url && (/rtmp:/).test(url) && (/open.ys7.com\/openlive/).test(url)) {
        var urlstr = url.split('open.ys7.com/openlive/')[1];
        if ((/\.hd/).test(url)) {
            urlstr = urlstr.split('.hd')[0];
        }
        var href = 'http://hls.open.ys7.com/openlive/' + urlstr + '.hd.m3u8';
    }
    waittimer = setInterval(function () {
        if (window.TcPlayer) {
            clearInterval(waittimer);
            //初始化
            window.winvideos = initVideo({
                "idname": "playercontainer",
                "src": href,
                "width": "550",
                "height": "366",
                "poster": "../../images/poster.jpg"
            });
        }
    }, 300);
}

function StartCameraPtz(direction) {
    var param = cloneObjectFn(paramList);
    param["speed"] = 1;
    param["deviceSerial"] = DeviceSerial;
    param["channelNo"] = ChannelNo;
    param["direction"] = direction;
    if (direction == -100) {
        var postdata = GetPostData(param, "iot", "stopCameraControl");
        postFnajax(postdata).then(function (res) {

        });
    } else {
        var postdata = GetPostData(param, "iot", "startCameraControl");
        postFnajax(postdata).then(function (res) {

        });
    }

}

function initVideo(opt) {
    window.winvideos && window.winvideos.stopload();
    if (!opt.idname || !opt.src || !opt.width || !opt.height) {
        return false;
    }
    var options = {
        "m3u8": opt.src,
        "width": opt.width,
        "height": opt.height,
        "autoplay": true,
        "coverpic": {
            "style": "stretch",
            "src": opt.poster || ''
        },
        "live": true,
        "flash": false,
        "x5_player": true,
        "x5_type": true,
        "x5_fullscreen": true,
        "listener": function (msg) {
            if (!player) {
                return false;
            }
            var loadingobj = msg.src.player.el.querySelector('.vcp-loading');
            //进行事件处理
            if (msg.type == 'error') {
                if (player.options.src) {
                    loadingobj.setAttribute("style", "display:none;");
                    player.timer_errordoing = setTimeout(function () {
                        if (player && !player.playing() && player.errorreload_i < 3) { //是否已在播放
                            // console.log('重新loading');
                            player.load(player.options.src);
                            player.errorreload_i++;
                            loadingobj.setAttribute("style", "display:block;");
                        } else {
                            loadingobj.setAttribute("style", "display:none;");
                        }
                        clearTimeout(player.timer_errordoing);
                    }, 3000)
                }
            } else {
                if (player && player.playing()) { //是否已在播放
                    clearTimeout(player.timer_errordoing);
                    loadingobj.setAttribute("style", "display:none;");
                }
            }
            if (!player.initreflashbtn) { //初始化
                player.initreflashbtn = true;
                var resflashobj = document.createElement('div');
                resflashobj.className = 'vcp-reflashbtn';
                resflashobj.addEventListener('click', function () {
                    // console.log('手动重新loading');
                    player && player.video && player.video.hls && player.video.hls.stopLoad();
                    loadingobj.setAttribute("style", "display:block;");
                    clearTimeout(player.timer_errordoing);
                    player.load(player.options.src);
                })
                setTimeout(function () {
                    msg.src.player.el.querySelector('.vcp-controls-panel').appendChild(resflashobj);
                }, 600)
            }
        }
    }
    if (opt.setoptionfn) {
        options = opt.setoptionfn(options);
    }
    var player = new TcPlayer(opt.idname, options);
    player.timer_errordoing = null;
    player.errorreload_i = 0;
    player.initreflashbtn = false;
    player.stopload = function () {
        player && player.video && player.video.hls && player.video.hls.stopLoad();
        player = null;
    }
    return player;
}