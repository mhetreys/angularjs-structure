  'use strict';
/**
 * @ngdoc function
 * @name machadaloPages.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the machadaloPages
 */

angular.module('machadaloPages')
.factory('societyListService', ['machadaloHttp','$stateParams','$rootScope','$routeParams', '$location',
  function (machadaloHttp, $stateParams, $rootScope, $routeParams, $location) {

  //var url_base = 'http://machadalocore.ap-southeast-1.elasticbeanstalk.com/';
  var url_base = 'v0/ui/';
  //var url_base1 = "v0/ui/";
	var societyListService = {};

  societyListService.listSocieties = function (sObj) {
     var url = url_base + "society/list/";
     if(sObj && sObj != "")
      url += "?search="+sObj;
     return machadaloHttp.get(url);
   };

   societyListService.getSocietyList = function(data,sObj) {
     var url = url_base + "society/filterList/";
     if(sObj && sObj != "")
      url += "?search="+sObj;
     return machadaloHttp.post(url, data);
   };

   societyListService.listFilterValues = function(data){
     var url = url_base + "society/filter/";
     return machadaloHttp.get(url);
   };


   societyListService.getSubAreas = function(data){
      var url = url_base + "society/filterSubArea/";
      return machadaloHttp.post(url,data);
   }


  //for adding shortlisted societies
  societyListService.addShortlistedSociety = function(campaign_id, society_id){
    var url = url_base + "website/campaign/society/shortlist/";
    var data = {campaign_id, society_id};
    return machadaloHttp.post(url, data);
  }

  societyListService.getSortedSocieties = function(order,society_ids){
    var url = url_base + "societyList/sortedSocieties/?order=" + order;
    return machadaloHttp.post(url,society_ids);
  }

  societyListService.processParam = function(){
   if($stateParams.campaignId){
     $rootScope.campaignId = $stateParams.campaignId;
   }else {
     $rootScope.campaignId = null;
    }
  };
  return societyListService;
}]);
