angular.module('catalogueApp')
.controller('AuditReleasePlanCtrl',
    ['$scope', '$rootScope', '$window', '$location','auditReleasePlanService','$stateParams','constants','$filter','permissions','commonDataShare', 'moment',
    function ($scope, $rootScope, $window, $location, auditReleasePlanService, $stateParams, constants, $filter, permissions, commonDataShare, moment) {
      $scope.campaign_id = $stateParams.proposal_id;
      $scope.bd_manager = constants.bd_manager;
      $scope.campaign_manager = constants.campaign_manager;
      $scope.invForComments = constants.inventoryNames;
      $scope.userIcon = "icons/usericon.png";
      $scope.commentModal = {};
      if($rootScope.globals.userInfo.is_superuser == true){
        $scope.backButton = true;
      }
      $scope.permissions = permissions.auditReleasePage;
      $scope.headings = [
        {header : 'Phase'},
        {header : 'Supplier Name & Address'},
        {header : 'AdInventory Id'},
        {header : 'Activity Date'},
        {header : 'Status of Release'},
      ];
      $scope.audit_dates = [
        {header : 'Audit Date'},
      ];
      $scope.assignModal_headers = [
        {header : 'AdInventory Id'},
        {header : 'Activity Name'},
        {header : 'Activity Date'},
        {header : 'Assigned User'},
        {header : 'Delete Inventory'},
      ];
      $scope.activity_names = [
        {header : 'RELEASE' , code : 'RE'},
        {header : 'CLOSURE',   code : 'CL'},
        {header : 'AUDIT',     code : 'AU'},
      ];
      $scope.maxDate = new Date(2025, 5, 22);
      $scope.today = new Date();
      $scope.popup1 = false;
      $scope.popup2 = false;
      $scope.popup3 = false;
      $scope.error = false;

      $scope.setDate = function(year, month, day) {
        $scope.dt = new Date(year, month, day);
      };
      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      // $scope.formats = ['dd-MMMM-yyyy', 'yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.formats = ['yyyy-MM-dd'];
      $scope.format = $scope.formats[1];
      $scope.altInputFormats = ['M!/d!/yyyy'];


      $scope.auditDates = [];
      $scope.totalSuppliers = 0;
      $scope.suppliersPerPage = 10;
      var supplierIdForSearch;
      // $scope.pageNo = 1;
      $scope.pagination = {
          current: 1
      };
      $scope.pageChanged = function(newPage) {
          getResultsPage(newPage);
      };
      function init(){
        getResultsPage(1);
        // getCampaignReleaseDetails();
        // getUsersList();
        $scope.getPhases();
      }
      //get user list
      $scope.getUsersList = function(orgId){
        commonDataShare.getUsersList(orgId)
          .then(function onSuccess(response){
            $scope.userList = response.data.data;
            $scope.usersMapListWithObjects = {};
            angular.forEach($scope.userList, function(data){
              $scope.usersMapListWithObjects[data.id] = data;
            })
          })
          .catch(function onError(response){
            console.log("error occured", response.status);
            commonDataShare.showErrorMessage(response);
          });
      }
      $scope.getUsersList();
      var getResultsPage = function(newPage){
        getCampaignReleaseDetails(newPage);
      }
      $scope.getPhases = function(){
        $scope.editPhase = false;
        auditReleasePlanService.getPhases($scope.campaign_id)
        .then(function onSuccess(response){
          $scope.phaseMappingList = {};
          angular.forEach(response.data.data, function(phase){
            phase.start_date = new Date(phase.start_date);
            phase.end_date = new Date(phase.end_date);
            $scope.phaseMappingList[phase.id] = phase;
          })
          $scope.phasesData = response.data.data;

        }).catch(function onError(response){
          console.log(response);
        })
      }
      init();

      //initial call to get release Data
      function getCampaignReleaseDetails(newPage){
        $scope.Data = [];
      auditReleasePlanService.getCampaignReleaseDetails($scope.campaign_id, newPage, supplierIdForSearch)
      	.then(function onSuccess(response){
          if(response.data.data){
            if(response.data.data.shortlisted_suppliers.length == 1 &&
                response.data.data.shortlisted_suppliers[0].phase_no == undefined){
              swal(constants.name, "Phase Not Found for this Supplier, Please Assign Phase At Booking Page", constants.warning);
            }
            $scope.releaseDetails = response.data.data;

            $scope.totalSuppliers = $scope.releaseDetails.total_count;
            $scope.Data = $scope.releaseDetails.shortlisted_suppliers;
            setDataToModel($scope.releaseDetails.shortlisted_suppliers);

            $scope.filteredAssignDatesList = angular.copy($scope.releaseDetails);
            $scope.loading = response.data;
            makeAssignDateData($scope.releaseDetails);
          }else {
            swal(constants.name, "You do not have access to Proposal", constants.warning);
            $scope.loading = response.data;
          }

      	})
      	.catch(function onError(response){
      		console.log("error occured", response);
          $scope.loading = response.data;
          commonDataShare.showErrorMessage(response);
      	});
      }
      var makeAssignDateData = function(data){
        $scope.phaseData = [], $scope.phases = [];
        $scope.phaseData =  $filter('unique')(data.shortlisted_suppliers,'phase_no');
        $scope.inventoryTypes = Object.keys(data.shortlisted_suppliers[0].shortlisted_inventories);
        angular.forEach($scope.phaseData, function(phase){
          if(phase.phase != null)
            $scope.phases.push(phase.phase);
        })
      }
      // getCampaignReleaseDetails();
        var setDataToModel = function(suppliers){
          for(var i=0;i<suppliers.length;i++){
            angular.forEach(suppliers[i].shortlisted_inventories, function(filter){
              filter.detail.closure_date = new Date(filter.detail[0].closure_date);
              filter.detail.release_date = new Date(filter.detail[0].release_date);
              filter.detail.comments = filter.detail[0].comment;
            });
          }
        }
      $scope.emptyList = {NA:'NA'};
      $scope.getFilters = function(supplier){
        var keys = Object.keys(supplier.shortlisted_inventories);
        if(keys.length > 0){
          $scope.inventory_type = supplier.shortlisted_inventories
          return supplier.shortlisted_inventories;
        }
        else{
          return $scope.emptyList;
        }
      }
      //For audit dates modal
      $scope.addDate = function(date){
        $scope.auditDates.push({
          audit_date:'',
        });
      }
      $scope.auditDate = []
      $scope.setAuditDate = function(filter,index,key){
        $scope.inventory_key = key;
        $scope.supplier_index = index;
        $scope.auditDates = [];
        $scope.auditDates = filter.detail[0].audit_dates;
        if($scope.auditDates.length == 0){
          $scope.addDate();
        }else{
          for(var i=0;i<$scope.auditDates.length;i++){
            $scope.auditDates[i]['audit_date'] = new Date($scope.auditDates[i]['audit_date']);
          }
        }
      }
      $scope.deleteDate = function(index){
    		$scope.auditDates.splice(index,1);
    	}
      $scope.saveAuditDates = function(){
        for(var i=0;i<$scope.auditDates.length;i++){
            $scope.releaseDetails.shortlisted_suppliers[$scope.supplier_index].shortlisted_inventories[$scope.inventory_key].detail[0].audit_dates[i]['audit_date'] = $scope.auditDates[i].audit_date;
        }
      }
      $scope.addClosureDate = function(date_array,date){
        for(var i=0;i<date_array.length;i++){
          date_array[i].closure_date = date;
        }
      }
      $scope.addReleaseDate = function(date_array,date){
        for(var i=0;i<date_array.length;i++){
          date_array[i].release_date = date;
        }
      }
      $scope.addComments = function(comments_array,comment){
        for(var i=0;i<comments_array.length;i++){
          comments_array[i].comment = comment;
        }
      }

      $scope.updateData = function(){
        auditReleasePlanService.updateAuditReleasePlanDetails($scope.campaign_id,$scope.releaseDetails.shortlisted_suppliers)
        .then(function onSuccess(response){
          getCampaignReleaseDetails();
          $scope.resetData();
          swal(constants.name,constants.updateData_success,constants.success);
      	})
      	.catch(function onError(response){
          commonDataShare.showErrorMessage(response);
          // swal(constants.name,constants.updateData_error,constants.error);
      		console.log("error occured", response.status);
      	});
      }

      $scope.assignUserToActivity = function(inv){
        try{
          $scope.inventoryList = [];
          for(var i=0; i<inv.length; i++){
            createInventoryList(inv[i].inventory_id,'RELEASE',inv[i].release_date,inv[i].id);
            createInventoryList(inv[i].inventory_id,'CLOSURE',inv[i].closure_date,inv[i].id);
            for(var j=0; j<inv[i].audit_dates.length; j++){
              createInventoryList(inv[i].inventory_id,'AUDIT',inv[i].audit_dates[j].audit_date,inv[i].id);
            }
          }
        }catch(error){
          commonDataShare.showMessage(error.message);
        }
      }
      var createInventoryList = function(id,name,date,invId){
        try{
          var data = {
            id : id,
            activity_type : name,
            activity_date : date,
            shortlisted_inventory_id : invId,
            assigned_to : 6,
          };
          $scope.inventoryList.push(data);
      }catch(error){
        commonDataShare.showMessage(error.message);
      }
    }
    $scope.saveUserForActivity = function(){
      auditReleasePlanService.saveUser($scope.inventoryList)
      .then(function onSuccess(response){
        getCampaignReleaseDetails();
      })
      .catch(function onError(response){
        commonDataShare.showErrorMessage(response);
        console.log("error occured", response.status);
      });
    }

    $scope.invActivityData_struct = [
        {activity_type : "RELEASE", act_date:{date:'',userCode:''}},
        {activity_type : "CLOSURE", act_date:{date:'',userCode:''}},
      ];
    $scope.invActivityAuditData = {
      activity_type : 'AUDIT', audit_dates:[{date:'',userCode:''}],
    };
    $scope.key;
    $scope.invIdList = [];
    //adding adIds to list to send in request
    $scope.addInventory = function(inventory,rowIndex,index){
      if(inventory.status == true){
        $scope.invIdList.push(inventory.id);
        $scope.selectedRow = rowIndex;
      }
      else
        $scope.invIdList.splice(index,1);
    }
    //To disable other checkboxes of other rows of adInventory Id
    $scope.isDisable = function(index){
      if($scope.invIdList.length == 0)
        $scope.selectedRow = undefined;
      if($scope.selectedRow == undefined || $scope.selectedRow == index)
        return false;
      else
        return true;
    }
    $scope.setDate = function(date){
      date = commonDataShare.formatDate(date);
    }
    $scope.addAuditDate = function(inventory){
      inventory.push({
        date : '',
        userCode : '',
      });
    }
    $scope.removeAuditDate = function(inventory,index){
      inventory.splice(index,1);
    }
    $scope.saveActivityDates = function(){
      $scope.savingDates = true;
      //below function creates complex request structure for data
      editActivityDates();
      auditReleasePlanService.saveActivityDetails($scope.requestaActivityData)
      .then(function onSuccess(response){
        getResultsPage(1);
        $scope.resetData();
        $scope.savingDates = false;
        $('#manageDatesModal').modal('hide');
        swal(constants.name,constants.inventory_date_success,constants.success);
      })
      .catch(function onError(response){
        $scope.savingDates = false;
        $('#manageDatesModal').modal('hide');
        commonDataShare.showErrorMessage(response);
        console.log("error occured", response.status);
      });
    }
     $scope.getActivityDates = function(supplier){
        getOrganisationsForAssignment();
       $scope.invActivityData = angular.copy($scope.invActivityData_struct);
       angular.forEach(supplier.shortlisted_inventories, function(inventoryList,inventory){
          for(var i=0; i<inventoryList.detail.length; i++){
            inventoryList.detail[i].status = false;
          }
       });
     }
    var editActivityDates = function(){
      var data = [];
      var auditData = {
        activity_type : '',
        date_user_assignments : {},
      };
      var releaseClosureDataStruct = {
        activity_type : '',
        date_user_assignments : {},
      };

      for(var i=0; i<$scope.invActivityData.length; i++){
        if($scope.invActivityData[i].act_date.date){
          var releaseClosureData = angular.copy(releaseClosureDataStruct);
          releaseClosureData.activity_type = $scope.invActivityData[i].activity_type;
          var date = commonDataShare.formatDate($scope.invActivityData[i].act_date.date);
          var userCode = $scope.invActivityData[i].act_date.userCode;
          releaseClosureData.date_user_assignments[date] = userCode;
          data.push(releaseClosureData);
        }
      }

      auditData.activity_type = $scope.invActivityAuditData.activity_type;
      for(var i=0; i<$scope.invActivityAuditData.audit_dates.length; i++){
        if($scope.invActivityAuditData.audit_dates[i].date){
          var date = commonDataShare.formatDate($scope.invActivityAuditData.audit_dates[i].date);
          var userCode = $scope.invActivityAuditData.audit_dates[i].userCode;
          auditData.date_user_assignments[date] = userCode;
        }
      }
      data.push(auditData);
      $scope.requestaActivityData = {
        shortlisted_inventory_id_detail : $scope.invIdList,
        assignment_detail : data,
      };
    }

    $scope.showActivityDates = function(inventory, supplier, key){
      $scope.ActivityDatesData = inventory;
      $scope.supplierName = supplier.name;
      $scope.inventoryName = key;
    }
    //event on modal close i.e - clear invIdList
    $scope.resetData = function(){
      $scope.invIdList = [];
      $scope.selectedRow = undefined;
      $scope.invActivityData = [];
      $('#manageDatesModal').on('hide.bs.modal', function () {
      })
    }
    $scope.getCampaignState = function(state){
      return constants[state];
    }
    $scope.filterAssignDatesData = function(filterKey,filterValue){
      var filterExpression = {};
      filterExpression[filterKey] = filterValue;
      $scope.filteredAssignDatesList = $filter('filter')($scope.filteredAssignDatesList.shortlisted_suppliers, filterExpression);
    }
    $scope.assignDates = function(inventory,activity,date,user){
      var dateUserExpression = {};
      var shortlistedInvIdList = [];
      date = commonDataShare.formatDate(date);
      dateUserExpression[date] = user;
      var assignment_detail = {
        activity_type : activity,
        date_user_assignments : dateUserExpression,
      };
      angular.forEach($scope.filteredAssignDatesList, function(supplier){
        if(inventory in supplier.shortlisted_inventories){
          angular.forEach(supplier.shortlisted_inventories[inventory].detail,function(inv){
            shortlistedInvIdList.push(inv.id);
          })
        }
      })
      var requestData = {
        shortlisted_inventory_id_detail : shortlistedInvIdList,
        assignment_detail : [],
      }
      requestData.assignment_detail.push(assignment_detail);
      auditReleasePlanService.saveActivityDetails(requestData)
      .then(function onSuccess(response){
        getResultsPage(1);
        $scope.dateChecked = false;
        swal(constants.name,constants.inventory_date_success,constants.success);
      })
      .catch(function onError(response){
        commonDataShare.showErrorMessage(response);
        console.log("error occured", response.status);
      });
    }

    $scope.deleteInvActAssignment = function(id){
      var data = {};
      auditReleasePlanService.deleteInvActAssignment(id, data)
      .then(function onSuccess(response){
        swal(constants.name,constants.delete_success,constants.success);
      }).catch(function onError(response){
        swal(constants.name,response.data.data.general_error,constants.error);
        console.log(response);
      })
    }
    $scope.getInventoryRelatedData = function(supplier){
      $scope.shortlistedSupplierData = supplier;
        auditReleasePlanService.getInventoryRelatedData()
        .then(function onSuccess(response){
          $scope.adInventoryTypes = response.data.data.inventory_types;
          $scope.durationTypes = response.data.data.duration_types;
        }).catch(function onError(response){
          console.log(response);
        })
    }
    $scope.adInvModel = {};
    $scope.addAdInventoryIds = function(){
      $scope.adInvModel['space_id'] =  $scope.shortlistedSupplierData.id;
      auditReleasePlanService.addAdInventoryIds($scope.adInvModel)
      .then(function onSuccess(response){
        $('#addInventoryModal').on('hide.bs.modal', function () {});
        $scope.adInvModel = {};
        getResultsPage(1);
        swal(constants.name, constants.add_data_success, constants.success);
      }).catch(function onError(response){
        console.log(response);
        swal(constants.name, constants.save_error, constants.error);
      })

    }
    $scope.deleteAdInventoryIds = function(){
      auditReleasePlanService.deleteAdInventoryIds($scope.invIdList)
      .then(function onSuccess(response){
        getResultsPage(1);
        swal(constants.name,response.data.data.msg,constants.success);
      }).catch(function onError(response){
        console.log(response);
        swal(constants.name, constants.error, constants.error);
      })
    }

    $scope.addComment = function(){
      $scope.commentModal['related_to'] = constants.execution_related_comment;
      $scope.commentModal['shortlisted_spaces_id'] = $scope.supplierDataForComment.id;
      auditReleasePlanService.addComment($scope.campaign_id,$scope.commentModal)
      .then(function onSuccess(response){
        $scope.commentModal = {};
        $scope.supplierDataForComment = undefined;
        $('#addComments').modal('hide');
        swal(constants.name, constants.add_data_success, constants.success);
      }).catch(function onError(response){
        console.log(response);
      })
    }
   $scope.getSupplierForComments = function(supplier){
     $scope.supplierDataForComment = supplier;
   }
   $scope.viewComments = function(supplier){
     $scope.supplierDataForComment = supplier;
     $scope.commentsData = {};
     var relatedTo = constants.execution_related_comment;
     var spaceId = $scope.supplierDataForComment.id;
     auditReleasePlanService.viewComments($scope.campaign_id,spaceId,relatedTo)
     .then(function onSuccess(response){
       $scope.commentModal = {};
       $scope.commentsData = response.data.data;
       if(Object.keys($scope.commentsData).length != 0){
         $scope.viewInvForComments = Object.keys($scope.commentsData);
         $scope.selectedInvForView = $scope.viewInvForComments[0];
         $('#viewComments').modal('show');
       }else{
         $('#viewComments').modal('hide');
         swal(constants.name,constants.no_comments_msg,constants.warning);
       }
     }).catch(function onError(response){
       console.log(response);
     })
   }
   var getOrganisationsForAssignment = function(){
     auditReleasePlanService.getOrganisationsForAssignment()
     .then(function onSuccess(response){
       $scope.organisationList = response.data.data;
     }).catch(function onError(response){
       console.log(response);
     })
   }

   var searchSupplierBySelection = function(){
     auditReleasePlanService.searchSupplierBySelection($scope.campaign_id)
     .then(function onSuccess(response){
       $scope.allShortlistedSuppliers = response.data.data;
     }).catch(function onError(response){
       console.log(response);
     })
   }
   searchSupplierBySelection();

   $scope.getSearchedSupplierData = function(supplier){
     supplierIdForSearch = supplier.supplier_id;
     getResultsPage(1);
   }

   $scope.resetSupplierData = function(){
     supplierIdForSearch = undefined;
     getResultsPage(1);
   }



}]);
