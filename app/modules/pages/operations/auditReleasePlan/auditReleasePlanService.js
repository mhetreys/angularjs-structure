'use strict';
angular.module('catalogueApp')
.factory('auditReleasePlanService', ['machadaloHttp','$stateParams','$rootScope','$routeParams', '$location', '$http',
 function (machadaloHttp, $stateParams, $rootScope, $routeParams, $location, $http) {

   var url_base = 'v0/ui/website/';
   var auditReleasePlanService = {};


   auditReleasePlanService.getCampaignReleaseDetails = function(proposal_id, page, supplierId){
     if(supplierId){
       var url = url_base + proposal_id + "/campaign-inventories/?page=" + page
                                      + "&search=" + supplierId;
     }else{
       var url = url_base + proposal_id + "/campaign-inventories/?page=" + page;
     }
     return machadaloHttp.get(url);
   }


    auditReleasePlanService.updateAuditReleasePlanDetails = function(proposal_id,data){
         var url = url_base + proposal_id + "/campaign-inventories/";
      return machadaloHttp.put(url,data);
    }

    auditReleasePlanService.saveUser = function(data){
      var url = url_base + 'inventory-activity-assignment/';
      return machadaloHttp.post(url,data);
    }

    auditReleasePlanService.saveActivityDetails = function(data){
      var url = url_base + 'inventory-activity-date-user-assignment/';
      return machadaloHttp.post(url,data);
    }

    auditReleasePlanService.deleteInvActAssignment = function(id,data){
      var url = url_base + 'delete-inv-activity-assignment/' + id + "/";
      return machadaloHttp.post(url,data);
    }

    auditReleasePlanService.getInventoryRelatedData = function(){
      var url = url_base + 'get-adinventorytype-and-durationtype-data/';
      return machadaloHttp.get(url);
    }

    auditReleasePlanService.addAdInventoryIds = function(data){
      var url = url_base + 'add-dynamic-inventory-ids/';
      return machadaloHttp.post(url,data);
    }

    auditReleasePlanService.deleteAdInventoryIds = function(data){
      var url = url_base + 'delete-ad-inventory-ids/';
      return machadaloHttp.post(url,data);
    }

    auditReleasePlanService.addComment = function(campaignId, data){
      var url = url_base +  campaignId + "/comment/";
      return machadaloHttp.post(url,data);
    }

    auditReleasePlanService.viewComments = function(campaignId, spaceId, relatedTo){
      var url = url_base +  campaignId + "/comment/?shortlisted_spaces_id=" + spaceId + "&related_to=" + relatedTo;
      return machadaloHttp.get(url);
    }

    auditReleasePlanService.getPhases = function(campaignId){
      var url = url_base  + "supplier-phase/?campaign_id=" + campaignId;
      return machadaloHttp.get(url);
    }

    auditReleasePlanService.getOrganisationsForAssignment = function(){
      var url = url_base  + "organisation/get_organisations_for_assignment/";
      return machadaloHttp.get(url);
    }

    auditReleasePlanService.searchSupplierBySelection = function(campaignId){
      var url = url_base + campaignId + "/list_suppliers/";
      return machadaloHttp.get(url);
    }

   return auditReleasePlanService;
  return 0;
}]);
