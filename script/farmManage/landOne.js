$(function () {
    //  判断是新增还是编辑
    var landid = decodeURIComponent(atob((location.href).split("&id=")[1]))
    landOne.landInfo(landid);
})

var landOne = {
    landID: decodeURIComponent(atob((location.href).split("&id=")[1])),
    landInfo: function (id) {
        if (id == "insert") {
            landOne.plandSelectList(1); //种植作物
            landOne.persionSelectList(1); //地块负责人
        } else {
            var param = cloneObjectFn(paramList);
            param['landId'] = id;
            var postdata = GetPostData(param, "land", "getLandInfo");
            postFnajax(postdata).then(function (res) {
                var landInfoData = JSON.parse(res);
                $("input[name = landId]").val(landInfoData.data.LandID);
                $("input[name = landName]").val(landInfoData.data.LandName);
                $('textarea[name="landIntroduce"]').val(landInfoData.data.LandDesc);
                landOne.persionSelectList(landInfoData.data.ResponsiblePerson);
                landOne.plandSelectList(landInfoData.data.PlantCrop);
            })
        }
    },
    landSure: function () {
        form.on('submit(submitAddland)', function (data) {
            console.log(data);
            if (!two_tenName.test(data.field.landName)) {
                layer.msg("请输入2-30位英文、数字、汉字组合的地块名称", {
                    time: 1500
                });
                return false;
            }
            if (!one_twoName.test(data.field.landIntroduce)) {
                layer.msg("请输入1-200位英文、数字、汉字组合的地块介绍", {
                    time: 1500
                });
                return false;
            }
            if (data.field.landIntroduce != "" && data.field.landName != "") {
                var entityJson = {
                    "LandName": data.field.landName,//地块名称
                    "ResponsiblePerson": $("#landPerson_re").val(),
                    "PlantCrop": $('input[name="raiseCrops_instal"]').val(),
                    "LandDesc": data.field.landIntroduce,//地块介绍
                }
                if (landOne.landID == "insert") {
                    entityJson.LandID = guid();
                } else {
                    entityJson.LandID = landOne.landID;
                }
                if ($("#landPerson_re").val() == "") {
                    delete entityJson.ResponsiblePerson
                }
                if ($('input[name="raiseCrops_instal"]').val() == -1) {
                    delete entityJson.PlantCrop
                }
                var param = cloneObjectFn(paramList);
                param["entity"] = getUTF8(entityJson);
                var postdata = GetPostData(param, "land", "setLandInfo");
                postFnajax(postdata).then(function (res) {
                    var landRes = JSON.parse(res);
                    if (landRes.result.code == 200) {
                        LoadAction('landTwo', '0', entityJson.LandID);
                    } else {
                        layer.msg(landRes.result.msg, {
                            time: 1000
                        });
                    }
                })
            }
        })
    },
    //地块负责人
    persionSelectList: function (landPersonParam) {
        var param = cloneObjectFn(paramList);
        param["orgID"] = $("input[name = orgid]").val();
        param["all"] = 1;
        //地块负责人
        var postdata = GetPostData(param, "user", "getList");
        postFnajax(postdata).then(function (res) {
            var userselectData = JSON.parse(res);
            var landPersonSelect = "";
            if (landPersonParam == 1) {
                landPersonSelect = '<option value="">请选择地块负责人</option>';
            } else {
                $.each(userselectData.data, function (index, item) {
                    if (item.id == landPersonParam) {
                        landPersonSelect = '<option value=' + item.id + '>' + item.name + '</option>';
                    }
                })
            }
            $.each(userselectData.data, function (index, item) {
                landPersonSelect = landPersonSelect + '<option value=' + item.id + '>' + item.name + '</option>';
            })
            $('#landPerson_re').html(landPersonSelect);
            form.render('select');
        })
    },
    //种植作物
    plandSelectList: function (CropSelect) {
        var param = cloneObjectFn(paramList);
        param['pageSize'] = listCount;
        param['pageIndex'] = 1;
        param["status"] = "1";
        var postdata = GetPostData(param, "crop", "getCropListPage");
        postFnajax(postdata).then(function (res) {
            var res = JSON.parse(res);
            if (CropSelect != 1) {
                $.each(res.data, function (index, item) {
                    if (CropSelect == item.CropID) {
                        $('input[name="raiseCrops_instal"]').val(CropSelect);
                        $('#popup_Org .value_ft').html(item.CropName).addClass('active');
                    }
                })
            }
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
        })
    },
}