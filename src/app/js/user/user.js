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
  UserController.$inject = ['$scope', '$stateParams'];

  function UserController($scope, $stateParams) {
    if (appUtil.debug) console.log("++UserController++");

    $scope.userName = $stateParams.userName;

    $scope.$on('evtAuthenticateStateChanged', function(evt, masterAuth, user) {
      //console.debug('$on evtAuthenticateStateChanged: masterAuth=', masterAuth);
      $scope.user = user;
    });
  }

})();
