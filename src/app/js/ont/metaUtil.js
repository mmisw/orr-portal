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
          tooltip: "General information about this ontology, who created it, and where it came from.",
          predicates: [
            required(omv.name),
            required(omv.description),
            omvmmi.hasResourceType,
            hideForNew(omvmmi.hasContentCreator),
            omv.hasCreator,
            omv.keywords,
            omv.origVocUri,
            hideForNew(omvmmi.origMaintainerCode),
            omv.hasContributor,
            omv.reference
          ]
        },

        usage: {
          header: "Usage/License/Permissions",
          tooltip: "The Usage, License, and Permissions fields help keep track of how we obtained this vocabulary (and know it is OK to serve to others), and on what terms other people can use it.",
          predicates: [
            omvmmi.origVocManager,
            omvmmi.contact,
            omvmmi.contactRole,
            hideForNew(omvmmi.temporaryMmiRole),
            omvmmi.creditRequired,
            omvmmi.creditCitation
          ]
        },

        source: {
          header: "Original source",
          tooltip: "Specific metadata that was documented in the original vocabulary, so you can see how it was originally documented.",
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
          hideForNew: true,
          tooltip: 'Ontology metadata properties not classified/aggregated in other sections (TODO)'
        }
      };

      return _.map(sectionKeys, function(key) {
        return sectionObj[key];
      });

      function required(predicate) {
        return addAttrs(predicate, {required: true});
      }

      function hideForNew(predicate) {
        return addAttrs(predicate, {hideForNew: true});
      }

      function addAttrs(predicate, attrs) {
        return _.assign(_.cloneDeep(predicate), attrs);
      }
    }
  }

})();
