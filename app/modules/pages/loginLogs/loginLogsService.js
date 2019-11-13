'use strict';
angular.module('catalogueApp')
.factory('loginLogsService', ['machadaloHttp','$stateParams','$rootScope','$routeParams', '$location', '$http',
 function (machadaloHttp, $stateParams, $rootScope, $routeParams, $location, $http) {

   var url_base = 'v0/ui/website/';
   var loginLogsService = {};

   loginLogsService.getAllLoginLogs = function(){
     var url = url_base + "get_login_log/";
     return machadaloHttp.get(url);
   }


   return loginLogsService;
   }]);
