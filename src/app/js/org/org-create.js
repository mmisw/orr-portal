(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.org')
    .directive('orrOrgCreate',  OrgCreateDirective)
  ;

  OrgCreateDirective.$inject = [];
  function OrgCreateDirective() {
    if (debug) console.log("++OrgCreateDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/org/org-create.html',
      controller: OrgCreateController
    }
  }

  OrgCreateController.$inject = ['$rootScope', '$scope', '$location', '$timeout', 'service'];

  function OrgCreateController($rootScope, $scope, $location, $timeout, service) {
    if (appUtil.debug) console.log("++OrgCreateController++");

    if (!$rootScope.userLoggedInIsAdmin()) {
      $location.url("/");
    }

    $scope.$on('evtAuthenticateStateChanged', function(evt, masterAuth, user) {
      if (!$rootScope.userLoggedInIsAdmin()) {
        $location.url("/");
      }
    });

    var vm = $scope.vm = {
      orgName: '',
      name:    '',
      url:     '',
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

      var data = {
        orgName:  vm.orgName,
        name:     vm.name,
        members:  vm.members
      };
      if (vm.url) {
        data.url = vm.url;
      }

      service.createOrg(data, createdOrg);

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
