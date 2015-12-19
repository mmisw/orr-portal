(function() {
  'use strict';

  angular.module('orrportal.st', [])
    .controller('SearchTermsController', SearchTermsController)
  ;

  SearchTermsController.$inject = ['$rootScope', '$scope', '$routeParams', '$location', '$http'];

  function SearchTermsController($rootScope, $scope, $routeParams, $location, $http) {
    if (appUtil.debug) console.log("++SearchTermsController++");

    $rootScope.vm.curView = 'st';

    var vm = {st: $routeParams.st};
    $scope.vm = vm;

    doSearch();

    $scope.searchKeyPressed = function($event) {
      if ($event.keyCode == 13) {
        $scope.searchSettingsChanged();
      }
    };

    $scope.searchButtonClicked = function() {
      $scope.searchSettingsChanged();
    };

    $scope.clearSearch = function() {
      vm.st = '';
      $scope.searchSettingsChanged();
    };

    $scope.searchSettingsChanged = function() {
      var stParam = $routeParams.st !== undefined ? $routeParams.st.trim() : '';
      var searchText = vm.st !== undefined ? vm.st.trim() : '';
      if (stParam === searchText) {
        doSearch();
      }
      else {
        var url = "/st/" + searchText;
        $location.url(url);
      }
    };

    function doSearch() {
      vm.error = "";
      vm.results = "";
      vm.gotResults = false;

      if (!vm.st) {
        return;
      }

      vm.searching = true;
      vm.rows = [];

      /*
       * TODO options for 'literal', 'glob', and 'regex' searches
       * and do corresponding internal handling as appropriate.
       * For now escape the given OR operands to avoid any conflicts with
       * regex expression.
       */
      var orOperands = vm.st.split(/\s*\|\s*/);
      //console.log("doSearch: orOperands={" +orOperands+ "}");
      var searchString = _.map(orOperands, function(operand) {
        return appUtil
          .escapeRegex(operand)
          .replace(/\\/g, "\\\\"); // for SPARQL still need to escape \ --> \\
      }).join('|');

      // TODO some paging mechanism

      var query = "SELECT DISTINCT ?subject ?predicate ?object " +
        "WHERE { ?subject ?predicate ?object. " +
        "FILTER regex(str(?object), \"" +searchString+ "\", \"i\" ) } " +
        "ORDER BY ?subject";

      if (appUtil.debug) console.log("doSearch: query={" +query+ "}");

      // un-define the Authorization header for the sparqlEndpoint
      var headers = {Authorization: undefined};
      var url = appConfig.orront.sparqlEndpoint;
      var params = {query: query};
      console.log(appUtil.logTs() + ": GET " + url, params);
      $http.get(appConfig.orront.sparqlEndpoint, {params: params, headers: headers})
        .success(function(data, status, headers, config) {
          console.log(appUtil.logTs() + ": got response: status=", status, "data=", data);
          if (status !== 200) {
            gotResults("Error: " +status+ ": " +data);
            return;
          }

          gotResults(null, data);
        })
        .error(function(data, status, headers, config) {
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
          gotResults(error);
        });
    }

    function gotResults(error, data) {
      vm.gotResults = true;
      vm.searching = false;

      if (error) {
        console.log("error getting query results:", error);
        vm.error = error;
        return;
      }

      var htmlify = true;
      var onlyExternalLink = true;

      vm.colNames = data.names;

      vm.rows = []; // with htmlified or escaped uri's and values
      _.each(data.values, function(row) {
        vm.rows.push(_.map(row, function(value, index) {
          if (index < 2) {
            value = value.replace(/^<|>$/g, '');
          }
          return htmlify
            ? index < 2
              ? appUtil.mklinks4uri(value, true, false)
              : appUtil.htmlifyObject(value, onlyExternalLink)
            : _.escape(value);
        }));
      });
    }
  }

})();
