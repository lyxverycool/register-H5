
 var defaultParams = {
        //这一部分是原生的属性
        type: "",//通过调用get post方法设置 自己设置参数无效
        headers: {
            "Content-Type": "application/json;charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
        },
        contentType: "application/json",
        dataType: "json",
        timeout: 30000,

        //这一部分是我们的功能属性
        success: null,//function(response) 成功事件
        error: null,//function(response) 失败事件
        errorCode: {},//{"999":function(data){}}
        alwaysPrompt: true,//总是提示错误
        relatedButton: "",//相关联的按钮 请求发送时会禁用按钮 直到返回时放开 值是jquery对象 或者Jquery选择器
        relatedButtonText: "请求中...",//在请求发送中显示的文字
        relatedOther: [],//相关联的其他控件 请求过程中会设置disabled属性
        filterData: []//过滤掉data中不需要的key
    };
    var timeoutAlert = false;
    var authError = false;
    var http = function (params, method) {
        params = $.extend(true, {}, defaultParams, params);
        params.type = method;

        if (!params.url) {
            alert("url不能为空！");
            return;
        }
        if (params.url.indexOf(MyConstant.BASE_URL) < 0) {
            params.url = MyConstant.BASE_URL + (params.url.charAt(0) == "/" ? params.url : "/" + params.url);
        }
        var resetButton;
        if (params.relatedButton || params.relatedOther) {
            var relatedButton = null;
            if (params.relatedButton) {
                relatedButton = $(params.relatedButton);

                var oldButtonText;
                if (params.relatedButtonText) {
                    oldButtonText = relatedButton.html();
                    relatedButton.html(params.relatedButtonText);
                }
                relatedButton.focus();
                relatedButton.attr("disabled", "disabled");
            }

            if (params.relatedOther) {
                for (var i = 0; i < params.relatedOther.length; i++) {
                    $(params.relatedOther[i]).attr("disabled", "disabled");
                }
            }

            resetButton = function () {
                if (params.relatedButton) {
                    relatedButton.removeAttr("disabled");
                    if (params.relatedButtonText) {
                        relatedButton.html(oldButtonText);
                    }
                }
                if (params.relatedOther) {
                    for (var i = 0; i < params.relatedOther.length; i++) {
                        $(params.relatedOther[i]).removeAttr("disabled");
                    }
                }
            };
        }

        if (params.filterData && params.filterData.length > 0) {
            var data = $.extend(true, {}, {}, params.data);
            for (var i = 0; i < params.filterData.length; i++) {
                delete data[params.filterData[i]];
            }
            params.data = data;
        }

        var successCallBack = params.success;
        var errorCallBack = params.error;

        if (params.data) {
            params.data = JSON.stringify(params.data);
        }

        $.ajax($.extend(true, params, {
            success: function (data) {
                resetButton && resetButton();
                successCallBack && successCallBack(data);
            }, error: function (httpRequest, textStatus, errorThrown) {
                var data = httpRequest.responseJSON;
                var statusCode = httpRequest.status;
                if (statusCode == 500) {
                    if (!data) {
                        //tools.alert("您的数据可能存在问题，请联系客服400-806-2822处理。");
                    } else if ((data && !errorCallBack) || params.alwaysPrompt) {
                        if (params.errorCode && params.errorCode[data.code]) {
                            params.errorCode[data.code](data);
                        } else {
                            //tools.alert(data.message);
                        }
                    }
                } else if (statusCode > 500) {
                    //tools.alert("网络异常，请刷新页面！", function () {
                    //    window.location.reload()
                    //});
                    return;
                }
                resetButton && resetButton();
                errorCallBack && errorCallBack(data, httpRequest, textStatus, errorThrown);
            }
        }));
    };

    var get = function (params) {
        http(params, "GET");
    };

    var post = function (params) {
        http(params, "POST");
    };

    return {
        get: get,//查询数据使用
        post: post
    };