/*---------------------------------------- 成都项目 全局变量 start ---------------------------------------- */
var rowCount = 6; //每页表格的条数
var listCount = 100; // 硬编码，获取部分列表的条数 

var urlaction = "/index.html";
var stateObject = {};
var menu = GetQueryString("menu");
var oneMenu = ['systemManage', 'farmManage', 'environmentalMonitor', "automaticMonitor", "messageManage", "plantingManage", "croppingModel", "taskManage"] //一级菜单集合；
var twoMenu = ["userManage", "funregister", "organManage", "roleManage", "modelExperiment","RecommendMoxing", "modelEvaluation", "standProduction", "Inbox", "Outbox", "Mapoverview", "Videosurveillance", "SensorEquipment", "controlEquipment", "weatherStation", "WaterFertilizer", "olddatamode", "categoryManage", "deviceManage", "cameraManage", "landManage", "varieties"]; //二级菜单集合
var menuArray = [{
    "id": "systemManage",
    "name": "系统管理",
    "fid": "",
    "remark": "系统管理",
}, {
    "id": "userManage",
    "name": "用户管理",
    "fid": "systemManage",
    "remark": "用户管理",
}, {
    "id": "funregister",
    "name": "功能管理",
    "fid": "systemManage",
    "remark": "功能管理",
}, {
    "id": "organManage",
    "name": "机构管理",
    "fid": "systemManage",
    "remark": "机构管理",
}, {
    "id": "roleManage",
    "name": "角色管理",
    "fid": "systemManage",
    "remark": "角色管理",
}, {
    "id": "farmManage",
    "name": "农场管理",
    "fid": "",
    "remark": "农场管理",
}, {
    "id": "cameraManage",
    "name": "摄像头管理",
    "fid": "farmManage",
    "remark": "摄像头管理",
}, {
    "id": "deviceManage",
    "name": "设备管理",
    "fid": "farmManage",
    "remark": "设备管理",
}, {
    "id": "landManage",
    "name": "地块管理",
    "fid": "farmManage",
    "remark": "地块管理",
}, {
    "id": "categoryManage",
    "name": "品类管理",
    "fid": "farmManage",
    "remark": "品类管理",
}, {
    "id": "equipmentManage",
    "name": "设备",
    "fid": "deviceManage",
    "remark": "设备",
}, {
    "id": "111",
    "name": "新增设备",
    "fid": "equipmentManage",
    "remark": "新增设备",
}, {
    "id": "automaticMonitor",
    "name": "自动化控制",
    "fid": "",
    "remark": "自动化控制",
}, {
    "id": "messageManage",
    "name": "消息管理",
    "fid": "",
    "remark": "消息管理",
}, {
    "id": "Inbox",
    "name": "收件箱",
    "fid": "messageManage",
    "remark": "收件箱",
}, {
    "id": "Outbox",
    "name": "发件箱",
    "fid": "messageManage",
    "remark": "发件箱",
}, {
    "id": "environmentalMonitor",
    "name": "环境监控",
    "fid": "",
    "remark": "环境监控",
}, {
    "id": "Mapoverview",
    "name": "地图概览",
    "fid": "environmentalMonitor",
    "remark": "地图概览",
}, {
    "id": "Videosurveillance",
    "name": "视频监控",
    "fid": "environmentalMonitor",
    "remark": "视频监控",
}, {
    "id": "SensorEquipment",
    "name": "传感设备",
    "fid": "environmentalMonitor",
    "remark": "传感设备",
}, {
    "id": "controlEquipment",
    "name": "控制设备",
    "fid": "environmentalMonitor",
    "remark": "控制设备",
}, {
    "id": "weatherStation",
    "name": "综合气象站",
    "fid": "environmentalMonitor",
    "remark": "综合气象站",
}, {
    "id": "WaterFertilizer",
    "name": "水肥一体机",
    "fid": "environmentalMonitor",
    "remark": "水肥一体机",
}, {
    "id": "croppingModel",
    "name": "种植模型",
    "fid": "",
    "remark": "种植模型",
}, {
    "id": "modelExperiment",
    "name": "模型试验",
    "fid": "croppingModel",
    "remark": "模型试验",
},{
    "id": "RecommendMoxing",
    "name": "推荐模型",
    "fid": "croppingModel",
    "remark": "推荐模型",
}, {
    "id": "modelEvaluation",
    "name": "模型评价",
    "fid": "croppingModel",
    "remark": "模型评价",
}, {
    "id": "standProduction",
    "name": "标准化生产",
    "fid": "croppingModel",
    "remark": "标准化生产",
}];

