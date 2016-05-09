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

  OntController.prototype.setMetaEditInProgress = function(inProgress) {
    var vm = this.scope.vm;
    vm.metaEditInProgress = inProgress;
    vm.someEditInProgress = vm.metaEditInProgress || vm.dataEditInProgress;
  };

  OntController.prototype.setDataEditInProgress = function(inProgress) {
    var vm = this.scope.vm;
    vm.dataEditInProgress = inProgress;
    vm.someEditInProgress = vm.metaEditInProgress || vm.dataEditInProgress;
  };

  OntController.prototype.someEditInProgress = function() {
    return this.scope.vm.someEditInProgress;
  };


  // todo reorganize! (too many deps)
  OntController.$inject = [
    '$rootScope', '$scope', '$stateParams', '$state', '$timeout', '$window', '$location', '$uibModal',
    'service', 'utl', 'vocabulary'
  ];
  function OntController(
    $rootScope, $scope, $stateParams, $state, $timeout, $window, $location, $uibModal,
    service, utl, vocabulary
  ) {

    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++OntController++ $scope=", $scope);


    this.scope = $scope;

    var rvm = $rootScope.rvm;

    var vm = $scope.vm = {};
    vm.uri = rvm.rUri || $stateParams.uri;

    // todo move this to a directive or more general utility
    $scope.uriClipboard = {
      result: '',
      getText: function() {
        return vm.brandNew ? null : vm.uri;
      },
      getTooltip: function() {
        return $scope.uriClipboard.result || 'Copy URI to clipboard';
      },
      setResult: function(result, delay) {
        $scope.uriClipboard.result = result;
        $timeout(function() {$scope.uriClipboard.result = '';}, delay || 2000);
      },
      success: function() {
        $scope.uriClipboard.setResult('<b>Copied!</b>');
      },
      fail: function(err) {
        $scope.uriClipboard.setResult('<b>Error</b>');
        var msg = "Sorry, your browser may not support copying to the clipboard. Reported error: " + err;
        $timeout(function() {alert(msg);}, 250);
      }
    };

    var newFormat = $stateParams.newFormat;

    if (vm.uri) {
      if (newFormat) console.warn("expecting undefined newFormat when vm.uri is defined. newFormat=", newFormat);

      vm.brandNew = false;
      refreshOntology(vm.uri);
    }
    else {
      if (!newFormat) console.warn("expecting defined newFormat when vm.uri is undefined");

      if (canCreateBrandNew()) {
        startBrandNew();
      }
      else {
        $timeout(function() {
          if (canCreateBrandNew()) {
            startBrandNew();
          }
          else {
            $location.url("/");
          }
        }, 1000);
      }
    }

    function canCreateBrandNew() {
      return $rootScope.userLoggedIn();
    }

    function startBrandNew() {
      vm.brandNew = true;
      vm.ontology = {
        "metadata": {
        },
        "versions": [
        ],
        "format": newFormat
      };
      vm.data = [];

      var loggedInInfo = rvm.masterAuth.loggedInInfo;
      var userName = loggedInInfo.uid;

      // TODO properly handle distinction between userName OR organization (this also involves orr-ont)
      vm.ownerOptions = [{
        id:    userName,
        name: 'User: ' + userName + ": " + loggedInInfo.displayName
      }];
      vm.selectedOwner = undefined;
      // add user's organizations:

      // TODO clean up!! as the organization might be already known here
      service.refreshUser(userName, function(error, user) {
        if (error) { console.error("error getting user:", error); }
        else {
          console.log("refreshUser: got=", user);
          _.each(user.organizations, function(o) {
            vm.ownerOptions.push({
              id: o.orgName,
              name: 'Organization: ' + o.orgName + ": " + o.name
            });
          });

          var info = {
            base:          appConfig.orront.rest,
            ownerOptions:  vm.ownerOptions
          };
          editOntUri(info).result.then(function(res) {
            console.log('editOntUri dialog accepted: res=', res);
            vm.ontology.uri = vm.uri = res.uri;
            vm.ontology.orgName = res.owner;
            initMetaForBrandNew(res.owner);
            $scope.startEditMode();
          }, function() {
            $state.go("/");
          });
        }
        function initMetaForBrandNew(owner) {
          var creator = loggedInInfo.displayName || userName || owner;
          var meta = vm.ontology.metadata;
          meta[vocabulary.omv.hasCreator.uri] = [creator];
        }
      });
    }

    function adjustMetaForBrandNew() {
      var meta = vm.ontology.metadata;
      meta[vocabulary.omvmmi.origMaintainerCode.uri] = [vm.ontology.orgName];
    }

    function refreshOntology(uri) {
      service.refreshOntology(vm.uri, gotOntology);

      function gotOntology(error, ontology) {
        if (error) {
          $scope.error = error;
          console.error("error getting ontology:", error);
        }
        else {
          vm.ontology = ontology;
          setViewAsOptions(vm.uri);
          //prepareMetadata()

          getOntologyData();
        }
      }
      function setViewAsOptions(uri) {
        uri = uri.replace(/#/g, '%23');

        $scope.viewAsOptions = [
          {
            label: "RDF/XML",
            url: getUrl('rdf')
          }, {
            label: "JSON-LD",
            url: getUrl('jsonld')
          }, {
            label: "N3",
            url: getUrl('n3')
          }, {
            label: "Turtle",
            url: getUrl('ttl')
          }, {
            label: "N-Triples",
            url: getUrl('nt')
          }, {
            label: "N-Quads",
            url: getUrl('nq')
            //}, {
            //  label: "TriG",  // TODO jena fails with this(?)
            //  getUrl('trig')
          }, {
            label: "RDF/JSON",
            url: getUrl('rj')
          }
        ];

        function getUrl(format) {
          return appConfig.orront.rest + "/api/v0/ont?format=" +format+ "&uri=" + uri;
        }
      }
    }

    $scope.canEditNewVersion = function() {
      if (!vm.ontology)                     return false;
      if ($rootScope.userLoggedInIsAdmin()) return true;
      if (!$rootScope.userLoggedIn())       return false;
      if (!rvm.masterAuth.organizations)    return false;

      var userOrgs = _.map(rvm.masterAuth.organizations, "orgName");
      return _.contains(userOrgs, vm.ontology.orgName);
    };

    $scope.startEditMode = function() {
      if (vm.ontology.format === 'v2r' || vm.ontology.format === 'm2r') {
        // v2r and m2r always edited in the UI (both metadata and data)
        $scope.editMode = true;
      }
      else {
        var options = ["Edit metadata", "Upload file"];
        utl.select({
          title:   "Select option to create new version",
          message: '<p>' +
          'You can either edit the metadata' +
          ' or upload a file for the new version.' +
          '</p>',
          options: options,
          selected: function(index) {
            if (index === 0) {
              $scope.editMode = true;
            }
            else console.error("not implemented yet: " + options[index]);
          }
        });
      }
    };

    $scope.cancelNewVersion = function() {
      utl.confirm({
        message: '<div class="center">' +
        'Any changes made will be lost' +
        '</div>',
        cancelLabel: 'Back to editing',
        ok: function() {
          $scope.editMode = false;
          refreshOntology(vm.uri);
        }
      });
    };

    $scope.registerOntology = function() {

      var params = {
        uri:        vm.uri,
        userName:   $rootScope.userLoggedIn().uid
      };

      if (vm.ontology.format === 'v2r') {
        // Whole contents submission case.
        params.format = 'v2r';
        params.orgName = vm.ontology.orgName;
        params.name = getNameFromOmv(vm.ontology.metadata);
        if (vm.brandNew) adjustMetaForBrandNew();

        params.contents = omitSpecialFields({
          metadata: vm.ontology.metadata,
          vocabs:   vm.data
        });
        console.log("TO submit V2R = ", params.contents);
      }
      else {
        // Only metadata submission case.
        var newMetadata = [];
        _.each(vm.ontology.metadata, function (values, predicate) {
          values = _.filter(values, function (v) { return v; }); // only defined values
          if (values.length) {
            newMetadata.push({
              uri:   predicate,
              value: values.length === 1 ? values[0] : values
            });
          }
        });

        $scope.debug_newMetadata = newMetadata;

        params.name = getNameFromOmv(newMetadata);

        params.metadata = angular.toJson(newMetadata);
      }

      service.registerOntology(vm.brandNew, params, registrationCallback(params.uri));

      // registrationCallback: verbatim copy from upload.js  TODO move to a common place
      function registrationCallback(uri) {
        return function cb(error, data) {
          if (error) {
            console.error(error);
            utl.error({
              errorPRE: error
            });
          }
          else {
            $scope.editMode = false;

            console.log("registerOntology: success data=", data);
            utl.message({
              title:   "Successful registration",
              message: '<div class="center">' +
              'Ontology URI:' +
              '<br>' +
              appUtil.mklink4uriWithSelfHostPrefix(uri) +
              '</div>',
              ok: function() {
                $window.location.href = appUtil.getHref4uriWithSelfHostPrefix(uri);
              }
            });
          }
        }
      }

      function omitSpecialFields(obj) {
        return appUtil.filterKeys(obj, function(key) {
          return !key.startsWith('_');
        });
      }

      // omv:name used for 'name' in the ontology entry in the backend
      function getNameFromOmv(meta) {
        var omv_name = meta[vocabulary.omv.name.uri];
        console.log("omv_name=", omv_name);
        if (omv_name && omv_name.length) {
          return omv_name.join("; ");
        }
      }
    };

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

    function editOntUri(info) {
      console.log("editOntUri': info=", info);
      return $uibModal.open({
        templateUrl: 'js/ont/views/ont-uri-editor.tpl.html',
        controller:   OntUriEditorController,
        backdrop:    'static',
        resolve: {
          info: function () {
            return info;
          }
        }
      });
    }
  }

  OntUriEditorController.$inject = ['$scope', '$uibModalInstance', 'info'];
  function OntUriEditorController($scope, $uibModalInstance, info) {
    console.log("++OntUriEditorController++: info=", info);

    var vm = $scope.vm = {
      title:      'Ontology owner and URI',
      base:       info.base,
      ownerOptions: info.ownerOptions,
      uriType:    'orrBasedUri',
      owner:      undefined,
      shortName:  undefined
    };

    $scope.$watch("vm.shortName", function(val) {
      if (val) {
        val = val.replace(/\s+/g, "_");
        vm.shortName = val.replace(/[\s/|?&!,;'\\]/gi, "");
      }
    });

    $scope.uriEditFormOk = function() {
      if (!vm.owner) return false;

      if (vm.uriType === 'orrBasedUri')
        return vm.shortName;
      else
        return vm.uri;
    };

    $scope.doneUriEdit = function() {
      if (vm.uriType === 'orrBasedUri') {
        vm.uri = vm.base + "/" + vm.owner.id + "/" + vm.shortName;
      }
      $uibModalInstance.close({uri: vm.uri, owner: vm.owner.id});
    };

    $scope.cancelUriEdit = function() {
      $uibModalInstance.dismiss();
    };
  }

})();
