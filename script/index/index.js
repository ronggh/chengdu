$(function () {
    initLayuifn(['element', 'form', 'table', 'layer', 'laytpl', 'laypage', 'laydate', 'upload', 'tree', 'util', 'transfer'], function () {
        form.render();
        //获取用户信息
        getUserInfoAll();
        // 设定左侧边栏高度
        $("#za_slide").css({
            height: $("body").height() - 64 + "px"
        })
        $("#za_content_cont").css({
            height: $("body").height() - 64 + "px"
        })
        $("#za_content").css({
            height: $("body").height() - 200 + "px"
        })
        $(document).on('click', '.nLi .sub li', function () {
            $(".nLi .sub li").removeClass("active");
            $(this).addClass("active");
            LoadAction($(this).attr("pagename"), 0);
        })

        getMassageIsread() //获取消息提醒
        setInterval(function () {
            getMassageIsread();
            alermInfo();
        }, 20000);
        //  获取用户左侧可用菜单栏
        var param = cloneObjectFn(paramList);
        AjaxRequest(param, "function", "getList").then(function (res) {
            // console.log(res)
            levelsobj = [];
            $("#za_slide ul").html();
            var menuRes = JSON.parse(res);
            if (menuRes.result.code == 200) {
                menuobj = menuRes.data;
                menuobj.forEach(function (item, index) {
                    item.pagename = item.FuncUrl;
                })
                //扁平机构变树形结构
                function toTree(data) {
                    var obj = {};
                    data.map(function (item) {
                        obj[item.FuncID] = item;
                    });
                    var val = [];
                    data.map(function (item) {
                        var parent = obj[item.FID];
                        if (parent) {
                            (parent.children || (parent.children = [])).push(item);
                        } else {
                            val.push(item);
                        }
                    });
                    return val;
                }
                // levelsobj改造好后的菜单栏包含一级二级
                levelsobj = toTree(menuobj);
                //拼接左侧菜单栏
                var menuStr = "";
                for (var i = 0; i < levelsobj.length; i++) {
                    var oneMenuStr = "";
                    var twoMenuStr = "";
                    var multistage = "";
                    var Single = "";
                    if (levelsobj[i].children) {
                        oneMenuStr = oneMenuStr + '<li class="nLi">' + '<i class="iconfont' + ' ' + levelsobj[i]['FuncIcon'] + '" pid="' + levelsobj[i]['FuncID'] + '"pagename="' + levelsobj[i]['FuncUrl'] + '">' + levelsobj[i]['FuncName'] + '<span class="iconfont icon-xiala1">' + '</span>' + '</i>' + '<ul class="sub">';
                        for (var j = 0; j < levelsobj[i].children.length; j++) {
                            twoMenuStr = twoMenuStr + '<li pagename="' + levelsobj[i].children[j]['FuncUrl'] + '"><a href="javascript:void(0)">' + levelsobj[i].children[j]['FuncName'] + '</a> </li>';
                        }
                        multistage = multistage + oneMenuStr + twoMenuStr + '</ul> </li>'
                    } else {
                        Single = Single + '<li class="nLi">' + '<i class="iconfont' + ' ' + levelsobj[i]['FuncIcon'] + '" pid="' + levelsobj[i]['FuncID'] + '"pagename="' + levelsobj[i]['FuncUrl'] + '">' + levelsobj[i]['FuncName'] + '</i>' + '</li>';
                    }
                    menuStr = menuStr + Single + multistage;
                }
                $("#za_slide ul").append(menuStr);
                subSomething();
            }
        });
        setTimeout(function () {
            $(".sideMenu .nLi i").click(function () {
                if ($(this).parent(".nLi").hasClass("on")) {
                    $(this).next(".sub").slideUp(300, function () {
                        $(this).parent(".nLi").removeClass("on");
                    });
                    $(this).find("span").removeClass("icon-xiala");
                    $(this).find("span").addClass("icon-xiala1");
                } else {
                    $(this).parent(".nLi").siblings().find(".sub").slideUp(300, function () {
                        $(this).parent(".nLi").siblings().removeClass("on");
                    });
                    $(this).find("span").removeClass("icon-xiala1");
                    $(this).find("span").addClass("icon-xiala");
                    $(this).next(".sub").slideDown(300, function () {
                        $(this).parent(".nLi").addClass("on");
                    });
                    if ($(this).next(".sub").length == 0) {
                        LoadAction('automaticMonitor', 0);
                    }
                }
            })
        }, 500)
        alermInfo();
    });
})

