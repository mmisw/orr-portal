(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.main', ['orrportal.directives', 'orrportal.filters', 'orrportal.services'])
    .directive('orrMain',  MainDirective)

    // TODO remove after alpha testing
    .directive('orrTesting', function() { return { restrict: 'E', templateUrl: 'js/main/testing.html' } })
  ;

  MainDirective.$inject = [];
  function MainDirective() {
    if (debug) console.log("++MainDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/main/main.html',
      controller: MainController
    }
  }

  MainController.$inject = ['$rootScope', '$scope', 'service'];

  function MainController($rootScope, $scope, service) {
    if (appUtil.debug) console.log("++MainController++");

    $rootScope.rvm.curView = 'home';

    $scope.$on('evtAuthenticateStateChanged', function() {
      getOntologies($scope, service);
    });

    $scope.$on('evtRefresh', function() {
      console.log(appUtil.logTs() + ": on gotOntologies");
      getOntologies($scope, service);
    });

    // TODO still improved "refresh" logic is needed
    getOntologies($scope, service);
  }

  function getOntologies($scope, service) {
    service.refreshOntologies(function(error, ontologies) {
      if (error) {
        console.log(appUtil.logTs() + ": error getting ontologies:", error);
      }
      else {
        $scope.$broadcast('evtGotOntologies', ontologies);
      }
    });
  }

})();
