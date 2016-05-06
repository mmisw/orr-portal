(function() {
  'use strict';

  angular.module('orrportal.org', [])
    .controller('OrgController', OrgController)
    .controller('CreateOrgController', CreateOrgController)
  ;

  OrgController.$inject = ['$scope', '$stateParams', 'service'];

  function OrgController($scope, $stateParams, service) {
    if (appUtil.debug) console.log("++OrgController++");

    $scope.orgName = $stateParams.orgName;
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

  CreateOrgController.$inject = ['$rootScope', '$scope', '$location', '$timeout', 'service'];

  function CreateOrgController($rootScope, $scope, $location, $timeout, service) {
    if (appUtil.debug) console.log("++CreateOrgController++");

    if (!$rootScope.userLoggedInIsAdmin()) {
      $location.url("/");
      return;
    }

    var vm = $scope.vm = {
      orgName: '',
      name:    '',
      members: ''
    };

    $scope.$watch("vm.orgName", function(val) {
      vm.orgName = val.replace(/^[_\.-]+/, "").replace(/[^a-z0-9_\.-]/gi, "").toLowerCase();
    });

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
