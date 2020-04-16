$(function () {
    standProduct.getList();
});
var standProduct = {
    pageLimit: rowCount,
    pageCurr: 1,
    index: 0,
    tabIndex: 0,
    standProductTable: function (res) {
        table.render({
            elem: '#standTable',
            cols: [
                [ //标题栏
                    {
                        field:'',
                        title: '序号',
                        align: 'center',
                        width:"8%",
                        templet:function (data) {
                            return (standProduct.pageCurr - 1) * standProduct.pageLimit + data.LAY_INDEX;
                        }
                    },
                    {
                        field: 'ModelName',
                        title: '名称',
                        align: 'center',
                        width:"43%",
                    }, {
                        field: 'StartTime',
                        title: '创建时间',
                        align: 'center',
                        width:"43%",
                        templet: function (d) {
                            return "2019-03-20 13:45:20"
                        }
                    }, {
                        title: '操作',
                        toolbar: '#stand_table',
                        align: 'center',
                        width:"6%",
                    }
                ]
            ],
            data: res.data,
            skin: 'line',
            even: true,
            limit: standProduct.pageLimit,
            id: 'standTable'
        })
    },
    getList: function (moaelChNname, timeStart, timeEnd) {
            var modelData = {"id":0,"result":{"message":"ok","code":200},"data":[{"ID":"db6ca613-ea6f-4f4f-b538-d9900d637ef0","Name":"","Status":"生产中","CreateTime":"2019-11-28T10:26:21","In":null,"Out":null,"Proportion":null,"ModelName":"西红柿标准种植模型-系统内置","LandName":"妮娜皇后111","Day":57,"StartTime":"2019-11-01T00:00:00"}],"page":{"pageIndex":1,"pageSize":6,"totalData":1}}
            standProduct.standProductTable(modelData);
    },
    AddstandProduct: function (opera_type,id) {
        standProduct.index = 0;
        var title = "模型名称:西红柿标准种植模型-系统内置";
        var fun_popup_tpl = document.getElementById('add_modelstand').innerHTML;
        laytpl(fun_popup_tpl).render({}, function (html) {
            layer.open({
                type: 1,
                content: html,
                title: [title, 'font-size:14px;height:40px;line-height:40px;'],
                area: ['700px', '360px'],
                success: function (index, layero) {
                    if (opera_type == "look") {
                        var param = cloneObjectFn(paramList);
                        param['id'] = "1cbea027-9286-45d2-a25e-5b1cfcd8485f";
                        AjaxRequest(param, "model", "getmodelInfo").then(function (res) {
                            var modelData = JSON.parse(res);
                            standProduct.menuTop(modelData.data.CropStages, "update");
                        })
                    };
                }
            })
        })
    },
    // 渲染弹窗
    menuTop: function (modelData, type) {
        $("#stage li").remove();
        $("#stage_params li").remove();
        $.each(modelData, function (index, item) {
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
                            '<span>持续周期 </span>' +
                            '<input PlarmID="' + item2.ID + '" type="text" StageID= "' + item.ID + '"  value="' + item2.Value + '"> &nbsp天' +
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
                            '<input PlarmID="' + item2.ID + '" StageID= "' + item.ID + '" type="text" value="' + item2.Value + '">' +
                            '</div>';
                        if (item2.Group != group) {
                            group = item2.Group;
                            temp2.find('.popurMiddle').append(param);
                        } else {
                            temp2.find('#' + item.ID + item2.Group + '').append(' <i></i><input PlarmID="' + item2.ID + '" StageID= "' + item.ID + '" type="text"  value="' + item2.Value + '">');
                        }
                    }
                })
                $("#stage_params").append(temp2);
            }
        });
        $("#stage_params li input").attr("disabled", "disabled");
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
        $("#stage li").on("click", function (event) {
            standProduct.tabIndex = $(this).index();
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
        })
    },
}