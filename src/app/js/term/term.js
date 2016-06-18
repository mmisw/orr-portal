(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.term', [])
    .directive('orrTerm',  TermDirective)
  ;

  TermDirective.$inject = [];
  function TermDirective() {
    if (debug) console.log("++TermDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/term/term.html',
      controller: TermController
    }
  }

  TermController.$inject = ['$scope'];
  function TermController($scope) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++TermController++ $scope=", $scope);
  }

})();
