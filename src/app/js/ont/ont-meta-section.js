(function() {
  'use strict';

  var debug = appUtil.debug;
  //debug = true;

  angular.module('orrportal.ont.contents')
    .directive('ontMetaSection', OntMetaSectionDirective)
  ;

  OntMetaSectionDirective.$inject = [];
  function OntMetaSectionDirective() {
    if (debug) console.log("++OntMetaSectionDirective++");

    function link(scope, el, attrs, orrOnt) {
      scope.setEditInProgress = function(inProgress) {
        orrOnt.setMetaEditInProgress(inProgress);
      };
      scope.someEditInProgress = function() {
        return orrOnt.someEditInProgress();
      };
    }

    return {
      restrict:  'E',
      require:   '^orrOnt',
      templateUrl: 'js/ont/views/ont-meta-section.tpl.html',
      controller: OntMetaSectionController,
      link: link,
      scope: {
        ontMeta:    '=',
        predicates: '=',
        editMode:   '='
      }
    }
  }

  OntMetaSectionController.$inject = ['$scope'];
  function OntMetaSectionController($scope) {
    $scope.debug = debug = debug || $scope.debug;
    if (debug) console.log("++OntMetaSectionController++ $scope=", $scope);

    $scope.$watch("editMode", function(editMode) {
      //console.debug("OntMetaSectionController: editMode=", editMode);
      update();
    });

    function update() {
      $scope.visiblePredicates = _.filter($scope.predicates, function(p) {
        if ($scope.editMode) {
          return !p.hideForNew;
        }
        else if (p.hideIfUndefined) {
          //console.debug("hideIfUndefined p=", p, $scope.ontMeta[p.uri]);
          return $scope.ontMeta && $scope.ontMeta[p.uri];
        }
        return true;
      });

    }

    $scope.predicateTooltip = function(predicate) {
      var text = "";
      if (predicate.tooltip) {
        if (predicate.tooltip.edit || predicate.tooltip.view) {
          if (predicate.tooltip.edit && $scope.editMode) {
            text = predicate.tooltip.edit;
          }
          else if (predicate.tooltip.view && !$scope.editMode) {
            text = predicate.tooltip.view;
          }
        }
        else {
          text = predicate.tooltip;
        }
      }
      var tooltip = "<span>" + (text ? text + "<br><br>" : "");
      tooltip += '<span class="fs-smaller">' +
        appUtil.mklinks4text(predicate.uri, true)+ '</span>';
      tooltip += "</span>";
      return tooltip;
    }
  }

})();
