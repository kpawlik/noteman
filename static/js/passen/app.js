define([
    "jquery",
    "backbone",
    "passen/base",
    "text!html/data.html!strip",
    //"text!html/login.html!strip",
    "text!html/dialog.html!strip",
    "text!html/body.html!strip",
    "text!html/tools.html!strip",
    "jquery-ui",
    "passen/export",
    "passen/login",
    "passen/data"
    ,
], function ($, backbone, passen, dataHTML, dialogHTML, bodyHTML, toolsHTML) {
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

        showToolsClick: function () {
            if ($("#toolsMenu").length == 0) {
                this.appendHtml("#body", toolsHTML).then(this.showTools.bind(this));
                this.export = new passen.Export(this.credentials);
            } else {
                this.showTools();
            }

        },
        showTools: function () {
            $("#toolsMenu").show();
            $("#data").hide();
            $("#back").on("click", function () {
                $("#toolsMenu").hide();
                $("#data").show();

            }.bind(this));

            this.importDialog = $("#import-dialog").dialog({
                autoOpen: false,
                modal: true,
                width: "80%",
                height: 600,
                position: { my: "center top", at: "center top", },
                buttons: [
                    {
                        text: "Import",
                        click: function () {
                            var obj = {
                                "name": this.userName,
                                "pswd": this.userPswd,
                                "data": $("#import-value").val()
                            }
                            $.ajax({
                                type: "POST",
                                url: "/import",
                                data: obj,
                                success: function (data) {
                                    if (data.userData === "OK") {
                                        this.importDialog.dialog("close");
                                    } else {
                                        alert(data.error);
                                    }
                                }.bind(this),
                                dataType: "json",
                                error: this.failed.bind(this)
                            });
                        }.bind(this)
                    },
                    {
                        text: "Close",
                        click: function () {
                            $(this).dialog("close");
                        }
                    }
                ]
            });
           $("#import").on("click", function () {
                this.importDialog.dialog("open");
            }.bind(this));
        },
    });

    return passen.Application;
});