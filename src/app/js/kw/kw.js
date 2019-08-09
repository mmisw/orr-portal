(function() {
  'use strict';

  angular.module('orrportal.kw', [])
    .directive('keywordSearch',  keywordSearchDirective)
  ;

  keywordSearchDirective.$inject = [];
  function keywordSearchDirective() {
    return {
      restrict: 'E',
      templateUrl: 'js/kw/kw.html',
      controller: KeywordSearchController,
      controllerAs: 'vm',
      scope: {
        kw:  '='
      },
      bindToController: true
    }
  }

  KeywordSearchController.$inject = ['$rootScope', '$scope', '$stateParams', '$location', '$http', 'focus'];

  function KeywordSearchController($rootScope, $scope, $stateParams, $location, $http, focus) {
    if (appUtil.debug) console.log("++KeywordSearchController++");

    $rootScope.rvm.curView = 'kw';

    var vm = {};
    vm.kw = $stateParams.kw ? $stateParams.kw.replace(/\s*,\s*/g, ", ") : '';
    $scope.vm = vm;
    $scope.items = [];

    var mkUriLinkCellTemplate =
      '<div class="ui-grid-cell-contents">' +
      '<span ng-bind-html="row.entity[col.field] | mklink4uriWithSelfHostPrefix"></span>'
      + '</div>';

    var mkLinksCellTemplate =
      '<div class="ui-grid-cell-contents">' +
      '<span ng-bind-html="row.entity[col.field] | mklinks"></span>'
      + '</div>';

    $scope.columnDefs = [
      {
        field: 'subjectUri',
        displayName: 'Ontology',
        cellTemplate: mkUriLinkCellTemplate
      },
      {
        field: 'name',
        displayName: 'Name',
        cellTemplate: mkLinksCellTemplate
      }
    ];

    function pushItem(row) {
      $scope.items.push({
        subjectUri: row[0].replace(/^<|>$/g, ''),
        name:       appUtil.cleanTripleObject(row[1])
      });
    }

    focus("kwStringInput_form_activation", 700, {select: true});

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
      vm.kw = '';
      $scope.searchSettingsChanged();
    };

    $scope.searchSettingsChanged = function() {
      var stParam = $stateParams.kw !== undefined ? $stateParams.kw.trim() : '';
      var searchText = vm.kw !== undefined ? vm.kw.trim() : '';
      if (stParam === searchText) {
        doSearch();
      }
      else {
        searchText = searchText.replace(/\s*,\s*/g, ",");
        var url = "/kw/" + searchText;
        $location.url(url);
      }
    };

    $scope.$watch("vm.kw", createQuerySearch);

    function createQuerySearch() {
      vm.querySource = "";
      if (vm.kw) {
        var searchString = vm.kw;

        searchString = bUtil.escapeRegex(searchString)
          .replace(/\\/g, "\\\\") // for SPARQL still need to escape \ --> \\
          .replace(/\s*,\s*/, "|")
          .replace(/"/g, '\\"')
        ;

        // TODO some paging mechanism

        vm.querySource = "prefix omv: <http://omv.ontoware.org/2005/05/ontology#>\n" +
          "select distinct ?subject ?name\n" +
          "where {\n" +
          " ?subject omv:keywords ?kws.\n" +
          " filter regex(str(?kws), \"" +searchString+ "\", \"i\").\n" +
          " ?subject omv:name ?name.\n" +
          "}\n" +
          "order by ?subject";

      }
    }

    function doSearch() {
      vm.error = "";
      vm.results = "";
      vm.gotResults = false;

      if (!vm.kw) {
        return;
      }

      vm.searching = true;

      createQuerySearch();
      var query = vm.querySource;

      if (appUtil.debug) console.log("doSearch: query={" +query+ "}");

      // un-define the Authorization header for the sparqlEndpoint
      var headers = {Authorization: undefined};
      var url = appConfig.orront.sparqlEndpoint;
      var params = {query: query};
      if (appUtil.debug) console.debug(appUtil.logTs() + ": GET " + url, params);
      $http.get(appConfig.orront.sparqlEndpoint, {params: params, headers: headers})
        .then(function(r) {
          var data = r.data
          var status = r.status
          if (appUtil.debug) console.debug(appUtil.logTs() + ": got response: status=", status, "data=", data);
          if (status !== 200) {
            gotResults("Error: " +status+ ": " +data);
            return;
          }

          gotResults(null, data);
        }, function(r) {
          var data = r.data
          var status = r.status
          var config = r.config
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
      vm.gotResults = false;
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
