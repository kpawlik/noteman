var passen = {};

define([
	"bluebird",
	"backbone"
], function (bluebird, bb) {
	Promise = require("bluebird");

	passen.Class = Backbone.Model.extend({
		initialize: function () {
		},

		loadHtml: function (id, html) {
			return new Promise(function (res, rej) {
				$(id).html(html);
				res();
			});
		},
		appendHtml: function (id, html) {
			return new Promise(function (res, rej) {
				$(id).append(html);
				res();
			});
		},
		failed: function (msg) {
			this.showMessage(msg);
		},
		showMessage: function (msg) {
			passen.showMessage(msg);
		},
		confirm: function (message, callback) {
			passen.confirm(message, callback);
		}

	});
	passen.showMessage = function (message) {
		if (!passen.messageDialog) {
			passen.messageDialog = $("<div>").dialog({
				autoOpen: false,
				modal: true,
				buttons: {
					"Close": function () {
						$(this).dialog("close");

					}
				}
			});
		}
		passen.messageDialog.html(message);
		passen.messageDialog.dialog("open");
	}
	passen.confirm = function (message, callback) {
		if (!passen.confirmDialog) {
			passen.confirmDialog = $("<div>").dialog({
				autoOpen: false,
				modal: true

			});
		}
		var buttons = {
			"OK": callback,
			"Cancel": function(){$(this).dialog("close")}
		};
		passen.confirmDialog.html(message);
		passen.confirmDialog.dialog("option", "buttons", buttons);
		passen.confirmDialog.dialog("open");
	}
	return passen;
});