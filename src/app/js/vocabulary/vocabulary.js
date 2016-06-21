(function(_) {
  'use strict';

  angular.module('orrportal.vocabulary', [])
    .factory('vocabulary', vocabulary)
  ;

  function vocabulary() {
    var byUri = {};
    return {
      byUri: byUri,

      rdf: setDetails("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#", {
        type: {
        }
      }),

      rdfs: setDetails("rdfs", "http://www.w3.org/2000/01/rdf-schema#", {
        label: {
          tooltip: "A human-readable name for the subject."
        },
        comment: {
          tooltip: "A description of the subject resource."
        },
        isDefinedBy: {
          tooltip: "Used to indicate a resource defining the subject resource. " +
            "This property may be used to indicate an RDF vocabulary in which a resource is described."
        },
        seeAlso: {
          tooltip: "Used to indicate a resource that might provide additional information about the subject resource."
        }
      }),

      owl: setDetails("owl", "http://www.w3.org/2002/07/owl#", {
        Ontology: {
        },
        versionInfo: {
          tooltip: "The annotation property that provides version information for an ontology or another OWL construct."
        },
        imports: {
        },
        sameAs: {
          tooltip: "The property that determines that two given individuals are equal."
        }
      }),

      dc: setDetails("dc", "http://purl.org/dc/elements/1.1/", {
        creator: {
          label: "Creator",
          tooltip: "An entity primarily responsible for making the resource."
        },
        contributor: {
          label: "Contributor",
          tooltip: "An entity responsible for making contributions to the resource."
        }
      }),

      dct: setDetails("dct", "http://purl.org/dc/terms/", {
        title: {
          label: "Title",
          tooltip: "A name given to the resource."
        },
        description: {
          label: "Description",
          tooltip: "An account of the resource."
        },
        creator: {
          label: "Creator",
          tooltip: "An entity primarily responsible for making the resource."
        },
        contributor: {
          label: "Contributor",
          tooltip: "An entity responsible for making contributions to the resource."
        },
        rights: {
          label: "Rights",
          tooltip: "Information about rights held in and over the resource."
        },
        license: {
          label: "License",
          tooltip: "A legal document giving official permission to do something with the resource."
        }
      }),

      skos: setDetails("skos", "http://www.w3.org/2004/02/skos/core#", {
        note: {
          tooltip: "SKOS property for general documentation purposes."
        },
        definition: {
          tooltip: "A complete explanation of the intended meaning of a concept."
        },
        exactMatch: {
          tooltip: "The property skos:exactMatch is used to link two concepts, indicating a high degree " +
            "of confidence that the concepts can be used interchangeably across a wide range of " +
            "information retrieval applications. [SKOS Section 10.1] (transitive, symmetric)"
        },
        closeMatch: {
          tooltip: "A skos:closeMatch link indicates that two concepts are sufficiently similar that " +
            "they can be used interchangeably in some information retrieval applications. " +
            "[SKOS Section 10.1] (symmetric)"
        },
        broadMatch: {
          tooltip: "'has the broader concept': the second (object) concept is broader than the first " +
            "(subject) concept [SKOS Section 8.1] (infers broaderTransitive, a transitive relation)"
        },
        narrowMatch: {
          tooltip: "'has the narrower concept': the second (object) concept is narrower than the first " +
            "(subject) concept [SKOS Section 8.1] (infers narrowTransitive, a transitive relation)"
        },
        relatedMatch: {
          tooltip: "The property skos:relatedMatch is used to state an associative mapping link between " +
            "two concepts. [SKOS Section 8.1] (symmetric)"
        }
      }),

      omv: setDetails("omv", "http://omv.ontoware.org/2005/05/ontology#", {
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

      omvmmi: setDetails("omvm", "http://mmisw.org/ont/mmi/20081020/ontologyMetadata/", {
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

    function setDetails(prefix, namespace, obj) {
      _.each(obj, function(term, localName) {
        term.prefix = prefix;
        term.uri = namespace + localName;
        term.localName = localName;
        term.label = term.label || localName;
        byUri[term.uri] = term;
      });
      obj.NS = namespace;
      return obj;
    }
  }

})(_);
