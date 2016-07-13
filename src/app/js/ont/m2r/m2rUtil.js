var m2rUtil = (function() {
  'use strict';

  return {
    entityData2Dict: entityData2Dict,
    updateOntDataMappingsWithRemovedTriples: updateOntDataMappingsWithRemovedTriples
  };

  function entityData2Dict(data) {
    var dict = {};
    _.each(data, function(entity) {
      if (!dict[entity.predicateUri]) {
        dict[entity.predicateUri] = {};
      }
      if (!dict[entity.predicateUri][entity.subjectUri]) {
        dict[entity.predicateUri][entity.subjectUri] = [];
      }
      dict[entity.predicateUri][entity.subjectUri].push(entity.objectUri);
    });
    return dict;
  }

  function updateOntDataMappingsWithRemovedTriples(currOntDataMappings, oldTriplesDict) {
    //console.debug("removeSelectedDefinedMappings: " +
    //  "currOntDataMappings=", currOntDataMappings, "oldTriplesDict=", oldTriplesDict);

    // capture all current mappings indexed by predicate like this:
    var current = {};  // { predicate: { subject: [objects...] } }
    _.each(currOntDataMappings, function(m) {
      if (!current[m.predicate]) {
        current[m.predicate] = {};
      }
      if (!current[m.predicate]) {
        current[m.predicate] = {subjects: [], objects: []};
      }
      _.each(m.subjects, function(subject) {
        if (!current[m.predicate][subject]) {
          current[m.predicate][subject] = [];
        }
        _.each(m.objects, function(object) {
          current[m.predicate][subject].push(object);
        });
      });
    });

    // from current remove all triples in oldTriplesDict
    _.each(current, function(subjects, predicate) {
      if (oldTriplesDict[predicate]) {
        _.each(subjects, function(objects, subject) {
          if (oldTriplesDict[predicate][subject]) {
            current[predicate][subject] = _.difference(
              current[predicate][subject],
              oldTriplesDict[predicate][subject]
            );
            if (!current[predicate][subject].length) {
              delete current[predicate][subject];
            }
          }
        });
        if (!_.keys(current[predicate]).length) {
          delete current[predicate];
        }
      }
    });

    // prepare result with sorting by predicate
    var newOntDataMappings = [];
    _.each(current, function(subjects, predicate) {
      _.each(subjects, function(objects, subject) {
        newOntDataMappings.push({
          subjects:   [subject],
          predicate:  predicate,
          objects:    _.sortBy(objects)
        });
      });
    });
    newOntDataMappings = _.sortBy(newOntDataMappings, 'predicate');

    // finally, update currOntDataMappings:
    currOntDataMappings.splice(0);
    _.each(newOntDataMappings, function(item) {
      currOntDataMappings.push(item);
    });

    return currOntDataMappings;
  }

})();
