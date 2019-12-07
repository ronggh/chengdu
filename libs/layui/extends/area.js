layui.define(['form','laytpl'], function(factory) {
    'use strict';
    var layuiForm = layui.form
    var laytpl = layui.laytpl
    var areaTpl = `<div class="area-list">
	<select name="{{d.provinceName?d.provinceName:'Province'}}" id="" lay-filter="{{d.pFilter?d.pFilter:'Province'}}" lay-search="" lay-verify="Province">
			{{#  layui.each(d.provinces, function(index, item){ }}
			{{#  
				var selected = item.AreaCode === d.province?'selected':''
			}}
			<option value="{{item.AreaCode}}" {{selected}}>{{item.Name}}</option>
		{{#  });}}
	</select>
	<select name="{{d.cityName?d.cityName:'City'}}" id="" lay-filter="{{d.cFilter?d.cFilter:'City'}}" lay-search="" lay-verify="City">
		{{#  layui.each(d.citys, function(index, item){ }}
			{{#  
				var selected = item.AreaCode === d.city?'selected':''
			}}
			<option value="{{item.AreaCode}}" {{selected}}>{{item.Name}}</option>
		{{#  });}}
	</select>
	<select name="{{d.CountyName?d.countyName:'County'}}" id="" lay-filter="{{d.coFilter?d.coFilter:'County'}}" lay-search="" lay-verify="County">
		{{#  layui.each(d.countys, function(index, item){ }}
			{{#  
				var selected = item.AreaCode === d.county?'selected':''
			}}
			<option value="{{item.AreaCode}}" {{selected}}>{{item.Name}}</option>
		{{#  });}}
	</select>
</div>`;

    var Area = function(o) {
		this.init(o)
    }

    Area.prototype = {
        init:function(o) {
            var _this = this
            this.o = $.extend(true,{},o)
            this.getAreaList({
                id: 0,
                done:function(p){
                    _this.getAreaList({
                        id: _this.o.province || 110000,
                        done: function(c){
                            _this.getAreaList({
                                id: _this.o.city || 110100,
                                done: function(co){
                                    _this.data = {
                                        provinces: p.data,
                                        citys: c.data,
                                        countys: co.data
                                    }
                                    _this.o = $.extend(true,_this.o,_this.data)
                                    _this.render()
                                    _this.onProvince()
                                    _this.onCity()
                                }
                            })
                        }
                    })
                }
            })
        },
        render:function(){
            this.el = laytpl(areaTpl).render(this.o)
            $(this.o.elem).html(this.el)
            layuiForm.render('select')
        },
        getAreaList: function(op){
            var postData = {
                "category": "district",
                "method": "getList",
                "params": {
                    "areaCode": op.id
                }
            }
            Postfn({'params': postData,"notoken":true}).then(function(res){
                if(res.result.code == 200){
                    op.done&&op.done(res)
                }
            })
        },
        onProvince: function(){
            var _this = this
            layuiForm.on(`select(${this.o.pFilter?this.o.pFilter:'Province'})`,function(data){
                _this.o.province = data.value
                _this.getAreaList({
                    id: data.value,
                    done: function(c){
                        _this.getAreaList({
                            id: c.data[0].AreaCode,
                            done: function(co){
                                _this.o.citys = c.data
                                _this.o.countys = co.data
                                _this.render()
                            }
                        })
                    }
                })
            })
        },
        onCity: function(){
            var _this = this
            layuiForm.on(`select(${this.o.cFilter?this.o.cFilter:'City'})`,function(data){
                _this.o.city = data.value
                _this.getAreaList({
                    id: data.value,
                    done: function(co){
                        _this.o.countys = co.data
                        _this.render()
                    }
                })
            })
        }
    }
    Area.prototype.constructor = Area

    factory('area', Area)
});