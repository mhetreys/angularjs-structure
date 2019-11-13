angular.module('catalogueApp')
.controller('OpsExecutionPlanCtrl',
    ['$scope', '$rootScope', '$window', '$location','opsExecutionPlanService','$stateParams','commonDataShare','constants','$timeout','Upload','cfpLoadingBar','permissions',
    function ($scope, $rootScope, $window, $location, opsExecutionPlanService, $stateParams,commonDataShare,constants,$timeout,Upload,cfpLoadingBar, permissions) {
      $scope.campaign_id = $stateParams.proposal_id;
      $scope.reAssign = false;
      var sleepTime = 0;
      $scope.campaign_manager = constants.campaign_manager;
      if($rootScope.globals.userInfo.is_superuser == true){
        $scope.backButton = true;
      }
      $scope.permissions = permissions.opsExecutionPage;
      $scope.headings = [
        {header : 'Index'},
        {header : 'Supplier Name'},
        // {header : 'Inventory Id'},
        {header : 'Inventory Type'},
        {header : 'Image'},
         {header : 'Activity Name'},
        {header : 'Activity Date'},
        {header : 'Assigned User'},
        {header : 'ReAssign'},
        {header : 'ReAssigned Date'},
        {header : 'Action'},
      ];
      $scope.supplier_headings = [
        {header : 'Supplier Id'},
        {header : 'Supplier Name'},
        {header : 'Area'},
        {header : 'SubArea'},
        {header : 'City'},
        {header : 'State'},
         {header : 'PinCode'},
      ];
      $scope.dates = [
        {header:''},
        {header:'Total'},
        {header:'Actual'},
        {header:'Percentage'},
      ];
      $scope.summaryHeaders = [
        {header:'Release', key:'RELEASE'},
        {header:'Audit',   key:'AUDIT'},
        {header:'Closure', key:'CLOSURE'},
      ];

      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };
      $scope.today = new Date();

      $scope.campaignState = $window.localStorage.campaignState;
      $scope.campaignId = $window.localStorage.campaignId;
      $scope.bdOwner = $window.localStorage.campaignOwner;
      $scope.campaignName = $window.localStorage.campaignName;
      // $scope.formats = ['dd-MMMM-yyyy', 'yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.formats = ['yyyy-MM-dd'];
      $scope.format = $scope.formats[1];
      $scope.altInputFormats = ['M!/d!/yyyy'];
      var getOpsExecutionImageDetails = function(){
        opsExecutionPlanService.getOpsExecutionImageDetails($scope.campaign_id)
        	.then(function onSuccess(response){
            console.log(response);
        		$scope.campaignData = response.data.data;
            createList();
            if($scope.campaignData.length == 0)
              $scope.hideData = false;//change to true doing for testing
                $scope.loading = response.data;
        	})
        	.catch(function onError(response){
            $scope.hideData = true;
            commonDataShare.showErrorMessage(response);
        		console.log("error occured", response);
        	});
        }
        var getUsersList = function(){
          commonDataShare.getUsersList()
            .then(function onSuccess(response){
              $scope.userList = response.data.data;
            })
            .catch(function onError(response){
              commonDataShare.showErrorMessage(response);
              console.log("error occured", response);
            });
        }
        var init = function(){
          getOpsExecutionImageDetails();
          getUsersList();
        }
      init();
      var campaignDataStruct = {
        id : '',
        supplier_id : '',
        inv_id : '',
        inv_type : '',
        images : [],
        act_name : '',
        act_date : '',
        reAssign_date : '',
      };
      $scope.campaignDataList = [];
      function createList(){
        angular.forEach($scope.campaignData.shortlisted_suppliers,function(suppliers,spaceId){
          angular.forEach($scope.campaignData.shortlisted_inventories,function(inventories,invId){
            if($scope.campaignData.shortlisted_inventories[invId].shortlisted_spaces_id == spaceId){
              angular.forEach($scope.campaignData.inventory_activities,function(activities,actId){
                if($scope.campaignData.inventory_activities[actId].shortlisted_inventory_id == invId){
                  angular.forEach($scope.campaignData.inventory_activity_assignment,function(invAssignments,assignId){
                    if($scope.campaignData.inventory_activity_assignment[assignId].inventory_activity_id == actId){
                      var data = angular.copy(campaignDataStruct);
                      data.id = assignId;
                      data.supplier_id = $scope.campaignData.shortlisted_suppliers[spaceId].supplier_id;
                      data.supplier_name = $scope.campaignData.shortlisted_suppliers[spaceId].supplier_detail.name;
                      data.inv_id = $scope.campaignData.shortlisted_inventories[invId].inventory_id;
                      data.inv_type = $scope.campaignData.shortlisted_inventories[invId].inventory_name;
                      data.act_name = $scope.campaignData.inventory_activities[actId].activity_type;
                      data.act_date = $scope.campaignData.inventory_activity_assignment[assignId].activity_date;
                      data.assigned_to = $scope.campaignData.inventory_activity_assignment[assignId].assigned_to;
                      data.reAssign_date = $scope.campaignData.inventory_activity_assignment[assignId].reassigned_activity_date;
                      angular.forEach($scope.campaignData.images, function(images,imgKey){
                        if($scope.campaignData.images[imgKey].inventory_activity_assignment_id == assignId){
                          data.images.push($scope.campaignData.images[imgKey]);
                        }
                      });
                      // data.reAssigner_user = $scope.campaignData.inventory_activity_assignment[assignId].assigned_to;
                      $scope.campaignDataList.push(data);
                    }
                  });
                }
              });
            }
          });
        });
      }

      $scope.setImageUrl = function(images){
        $scope.imageUrlList = [];
        for(var i=0; i<images.length; i++){
          var imageData = {
            image_url : 'http://androidtokyo.s3.amazonaws.com/' + images[i].image_path,
            comment : images[i].comment,
          };
          $scope.imageUrlList.push(imageData);
        }
      }

      $scope.getSupplierDetails = function(supplier){
        $scope.supplierData = [];
        var supplierId = supplier.supplier_id;
        var supplier_type_code = 'RS';
        opsExecutionPlanService.getSuppierDetails(supplierId,supplier_type_code)
        	.success(function(response, status){
            $scope.supplierData = response.data;
      	   })
        	.error(function(response, status){
        		console.log("error occured", status);
        	});
      }
      $scope.getSummary = function(){
        opsExecutionPlanService.getSummaryDetails($scope.campaign_id)
        .then(function onSuccess(response){
          $("#summaryModal").modal('show');
          $scope.summaryData = response.data.data;
        })
        .catch(function onError(response){
          console.log(response);
          commonDataShare.showErrorMessage(response);
        });
      }
      $scope.reAssignActivityList = {};
      $scope.activity_date;
      $scope.userCode;
      $scope.addActivity = function(index,inventory){
        if(inventory.status == true){
          $scope.reAssignActivityList[inventory.id] = {};
        }else {
          delete $scope.reAssignActivityList[inventory.id];
        }
        if(Object.keys($scope.reAssignActivityList).length == 0){
          $scope.reAssign = false;
        }else {
            $scope.reAssign = true;
        }
      }
      var reAssignActivityData = function(){
        angular.forEach($scope.reAssignActivityList, function(activity, assignId){
          $scope.reAssignActivityList[assignId]['reassigned_activity_date'] = commonDataShare.formatDate($scope.activity_date);
          $scope.reAssignActivityList[assignId]['assigned_to'] = $scope.userCode;
          //use above after getting userList
          // $scope.reAssignActivityList[assignId]['assigned_to'] = 6;
        });
      }
      $scope.saveReAssignedActivities = function(){
        reAssignActivityData();
        opsExecutionPlanService.saveReAssignedActivities($scope.reAssignActivityList)
        .then(function onSuccess(response){
          $scope.campaignDataList = [];
          getOpsExecutionImageDetails();
          $('#reAssignModal').modal('hide');
          $scope.reAssign = false;
          $scope.reAssignActivityList = {};
          swal(constants.name,constants.reAssign_success,constants.success);

        })
        .catch(function onError(response){
          $('#reAssignModal').modal('hide');
          $scope.reAssign = false;
          $scope.reAssignActivityList = {};
          commonDataShare.showErrorMessage(response);
          // swal(constants.name,constants.reAssign_error,constants.error);
          console.log(response);
        });
      }
    $scope.downloadImages = function(){
      $scope.buttonDisable = true;
      opsExecutionPlanService.downloadImages($stateParams.proposal_id)
      .then(function onSuccess(response){
        $scope.taskId = response.data.data;
        downloadInProgress();
      }).catch(function onError(response){
        console.log("Error occured", response.status);
        commonDataShare.showErrorMessage(response);
        // swal(constants.name,response.data.data.general_error,constants.error);
        $scope.buttonDisable = false;
      })
    }
    function downloadInProgress(){
      opsExecutionPlanService.downloadInProgress($scope.taskId)
      .then(function onSuccess(response){
        // $scope.progress = response.progress+"%";
        sleepTime = 2 * sleepTime + 5000;
        if(response.data.data.ready != true){
           $timeout(downloadInProgress,sleepTime); // This will perform async
        }
        else if(response.data.data.status == true){
          opsExecutionPlanService.finishDownload($scope.taskId,$stateParams.proposal_id)
          .then(function onSuccess(response){
             $window.open(response.data.data, '_blank');
             $scope.buttonDisable = false;
          }).catch(function onError(response){
            $scope.buttonDisable = false;
            commonDataShare.showErrorMessage(response);
          });
        }
        else {
          swal(constants.name,constants.images_download_error,constants.error);
        }
      }).catch(function onError(response){
        console.log(response);
        $scope.buttonDisable = false;
        commonDataShare.showErrorMessage(response);
      });
    }

    $scope.uploadImage = function(file,inventory){
      console.log(inventory);

      // cfpLoadingBar.set(0.3)

          var token = $rootScope.globals.currentUser.token;
          if (file) {
             $("#progressBarModal").modal();
            cfpLoadingBar.start();
            // cfpLoadingBar.inc();
            Upload.upload({
                url: constants.base_url + constants.url_base + constants.upload_image_activity_url,
                data: {
                  file: file,
                  'inventory_activity_assignment_id' : inventory.id,
                  'supplier_name' : inventory.supplier_name,
                  'activity_name' : inventory.act_name,
                  'inventory_name' : inventory.inv_type,
                  'activity_date' : inventory.act_date,
                },
                headers: {'Authorization': 'JWT ' + token}
            }).then(function onSuccess(response){
                  uploaded_image = {'image_path': response.data.data };
                  inventory.images.push(uploaded_image);
                  cfpLoadingBar.complete();
                  $("#progressBarModal").modal('hide');
            })
            .catch(function onError(response) {
              cfpLoadingBar.complete();
              console.log(response);
            });
          }
        }

}]);
