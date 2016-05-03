var vocabulary = (function() {
  'use strict';

  var omvNS = "http://omv.ontoware.org/2005/05/ontology#";
  var omv = {
    NS: omvNS,
    hasCreator: {
      uri: omvNS + "hasCreator",
      label: "Ontology Creator"
    },
    keywords: {
      uri: omvNS + "keywords",
      label: "Keywords"
    }
  };

  var omvmmiNS = "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/";
  var omvmmi = {
    NS: omvmmiNS,
    origMaintainerCode: {
      uri: omvmmiNS + "origMaintainerCode",
      label: "Organization"
    }
  };

  var rdfNS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
  var rdf = {
    NS: rdfNS,
    type: {
      uri: rdfNS + "type",
      label: "type"
    }
  };

  var owlNS = "http://www.w3.org/2002/07/owl#";
  var owl = {
    NS: owlNS,
    Ontology: {
      uri: owlNS + "Ontology",
      label: "Ontology"
    }
  };

  return {
    omv:     omv,
    omvmmi:  omvmmi,
    rdf:     rdf,
    owl:     owl
  }

})();
