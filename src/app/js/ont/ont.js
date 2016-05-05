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
    vm.someEditInProgress = vm.metaEditInProgress || vm.dataEditInProgress;;
  };

  OntController.prototype.setDataEditInProgress = function(inProgress) {
    var vm = this.scope.vm;
    vm.dataEditInProgress = inProgress;
    vm.someEditInProgress = vm.metaEditInProgress || vm.dataEditInProgress;;
  };

  OntController.prototype.someEditInProgress = function() {
    return this.scope.vm.someEditInProgress;
  };

  OntController.$inject = ['$rootScope', '$scope', '$routeParams', '$timeout', '$window', 'service', 'utl'];
  function OntController($rootScope, $scope, $routeParams, $timeout, $window, service, utl) {
    debug = debug || $scope.debug;
    $scope.debug = debug;
    if (debug) console.log("++OntController++ $scope=", $scope);

    this.scope = $scope;

    var rvm = $rootScope.rvm;

    var vm = $scope.vm = {};
    vm.uri = $rootScope.rvm.rUri || $routeParams.uri;

    $scope.uriClipboard = {
      result: '',
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


    refreshOntology(vm.uri);

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
        title:   "Cancel?",
        message: '<div class="center">' +
        'Any changes will be lost' +
        '</div>',
        ok: function() {
          $scope.editMode = false;
          refreshOntology(vm.uri);
        }
      });
    };

    $scope.registerNewVersion = function() {
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

      var userName = $rootScope.userLoggedIn().uid;

      // used for 'name' in the ontology entry in the backend
      var omv_descriptions = _.filter(newMetadata, {uri: vocabulary.omv.description.uri});
      //console.log("omv_descriptions=", omv_descriptions);
      if (omv_descriptions.length) {
        var name = _.map(omv_descriptions, "value").join("; ");
      }

      var params = {
        uri:        vm.uri,
        name:       name,
        userName:   userName,
        metadata:   angular.toJson(newMetadata)
      };

      var brandNew = false;
      service.registerOntology(brandNew, params, registrationCallback(params.uri));

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

  }

})();
