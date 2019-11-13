angular.module('catalogueApp')

.controller('EditProposalDetailsCtrl', ['$scope', '$rootScope', '$window', '$location','commonDataShare','constants','editProposalDetailsService',
            '$stateParams',
    function ($scope, $rootScope, $window, $location , commonDataShare,constants,editProposalDetailsService, $stateParams) {

      var proposalId = $stateParams.proposalId;
      editProposalDetailsService.getProposalDetails(proposalId)
      .then(function onSuccess(response){
        console.log(response);
        $scope.proposalData = response.data.data;
        console.log($scope.proposalData);
        $scope.proposalData.tentative_start_date = new Date($scope.proposalData.tentative_start_date);
        $scope.proposalData.tentative_end_date = new Date($scope.proposalData.tentative_end_date);
      }).catch(function onError(response){
        console.log(response);
      })

        editProposalDetailsService.getOrganisations()
        .then(function onSuccess(response){
          $scope.organisationList = response.data.data;
          console.log($scope.organisationList);
            console.log(response);
        }).catch(function onError(response){
          console.log(response);
        })


        $scope.updateProposalDetails = function(){
          console.log($scope.proposalData);
          editProposalDetailsService.updateProposalDetails($scope.proposalData)
          .then(function onSuccess(response){
            console.log(response);
            swal(constants.name, constants.proposal_update_success, constants.success);
          }).catch(function onError(response){
            console.log(response);
          })
    }
  }
]);
