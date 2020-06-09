define([
    "jquery",
    "backbone",
    "passen/base",
    "text!html/login.html!strip",
    "passen/view",
    "jquery-ui",
    ,
], function ($, backbone, passen, loginHtml) {
    "use strict";
    passen.LoginView = passen.View.extend({

        initialize: function (options) {
            this.successCallback = options.loginSuccess;
            this.credentials = null;
            this.hide();
        },
        render: function () {
            this.loadHtml(loginHtml).then(this._render.bind(this));
        },
        _render: function(){
            $("#login-button").button().click(this.loginClick.bind(this));
            $("#login-form").submit(function (event) {
                event.preventDefault();
                this.loginClick.bind(this);
            }.bind(this));
            this.show();
        },
        getUser: function(){
            return this.credentials;
        },
          /**
         * Callback for Login button click
         */
        loginClick: function () {
            this.userName = $("#name").val().toLowerCase();
            this.userPswd = $("#pswd").val();
            if (!this.userName || !this.userPswd) {
                return;
            }
            var obj = {
                name: this.userName,
                pswd: this.userPswd
            }
            $.ajax({
                type: "POST",
                url: "/data?" + new Date().getUTCMilliseconds(),
                data: obj,
                success: this.loginSuccess.bind(this),
                dataType: "json",
                error: this.failed.bind(this)
            });
            this.credentials = obj;
        },
        loginSuccess: function(data){
            this.successCallback(this.credentials, data);
        },
        

    });
    return passen.LoginView;
});