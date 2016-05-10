(function() {
  'use strict';

  var debug = appUtil.debug;
  debug = true;

  angular.module('orrportal.rj-viewer', [])
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
        rj:   '='
      }
    }
  }

  RjDataViewerController.$inject = ['$scope'];
  function RjDataViewerController($scope) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.debug("++RjDataViewerController++ $scope=", $scope);

    var unorderedSubjects = [];
    _.each($scope.rj, function(subjectProps, subjectUri) {
      // do not include the ontology URI itself as a subject:
      if (subjectUri !== $scope.uri) {
        unorderedSubjects.push({
          uri: subjectUri,
          props: subjectProps
        });
      }
    });
    $scope.subjects = _.sortBy(unorderedSubjects, "uri");

    if (debug) console.debug("++RjDataViewerController++ subjects=", $scope.subjects);
  }

})();
