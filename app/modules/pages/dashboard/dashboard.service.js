'use strict';


 angular.module('catalogueApp')
 .factory('DashboardService', ['machadaloHttp','$stateParams','$rootScope','$routeParams', '$location','$http',
  function (machadaloHttp, $stateParams, $rootScope, $routeParams, $location, $http) {

    var url_base = 'v0/ui/website/';
    var url_base_proposal = 'v0/ui/proposal/';
    var url_analytics = 'v0/ui/analytics/';
    var url_root = 'v0/ui/';
    var url_base_user = 'v0/';
    var DashboardService = {};

    DashboardService.getCampaigns = function(campaignId, category, date,vendor){
        if(vendor){
          var url = url_base + "campaign-list/" + campaignId + "/?category=" + category + "&date=" +date + "&vendor=" + vendor;
        }else {
          var url = url_base + "campaign-list/" + campaignId + "/?category=" + category + "&date=" +date;
        }
        return machadaloHttp.get(url);
    }

    DashboardService.getCampaignDetails = function(campaignId,query){
      var url = url_base + "dashboard/suppliers_booking_status/?campaign_id=" + campaignId +"&query=" + query;
      return machadaloHttp.get(url);
    }


    DashboardService.getAllCampaignsData = function(organisationId,category){
      var url = url_base + "campaigns-assigned-inventory-counts/" + organisationId + "/?category=" + category;
      return machadaloHttp.get(url);
    }

    DashboardService.getAssignedIdsAndImages = function(organisationId,category,type,date,inventory){
      var url = url_base + "campaigns-assigned-inventory-ids-and-images/" + organisationId + "/?category=" + category
              + "&type=" + type + "&date=" + date + "&inventory=" + inventory;
      return machadaloHttp.get(url);
    }

    DashboardService.getCountOfSupplierTypesByCampaignStatus = function(campaignStatus){
      var url = url_base + "dashboard/get_count_of_supplier_types_by_campaign_status/?status=" + campaignStatus;
      return machadaloHttp.get(url);
    }

    DashboardService.getSuppliersOfCampaignWithStatus = function(campaignId){
      var url = url_base + "dashboard/get_suppliers_current_status/?campaign_id=" + campaignId;
      return machadaloHttp.get(url);
    }

    DashboardService.getCampaignFilters = function(campaignId){
      var url = url_base + "dashboard/get_campaign_filters/?campaign_id=" + campaignId;
      return machadaloHttp.get(url);
    }

    DashboardService.getPerformanceMetricsData = function(campaignId,type,inv,perf_param){
      var url = url_base + "dashboard/get_performance_metrics_data/?campaign_id=" + campaignId + "&type=" + type + "&inv_code=" + inv + "&perf_param="+perf_param;
      return machadaloHttp.get(url);
    }

    DashboardService.getLocationData = function(campaignId,inv){
      var url = url_base + "dashboard/get_location_difference_of_inventory/?campaign_id=" + campaignId + "&inv=" + inv;
      return machadaloHttp.get(url);
    }

    DashboardService.getCampaignInvTypesData = function(campaignId){
      var url = url_base + "dashboard/get_supplier_data_by_campaign/?campaign_id=" + campaignId;
      return machadaloHttp.get(url);
    }

    DashboardService.getCampaignInventoryActivitydetails = function(campaignId){
      var url = url_base + "dashboard/get_campaign_inventory_activity_details/?campaign_id=" + campaignId;
      return machadaloHttp.get(url);
    }


    DashboardService.getLeadsByCampaign = function(campaignId,data){
      if(data && data.hasOwnProperty('start_date') && data.hasOwnProperty('end_date')){
        var url = url_base + "dashboard/get_leads_by_campaign_new/?campaign_id=" + campaignId + "&start_date=" + data.start_date + "&end_date=" + data.end_date;
      }
      else {
        var url = url_base + "dashboard/get_leads_by_campaign_new/?campaign_id=" + campaignId;
      }
      return machadaloHttp.get(url);
    }
    //
    // DashboardService.getSortedLeadsByCampaign = function(campaignId, query_type){
    //   var url = url_base + "dashboard/get_leads_by_campaign_custom/?campaign_id=" + campaignId + "&query_type=" + query_type;
    //   return machadaloHttp.get(url);
    // }

    DashboardService.getCompareCampaignChartData = function(data){
      var url = url_base + "dashboard/proposal_id/get_leads_by_multiple_campaigns/";
      return machadaloHttp.post(url,data);
    }

    DashboardService.getSupplierImages = function(supplierId,invType,activityType, date){
      var url = url_base + "dashboard/get_activity_images_by_suppliers/?supplier_id=" + supplierId + "&inv_code=" + invType + "&act_type=" + activityType + "&date=" + date;
      return machadaloHttp.get(url);
    }

    DashboardService.getHashtagImages = function(campaignId, date){
      var url = url_base + "hashtag-images/?campaign_id=" + campaignId + "&date=" + date;
      return machadaloHttp.get(url);
    }

    DashboardService.getDatewiseSuppliersInventory = function(campaignId, date, invName, actType){
      var url = url_base + "dashboard/get_datewise_suppliers_inventory_status/?campaign_id=" + campaignId + "&date=" + date + "&inv_type=" + invName + "&act_type=" + actType;
      return machadaloHttp.get(url);
    }
    DashboardService.getBookingCampaigns = function(campaign){
        var url = url_base +  campaign + "/get-suppliers-by-status/";
        return machadaloHttp.get(url);
    }

    DashboardService.viewCampaignLeads = function(vendor){
      if(vendor){
        var url = url_root  + "leads/summary/?vendor=" + vendor;
      }else{
        var url = url_root  + "leads/summary/";
      }
        return machadaloHttp.get(url);
    }

    DashboardService.viewLeadsForSelectedCampaign = function(data,campaignId){
        var url = url_root  + "leads/" + campaignId + "/entry_list_by_campaign_id";
        return machadaloHttp.get(url);
    }

    DashboardService.addComment = function(campaignId, data){
      var url = url_base +  campaignId + "/comment/";
      return machadaloHttp.post(url,data);
    }

    DashboardService.getCampaign = function(proposal_id){
      $location.path('/' + proposal_id + '/releasePlan');
    }

    DashboardService.viewComments = function(campaignId, spaceId, relatedTo){
      var url = url_base +  campaignId + "/comment/?shortlisted_spaces_id=" + spaceId + "&related_to=" + relatedTo;
      return machadaloHttp.get(url);
    }

    DashboardService.viewBookingComments = function(campaignId, spaceId, relatedTo){
      var url = url_base +  campaignId + "/comment/?shortlisted_spaces_id=" + spaceId + "&related_to=" + relatedTo;
      return machadaloHttp.get(url);
    }

    DashboardService.changePassword = function(id,data){
      var url = url_base_user + "user/" + id + "/change_password/";
      return machadaloHttp.post(url,data);
    }

    DashboardService.getFormDetails = function(campaignId){
      var url =  url_root  + "leads/" +  campaignId  + "/form" ;
      return machadaloHttp.get(url);
    }

    DashboardService.sendMeEmail = function(data){
      var url =  url_base  + "send-leads-to-self/" ;
      return machadaloHttp.post(url,data);
    }

    DashboardService.getPermissionBoxImages = function(campaignId,supplierId){
      var url = url_base +  "hashtag-images/get_permission_box_images/?campaign_id=" + campaignId + "&supplier_id=" + supplierId;
      return machadaloHttp.get(url);
    }


    DashboardService.getPhases = function(campaignId){
      var url = url_base  + "supplier-phase/?campaign_id=" + campaignId;
      return machadaloHttp.get(url);
    }
    DashboardService.sendListOfSuppliersEmail = function(campaignId,email){
      var url = url_base + "send-booking-details/" + campaignId + "/?email=" + email;
      return machadaloHttp.get(url);
    }

    DashboardService.sendListOfSuppliersConfirmEmail = function(campaignId){
      var url = url_base + "send-booking-details/" + campaignId + "/";
      return machadaloHttp.get(url);
    }

    DashboardService.sendActivationOfSuppliersEmail = function(campaignId,email){
      var url = url_base + "send-advanced-booking-details/" + campaignId + "/?email=" + email;
      return machadaloHttp.get(url);
    }

    DashboardService.sendActivationOfSuppliersConfirmEmail = function(campaignId){
      var url = url_base + "send-advanced-booking-details/" + campaignId + "/";
      return machadaloHttp.get(url);
    }

    DashboardService.sendPipelinedSuppliersEmail = function(campaignId,email){
      var url = url_base + "send-pipeline-details/" + campaignId + "/?email=" + email;
      return machadaloHttp.get(url);
    }

    DashboardService.sendPipelinedSuppliersConfirmEmail = function(campaignId){
      var url = url_base + "send-pipeline-details/" + campaignId + "/";
      return machadaloHttp.get(url);
    }
    DashboardService.getCampaignWiseSummary = function(){
      var url = url_root  + "campaign/campaign-wise-summary/";
      return machadaloHttp.get(url);
    }
    DashboardService.getVendorWiseSummary = function(){
      var url = url_base  + "vendor-wise-summary/";
      return machadaloHttp.get(url);
    }

    DashboardService.getDistributionGraphsStatics = function(data){
      var url =  url_root  + "analytics/get-leads-data-generic/";
      return machadaloHttp.put(url,data);
    }

    DashboardService.deleteLeads = function(data){
      var token = $rootScope.globals.currentUser.token;
      $http({
        url: Config.APIBaseUrl + "v0/ui/leads/delete-leads/",
        method: "DELETE",
        data: data,
        headers: {'Authorization': 'JWT ' + token, 'Content-Type': 'application/json'}
      })
      .then(function() {
        swal("Leads Deleted", "Successfully", "success");
      })
      .catch(function(error) {
        swal("Leads Deletion", "Failed", "error");
        console.log('error :', error);
      });
    }

    DashboardService.getShortlistedSuppliers = function(campaignId, supplier_code){
      var url =  url_root  + "website/get-shortlisted-suppliers/" + campaignId + "/?supplier_type_code=" + supplier_code;
      return machadaloHttp.get(url);
    }

    DashboardService.printLeadsInExcel = function(data){
      var url =  url_root  + "leads/" + data.leads_form_id + "/generate_lead_data_excel?supplier_id=" +
                  data.supplier_id + "&start_date=" + data.start_date + "&end_date=" +
                  data.end_date;
      return machadaloHttp.get(url);
    }
    DashboardService.getCampaignsWiseForCity = function(dataCity){
      console.log(dataCity);
        var url =  url_analytics + "city-vendor-campaigns/";
        console.log(url);
      return machadaloHttp.put(url,dataCity);
    }
    DashboardService.getCampaignsWiseForVendor = function(dataVendor){
      console.log(dataVendor);
        var url =  url_analytics + "city-vendor-campaigns/";
        console.log(url);
      return machadaloHttp.put(url,dataVendor);
    }
    DashboardService.getCityUsers = function(){
        var url =  url_root + "campaign/user-cities/";
        return machadaloHttp.get(url);
    }

    DashboardService.downloadSheet = function(formId){
        var url =  url_root + "leads/" + formId + "/generate_lead_data_excel";
        return machadaloHttp.get(url);
    }
    return DashboardService;

 }]);
