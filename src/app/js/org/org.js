(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.org', [])
    .directive('orrOrg',  OrgDirective)
  ;

  OrgDirective.$inject = [];
  function OrgDirective() {
    if (debug) console.log("++OrgDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/org/org.html',
      controller: OrgController
    }
  }

  OrgController.$inject = ['$scope', '$stateParams', 'service'];

  function OrgController($scope, $stateParams, service) {
    if (appUtil.debug) console.log("++OrgController++");

    $scope.orgName = $stateParams.orgName;
    $scope.org = undefined;
    $scope.error = undefined;

    $scope.$on('evtAuthenticateStateChanged', function(evt, masterAuth, user) {
      refreshOrg($scope.orgName, service);
    });

    refreshOrg($scope.orgName, service);

    function refreshOrg(orgName, service) {
      service.refreshOrg(orgName, gotOrg);

      function gotOrg(error, org) {
        if (error) {
          console.log("error getting org:", error);
          $scope.error = error;
        }
        else {
          $scope.org = org;
        }
      }
    }
  }

})();
