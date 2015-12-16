(function() {
'use strict';

angular.module('orrportal.uri', [])
    .controller('UriController', UriController)
;

UriController.$inject = ['$scope', '$routeParams', 'service'];

function UriController($scope, $routeParams, service) {
    if (appUtil.debug) console.log("++UriController++");

    $scope.uri = $routeParams.uri;
    $scope.ontology = undefined;
    $scope.error = undefined;

    refreshOntology($scope, $scope.uri, service);
}

function refreshOntology($scope, uri, service) {
    service.refreshOntology(uri, gotOntology);

    function gotOntology(error, ontology) {
        if (error) {
            console.log("error getting ontology:", error);
            $scope.error = error;
        }
        else {
            $scope.ontology = ontology;
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

    var htmlify = true;
    var onlyExternalLink = true;

    function gotOntologyMetadata(error, predicates) {
        if (error) {
            console.log("error getting ontology metadata:", error);
            $scope.error = error;
        }
        else {
            var newPredicates = {}; // with htmlified or escaped uri's and values
            _.each(predicates, function(values, predicate) {
                newPredicates[predicate] = _.map(values, function(value) {
                    return htmlify ? appUtil.htmlifyObject(value, onlyExternalLink) : _.escape(value);
                });
            });

            _.each(newPredicates, setPredicateAndValues);

            setMetadataSections();
        }
    }

    function setPredicateAndValues(values, predicate) {
        if (predicate === "<http://omv.ontoware.org/2005/05/ontology#usedOntologyEngineeringTool>") {
            if (values[0] === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/voc2rdf>") {
                $scope.ontology.ontologyType = "vocabulary";
            }
            else if (values[0] === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/vine>") {
                $scope.ontology.ontologyType = "mapping";
            }
        }
        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/hasResourceType>") {
            $scope.ontology.resourceType = values[0];
        }
        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/hasContentCreator>") {
            $scope.ontology.contentCreator = values[0];
        }
        else if (predicate === "<http://omv.ontoware.org/2005/05/ontology#hasCreator>") {
            $scope.ontology.ontologyCreator = values[0];
        }
        else if (predicate === "<http://omv.ontoware.org/2005/05/ontology#description>") {
            $scope.ontology.description = values[0];
        }
        else if (predicate === "<http://omv.ontoware.org/2005/05/ontology#keywords>") {
            $scope.ontology.keywords = values[0];
        }
        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocUri>") {
            $scope.ontology.origVocUri = values[0];
        }
        else if (predicate === "<http://omv.ontoware.org/2005/05/ontology#documentation>") {
            $scope.ontology.documentation = values[0];
        }
        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origMaintainerCode>") {
            $scope.ontology.origMaintainerCode = values[0];
        }
        else if (predicate === "<http://omv.ontoware.org/2005/05/ontology#hasContributor>") {
            $scope.ontology.contributor = values[0];
        }
        else if (predicate === "<http://omv.ontoware.org/2005/05/ontology#reference>") {
            $scope.ontology.reference = values[0];
        }

        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocManager>") {
            $scope.ontology.origVocManager = values[0];
        }
        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/contact>") {
            $scope.ontology.contact = values[0];
        }
        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/contactRole>") {
            $scope.ontology.contactRole = values[0];
        }
        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/temporaryMmiRole>") {
            $scope.ontology.temporaryMmiRole = values[0];
        }
        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/creditRequired>") {
            $scope.ontology.creditRequired = values[0];
        }
        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/creditCitation>") {
            $scope.ontology.creditCitation = values[0];
        }

        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocDocumentationUri>") {
            $scope.ontology.origVocDocumentationUri = values[0];
        }
        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocDescriptiveName>") {
            $scope.ontology.origVocDescriptiveName = values[0];
        }
        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocVersionId>") {
            $scope.ontology.origVocVersionId = values[0];
        }
        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocKeywords>") {
            $scope.ontology.origVocKeywords = values[0];
        }
        else if (predicate === "<http://mmisw.org/ont/mmi/20081020/ontologyMetadata/origVocSyntaxFormat>") {
            $scope.ontology.origVocSyntaxFormat = values[0];
        }

    }

    function setMetadataSections() {
      $scope.ontology.metadataSections = [
        {
          label: "General",
          props: [
            {
              label: "Resource type",
              value: $scope.ontology.resourceType
            }, {
              label: "Content Creator",
              value: $scope.ontology.contentCreator
            }, {
              label: "Ontology Creator",
              value: $scope.ontology.ontologyCreator
            }, {
              label: "Description",
              value: $scope.ontology.description
            }, {
              label: "Keywords",
              value: $scope.ontology.keywords
            }, {
              label: "Original vocabulary",
              value: $scope.ontology.origVocUri
            }, {
              label: "Documentation",
              value: $scope.ontology.documentation
            }, {
              label: "Organization",
              value: '<a href="#/org/' +$scope.ontology.origMaintainerCode+ '">'+ $scope.ontology.origMaintainerCode+ '</a>'
            }, {
              label: "Contributor",
              value: $scope.ontology.contributor
            }, {
              label: "Reference",
              value: $scope.ontology.reference
            }, {
              label: "Ontology Type",
              value: $scope.ontology.ontologyType,
              omitIfUndef: true
            }
          ]
        }, {
          label: "Usage/License/Permissions",
          props: [
            {
              label: "Manager of source vocabulary",
              value: $scope.ontology.origVocManager
            }, {
              label: "Contact/Responsible Party",
              value: $scope.ontology.contact
            }, {
              label: "Contact role",
              value: $scope.ontology.contactRole
            }, {
              label: "Temporary MMI role",
              value: $scope.ontology.temporaryMmiRole
            }, {
              label: "Author credit required",
              value: $scope.ontology.creditRequired
            }, {
              label: "Citation string",
              value: $scope.ontology.creditCitation
            }
          ]
        }, {
          label: "Original source",
          props: [
            {
              label: "Documentation",
              value: $scope.ontology.origVocDocumentationUri
            }, {
              label: "Descriptive name",
              value: $scope.ontology.origVocDescriptiveName
            }, {
              label: "Version",
              value: $scope.ontology.origVocVersionId
            }, {
              label: "Keywords",
              value: $scope.ontology.origVocKeywords
            }, {
              label: "Syntax format",
              value: $scope.ontology.origVocSyntaxFormat
            }
          ]
        }
      ];
    }
}

})();
