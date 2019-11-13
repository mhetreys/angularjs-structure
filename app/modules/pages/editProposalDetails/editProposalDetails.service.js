'use strict';

angular.module('catalogueApp')
.factory('editProposalDetailsService', ['machadaloHttp','$stateParams','$rootScope','$routeParams', '$location', '$http',

function (machadaloHttp, $stateParams, $rootScope, $routeParams, $location, $http) {

  var url_base = 'v0/ui/';
  var editProposalDetails = {};

  editProposalDetails.getProposalDetails = function(proposalId){
    var url = url_base + "website/proposal/" + proposalId + "/";
      return machadaloHttp.get(url);
    }

    editProposalDetails.getOrganisations = function(){
      var url = url_base + "website/organisation/";
      return machadaloHttp.get(url);
    }
    editProposalDetails.updateProposalDetails = function(data){
      var url = url_base + "website/proposal/" + data.proposal_id + "/";
      return machadaloHttp.put(url,data);
    }
  return editProposalDetails;
}]);
