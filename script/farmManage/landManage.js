$(function () {
    sellstatisticsFn.getList();
    sellstatisticsFn.ResetOutbox();
    laydate.render({
        elem: '#date_3',
        range: true,
        theme: '#389bff',
        change: function (value, date, endDate) {
            date_2 = value;
        },
        done: function (value, date, endDate) {
            date_2 = value;
        }
    });
    var landPersonSelect = '<option value="">所有</option>';
    sellstatisticsFn.plandSelectList();
    sellstatisticsFn.persionSelectList(landPersonSelect);

    //查询
    form.on('submit(land_formSearch)', function (data) {
        // console.log(data)
        var name = data.field.landchName;
        var crop = $('input[name="raiseCrops_instal"]').val();
        var person = data.field.personchName;
        if (data.field.timechName != "") {
            var start = data.field.timechName.split(' - ')[0];
            var end = data.field.timechName.split(' - ')[1];
        }
        sellstatisticsFn.pageCurr = 1;
        sellstatisticsFn.getList(name, crop, person, start, end);
    })
    table.on('tool(landTable)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            sellstatisticsFn.delland(data);
        }
    })
});
var sellstatisticsFn = {
    pageLimit: rowCount,
    pageCurr: 1,
    shape: [],
    searchTime: Math.round(new Date(new Date().getFullYear(), new Date().getMonth()).getTime()) + 8 * 60 * 60 * 1000,
    //表格数据渲染
    tableRender: function (res) {
        table.render({
            elem: '#landTable',
            cols: [
                [ //标题栏
                    {
                        type: 'numbers',
                        title: '序号',
                        align: 'center'
                    }, {
                        field: 'LandName',
                        title: '地块名称',
                        align: 'center'
                    }, {
                        field: 'CreateTime',
                        width: 180,
                        title: '创建时间',
                        align: 'center'
                    }, {
                        field: 'CropName',
                        title: '种植作物',
                        align: 'center'
                    }, {
                        field: 'UserName',
                        title: '地块责任人',
                        align: 'center'
                    }, {
                        field: 'Sensor',
                        width: 120,
                        title: '已关联的设备',
                        align: 'center',
                        templet: function (d) {
                            return d.SensorCount + d.IntegratedCount + d.ControllerCount;
                        }
                    }, {
                        field: 'CameraCount',
                        width: 130,
                        title: '已关联的摄像头',
                        align: 'center'
                    }, {
                        title: '操作',
                        toolbar: '#table_operate',
                        align: 'center'
                    }
                ]
            ],
            data: res.data,
            skin: 'line',
            even: true,
            limit: sellstatisticsFn.pageLimit,
        })
    },
    //获取地块列表
    getList: function (landName, plandName, PersonName, start, end) {
        var param = cloneObjectFn(paramList);
        param["pageSize"] = sellstatisticsFn.pageLimit;
        param["pageIndex"] = sellstatisticsFn.pageCurr;
        param["name"] = landName;
        param["crop"] = plandName;
        param["person"] = PersonName;
        param["start"] = start;
        param["end"] = end;
        if (param.crop == '' || param.crop == undefined) {
            delete param.crop
        }
        if (param.person == '' || param.person == undefined) {
            delete param.person
        }
        if (param.name == '' || param.name == undefined) {
            delete param.name;
        }
        if (param.start == '' || param.start == undefined) {
            delete param.start;
        }
        if (param.end == '' || param.end == undefined) {
            delete param.end;
        }
        var postdata = GetPostData(param, "land", "getLandListPage");
        postFnajax(postdata).then(function (res) {
            // console.log(res);
            // console.log(param)
            var res = JSON.parse(res);
            $.each(res.data, function (index, item) {
                item.CreateTime = item.CreateTime.replace("T", " ");
            })
            //分页
            laypage.render({
                elem: 'um_pagenation',
                count: res.page.totalData,
                limit: sellstatisticsFn.pageLimit,
                curr: sellstatisticsFn.pageCurr,
                layout: ['count', 'prev', 'page', 'next', 'skip'],
                jump: function (obj, first) {
                    if (!first) {
                        sellstatisticsFn.pageCurr = obj.curr;
                        var param = cloneObjectFn(paramList);
                        param["pageSize"] = sellstatisticsFn.pageLimit;
                        param["pageIndex"] = sellstatisticsFn.pageCurr;
                        var postdata = GetPostData(param, "land", "getLandListPage");
                        postFnajax(postdata).then(function (res) {
                            var res = JSON.parse(res)
                            $.each(res.data, function (index, item) {
                                item.CreateTime = item.CreateTime.replace("T", " ");
                            })
                            sellstatisticsFn.tableRender(res);
                        });
                    }
                }
            });
            sellstatisticsFn.tableRender(res);
        });
    },
    //删除地块
    delland: function (landId) {
        var del_land_Tpl = document.getElementById('del_land_popup').innerHTML;
        laytpl(del_land_Tpl).render(landId, function (html) {
            layer.open({
                id: 'del_land_pop',
                type: 1,
                content: html,
                title: ['删除', 'font-size:16px;height:46px;line-height:46px;'],
                area: ['450px', '200px'],
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    // console.log(landId)
                    var param = cloneObjectFn(paramList);
                    param["operation"] = "delete";
                    param["landId"] = landId.LandID;
                    var postdata = GetPostData(param, "land", "delete");
                    postFnajax(postdata).then(function (res) {
                        var landres = JSON.parse(res);
                        if (landres.result.code == 200) {
                            layer.msg('删除成功');
                            layer.close(index);
                            sellstatisticsFn.getList();
                        } else {
                            layer.msg("删除失败", {
                                time: 1500
                            })
                        }
                    })
                },
                success: function () {}
            });
        });
    },
    //地块负责人
    persionSelectList: function (landPersonSelect) {
        param = cloneObjectFn(paramList);
        //param["pageSize"] = 1000;
        param["orgID"] = $("input[name = orgid]").val();
        param["all"] = 1;
        //地块负责人
        var postdata = GetPostData(param, "user", "getList");
        postFnajax(postdata).then(function (res) {
            var userselectData = JSON.parse(res);
            $.each(userselectData.data, function (index, item) {
                landPersonSelect = landPersonSelect + '<option value=' + item.id + '>' + item.name + '</option>';
            })
            $('#landPerson').html(landPersonSelect);
            $('#landPerson_re').html(landPersonSelect);
            form.render('select');
        })
    },
    //种植作物
    plandSelectList: function () {
        var param = cloneObjectFn(paramList);
        param['pageSize'] = listCount;
        param['pageIndex'] = 1;
        var postdata = GetPostData(param, "crop", "getCropListPage");
        postFnajax(postdata).then(function (res) {
            // console.log(res);
            var res = JSON.parse(res);
            setTimeout(function () {
                form.render();
                //zTree配置
                var settingOrg = {
                    data: {
                        simpleData: {
                            enable: true
                        }
                    },
                    callback: {
                        onClick: onClickOrg,
                        beforeClick : function(treeId, treeNode) {
                            if (treeNode.children) {
                                return false;
                            }
                        }       
                    },          
                };
                var id='';
                var dataArr = [];
                $.each(res.data, function (index, item) {
                    if(item.IsValid == 1){
                        if(id!=item.CropCategory){
                            dataArr.push({
                                id: item.CropCategory,
                                name: item.CategoryName,
                                pId: "",
                                open: true,
                                click:false,
                            });
                            id = item.CropCategory;
                        }
                        dataArr.push({
                            id: item.CropID,
                            name: item.CropName,
                            pId: item.CropCategory,
                            open: true
                        });
                    }
                })
                $.fn.zTree.init($("#treeOrg"), settingOrg, dataArr);
            });
            //上级机构点击后的回调
            function onClickOrg(e, treeId, treeNode) {
                $('#popup_Org .value_ft').html(treeNode.name).addClass('active');
                $('input[name="raiseCrops_instal"]').val(treeNode.id);
                $('#plandBox').addClass('hidden');
            }
            $('#popup_Org .value_ft').on('click', function () {
                showMenuOrg();
            })

            function showMenuOrg() {
                $('#plandBox').removeClass('hidden');
                $("body").bind("mousedown", onBodyDownOrg);
            }

            function hideMenuOrg() {
                $('#plandBox').addClass('hidden');
                $("body").unbind("mousedown", onBodyDownOrg);
            }

            function onBodyDownOrg(event) {
                if (!(event.target.id == "plandBox" || event.target.id == "treeOrg" || $(event.target).parents("#plandBox").length > 0)) {
                    hideMenuOrg();
                }
            }
        });
    },
    // 重置
    ResetOutbox: function () {
        form.on('submit(ResetBtn)', function () {
            $('input[name="landchName"]').val('');
            $('input[name="timechName"]').val('');
            form.val("land_form", {
                // "plantchName": -1,
                "personchName": -1,
            })
            $("#popup_Org div").removeClass("active");
            $("#popup_Org .value_ft").html("请选择种植作物");
            $('input[name="raiseCrops_instal"]').val("");
            sellstatisticsFn.getList();
        })
    },
}