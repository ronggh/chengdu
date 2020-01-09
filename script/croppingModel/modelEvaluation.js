$(function () {
    ModelEval.getList()
    //查询
    form.on("submit(ModelEval_formSearch)", function (data) {
        var moaelChNname = data.field.modelchName;
        ModelEval.getList(moaelChNname);
    });
    //重置
    form.on("submit(ResetBtn)", function () {
        $('input[name="modelchName"]').val("");
        ModelEval.getList()
    });
});
var ModelEval = {
    pageLimit: rowCount, //设置本页面的一页显示多少条数据
    pageCurr: 1,
    array:[],
    tabIndex: 0,
    startTime:"",
    ModelEvalTable: function (res) {
        table.render({
            elem: '#experimentTable',
            cols: [
                [ //标题栏
                    {
                        field:'',
                        title: '序号',
                        align: 'center',
                        width: '8%',
                        templet:function (data) {
                            return (ModelEval.pageCurr - 1) * ModelEval.pageLimit + data.LAY_INDEX;
                        }
                    },
                    {
                        field: 'Name',
                        title: '模型名称',
                        align: 'center'
                    }, {
                        field: 'In',
                        title: '总投入(万元)',
                        align: 'right'
                    }, {
                        field: 'Out',
                        title: '总产出(万元)',
                        align: 'right'
                    }, {
                        field: 'Proportion',
                        title: '投入产出比',
                        align: 'right'
                    },{
                        field:'Yield',
                        title: '总产量(Kg)',
                        align: 'center'
                    },{
                        title: '操作',
                        toolbar: '#table_operate',
                        align: 'center',
                        templet: function (d) {}
                    }
                ]
            ],
            data: res.data,
            skin: 'line',
            even: true,
            limit: ModelEval.pageLimit,
            id: 'experimentTable'
        })
    },
    getList: function (name) {
        var param = cloneObjectFn(paramList);
        if (name) {
            param["name"] = name;
        }
        param["pageSize"] = ModelEval.pageLimit;
        param["pageIndex"] = ModelEval.pageCurr;
        param["type"] = 2;
        AjaxRequest(param, "model", "getListPage").then(function (res) {
            var modelData = JSON.parse(res);
            laypage.render({
                elem: 'um_pagenation',
                count: modelData.page.totalData,
                limit: ModelEval.pageLimit,
                curr: ModelEval.pageCurr,
                layout: ['count', 'prev', 'page', 'next', 'skip'],
                jump: function (obj, first) {
                    if (!first) {
                        ModelEval.pageCurr = obj.curr;
                        var param = cloneObjectFn(paramList);
                        if (name) {
                            param["name"] = name;
                        }
                        param["pageSize"] = ModelEval.pageLimit;
                        param["pageIndex"] = ModelEval.pageCurr;
                        param["type"] = 2;
                        AjaxRequest(param, "model", "getListPage").then(function (res) {
                            var res = JSON.parse(res)
                            ModelEval.ModelEvalTable(res);
                        });
                    }
                }
            });
            ModelEval.ModelEvalTable(modelData);
        })
    },

    // 评价  // 查看
    Evaluation: function (id, type) {
        var fun_popup_tpl = document.getElementById('add_modelEvaluation').innerHTML;
        laytpl(fun_popup_tpl).render({}, function (html) {
            layer.open({
                type: 1,
                content: html,
                title: ["评价", 'font-size:14px;height:40px;line-height:40px;'],
                area: ['670px', '500px'],
                success: function (index, layero) {
                    var param = cloneObjectFn(paramList);
                    param['id'] = id;
                    AjaxRequest(param, "model", "getmodelInfo").then(function (res) {
                        var evaluationData = JSON.parse(res);
                        ModelEval.startTime = evaluationData.data.StartTime.split("T")[0];
                        $.each(evaluationData.data.CropStages, function (index, item) {
                            if(item.Type == "sensor"){
                                ModelEval.array=item.Params;
                            }
                            if (item.Type == "stage") {
                                var temp = '<li key="' + item.ID + '">' +
                                    '<span>' + item.Name + '</span>' +
                                    '</li>';
                                $("#stage").append(temp);
                                var temp2 = $('<li class="document_info">' +
                                    '<div class="Model_popurBottom">' +
                                    '</div>' +
                                    '</li>');

                                var group = 0;
                                $.each(item.Params, function (index2, item2) {
                                    if (item2.Type == 'input') {
                                        var temp = '<div class="popurTop">' +
                                            '<span class= "popurTime">'+ item2.Name +' </span>' +
                                            '<input lay-verify="required" type="number"  value="' + item2.Value + '">' +
                                            '<p class="timeD"></p>' +
                                            '</div>';
                                        temp2.find('.Model_popurBottom').append(temp);
                                    }
                                    if (item2.Type == 'inputs') {
                                        var temp = '<div class="popurMiddle"></div>';
                                        if (temp2.find('.popurMiddle').length == 0) {
                                            temp2.find('.Model_popurBottom').append(temp);
                                        }
                                        var param = '<div class="popurMiddleTop" id="' + item.ID + item2.Group + '">' +
                                            '<span>' + item2.Name + item2.Unit + '</span>' +
                                            '<input PlarmID="' + item.ID + '" StageID= "' + item2.ID + '" type="text" value="' + item2.Value + '" disabled>' +
                                            '</div>';
                                        if (item2.Group != group) {
                                            group = item2.Group;
                                            temp2.find('.popurMiddle').append(param);
                                        } else {
                                            temp2.find('#' + item.ID + item2.Group + '').append(' <i></i><input PlarmID="' + item.ID + '" StageID= "' + item2.ID + '" type="text"  value="' + item2.Value + '"disabled><em class= "history" dever_ID="' + item.ID + '" StageID= "' + item2.ID + '" type="text"  value="' + item2.Value + '">查验</em>');
                                        }
                                    }
                                })
                                $("#stage_params").append(temp2);
                            }
                        });
                        $("#stage li").each(function (i) {
                            if (i == 0) {
                                $(this).addClass('first_current');
                            } else if (i == $("#stage li").length - 1) {
                                $(this).addClass('last_current');
                            } else {
                                $(this).addClass('center_complete');
                            }
                        });
                        $("#stage_params li").each(function (i) {
                            if (i != 0) {
                                $(this).hide();
                            }
                        });
                        ModelEval.tabIndex = 0;
                        ModelEval.SetDateTime();
                        $("#stage li").on("click", function (event) {
                            ModelEval.tabIndex = $(this).index();
                            ModelEval.SetDateTime();
                            var index = $(this).index();
                            $("#stage li").removeClass('first_current').removeClass('centerki_complete').removeClass('lastki_current').removeClass('center_complete');
                            if (index == 0) {
                                $("#stage li").eq(index).addClass('first_current');
                            } else if (index == $("#stage li").length - 1)
                                $("#stage li").eq(index).addClass('lastki_current');
                            else
                                $("#stage li").eq(index).addClass('centerki_complete');
                            $("#stage_params li").hide();
                            $("#stage_params li").eq($(this).index()).show();
                            $.each($("#stage_params li .history"),function(i){
                                if($(this).parent().parent().parent().find(".timeD").html() != ""){
                                    var time = $(this).parent().parent().parent().find(".timeD").html().split("：")[1].split("~");
                                    var timeStart = time[0];
                                    // 当前时间戳
                                    var now = new Date();
                                    var old = new Date(timeStart);
                                    if(now < old){
                                        $(this).css({background:"#ebebe4",color:"rgba(0, 0, 0, 0.65)",border:"1px solid #b7b9be"})
                                    }
                                }
                            })
                        })
                        $.each($("#stage_params li .history"),function(i){
                            if($(this).parent().parent().parent().find(".timeD").html() != ""){
                                var time = $(this).parent().parent().parent().find(".timeD").html().split("：")[1].split("~");
                                var timeStart = time[0];
                                // 当前时间戳
                                var now = new Date();
                                var old = new Date(timeStart);
                                if(now < old){
                                    $(this).css({background:"#ebebe4",color:"rgba(0, 0, 0, 0.65)",border:"1px solid #b7b9be"})
                                }
                            }
                        })
                        moHistoryClick();
                        if (type == "look") {
                            $('input[name="in"]').val(evaluationData.data.In);
                            $('input[name="out"]').val(evaluationData.data.Out);
                            $('input[name="Yield"]').val(evaluationData.data.Yield);
                            $("input").each(function () {
                                $(this).attr("disabled", "disabled");
                            })
                            var Disable = 'layui-btn-disabled';
                            $(".site-action").addClass(Disable);
                            $('.site-action').attr('disabled', 'disabled');
                            $('input[name="modelchName"]').removeAttr("disabled");
                        }else if(type == "evaluate"){
                            $('input[name="in"]').val(evaluationData.data.In);
                            $('input[name="out"]').val(evaluationData.data.Out);
                            $('input[name="Yield"]').val(evaluationData.data.Yield);
                            $("input").each(function () {
                                $(this).attr("disabled", "disabled");
                            });
                            $(".site-action").removeClass(Disable);
                            $('.site-action').removeAttr('disabled', 'disabled');
                            $('input[name="in"]').removeAttr("disabled");
                            $('input[name="out"]').removeAttr("disabled");
                            $('input[name="Yield"]').removeAttr("disabled");
                            $('input[name="modelchName"]').removeAttr("disabled");
                        } else {
                            $("input").each(function () {
                                $(this).attr("disabled", "disabled");
                            });
                            $(".site-action").removeClass(Disable);
                            $('.site-action').removeAttr('disabled', 'disabled');
                            $('input[name="in"]').removeAttr("disabled");
                            $('input[name="out"]').removeAttr("disabled");
                            $('input[name="Yield"]').removeAttr("disabled");
                            $('input[name="modelchName"]').removeAttr("disabled");
                        }
                        ModelEval.submitSure(id);
                    })
                },
                yes: function (index, layero) {
                    layer.close(index);
                    $(".layui-layer-shade").remove();
                },
                cancel: function () {
                    $(".layui-layer-shade").remove();
                },
            })
        })
    },
    submitSure: function (id) {
        form.on("submit(submitmodel)", function (data) {
            if (!inOut_res.test(data.field.in)) {
                layer.msg('投入金额数值有误或小数位超过两位', {
                    time: 1500
                });
                return false;
            }
            if (!inOut_res.test(data.field.out) || parseFloat(data.field.out) == 0) {
                layer.msg('产出金额数值有误或小数位超过两位', {
                    time: 1500
                });
                return false;
            }
            if (!inOut_res.test(data.field.Yield)) {
                layer.msg('总产量数值有误或小数位超过两位', {
                    time: 1500
                });
                return false;
            }
            var param = cloneObjectFn(paramList);
            param["in"] = data.field.in;
            param["out"] = data.field.out;
            param["yield"] = data.field.Yield;
            param["id"] = id;
            AjaxRequest(param, "model", "setProportion").then(function (res) {
                var res = JSON.parse(res)
                if (res.result.code == 200) {
                    layer.closeAll();
                    ModelEval.pageCurr = 1;
                    ModelEval.getList()
                    layer.msg('操作成功', {
                        time: 2000
                    });
                } else {
                    layer.msg(res.result.msg, {
                        time: 2000
                    });
                }
            })
        })

    },
    updateStatus: function (id) {
        var param = cloneObjectFn(paramList);
        param["id"] = id;
        AjaxRequest(param, "model", "updateStatus").then(function (res) {
            var res = JSON.parse(res)
            if (res.result.code == 200) {
                layer.closeAll();
                ModelEval.pageCurr = 1;
                ModelEval.getList()
                layer.msg('操作成功', {
                    time: 2000
                });
            } else {
                layer.msg(res.result.msg, {
                    time: 2000
                });
            }
        })
    },
    getNewData: function (dateTemp, days, flag = 0, ) {
        var dateTemp = dateTemp.split("-");
        var nDate = new Date(dateTemp[1] + '-' + dateTemp[2] + '-' + dateTemp[0]); //转换为MM-DD-YYYY格式    
        var millSeconds;
        if (flag == 0) {
            millSeconds = Math.abs(nDate) + ((days - 1) * 24 * 60 * 60 * 1000);
        } else {
            millSeconds = Math.abs(nDate) + (days * 24 * 60 * 60 * 1000);
        }
        var rDate = new Date(millSeconds);
        var year = rDate.getFullYear();
        var month = rDate.getMonth() + 1;
        if (month < 10) month = "0" + month;
        var date = rDate.getDate();
        if (date < 10) date = "0" + date;
        return (year + "-" + month + "-" + date);
    },
    SetDateTime: function () {
        var index = ModelEval.tabIndex;
        var day = 0;
        var today = 0 - $(".popurTop input").eq(index).val() * 1 + 2;
        for (var i = 0; i <= index; i++) {
            day += $(".popurTop input").eq(i).val() * 1;
        }
        if ($(".popurTop input").eq(index).val() != "") {
            var end = ModelEval.getNewData(ModelEval.startTime, day);
            var start = ModelEval.getNewData(end, today);
            $(".timeD").eq(ModelEval.tabIndex).html("自：" + start + "~" + end);
        }
    },
}
function moHistoryClick(){
    $(".popurMiddle .history").on("click", function () {
        var time = $(this).parent().parent().parent().find(".timeD").html().split("：")[1].split("~");
        var deviceId = ModelEval.array[$(this).parent().index()].Value;
        var timeStart = time[0];
        var timeend = time[1];
        // 当前时间戳
        var now = new Date();
        var old = new Date(timeStart)
        var inputOne = $(this).parent().find("input").eq(0).val();
        var inputTwo = $(this).parent().find("input").eq(1).val();
        if(now > old){
            moechartinitfn(deviceId, timeStart, timeend,inputOne,inputTwo);
        }
    });
}

