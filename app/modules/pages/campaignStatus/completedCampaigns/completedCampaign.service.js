'use strict';


 angular.module('catalogueApp')
 .factory('completedCampaignService', ['machadaloHttp','$stateParams','$rootScope','$routeParams', '$location',
  function (machadaloHttp, $stateParams, $rootScope, $routeParams, $location) {

    var url_base = 'v0/ui/website/';

    var completedCampaignService = {};



    return completedCampaignService;

 }]);
