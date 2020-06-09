define([
    "jquery",
    "backbone",
    "passen/base",
    "text!html/dialog.html!strip",
    "passen/view",
    "jquery-ui",
    ,
], function ($, backbone, passen) {
    "use strict";
    passen.Export = passen.View.extend({
        html: '<div id="export-dialog"><div id="export-back">Back></div><textarea id="export-value"></textarea></div>',
        
        initialize: function(credentials){
            this.credentials = credentials;
            $("body").append($("<div>",{id:"export"}));
            passen.View.prototype.initialize.call({el:"export"});
            this.$el.html(this.html);
            this.handlers();
            
        },
        handlers: function(){
            $("#export").on("click", function () {
                $("#body").children().hide();
                $("#export-dialog").show();
                $.ajax({
                    type: "POST",
                    url: "/export",
                    data: this.credentials,
                    success: function (data) {
                        //this.dialog.dialog("open");
                        $("#export-value").val(data.userData);
                    }.bind(this),
                    dataType: "json",
                    error: this.failed.bind(this)
                });
            }.bind(this));
            $("#export-back").on("click", function(){
                $("#body").children().hide();
                $("#tools").show();
            })
        }

    });
    return passen.Export;
});