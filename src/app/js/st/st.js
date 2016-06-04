(function() {
  'use strict';

  angular.module('orrportal.st', [])
    .controller('SearchTermsController', SearchTermsController)
  ;

  SearchTermsController.$inject = ['$rootScope', '$scope', '$stateParams', '$location', '$http', 'focus'];

  function SearchTermsController($rootScope, $scope, $stateParams, $location, $http, focus) {
    if (appUtil.debug) console.log("++SearchTermsController++");

    $rootScope.rvm.curView = 'st';

    var vm = {st: $stateParams.st};
    $scope.vm = vm;
    $scope.items = [];

    $scope.columnDefs = [
      {
        field: 'subjectUri',
        displayName: 'Subject'
      },
      {
        field: 'propUri',
        displayName: 'Predicate'
      },
      {
        field: 'value',
        displayName: 'Object'
      }
    ];

    function pushItem(row) {
      $scope.items.push({
        subjectUri: row[0].replace(/^<|>$/g, ''),
        propUri:    row[1].replace(/^<|>$/g, ''),
        value:      appUtil.cleanTripleObject(row[2])
      });
    }

    focus("stStringInput_form_activation", 700, {select: true});

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
      var stParam = $stateParams.st !== undefined ? $stateParams.st.trim() : '';
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
      $scope.items = [];

      /*
       * TODO options for 'literal', 'glob', and 'regex' searches
       * and do corresponding internal handling as appropriate.
       * For now escape the given OR operands to avoid any conflicts with
       * regex expression.
       */
      var orOperands = vm.st.split(/\s*\|\s*/);
      //console.log("doSearch: orOperands={" +orOperands+ "}");
      var searchString = _.map(orOperands, function(operand) {
        return bUtil
          .escapeRegex(operand)
          .replace(/\\/g, "\\\\"); // for SPARQL still need to escape \ --> \\
      }).join('|');

      // TODO some paging mechanism

      var query = "select distinct ?subject ?predicate ?object\n" +
        "where {\n" +
        " ?subject ?predicate ?object.\n" +
        " filter regex(str(?object), \"" +searchString+ "\", \"i\")\n" +
        "}\n" +
        "order by ?subject";

      vm.querySource = query;

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

      _.each(data.values, pushItem);
    }
  }

})();
