(function() {
  'use strict';

  angular.module('orrportal.voc', ['ui.grid', 'ui.grid.edit', 'ui.grid.cellNav'])

    .controller('VocController', VocController)
  ;


  var usedOntologyEngineeringToolPropertyUri = 'http://omv.ontoware.org/2005/05/ontology#usedOntologyEngineeringTool';
  var voc2rdfPropertyUri = 'http://mmisw.org/ont/mmi/20081020/ontologyMetadata/voc2rdf';
  var rdfsLabelUri = 'http://www.w3.org/2000/01/rdf-schema#label';
  var owlClassUri = 'http://www.w3.org/2002/07/owl#Class';

  VocController.$inject = ['$scope', '$routeParams', 'service'];

  function VocController($scope, $routeParams, service) {
    if (appUtil.debug) console.log("++VocController++");

    var vm = $scope.vm = {};
    vm.uri = $routeParams.uri;

    service.getOntologyFormat(vm.uri, "rj", gotOntology);

    function gotOntology(error, data) {
      if (error) {
        console.error(error);
        return;
      }

      console.log("gotOntology: data=", data);

      var ontProps = data[vm.uri];
      if (!ontProps) {
        console.error("No properties reported for: uri=" +vm.uri);
        return;
      }

      var usedOntologyEngineeringToolValue = ontProps[usedOntologyEngineeringToolPropertyUri];
      console.log("usedOntologyEngineeringToolValue=", usedOntologyEngineeringToolValue);
      if (!usedOntologyEngineeringToolValue) {
        console.error("Property no included: ", usedOntologyEngineeringToolPropertyUri);
        return;
      }

      var isVoc2Rdf = _.any(usedOntologyEngineeringToolValue, {value: voc2rdfPropertyUri});

      if (!isVoc2Rdf) {
          console.error("Ontology not built with voc2rdf");
          return;
      }

      console.log("Yes! voc2rdf");
      vm.data = data;

      vm.classInfos = getClasses(data);

      reorderProperties();

      //prepareGrid(vm.properties, vm.instances);
    }

    function getClasses(data) {
      var classUris = [];
      _.forOwn(data, function(props, uri) {
        var t = props['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'];
        if (t && t.length && t[0].type === "uri" && t[0].value === owlClassUri) {
          classUris.push(uri);
        }
      });
      console.error("CLASSES=", classUris);

      if (!classUris.length) {
        console.error("unexpected: no owl:Class found");
        return;
      }

      var classInfos = _.map(classUris, function(classUri) {
        var classProps = data[classUri];
        var classLabelPropsArray = classProps[rdfsLabelUri];
        if (classLabelPropsArray && classLabelPropsArray.length) {
          var classLabel = classLabelPropsArray[0].value;
        }

        var properties = getProperties(classUri, data);
        var instances = getInstances(classUri, properties, data);

        return {
          uri: classUri,
          label: classLabel,
          properties : properties,
          instances: instances
        };
      });
      console.log("classes=", classInfos);

      return classInfos;
    }

    function getProperties(classUri, data) {
      var properties = [];
      _.each(data, function(props, uri) {
        //console.log("uri=", uri, "props=", props);
        var domain = props['http://www.w3.org/2000/01/rdf-schema#domain'];
        if (domain && domain.length && domain[0].value === classUri) {
          var label = props['http://www.w3.org/2000/01/rdf-schema#label'];
          properties.push({
            uri: uri,
            label: label.length && label[0].value || uri
          });
        }
      });
      console.log("properties=", properties);
      return properties;
    }

    function getInstances(classUri, properties, data) {
      var instances = [];
      _.each(data, function(props, uri) {
        //console.log("uri=", uri, "props=", props);
        var type = props['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'];
        if (type && type.length && type[0].value === classUri) {
          var obj = {
            uri: uri
          };
          _.each(properties, function(property) {
            if (props[property.uri]) {
              obj[property.uri] = props[property.uri];
            }
          });
          instances.push(obj);
        }

      });
      console.log("instances=", instances);
      return instances;

    }

    function reorderProperties() {

    }

    function prepareGrid(properties, instances) {
      vm.gridOptions = {
        columnDefs: getCommonColumnDefs(properties)
        ,data: getInstancesData(properties, instances)
        ,enableGridMenu: true
        ,showGridFooter: true
      };
    }

    function getCommonColumnDefs(properties) {
      var result =_.map(properties, function(property) {
        return {
          field: uri2symbol(property.uri),
          displayName: property.label
        }
      });
      console.log("COLUMNDEFS=", _.cloneDeep(result));
      return result;
    }

    function getInstancesData(properties, instances) {
      var result = _.map(instances, function(instance) {
        var obj = _.cloneDeep(instance);
        _.forOwn(properties, function(property) {
          var array = instance[property.uri];
          var value = array;
          if (array && array.length) {
            value = array[0].value;
          }
          if (value) {
            obj[uri2symbol(property.uri)] = value;
          }
        });
        return obj;
      });
      console.log("INSTANCEDATA=", _.cloneDeep(result));
      return result;
    }

    // replaces all non-word characters with underscore so the value can be used as colDef.field for u-grid.
    // I would expect u-grid to accept something like '"' +uri+ '"' to work but it doesn't.
    function uri2symbol(uri) {
      return uri.replace(/\W/g, '_');
    }
  }

})();
