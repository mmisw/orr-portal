(function() {
  'use strict';

  angular.module('orrportal.auth', ['ipCookie', 'base64'])
      .factory('authService', authServiceFactory)
  ;

  authServiceFactory.$inject = ['$rootScope', '$http', '$base64', 'ipCookie'];

  function authServiceFactory($rootScope, $http, $base64, ipCookie) {
    if (appUtil.debug) console.log("++authServiceFactory++");

    return {
      initAuthentication: initAuthentication,

      signIn:   signIn,
      signOut:  signOut,

      isAdmin:  isAdmin
    };

    function initAuthentication() {
      if ($rootScope.loginInfo.auth) {
        // TODO re-validate credentials against the backend. Scenario:
        //   - successful login in a past session;
        //   - then user changed password or simply the previous credentials are no longer valid;
        //   - when coming here in a new session, the cookie makes the logic consider the user
        //     already signed in, but subsequent operations will fail because of the
        //     invalid credentials.
        // If re-validation fails, then invalidate $rootScope.loginInfo;
        // If it succeeds, then the following line is ok:
        $http.defaults.headers.common.Authorization = 'Basic ' + $rootScope.loginInfo.auth;
      }
    }

    function isAdmin() {
      return $rootScope.loginInfo &&
          ($rootScope.loginInfo.userName === "admin" || $rootScope.loginInfo.role === "extra");
    }

    function signIn(vm, gotLogin) {
      var reqPath = "/api/v0/user/auth";
      var url = appConfig.orront.rest + reqPath;

      var body = {
        userName: vm.userName,
        password: vm.password
      };

      console.log(appUtil.logTs() + ": POST " + url);
      $http.post(url, body)
          .success(function(res, status, headers, config) {
            console.log(appUtil.logTs() + ": user/auth:", res);
            doLoginOk(vm, res, gotLogin);
          })
          .error(httpErrorHandler(gotLogin))
    }

    function doLoginOk(vm, res, gotLogin) {
      var auth = $base64.encode(vm.userName + ":" + vm.password);
      $http.defaults.headers.common.Authorization = 'Basic ' + auth;

      $rootScope.loginInfo.userName = vm.userName;
      $rootScope.loginInfo.auth     = auth;

      var ontorr = ipCookie("ontorr") || {};
      if (vm.rememberMe) {
        ontorr.loginInfo = {userName: vm.userName, auth: auth};
        //console.log("ontorr.loginInfo=", ontorr.loginInfo);
      }
      else {
        ontorr.loginInfo = undefined;
      }
      ipCookie("ontorr", ontorr, {expires: 365 /*days*/, path: "/"});

      gotLogin(null, res);
    }

    function signOut() {
      $http.defaults.headers.common.Authorization = '';

      _.forOwn($rootScope.loginInfo, function(val, key) {
        $rootScope.loginInfo[key] = undefined;
      });

      var ontorr = ipCookie("ontorr") || {};
      ontorr.loginInfo = undefined;
      ipCookie("ontorr", ontorr, {expires: 365 /*days*/, path: "/"});
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
