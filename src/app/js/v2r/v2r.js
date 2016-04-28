(function() {
  'use strict';

  angular.module('orrportal.v2r', ['ui.grid', 'ui.grid.edit', 'ui.grid.cellNav'])

    .controller('V2RController', V2RController)
  ;


  V2RController.$inject = ['$rootScope', '$scope', '$routeParams', 'service'];

  function V2RController($rootScope, $scope, $routeParams, service) {
    if (appUtil.debug) console.log("++V2RController++");

    var vm = $scope.vm = {};
    vm.uri = $rootScope.rvm.rUri || $routeParams.uri;

    service.getOntologyFormat(vm.uri, "v2r", gotOntology);

    function gotOntology(error, data) {
      if (error) {
        console.error(error);
        return;
      }

      console.log("gotOntology: data=", data);
      vm.data = data;
    }

    $scope.singleAttrValue = function(a) {
      if (angular.isString(a))                 return a;
      if (angular.isArray(a) && a.length == 1) return a[0];
    };

    $scope.multipleAttrValues = function(a) {
      if (angular.isArray(a) && a.length > 1) return a;
    }
  }

})();
