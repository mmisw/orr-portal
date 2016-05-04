(function() {
  'use strict';

  var debug = appUtil.debug;

  angular.module('orrportal.ont', ['orrportal.ont.contents'])
    .directive('orrOnt',  OntDirective)
  ;

  OntDirective.$inject = [];
  function OntDirective() {
    if (debug) console.log("++OntDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/ont/views/ont.tpl.html',
      controller: OntController
    }
  }

  OntController.$inject = ['$rootScope', '$scope', '$routeParams', '$timeout', '$window', 'service', 'utl'];
  function OntController($rootScope, $scope, $routeParams, $timeout, $window, service, utl) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++OntController++ $scope=", $scope);

    var vm = $scope.vm = {};
    vm.uri = $rootScope.rvm.rUri || $routeParams.uri;

    service.refreshOntology(vm.uri, gotOntology);

    function gotOntology(error, ontology) {
      if (error) {
        $scope.error = error;
        console.error("error getting ontology:", error);
      }
      else {
        vm.ontology = ontology;
        //setViewAsOptions(uri);
        //prepareMetadata()

        getOntologyData();
      }
    }

    function getOntologyData() {
      if (vm.ontology.format === 'v2r') {
        getOntologyDataV2r();
      }
      else {
        vm.data = "(data dispatch not implemented yet for format=" + vm.ontology.format + ")"
      }
    }

    function getOntologyDataV2r() {
      service.getOntologyFormat(vm.uri, "v2r", gotOntologyV2r);

      function gotOntologyV2r(error, data) {
        if (error) {
          $scope.error = error;
          console.error(error);
        }
        else {
          console.log("gotOntologyV2r: data=", data);
          vm.data = data.vocabs;
        }
      }

    }

  }

})();
