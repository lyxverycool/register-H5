"use strict";
    // var source = tools.getParams("source");
    // if (source) {
    //     source = decodeURI(source);
    //     tools.addCookie("source", source);
    // } else {
    //     source = tools.getCookie("source");
    // }
    // var keyword = tools.getParams("keyword");
    // if (keyword) {
    //     keyword = decodeURI(keyword);
    //     tools.addCookie("keyword", keyword);
    // } else {
    //     keyword = tools.getCookie("keyword");
    // }

    var element = $("[name='registerForm']");
    var username = element.find("[name='username']");
    var mobileNo = element.find("[name='mobileNo']");
    var password = element.find("[name='password']");
    var confirmPassword = element.find("[name='confirmPassword']");
    var preferentialCode = element.find("[name='preferentialCode']");
    var sendVerifyCode = element.find("#sendVerifyCode");
    var verifyCode = element.find("[name='verifyCode']");
    var registeredButton = element.find("#registeredButton");
    var error_msg = element.find("#error-msg");

    var showErrorMsg = function (text) {
        error_msg.show();
        error_msg.text(text);
    };

    var hideErrorMsg = function () {
        error_msg.hide();
        error_msg.text("");
    };

    //验证用户名是否存在
    var usernameValidateFlag = false;
    var lastValidateUsername = "";
    username.blur(function () {
        if (!username.val()) {
            return;
        }
        if (username.val() == lastValidateUsername) {
            return;
        }
        lastValidateUsername = username.val();
        appHttp.get({
            url: "user/validateRegisterUsername.do?username=" + username.val(),
            success: function () {
                usernameValidateFlag = true;
                hideErrorMsg();
            },
            error: function (error) {
                usernameValidateFlag = false;
                showErrorMsg(error.message);
            }
        });
    });

    var verifyFlag = false;
    $(sendVerifyCode).click(function () {
        if (!mobileNo.val()) {
            showErrorMsg("请填写手机号码！");
            return;
        }
        var reg = '^1[0-9]{10}$';
        if (!mobileNo.val().match(reg)) {
            showErrorMsg("手机号码格式错误！");
            return;
        }
        hideErrorMsg();
        verifyFlag = true;
        appHttp.post({
            url: "user/sendRegisterVerifyCode.do?registerType=APP&mobileNo=" + mobileNo.val(),
            relatedButton: this,
            success: function () {
                sendVerifyCode.css("background", "rgba(255, 255, 255, 0.2)");
                sendVerifyCode.attr("disabled", true);
                var num = 60;
                var codeNum = 60 + "s后再发送";
                sendVerifyCode.text(codeNum);
                var start = setInterval(function () {
                    if (num === 1) {
                        clearInterval(start);
                        sendVerifyCode.css("background", "#19AA8D");
                        sendVerifyCode.text("重新发送");
                        sendVerifyCode.attr("disabled", false);
                    } else {
                        num--;
                        var codeText = num + "s后再发送"
                        sendVerifyCode.text(codeText);
                    }
                }, 1000);
            },
            error: function (error) {
                showErrorMsg(error.message);
            }
        });
    });

    registeredButton.click(function () {
        if (!username.val()) {
            showErrorMsg("公司名称为必输项！");
            return;
        }

        if (!usernameValidateFlag) {
            showErrorMsg("该公司名称已被注册！");
            return;
        }

        if (username.val().length > 30) {
            showErrorMsg("公司名称长度不能超过30！");
            return;
        }

        if (!mobileNo.val()) {
            showErrorMsg("手机号为必输项！");
            return;
        }

        if (!verifyCode.val()) {
            showErrorMsg("验证码为必输项！");
            return;
        }

        if (!password.val()) {
            showErrorMsg("密码为为必输项！");
            return;
        }

        if (!(/^[a-zA-Z\d]{6,16}$/.test(password.val()))) {
            showErrorMsg("密码不符合格式，6至16位数之间的数字或字母，无空格！");
            return;
        }

        if (password.val() != confirmPassword.val()) {
            showErrorMsg("两次密码不一致！");
            return;
        }
        appHttp.post({
            url: "user/register.do",
            relatedButton: registeredButton,
            data: {
                username: username.val(),
                mobileNo: mobileNo.val(),
                verifyCode: verifyCode.val(),
                password: md5(password.val()),
                preferentialCode: preferentialCode.val(),
                source: source,
                keyword: keyword
            },
            success: function (data) {
                hideErrorMsg();
                $("#login-html").hide();
                $("#success-html").show();
            },
            error: function (error) {
                showErrorMsg(error.message);
            }
        });
    });

