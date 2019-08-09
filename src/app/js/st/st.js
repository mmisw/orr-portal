(function() {
  'use strict';

  angular.module('orrportal.st', [])
    .directive('termSearch',  TermSearchDirective)
  ;

  TermSearchDirective.$inject = [];
  function TermSearchDirective() {
    return {
      restrict: 'E',
      templateUrl: 'js/st/st.html',
      controller: TermSearchController,
      controllerAs: 'vm',
      scope: {
        st:  '='
      },
      bindToController: true
    }
  }

  TermSearchController.$inject = ['$rootScope', '$scope', '$stateParams', '$location', '$http', 'focus'];

  function TermSearchController($rootScope, $scope, $stateParams, $location, $http, focus) {
    if (appUtil.debug) console.log("++TermSearchController++");

    $rootScope.rvm.curView = 'st';

    var vm = $scope.vm = {
      st: $stateParams.st,

      // TODO actually handle in UI specially in terms of the routes
      includeSPO:  [true, false, true]
    };
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
        displayName: 'Subject',
        cellTemplate: mkUriLinkCellTemplate
      },
      {
        field: 'propUri',
        displayName: 'Predicate',
        cellTemplate: mkUriLinkCellTemplate
      },
      {
        field: 'value',
        displayName: 'Object',
        cellTemplate: mkLinksCellTemplate
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

    $scope.$watch("vm.st", createQuerySearch);
    //$scope.$watchCollection("vm.includeSPO", createQuerySearch);  //not yet

    function createQuerySearch() {
      vm.querySource = "";
      if (vm.st) {
        /*
         * TODO options for 'literal', 'glob', and 'regex' searches
         * and do corresponding internal handling as appropriate.
         * For now escape the given OR operands to avoid any conflicts with
         * regex expression.
         */
        var orOperands = vm.st.split(/\s*\|\s*/);
        //console.log("doSearch: orOperands={" +orOperands+ "}");
        var searchString = _.map(orOperands, function (operand) {
          return bUtil
            .escapeRegex(operand)
            .replace(/\\/g, "\\\\") // for SPARQL still need to escape \ --> \\
            .replace(/"/g, '\\"')
        }).join('|');

        // TODO some paging mechanism

        var ors = [];

        if (vm.includeSPO[0]) {
          var inSimpleName = searchString + '[^/#]*$';
          ors.push('regex(str(?subject), "' + inSimpleName + '", "i")');
        }
        if (vm.includeSPO[1]) {
          ors.push('regex(str(?predicate), "' + searchString + '", "i")');
        }
        if (vm.includeSPO[2]) {
          ors.push('regex(str(?object), "' + searchString + '", "i")');
        }

        if (ors.length) {
          vm.querySource = "select distinct ?subject ?predicate ?object\n" +
            "where {\n" +
            " ?subject ?predicate ?object.\n" +
            " filter (" +ors.join("\n   || ")+ ")\n" +
            "}\n" +
            "order by ?subject"
          ;
        }
      }
    }

    function doSearch() {
      vm.error = "";
      vm.results = "";
      vm.gotResults = false;

      if (!vm.st) {
        return;
      }

      createQuerySearch();
      var query = vm.querySource;
      if (!query) {
        return;
      }

      vm.searching = true;
      $scope.items = [];

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
          console.log(appUtil.logTs() + ": got response: status=", status, "data=", data);
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