/*----------------------------------------------------  输入框验证集合 -------- ----------------------------------- */
var serNumber = /^[a-z0-9A-Z]{2,10}$/; //序列号
var wayNumber = /^[0-9]{1,4}$/; //通道号
var videoUrl = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/; //直播地址
var userName = /^[a-z0-9A-Z]{2,20}$/; //用户名
var two_tenName = /^[a-z0-9A-Z\u2E80-\u9FFF]{2,10}$/; //角色名称、传感器名称、设备名称、摄像头名称、地块名称
var one_tenName = /^[a-z0-9A-Z\u2E80-\u9FFF]{1,10}$/; //类别、品种、终端号、终端名称
var one_fiveName = /^[a-z0-9A-Z\u2E80-\u9FFF]{1,50}$/; //角色说明
var two_fiveName = /^[a-z0-9A-Z\u2E80-\u9FFF]{2,50}$/; //机构名称、地址、角色说明
var one_twoName = /^[a-z0-9A-Z\u2E80-\u9FFF]{1,200}$/; //地块介绍、信息正文
var one_Person = /^[a-z0-9A-Z\u2E80-\u9FFF]{2,20}$/; //法人、姓名、自动化名称、信息标题、模型名称
var capitalNumbwe = /^[0-9]{1,10}$/; //注册资金
var myIphone = /^[1][3,4,5,7,8][0-9]{9}$/; //验证手机号
var functionName = /^[\u2E80-\u9FFF]{2,6}$/; //功能名称
var functionUrl = /^[a-zA-Z]{3,20}$/; //功能名称
var inOut_res = /^([1-9]{1}[0-9]{1,5})(\.[0-9]{2}?)?$/;
// var passWord = /
var myRegcode = /^[a-z0-9A-Z]{6,12}$/; //限制长度6-12位 

/*---------------------------------------- 成都项目 数据请求函数 start ---------------------------------------- */
// 数据请求接口地址
var baseUrl = "http://open.chengdu.nyypt.cn";
// var baseUrl = "http://112.19.241.99:5100";
var methodUrl = baseUrl + "/api/method";

//请求时携带的参数token
var paramList = {};
var paramLoginList = {};
paramList["accessToken"] = localStorage.getItem('ACCESS_TOKEN');

// 每次请求携带的参数
function GetPostData(paramList, category, method) {
    if (category != 'sys' || method != 'getAccessToken') {
        if (localStorage.getItem('ACCESS_TOKEN') == null || localStorage.getItem('REFRESH_TOKEN') == null) {
            window.location.href = "./login.html";
        };
        if (Date.parse(new Date()) / 1000 >= localStorage.getItem('expirationTime')) {
            localStorage.clear();
            window.location.href = "./login.html";
        }
    }
    var postdata = {
        params: paramList,
        category: category,
        method: method,
        url: methodUrl
    };
    return postdata;
};
// 登录时不需要携带参数Token
function GetLoginData(paramLoginList, category, method) {
    var postdata = {
        params: paramLoginList,
        category: category,
        method: method,
        url: methodUrl
    };
    return postdata;
};
// 页面ajax
function AjaxRequest(param, fields, type) {
    var postdata = GetPostData(param, fields, type);
    return postFnajax(postdata)
}
//登录ajax
function loginAjaxRequest(param, fields, type) {
    var postdata = GetLoginData(param, fields, type);
    // console.log(JSON.stringify(postdata))
    return postFnajax(postdata)
}
// ajax 数据请求函数
function postFnajax(postbody) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: baseUrl + "/v1/iot/Method",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(postbody),
            success: function (res) {
                resolve(res);
            },
            error: function (err) {
                reject(err);
            }
        });
    });
};

//深拷贝方法
function cloneObjectFn(obj) {
    return JSON.parse(JSON.stringify(obj));
}

//将字符串格式化为UTF8编码的字节    参数entity使用
function getUTF8(json) {
    var array = writeUTF(JSON.stringify(json));
    var str = "";
    for (var i = 2; i < array.length; i++) {
        str += array[i].toString(16);
    }
    return str
};

