(function() {
  'use strict';

  angular.module('orrportal.v2r', ['ui.grid', 'ui.grid.edit', 'ui.grid.cellNav'])

    .directive('orrportalV2rView', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/v2r/views/v2r-view.tpl.html'
      }
    })
    .directive('orrportalV2rEdit', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/v2r/views/v2r-edit.tpl.html'
      }
    })

    .controller('V2RController', V2RController)
    .controller('V2rEditIdController', V2rEditIdController)
  ;


  V2RController.$inject = ['$rootScope', '$scope', '$routeParams', '$window', '$filter', '$uibModal', 'service'];

  function V2RController($rootScope, $scope, $routeParams, $window, $filter, $uibModal, service) {
    if (appUtil.debug) console.log("++V2RController++");

    var vm = $scope.vm = {
      editMode: false,
      someCellBeingEdited: false
    };
    vm.uri = $rootScope.rvm.rUri || $routeParams.uri;

    service.getOntologyFormat(vm.uri, "v2r", gotOntology);

    function gotOntology(error, data) {
      if (error) {
        console.error(error);
        return;
      }

      console.log("gotOntology: data=", data);
      vm.v2r = data;
    }

    $scope.reloadV2r = function() {
      vm.someCellBeingEdited = false;
      vm.editMode = false; //TODO
      service.getOntologyFormat(vm.uri, "v2r", gotOntology);
    };

    $scope.canEditV2r = function() {
      return true; //TODO
    };

    $scope.startEditModeV2r = function() {
      vm.editMode = true; //TODO
    };

    $scope.saveV2r = function() {
      vm.editMode = false; //TODO
    };

    $scope.removeTerm = function(vocab, index) {
      vocab.terms.splice(index, 1);
    };

    $scope.addTerm = function(vocab) {
      vocab.terms.push({
        value:      "",
        attributes: _.map(vocab.properties, function() { return null })
      });
    };

    $scope.getUri = function(e) {
      if (e.uri)   return e.uri;
      if (!vm.uri) return undefined;
      return vm.uri + "/" + e.name;
    };

    $scope.getName = function(e) {
      if (e.name)   return e.name;
      if (e.uri)    return e.uri;
    };

    $scope.getLabel = function(e) {
      if (e.label)  return e.label;
      if (e.name)   return capitalizeFirstLetter(e.name);
      return e.uri;
    };

    function capitalizeFirstLetter(s) {
      if (s) s = s.substr(0, 1).toUpperCase() + s.substr(1);
      return s;
    }

    $scope.singleAttrValue = function(a) {
      if (angular.isString(a))                 return a;
      if (angular.isArray(a) && a.length == 1) return a[0];
    };

    $scope.multipleAttrValues = function(a) {
      if (angular.isArray(a) && a.length > 1) return a;
    };

    // mainly a workaround as the ng-href link in the "text/ng-template"
    // doesn't work for some reason
    $scope.openLink = function(href) {
      $window.open(href, "_blank");
    };


    //////////////////////////////////////
    // Class and property editing

    $scope.editVocabClass = function(idModel) {
      editIdModel("Vocabulary class ID", idModel);
    };

    $scope.editVocabProperty = function(idModel) {
      editIdModel("Vocabulary property ID", idModel);
    };

    function editIdModel(title, idModel) {
      console.log("editId': title=", title, "idModel=", idModel);
      var modalInstance = $uibModal.open({
        templateUrl: 'js/v2r/views/v2r-edit-id.tpl.html',
        controller:  'V2rEditIdController',
        backdrop:    'static',
        resolve: {
          info: function () {
            return {
              title:     title,
              namespace: vm.uri,
              idModel:   idModel
            };
          }
        }
      });
      //modalInstance.result.then(function() {
      //  console.log('editIdModel dialog accepted: idModel=', idModel);
      //});
    }

    //////////////////////////////////////
    // Value cell editing

    $scope.enterCellEditing = function(tableform) {
      if (!vm.someCellBeingEdited) {
        vm.someCellBeingEdited = true;
        tableform.$show()
      }
    };

    $scope.getAttrEditModel = function(a) {
      var array = angular.isArray(a) ? a : [a];
      var em = [];
      _.each(array, function(value, i) {
        em.push({
          id:    i,
          value: value
        });
      });
      return em;
    };

    // filter values to show
    $scope.filterValue = function(valueEntry) {
      return valueEntry.isDeleted !== true;
    };

    // mark valueEntry as deleted
    $scope.deleteValue = function(em, id) {
      var filtered = $filter('filter')(em, {id: id});
      if (filtered.length) {
        filtered[0].isDeleted = true;
      }
    };

    // add valueEntry
    $scope.addValue = function(em) {
      em.push({
        id:    em.length + 1,
        value: '',
        isNew: true
      });
    };

    // cancel all changes
    $scope.cancelCell = function(em) {
      vm.someCellBeingEdited = false;
      for (var i = em.length; i--;) {
        var valueEntry = em[i];
        // undelete
        if (valueEntry.isDeleted) {
          delete valueEntry.isDeleted;
        }
        // remove new
        if (valueEntry.isNew) {
          em.splice(i, 1);
        }
      }
    };

    // transfer the changes to the model
    $scope.applyCellChanges = function(attributes, a_index, em) {
      vm.someCellBeingEdited = false;
      var result = [];

      for (var i = em.length; i--;) {
        var valueEntry = em[i];
        if (valueEntry.isDeleted) {
          em.splice(i, 1);
        }
        // note: empty string "" is regarded as absent value
        else if (valueEntry.value) {
          result.push(valueEntry.value);
        }
        if (valueEntry.isNew) {
          valueEntry.isNew = false;
        }
      }

      if (result.length > 1)
        attributes[a_index] = result;
      else if (result.length == 1)
        attributes[a_index] = result[0];
      else
        attributes[a_index] = null;

      // don't let the cell edit model (array) get empty, so
      // user can later still click cell to edit and add a value
      if (em.length === 0) {
        em.push({id: 0, value: null});
      }
    };
  }

  V2rEditIdController.$inject = ['$scope', '$uibModalInstance', 'info'];
  function V2rEditIdController($scope, $uibModalInstance, info) {
    console.log("V2rEditIdController: info=", info);

    var vm = $scope.vm = {
      title:      info.title,
      namespace:  info.namespace,
      lname:      info.idModel.name,
      uri:        info.idModel.uri,
      idType:     info.idModel.name ? "lname" : "uri"
    };

    $scope.idEditFormOk = function() {
      return vm.idType === 'lname' && vm.lname
          || vm.idType === 'uri' && vm.uri;
    };

    $scope.doneEditId = function() {
      if (vm.idType === 'lname') {
        info.idModel.name = vm.lname;
        delete info.idModel.uri;
      }
      else {
        info.idModel.uri = vm.uri;
        delete info.idModel.name;
      }
      $uibModalInstance.close();
    };

    $scope.cancelEditId = function() {
      $uibModalInstance.dismiss();
    };
  }

})();
