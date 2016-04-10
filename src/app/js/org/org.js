(function() {
  'use strict';

  angular.module('orrportal.org', [])
    .controller('OrgController', OrgController)
    .controller('CreateOrgController', CreateOrgController)
  ;

  OrgController.$inject = ['$scope', '$routeParams', 'service'];

  function OrgController($scope, $routeParams, service) {
    if (appUtil.debug) console.log("++OrgController++");

    $scope.orgName = $routeParams.orgName;
    $scope.org = undefined;
    $scope.error = undefined;

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

  CreateOrgController.$inject = ['$scope', '$location', '$timeout', 'service'];

  function CreateOrgController($scope, $location, $timeout, service) {
    if (appUtil.debug) console.log("++CreateOrgController++");

    var vm = $scope.vm = {
      orgName: 'org3',
      name:    'organiz 3',
      members: 'admin'
    };

    $scope.okToCreateOrg = function() {
      return vm.orgName && vm.name && vm.members;
    };

    $scope.createOrg = function() {
      vm.status = "creating...";
      vm.working = true;

      service.createOrg(vm.orgName, vm.name, vm.members, createdOrg);

      function createdOrg(error, org) {
        vm.working = false;
        vm.status = vm.error = undefined;
        if (error) {
          console.log("error creating org:", error);
          vm.error = error;
          $timeout(function() {
            vm.error = undefined;
          }, 3000);
        }
        else {
          $location.url("org/" +org.orgName);
        }
      }
    };

  }

})();
