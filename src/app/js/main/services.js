(function() {
  'use strict';

  angular.module('orrportal.services', [])
    .factory('service', serviceFactory)
  ;

  serviceFactory.$inject = ['$rootScope', '$http'];

  function serviceFactory($rootScope, $http) {
    if (appUtil.debug) console.log("++serviceFactory++");

    var refreshing = false;
    var ontologies = undefined;
    var doRefreshOntologies = false;

    return {
      isRefreshing:  function() { return refreshing; },

      getOntologies:           getOntologies,
      refreshOntologies:       refreshOntologies,
      setDoRefreshOntologies:  setDoRefreshOntologies,

      resolveUri:              resolveUri,

      refreshOntology:         refreshOntology,
      getOntologySubjects:     getOntologySubjects,
      getExternalOntologySubjects: getExternalOntologySubjects,

      getOntologyFormat:       getOntologyFormat,

      refreshOrg:        refreshOrg,
      createOrg:         createOrg,
      updateOrg:         updateOrg,

      registerOntology:  registerOntology,
      unregisterOntology:  unregisterOntology,

      refreshUser:       refreshUser,

      refreshUsers:      refreshUsers,
      refreshOrgs:       refreshOrgs

      ,getTripleStoreSize:  getTripleStoreSize
      ,reloadTripleStore:   reloadTripleStore

      , uploadRemoteUrl:  uploadRemoteUrl
    };

    /**
     * With true, allows to force a refresh of the ontology list if that page is visited.
     */
    function setDoRefreshOntologies(b) {
      if (appUtil.debug) console.log(appUtil.logTs() + ": setDoRefreshOntologies: " + b);
      doRefreshOntologies = b;
    }

    function getOntologies(gotOntologies) {
      if (ontologies && !doRefreshOntologies) {
        gotOntologies(null, ontologies);
      }
      else {
        doRefreshOntologies = false;
        refreshOntologies(gotOntologies);
      }
    }

    function refreshOntologies(gotOntologies) {

      setRefreshing(true);

      var reqPath = "/api/v0/ont/";
      var url = appConfig.orront.rest + reqPath;

      var params = {};

      //if ($rootScope.isPrivilegedSession()) {
      //    params.push(appUtil.getHmacParam("GET," + reqPath));
      //}

      putJwtIfAvailable(params);

      console.log(appUtil.logTs() + ": GET " + url);
      $http({
        method: 'GET',
        url:    url,
        params: params
      })
        .success(function(res, status, headers, config) {
          console.log(appUtil.logTs() + ": gotOntologies: ", res.length);
          setRefreshing(false);
          ontologies = res;
          $rootScope.$broadcast('evtRefreshCompleteOk');
          gotOntologies(null, ontologies);
        })
        .error(httpErrorHandler(gotOntologies))
    }

    function resolveUri(uri, version, gotUriResolution) {
      console.debug("resolveUri: uri=", uri, "version=", version);
      refreshOntology(uri, version, function(error, ontology) {
        if (error) {
          console.debug("resolveUri: error getting ontology:", error, ". Will try term");
          resolveTerm(function(error, term) {
            if (error) {
              gotUriResolution({msg: "resolveUri: error getting term", error: error});
            }
            else {
              gotUriResolution(null, {term: term});
            }
          });
        }
        else {
          gotUriResolution(null, {ontology: ontology});
        }
      });

      function resolveTerm(cb) {
        var params = {
          turi:    uri,
          format: 'json'
        };
        doHttp("resolveTerm", {
          method: 'GET',
          url:    appConfig.orront.rest + "/api/v0/ont",
          params: params
        }, cb)
          .success(function (data) {
            console.log(appUtil.logTs() + ": resolveTerm: data=", data);
            cb(null, data);
          })
      }
    }

    function refreshOntology(uri, version, gotOntology) {

      setRefreshing(true);

      // TODO use doHttp

      var reqPath = "/api/v0/ont";
      var url = appConfig.orront.rest + reqPath;

      var params = {
        format: '!md',
        ouri:   uri
      };
      if (version) {
        params.version = version;
      }

      //if ($rootScope.isPrivilegedSession()) {
      //    params.push(appUtil.getHmacParam("GET," + reqPath));
      //}

      console.log(appUtil.logTs() + ": GET " + url);
      $http({
        method: 'GET',
        url: url,
        params: params
      })
        .success(function(res, status, headers, config) {
          setRefreshing(false);
          //console.log(appUtil.logTs() + ": refreshOntology !md response: ", _.cloneDeep(res));
          if (res.error) {
            gotOntology(res);
          }
          else {
            gotOntology(null, res);
          }
        })
        .error(httpErrorHandler(gotOntology))
    }

    function getOntologySubjects(uri, cb) {
      var params = {
        uri: uri
      };
      doHttp("getOntologySubjects", {
        method: 'GET',
        url:    appConfig.orront.rest + "/api/v0/ont/sbjs",
        params: params
      }, cb)
        .success(function (data) {
          console.log(appUtil.logTs() + ": getOntologySubjects: data=", data);
          cb(null, data);
        })
    }

    function getExternalOntologySubjects(uri, cb) {
      var params = {
        uri: uri
      };
      doHttp("getExternalOntologySubjects", {
        method: 'GET',
        url:    appConfig.orront.rest + "/api/v0/ont/sbjs/external",
        params: params
      }, cb)
        .success(function (data) {
          console.log(appUtil.logTs() + ": getExternalOntologySubjects: data=", data);
          cb(null, data);
        })
    }

    function getOntologyFormat(uri, version, format, gotOntology) {

      setRefreshing(true);

      var reqPath = "/api/v0/ont";
      var url = appConfig.orront.rest + reqPath;

      var params = {
        format: format,
        ouri:   uri
      };
      if (version) {
        params.version = version;
      }

      console.log(appUtil.logTs() + ": GET " + url);
      $http({
        method: 'GET',
        url:    url,
        params: params
      })
        .success(function(res, status, headers, config) {
          setRefreshing(false);
          //console.log(appUtil.logTs() + ": getOntologyFormat " +format+" response: ", _.cloneDeep(res));
          if (res.error) {
            gotOntology(res);
          }
          else {
            gotOntology(null, res);
          }
        })
        .error(httpErrorHandler(gotOntology))
    }

    function refreshOrg(orgName, params, gotOrg) {

      setRefreshing(true);

      var reqPath = "/api/v0/org/" + orgName;
      var url = appConfig.orront.rest + reqPath;

      params = params || {};

      //if ($rootScope.isPrivilegedSession()) {
      //    params.push(appUtil.getHmacParam("GET," + reqPath));
      //}

      putJwtIfAvailable(params);

      console.log(appUtil.logTs() + ": GET " + url);
      $http({
        method: 'GET',
        url:    url,
        params: params
      })
        .success(function(res, status, headers, config) {
          setRefreshing(false);
          console.log(appUtil.logTs() + ": gotOrg: ", res);
          if (res.error) {
            gotOrg(res);
          }
          else {
            gotOrg(null, res);
          }
        })
        .error(httpErrorHandler(gotOrg))
    }

    function createOrg(data, cb) {
      data.members = data.members.split(/\s*,\s*/);
      putJwtIfAvailable(data);

      doHttp("createOrg", {
        method: 'POST',
        url:    appConfig.orront.rest + "/api/v0/org",
        data:   data
      }, cb)
        .success(function (data) {
          console.log(appUtil.logTs() + ": createdOrg: data=", data);
          cb(null, data);
        })
    }

    function updateOrg(orgName, data, cb) {
      putJwtIfAvailable(data);

      doHttp("updateOrg", {
        method: 'PUT',
        url:    appConfig.orront.rest + "/api/v0/org/" + orgName,
        data:   data
      }, cb)
        .success(function (data) {
          console.log(appUtil.logTs() + ": updateOrg: data=", data);
          cb(null, data);
        })
    }

    function registerOntology(brandNew, body, cb) {
      putJwtIfAvailable(body);

      doHttp("registerOntology", {
        method: brandNew ? 'POST' : 'PUT',
        url:    appConfig.orront.rest + "/api/v0/ont",
        data:   body
      }, cb)
        .success(function (data) {
          console.log(appUtil.logTs() + ": registerOntology(brandNew=" +brandNew+ "): data=", data);
          cb(null, data);
        })
    }

    function unregisterOntology(params, cb) {
      putJwtIfAvailable(params);

      doHttp("unregisterOntology", {
        method: 'DELETE',
        url:    appConfig.orront.rest + "/api/v0/ont",
        params: params
      }, cb)
        .success(function (data) {
          console.log(appUtil.logTs() + ": unregisterOntology: data=", data);
          cb(null, data);
        })
    }

    function refreshUser(userName, gotUser) {

      setRefreshing(true);

      var reqPath = "/api/v0/user/" + userName;
      var url = appConfig.orront.rest + reqPath;

      var params = {};

      //if ($rootScope.isPrivilegedSession()) {
      //    params.push(appUtil.getHmacParam("GET," + reqPath));
      //}

      putJwtIfAvailable(params);

      if (appUtil.debug) console.log(appUtil.logTs() + ": GET " + url);
      $http({
        method: 'GET',
        url:    url,
        params: params
      })
        .success(function(res, status, headers, config) {
          setRefreshing(false);
          if (appUtil.debug) console.log(appUtil.logTs() + ": gotUser: ", res);
          if (res.error) {
            gotUser(res);
          }
          else {
            gotUser(null, res);
          }
        })
        .error(httpErrorHandler(gotUser))
    }

    function refreshUsers(cb) {
      var params = {};
      putJwtIfAvailable(params);

      console.debug("$rootScope.rvm.accountInfo", $rootScope.rvm.accountInfo);

      doHttp("refreshUsers", {
        method: 'GET',
        url:    appConfig.orront.rest + "/api/v0/user",
        params: params
      }, cb)
        .success(function (data) {
          //console.log(appUtil.logTs() + ": refreshUsers: data=", data);
          //console.table(data);
          cb(null, data);
        });
    }

    function refreshOrgs(cb) {
      var params = {};
      putJwtIfAvailable(params);

      console.debug("$rootScope.rvm.accountInfo", $rootScope.rvm.accountInfo);

      doHttp("refreshOrgs", {
        method: 'GET',
        url:    appConfig.orront.rest + "/api/v0/org",
        params: params
      }, cb)
        .success(function (data) {
          //console.log(appUtil.logTs() + ": refreshOrgs: data=", data);
          cb(null, data);
        });
    }

    function getTripleStoreSize(uri, cb) {
      var headers = {};
      putJwtIfAvailableInHeader(headers);

      var config = {
        method: 'GET',
        url:    appConfig.orront.rest + "/api/v0/ts",
        headers: headers
      };
      if (uri) {
        config.params = {uri: uri};
      }

      doHttp("getTripleStoreSize", config, cb)
        .success(function (data) {
          console.log(appUtil.logTs() + ": getTripleStoreSize: data=", data);
          cb(null, data);
        })
    }

    function reloadTripleStore(uri, cb) {
      var headers = {};
      putJwtIfAvailableInHeader(headers);

      var config = {
        method: 'PUT',
        url:    appConfig.orront.rest + "/api/v0/ts",
        headers: headers,
        timeout: 5*60*1000
      };
      if (uri) {
        config.params = {uri: uri};
      }

      doHttp("reloadTripleStore", config, cb)
        .success(function (data) {
          console.log(appUtil.logTs() + ": reloadTripleStore: data=", data);
          cb(null, data);
        })
    }

    function uploadRemoteUrl(data, cb) {
      var headers = {};
      putJwtIfAvailableInHeader(headers);

      var config = {
        method:  'POST',
        url:     appConfig.orront.rest + "/api/v0/ont/upload",
        headers: headers,
        data:    data
      };

      console.log(appUtil.logTs() + ": " +"uploadRemoteUrl" + ": " + config.method+ " " + config.url,
        "params=", config.params,
        "data=", config.data
      );

      // note: direct use of $http to handle response in case of error
      // TODO: general revision of http dispatch
      $http(config)
        .success(function (data) {
          console.log(appUtil.logTs() + ": uploadRemoteUrl: data=", data);
          cb(null, data);
        })
        .error(function(data, status, headers, config) {
          var reqMsg = config.method + " '" + config.url + "'";

          console.log("error in request " +reqMsg+ ":",
            "data=", data, "status=", status,
            "config=", config);

          setRefreshing(false);
          if (cb) {
            cb({
              status: status,
              data: data
            })
          }
        })
    }

    function setRefreshing(b) {
      $rootScope.$broadcast('evtRefreshing', b);
      refreshing = b;
    }

    function putJwtIfAvailable(params) {
      if ($rootScope.rvm.accountInfo && $rootScope.rvm.accountInfo.token) {
        params.jwt = $rootScope.rvm.accountInfo.token;
      }
    }

    function putJwtIfAvailableInHeader(headers) {
      if ($rootScope.rvm.accountInfo && $rootScope.rvm.accountInfo.token) {
        var jwt = $rootScope.rvm.accountInfo.token;
        headers['Authorization'] = "Bearer " + jwt;
      }
    }

    function doHttp(operationName, config, cb) {
      console.log(appUtil.logTs() + ": " +operationName + ": " + config.method+ " " + config.url,
        "params=", config.params,
        "data=", config.data
      );

      var http = $http(config);
      http.error(httpErrorHandler(cb));
      return http;
    }

    function httpErrorHandler(cb) {
      return function(data, status, headers, config) {
        var reqMsg = config.method + " '" + config.url + "'";

        console.log("error in request " +reqMsg+ ":",
          "data=", data, "status=", status,
          "config=", config);

        setRefreshing(false);
        if (cb) {
          // data is null upon net::ERR_CONNECTION_REFUSED
          cb(data ? data : {status: status});
          //cb(data ? (data.error || data) : {status: status});
        }
      };
    }
  }

})();
