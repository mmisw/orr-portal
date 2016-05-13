(function() {
  'use strict';

  angular.module('orrportal.user', [])
    .controller('UserController', UserController)
  ;

  UserController.$inject = ['$rootScope', '$scope', '$stateParams', '$timeout', 'service'];

  function UserController($rootScope, $scope, $stateParams, $timeout, service) {
    if (appUtil.debug) console.log("++UserController++");

    $scope.userName = $stateParams.userName;
    $scope.user = undefined;
    $scope.error = undefined;

    // TODO use ui-router instead of the following hacky logic
    if (!$rootScope.userLoggedIn()) {  // wait for a bit
      $timeout(function() {
        refreshUser();
      }, 2000);
    }
    else refreshUser();

    function refreshUser() {
      service.refreshUser($scope.userName, gotUser);

      function gotUser(error, user) {
        if (error) {
          console.log("error getting user:", error);
          $scope.error = error;
        }
        else {
          //console.debug("gotUser=", user);
          $scope.user = user;
        }
      }
    }
  }

})();
