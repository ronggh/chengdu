layui.define([], function(factory) {
    'use strict';
    var MapModule = function(o){

        var _this = this

        this.o = $.extend(true,{},o)

        this.o.mapOptions.center = new google.maps.LatLng(this.o.mapOptions.center[0],this.o.mapOptions.center[1])

        this.map = new google.maps.Map(document.getElementById(this.o.elem),this.o.mapOptions);  //实例化谷歌地图

        this.marker = new google.maps.Marker({
            position: {lat: this.o.mapOptions.center.lat(), lng: this.o.mapOptions.center.lng()},
            map: _this.map
        })

        this.geocoder = new google.maps.Geocoder();
    } 

    MapModule.prototype = {
        search: function(val) {
            var _this = this
            this.geocoder.geocode({address: val}, function(results, status) {
                //判断解析状态
                if(status == google.maps.GeocoderStatus.OK) {
                    _this.map.panTo(results[0].geometry.location);
                } else {
                    return false;
                }
            });
        }
    }  
    MapModule.prototype.constructor = MapModule

    factory('mapModule',MapModule)
});