function writeUTF(str, isGetBytes) {
    var back = [];
    var byteSize = 0;
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (0x00 <= code && code <= 0x7f) {
            byteSize += 1;
            back.push(code);
        } else if (0x80 <= code && code <= 0x7ff) {
            byteSize += 2;
            back.push((192 | (31 & (code >> 6))));
            back.push((128 | (63 & code)))
        } else if ((0x800 <= code && code <= 0xd7ff) ||
            (0xe000 <= code && code <= 0xffff)) {
            byteSize += 3;
            back.push((224 | (15 & (code >> 12))));
            back.push((128 | (63 & (code >> 6))));
            back.push((128 | (63 & code)))
        }
    }
    for (i = 0; i < back.length; i++) {
        back[i] &= 0xff;
    }
    if (isGetBytes) {
        return back
    }
    if (byteSize <= 0xff) {
        return [0, byteSize].concat(back);
    } else {
        return [byteSize >> 8, byteSize & 0xff].concat(back);
    }
};


/****** 生成guid***** */
function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};

/*layui引用 回调*/
var form, element, laytpl, layer, laydate, laypage, table, selectM, tree, license, transfer, util, upload;

function initLayuifn(module, nextfn) {
    layui.use(module, function () {
        for (var i in module) {
            switch (module[i]) {
                case 'layer':
                    if (!layer) {
                        layer = layui.layer;
                    }
                    break;
                case 'form':
                    if (!form) {
                        form = layui.form;
                    }
                    break;
                case 'element':
                    if (!element) {
                        element = layui.element;
                    }
                    break;
                case 'laytpl':
                    if (!laytpl) {
                        laytpl = layui.laytpl;
                    }
                    break;
                case 'laydate':
                    if (!laydate) {
                        laydate = layui.laydate;
                    }
                    break;
                case 'laypage':
                    if (!laypage) {
                        laypage = layui.laypage;
                    }
                    break;
                case 'table':
                    if (!table) {
                        table = layui.table;
                    }
                    break;
                case 'tree':
                    if (!tree) {
                        tree = layui.tree;
                    }
                    break;
                case 'license':
                    if (!license) {
                        license = layui.license;
                    }
                    break;
                case 'transfer':
                    if (!transfer) {
                        transfer = layui.transfer;
                    }
                    break;
                case 'util':
                    if (!util) {
                        util = layui.util;
                    }
                    break;
                case 'upload':
                    if (!upload) {
                        upload = layui.upload;
                    }
                    break;
                default:
                    break;
            }
        }
        if (nextfn) {
            nextfn();
        };
    });
}

function timeago(dateTimeStamp) { //dateTimeStamp是一个时间毫秒，注意时间戳是秒的形式，在这个毫秒的基础上除以1000，就是十位数的时间戳。13位数的都是时间毫秒。
    var minute = 1000 * 60; //把分，时，天，周，半个月，一个月用毫秒表示
    var hour = minute * 60;
    var day = hour * 24;
    var now = new Date().getTime(); //获取当前时间毫秒
    var diffValue = now - dateTimeStamp; //时间差

    if (diffValue < 0) {
        return;
    }
    var datetime = new Date();
    datetime.setTime(dateTimeStamp);
    var Nyear = datetime.getFullYear();
    var Nmonth = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
    var Ndate = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
    var Nhour = datetime.getHours() < 10 ? "0" + datetime.getHours() : datetime.getHours();
    var Nminute = datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
    var Nsecond = datetime.getSeconds() < 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
    result = Nyear + "-" + Nmonth + "-" + Ndate + " " + Nhour + ":" + Nminute + ":" + Nsecond;
    return result;
}
//过滤null
function dataEmpty(str) {
    if (str == null)
        return "";
    return str;
}

//数组查重
function ArrRemoval(arr) {
    var result = [];
    var hash = {};
    for (var i = 0; i < arr.length; i++) {
        var key = (typeof arr[i]) + arr[i];
        if (!hash[key]) {
            result.push(arr[i]);
            hash[key] = true;
        }
    }
    return result;
}
// 时间去除T
function TimeReplice(str) {
    var newStr = str.replace("T", " ");
    return newStr;
}
// 当刷新时判断当前页，展开左侧边栏
//document.onreadystatechange = subSomething; //当页面加载状态改变的时候执行这个方法.
function subSomething() {
    var value = "cameraManage";
    if (menu != "")
        value = decodeURIComponent(atob(menu)); //对字段地址进行解码
    $.each(twoMenu, function (index, item) {
        if (value == item) {
            $("[pagename = '" + value + "']").addClass("active").parent(".sub").slideDown(300, function () {
                $("[pagename = '" + value + "']").parent(".sub").parent(".nLi").addClass("on");
            });
            $("[pagename = '" + value + "']").click();
        }
    })
}

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return r[2];
    } else {
        return "";
    }

}
// 加载子页面
function LoadAction(url, urlParameter, paramid) {
    // $(".active").parent(".sub").siblings("i").text()
    if (urlParameter == 0) {
        var value = urlaction + "?menu=" + btoa(encodeURIComponent(url)); //对字段地址进行编码
        history.pushState(stateObject, "", value);
    }
    if (paramid != undefined) {
        var value = (location.href).split("&")[0] + "&id=" + btoa(encodeURIComponent(paramid));
        history.pushState(stateObject, '', value);
    } else {
        var value = (location.href).split("&")[0];
        history.pushState(stateObject, '', value);
    }
    $("#za_content").load(GetHtml(url, urlParameter));
    SetTitle(url);
}

