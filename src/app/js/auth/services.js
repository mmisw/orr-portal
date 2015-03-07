(function() {
'use strict';

angular.module('orrportal.auth', [])
    .factory('authService', authServiceFactory)
;

authServiceFactory.$inject = ['$rootScope', '$http'];

function authServiceFactory($rootScope, $http) {
    if (appUtil.debug) console.log("++authServiceFactory++");

    return {
        signIn: signIn
    };

    function signIn(userName, password, gotLogin) {

        console.log("HERE!!!!!");

        var reqPath = "/api/v0/user/chkpw";
        var url = appConfig.orront.rest + reqPath;

        var body = {
            userName: userName,
            password: password
        };

        console.log(appUtil.logTs() + ": GET " + url);
        $http.post(url, body)
            .success(function(res, status, headers, config) {
                console.log(appUtil.logTs() + ": chkpw: ", res);
                gotLogin(null, res);
            })
            .error(httpErrorHandler(gotLogin))
    }

    function httpErrorHandler(cb) {
        return function(data, status, headers, config) {
            var reqMsg = config.method + " '" + config.url + "'";

            var error = "[" + appUtil.logTs() + "] ";

            console.log("error in request " +reqMsg+ ":",
                "data=", data, "status=", status,
                "config=", config);
            error += "An error occured with request: " +
                config.method + " " +config.url+ "<br/>";
            error += "Response from server:<br/>";
            error += '<table class="orrportal-error">';
            error += "<tr><td>data:</td><td>" + JSON.stringify(data)+ "</td></tr>";
            error += "<tr><td>status:</td><td>" + status+ "</td></tr>";
            error += "</table>";

            if (cb) {
                cb(data);
            }
        };
    }
}

})();
