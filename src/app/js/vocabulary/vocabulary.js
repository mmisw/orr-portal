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
        subject: {
          label: "Subject",
          tooltip: "The topic of the resource."
        },
        date: {
          label: "Date",
          tooltip: "A point or period of time associated with an event in the lifecycle of the resource."
        },
        source: {
          label: "Source",
          tooltip: "A related resource from which the described resource is derived."
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
          label: "has exact match",
          tooltip: "The property skos:exactMatch is used to link two concepts, indicating a high degree " +
            "of confidence that the concepts can be used interchangeably across a wide range of " +
            "information retrieval applications. [SKOS Section 10.1] (transitive, symmetric)"
        },
        closeMatch: {
          label: "has close match",
          tooltip: "A skos:closeMatch link indicates that two concepts are sufficiently similar that " +
            "they can be used interchangeably in some information retrieval applications. " +
            "[SKOS Section 10.1] (symmetric)"
        },
        broadMatch: {
          label: "has broader match",
          tooltip: "'has the broader concept': the second (object) concept is broader than the first " +
            "(subject) concept [SKOS Section 8.1] (infers broaderTransitive, a transitive relation)"
        },
        narrowMatch: {
          label: "has narrower match",
          tooltip: "'has the narrower concept': the second (object) concept is narrower than the first " +
            "(subject) concept [SKOS Section 8.1] (infers narrowTransitive, a transitive relation)"
        },
        relatedMatch: {
          label: "has related match",
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
        },
        hasDomain: {
          label: "hasDomain",
          tooltip: "An object property to indicate the subject domain of the ontology."
        },
        creationDate: {
          label: "creationDate",
          tooltip: "Date when the ontology was initially created."
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
          label: "Manager of source vocabulary",
          tooltip: 'Who actively maintains the source vocabulary (used to build the ontology) and the changes to it. ' +
          'Specify an individual or very specific organization, by name or as a URI. Include phone, mail, ' +
          'and URL in parentheses after the specification, if available: ' +
          'First Last (831-nnn-nnnn, name@domain.com, http://domain.com/myHomePage). ' +
          'If the vocabulary is not actively maintained, put "None" in this field.'
        },
        contact: {
          label: "Contact/Responsible Party",
          tooltip: 'Who is responsible for distribution of the vocabulary, particularly to MMI. ' +
          '(In other words, who MMI and the public should contact for more information, or to negotiate changes.) ' +
          'This should be a specific person or authorized department. Include phone, mail, and URL in parentheses ' +
          'after the name, if available: First Last (831-nnn-nnnn, name@domain.com, http://domain.com/myHomePage). ' +
          'Note also the next field shows possible roles this person plays with respect to this product.'
        },
        contactRole: {
          label: "Contact role",
          tooltip: 'What is the role played by the Contact/Responsible Party named above? Choose the most senior ' +
          'authority that applies of: Content Manager: the person/organization that manages the content of the ' +
          'vocabulary Ontology Producer: the person/organization that creates (and possibly serves) this ' +
          'information in an ontology Organizational Manager: the person/organization manager that is ' +
          'responsible overall for producing this data product (but does not necessarily produce it themselves) ' +
          'IP Negotiator: the person/organization that handles intellectual property, including this vocabulary ' +
          'or ontology Other: specify if none of these fit'
        },


        /*



         */

        temporaryMmiRole: {
          label: "Temporary MMI role",
          tooltip: "Until an agreement is reached on MMI's role, what role is MMI currently playing: " +
          "Content Manager: MMI actively manages this vocabulary content and is responsible (with the community) " +
          "for its creation Ontology Producer: MMI accepts vocabulary content from the community and turns it " +
          "into a served ontology Ontology Republisher: MMI accepts an ontology, caches it, and produces its " +
          "own copy of the ontology in order to provide additional services (URI generation, revision history " +
          "maintenance and tracking, and so on)."
        },
        creditRequired: {
          label: "Author credit required",
          tooltip: "Specifies whether users of the ontology have to provide credit to its creator. " +
          "Please choose whatever applies ('no' is a very helpful selection), and enter the next field " +
          "if the select here is 'yes' or 'conditional'. Leave blank if you aren't sure."
        },
        creditCitation: {
          label: "Citation string",
          tooltip: 'Free text containing the credit language that should be included in works based on this ontology'
        },
        origVocDocumentationUri: {
          label: "Documentation",
          tooltip: 'If the original vocabulary is formally served in an easily parseable way at a URI ' +
          '(e.g., using RDF, OWL, or comma- or tab-delimited text entries), please specify the URI here.'
        },
        origVocDescriptiveName: {
          label: "Descriptive name",
          tooltip: 'Descriptive name for the original vocabulary (typically in Dublin Core or Ontology Metadata Vocabulary entries)'
        },
        origVocVersionId: {
          label: "Version",
          tooltip: 'Version identification string associated with original vocabulary (typically in Dublin ' +
          'Core or Ontology Metadata Vocabulary entries).'
        },
        origVocKeywords: {
          label: "Keywords",
          tooltip: 'Keywords specified for original vocabulary (typically in Dublin Core or Ontology Metadata Vocabulary entries).'
        },
        origVocSyntaxFormat: {
          label: "Syntax format",
          tooltip: "Format/syntax in which vocabulary is provided (one of: RDF, OWL, 'other XML', CSV, tab-delimited, HTML, or other)."
        }
      }),

      vs: setDetails("vs", "http://www.w3.org/2003/06/sw-vocab-status/ns#", {
        term_status: {
          label: "status",
          tooltip: "Status of a vocabulary term or resource, expressed as a short symbolic string. " +
            "Possible values include draft, unstable, testing, stable, deprecated, and archaic."
          // Note: a bit generalized
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
