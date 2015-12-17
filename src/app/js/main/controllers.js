(function() {
  'use strict';

  angular.module('orrportal.main', ['orrportal.directives', 'orrportal.filters', 'orrportal.services'])

    .controller('MainController', MainController)
  ;

  MainController.$inject = ['$rootScope', '$scope', 'service'];

  function MainController($rootScope, $scope, service) {
    if (appUtil.debug) console.log("++MainController++");

    $rootScope.vm.curView = '';

    $scope.$on('evtRefresh', function() {
      console.log(appUtil.logTs() + ": on gotOntologies");
      getOntologies($scope, service, true);
    });
    getOntologies($scope, service, false);
  }

  function getOntologies($scope, service, refresh) {
    //console.log(appUtil.logTs() + ": getOntologies:");
    if (refresh) {
      service.refreshOntologies(gotOntologies);
    }
    else {
      service.getOntologies(gotOntologies);
    }

    function gotOntologies(error, ontologies) {
      if (error) {
        console.log(appUtil.logTs() + ": error getting ontologies:", error);
        return;
      }
      //console.log(appUtil.logTs() + ": $broadcast ontologies");
      $scope.$broadcast('evtGotOntologies', ontologies);
    }
  }

})();
