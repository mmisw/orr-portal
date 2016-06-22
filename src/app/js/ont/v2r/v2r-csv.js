(function() {
  'use strict';

  var debug = appUtil.debug;
  debug = true;

  angular.module('orrportal.v2r')
    .controller('CsvImportController', CsvImportController)
  ;

  CsvImportController.$inject = ['$scope', '$uibModalInstance', 'info', 'focus', 'utl'];
  function CsvImportController($scope, $uibModalInstance, info, focus, utl) {
    if (debug) console.log("CsvImportController: info=", info);

    var vm = $scope.vm = {
      title:     info.title || 'CSV Import',
      csvString: info.csvString || '',
      separator: ',',

      separators: [
        { label: 'Comma', value: ',' },
        { label: 'Tab',   value: '\t' },
        { label: 'Vertical bar |', value: '|' }
      ]
    };

    focus("inputCsvString_form_activation", 700);

    $scope.csvImportFormOk = function() {
      // TODO actual validation
      return vm.csvString;
    };

    $scope.insertCsvExample = function() {
      var example = [
        ['       ', 'color   ', 'skos:definition  ', 'http://ex/someprop'],
        ['info   ', 'blue    ', 'info message     ', 'abc'],
        ['warn   ', 'yellow  ', 'warning message  ', 'some xy'],
        ['error  ', 'red     ', 'error message    ', 'value z']
      ];
      vm.csvString = _.map(example, function(row) {
        return row.join(vm.separator);
      }).join('\n');
      focus("inputCsvString_form_activation");
    };

    $scope.acceptCsvContents = function() {
      var csv = new CSV(vm.csvString, {
        cellDelimiter: vm.separator,
        header: false,  // we want the array of arrays
        cast:   false
      });
      var csvParsed = csv.parse();
      //console.debug('dispatchCsvImport dialog accepted: csvParsed=', csvParsed);
      utl.confirm({
        message: '<div class="center">' +
        'This action will replace the whole contents of this vocabulary.' +
        '</div>',
        ok: function() {
          $uibModalInstance.close(csvParsed);
        },
        cancelLabel: 'Continue editing CSV contents'
      });

    };

    $scope.cancelCsvImport = function() {
      $uibModalInstance.dismiss();
    };
  }

})();
