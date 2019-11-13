'use strict';
angular.module('catalogueApp')
.factory('changePasswordService', ['machadaloHttp','$stateParams','$rootScope','$routeParams', '$location', '$http',
 function (machadaloHttp, $stateParams, $rootScope, $routeParams, $location, $http) {

   var url_base_user = 'v0/';
   var changePasswordService = {};

   changePasswordService.changePassword = function(id,data){
     var url = url_base_user + "user/" + id + "/change_password/";
     return machadaloHttp.post(url,data);
   }


   return changePasswordService;
   }]);
