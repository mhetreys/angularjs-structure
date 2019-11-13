'use strict';


 angular.module('catalogueApp')
 .factory('campaignLeadsService', ['machadaloHttp','$stateParams','$rootScope','$routeParams', '$location',
  function (machadaloHttp, $stateParams, $rootScope, $routeParams, $location) {

    var url_base = 'v0/ui/website/';
    var url_base_leads = 'v0/ui/leads/';

    var campaignLeadsService = {};

        campaignLeadsService.createLeadForm = function(data, campaignId){
          var url = url_base_leads + campaignId + "/create";
          return machadaloHttp.post(url, data);
        }

        campaignLeadsService.getLeads = function(campaignId){
          var url = url_base + "leads/?campaign_id=" + campaignId;
          return machadaloHttp.get(url);
        }
        campaignLeadsService.getEntryListLeads = function(formId, supplierId){
          var url = url_base_leads + formId + "/entry_list/"  + supplierId;
          return machadaloHttp.get(url);
        }
        campaignLeadsService.getCampaignDetails = function(assigned_by,userId,fetch_all){
          var url = url_base + "campaign-assignment/?include_assigned_by="+ assigned_by +  "&to="+userId + "&fetch_all=" + fetch_all;
          return machadaloHttp.get(url);
        }

        campaignLeadsService.getCampaignLeadForms = function(campaignId){
          var url = url_base_leads  + campaignId + "/form";
          return machadaloHttp.get(url);
        }

        campaignLeadsService.getShortlistedSuppliers = function(campaignId){
            var url = url_base + "proposal/"+ campaignId + "/shortlisted_suppliers/";
        	return machadaloHttp.get(url);
        }

        campaignLeadsService.getAliasData = function(campaignId){
          var url = url_base + "lead-alias/?campaign_id=" + campaignId;
          return machadaloHttp.get(url);
        }

        campaignLeadsService.importLeadsThroughSheet = function(campaignId,data){
          var url = url_base + "leads/" + campaignId + "/import_lead/";
          return machadaloHttp.post(url,data);
        }

        campaignLeadsService.saveLeads = function(formId, data){
          var url = url_base_leads + formId + "/insert_lead";
          return machadaloHttp.post(url, data);
        }

        campaignLeadsService.importLeadsThroughSheet = function(formId){
          var url = url_base_leads + formId + "/import_lead/";
          return machadaloHttp.post(url);
        }

        campaignLeadsService.getExportedSheet = function(formId){
          var url = url_base_leads + formId + "/generate_lead_form";
          return machadaloHttp.get(url);
        }

        campaignLeadsService.updateLeadForm = function(formId, data){
          var url = url_base_leads + formId + "/add_fields";
          return machadaloHttp.put(url,data);
        }

        campaignLeadsService.removeFieldFromForm = function(formId, itemId, data){
          var url = url_base_leads + formId + "/delete_form_element/" + itemId;
          return machadaloHttp.put(url,data);
        }

        campaignLeadsService.updateFormFields = function(formId, data){
          var url = url_base_leads + formId + "/edit_form";
          return machadaloHttp.put(url,data);
        }
        return campaignLeadsService;

 }]);
