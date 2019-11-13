angular.module('catalogueApp')
.controller('loginLogsCtrl',
    ['$scope', '$rootScope', '$window', '$location','loginLogsService','$stateParams','commonDataShare','constants','$timeout','Upload','cfpLoadingBar','permissions',
    function ($scope, $rootScope, $window, $location, loginLogsService, $stateParams,commonDataShare,constants,$timeout,Upload,cfpLoadingBar, permissions) {

      $scope.loginLogsData = [];
    var getAllLoginLogs = function(){

      loginLogsService.getAllLoginLogs()
      .then(function onSuccess(response){
        $scope.loginLogsData = response.data.data;
        console.log(response);
      }).catch(function onError(response){
        console.log(response);
      })
    }
    getAllLoginLogs();
}]);
