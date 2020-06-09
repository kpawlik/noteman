require.config({
	baseUrl: "../../static/js",
	paths: {
        "backbone": "./lib/backbone-min",
		"bluebird": "./lib/bluebird",
		"jquery": "./lib/jquery/jquery-3.2.1.min",
        "jquery-ui": "./lib/jquery/jquery-ui.min",
        "passen-client": "./passen/passen",
        "text": "./lib/text",
        "underscore": "./lib/underscore-min"
	},
    config: {
        text: {
            useXhr: function (url, protocol, hostname, port) {
                "use strict";
                //to handle integration in 3rd party pages CORS is assumed, so always use xhr. 
                //(https://github.com/requirejs/text#xhr-restrictions)
                return true;
            }
        }
    },
    waitSeconds: 0 //Disable script load timeout
});