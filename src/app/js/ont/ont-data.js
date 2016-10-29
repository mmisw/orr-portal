(function() {
  'use strict';

  var debug = appUtil.debug;

  angular.module('orrportal.ont.contents')
    .directive('ontData',     OntDataDirective)
  ;

  OntDataDirective.$inject = [];
  function OntDataDirective() {
    if (debug) console.log("++OntDataDirective++");
    return {
      restrict:  'E',
      templateUrl: 'js/ont/ont-data.html',
      controller: OntDataController,
      scope: {
        uri:           '=',
        ontData:       '=',
        ontDataFormat: '=',
        editMode:      '='
      }
    }
  }

  OntDataController.$inject = ['$scope', 'cfg'];
  function OntDataController($scope, cfg) {
    $scope.debug = debug = debug || $scope.debug;
    if (debug) console.log("++OntDataController++ $scope=", $scope);

    $scope.vm = {
      regularOntViewMode: 'rj-data-viewer',
      externalOntViewers: _.map(cfg.externalTools && cfg.externalTools.ontViewers, function(x) {
        return {
          label: x.name,
          srcUrl: x.srcUrlTemplate.replace('$uri', $scope.uri),
          tooltip: '<i>' + x.name+ '</i>: ' + x.title + ' (' +
             '<a target="_blank" href="' + x.moreInfoUrl+ '"' +
          '         >more info</a>)'
        }
      })
    };
  }

})();