//echart表格加载
function moechartinitfn(deviceId, timeStart, timeend, inputOne, inputTwo) {
    var deviceId = deviceId;
    var Unit = "";
    var XAxisData = [];
    var series = [];
    var legendData = [];
    // 路径配置
    require.config({
        paths: {
            echarts: './libs/echarts-2.2.7/build/dist'
        }
    });
    // 使用
    require(
        [
            'echarts',
            'echarts/chart/line'
        ],
        function (ec) {
            var param = cloneObjectFn(paramList);
            param["deviceId"] = deviceId;
            param["start"] = timeStart;
            param["end"] = timeend;
            param["slot"] = "1";
            var postdata = GetPostData(param, "iot", "getDeviceSlotHistory"); //实时数据中的历史记录
            postFnajax(postdata).then(function (res) {
                var result = JSON.parse(res);
                if(result.data.HistoryData.length < 1){
                    layer.msg('暂无数据', {
                        time: 2000
                    });
                    return false;
                }
                var data = [];
                var danwei = result.data.Unit;
                var elcelData = result.data.HistoryData;
                $.each(result.data.HistoryData, function (i, item) {
                    XAxisData.push((item.Time).replace(/T/g, " "));
                    data.push(item.Data);
                });
                timeHistoryData = elcelData;
                legendData.push(result.data.DeviceName);
                var ww = iframeW();
                var openTop = layer.open({
                    title: '查验',
                    type: 1,
                    area: [ww * 0.7 + "px", '520px'],
                    content: $("#chartModel"),
                    btn: ['关闭'],
                    yes: function (index, layero) {
                        layer.close(openTop);
                        $("#chartModel").css("display", "none");
                        $(".OutermostLayer").siblings("layui-layer-shade").remove();
                    },
                    cancel: function () {
                        layer.close(openTop);
                        $("#chartModel").css("display", "none");
                        $(".OutermostLayer").siblings("layui-layer-shade").remove();
                    },
                    success:function(){
                        $.each($(".layui-layer-shade"),function(index,item){
                            if(index>0){
                                $(this).remove();
                            }
                        })
                        var mask = $(".layui-layer-shade");
                        mask.appendTo($(".OutermostLayer").parent());
                        //其中：layero是弹层的DOM对象
                        $(".layui-layer-shade").css({'z-index':2000});
                        $("#chartModel").css({'z-index':200000})
                    }
                });
                $("#chartModel").css("display", "block")
                $("#echartcontain").css({
                    "width": ww * 0.65 + "px"
                });
                moechartfn('', legendData, danwei, XAxisData, data, ec,inputOne,inputTwo);
            });
        }
    );
}
function moechartfn(qname, legendData, danwei, time, series, obj,oneLine,twoLine) {
    var myChart = obj.init(document.getElementById('echartcontain'));
    var option = {
        animation: true,
        title: {
            text: qname,
            subtext: danwei
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: legendData
        },
        toolbox: {
            show: false,
            feature: {
                mark: {
                    show: true
                },
                dataZoom: {
                    show: true
                },
                dataView: {
                    show: true
                },
                magicType: {
                    show: true,
                    type: ['line', 'bar', 'stack', 'tiled']
                },
                restore: {
                    show: true
                },
                saveAsImage: {
                    show: true
                }
            }
        },
        calculable: true,
        dataZoom: {
            show: true,
            realtime: true,
            start: 60,
            end: 100
        },
        xAxis: [{
            name: '时间',
            type: 'category',
            boundaryGap: false,
            data: time,
            nameTextStyle: {
                color: "#999"
            }
        }],
        yAxis: [{
            type: 'value'
        }],
        series: [{
            data: series,
            type: 'line',
            markLine: {
                data: [
                  [
                    {name:"低值:" + oneLine, xAxis: 0, yAxis: oneLine, symbol: 'line'},
                    {xAxis: 240, yAxis: oneLine, symbol: 'line'},
                  ],
                  [
                    {name:"高值:" + twoLine, xAxis: 0, yAxis: twoLine, symbol: 'line'},
                    {xAxis: 240, yAxis: twoLine, symbol: 'line'},
                  ],
                ],
                lineStyle: {
                  normal: {
                    type: 'solid',
                    color: '#999',
                  },
                },
            },
        }]
    };
    myChart.setOption(option, true);
}
function SetList(name, type, data, markLine) {
    this.name = name;
    this.type = type;
    this.data = data;
    this.markLine = markLine;
}
