(function() {
  'use strict';

  angular.module('orrportal.uri', [])
    .directive('orrportalUriViewAsOptions', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/uri/views/uri-viewasoptions.tpl.html'
      }
    })
    .directive('orrportalUriVersions', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/uri/views/uri-versions.tpl.html'
      }
    })
    .directive('orrportalUriTitle', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/uri/views/uri-title.tpl.html'
      }
    })
    .directive('orrportalUriOntTitle', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/uri/views/uri-onttitle.tpl.html'
      }
    })
    .directive('orrportalUriMetadata', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/uri/views/uri-metadata.tpl.html'
      }
    })
    .directive('orrportalUriContents', function() {
      return {
        restrict:     'E',
        templateUrl:  'js/uri/views/uri-contents.tpl.html'
      }
    })
    .controller('UriController', UriController)
  ;

  UriController.$inject = ['$rootScope', '$scope', '$routeParams', '$timeout', 'service'];

  function UriController($rootScope, $scope, $routeParams, $timeout, service) {
    if (appUtil.debug) console.log("++UriController++");

    var vm = $scope.vm = {};
    vm.uri = $rootScope.rvm.rUri || $routeParams.uri;
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

    $scope.metadataSections = initMetadataSections();

    /** gets the props to be displayed for a metadata section */
    $scope.getProps = function(propNames) {
      var props = [];
      _.each(propNames, function(name) {
        var prop = vm.mdByName[name];
        //console.log("     getProps : name=", name, "prop=", prop);
        if (prop !== undefined && (prop.value || !prop.omitIfUndef)) {
          props.push(prop);
        }
      });
      return props;
    };

    refreshOntology(vm.uri);

    function refreshOntology(uri) {
      service.refreshOntology(uri, gotOntology);

      function gotOntology(error, ontology) {
        if (error) {
          console.log("error getting ontology:", error);
          $scope.error = error;
        }
        else {
          $scope.vm.ontology = ontology;
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

      var otherMdSection = getOtherMetadataSection(receivedPredicates, handledPredicates);
      //console.log("otherMdSection=", otherMdSection);
      if (otherMdSection) {
        $scope.metadataSections.push(otherMdSection);
      }

      function setPredicateAndValues(pred, values) {
        var resValue = undefined;
        if (values) {
          resValue = [];
          _.each(values, function(value) {
            if (pred.name === "keywords") {
              resValue.push(prepareKeywords(value));
            }
            else if (pred.name === "origMaintainerCode") {
              if (value) {
                value = value.replace(/"/g, ''); // ignore any double quotes
                if (value) {
                  resValue.push('<a href="#/org/' +value+ '">'+ value+ '</a>');
                }
              }
            }
            else if (value) {
              resValue.push(appUtil.htmlifyObject(value, true));
            }
          })
        }
        if (resValue && resValue.length === 0) {
          resValue = undefined;
        }

        $scope.vm.mdByName[pred.name] = {
          predicate:   pred.predicate,
          label:       pred.label,
          omitIfUndef: pred.omitIfUndef,
          value:       resValue
        };
      }

      function getOtherMetadataSection(receivedPredicates, handledPredicates) {
        var allPredicates = _.keys(receivedPredicates);
        var usedPredicates = _.map(handledPredicates, "predicate");
        var otherPredicates = _.difference(allPredicates, usedPredicates);
        //console.log('otherPredicates=', otherPredicates);

        if (otherPredicates.length) {
          var label = "Other";
          var propNames = [];

          _.each(otherPredicates, function(predicate) {
            //var match = /^<?.*(\/|#)(.*)>?$/.exec(predicate);
            //var name = match ? match[2] : predicate;
            var name = predicate;
            var pred = {
              predicate: predicate,
              name: name,
              label: appUtil.htmlifyObject(name, true)
            };
            propNames.push(name);

            setPredicateAndValues(pred, receivedPredicates[predicate]);
          });

          return {
            label: label,
            propNames: propNames
            ,tooltip: 'Ontology metadata properties not classified/aggregated in other sections (TODO)'
          }
        }
      }

      function prepareKeywords(keywords) {
        if (keywords) {
          keywords = keywords.replace(/"/g, ''); // ignore any double quotes
          var list = keywords.split(/,|;/);
          //console.log("prepareKeywords: keywords=", keywords, "list=", list);
          var prepared = _.map(list, function(word) {
            word = word.trim();
            var a = '<a href="#/kw/' +word+ '">'+ word+ '</a>';
            return'<span class="btn btn-default btn-link badge">' + a + '</span>'
          });
          return prepared.join("&nbsp;&nbsp;");
        }
      }
    }
  }

  function initMetadataSections() {
    return [
      {
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
      }, {
        label: "Usage/License/Permissions",
        propNames: [
          "origVocManager",
          "contact",
          "contactRole",
          "temporaryMmiRole",
          "creditRequired",
          "creditCitation"
        ]
      }, {
        label: "Original source",
        propNames: [
          "origVocDocumentationUri",
          "origVocDescriptiveName",
          "origVocVersionId",
          "origVocKeywords",
          "origVocSyntaxFormat"
        ]
      }
    ];
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
