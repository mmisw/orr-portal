(function() {
  'use strict';

  angular.module('orrportal.uri', [])
    .controller('UriController', UriController)
  ;

  UriController.$inject = ['$scope', '$routeParams', 'service'];

  function UriController($scope, $routeParams, service) {
    if (appUtil.debug) console.log("++UriController++");

    var vm = $scope.vm = {};
    vm.uri = $routeParams.uri;
    vm.ontology = undefined;
    vm.error = undefined;

    /** gets the props to be displayed for a metadata section */
    $scope.getProps = function(propNames) {
      var props = [];
      _.each(propNames, function(name) {
        var prop = vm.ontology[name];
        //console.log("     getProps : name=", name, "prop=", prop);
        if (prop !== undefined && (prop.value || !prop.omitIfUndef)) {
          props.push(prop);
        }
      });
      return props;
    };

    refreshOntology($scope, vm.uri, service);
  }

  function refreshOntology($scope, uri, service) {
    service.refreshOntology(uri, gotOntology);

    function gotOntology(error, ontology) {
      if (error) {
        console.log("error getting ontology:", error);
        $scope.error = error;
      }
      else {
        $scope.vm.ontology = ontology;
        setViewAsOptions($scope, uri);
        refreshOntologyMetadata($scope, uri, service)
      }
    }
  }

  function setViewAsOptions($scope, uri) {
    var url = appConfig.orront.rest + "/api/v0/ont?uri=" + uri;

    $scope.viewAsOptions = [
      {
        label: "RDF/XML",
        url: url+ '&format=rdf'
      }, {
        label: "JSON-LD",
        url: url+ '&format=jsonld'
      }, {
        label: "N3",
        url: url+ '&format=n3'
      }, {
        label: "Turtle",
        url: url+ '&format=ttl'
      }, {
        label: "N-Triples",
        url: url+ '&format=nt'
      }, {
        label: "N-Quads",
        url: url+ '&format=nq'
        //}, {
        //  label: "TriG",  // TODO jena fails with this(?)
        //  url: url+ '&format=trig'
      }, {
        label: "RDF/JSON",
        url: url+ '&format=rj'
      }
    ]

  }

  function refreshOntologyMetadata($scope, uri, service) {
    service.refreshOntologyMetadata(uri, gotOntologyMetadata);

    function gotOntologyMetadata(error, predicates) {
      if (error) {
        console.log("error getting ontology metadata:", error);
        $scope.error = error;
      }
      else {
        var newPredicates = {};
        _.each(predicates, function(values, predicate) {
          newPredicates[predicate] = _.map(values, function(value) {
            // only to remove any explicit double quotes in string value
            return value.replace(/^"(.*)"$/, '$1');
          });
        });

        _.each(handledPredicates(), function(pred) {
          var values = newPredicates[pred.predicate];
          setPredicateAndValues(pred, values);
        });

        setMetadataSections();
      }
    }

    function setPredicateAndValues(pred, values) {
      var value = values ? values[0] : undefined;

      if (pred.name === "ontologyType") {
        if (value === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/voc2rdf>") {
          value = "vocabulary";
        }
        else if (value === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/vine>") {
          value = "mapping";
        }
      }
      else if (pred.name === "keywords") {
        value = prepareKeywords(value);
      }
      else if (pred.name === "origMaintainerCode") {
        if (value) {
          value = value.replace(/"/g, ''); // ignore any double quotes
          value = value ? '<a href="#/org/' +value+ '">'+ value+ '</a>' : undefined;
        }
      }
      else if (value) {
        value = appUtil.htmlifyObject(value, true);
      }

      if (name !== undefined) {
        $scope.vm.ontology[pred.name] = {
          predicate:   pred.predicate,
          label:       pred.label,
          omitIfUndef: pred.omitIfUndef,
          value:       value
        };
      }
    }

    function setMetadataSections() {
      $scope.vm.ontology.metadataSections = [
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
              "reference",
              "ontologyType"
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

    function prepareKeywords(keywords) {
      if (keywords) {
        keywords = keywords.replace(/"/g, ''); // ignore any double quotes
        var list = keywords.split(/,|;/);
        //console.log("prepareKeywords: keywords=", keywords, "list=", list);
        var prepared = _.map(list, function(word) {
          word = word.trim();
          var a = '<a href="#/kw/' +word+ '">'+ word+ '</a>';
          return a;
          //return'<span class="btn btn-default badge">' + a + '</span>'
        });
        return prepared.join("&nbsp;&nbsp;");
      }
    }
  }

  function handledPredicates() {
    return [
      {
        predicate: "<http://omv.ontoware.org/2005/05/ontology#usedOntologyEngineeringTool>",
        name:  "ontologyType",
        label:  "Ontology type"
        ,omitIfUndef: true
      } , {
        predicate: "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/hasResourceType>",
        name:  "resourceType",
        label:  "Resource type"
      } , {
        predicate: "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/hasContentCreator>",
        name:  "contentCreator",
        label:  "Content Creator"
      }, {
        predicate: "<http://omv.ontoware.org/2005/05/ontology#hasCreator>",
        name: "ontologyCreator",
        label: "Ontology Creator"
      }, {
        predicate: "<http://omv.ontoware.org/2005/05/ontology#description>",
        name: "description",
        label: "Description"
      }, {
        predicate: "<http://omv.ontoware.org/2005/05/ontology#keywords>",
        name : "keywords",
        label : "Keywords",
        omitIfUndef : true
      }, {
        predicate: "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocUri>",
        name : "origVocUri",
        label : "Original vocabulary",
        omitIfUndef : true
      }, {
        predicate : "<http://omv.ontoware.org/2005/05/ontology#documentation>",
        name : "documentation",
        label : "Documentation"
      }, {
        predicate : "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origMaintainerCode>",
        name : "origMaintainerCode",
        label : "Organization"
      }, {
        predicate : "<http://omv.ontoware.org/2005/05/ontology#hasContributor>",
        name : "contributor",
        label : "Contributor"
      }, {
        predicate : "<http://omv.ontoware.org/2005/05/ontology#reference>",
        name : "reference",
        label : "Reference"
      }, {
        predicate : "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocManager>",
        name : "origVocManager",
        label : "Manager of source vocabulary"
      }, {
        predicate : "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/contact>",
        name : "contact",
        label : "Contact/Responsible Party"
      }, {
        predicate : "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/contactRole>",
        name : "contactRole",
        label : "Contact role"
      }, {
        predicate : "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/temporaryMmiRole>",
        name : "temporaryMmiRole",
        label : "Temporary MMI role"
      }, {
        predicate : "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/creditRequired>",
        name : "creditRequired",
        label : "Author credit required"
      }, {
        predicate : "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/creditCitation>",
        name :  "creditCitation",
        label : "Citation string"
      }, {
        predicate : "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocDocumentationUri>",
        name : "origVocDocumentationUri",
        label : "Documentation"
      }, {
        predicate : "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocDescriptiveName>",
        name : "origVocDescriptiveName",
        label : "Descriptive name"
      }, {
        predicate : "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocVersionId>",
        name : "origVocVersionId",
        label : "Version"
      }, {
        predicate : "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocKeywords>",
        name : "origVocKeywords",
        label : "Keywords"
      }, {
        predicate : "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocSyntaxFormat>",
        name : "origVocSyntaxFormat",
        label : "Syntax format"
      }
    ]
  }

  })();
