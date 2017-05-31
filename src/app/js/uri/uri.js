(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.uri', [])
    .directive('orrUri',  UriDirective)
  ;

  UriDirective.$inject = [];
  function UriDirective() {
    if (debug) console.log("++UriDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/uri/uri.html',
      controller: UriController
    }
  }

  UriController.$inject = ['$rootScope', '$scope', 'service', 'metaUtil'];
  function UriController($rootScope, $scope, service, metaUtil) {

    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++UriController++ $scope=", $scope);

    this.scope = $scope;

    var rvm = $rootScope.rvm;

    var vm = $scope.vm = {
      uri:       rvm.rUri,
      version:   rvm.rVersion,
      resolving: true,
      resolved:  false
    };

    resolveUri();

    function resolveUri() {
      vm.resolving = true;
      vm.resolved = false;
      vm.ontology = vm.term = undefined;

      service.resolveUri(vm.uri, vm.version, gotUriResolution);

      function gotUriResolution(error, uriResolution) {
        vm.resolving = false;
        vm.resolved = true;
        if (error) {
          $scope.error = error;
          console.error("error resolving IRI:", error);
          return;
        }

        if (uriResolution.ontology) {
          vm.ontology = metaUtil.removeDuplicateMetadataAttributes(uriResolution.ontology);
          vm.uri = rvm.rUri = vm.ontology.uri;
          return;
        }

        if (uriResolution.term) {
          if (uriResolution.term.values && uriResolution.term.values.length) {
            vm.term = uriResolution.term;
            _.each(vm.term.values, function (row) {
              row[0] = row[0].replace(/^<|>$/g, '');
              row[1] = appUtil.cleanTripleObject(row[1])
            });
            return;
          }
        }

        var selfHosted = bUtil.uriEqualOrHasPrefixWithSlash(vm.uri, appConfig.orront.rest);
        vm.couldTryExternalResolution = ! selfHosted;
      }
    }
  }

})();
