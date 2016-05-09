(function(_) {
  'use strict';

  angular.module('orrportal.vocabulary', [])
    .factory('vocabulary', vocabulary)
  ;

  function vocabulary() {
    return {
      rdf: setDetailsAndNS("http://www.w3.org/1999/02/22-rdf-syntax-ns#", {
        type: {
        }
      }),

      owl: setDetailsAndNS("http://www.w3.org/2002/07/owl#", {
        Ontology: {
        }
      }),

      omv: setDetailsAndNS("http://omv.ontoware.org/2005/05/ontology#", {
        name: {
          label: "Name"
        },
        description: {
          label: "Description"
        },
        hasCreator: {
          label: "Ontology Creator"
        },
        keywords: {
          label: "Keywords"
        },
        origVocUri: {
          label: "Original vocabulary"
        },
        documentation: {
          label: "Documentation"
        },
        hasContributor: {
          label: "Contributor"
        },
        reference: {
          label: "Reference"
        }
      }),

      omvmmi: setDetailsAndNS("http://mmisw.org/ont/mmi/20081020/ontologyMetadata/", {
        hasResourceType: {
          label: "Resource type"
        },
        hasContentCreator: {
          label: "Content Creator"
        },
        origVocUri: {
          label: "Original vocabulary"
        },
        origMaintainerCode: {
          label: "Organization"
        },
        origVocManager: {
          label: "Manager of source vocabulary"
        },
        contact: {
          label: "Contact/Responsible Party"
        },
        contactRole: {
          label: "Contact role"
        },
        temporaryMmiRole: {
          label: "Temporary MMI role"
        },
        creditRequired: {
          label: "Author credit required"
        },
        creditCitation: {
          label: "Citation string"
        },
        origVocDocumentationUri: {
          label: "Documentation"
        },
        origVocDescriptiveName: {
          label: "Descriptive name"
        },
        origVocVersionId: {
          label: "Version"
        },
        origVocKeywords: {
          label: "Keywords"
        },
        origVocSyntaxFormat: {
          label: "Syntax format"
        }
      })
    };

    function setDetailsAndNS(namespace, obj) {
      _.each(obj, function(term, localName) {
        term.uri = namespace + localName;
        term.label = term.label || localName;
      });
      obj.NS = namespace;
      return obj;
    }
  }

})(_);
