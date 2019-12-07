layui.define(['form','laytpl','laydate','layer','table'], function(factory) {
    'use strict';

    var laytpl = layui.laytpl
    var laydate = layui.laydate
    var layer = layui.layer
    var table = layui.table

    var licenceTpl = `
    <div class="licence-item">
        {{# if(d.status === 'show'){ }}
        <div class="show">
            <div class="licname">许可证名称：<span>{{d.License.LicName}}</span></div>
            <div class="licnum">编号：<span>{{d.License.LicNum}}</span></div>
            <div class="licauthz">颁发机构：<span>{{d.License.LicAuthz}}</span></div>
            <div class="authzdate">颁证日期：<span>{{new Date(d.License.AuthzDate).format('yyyy/MM/dd')}}</span></div>
            <div class="validdate">有效期：<span>{{new Date(d.License.LicStart).format('yyyy/MM/dd')}} ~ {{new Date(d.License.LicExp).format('yyyy/MM/dd')}}</span></div>
            <div class="status">当前状态：<span>{{d.License.Status?d.License.Status === 1?'审核通过':'审核未通过':'待审核'}}</span></div>
        </div>
        <div class="audit-log" id="{{d.License.Id}}">审核日志</div>
        {{# }else{ }}
        <form class="layui-form" id="licenceForm">
            <div class="layui-form-item">
                <label class="layui-form-label">许可证名称</label>
                <div class="layui-input-block">
                    <input type="text" name="LicName" placeholder="请输入许可证名称" autocomplete="off" class="layui-input">
                </div>
            </div>
            <div class="layui-form-item">
                <label class="layui-form-label">编号</label>
                <div class="layui-input-block">
                    <input type="text" name="LicNum" placeholder="请输入编号" autocomplete="off" class="layui-input">
                </div>
            </div>
            <div class="layui-form-item">
                <label class="layui-form-label">颁发机构</label>
                <div class="layui-input-block">
                    <input type="text" name="LicAuthz" placeholder="请输入颁发机构" autocomplete="off" class="layui-input">
                </div>
            </div>
            <div class="layui-form-item">
                <label class="layui-form-label">颁发日期</label>
                <div class="layui-input-block">
                    <input type="text" name="AuthzDate" placeholder="请选择颁发日期" id="LicAuthz" class="layui-input">
                </div>
            </div>
            <div class="layui-form-item">
                <label class="layui-form-label">有效日期</label>
                <div class="layui-input-block">
                    <input type="text" name="LicExp" placeholder="请选择有效日期" id="LicExp" class="layui-input">
                </div>
            </div>
        </form>
        {{# } }}
    </div>
    `;

    var License = function(o) {
        this.o = $.extend(true,{},o)

        this.o.data = this.o.data? this.o.data: {}

        this.o.status = this.o.status? this.o.status: 'show'

        this.o.data.status = this.o.status
    }

    License.prototype = {
        render: function() {//渲染方法

            var _this = this

            this.el = $(laytpl(licenceTpl).render(this.o.data))

            $(this.o.elem).append(this.el)

            if(this.o.status === 'show'){
                this.el.find(`#${this.o.data.License.Id}`).on('click',function(){
                    _this._log()
                })
            }

            if(this.o.status === 'edit'){
                laydate.render({
                    elem: '#LicAuthz',
                    format: 'yyyy.MM.dd'
                })

                laydate.render({
                    elem: '#LicExp',
                    format: 'yyyy.MM.dd',
                    range:true,
                    done: function(value){
                       
                    }
                })
            }
          
        },
        setStatus: function(t) {//设置状态方法

            this.o.status = t

            this.o.data.status = t

            this.el = laytpl(licenceTpl).render(this.o.data)

            $(this.o.elem).html(this.el)
        },
        getStatus: function() {//获取状态方法

            return this.o.status
        },
        filed: function(){//获取数据方法

            var formData =  $('#licenceForm').serializeArray()

            for(let i = 0;i < formData.length; i++){

                this.o.data[formData[i].name] = formData[i].value
            }

            this.o.data.LicStart = this.o.data.LicExp.split('-')[0]

            this.o.data.LicExp = this.o.data.LicExp.split('-')[1]

            var d = $.extend(true,{},this.o.data)
            
            delete d.status

            return d
        },
        _log: function(){
            var _this = this
            layer.open({
                type:1,
                title: '审核日志',
                btn:['关闭'],
                area:['700px','500px'],
                content:' <table id="logTable"></table>',
                btn1: function(index){
                    layer.close(index)
                },
                success: function(){
                    table.render({
						elem: '#logTable',
						data: _this.o.data.LicenseAuditRecord,
						skin:'line',
                        even: true,
						cols: [[ //表头
							{field: 'AuditTime', title: '操作时间',templet:function(d){
                              
                                return new Date(new Date(d.AuditTime).getTime()).format('yyyy/MM/dd hh:mm')
                            }},
							{field: 'AuditorName', title: '操作人'},
							{field: 'AuditResult', title: '审核结果',templet:function(d){
								switch(d.AuditResult){
									case -1:
									return '审核未通过';
									break;
									case 1:
									return '审核通过';
									break;
								}
							}},
							{field: 'AuditContent', title: '审核意见'}
                        ]]
                    })
                }
            })
        }
    }

    License.prototype.constructor = License

    factory('license',License)
});