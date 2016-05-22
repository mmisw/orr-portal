(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.admin.orgs', [])
    .directive('adminOrgs', OrgsDirective)
  ;

  OrgsDirective.$inject = [];
  function OrgsDirective() {
    if (debug) console.log("++OrgsDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/admin/orgs.tpl.html',
      controller: OrgsController
    }
  }

  OrgsController.$inject = ['$rootScope', '$scope', '$location', 'service'];
  function OrgsController($rootScope, $scope, $location, service) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.debug("++OrgsController++ $scope=", $scope);

    if (!$rootScope.userLoggedInIsAdmin()) {
      $location.url("/");
      return;
    }

    $scope.someColumnDefs = [
      {
        field: 'orgName',
        displayName: 'orgName',
        width: 150,
        cellTemplate: '<div class="ui-grid-cell-contents">' +
          '<span ng-bind-html="row.entity[col.field] | mkOrgLink"></span>'
          + '</div>'
      },
      {
        field: 'name'
      },
      {
        field: 'members',
        cellTemplate: '<div class="ui-grid-cell-contents">' +
          '<span ng-bind-html="row.entity[col.field] | mkUserLink"></span>'
          + '</div>'
      }
    ];

    getOrgs();

    function getOrgs() {
      service.refreshOrgs(function(error, data) {
        $scope.orgs = data;
      })
    }
  }

})();
