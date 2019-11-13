/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('catalogueApp.theme.components')
      .directive('widgets', widgets);

  /** @ngInject */
  function widgets() {
    return {
      restrict: 'EA',
      scope: {
        ngModel: '='
      },
      templateUrl: 'modules/theme/components/widgets/widgets.html',
      replace: true
    };
  }

})();
