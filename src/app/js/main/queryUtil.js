(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.services')
    .factory('queryUtil', queryUtilFactory)
  ;

  queryUtilFactory.$inject = ['$http', 'cfg'];

  function queryUtilFactory($http, cfg) {
    if (debug) console.log("++queryUtilFactory++");

    return {
      getPropValueOptions: getPropValueOptions,
      doQuery:             doQuery
    };

    function getPropValueOptions(propUri, propValueSelection, cb) {
      if (debug) console.debug("getPropValueOptions: propUri=", propUri, "propValueSelection=", propValueSelection);

      var clazz = propValueSelection.class;
      var query =
        "select distinct ?instanceUri\n" +
        "where {\n" +
        " ?instanceUri a <" +clazz+ ">.\n" +
        "}\n" +
        "order by ?instanceUri";

      var sparqlEndpoint = propValueSelection.sparqlEndpoint || cfg.orront.sparqlEndpoint;

      doQuery(sparqlEndpoint, query, function(error, data) {
        if (error) cb(error);
        else {
          // TODO for now, array with the instance URIs
          var result = _.map(data.values, function(array) {
            //console.info("array=", array);
            var m = array[0].match(/^<([^>]*)>$/);
            return m ? m[1] : array;
          });
          //console.debug("result=", result);
          cb(null, result);
        }
      });
    }

    function doQuery(sparqlEndpoint, query, cb) {
      if (debug) console.debug("doSearch: sparqlEndpoint=", sparqlEndpoint, "query={" +query+ "}");

      // un-define the Authorization header for the sparqlEndpoint
      var headers = {Authorization: undefined};
      var url = sparqlEndpoint;
      var params = {query: query};
      if (debug) console.log("GET " + url, params);
      $http.get(sparqlEndpoint, {params: params, headers: headers})
        .then(function({data, status, headers, config}) {
          if (debug) console.log("got response: status=", status, "data=", data);
          if (status !== 200) {
            cb("Error: " +status+ ": " +data);
            return;
          }

          cb(null, data);
        }, function({data, status, headers, config}) {
          var reqMsg = config.method + " '" + config.url + "'";
          var error = "[" + appUtil.logTs() + "] ";
          console.log("error in request " +reqMsg+ ":",
            "data=", data, "status=", status,
            "config=", config);
          error += "An error occurred with request: " +
            config.method + " " +config.url+ "\n";
          error += "Response from server:\n";
          error += " data: " + JSON.stringify(data) + "\n";
          error += " status: " + status;
          cb(error);
        });
    }
  }

})();
