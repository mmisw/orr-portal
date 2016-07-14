(function() {
  'use strict';

  var debug = appUtil.debug;
  debug = true;

  angular.module('orrportal.v2r')
    .controller('CsvImportController', CsvImportController)
    .controller('CsvExportController', CsvExportController)
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
        'This action will replace the whole contents of this term set table.' +
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

  CsvExportController.$inject = ['$scope', '$uibModalInstance', '$timeout', 'VAL_SEPARATOR_INSERT', 'info'];
  function CsvExportController($scope, $uibModalInstance, $timeout, VAL_SEPARATOR_INSERT, info) {
    if (debug) console.log("CsvExportController: info=", info);

    var vm = $scope.vm = {
      title:     info.title || 'CSV Export',
      vocab:     info.vocab,
      separator: ',',
      csvString: '',

      separators: [
        { label: 'Comma', value: ',' },
        { label: 'Tab',   value: '\t' },
        { label: 'Vertical bar |', value: '|' }
      ]
    };

    $scope.doCsvExport = function() {
      var header = [""];   // empty first cell
      _.each(vm.vocab.properties, function(property) {
        header.push(property.name || property.uri);
      });

      var data = [];
      _.each(vm.vocab.terms, function(term) {
        var row = [term.name || term.uri];  // term ID is 1s column
        _.each(term.attributes, function(attribute) {
          var values = angular.isArray(attribute) ? attribute : [attribute];
          row.push(values.join(VAL_SEPARATOR_INSERT));
        });
        data.push(row);
      });

      vm.csvString = new CSV(data, {
        cellDelimiter: vm.separator,
        header: header
      }).encode();
    };

    $scope.$watch("vm.csvString", function() {
      vm.copyToClipboardResult = '';
    });

    $scope.csvCopyToClipboard = function(err) {
      vm.copyToClipboardResult = err ?
        "Error trying to automatically copy to clipboard as it seems" +
        " your browser is not supported."
        : "Copied!";
      $timeout(function() {
        vm.copyToClipboardResult = '';
      }, err ? 5000 : 2000);
    };

    $scope.cancelCsvExport = function() {
      $uibModalInstance.dismiss();
    };
  }

})();
