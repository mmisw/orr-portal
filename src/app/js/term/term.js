(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.term', [])
    .directive('orrTerm',  TermDirective)
  ;

  TermDirective.$inject = [];
  function TermDirective() {
    if (debug) console.log("++TermDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/term/term.html',
      controller: TermController
    }
  }

  TermController.$inject = ['$scope'];
  function TermController($scope) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++TermController++ $scope=", $scope);

    $scope.localName = getLocalName($scope.vm.uri);
    $scope.viewAsOptions = setViewAsOptions();

    function setViewAsOptions() {
      var uri = $scope.vm.uri.replace(/#/g, '%23');
      function getUrl(format) {
        return appConfig.orront.rest + "/api/v0/ont?format=" +format+ "&turi=" + uri;
      }

      return [
        {
          label: "RDF/XML",
          url: getUrl('rdf')
        }, {
          label: "JSON",
          url: getUrl('json')
        }, {
          label: "N3",
          url: getUrl('n3')
        }, {
          label: "CSV",
          url: getUrl('csv')
        }, {
          label: "TTL",
          url: getUrl('ttl')
        }, {
          label: "TSV",
          url: getUrl('tsv')
        }, {
          label: "Table",
          url: getUrl('table')
        }, {
          label: "N-Quads",
          url: getUrl('nquads')
        }, {
          label: "Trix",
          url: getUrl('trix')
        }, {
          label: "Integer",
          url: getUrl('integer')
        }
      ];
    }
  }

  function getLocalName(uri) {
    // no trailing slashes:
    var ln = uri ? uri.replace(/\|+$/, '') : '';
    var idx = ln.lastIndexOf('/');
    return ln.substring(idx + 1);
  }

})();
