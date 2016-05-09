(function() {
  'use strict';

  angular.module('orrportal.metaUtil', [])
    .factory('metaUtil', metaUtil)
  ;

  metaUtil.$inject = ['vocabulary'];
  function metaUtil(vocabulary) {
    var omv    = vocabulary.omv;
    var omvmmi = vocabulary.omvmmi;

    return {
      sections: getSections()
    };

    function getSections() {
      var sectionKeys = ["general", "usage", "source", "other"];
      var sectionObj = {
        general: {
          header: "General",
          predicates: [
            omv.name,
            omv.description,
            omvmmi.hasResourceType,
            omvmmi.hasContentCreator,
            omv.hasCreator,
            omv.keywords,
            omv.origVocUri,
            omvmmi.origMaintainerCode,
            omv.hasContributor,
            omv.reference
          ]
        },

        usage: {
          header: "Usage/License/Permissions",
          predicates: [
            omvmmi.origVocManager,
            omvmmi.contact,
            omvmmi.contactRole,
            omvmmi.temporaryMmiRole,
            omvmmi.creditRequired,
            omvmmi.creditCitation
          ]
        },

        source: {
          header: "Original source",
          predicates: [
            omvmmi.origVocDocumentationUri,
            omvmmi.origVocDescriptiveName,
            omvmmi.origVocVersionId,
            omvmmi.origVocKeywords,
            omvmmi.origVocSyntaxFormat
          ]
        },

        other: {
          header: "Other",
          tooltip: 'Ontology metadata properties not classified/aggregated in other sections (TODO)'
        }
      };

      return _.map(sectionKeys, function(key) {
        return {
          header:     sectionObj[key].header,
          predicates: sectionObj[key].predicates
        };
      });
    }
  }

})();
