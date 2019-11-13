angular.module('catalogueApp')

.controller('OpsDashCtrl', ['$scope', '$rootScope', '$window', '$location','opsDashBoardService','commonDataShare','constants','$timeout','permissions',

    function ($scope, $rootScope, $window, $location, opsDashBoardService, commonDataShare,constants,$timeout, permissions) {
    	$scope.proposals = [];
      $scope.reason = null;
      $scope.bucket_url = constants.aws_bucket_url;
      //for loading spinner
      $scope.loadSpinner = true;
      $scope.permissions = permissions.opsDashBoard;

      //Start: code added to show or hide details based on user permissions
      $scope.user_code = $window.localStorage.user_code;
      if($scope.user_code == 'agency')
        $scope.hideData = true;
      //End: code added to show or hide details based on user permissions
    	$scope.headings = [
        {header : 'Index'},
        {header : 'Proposal Id'},
        {header : 'Proposal Name'},
        {header : 'Proposal For'},
        {header : 'Proposal Created By'},
        {header : 'Invoice Number'},
        {header : 'Start Date'},
        {header : 'End Date'},
        {header : 'Create Campaign'},
        {header : 'Assigned To'},
        {header : 'Edit Details'},
        // {header : 'Download Proposal'}
      ];

  var getProposalDetails = function(){
    $scope.Data = [];
    opsDashBoardService.getProposalDetails()
    	.then(function onSuccess(response){
        console.log(response);
    		$scope.proposals = response.data.data;
        $scope.Data = $scope.proposals;
        console.log($scope.Data);
        if($scope.proposals.length == 0){
          $scope.isEmpty = true;
          $scope.msg = constants.emptyProposalMsg;
        }else {
          $scope.isEmpty = false;
        }
        $scope.loading = response.data;
    	})
    	.catch(function onError(response){
        if(response.status == 403)
          $location.path('/forbidden');
        commonDataShare.showErrorMessage(response);
        $scope.isEmpty = true;
        $scope.loading = response;
    		console.log("error occured", response);
        // swal(constants.name,constants.errorMsg,constants.error);
    	});
    }

    $scope.getUsersList = function(orgId){
      commonDataShare.getUsersList(orgId)
        .then(function onSuccess(response){
          console.log(response);
      		$scope.userList = response.data.data;
      	})
      	.catch(function onError(response){
      		console.log("error occured", response);
          commonDataShare.showErrorMessage(response);
          // swal(constants.name,constants.errorMsg,constants.error);
      	});
    }
    var init = function(){
      getProposalDetails();
      // getUsersList();
    }
    //Call init function TO Load reuired data initially..
    init();

    $scope.sendNotification = function(){
      $scope.loadSpinner = false;
      var email_Data = {
        subject:'Machadalo Mail',
        body:$scope.reason,
        to:$scope.currentProposal.user.email,
      };
      opsDashBoardService.sendMail(email_Data)
      .then(function onSuccess(response){
        console.log(response);
        $scope.taskId = response.data.data.task_id;
        sendMailInProgress();
    	})
    	.catch(function onError(response){
        $scope.loadSpinner = true;
        $('#onHoldModal').modal('hide');
        $('#declineModal').modal('hide');
        commonDataShare.showErrorMessage(response);
        // swal(constants.name,constants.onhold_error,constants.error);
    		console.log("error occured", response);
    	});
      $scope.reason = "";
   }
   var sendMailInProgress = function(){
     opsDashBoardService.sendMailInProgress($scope.taskId)
     .then(function onSuccess(response){
       if(response.data.data.ready != true){
          $timeout(sendMailInProgress,constants.sleepTime); // This will perform async
       }
       else if(response.data.data.status == true){
         $scope.loadSpinner = true;
         $('#onHoldModal').modal('hide');
         $('#declineModal').modal('hide');

         swal(constants.name,constants.onhold_success,constants.success);
       }
       else {
         swal(constants.name,constants.email_error,constants.error);
       }
     }).catch(function onError(response){
       $scope.loadSpinner = true;
       $('#onHoldModal').modal('hide');
       $('#declineModal').modal('hide');
       commonDataShare.showErrorMessage(response);
      //  swal(constants.name,constants.email_error,constants.error);
     });
   }

    $scope.updateCampaign = function(proposal){
        $scope.currentProposal = proposal;
      opsDashBoardService.updateProposalDetails(proposal.proposal.proposal_id,proposal.proposal)
      .then(function onSuccess(response){
    	})
    	.catch(function onError(response){
    		console.log("error occured", response);
        commonDataShare.showErrorMessage(response);
    	});
    }

    $scope.convertProposalToCampaign = function(proposal){
      $scope.loadSpinner = false;
      $scope.currentProposal = proposal;
      getOrganisationsForAssignment();
      opsDashBoardService.convertProposalToCampaign(proposal.proposal.proposal_id, proposal.proposal)
          .then(function onSuccess(response){
            console.log(response);
            $scope.loadSpinner = true;
              if(response.status == 200){
                $("#assignModal").modal('show');
              }
    	      })
          .catch(function(response){
            getProposalDetails();
            $scope.loadSpinner = true;
            commonDataShare.showErrorMessage(response);
            // swal(constants.name,constants.accept_proposal_error,constants.error);
    	  	    console.log("error occured", status);
              console.log(response);
    	});
    }

    $scope.convertCampaignToProposal = function(proposal){
      console.log(proposal);
      $scope.currentProposal = proposal;
      opsDashBoardService.convertCampaignToProposal(proposal.proposal.proposal_id, proposal.proposal)
          .then(function onSuccess(response){
            $("#declineModal").modal('show');
              console.table(response);
    	})
          .catch(function onError(response){
            console.log(response);
            getProposalDetails();
            commonDataShare.showErrorMessage(response);
            // swal(constants.name,constants.decline_proposal_error,constants.error);
    	  	    console.log("error occured", status);
    	});
    }
    //code added when the user clicks on proposal id the proposal details page will open
    $scope.showProposalDetails = function(proposal_id){
      $location.path('/' + proposal_id + '/showcurrentproposal');
    }

    $scope.saveAssignment = function(id){
      // var userId = $scope.userId;
      var data = {
        to:id,
        campaign_id:$scope.currentProposal.proposal.proposal_id
      };
      opsDashBoardService.saveAssignment(data)
          .then(function onSuccess(response){
            getProposalDetails();
              console.table(response);
              $('#assignModal').modal('hide');
              swal(constants.name,constants.assign_user_success,constants.success);
    	})
          .catch(function onError(response){
            $('#assignModal').modal('hide');
            commonDataShare.showErrorMessage(response);
            // swal(constants.name,constants.assign_user_error,constants.error);
    	  	    console.log("error occured", status);
    	});
    }
    $scope.goToCampaignList = function(){
     $location.path("/CampaignList");
    }
    $scope.goToEditProposalDetails = function(proposalId){
      $location.path("/editProposalDetails/" + proposalId + "/");
    }
    var getOrganisationsForAssignment = function(){
      opsDashBoardService.getOrganisationsForAssignment()
      .then(function onSuccess(response){
        console.log(response);
        $scope.organisationList = response.data.data;
      }).catch(function onError(response){
        console.log(response);
      })
    }
}]);//Controller function ends here
