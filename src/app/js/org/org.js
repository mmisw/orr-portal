(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.org', [])
    .directive('orrOrg',      OrgDirective)
    .directive('orrOrgView',  OrgViewDirective)
    .directive('orrOrgEdit',  OrgEditDirective)
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

  OrgController.$inject = ['$rootScope', '$scope', '$stateParams', 'service'];

  function OrgController($rootScope, $scope, $stateParams, service) {
    $scope.debug = debug;
    if (appUtil.debug) console.log("++OrgController++");

    $rootScope.rvm.curView = 'org';

    $scope.editMode = false;
    $scope.orgName = $stateParams.orgName;
    $scope.org = undefined;
    $scope.error = undefined;

    $scope.vm = {membersString: ""};

    $scope.orgEditInProgress = false;
    $scope.canEditOrg = function() {
      if ($rootScope.userLoggedInIsAdmin()) return true;
      if (!$rootScope.rvm.accountInfo) return false;
      if (!$rootScope.rvm.accountInfo.organizations) return false;
      var userOrgs = _.map($rootScope.rvm.accountInfo.organizations, "orgName");
      return _.includes(userOrgs, $scope.orgName);
    };
    $scope.startOrgEdit = function() {
      $scope.editMode = true;
    };
    $scope.updateOrg = function() {
      var membersArray = _.map($scope.vm.membersString.split(","), function(m) {
        return m.trim();
      });
      var data = {
        name:     $scope.org.name,
        members:  membersArray
      };
      if ($scope.org.url) {
        data.url = $scope.org.url;
      }

      service.updateOrg($scope.orgName, data, cb);

      function cb(error, org) {
        $scope.editMode = false;
        if (error) {
          console.error("error updating org:", error);
          $scope.error = error;
        }
        else {
          console.debug("updated org:", org);
          $scope.org = org;
          refreshOrg();
        }
      }
    };

    $scope.cancelEditOrg = function() {
      // TODO
      $scope.editMode = false;
    };

    $scope.$on('evtAuthenticateStateChanged', function() {
      refreshOrg();
    });

    refreshOrg();

    function refreshOrg() {
      var params = {withOnts: 'yes'};
      service.refreshOrg($scope.orgName, params, function(error, org) {
        if (error) {
          console.log("error getting org:", error);
          $scope.error = error;
        }
        else {
          $scope.org = org;
          $scope.vm.membersString = org.members ? org.members.join(", ") : "";
        }
      });
    }
  }

  function OrgViewDirective() {
    return {
      restrict: 'E',
      templateUrl: 'js/org/org-view.html'
    }
  }

  function OrgEditDirective() {
    return {
      restrict: 'E',
      templateUrl: 'js/org/org-edit.html'
    }
  }

})();
