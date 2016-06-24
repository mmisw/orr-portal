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

  OrgController.$inject = ['$scope', '$stateParams', 'service'];

  function OrgController($scope, $stateParams, service) {
    if (appUtil.debug) console.log("++OrgController++");

    $scope.editMode = false;
    $scope.orgName = $stateParams.orgName;
    $scope.org = undefined;
    $scope.error = undefined;

    $scope.vm = {membersString: ""};

    $scope.orgEditInProgress = false;
    $scope.canEditOrg = function() {
      return true;  // TODO
    };
    $scope.startOrgEdit = function() {
      $scope.editMode = true;
    };
    $scope.updateOrg = function() {
      var membersArray = _.map($scope.vm.membersString.split(","), function(m) {
        return m.trim();
      });
      service.updateOrg($scope.orgName, $scope.org.name, membersArray, cb);

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

    $scope.$on('evtAuthenticateStateChanged', function(evt, masterAuth, user) {
      refreshOrg();
    });

    refreshOrg();

    function refreshOrg() {
      service.refreshOrg($scope.orgName, function(error, org) {
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
