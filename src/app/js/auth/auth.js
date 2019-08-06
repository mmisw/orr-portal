(function() {
  'use strict';

  angular.module('orrportal.auth', ['LocalStorageModule', 'angular-jwt'])
    .factory('authService', authService)
    .config(localStorage)
  ;

  authService.$inject = ['$rootScope', '$http', 'localStorageService', 'jwtHelper', 'service'];

  function authService($rootScope, $http, localStorageService, jwtHelper, service) {
    if (appUtil.debug) console.log("++authService++");

    var rvm = $rootScope.rvm;

    var token = localStorageService.get("token");
    //console.debug("authService: token=", token);
    decodeToken();
    if (rvm.accountInfo) {
      refreshUser();
    }

    return {
      signIn:   signIn,
      signOut:  signOut
    };

    function signIn(username, password, gotLogin) {
      var url = appConfig.orront.rest + "/api/v0/user/auth";

      var body = {
        username: username,
        password: password
      };

      console.log(appUtil.logTs() + ": POST " + url);
      $http.post(url, body)
        .then(function({data, status, headers, config}) {
          const res = data;
          //console.debug(appUtil.logTs() + ": user/auth:", res);
          token = res.token;
          loginOk()
        },
          httpErrorHandler(gotLogin)
        );

      function loginOk() {
        localStorageService.set("token", token);
        decodeToken();
        refreshUser(gotLogin);
      }
    }

    function signOut() {
      token = undefined;
      localStorageService.remove("token");
      decodeToken();
      service.setDoRefreshOntologies(true);
      notifyAuthenticateStateChanged();
    }

    function decodeToken() {
      rvm.accountInfo = undefined;

      if (token) {
        var payload = jwtHelper.decodeToken(token);
        //console.debug("authService: token=", token, "payload=", payload);
        rvm.accountInfo = {
          uid:         payload.uid,
          username:    payload.uid,
          firstName:   payload.firstName,
          lastName:    payload.lastName,
          displayName: payload.displayName,
          email:       payload.email,
          phone:       payload.phone,
          token:       token
        };
      }
    }

    function refreshUser(cb) {
      var url = appConfig.orront.rest + "/api/v0/user/" + rvm.accountInfo.uid;
      var params = {
        jwt: token
      };

      if (appUtil.debug) console.log(appUtil.logTs() + ": GET " + url);
      $http.get(url, {
          params: params
        })
        .then(function({data, status, headers, config}) {
          const res = data
          console.debug(appUtil.logTs() + ": gotUser: ", res);
          if (res.error) {
            if (cb) cb(res);
          }
          else {
            rvm.accountInfo.organizations = _.cloneDeep(res.organizations);
            rvm.accountInfo.role = res.role;
            if (cb) cb(null, res);
            service.setDoRefreshOntologies(true);
            notifyAuthenticateStateChanged();
          }
        },
          httpErrorHandler(cb)
        )
    }

    function notifyAuthenticateStateChanged() {
      $rootScope.$broadcast('evtAuthenticateStateChanged', rvm.accountInfo);
    }

    function httpErrorHandler(cb) {
      return function({data, status, headers, config}) {
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

  localStorage.$inject = ['localStorageServiceProvider'];

  function localStorage(localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('orront');
  }
})();
