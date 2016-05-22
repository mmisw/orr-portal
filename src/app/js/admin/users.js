(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.admin.users', [])
    .directive('adminUsers', UsersDirective)
  ;

  UsersDirective.$inject = [];
  function UsersDirective() {
    if (debug) console.log("++UsersDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/admin/users.tpl.html',
      controller: UsersController
    }
  }

  UsersController.$inject = ['$rootScope', '$scope', '$location', 'service'];
  function UsersController($rootScope, $scope, $location, service) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.debug("++UsersController++ $scope=", $scope);

    if (!$rootScope.userLoggedInIsAdmin()) {
      $location.url("/");
      return;
    }

    $scope.someColumnDefs = [
      {
        field: 'userName',
        displayName: 'username',
        width: 150,
        cellTemplate: '<div class="ui-grid-cell-contents">' +
        '<span ng-bind-html="row.entity[col.field] | mkUserLink"></span>'
        + '</div>'
      }
    ];
    getUsers();

    function getUsers() {
      service.refreshUsers(function(error, data) {
        $scope.users = data;
      })
    }
  }

})();
