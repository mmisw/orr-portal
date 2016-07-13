'use strict';

describe('m2rUtil', function() {

  describe('#entityData2Dict', function () {

    it('should be {} with [] input', function () {
      expect(m2rUtil.entityData2Dict([])).toEqual({});
    });

    it('should work', function () {
      expect(m2rUtil.entityData2Dict(
        [
          {
            subjectUri:   "s1",
            predicateUri: "p1",
            objectUri:    "o1"
          }
        ]
      )).toEqual(
        {
          "p1" : {
            "s1":  ["o1"]
          }
        }
      );
    });

    it('should work', function () {
      expect(m2rUtil.entityData2Dict(
        [
          {
            subjectUri:   "s1",
            predicateUri: "p1",
            objectUri:    "o1"
          }, {
            subjectUri:   "s1",
            predicateUri: "p1",
            objectUri:    "o2"
          }, {
            subjectUri:   "s1",
            predicateUri: "p1",
            objectUri:    "o3"
          }, {
            subjectUri:   "s2",
            predicateUri: "p1",
            objectUri:    "o1"
          }, {
            subjectUri:   "s2",
            predicateUri: "p1",
            objectUri:    "o2"
          }
        ]
      )).toEqual(
        {
          "p1" : {
            "s1":  ["o1", "o2", "o3"],
            "s2":  ["o1", "o2"]
          }
        }
      );
    });
  });

  describe('#updateOntDataMappingsWithRemovedTriples', function () {
    it('should be [] with [] inputs', function () {
      expect(m2rUtil.updateOntDataMappingsWithRemovedTriples(
        [], [])).toEqual([]);
    });

    it('should work with removing single triple ', function () {
      expect(m2rUtil.updateOntDataMappingsWithRemovedTriples(
        [
          {
            subjects:  ["s1"],
            predicate: "p1",
            objects:  ["o1"]
          }
        ],
        {
          "p1" : {
            "s1":  ["o1"]
          }
        }
      )).toEqual(
        []
      );
    });

    it('should work', function () {
      expect(m2rUtil.updateOntDataMappingsWithRemovedTriples(
        [
          {
            subjects:  ["s1", "s2"],
            predicate: "p1",
            objects:  ["o1", "o2", "o3"]
          }
        ],
        {
          "p1" : {
            "s2":  ["o1", "o2", "o3"]
          }
        }
      )).toEqual(
        [
          {
            subjects:  ["s1"],
            predicate: "p1",
            objects:  ["o1", "o2", "o3"]
          }
        ]
      );
    });

    it('should work', function () {
      expect(m2rUtil.updateOntDataMappingsWithRemovedTriples(
        [
          {
            subjects:  ["s1", "s2"],
            predicate: "p1",
            objects:  ["o1", "o2", "o3"]
          }, {
            subjects:  ["s1"],
              predicate: "p2",
              objects:  ["o1", "o2", "o3"]
          }
        ],
        {
          "p1" : {
            "s2":  ["o1", "o2", "o3"]
          },
          "p2" : {
            "s1":  ["o2"]
          }
        }
      )).toEqual(
        [
          {
            subjects:  ["s1"],
            predicate: "p1",
            objects:  ["o1", "o2", "o3"]
          }, {
            subjects:  ["s1"],
            predicate: "p2",
            objects:  ["o1", "o3"]
          }
        ]
      );
    });

  });
});
