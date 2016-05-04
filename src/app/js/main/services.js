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
    var orgs = undefined;
    var doRefreshOntologies = false;

    return {
      isRefreshing:  function() { return refreshing; },

      getOntologies:     getOntologies,
      refreshOntologies: refreshOntologies,
      setDoRefreshOntologies: setDoRefreshOntologies,

      refreshOntology:   refreshOntology,
      refreshOntologyMetadata: refreshOntologyMetadata,

      getOntologyFormat:   getOntologyFormat,

      getOrgs:           getOrgs,
      refreshOrg:        refreshOrg,
      createOrg:         createOrg,

      registerOntology:  registerOntology,

      refreshUser:       refreshUser
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

      var params = [];

      //if ($rootScope.isPrivilegedSession()) {
      //    params.push(appUtil.getHmacParam("GET," + reqPath));
      //}

      addJwtIfAvailable(params);

      if (params.length > 0) {
        url += "?" + params.join('&');
      }

      console.log(appUtil.logTs() + ": GET " + url);
      $http.get(url)
        .success(function(res, status, headers, config) {
          console.log(appUtil.logTs() + ": gotOntologies: ", res.length);
          setRefreshing(false);
          ontologies = res;
          $rootScope.$broadcast('evtRefreshCompleteOk');
          _.each(ontologies, adjustOntology);
          gotOntologies(null, ontologies);
        })
        .error(httpErrorHandler(gotOntologies))
    }

    function refreshOntology(uri, gotOntology) {

      setRefreshing(true);

      var reqPath = "/api/v0/ont";
      var url = appConfig.orront.rest + reqPath;

      var params = ['format=!md', 'uri=' +uri];

      //if ($rootScope.isPrivilegedSession()) {
      //    params.push(appUtil.getHmacParam("GET," + reqPath));
      //}

      if (params.length > 0) {
        url += "?" + params.join('&');
      }

      console.log(appUtil.logTs() + ": GET " + url);
      $http.get(url)
        .success(function(res, status, headers, config) {
          setRefreshing(false);
          console.log(appUtil.logTs() + ": gotOntology: ", _.cloneDeep(res));
          if (res.error) {
            gotOntology(res);
          }
          else {
            gotOntology(null, adjustOntology(res));
          }
        })
        .error(httpErrorHandler(gotOntology))
    }

    /**
     * Ad hoc adjustments while backend service provides the appropriate values
     * for the adjusted fields here.
     */
    function adjustOntology(ont) {
      if (!ont.status) {
        var orgName = ont.orgName || '';
        if (orgName === "testing" || orgName === "mmitest" ||
          orgName === "odm2test" ||
          orgName.endsWith("_test") || orgName.startsWith("test_")) {
          ont.status = "testing";
        }
        //else: better leave blank here, as there should be way for users (at submission time)
        // or the admin (with whatever mechanism) to explicitly indicate "stable", "experimental", etc.
      }
      return ont;
    }

    function refreshOntologyMetadata(uri, gotOntologyMetadata) {

      setRefreshing(true);

      var query = 'select distinct ?predicate ?value\n' +
        'where { <' + uri + '> ?predicate ?value. }\n' +
        'order by ?predicate';

      // un-define the Authorization header for the sparqlEndpoint
      var headers = {Authorization: undefined};
      var url = appConfig.orront.sparqlEndpoint;
      var params = {query: query};
      console.log(appUtil.logTs() + ": GET " + url, params);
      $http.get(appConfig.orront.sparqlEndpoint, {params: params, headers: headers})
        .success(function(data, status, headers, config) {
          setRefreshing(false);
          console.log(appUtil.logTs() + ": got metadata: ", data);
          if (data.error) {
            gotOntologyMetadata(data);
            return;
          }

          var rows = data.values;

          var predicates = {};
          _.each(rows, function(e) {
            var predicate = e[0];
            var value     = e[1];

            if (!predicates.hasOwnProperty(predicate)) {
              predicates[predicate] = [];
            }
            predicates[predicate].push(value);
          });

          gotOntologyMetadata(null, predicates);
        })
        .error(httpErrorHandler(gotOntologyMetadata));
    }

    function getOntologyFormat(uri, format, gotOntology) {

      setRefreshing(true);

      var reqPath = "/api/v0/ont";
      var url = appConfig.orront.rest + reqPath;

      var params = ['format=' +format, 'uri=' +uri];

      if (params.length > 0) {
        url += "?" + params.join('&');
      }

      console.log(appUtil.logTs() + ": GET " + url);
      $http.get(url)
        .success(function(res, status, headers, config) {
          setRefreshing(false);
          console.log(appUtil.logTs() + ": gotOntology: ", _.cloneDeep(res));
          if (res.error) {
            gotOntology(res);
          }
          else {
            gotOntology(null, res);
          }
        })
        .error(httpErrorHandler(gotOntology))
    }

    function getOrgs(gotOrgs) {
      if (orgs) {
        gotOrgs(null, orgs);
      }
      else if (ontologies) {
        orgs = _.uniq(_.map(ontologies, "orgName"));
        gotOrgs(null, orgs);
      }
      else {
        // todo: more intelligent resolution
        gotOrgs("get ontologies first");
      }
    }

    function refreshOrg(orgName, gotOrg) {

      setRefreshing(true);

      var reqPath = "/api/v0/org/" + orgName;
      var url = appConfig.orront.rest + reqPath;

      var params = [];

      //if ($rootScope.isPrivilegedSession()) {
      //    params.push(appUtil.getHmacParam("GET," + reqPath));
      //}

      addJwtIfAvailable(params);

      if (params.length > 0) {
        url += "?" + params.join('&');
      }

      console.log(appUtil.logTs() + ": GET " + url);
      $http.get(url)
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

    function createOrg(orgName, name, members, cb) {
      members = members.split(/\s*,\s*/);
      var data = {
        orgName:  orgName,
        name:     name,
        members:  members
      };
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

    function registerOntology(brandNew, params, cb) {
      putJwtIfAvailable(params);

      doHttp("registerOntology", {
        method: brandNew ? 'POST' : 'PUT',
        url:    appConfig.orront.rest + "/api/v0/ont",
        params: params
      }, cb)
        .success(function (data) {
          console.log(appUtil.logTs() + ": registerOntology(brandNew=" +brandNew+ "): data=", data);
          cb(null, data);
        })
    }

    function refreshUser(userName, gotUser) {

      setRefreshing(true);

      var reqPath = "/api/v0/user/" + userName;
      var url = appConfig.orront.rest + reqPath;

      var params = [];

      //if ($rootScope.isPrivilegedSession()) {
      //    params.push(appUtil.getHmacParam("GET," + reqPath));
      //}

      addJwtIfAvailable(params);

      if (params.length > 0) {
        url += "?" + params.join('&');
      }

      if (appUtil.debug) console.log(appUtil.logTs() + ": GET " + url);
      $http.get(url)
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

    function setRefreshing(b) {
      $rootScope.$broadcast('evtRefreshing', b);
      refreshing = b;
    }

    function addJwtIfAvailable(params) {
      //console.log("refreshOrg: masterAuth.authData=", $rootScope.rvm.masterAuth.authData);
      if ($rootScope.rvm.masterAuth.authData && $rootScope.rvm.masterAuth.authData.token) {
        params.push("jwt=" + $rootScope.rvm.masterAuth.authData.token);
      }
    }
    function putJwtIfAvailable(params) {
      if ($rootScope.rvm.masterAuth.authData && $rootScope.rvm.masterAuth.authData.token) {
        params.jwt = $rootScope.rvm.masterAuth.authData.token;
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

        var error = "[" + appUtil.logTs() + "] ";

        console.log("error in request " +reqMsg+ ":",
          "data=", data, "status=", status,
          "config=", config);
        error += "An error occurred with request: " +
          config.method + " " +config.url+ "<br/>";
        error += "Response from server:<br/>";
        error += '<table class="orrportal-error">';
        error += "<tr><td>data:</td><td>" + JSON.stringify(data)+ "</td></tr>";
        error += "<tr><td>status:</td><td>" + status+ "</td></tr>";
        error += "</table>";

        setRefreshing(false);
        $rootScope.$broadcast('evtRefreshCompleteError', error);
        if (cb) {
          // data is null upon net::ERR_CONNECTION_REFUSED
          cb(data ? (data.error || data) : {status: status});
        }
      };
    }
  }

})();
