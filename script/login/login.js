
//引入layui模块
 $(function () {
     initLayuifn(['element', 'layer', 'laytpl', ], function () {});
 });

 var userSeitch = 0;
 var passwordSeitch = 0;
 var verCodeSwitch = 0;
 var VCode = new GVerify("VCode");
 //  var myRegcode = /^[a-z0-9A-Z]{6,12}$/;
 $(".user").on('focus', function () {
     $('.user').removeClass('erro');
     userSeitch = 0;
 });
 $(".password").on('focus', function () {
     $('.password').removeClass('erro');
     passwordSeitch = 0;
 });
 $(".verCode").on('focus', function () {
     $('.verCode').removeClass('erro');
     verCodeSwitch = 0;
 });
 //点击登录
 $('.logoForm .loginBtn').click(function () {
     VerifyLogin();
 });
 //回车登录事件
 $("body").keydown(function (event) {
     if (event.keyCode == "13") { //keyCode=13是回车键
         VerifyLogin();
     }
 });
 //验证登录信息
 function VerifyLogin() {
     if ($('.user').val() == '') {
         userSeitch = 0;
     } else {
         userSeitch = 1;
     };
     if (!myRegcode.test($('.password').val())) {
         passwordSeitch = 0;
     } else {
         passwordSeitch = 1;
     };
    //  if ($('.verCode').val() == "") {
    //      verCodeSwitch = 0;
    //  } else {
    //      var res = VCode.validate($('.verCode').val());
    //      if (res) {
    //          verCodeSwitch = 1;
    //      } else {
    //          $('.verCode').addClass('erro');
    //          layer.msg("验证码错误", {
    //              time: 1500
    //          });
    //          verCodeSwitch = 0;
    //      }
    //  }
     if (userSeitch == 1 && passwordSeitch == 1) { //&& verCodeSwitch == 1
         var pwd = CryptoJS.MD5($(".password").val()).toString();
         pwd = CryptoJS.MD5(pwd).toString();
         pwd = CryptoJS.MD5(pwd).toString();
         var userName = $(".user").val();
         GetLogin(userName, pwd);
     } else {
         if (userSeitch != 1) {
             layer.msg("请输入用户名", {
                 time: 1500
             });
             $('.user').addClass('erro');
             return false;
         }
         if (passwordSeitch != 1) {
             layer.msg("请输入有效密码", {
                 time: 1500
             });
             $('.password').addClass('erro');
             return false;
         }
        //  if (verCodeSwitch != 1) {
        //      layer.msg("验证码错误", {
        //          time: 1500
        //      });
        //      $('.verCode').addClass('erro');
        //      return false;
        //  }
     }
 }
 //登录事件
 function GetLogin(userName, password) {
     var param = cloneObjectFn(paramLoginList);
     param["grant_type"] = "password";
     param["username"] = userName;
     param["password"] = password;
     loginAjaxRequest(param, "sys", "getAccessToken").then(function (res) {
        //  console.log(res);
         var result = JSON.parse(res);
         if (result.result.code == 200) {
             layer.msg("登陆成功", {
                 time: 1500
             });
             localStorage.setItem('ACCESS_TOKEN', result.data.access_token);
             localStorage.setItem('REFRESH_TOKEN', result.data.refresh_token);
             localStorage.setItem('expirationTime', result.data.exp);
             localStorage.setItem('USER_ID', result.data.user_id);
            
             window.location.href = "./index.html";
         } else {
             layer.msg(result.result.msg, {
                 time: 1500
             });
             VCode.validate("")
         };
     });
 }
 //忘记密码
 function forgetPass() {

     var ForGet_popup_tpl = document.getElementById('ForGet_popup').innerHTML;
     laytpl(ForGet_popup_tpl).render({}, function (html) {
         var forgetOpen = layer.open({
             type: 1,
             content: html,
             title: ["忘记密码", 'font-size:16px;height:60px;line-height:60px;color: rgba(0, 0, 0, 0.65);'],
             area: ['400px', '380px'],
             success: function (index, layero) {
                 //弹出框
                 var phoneSwitch = 0;
                 var phoneCodeSwitch = 0;
                 var passNewSwitch = 0;
                 var newAginSwitch = 0;
                 $(".phone").on('focus', function () {
                     $('.phone').removeClass('erro');
                 });
                 $(".phoneCode").on('focus', function () {
                     $('.phoneCode').removeClass('erro');
                 });
                 $(".passNew").on('focus', function () {
                     $('.passNew').removeClass('erro');
                 });
                 $(".passAgin").on('focus', function () {
                     $('.passAgin').removeClass('erro');
                 });
                 //忘记密码点击提交事件
                 $("#sureRes").on("click", function () {
                     VerifyInformation();
                 })

                 function VerifyInformation() {
                     //验证手机号
                     if (!isPoneAvailable($(".phone").val())) {
                         $('.phone').addClass('erro');
                         layer.msg("请输入正确手机号", {
                             time: 1500
                         });
                         phoneSwitch = 0;
                         return false;
                     } else {
                         phoneSwitch = 1;
                     }
                     //验证短信验证码
                     if ($('.phoneCode').val() == '') {
                         $('.phoneCode').addClass('erro');
                         layer.msg("请输入验证码", {
                             time: 1500
                         });
                         phoneCodeSwitch = 0;
                         return false;
                     } else {
                         phoneCodeSwitch = 1;
                     }
                     //验证密码
                     if (!myRegcode.test($('.passNew').val())) {
                         $('.passNew').addClass('erro');
                         layer.msg("请输入符合规则的新密码", {
                             time: 1500
                         });
                         passNewSwitch = 0;
                         return false;
                     } else {
                         passNewSwitch = 1;
                     }
                     if ($('.passNew').val() != $('.passAgin').val()) {
                         layer.msg("两次密码不一致", {
                             time: 1500
                         });
                         $('.passNew').addClass('erro');
                         $('.passAgin').addClass('erro');
                         newAginSwitch = 0;
                         return false;
                     } else {
                         newAginSwitch = 1;
                     }
                     if (phoneSwitch == 1 && phoneCodeSwitch == 1 && passNewSwitch == 1 && newAginSwitch == 1) {
                         var param = cloneObjectFn(paramLoginList);
                         var pwd = CryptoJS.MD5($(".passNew").val()).toString();
                         pwd = CryptoJS.MD5(pwd).toString();
                         pwd = CryptoJS.MD5(pwd).toString();
                         param["phoneNumber"] = $(".phone").val();
                         param["code"] = $(".phoneCode").val();
                         param["pwd"] = pwd;
                         loginAjaxRequest(param, "user", "resetPassword").then(function (res) {
                             var result = JSON.parse(res);
                             if (result.result.code == 200) {
                                 layer.msg("密码修改成功", {
                                     time: 1500
                                 }, function () {
                                     layer.close(forgetOpen);
                                 });
                             } else {
                                 layer.msg(result.result.msg, {
                                     time: 1500
                                 });
                             };
                         });
                     }
                 }
             }
         });
     })
 }
 //获取验证码
 var wait = 60;

 function hasCode(obj) {
     if (isPoneAvailable($(".phone").val())) {
         var param = cloneObjectFn(paramLoginList);
         param["phoneNumber"] = $(".phone").val();
         loginAjaxRequest(param, "ShortMessage", "SendSms").then(function (res) {
             var result = JSON.parse(res);
             if (result.result.code == 200) {
                 layer.msg("短信已发送请注意查收！", {
                     time: 1500
                 }, function () {
                     CountDown(obj);
                 })
             } else {
                 layer.msg(result.result.msg, {
                     time: 1500
                 })
                 return false;
             }
         });
     } else {
         layer.msg("请输入正确的手机号", {
             time: 1500
         });
         $('.phone').addClass('erro');
     }
 };
 //验证手机号
 function isPoneAvailable(poneInput) {
     var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
     if (!myreg.test(poneInput)) {
         return false;
     } else {
         return true;
     }
 };
 //倒计时
 function CountDown(obj) {
     if (wait == 0) {
         obj.removeAttribute("disabled");
         obj.value = "获取短信验证码";
         wait = 60;
     } else {
         obj.setAttribute("disabled", true);
         obj.value = "重新发送(" + wait + ")";
         wait--;
         setTimeout(function () {
             CountDown(obj)
         }, 1000)
     }
 };