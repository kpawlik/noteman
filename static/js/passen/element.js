define([
    "jquery",
    "backbone",
    "passen/base",
    "passen/view",
    "jquery-ui",
    ,
], function ($, backbone, passen) {
    "use strict";
    passen.ElementView = passen.View.extend({
        htmlArr: ['<div id="element-entry">',
            '<div class="buttons"><button id="element-entry-bt-ok" class="topBtn" >OK</button>',
            '<button id="element-entry-bt-cancel" class="topBtn">Cancel</button></div>',
            '<input type="text" id="element-entry-key"/>',
            '<textarea id="element-entry-value"></textarea>',
            '</div>'],
        events: {
            "click #element-entry-bt-ok": "okClick",
            "click #element-entry-bt-cancel": "cancelClick"
        },
        initialize: function (options) {
            this.credentials = options.user;
            this.okCallback = options.okCallback;
            this.cancelCallback = options.cancelCallback;
            this.hide();
            this.render();
        },
        render: function () {
            this.loadHtml(this.htmlArr.join("")).then(function () {
                $("#element-entry-bt-ok").button();
                $("#element-entry-bt-cancel").button();
            });
        },
        okClick: function () {
            var key = $("#element-entry-key").val(),
                value = $("#element-entry-value").val();
            this.okCallback(key, value, this.rowIndex);
        },
        setData: function (key, value, rowIndex) {
            this.rowIndex = rowIndex;
            $("#element-entry-key").val(key);
            $("#element-entry-value").val(value);
        },
        cancelClick: function () {
            this.cancelCallback();
        }
    });
    return passen.ElementView
});