function SetTitle(url) {
    $.each(menuArray, function (i, item) {
        if (item.id == url) {
            $("#za_contentTop").html('<ul class="clearfix">' + GetMenu(url, "") +
                '</ul>' +
                '<dl>' +
                '<dt>' + item.name + '</dt>' +
                '<dd>' + item.remark + "：实时精准采集作物及环境信息，科学利用农业资源、节水节肥。" + '</dd>' +
                '</dl>')
        }
    })
    $("#za_contentTop ul a:first").removeAttr("onclick");
}

function GetMenu(id, temp) {
    $.each(menuArray, function (i, item) { //onclick="LoadAction("'+ item.id +'",'0 ')
        if (item.id == id) {
            var b = GetQueryString("id");
            var a = "<li><a href=\"javascript:void(0)\" onclick=\"LoadAction('" + item.id + "',0,'" + decodeURIComponent(atob(GetQueryString("id"))) + "')\" >" + item.name + "</a>/</li>"
            temp = a + temp;
            if (item.fid != '') {
                temp = GetMenu(item.fid, temp);
            }
        }
    })
    return temp;
}

// 加载子页面地址
function GetHtml(url, urlParameter) {
    if (urlParameter == 0) {
        var time = Math.random();
    } else {
        var time = urlParameter;
    }
    var str = "";
    switch (url) {
        case "categoryManage":
            str = "/page/farmManage/categoryManage.html";
            break;
        case "deviceManage":
            str = "/page/farmManage/deviceManage.html";
            break;
        case "landManage":
            str = "/page/farmManage/landManage.html";
            break;
        case "landOne":
            str = "/page/farmManage/landOne.html";
            break;
        case "landTwo":
            str = "/page/farmManage/landTwo.html";
            break;
        case "landThree":
            str = "/page/farmManage/landThree.html";
            break;
        case "cameraManage":
            str = "/page/farmManage/cameraManage.html";
            break;
        case "varieties":
            str = "/page/farmManage/varieties.html?id=" + time;
            break;
        case "sensorManage":
            str = "/page/farmManage/sensorManage.html?id=" + time;
            break;
        case "equipmentManage":
            str = "/page/farmManage/equipmentManage.html?id=" + time;
            break;
        case "Mapoverview":
            str = "/page/environmentalMonitor/Mapoverview.html";
            break;
        case "Videosurveillance":
            str = "/page/environmentalMonitor/Videosurveillance.html";
            break;
        case "SensorEquipment":
            str = "/page/environmentalMonitor/SensorEquipment.html";
            break;
        case "controlEquipment":
            str = "/page/environmentalMonitor/controlEquipment.html";
            break;
        case "weatherStation":
            str = "/page/environmentalMonitor/weatherStation.html";
            break;
        case "WaterFertilizer":
            str = "/page/environmentalMonitor/WaterFertilizer.html";
            break;
            //自动化
        case "automaticMonitor":
            str = "/page/automaticMonitor/automaticMonitor.html";
            break;
        case "Inbox":
            str = "/page/messageManage/Inbox.html";
            break;
        case "Outbox":
            str = "/page/messageManage/Outbox.html";
            break;
        case "organManage":
            str = "/page/systemManage/organManage.html";
            break;
        case "roleManage":
            str = "/page/systemManage/roleManage.html";
            break;
        case "userManage":
            str = "/page/systemManage/userManage.html";
            break;
        case "funregister":
            str = "/page/systemManage/funregister.html";
            break;
        // 种植模型croppingModel
        case "RecommendMoxing":
            str = "/page/croppingModel/RecommendMoxing.html";
            break;
        case "modelExperiment":
            str = "/page/croppingModel/modelExperiment.html";
            break;
        case "modelEvaluation":
            str = "/page/croppingModel/modelEvaluation.html";
            break;
        case "standProduction":
            str = "/page/croppingModel/standProduction.html";
            break;
    }
    return str;
}
/*---------------------------------------- 成都项目end ---------------------------------------- */