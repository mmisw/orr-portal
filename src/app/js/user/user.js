(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.user', [])
    .directive('orrUser',  UserDirective)
  ;

  UserDirective.$inject = [];
  function UserDirective() {
    if (debug) console.log("++UserDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/user/user.html',
      controller: UserController
    }
  }
  UserController.$inject = ['$scope', '$stateParams', 'service'];

  function UserController($scope, $stateParams, service) {
    if (appUtil.debug) console.log("++UserController++");

    $scope.userName = $stateParams.userName;

    $scope.$on('evtAuthenticateStateChanged', function(evt, accountInfo) {
      $scope.user = accountInfo;
    });

    service.refreshUser($scope.userName, function gotUser(error, user) {
      if (error) {
        console.error("error getting user:", error);
        $scope.error = error;
      }
      else {
        $scope.user = user;
      }
    });
  }

})();
