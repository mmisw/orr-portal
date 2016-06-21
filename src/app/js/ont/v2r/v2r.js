(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.v2r', [])
    .directive('v2rDataViewer',  V2rDataViewerDirective)
    .directive('v2rDataEditor',  V2rDataEditorDirective)
  ;

  V2rDataViewerDirective.$inject = [];
  function V2rDataViewerDirective() {
    return {
      restrict: 'E',
      templateUrl: 'js/ont/v2r/v2r-data-viewer.html',
      controller: V2rDataViewerController,
      controllerAs: 'vm',
      scope: {
        uri:    '=',
        vocabs: '='
      },
      bindToController: true
    }
  }

  V2rDataViewerController.$inject = ['$window', 'vocabulary'];
  function V2rDataViewerController($window, vocabulary) {
    var vm = this;
    vm.debug = debug;
    if (debug) console.log("++V2rDataViewerController++ vm=", vm);

    setCommonMethods(vm, vocabulary);

    // mainly a workaround as the ng-href link in a "text/ng-template"
    // used in <uib-tab> doesn't work for some reason
    vm.openLink = function(href) {
      $window.open(href, "_blank");
    };
  }

  ///////////////////////////////////////////////////////

  V2rDataEditorDirective.$inject = [];
  function V2rDataEditorDirective() {
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
      templateUrl: 'js/ont/v2r/v2r-data-editor.html',
      controller: V2rDataEditorController,
      controllerAs: 'vm',
      link: link,
      scope: {
        uri:    '=',
        vocabs: '='
      },
      bindToController: true
    };
  }

  V2rDataEditorController.$inject = ['$scope', '$uibModal', '$filter', '$timeout', 'utl', 'focus', 'vocabulary'];
  function V2rDataEditorController($scope, $uibModal, $filter, $timeout, utl, focus, vocabulary) {
    var vm = this;
    vm.debug = debug;
    if (debug) console.log("++V2rDataEditorController++ vm=", vm);

    setCommonMethods(vm, vocabulary);

    //////////////////////////////////////
    // Class and property editing

    vm.editVocabClass = function(idModel) {
      return editIdModel("Vocabulary class", "class", idModel);
    };

    vm.editVocabProperty = function(idModel) {
      return editIdModel("Vocabulary property", "property", idModel);
    };

    function editIdModel(title, what, idModel) {
      //console.log("editId': title=", title, "idModel=", idModel);
      return $uibModal.open({
        templateUrl: 'js/ont/v2r/v2r-edit-id.html',
        controller:   V2rEditIdController,
        backdrop:    'static',
        resolve: {
          info: function () {
            return {
              title:     title,
              what:      what,
              namespace: vm.uri,
              idModel:   idModel
            };
          }
        }
      });
    }

    (function prepareVocabMenu() {
      var MOV_LEFT  = 'Move vocabulary to the left';
      var MOV_RIGTH = 'Move vocabulary to the right';
      var INS_LEFT  = 'Insert vocabulary (to the left)';
      var INS_RIGHT = 'Insert vocabulary (to the right)';
      var DEL_COL   = 'Delete this vocabulary';
      vm.vocabMenu = [MOV_LEFT, MOV_RIGTH, INS_LEFT, INS_RIGHT, DEL_COL];

      vm.addVocab = function() {
        insertVocab(vm.vocabs.length);
      };

      vm.vocabOptionSelected = function(v_index, opt) {
        if (opt === MOV_LEFT)  moveVocab(v_index, v_index - 1);
        if (opt === MOV_RIGTH) moveVocab(v_index, v_index + 1);
        if (opt === INS_LEFT)  insertVocab(v_index);
        if (opt === INS_RIGHT) insertVocab(v_index + 1);
        if (opt === DEL_COL)   deleteVocab(v_index);
      };

      function moveVocab(from_index, to_index) {
        moveArrayElement(vm.vocabs, from_index, to_index);
      }

      function insertVocab(v_index) {
        var idModel = {name: '?'};
        vm.editVocabClass(idModel).result.then(function() {
          console.log('editIdModel dialog accepted: idModel=', idModel);
          var newVocab = {
            'class': idModel,
            properties: [],
            terms: []
          };
          vm.vocabs.splice(v_index, 0, newVocab);
          $timeout(function() {
            vm._activeVocab = v_index;
            $timeout(function() { vm.addTerm(newVocab); }, 300);
          }, 300);
        });
      }

      function deleteVocab(v_index) {
        utl.confirm({
          message: '<div class="center">' +
          'Are you sure you want to remove this vocabulary?' +
          '<br><br>(the associated class, properties and terms will be removed)' +
          '</div>',
          ok: function() {
            $timeout(function() {
              vm.vocabs.splice(v_index, 1);
            });
          }
        });
      }
    })();

    (function prepareColumnMenu() {
      var MOV_LEFT  = 'Move property to the left';
      var MOV_RIGTH = 'Move property to the right';
      var INS_LEFT  = 'Insert property (to the left)';
      var INS_RIGHT = 'Insert property (to the right)';
      var DEL_COL   = 'Delete this property';
      vm.columnMenu = [MOV_LEFT, MOV_RIGTH, INS_LEFT, INS_RIGHT, DEL_COL];

      vm.addProperty = function(vocab) {
        insertProp(vocab, vocab.properties.length);
      };

      vm.columnOptionSelected = function(vocab, p_index, opt) {
        if (opt === MOV_LEFT)  moveProp(vocab, p_index, p_index - 1);
        if (opt === MOV_RIGTH) moveProp(vocab, p_index, p_index + 1);
        if (opt === INS_LEFT)  insertProp(vocab, p_index);
        if (opt === INS_RIGHT) insertProp(vocab, p_index + 1);
        if (opt === DEL_COL)   deleteProp(vocab, p_index);
      };

      function moveProp(vocab, from_index, to_index) {
        moveArrayElement(vocab.properties, from_index, to_index);
        _.each(vocab.terms, function(term) {
          moveArrayElement(term.attributes, from_index, to_index);
          moveArrayElement(term._ems,       from_index, to_index);
        });
      }

      function insertProp(vocab, p_index) {
        var idModel = {name: '?'};
        vm.editVocabProperty(idModel).result.then(function() {
          //console.log('editIdModel dialog accepted: idModel=', idModel);
          vocab.properties.splice(p_index, 0, idModel);
          _.each(vocab.terms, function(term) {
            term.attributes.splice(p_index, 0, null);
            setAttrModelsForTerm(term);
          });
        });
      }

      function deleteProp(vocab, p_index) {
        utl.confirm({
          message: '<div class="center">' +
          'Are you sure you want to remove this property?' +
          '<br><br>(the complete column will be removed)' +
          '</div>',
          ok: function() {
            $timeout(function() {
              //console.log("columnOptionSelected: deleting at ", p_index);
              vocab.properties.splice(p_index, 1);
              _.each(vocab.terms, function(term) {
                term.attributes.splice(p_index, 1);
                term._ems.splice(      p_index, 1);
              });
            });
          }
        });
      }
    })();

    //////////////////////////////////////
    // Term ID editing

    // basic validation
    vm.checkTermId = function(val) {
      if (!val) return "missing";

      if (val.match(/.*[\s/|?&!,;'\\]+.*/))
        return "invalid characters"
    };

    vm.removeTerm = function(vocab, index) {
      vocab.terms.splice(index, 1);
    };

    vm.addTerm = function(vocab) {
      var term = {
        name:      "",
        attributes: _.map(vocab.properties, function() { return null }),
        _focus: true
      };
      setAttrModelsForTerm(term);
      vocab.terms.push(term);
    };
    vm.focusNewTerm = function(term, t_index) {
      if (term._focus) {
        focusCell(t_index, -1);
        delete term._focus;
      }
    };

    //////////////////////////////////////
    // Value cell editing

    vm.enterCellEditing = function(tableForm) {
      if (!$scope.someEditInProgress()) {
        //console.log("vm.enterCellEditing");
        $scope.setEditInProgress(true);
        tableForm.$show()
      }
    };

    function setAttrModelsForTerm(term) {
      term._ems = [];
      _.each(term.attributes, function(attr) {
        term._ems.push(getAttrEditModel(attr));
      });
    }

    (function prepareAttrModels() {
      _.each(vm.vocabs, function(vocab) {
        _.each(vocab.terms, setAttrModelsForTerm);
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
    vm.filterValue = function(valueEntry) {
      return valueEntry.isDeleted !== true;
    };

    // mark valueEntry as deleted
    vm.deleteValue = function(em, id) {
      var filtered = $filter('filter')(em, {id: id});
      if (filtered.length) {
        filtered[0].isDeleted = true;
      }
    };

    // add valueEntry
    vm.addValue = function(em) {
      em.push({
        id:    em.length + 1,
        value: '',
        isNew: true
      });
    };

    // cancel all changes
    vm.cancelCell = function(t_index, term, a_index) {
      var em = term._ems[a_index];
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
      focusCell(t_index, a_index);
    };

    vm.cellKeyUp = function($event, tableForm, t_index, term, a_index) {
      //console.debug("cellKeyUp: keyCode=", $event.keyCode, "$event=", $event, "t_index=", t_index, "a_index=", a_index);
      if ($event.keyCode == 13) {
        vm.enterCellEditing(tableForm);
      }
      else vm.cellKeyUpNavigation($event, t_index, term, a_index);
    };

    vm.cellKeyUpNavigation = function($event, t_index, term, a_index) {
      var new_t_index = -1, new_a_index = -2;   // a_index==-1 is the term name column
      if ($event.keyCode == 39) {  // right arrow
        new_t_index = t_index;
        new_a_index = a_index + 1;
      }
      else if ($event.keyCode == 37) {  // left arrow
        new_t_index = t_index;
        new_a_index = a_index - 1;
      }
      else if ($event.keyCode == 40) {  // down arrow
        new_t_index = t_index + 1;
        new_a_index = a_index;
      }
      else if ($event.keyCode == 38) {  // up arrow
        new_t_index = t_index - 1;
        new_a_index = a_index;
      }

      if (new_t_index >= 0 && new_a_index >= -1) {
        $event.stopPropagation();
        $event.preventDefault();
        focusCell(new_t_index, new_a_index);
        return true;
      }
    };

    vm.cellTextAreaKeyUp = function($event, tableForm, em) {
      //console.debug("cellTextAreaKeyUp: keyCode=", $event.keyCode, "$event=", $event);
      if ($event.keyCode == 13 && $event.ctrlKey && $event.shiftKey) {
        $timeout(function() {
          tableForm.$submit();
        });
      }
      else if ($event.keyCode == 187 && $event.ctrlKey && $event.shiftKey) {
        $timeout(function() {
          vm.addValue(em);
        });
      }
      else if ($event.keyCode == 27) {
        tableForm.$cancel();
      }
    };

    // transfer the changes to the model
    vm.applyCellChanges = function(t_index, term, a_index) {
      var em = term._ems[a_index];
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

      focusCell(t_index, a_index);

      //console.log("applyCellChanges: attributes=", term.attributes, "a_index=", a_index, "em=", em);
    };

    function focusCell(t_index, a_index) {
      focus('cell_form_activation_' +t_index+ '_' +a_index);
    }
  }

  V2rEditIdController.$inject = ['$scope', '$uibModalInstance', 'vocabulary', 'info'];
  function V2rEditIdController($scope, $uibModalInstance, vocabulary, info) {
    console.log("V2rEditIdController: info=", info);

    var vm = $scope.vm = {
      title:      info.title,
      what:       info.what,
      namespace:  info.namespace,
      lname:      info.idModel.name,
      uri:        info.idModel.uri,
      idType:     info.idModel.name ? "lname" : "uri",
      stdProperties: getStdProperties(vocabulary)
    };

    $scope.$watch("vm.lname", function(val) {
      // TODO review; this uses some most obvious symbols to avoid
      if (val) vm.lname = val.replace(/[\s/|?&!,;'\\]/gi, "");
    });

    $scope.stdPropertySelected = function(stdProp) {
      console.debug("stdPropertySelected: stdProp=", stdProp);
      vm.uri = stdProp.uri;
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

  function setCommonMethods(vm, vocabulary) {
    vm.getUri = function(e) {
      if (e.uri)   return e.uri;
      if (!vm.uri) return undefined;
      return vm.uri + "/" + e.name;
    };

    vm.getName = function(e) {
      if (e.name)   return e.name;
      if (e.uri)    return e.uri;
    };

    vm.getLabel = function(e) {
      if (e.label)  return e.label;
      if (e.name)   return capitalizeFirstLetter(e.name);
      var def = vocabulary.byUri[e.uri];
      if (def) {
        return def.prefix + ':' + def.label;
      }
      return e.uri;
    };

    vm.singleAttrValue = function(a) {
      if (angular.isString(a))                 return a;
      if (angular.isArray(a) && a.length == 1) return a[0];
    };

    vm.multipleAttrValues = function(a) {
      if (angular.isArray(a) && a.length > 1) return a;
    };
  }

  // TODO retrieve list from a registered (internal) ontology
  function getStdProperties(vocabulary) {
    return [
      vocabulary.skos.definition,
      vocabulary.skos.note,
      vocabulary.rdfs.seeAlso,
      vocabulary.dct.title,
      vocabulary.dct.description,
      vocabulary.dct.creator,
      vocabulary.dct.contributor
    ]
  }

  function capitalizeFirstLetter(s) {
    if (s) s = s.substr(0, 1).toUpperCase() + s.substr(1);
    return s;
  }

  function moveArrayElement(array, from_index, to_index) {
    if (from_index < 0 || from_index >= array.length) return;
    if (to_index   < 0 || to_index   >= array.length) return;

    var element = array[from_index];
    array.splice(from_index, 1);
    if (from_index < to_index) to_index += 1;
    array.splice(to_index, 0, element);
  }

})();
