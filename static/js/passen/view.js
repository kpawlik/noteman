define([
    "jquery",
    "backbone",
    "passen/base",
    "jquery-ui",
    ,
], function ($, backbone, passen) {
    "use strict";

    passen.View = backbone.View.extend({
        elemID: "",
        getElemID: function () {
            return this.elemID;
        },
        loadHtml: function (html) {
            var elem = this.$el;
            return new Promise(function (res, rej) {
                $(elem).html(html);
                res();
            });
        },
        appendHtml: function(id, html){
			return new Promise(function (res, rej) {
				$(id).append(html);
				res();
			});
		 },
        showMessage: function (msg) {
            passen.showMessage(msg);
        },
        hide: function(){
            this.$el.hide();
        },
        show: function(){
            this.$el.show();
        },
        failed: function(msg){
            this.showMessage(msg);
        },
        confirm: function(message, callback){
            passen.confirm(message, callback);
        }
    });

    return passen.View;
});