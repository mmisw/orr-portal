(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.rj-hot-viewer', [])
    .directive('rjHotViewer',  RjHotViewerDirective)
  ;

  RjHotViewerDirective.$inject = [];
  function RjHotViewerDirective() {
    if (debug) console.log("++RjHotViewerDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/ont/rj-hot-viewer.html',
      controller: RjHotViewerController,
      controllerAs: 'vm',
      scope: {
        uri:  '=',
        rj:   '=',
        colHeaders: '=',
        items: '='
      }
      ,bindToController: true
    }
  }

  RjHotViewerController.$inject = [];
  function RjHotViewerController() {
    if (debug) console.debug("++RjHotViewerController++");
    var vm = this;

    vm.colHeaders = ['Subject', 'Predicate', 'Object'];

    var items = [];
    _.each(vm.rj, function(subjectProps, subjectUri) {
      // do not include the ontology URI itself as a subject:
      if (subjectUri !== vm.uri) {
        _.each(subjectProps, function (propValues, propUri) {
          _.each(propValues, function (value) {
            items.push({
              id: items.length,
              subjectUri: subjectUri,
              propUri: propUri,
              value: value.value
            });
          });
        });
      }
    });
    //items.splice(3);
    vm.items = _.sortBy(items, function(item) {
      // put the blank nodes to the end
      return item.subjectUri.startsWith("_:") ? "zzz" : item.subjectUri;
    });

    if (debug) console.debug("Done update model array: vm.items=", vm.items.length);
  }

})();
