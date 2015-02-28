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
            refreshOntologyMetadata($scope, uri, service)
        }
    }
}

function refreshOntologyMetadata($scope, uri, service) {
    service.refreshOntologyMetadata(uri, gotOntologyMetadata);

    var htmlify = true;

    function gotOntologyMetadata(error, predicates) {
        if (error) {
            console.log("error getting ontology metadata:", error);
            $scope.error = error;
        }
        else {
            var newPredicates = {}; // with htmlified or escaped uri's and values
            _.each(predicates, function(values, predicate) {
                newPredicates[predicate] = _.map(values, function(value) {
                    return htmlify ? appUtil.htmlifyObject(value) : _.escape(value);
                });
            });

            $scope.ontology.metadata = newPredicates;
            _.each($scope.ontology.metadata, setPredicateAndValues);
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
}

})();
