define([
    "jquery",
    "backbone",
    "passen/base",
    "text!html/data.html!strip",
    "passen/view",
    "passen/element",
    "jquery-ui",
    ,
], function ($, backbone, passen, dataHtml) {
    "use strict";
    passen.DataView = passen.View.extend({

        initialize: function (options) {

            this.user = options.user;
            this.hide();
            this.elementView = new passen.ElementView({
                el: "#element-container",
                okCallback: this.addEditRow.bind(this),
                cancelCallback: this.cancelElement.bind(this)
            });
        },
        setUser: function (user) {
            this.user = user;
        },
        render: function () {
            this.loadHtml(dataHtml).then(this._render.bind(this));
        },
        _render: function () {
            $(".addrow").button().on("click", this.addRow.bind(this));
            $(".save").button().on("click", this.saveData.bind(this));
            $(".clear").button().click(function () {
                if (this.changed){
                    this.confirm("Content was changed. Exit without save?", this.exit.bind(this));
                }else{
                    this.exit()
                }
            }.bind(this));
            var search = $("#search");
            search.on("keypress keyup keydown", function( event ) {
                if ( event.which == 13 ) {
                    event.preventDefault();
                }
                var searchValue = search.val().toLowerCase();
                var elems = $("#data-elements").children();
                for (var i = 0; i < elems.length; i++) {
                    var elem = $(elems[i]);
                    if(!searchValue){
                        elem.show();
                        continue;
                    }
                    var name = elem.data("dataName").toLowerCase();
                    var value = elem.data("dataValue").toLowerCase();
                    if (name.indexOf(searchValue) > -1 || value.indexOf(searchValue) > -1){
                        elem.show();
                    }else{
                        elem.hide();
                    }
                }
            });
            this.$el.show();
        },
        exit: function(){
            window.location.reload();
        },
        sortData: function (data) {
            if (!data) return [];
            return data.sort(function (a, b) {
                return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0)
            });
        },
        showData: function (data) {
            var arr = [];
            if (!data) {
                return;
            }
            if (data.error) {
                alert(data.error);
                return;
            }
            this.changed = false;
            $("#data-elements").html("");
            this.dataArray = this.sortData(data.userData);
            for (var i = 0; i < this.dataArray.length; i++) {
                var obj = this.dataArray[i];
                var d = this.createRow(obj.name, obj.value, i + 1);
                arr.push(d);
            }
            $("#data-elements").append(arr);
            $("#form").hide();
            $("#data").show();

        },
        createRow: function (name, value, index) {
            var elemId = "elem-" + index,
                nameId = "elemName-" + index,
                valueId = "elemValue-" + index,
                d = $('<div>', { id: elemId }),
                nameEl = $('<input>', { id: nameId, value: name, readonly: "readonly" });
            d.data("dataName", name);
            d.data("dataValue", value);
            d.data("index", index);
            nameEl.button().click(function (e) {
                var btn = $(e.target),
                    div = btn.parent(),
                    key = d.data("dataName"),
                    index = d.data("index"),
                    value = d.data("dataValue");
                this.hide();
                this.elementView.setData(key, value, index);
                this.elementView.show();
            }.bind(this));
            d.append(nameEl);
            return d;
        },
        saveData: function () {
            var data = [];
            var elems = $("#data-elements").children();
            for (var i = 0; i < elems.length; i++) {
                var elem = $(elems[i]);
                var name = elem.data("dataName");
                var value = elem.data("dataValue");
                if (name === "") {
                    continue;
                }
                data.push({ name: name, value: value });
            }
            var obj = {
                name: this.user.name,
                pswd: this.user.pswd,
                data: JSON.stringify(data)
            }
            $.ajax({
                type: "POST",
                url: "/save",
                data: obj,
                success: this.dataSaved.bind(this),
                dataType: "json",
                error: this.failed.bind(this)
            });
        },
        dataSaved: function (data) {
            if (data.error) {
                this.showMessage(data.error);
            }
            this.showData(data);
        },
        addEditRow: function (key, value, rowIndex) {
            this.changed = true;
            var elems = $("#data-elements").children();
            if (!rowIndex) {
                if (key === ""){
                    this.showMessage("Add key");
                    return;
                }
                if (_.findIndex(elems, function (obj) { return $(obj).data("dataName") === key }) > -1) {
                    this.showMessage("Key: " + key + " already exists!");
                    return;
                }
                var row = this.createRow(key, value, elems.length + 1);
                $("#data-elements").append(row);
            } else {
                for (var i = 0; i < elems.length; i++) {
                    var elem = $(elems[i]);
                    if (elem.data("index") === rowIndex) {
                        elem.data("dataName", key);
                        elem.data("dataValue", value);
                        if (key === ""){
                            $(elem.children()[0]).css({"text-decoration": "line-through" })
                        }else{
                            $(elem.children()[0]).button({label: key});
                        }
                    }
                }
            }

            this.elementView.hide();
            this.show();
        },
        cancelElement: function () {
            this.elementView.hide();
            this.show();
        },
        addRow: function () {
            this.elementView.setData("", "", null);
            this.elementView.show();
            this.hide();
        }
    });
    return passen.DataView;
});