//加载selectM
layui.config({
	base: './'
}).extend({
	selectM: './libs/layui/extends/selectM',
}).use('selectM', function () {
	selectM = layui.selectM
})