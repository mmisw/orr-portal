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
      templateUrl: 'js/ont/views/rj-data-viewer.tpl.html',
      controller: RjDataViewerController,
      scope: {
        uri:  '=',
        rj:   '=',
        triples: '='
      }
    }
  }

  RjDataViewerController.$inject = ['$scope'];
  function RjDataViewerController($scope) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.debug("++RjDataViewerController++ $scope=", $scope);

    var triples = [];
    _.each($scope.rj, function(subjectProps, subjectUri) {
      // do not include the ontology URI itself as a subject:
      if (subjectUri !== $scope.uri) {
        _.each(subjectProps, function (propValues, propUri) {
          _.each(propValues, function (value) {
            triples.push({
              subjectUri: subjectUri,
              propUri: propUri,
              value: value.value
            });
          });
        });
      }
    });
    triples = _.sortBy(triples, "subjectUri");

    $scope.triples = [];
    appUtil.updateModelArray($scope.triples, triples,
      function(done) {
        if (done) {
          $scope.$parent.$digest();
          if (debug) console.debug("Done update model array: $scope.triples=", $scope.triples.length);
        }
        else {
          $scope.$digest();
        }
      },
      300
    );
  }

})();