//  鼠标经过头像的一系列事件
$(".za_tc_menu").mouseover(function (eve) {
    $(".user_avatarList").css("display", "block");
});
$(".za_tc_menu").mouseleave(function () {
    $(".user_avatarList").css("display", "none");
});
$(".za_tc_menu .user_avatarList ul li").mouseover(function () {
    $(this).addClass("headerRight");
    $(this).siblings().removeClass("headerRight");
})
$(".user_avatar").hover(function () {
    $("#tip").html($(this).find('span').html());
    $("#tip").css("display", "block");
})
$(".user_avatar").mouseleave(function () {
    $("#tip").css("display", "none");
});
$(".orgName").hover(function () {
    $("#tip").html($(this).text());
    $("#tip").css("display", "block");
})
$(".orgName").mouseleave(function () {
    $("#tip").css("display", "none");
});

// 修改头像
$('.editAvatar').click(function () {
    var upAvatar_Tpl = document.getElementById('uploadAvatar').innerHTML;
    laytpl(upAvatar_Tpl).render({}, function (html) {
        layer.open({
            id: 'upAvatar_pop',
            type: 1,
            content: html,
            title: ['修改头像', 'font-size:16px;height:46px;line-height:46px;'],
            area: ['520px', '400px'],
            success: function () {
                // 回显头像
                var originImg = '<div class=" attachment_item">' +
                    '<img class="small_img" src="' + avatar + '">' +
                    '</div>';
                $(".checkAvatar").append(originImg);
                var uploadInst = upload.render({
                    elem: '#uploadAva',
                    // url: 'http://open.chengdu.nyypt.cn/v1/user/resetImg',
                    url: baseUrl+'/v1/iot/Method',
                    auto: false, //选择文件后不自动上传
                    size: 50,
                    acceptMime: 'image/png,image/jpg,image/jpeg',
                    bindAction: '#testListAction', //指向一个按钮触发上传
                    choose: function (obj) {
                        //预读本地文件，如果是多文件，则会遍历。(不支持ie8/9)
                        obj.preview(function (index, file, result) {
                            $(".attachment_item").remove();
                            var originImg = '<div class=" attachment_item">' +
                                '<img class="small_img" src="' + result + '">' +
                                '</div>';
                            $(".checkAvatar").append(originImg);
                            $('#uploadSureBtn').click(function () {
                                var param = cloneObjectFn(paramList);
                                param["img"] = result;
                                var postdata = GetPostData(param, "user", "resetImg");
                                postFnajax(postdata).then(function (res) {
                                    var resUpdata = JSON.parse(res);
                                    if (resUpdata) {
                                        if (resUpdata.result.code == 200) {
                                            avatar = postdata.params.img;
                                            layer.closeAll();
                                            layer.msg('修改成功');
                                            getUserInfoAll()
                                        } else {
                                            layer.msg('修改失败');
                                        }
                                    }
                                });
                            })
                        });
                    }
                });
            }
        })
    })
})

// 修改密码
$('.editPassword').click(function () {
    var edit_pass_Tpl = document.getElementById('editUserPass').innerHTML;
    laytpl(edit_pass_Tpl).render({}, function (html) {
        layer.open({
            id: 'edit_pass_pop',
            type: 1,
            content: html,
            title: ['修改密码', 'font-size:16px;height:46px;line-height:46px;'],
            area: ['500px', 'auto'],
            success: function (index, layero) {
                form.on('submit(submitEditPass)', function (data) {
                    if (!myRegcode.test($('input[name="after"]').val())) {
                        layer.msg('请输入6-12位字母或数字', {
                            time: 2000
                        });
                        return false;
                    }
                    if ($('input[name="after"]').val() != $('input[name="afterAgain"]').val()) {
                        layer.msg('两次密码不一致', {
                            time: 2000
                        })
                        return false;
                    } else {
                        var param = cloneObjectFn(paramList);
                        param["userID"] = localStorage.getItem('USER_ID');
                        param["before"] = $.md5($.md5($.md5($('input[name="before"]').val())));
                        param["after"] = $.md5($.md5($.md5($('input[name="after"]').val())));
                        AjaxRequest(param, "user", "updatePassword").then(function (res) {
                            var passRes = JSON.parse(res);
                            if (passRes.result.code == 200) {
                                layer.closeAll();
                                layer.msg('修改密码成功', {
                                    time: 1500
                                }, function () {
                                    location.replace('/login.html');
                                    localStorage.removeItem('ACCESS_TOKEN');
                                    localStorage.removeItem('USER_ID');
                                })
                            } else {
                                layer.msg(passRes.result.msg, {
                                    time: 2000
                                });
                            }
                        });
                    }
                })
            }
        })
    })
});

