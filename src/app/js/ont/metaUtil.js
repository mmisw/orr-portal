(function() {
  'use strict';

  angular.module('orrportal.metaUtil', [])
    .factory('metaUtil', metaUtil)
  ;

  metaUtil.$inject = ['vocabulary'];
  function metaUtil(vocabulary) {
    var dc     = vocabulary.dc;
    var dct    = vocabulary.dct;
    var rdfs   = vocabulary.rdfs;
    var owl    = vocabulary.owl;
    var omv    = vocabulary.omv;
    var omvmmi = vocabulary.omvmmi;

    var sectionKeys = ["general", "usage", "source", "other"];
    var sectionObj = {};
    var sections = getSections();
    var handledPredicateUris = getHandledPredicateUris();

    return {
      sections:             sections,
      handledPredicateUris: handledPredicateUris,
      otherSection:         sectionObj.other

      ,removeDuplicateMetadataAttributes: removeDuplicateMetadataAttributes
    };

    function htmlfyTooltip(t) {
      return '<div class="left">' +t+ '</div>';
    }

    function getSections() {
      sectionObj.general = {
        header: "General",
        tooltip: htmlfyTooltip("General information about this ontology, who created it, and where it came from."),
        /*
         * TODO: review this, but for now hide some "standard" properties here to avoid duplicates in
         * entries that the old system added as copies of omv/omvmmi property values)
         */
        predicates: [
          required(hideIfUndefined(omv.name)),
          hideIfUndefined(hideForNew(dct.title)),
          hideIfUndefined(hideForNew(dc.title)),
          hideIfUndefined(hideForNew(rdfs.label)),
          required(hideIfUndefined(omv.description)),
          hideIfUndefined(hideForNew(dct.description)),
          hideIfUndefined(hideForNew(dc.description)),
          hideIfUndefined(hideForNew(rdfs.comment)),
          hideIfUndefined(hideForNew(owl.versionInfo)),
          hideIfUndefined(omvmmi.hasResourceType),
          hideIfUndefined(hideForNew(omvmmi.hasContentCreator)),
          hideIfUndefined(omv.hasCreator),
          hideIfUndefined(hideForNew(dct.creator)),
          hideIfUndefined(hideForNew(dc.creator)),
          hideIfUndefined(omv.keywords),
          hideIfUndefined(omvmmi.origVocUri),
          //hideForNew(omvmmi.origMaintainerCode),
          hideIfUndefined(omv.documentation),
          hideIfUndefined(omv.hasContributor),
          //hideIfUndefined(hideForNew(dc.contributor)),
          hideIfUndefined(hideForNew(dct.contributor)),
          hideIfUndefined(omv.reference),
          hideIfUndefined(rdfs.seeAlso)
        ]
      };

      sectionObj.usage = {
        header: "Usage/License/Permissions",
        tooltip: htmlfyTooltip("The Usage, License, and Permissions fields help keep track of how we obtained " +
          "this vocabulary (and know it is OK to serve to others), and on what terms other people can use it."),
        predicates: [
          hideIfUndefined(hideForNew(dct.rights)),
          hideIfUndefined(hideForNew(dct.license)),
          omvmmi.origVocManager,
          omvmmi.contact,
          omvmmi.contactRole,
          hideIfUndefined(hideForNew(omvmmi.temporaryMmiRole)),
          omvmmi.creditRequired,
          omvmmi.creditCitation
        ]
      };

      sectionObj.source = {
        header: "Original source",
        tooltip: htmlfyTooltip("Specific metadata that was documented in the original vocabulary, " +
          "so you can see how it was originally documented."),
        predicates: [
          omvmmi.origVocDocumentationUri,
          omvmmi.origVocDescriptiveName,
          omvmmi.origVocVersionId,
          omvmmi.origVocKeywords,
          omvmmi.origVocSyntaxFormat
        ]
      };

      sectionObj.other = {
        header: "Other",
        hideForNew: true,
        tooltip: htmlfyTooltip('Properties not classified/aggregated in other sections')
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

      function hideIfUndefined(predicate) {
        return addAttrs(predicate, {hideIfUndefined: true});
      }

      function addAttrs(predicate, attrs) {
        return _.assign(_.cloneDeep(predicate), attrs);
      }
    }

    function getHandledPredicateUris() {
      var uris = [];
      _.each(sections, function(s) {
        _.each(s.predicates, function(p) {
          uris.push(p.uri);
        })
      });
      return uris;
    }

    /**
     * The old ORR system added duplicate values according to rather ad hoc, and
     * never formally discussed or agreed upon, "equivalence" predicates
     * (see MdHelper class in old mmiorr code.)
     * This function removes any such duplications from ontology.metadata.
     */
    function removeDuplicateMetadataAttributes(ontology) {
      var duplicatePredicates = getPredicatesForDuplicateValueRemoval();
      //console.debug("removeDuplicateMetadataAttributes:", duplicatePredicates);
      var curMetadata = ontology.metadata || {};

      _.each(duplicatePredicates, function(keepUri, removeUri) {
        var remValues  = curMetadata[removeUri];
        var keepValues = curMetadata[keepUri];
        var remaining = _.filter(remValues, function(remValue) {
          return !_.contains(keepValues, remValue);
        });
        if (remaining && remaining.length) {
          curMetadata[removeUri] = remaining;
        }
        else delete curMetadata[removeUri];
      });

      ontology.metadata = curMetadata;
      return ontology;

      /*
       * @returns object d, where d[removeUri] == keepUri means:
       *          if both predicates have the same value in an ontology's
       *          metadata, remove the value from removeUri.
       */
      function getPredicatesForDuplicateValueRemoval() {
        var d = {};

        // according to MdHelper in old ORR system
        d[dc.subject.uri]      = omv.hasDomain.uri;
        d[dc.creator.uri]      = omv.hasCreator.uri;
        d[dc.description.uri]  = omv.description.uri;
        d[dc.date.uri]         = omv.creationDate.uri;
        d[dc.contributor.uri]  = omv.hasContributor.uri;
        d[rdfs.label.uri]      = omv.name.uri;
        d[dc.source.uri]       = omvmmi.origVocUri.uri;

        return d;
      }
    }
  }

})();
