(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.rj-viewer', ['ui.grid.grouping'])
    .directive('rjDataViewer',  RjDataViewerDirective)
  ;

  RjDataViewerDirective.$inject = [];
  function RjDataViewerDirective() {
    if (debug) console.log("++RjDataViewerDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/ont/rj-viewer.html',
      controller: RjDataViewerController,
      scope: {
        uri:  '=',
        rj:   '=',
        columnDefs: '=',
        items: '='
      }
    }
  }

  RjDataViewerController.$inject = ['$scope'];
  function RjDataViewerController($scope) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.debug("++RjDataViewerController++ $scope=", $scope);

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

    var items = [];
    _.each($scope.rj, function(subjectProps, subjectUri) {
      // do not include the ontology URI itself as a subject:
      if (subjectUri !== $scope.uri) {
        _.each(subjectProps, function (propValues, propUri) {
          _.each(propValues, function (value) {
            items.push({
              subjectUri: subjectUri,
              propUri: propUri,
              value: value.value
            });
          });
        });
      }
    });
    items = _.sortBy(items, function(item) {
      // put the blank nodes last
      return item.subjectUri.startsWith("_:") ? "zzz" : item.subjectUri;
    });

    $scope.items = [];
    appUtil.updateModelArray($scope.items, items,
      function(done) {
        if (done) {
          $scope.$parent.$digest();
          if (debug) console.debug("Done update model array: $scope.items=", $scope.items.length);
        }
        else {
          $scope.$digest();
        }
      },
      300
    );
  }

})();
