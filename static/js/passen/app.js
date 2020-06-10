define([
    "jquery",
    "backbone",
    "passen/base",
    "text!html/data.html!strip",
    //"text!html/login.html!strip",
    "text!html/dialog.html!strip",
    "text!html/body.html!strip",
    "jquery-ui",
    "passen/login",
    "passen/data"
    ,
], function ($, backbone, passen, dataHTML, dialogHTML, bodyHTML) {
    "use strict";
    passen.Application = passen.Class.extend({
        initialize: function () {
            passen.Class.prototype.initialize.call(this);
            this.loadHtml("body", bodyHTML).then(this.render.bind(this));
            this.changed = false;
            this.dataArray = [];


        },
        render: function () {
            this.loginView = new passen.LoginView({ loginSuccess: this.loginSuccess.bind(this), el: $("#login-container") });
            this.loginView.render();
            this.dataView = new passen.DataView({ el: $("#data-container") });
        },
        openDialog: function (div) {
            var value = div.data("dataValue"),
                name = div.data("dataName");
            this.currentDiv = div;
            $("#elem-value").val(value);
            $("#elem-name").val(name);
            this.dialog.dialog("open");
        },
        addRowClick: function () {
            var parent = $("#elems");
            var id = parent.children().length + 1;
            var d = this.createRow("", "", id);
            d.data("new", true);
            this.openDialog(d);
        },
        loginSuccess: function (user, data) {
            if (data.error){
                this.showMessage(data.error);
                return;
            }
            this.user = user;
            this.loginView.hide();
            this.dataView.setUser(user);
            this.dataView.render();
            this.dataView.showData(data);
        },

        
    });

    return passen.Application;
});