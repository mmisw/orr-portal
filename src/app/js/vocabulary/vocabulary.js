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
          label: "Name",
          tooltip: "A one-line descriptive title (title case) for the ontology."
        },
        description: {
          label: "Description",
          tooltip: "A textual description of the ontology. Completeness is welcome."
        },
        hasCreator: {
          label: "Ontology Creator",
          tooltip: "The name of the person that created the ontology representation."
        },
        keywords: {
          label: "Keywords",
          tooltip: {
            edit: "Enter a list of keywords separated by commas",
            view: "Associated keywords"
          }
        },
        documentation: {
          label: "Documentation",
          tooltip: "URL of page or site describing the ontology."
        },
        hasContributor: {
          label: "Contributor",
          tooltip: {
            edit: "List of all the individuals and/or organizations that contributed materially to this vocabulary/ontology. " +
                  "You may use comma-separated names or URIs. This is a free text field.",
            view: "List of all the individuals and/or organizations that contributed materially to this vocabulary/ontology."
          }
        },
        reference: {
          label: "Reference",
          tooltip: "Bibliographic references describing the ontology and its applications."
        }
      }),

      omvmmi: setDetailsAndNS("http://mmisw.org/ont/mmi/20081020/ontologyMetadata/", {
        hasResourceType: {
          label: "Resource type",
          tooltip: {
            edit: "The kind of resource represented by the ontology. You can choose from any of the existing terms in the list, or specify a new one.",
            view: "The kind of resource represented by the ontology."
          }
        },
        hasContentCreator: {
          label: "Content Creator",
          tooltip: "The name of the person that created the contents reflected in the ontology."

        },
        origVocUri: {
          label: "Original vocabulary",
          tooltip: {
            edit: "If the original vocabulary is published on-line, put its URL here.",
            view: "URL of original vocabulary."
          }
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
