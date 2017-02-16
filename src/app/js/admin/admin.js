(function() {
  'use strict';

  angular.module('orrportal.admin', [
    ,'orrportal.admin.users'
    ,'orrportal.admin.orgs'
    ,'orrportal.admin.triplestore'

  ])
    .directive('adminMenu', function() {
      return {
        restrict:    'E',
        templateUrl: 'js/admin/adminmenu.html'
      }
    })
  ;

})();
