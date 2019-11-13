'use strict';


 angular.module('catalogueApp')
 .factory('enterLeadsService', ['machadaloHttp','$stateParams','$rootScope','$routeParams', '$location',
  function (machadaloHttp, $stateParams, $rootScope, $routeParams, $location) {

    var url_base = 'v0/ui/website/';
    var url_base_leads = 'v0/ui/leads/';
    var url_base_ui = 'v0/ui/';

    var enterLeadsService = {};

        enterLeadsService.getLeadFormDetails = function(formId){
          var url = url_base_leads + formId + "/form_by_id/";
          return machadaloHttp.get(url);
        }

        enterLeadsService.saveLeads = function(formId, data){
          var url = url_base_leads + formId + "/insert_lead";
          return machadaloHttp.post(url, data);
        }

        enterLeadsService.getLeadsBySupplier = function(formId,supplierId){
          var url = url_base_leads + formId + "/entry_list/" + supplierId;
          return machadaloHttp.get(url);
        }

        enterLeadsService.getSupplierDetails = function(supplierId){
          var url = url_base + "supplier-details/?supplier_id=" + supplierId + "&supplier_type_code=RS";
          return machadaloHttp.get(url);
        }

        enterLeadsService.getEditLeads = function(formId,supplierId,entryId){
          var url = url_base_leads + formId + "/get-leads-entry/" + supplierId + "/" + entryId + "/";
          return machadaloHttp.get(url);
        }

        enterLeadsService.updateLeadDetails = function(formId,supplierId,entryId, data){
          var url = url_base_leads + formId + "/update-leads-entry/" + supplierId + "/" + entryId + "/";
          return machadaloHttp.put(url, data);
        }

        return enterLeadsService;

 }]);