//  退出登录
$('.exitLogin').click(function () {
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('USER_ID');
    location.replace('/login.html');
});

//  消息提醒
function getMassageIsread() {
    var param = cloneObjectFn(paramList);
    param["pageSize"] = 1000;
    param["pageIndex"] = 1;
    param["msgType"] = 1;
    AjaxRequest(param, "message", "getMsgListPage").then(function (res) {
        var massageNum = JSON.parse(res);
        var numberMsg = 0;
        $.each(massageNum.data, function (index, item) {
            if (item.IsRead == 0) {
                numberMsg = numberMsg + 1;
            }
        })
        if (numberMsg > 0) {
            $(".massageAleam i").addClass('bag');
        } else {
            $(".massageAleam i").removeClass('bag');
        }
    })
}
// 用户详细信息
function getUserInfoAll() {
    var param = cloneObjectFn(paramList);
    param["userID"] = localStorage.getItem('USER_ID');
    AjaxRequest(param, "user", "getUserInfo").then(function (res) {
        // console.log(res);
        var userLogin = JSON.parse(res);
        $("input[name = orgid]").val(userLogin.data.OrgID);
        $("input[name = orgNameone]").val(userLogin.data.OrgName);
        avatar = userLogin.data.Img == null ? "./images/za_user_a.png" : userLogin.data.Img
        $(".user_avatar span").html(userLogin.data.UserName);
        $(".orgName a").html("所属机构：" + userLogin.data.OrgName);
        //头像显示
        $(".user_avatar img").attr({
            src: userLogin.data.Img == null ? "./images/za_user_a.png" : userLogin.data.Img
        });
    });
}
// 报警提醒
function alermInfo(){
    var param = cloneObjectFn(paramList);
    var postdata = GetPostData(param, "iot", "getIotOverView");
    postFnajax(postdata).then(function (res) {
        var alermCount = "";
        var alermData = JSON.parse(res);
        $.each(alermData.data,function(i,it){
            $.each(alermData.data[i].Devices,function(i,item){
                if (item.DeviceCategory == "SENSOR") {
                    $.each(item.Slots,function(index1,item1){
                        if (item1.Alarm != null) {
                            var EnableHigh = item1.Alarm.EnableHigh;
                            var HighValue = item1.Alarm.HighValue;
                            var EnableLow = item1.Alarm.EnableLow;
                            var LowValue = item1.Alarm.LowValue;
                            if (EnableHigh == true && HighValue != null && EnableLow == false && LowValue ==null) {
                                (item1.Data > HighValue) == true ? alermCount += it.LandName + ":" + item.DeviceName + "报警;" : "";
                            } else if (EnableHigh == false && HighValue == null && EnableLow == true && LowValue != null) {
                                (item1.Data < LowValue) == true ? alermCount += it.LandName + ":" + item.DeviceName + "报警;" : "";
                            } else if (EnableHigh == true && HighValue != null && EnableLow == true && LowValue != null) {
                                if (HighValue < LowValue) {
                                    (HighValue < item1.Data && item1.Data < LowValue) == true ? alermCount += it.LandName + ":" + item.DeviceName + "报警;" : "";
                                }
                                if (HighValue == LowValue) {
                                    (HighValue == item1.Data) == true ? alermCount += it.LandName + ":" + item.DeviceName + "报警;" : "";
                                }
                                if (HighValue > LowValue) {
                                    (HighValue < item1.Data || item1.Data < LowValue) == true ? alermCount += it.LandName + ":" + item.DeviceName + "报警;" : "";
                                }
                            }
                        }
                    })
                }
            })   
        })
        $(".moveAlarem").html(alermCount);
    })
}

