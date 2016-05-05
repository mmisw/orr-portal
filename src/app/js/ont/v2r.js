(function() {
  'use strict';

  var debug = appUtil.debug;

  angular.module('orrportal.v2r', [])
    .directive('v2rDataViewer',  V2rDataViewerDirective)
    .directive('v2rDataEditor',  V2rDataEditorDirective)
  ;

  V2rDataViewerDirective.$inject = [];
  function V2rDataViewerDirective() {
    if (debug) console.log("++V2rDataViewerDirective++");
    return {
      restrict: 'E',
      templateUrl: 'js/ont/views/v2r-data-viewer.tpl.html',
      controller: V2rDataViewerController,
      scope: {
        uri:    '=',
        vocabs: '='
      }
    }
  }

  V2rDataViewerController.$inject = ['$scope', '$window'];
  function V2rDataViewerController($scope, $window) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++V2rDataViewerController++ $scope=", $scope);

    var vm = $scope.vm = {
      uri: $scope.uri
    };

    setCommonMethods($scope, vm);

    // mainly a workaround as the ng-href link in the "text/ng-template"
    // doesn't work for some reason
    $scope.openLink = function(href) {
      $window.open(href, "_blank");
    };
  }

  ///////////////////////////////////////////////////////

  V2rDataEditorDirective.$inject = [];
  function V2rDataEditorDirective() {
    if (debug) console.log("++V2rDataEditorDirective++");

    function link(scope, el, attrs, orrOnt) {
      scope.setEditInProgress = function(inProgress) {
        orrOnt.setDataEditInProgress(inProgress);
      };
      scope.someEditInProgress = function() {
        return orrOnt.someEditInProgress();
      };
    }

    return {
      restrict: 'E',
      require:  '^orrOnt',
      templateUrl: 'js/ont/views/v2r-data-editor.tpl.html',
      controller: V2rDataEditorController,
      link: link,
      scope: {
        uri:    '=',
        vocabs: '='
      }
    };
  }

  V2rDataEditorController.$inject = ['$scope', '$uibModal', '$filter'];
  function V2rDataEditorController($scope, $uibModal, $filter) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++V2rDataEditorController++ $scope=", $scope);

    var vm = $scope.vm = {
      uri: $scope.uri
    };

    setCommonMethods($scope, vm);

    //////////////////////////////////////
    // Class and property editing

    $scope.editVocabClass = function(idModel) {
      return editIdModel("Vocabulary class", idModel);
    };

    $scope.editVocabProperty = function(idModel) {
      return editIdModel("Vocabulary property", idModel);
    };

    function editIdModel(title, idModel) {
      console.log("editId': title=", title, "idModel=", idModel);
      return $uibModal.open({
        templateUrl: 'js/ont/views/v2r-edit-id.tpl.html',
        controller:   V2rEditIdController,
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
    }

    (function prepareColumnMenu() {
      var INS_LEFT  = 'Insert 1 left';
      var INS_RIGHT = 'Insert 1 right';
      var DEL_COL   = 'Delete column';
      $scope.columnMenu = [INS_LEFT, INS_RIGHT, DEL_COL];

      $scope.addProperty = function(vocab) {
        insertProp(vocab, vocab.properties.length);
      };

      $scope.columnOptionSelected = function(vocab, p_index, opt) {
        var property = vocab.properties[p_index];
        console.log("columnOptionSelected: property=", property, "opt=", opt);
        if (opt === INS_LEFT)  insertProp(vocab, p_index);
        if (opt === INS_RIGHT) insertProp(vocab, p_index + 1);
        if (opt === DEL_COL)   deleteProp(vocab, p_index);
      };

      function insertProp(vocab, p_index) {
        console.log("columnOptionSelected: inserting at ", p_index);
        var idModel = {name: '?'};
        $scope.editVocabProperty(idModel).result.then(function() {
          console.log('editIdModel dialog accepted: idModel=', idModel);
          vocab.properties.splice(p_index, 0, idModel);
          _.each(vocab.terms, function(term) {
            term.attributes.splice(p_index, 0, null);
            term._ems.splice(      p_index, 0, getAttrEditModel(null));
          });
        });
      }

      function deleteProp(vocab, p_index) {
        console.log("columnOptionSelected: deleting at ", p_index);
        vocab.properties.splice(p_index, 1);
        _.each(vocab.terms, function(term) {
          term.attributes.splice(p_index, 1);
          term._ems.splice(      p_index, 1);
        });
      }
    })();

    //////////////////////////////////////
    // Term ID editing

    // basic validation
    $scope.checkTermId = function(val) {
      if (!val) return "missing";

      if (val.match(/.*[\s/|?&!,;'\\]+.*/))
        return "invalid characters"
    };

    $scope.removeTerm = function(vocab, index) {
      vocab.terms.splice(index, 1);
    };

    $scope.addTerm = function(vocab) {
      vocab.terms.push({
        name:      "",
        attributes: _.map(vocab.properties, function() { return null })
      });
    };

    //////////////////////////////////////
    // Value cell editing

    $scope.enterCellEditing = function(tableform) {
      if (!$scope.someEditInProgress()) {
        console.log("enterCellEditing");
        $scope.setEditInProgress(true);
        tableform.$show()
      }
    };

    (function prepareAttrModels() {
      _.each($scope.vocabs, function(vocab) {
        _.each(vocab.terms, function(term) {
          term._ems = [];
          _.each(term.attributes, function(attr) {
            term._ems.push(getAttrEditModel(attr));
          });
        });
      });

    })();

    function getAttrEditModel(a) {
      var array = angular.isArray(a) ? a : [a];
      var em = [];
      _.each(array, function(value, i) {
        em.push({
          id:    i,
          value: value
        });
      });
      return em;
    }

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
      $scope.setEditInProgress(false);
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
    $scope.applyCellChanges = function(term, a_index, em) {
      $scope.setEditInProgress(false);
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
        term.attributes[a_index] = result;
      else if (result.length == 1)
        term.attributes[a_index] = result[0];
      else
        term.attributes[a_index] = null;

      // don't let the cell edit model (array) get empty, so
      // user can later still click cell to edit and add a value
      if (em.length === 0) {
        em.push({id: 0, value: null});
      }
      //console.log("applyCellChanges: attributes=", term.attributes, "a_index=", a_index, "em=", em);
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

    $scope.$watch("vm.lname", function(val) {
      // TODO review; this uses some most obvious symbols to avoid
      if (val) vm.lname = val.replace(/[\s/|?&!,;'\\]/gi, "");
    });

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

  function setCommonMethods($scope, vm) {
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

    $scope.singleAttrValue = function(a) {
      if (angular.isString(a))                 return a;
      if (angular.isArray(a) && a.length == 1) return a[0];
    };

    $scope.multipleAttrValues = function(a) {
      if (angular.isArray(a) && a.length > 1) return a;
    };
  }

  function capitalizeFirstLetter(s) {
    if (s) s = s.substr(0, 1).toUpperCase() + s.substr(1);
    return s;
  }

})();
