(function() {
  'use strict';

  angular.module('orrportal.uri', ['orrportal.uri.directives', 'orrportal.multivalueedit'])
    .controller('UriController', UriController)
  ;

  UriController.$inject = ['$rootScope', '$scope', '$stateParams', '$timeout', '$window', 'service', 'utl'];

  function UriController($rootScope, $scope, $stateParams, $timeout, $window, service, utl) {
    if (appUtil.debug) console.log("++UriController++");

    var rvm = $rootScope.rvm;

    var vm = $scope.vm = {};
    vm.uri = $rootScope.rvm.rUri || $stateParams.uri;
    vm.ontology = undefined;
    vm.error = undefined;

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


    $scope.setMetadataEditInProgress = function(inProgress) {
      //console.log("setMetadataEditInProgress: inProgress=", inProgress);
      $scope.metadataEditInProgress = inProgress;
    };

    $scope.setDataEditInProgress = function(inProgress) {
      //console.log("dataEditInProgress: inProgress=", inProgress);
      $scope.dataEditInProgress = inProgress;
    };

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
      _.each($scope.metadataSections, function (section) {
        _.each(section.props, function (prop) {
          var values = _.filter(prop.value, function (v) { return v; }); // only defined values
          if (values.length) {
            newMetadata.push({
              uri: prop.predicate,
              value: values.length === 1 ? values[0] : values
            });
          }
        });
      });

      $scope.debug_newMetadata = newMetadata;

      var userName = $rootScope.userLoggedIn().uid;

      // used for 'name' in the ontology entry in the backend
      var omv_descriptions = _.filter(newMetadata, {uri: 'http://omv.ontoware.org/2005/05/ontology#description'});
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

    initMetadataSections();

    /** gets the props to be displayed for a metadata section */
    $scope.getProps = function(section) {
      section.props = [];
      _.each(section.propNames, function(name) {
        var prop = vm.mdByName[name];
        //console.log("     getProps : name=", name, "prop=", prop);
        if (prop !== undefined && (prop.value || !prop.omitIfUndef)) {
          section.props.push(prop);
        }
      });
      return section.props;
    };

    refreshOntology(vm.uri);

    function refreshOntology(uri) {
      service.refreshOntology(uri, gotOntology);

      function gotOntology(error, ontology) {
        if (error) {
          console.error("error getting ontology:", error);
          $scope.error = error;
        }
        else {
          //console.log("got ontology:", ontology);
          vm.ontology = ontology;
          setViewAsOptions(uri);
          prepareMetadata()
        }
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

    function prepareMetadata() {
      var receivedPredicates = vm.ontology.metadata;

      $scope.vm.mdByName = {};

      var handledPredicates = getHandledPredicates();
      _.each(handledPredicates, function(pred) {
        var values = receivedPredicates[pred.predicate];
        setPredicateAndValues(pred, values);
      });

      setOtherMetadataSection(receivedPredicates, handledPredicates);

      function setPredicateAndValues(pred, values) {
        $scope.vm.mdByName[pred.name] = {
          predicate:   pred.predicate,
          label:       pred.label,
          omitIfUndef: pred.omitIfUndef,
          value:       values
        };
      }

      function setOtherMetadataSection(receivedPredicates, handledPredicates) {
        var allPredicates = _.keys(receivedPredicates);
        var usedPredicates = _.map(handledPredicates, "predicate");
        var otherPredicates = _.difference(allPredicates, usedPredicates);
        //console.log('otherPredicates=', otherPredicates);

        var otherSection = $scope.metadataSections.other;

        var propNames = [];

        _.each(otherPredicates, function(predicate) {
          //var match = /^<?.*(\/|#)(.*)>?$/.exec(predicate);
          //var name = match ? match[2] : predicate;

          var values = receivedPredicates[predicate];

          // do not show rdf:type owl:Ontology
          if (predicate === vocabulary.rdf.type.uri) {
            values = _.filter(values, function(v) {
              return v !== vocabulary.owl.Ontology.uri;
            });
          }

          if (values.length) {
            var name = predicate;
            var pred = {
              predicate: predicate,
              name: name,
              label: name
            };
            propNames.push(name);

            setPredicateAndValues(pred, values);
          }
        });

        if (propNames.length) {
          otherSection.propNames = propNames;
        }
        else otherSection.propNames = undefined;
      }
    }

    function initMetadataSections() {
      $scope.metadataSectionKeys = ["general", "usage", "source", "other"];
      $scope.metadataSections = {
        general: {
          label: "General",
          propNames: [
            "resourceType",
            "contentCreator",
            "ontologyCreator",
            "description",
            "keywords",
            "origVocUri",
            "origMaintainerCode",
            "contributor",
            "reference"
          ]
        },
        usage: {
          label: "Usage/License/Permissions",
          propNames: [
            "origVocManager",
            "contact",
            "contactRole",
            "temporaryMmiRole",
            "creditRequired",
            "creditCitation"
          ]
        },
        source: {
          label: "Original source",
          propNames: [
            "origVocDocumentationUri",
            "origVocDescriptiveName",
            "origVocVersionId",
            "origVocKeywords",
            "origVocSyntaxFormat"
          ]
        },
        other: {
          label: "Other",
          tooltip: 'Ontology metadata properties not classified/aggregated in other sections (TODO)'
        }
      };
    }
  }

  /** Used in the traditional sections 'General', 'Usage..', 'Original source' */
  function getHandledPredicates() {
    return [
      {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/hasResourceType",
        name: "resourceType",
        label: "Resource type"
      }, {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/hasContentCreator",
        name: "contentCreator",
        label: "Content Creator"
      }, {
        predicate: "http://omv.ontoware.org/2005/05/ontology#hasCreator",
        name: "ontologyCreator",
        label: "Ontology Creator"
      }, {
        predicate: "http://omv.ontoware.org/2005/05/ontology#description",
        name: "description",
        label: "Description"
      }, {
        predicate: "http://omv.ontoware.org/2005/05/ontology#keywords",
        name: "keywords",
        label: "Keywords",
        omitIfUndef: true
      }, {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocUri",
        name: "origVocUri",
        label: "Original vocabulary",
        omitIfUndef: true
      }, {
        predicate: "http://omv.ontoware.org/2005/05/ontology#documentation",
        name: "documentation",
        label: "Documentation"
      }, {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origMaintainerCode",
        name: "origMaintainerCode",
        label: "Organization"
      }, {
        predicate: "http://omv.ontoware.org/2005/05/ontology#hasContributor",
        name: "contributor",
        label: "Contributor"
      }, {
        predicate: "http://omv.ontoware.org/2005/05/ontology#reference",
        name: "reference",
        label: "Reference"
      }, {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocManager",
        name: "origVocManager",
        label: "Manager of source vocabulary"
      }, {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/contact",
        name: "contact",
        label: "Contact/Responsible Party"
      }, {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/contactRole",
        name: "contactRole",
        label: "Contact role"
      }, {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/temporaryMmiRole",
        name: "temporaryMmiRole",
        label: "Temporary MMI role"
      }, {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/creditRequired",
        name: "creditRequired",
        label: "Author credit required"
      }, {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/creditCitation",
        name: "creditCitation",
        label: "Citation string"
      }, {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocDocumentationUri",
        name: "origVocDocumentationUri",
        label: "Documentation"
      }, {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocDescriptiveName",
        name: "origVocDescriptiveName",
        label: "Descriptive name"
      }, {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocVersionId",
        name: "origVocVersionId",
        label: "Version"
      }, {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocKeywords",
        name: "origVocKeywords",
        label: "Keywords"
      }, {
        predicate: "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocSyntaxFormat",
        name: "origVocSyntaxFormat",
        label: "Syntax format"
      }
    ];
  }

})();
