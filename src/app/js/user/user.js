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
  UserController.$inject = ['$rootScope', '$scope', '$stateParams', 'service'];

  function UserController($rootScope, $scope, $stateParams, service) {
    if (appUtil.debug) console.log("++UserController++");

    $rootScope.rvm.curView = 'user';

    $scope.userName = $stateParams.userName;

    $scope.$on('evtAuthenticateStateChanged', function() {
      refreshUser();
    });

    refreshUser();
    // TODO: avoid multiple requests by actually first getting the actual
    // state of being logged in or not.

    function refreshUser() {
      var params = {withOnts: 'yes'};
      service.refreshUser($scope.userName, params, function gotUser(error, user) {
        if (error) {
          console.error("error getting user:", error);
          $scope.error = error;
        }
        else {
          $scope.user = user;
        }
      });
    }
  }

})();
