'use strict';


 angular.module('catalogueApp')
 .factory('dynamicGraphService', ['machadaloHttp','$stateParams','$rootScope','$routeParams', '$location',
  function (machadaloHttp, $stateParams, $rootScope, $routeParams, $location) {

    var url_root = 'v0/ui/';
    var dynamicGraphService = {};


      dynamicGraphService.getDistributionGraphsStatics = function(data){
        console.log(data);
      var url =  url_root  + "analytics/get-leads-data-generic/";
      return machadaloHttp.put(url,data);
    }

    return dynamicGraphService;

 }]);
