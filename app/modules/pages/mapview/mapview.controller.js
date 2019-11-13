"use strict";
angular.module('catalogueApp')
    .controller('MapCtrl', function($scope, $rootScope, $stateParams,  $window, $location, createProposalService, mapViewService ,$http, uiGmapGoogleMapApi,uiGmapIsReady,$q, Upload, $timeout, commonDataShare, constants, $filter, permissions) {
// You have to initailise some value for the map center beforehand
// $scope.map is just for that purpose --> Set it according to your needs.
// One good way is to set it at center of India when covering multiple cities otherwise middle of mumbai
$scope.map = { zoom: 9,bounds: {},center: {latitude: 19.119,longitude: 73.48,}};
$scope.supplier_map = { zoom: 9,bounds: {},center: {latitude: 19.119,longitude: 73.48,}};
$scope.options = { scrollwheel: false, mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_LEFT
    },
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT
    },
  };
//permissions
$scope.permissions = permissions.mapviewPage;
// initial_center currently no use AND old and new center to track whether center marker has been changed or not
  $scope.inital_center = {}
  $scope.old_center = {}
  $scope.new_center = {}
// an array equal to no. of centers to allow reseting each center if changed
  $scope.initial_center_changed = new Array();
  $scope.show = false; // for showing info windo
  $scope.center_marker = [];
  $scope.center_changed= false;
// can be used in grid view currently using for showing societies
  $scope.show_societies = false;
  $scope.society_markers = []; // markers on the map
  $scope.circle = {};

  //for loading icon
  $scope.requestProposal = true;

  if($window.localStorage.isReadOnly == 'true'){
    $scope.isRequested = true;
  }
$scope.proposalState = $window.localStorage.proposalState;
$scope.clientName = $window.localStorage.business_name;
//code added to show or hide some details based on user permissions
$scope.user_code = $window.localStorage.user_code;
if($scope.user_code == 'agency')
  $scope.hideData = true;
if($scope.user_code == 'guestUser')
  $scope.isGuestUser = true;

//supplier status
var supplierStatus = {
  finalized   : 'F',
  shortlisted : 'S',
  buffered    : 'B',
  removed     : 'R',
}
var supplierFilters = {
  RS : 'RS_filters',
  CP :  'CP_filters',
}
$scope.supplierCode = {
  society     : 'RS',
  corporate   : 'CP',
  busShelter  : 'BS',
  gym         : 'GY',
  saloon      : 'SA',
  retailStore  : 'RE',
}
$scope.supplierName = {
  society : 'Society',
  corporate : 'Corporate',
  busShelter : 'Bus Shelter',
  gym : 'Gym',
  saloon : 'Saloon',
  retailStore : 'Retail Store',
  all   : 'All',
}
var impressions = {
  poster  : 0,
  standee : 0,
  stall   : 0,
  flier   : 0,
}
var summaryCounts = {
  count         : 0,
  flat_count    : 0,
  tower_count   : 0,
  poster_count  : 0,
  flier_count   : 0,
  standee_count : 0,
  stall_count   : 0,
  impressions   : angular.copy(impressions),
}
var summarySupplierStatus = {
  count       : 0,
  flat_count  : 0,
  tower_count : 0,
  finalized   : angular.copy(summaryCounts),
  shortlisted : angular.copy(summaryCounts),
  buffered    : {count : 0},
  removed     : {count:  0},
}
var inventoryTypes = {
  poster  : 'PO',
  standee : 'ST',
  stall   : 'SL',
  flier   : 'FL',
}
//supplier status
$scope.finalize = constants.finalize;
$scope.buffer = constants.buffer;
$scope.remove = constants.remove;
$scope.gridViewSummary = {};

//getting business_name and business_type from localStorage
// $scope.businessData = JSON.parse($window.localStorage.business);
// $scope.business_name = $scope.businessData.name;
// $scope.business_type = $scope.businessData.type_name.business_type;
// after angular-google-maps is loaded properly only then proces code inside then
  uiGmapGoogleMapApi.then(function(maps) {
      function assignCenterMarkerToMap(center){
        // This is to assign marker for the current center on the map could have used single marker (ui-gmap-marker) but wasn't working hence used ui-gmap-markers
          var center_marker = [];
          center_marker.push({
              id:0,
              latitude: center.latitude,
              longitude: center.longitude,
              options : {draggable : true},
              events : {
                drag : function(marker, event, model){
                  $scope.new_center.latitude = marker.getPosition().lat();
                  $scope.new_center.longitude = marker.getPosition().lng();
                  if($scope.old_center.latitude != $scope.new_center.latitude || $scope.old_center.longitude != $scope.new_center.longitude){
                      $scope.center_changed = true;
                  }else
                      $scope.center_changed = false;
                }
              }
            });
                return center_marker;
        }
      // TO show different colors for suppliers based on status
      $scope.status_color;
      function getIcon(supplier,key){
        if(supplier.status == 'S')
          $scope.status_color = "FFFF00";// yellow
        if(supplier.status == 'F')
          $scope.status_color = "00FF00";//green
        if(supplier.status == 'R')
          $scope.status_color = "FF0000";// RED
        if(supplier.status == 'B')
          $scope.status_color = "654321";// brown
        var icon;
        if(key == $scope.supplierCode.retailStore){
          $scope.status_color = "0000FF";
          icon = icons[key] + $scope.status_color +'/000000/000000/';
          return icon
        }
        icon = icons[key] + $scope.status_color +'/000000/000000/';
        return icon;
      }
      var icons = {
        // http://www.googlemapsmarkers.com/v1/LABEL/FILL COLOR/LABEL COLOR/STROKE COLOR/
        'RS':'http://www.googlemapsmarkers.com/v1/'+'S/',
        'CP':'http://www.googlemapsmarkers.com/v1/'+'C/',
        'BS':'http://www.googlemapsmarkers.com/v1/'+'B/',
        'GY':'http://www.googlemapsmarkers.com/v1/'+'G/',
        'SA':'http://www.googlemapsmarkers.com/v1/'+'SA/',
        'RE':'http://www.googlemapsmarkers.com/v1/'+'RE/',
      };
      function assignMarkersToMap(spaces) {
          // assigns spaces(society, corporate) markers on the map
          // ADDNEW --> this function needs to have "if" condition for society as its variables have society_ in every variable while other doesn't
          var markers = [];
          var icon;
          angular.forEach(spaces, function(suppliers,key){

            for (var i=0; i <suppliers.length; i++) {
                markers.push({
                    latitude: suppliers[i].latitude,
                    longitude: suppliers[i].longitude,
                    id: suppliers[i].supplier_id,
                    icon:getIcon(suppliers[i],key),
                    options : {draggable : false},
                    title : {
                        name : suppliers[i].name,
                        address1 : suppliers[i].address1,
                        subarea : suppliers[i].subarea,
                        location_type : suppliers[i].location_type,
                    },
                });
            };
          });
            $scope.hideSpinner = true;
          return markers;

      };
      $scope.changeCurrentCenter = function(center_id){
            // changes the center currently shown on the map
            // only front end work
          try{
            for(var i=0;i<$scope.center_data.length; i++)
                if($scope.center_data[i].center.id == center_id){
                    $scope.current_center = $scope.center_data[i]
                    $scope.current_center_index = i;
                }
            // make the current center of map equal to center of the map
            $scope.map.center.latitude = $scope.current_center.center.latitude;
            $scope.map.center.longitude = $scope.current_center.center.longitude;
            $scope.circle.center.latitude = $scope.current_center.center.latitude;
            $scope.circle.center.longitude = $scope.current_center.center.longitude;
            $scope.circle.radius = $scope.current_center.center.radius * 1000;

            if($scope.current_center.suppliers_meta != null){
              checkSavedFilters();
              toggleInventoryFilters($scope.current_center,'true','RS');
              mapViewBasicSummary();
              suppliersData();
              gridViewBasicSummary();
            }
            $scope.society_markers = assignMarkersToMap($scope.current_center.suppliers);
            $scope.center_marker =assignCenterMarkerToMap($scope.current_center.center);
            suppliersData();
            mapViewBasicSummary();
            mapViewFiltersSummary();
            mapViewImpressions();
            gridViewBasicSummary();
          }
          catch(error){
            console.log(error.message);
          }
        }
        //Start:reset center to original center
        //End: reset center to original center
        // Start: Change center,change radius functionality
          $scope.changeCenter = function(change_center){
              // if change_center present then change center to new_center latitude longitude
              // calls backend and modifies the current_center and ultimately the actual center (doesn't save at this point)
              // on changing center lot of things changes
              // map center || circle center and radius || current_center || society_markers || old_center new_center
            try{
              $scope.initial_center_changed[$scope.current_center_index] = true;
              if(change_center){
                  // only if change_center present center is changed
                  $scope.old_center = {
                      latitude : $scope.new_center.latitude,
                      longitude : $scope.new_center.longitude,
                  }
                  $scope.current_center.center.latitude = $scope.new_center.latitude;
                  $scope.current_center.center.longitude = $scope.new_center.longitude;
                  // change map center to new lat lng
                  $scope.map.center.latitude = $scope.new_center.latitude;
                  $scope.map.center.longitude = $scope.new_center.longitude;
                  $scope.center_changed = false;
              }
              if(change_center == false){
                $scope.current_center.center.latitude = $scope.old_data[$scope.current_center_index].center.latitude;
                $scope.current_center.center.longitude = $scope.old_data[$scope.current_center_index].center.longitude;
                $scope.current_center.center.radius = $scope.old_data[$scope.current_center_index].center.radius;
              }
              $scope.center_marker = assignCenterMarkerToMap($scope.current_center.center);

              $scope.circle.center.latitude = $scope.current_center.center.latitude;
              $scope.circle.center.longitude = $scope.current_center.center.longitude;
              $scope.circle.radius = $scope.current_center.center.radius * 1000;

              // this service will return above deleted variables if checked in the filter
              $scope.current_center.center.center_id = $scope.current_center.center.id;
              // $scope.getInitialSpaces($scope.center_data[$scope.current_center_index]);
              var current_center_keys = Object.keys($scope.center_data[$scope.current_center_index].suppliers);
                for (var i = 0; i < current_center_keys.length; i++) {
                  var code = current_center_keys[i];
                  if(code == $scope.supplierCode.society)
                    $scope.societyFilters();
                  if(code == $scope.supplierCode.corporate)
                    $scope.corporateFilters();
                  if(code == $scope.supplierCode.busShelter)
                    $scope.busShelterFilters();
                  if(code == $scope.supplierCode.gym)
                    $scope.gymFilters();
                  if(code == $scope.supplierCode.saloon)
                    $scope.saloonFilters();
                    if(code == $scope.supplierCode.retailStore)
                      $scope.retailStoreFilters();
                }
              // mapViewService.getChangedCenterSpaces($scope.proposal_id_temp, $scope.current_center.center)
              // .then(function onSuccess(response, status){
              //   // Start : Code changes to add response of suppliers
              //   $scope.current_center.suppliers = response.data.data.suppliers[0].suppliers;
              //   // $scope.current_center = response;
              //   $scope.center_data[$scope.current_center_index].suppliers = response.data.data.suppliers[0].suppliers;
              //   // to copy extra suppliers searched in add more suppliers
              //   // needs to add every time whenever new response come from backend
              //   // current_center_keys gets all keys in current_center so that we can copy
              //   var current_center_keys = Object.keys($scope.center_data[$scope.current_center_index].suppliers);
              //   for (var i = 0; i < current_center_keys.length; i++) {
              //     var code = current_center_keys[i];
              //     $scope.center_data[$scope.current_center_index].suppliers[code].push.apply($scope.center_data[$scope.current_center_index].suppliers[code],$scope.extraSuppliersData[$scope.current_center_index][code]);
              //     getSummary(code,$scope.current_center);
              //
              //   }
              //   // End : Code changes to add response of suppliers
              //     // gridView_Summary();
              //     $scope.center_data[$scope.current_center_index] = $scope.current_center;
              //     suppliersData();
              //     mapViewBasicSummary();
              //     // mapViewFiltersSummary();
              //     // mapViewImpressions();
              //     gridViewBasicSummary();
              //     // $scope.impressions = calculateImpressions($scope.current_center.societies_inventory_count);
              //     if($scope.current_center.suppliers != undefined){
              //         $scope.society_markers = assignMarkersToMap($scope.current_center.suppliers);
              //     }else
              //         $scope.society_markers = [];
              // })
              // .catch(function onError(response, status){
              //   commonDataShare.showErrorMessage(response);
                // swal(constants.name,constants.errorMsg,constants.error);


            }catch(error){
              console.log(error.message);
            }
          }
        //End: Change center,change radius and reset center functionality
    //start: mapview basic summary required when load a page
      var mapViewBasicSummary = function(){
        try{
          $scope.flat_count = 0, $scope.tower_count = 0;
          if($scope.current_center.suppliers['RS'] != undefined){
              $scope.societies_count = $scope.current_center.suppliers['RS'].length;
              for(var temp=0;temp<$scope.societies_count;temp++){
                $scope.flat_count += $scope.current_center.suppliers['RS'][temp].flat_count;
                $scope.tower_count += $scope.current_center.suppliers['RS'][temp].tower_count;
              }
            }
          if($scope.current_center.suppliers['CP'] != undefined){
            $scope.corporates_count = $scope.current_center.suppliers['CP'].length;
          }
          if($scope.current_center.suppliers[$scope.supplierCode.busShelter] != undefined){
            $scope.corporates_count = $scope.current_center.suppliers[$scope.supplierCode.busShelter].length;
          }
        }catch(error){
          console.log(error.message);
        }
      }
    //End: mapview basic summary
    //Start: mapview filter summary required after applying filters
     var mapViewFiltersSummary = function(supplier_code){
      try{
       $scope.stall_count = 0, $scope.standee_count = 0;
       if($scope.current_center.suppliers_meta != null){
         if($scope.current_center.suppliers_meta['RS'] != undefined){
           if($scope.current_center.suppliers_meta['RS'].inventory_count != null){
              if($scope.current_center.suppliers_meta['RS'].inventory_count.stalls != null)
                $scope.stall_count += $scope.current_center.suppliers_meta['RS'].inventory_count.stalls;
              if($scope.current_center.suppliers_meta['RS'].inventory_count.standees != null)
                $scope.standee_count += $scope.current_center.suppliers_meta['RS'].inventory_count.standees;
           }
         }
         // not being used yet
         if($scope.current_center.suppliers_meta['CP'] != undefined){
           if($scope.current_center.suppliers_meta['CP'].inventory_count != null){
            if($scope.current_center.suppliers_meta['CP'].inventory_count.stalls != null)
              $scope.stall_count1 += $scope.current_center.suppliers_meta['CP'].inventory_count.stalls;
            if($scope.current_center.suppliers_meta['CP'].inventory_count.standees != null)
              $scope.standee_count1 += $scope.current_center.suppliers_meta['CP'].inventory_count.standees;
           }
         }
       }
     }catch(error){
       console.log(error.message);
     }
    }
    //End: mapview filter summary required after applying filters
    //Start: impressions on mapview
      var mapViewImpressions = function(){
       try{
        $scope.posterMapImpressions = $scope.flat_count*4*7*2;
        $scope.flierMapImpressions = $scope.flat_count*4*1;
        if($scope.stall_count !=0 || $scope.stall_count)
          $scope.stallMapImpression = $scope.flat_count*4*2;
        else
          $scope.stallMapImpression = 0;
        if($scope.standee_count != 0 || $scope.standee_count)
          $scope.standeeMapImpression = $scope.flat_count * 4*7*2;
        else
          $scope.standeeMapImpression = 0;
      }catch(error){
        console.log(error.message);
      }
    }
    //End: impressions on mapview
    //start:summary for mapview
      var getSummary = function(supplier_code,center){
        console.log($scope.center_data);
        console.log(center);
        center.summary_meta[supplier_code] = angular.copy(summarySupplierStatus);
        //supplier count calculated
        center.summary_meta[supplier_code].count = center.suppliers[supplier_code].length;
        angular.forEach(center.suppliers[supplier_code], function(supplier){
          //flat and tower count for societies
          if(supplier_code == $scope.supplierCode.society){
            center.summary_meta[supplier_code].flat_count += supplier.flat_count;
            center.summary_meta[supplier_code].tower_count += supplier.tower_count;
          }
          //count of suppliers finalized
          if(supplier.status == supplierStatus.finalized){
            center.summary_meta[supplier_code].finalized.count += 1;
            if(supplier_code == $scope.supplierCode.society){
              center.summary_meta[supplier_code].finalized.flat_count += supplier.flat_count;
              center.summary_meta[supplier_code].finalized.tower_count += supplier.tower_count;
              center.summary_meta[supplier_code].finalized.poster_count += supplier.tower_count;
              center.summary_meta[supplier_code].finalized.flier_count += supplier.flat_count;
              if(supplier.total_standee_count >= 0)
                center.summary_meta[supplier_code].finalized.standee_count += supplier.total_standee_count;
              if(supplier.total_stall_count >= 0)
                center.summary_meta[supplier_code].finalized.stall_count += supplier.total_stall_count;
            }
            if(supplier_code == $scope.supplierCode.corporate){
              console.log("summary");
            }
          }
          if(supplier.status == supplierStatus.shortlisted){
            center.summary_meta[supplier_code].shortlisted.impressions = angular.copy(impressions);
            center.summary_meta[supplier_code].shortlisted.count += 1;
            if(supplier_code == $scope.supplierCode.society){
              center.summary_meta[supplier_code].shortlisted.flat_count += supplier.flat_count;
              center.summary_meta[supplier_code].shortlisted.tower_count += supplier.tower_count;
              center.summary_meta[supplier_code].shortlisted.poster_count += supplier.tower_count;
              center.summary_meta[supplier_code].shortlisted.flier_count += supplier.flat_count;
              if(supplier.total_standee_count >= 0 && supplier.total_stall_count)
                center.summary_meta[supplier_code].shortlisted.standee_count += supplier.total_standee_count;
              if(supplier.total_stall_count >= 0 && supplier.total_stall_count)
                center.summary_meta[supplier_code].shortlisted.stall_count += supplier.total_stall_count;
            if(supplier_code == $scope.supplierCode.corporate){
            }
              console.log("summary");
            }
          }
          if(supplier.status == supplierStatus.buffered){
            center.summary_meta[supplier_code].buffered.count += 1;
          }
          if(supplier.status == supplierStatus.removed){
            center.summary_meta[supplier_code].removed.count += 1;
          }
        });
        getImpressions(supplier_code,center);
        console.log($scope.center_data);
      }
    // end mapview summary
    //start: gridview summary
    var getComprehinsiveSummary = function(supplier_code){
      $scope.gridViewSummary[supplier_code] = angular.copy(summarySupplierStatus);
      console.log($scope.gridViewSummary,$scope.center_data);
      for(var i=0;i<$scope.center_data.length; i++){
        $scope.center_data[i].summary_meta[supplier_code].count = $scope.center_data[i].suppliers[supplier_code].length;
        if(Object.keys($scope.center_data[i].summary_meta).length > 0){
          $scope.gridViewSummary[supplier_code].finalized.count += $scope.center_data[i].summary_meta[supplier_code].finalized.count;
          $scope.gridViewSummary[supplier_code].shortlisted.count += $scope.center_data[i].summary_meta[supplier_code].shortlisted.count;
          $scope.gridViewSummary[supplier_code].buffered.count += $scope.center_data[i].summary_meta[supplier_code].buffered.count;
          $scope.gridViewSummary[supplier_code].removed.count += $scope.center_data[i].summary_meta[supplier_code].removed.count;
          if(supplier_code == $scope.supplierCode.society){
            $scope.gridViewSummary[supplier_code].flat_count += $scope.center_data[i].summary_meta[supplier_code].flat_count;
            $scope.gridViewSummary[supplier_code].tower_count += $scope.center_data[i].summary_meta[supplier_code].tower_count;
            $scope.gridViewSummary[supplier_code].finalized.flat_count += $scope.center_data[i].summary_meta[supplier_code].finalized.flat_count;
            if($scope.center_data[i].inventory_meta[supplier_code].has(inventoryTypes.poster)){
              $scope.gridViewSummary[supplier_code].finalized.poster_count += $scope.center_data[i].summary_meta[supplier_code].finalized.poster_count;
            }
            if($scope.center_data[i].inventory_meta[supplier_code].has(inventoryTypes.flier)){
              $scope.gridViewSummary[supplier_code].finalized.flier_count += $scope.center_data[i].summary_meta[supplier_code].finalized.flier_count;
            }
            if($scope.center_data[i].inventory_meta[supplier_code].has(inventoryTypes.standee)){
              $scope.gridViewSummary[supplier_code].finalized.standee_count += $scope.center_data[i].summary_meta[supplier_code].finalized.standee_count;
            }
            if($scope.center_data[i].inventory_meta[supplier_code].has(inventoryTypes.stall))
              $scope.gridViewSummary[supplier_code].finalized.stall_count += $scope.center_data[i].summary_meta[supplier_code].finalized.stall_count;

              $scope.gridViewSummary[supplier_code].shortlisted.flat_count += $scope.center_data[i].summary_meta[supplier_code].shortlisted.flat_count;
              $scope.gridViewSummary[supplier_code].shortlisted.tower_count += $scope.center_data[i].summary_meta[supplier_code].shortlisted.tower_count;
              if($scope.center_data[i].inventory_meta[supplier_code].has(inventoryTypes.poster)){
                $scope.gridViewSummary[supplier_code].shortlisted.poster_count += $scope.center_data[i].summary_meta[supplier_code].shortlisted.poster_count;
              }
              if($scope.center_data[i].inventory_meta[supplier_code].has(inventoryTypes.flier)){
                $scope.gridViewSummary[supplier_code].shortlisted.flier_count += $scope.center_data[i].summary_meta[supplier_code].shortlisted.flier_count;
              }
              if($scope.center_data[i].inventory_meta[supplier_code].has(inventoryTypes.standee))
                $scope.gridViewSummary[supplier_code].shortlisted.standee_count += $scope.center_data[i].summary_meta[supplier_code].shortlisted.standee_count;
              if($scope.center_data[i].inventory_meta[supplier_code].has(inventoryTypes.stall))
                $scope.gridViewSummary[supplier_code].shortlisted.stall_count += $scope.center_data[i].summary_meta[supplier_code].shortlisted.stall_count;
          }
        }
      }
      getComprehinsiveImpressions(supplier_code);
      console.log($scope.gridViewSummary,$scope.center_data);
    }
    //End: gridview summary
    var getImpressions = function(supplier_code,center){
      console.log("hello");
      console.log(center);
      var supplier = center.summary_meta[supplier_code];
      var finalized_flat_count = supplier.finalized.flat_count;
      var shortlisted_flat_count = supplier.shortlisted.flat_count;
      supplier.finalized.impressions.poster = finalized_flat_count *4*7*2;
      supplier.finalized.impressions.flier = finalized_flat_count *4*1;
      if(supplier.finalized.standee_count != 0)
        supplier.finalized.impressions.standee = finalized_flat_count *4*7*2;
      if(supplier.finalized.standee_count != 0)
        supplier.finalized.impressions.stall = finalized_flat_count *4*2;

      //for shortlisted suppliers
      supplier.shortlisted.impressions.poster = shortlisted_flat_count *4*7*2;
      supplier.shortlisted.impressions.flier = shortlisted_flat_count *4*1;;
      if(supplier.shortlisted.standee_count != 0)
        supplier.shortlisted.impressions.standee = shortlisted_flat_count *4*7*2;
      if(supplier.shortlisted.standee_count != 0)
        supplier.shortlisted.impressions.stall = shortlisted_flat_count *4*2;
    }
    var getComprehinsiveImpressions = function(supplier_code){
      console.log($scope.gridViewSummary);
        var summary = $scope.gridViewSummary[supplier_code];
        if(summary.finalized.poster_count > 0)
          summary.finalized.impressions.poster = summary.finalized.flat_count *4*7*2;
        if(summary.finalized.flier_count > 0)
          summary.finalized.impressions.flier = summary.finalized.flat_count *4*1;
        if(summary.finalized.standee_count > 0)
          summary.finalized.impressions.standee = summary.finalized.flat_count *4*7*2;
        if(summary.finalized.stall_count > 0)
          summary.finalized.impressions.stall = summary.finalized.flat_count *4*2;

        //shortlisted
        summary.shortlisted.impressions.poster = summary.shortlisted.flat_count *4*7*2;
        summary.shortlisted.impressions.flier = summary.shortlisted.flat_count *4*1;
        if(summary.shortlisted.standee_count > 0)
          summary.shortlisted.impressions.standee = summary.shortlisted.flat_count *4*7*2;
        if(summary.shortlisted.stall_count > 0)
          summary.shortlisted.impressions.stall = summary.shortlisted.flat_count *4*2;

      console.log("compr_summa",$scope.gridViewSummary);
    }
    //Start: collectng all centers suppliers data in one varible for RS,CP..etc
      var suppliersData = function(){
       try{
        $scope.total_societies = [], $scope.total_corporates = [], $scope.total_busShleters = [];
        $scope.total_gyms = [], $scope.total_saloons = [], $scope.total_retailStores = [];
        for (var index=0;index<$scope.center_data.length;index++){
          if($scope.center_data[index].suppliers['RS']!=undefined){
            $scope.total_societies = $scope.total_societies.concat($scope.center_data[index].suppliers['RS']);
          }
          if($scope.center_data[index].suppliers['CP']!=undefined){
            $scope.total_corporates = $scope.total_corporates.concat($scope.center_data[index].suppliers['CP']);
          }
          if($scope.center_data[index].suppliers[$scope.supplierCode.busShelter]!=undefined){
            $scope.total_busShleters = $scope.total_busShleters.concat($scope.center_data[index].suppliers[$scope.supplierCode.busShelter]);
          }
          if($scope.center_data[index].suppliers[$scope.supplierCode.gym]!=undefined){
            $scope.total_gyms = $scope.total_gyms.concat($scope.center_data[index].suppliers[$scope.supplierCode.gym]);
          }
          if($scope.center_data[index].suppliers[$scope.supplierCode.saloon]!=undefined){
            $scope.total_saloons = $scope.total_saloons.concat($scope.center_data[index].suppliers[$scope.supplierCode.saloon]);
          }
          if($scope.center_data[index].suppliers[$scope.supplierCode.retailStore]!=undefined){
            $scope.total_retailStores = $scope.total_retailStores.concat($scope.center_data[index].suppliers[$scope.supplierCode.retailStore]);
          }
        }
      }catch(error){
        console.log(error.message);
      }
    }
      //End: collectng all centers suppliers data in one varible like for RS,CP..etc
        //Start: gridView basic summary
      var gridViewBasicSummary = function(){
       try{
         console.log($scope.total_busShleters);
        $scope.total_flat_count = 0, $scope.total_tower_count = 0;
        $scope.total_societies_count = $scope.total_societies.length;
        $scope.total_corporates_count = $scope.total_corporates.length;
        $scope.total_busShleters_count = $scope.total_busShleters.length;
        $scope.total_gyms_count = $scope.total_gyms.length;
        $scope.total_saloons_count = $scope.total_saloons.length;
        $scope.total_retailStores_count = $scope.total_retailStores.length;
          for(var temp=0; temp<$scope.total_societies_count; temp++){
            $scope.total_flat_count += $scope.total_societies[temp].flat_count;
            $scope.total_tower_count += $scope.total_societies[temp].tower_count;
          }
        }catch(error){
          console.log(error.message);
        }
      }
    //End: gridView basic summary
    //Start: summary on gridview for total stalls & standees after applying filters
    var gridViewFilterSummary = function(){
     try{
      $scope.total_stalls = 0, $scope.total_standees = 0;
      for(var center = 0; center < $scope.center_data.length; center++){
        if($scope.center_data[center].suppliers_meta != null){
          if($scope.center_data[center].suppliers_meta['RS'] != null){
            if($scope.center_data[center].suppliers_meta['RS'].inventory_count != null){
              $scope.total_stalls += $scope.center_data[center].suppliers_meta['RS'].inventory_count.stalls;
              $scope.total_standees += $scope.center_data[center].suppliers_meta['RS'].inventory_count.standees;
            }
          }
        }
      }
    }catch(error){
      console.log(error.message);
    }
  }
    //End: summary on gridview for total stalls & standees after applying filters
      //Start: gridview impressions : multiply with total flat count for societies
    var gridViewImpressions = function(){
     try{
      $scope.flierGridImpressions = 0, $scope.posterGridImpressions = 0;
      $scope.standeeGridImpression = 0,$scope.stallGridImpression = 0;

      $scope.flierGridImpressions = $scope.total_flat_count *4*1;
      $scope.posterGridImpressions = $scope.total_flat_count *4*7*2;
      if($scope.total_stalls != 0 || $scope.total_stalls)
        $scope.stallGridImpression = $scope.total_flat_count *4*2;
      else
        $scope.stallGridImpression = 0;
      if($scope.total_standees != 0 || $scope.total_standees)
        $scope.standeeGridImpression = $scope.total_flat_count *4*7*2;
      else
        $scope.standeeGridImpression = 0;
    }catch(error){
      console.log(error.message);
    }
  }
      //End: gridview impressions : multiply with total flat count for societies

// Execute code inside them only when uiGMapIsReady is done --> map is loaded properly
      uiGmapIsReady.promise()
        .then(function(instances) {
            // initiated here as this is used in the service below
            // similarly initiate for other spacecs as well
            $scope.flat_count = {
                min: 0,
                max: 0,
                options: {
                    floor: 0,
                    ceil: 1000,
                    step: 1,
                    noSwitching: true,
                }
            };
            $scope.flat_size = {
                min: 0,
                max: 0,
                options: {
                    floor: 0,
                    ceil: 2000,
                    step: 1,
                    noSwitching: true,
                }
            };
            $scope.flat_avg_rental_persqft = {
                min: 0,
                max: 0,
                options: {
                    floor: 0,
                    ceil: 200,
                    step: 1,
                    noSwitching: true,
                }
            };
            $scope.flat_sale_cost_persqft = {
                min: 0,
                max: 0,
                options: {
                    floor: 0,
                    ceil: 10000,
                    step: 1,
                    noSwitching: true,
                }
            };
            $scope.possession_year = {
                min: 1900,
                max: 1900,
                options: {
                    floor: 1900,
                    ceil: 2017,
                    step: 1,
                    noSwitching: true,
                }
            };
            $scope.no_of_tenants = {
                min: 0,
                max: 0,
                options: {
                    floor: 0,
                    ceil: 100,
                    step: 1,
                    noSwitching: true,
                }
            };
            //$scope.no_of_tenants.options.ceil = integer value;  //need to uncomment to fix other ceil value
            $scope.is_standalone_society= {
              selected :false,
            };
            $scope.space_inventory_type = [
                {name : 'Poster(PO)',  code : 'PO',   selected : false },
                {name : 'Standee(ST)', code : 'ST',   selected : false },
                {name : 'Stall(SL)',   code : 'SL',   selected : false },
                {name : 'Flyer(FL)',   code : 'FL',   selected : false },
                {name : 'Car(CD)',     code : 'CD',   selected : false },
                {name : 'PO & FL',     code : 'POFL',   selected : false },
                {name : 'ST & FL',     code : 'STFL',   selected : false },
                {name : 'SL & FL',     code : 'SLFL',   selected : false },
                {name : 'CD & FL',     code : 'CDFL',   selected : false },
                {name : 'PO & SL & FL',code : 'POSLFL',   selected : false },
                {name : 'ST & SL& FL', code : 'STSLFL',   selected : false },
                {name : 'PO & CD & FL',code : 'POCDFL',   selected : false },
                {name : 'ST & CD & FL',code : 'STCDFL',   selected : false },
            ];
            $scope.space_location = [
                {name : 'Ultra High',   code : 'UH',    selected : false},
                {name : 'High',         code : 'HH',    selected : false},
                {name : 'Medium High',  code : 'MH',    selected : false},
                {name : 'Standard',     code : 'ST',    selected : false},
            ];
            $scope.space_quality_type = [
                {name : 'Ultra High',   code : 'UH',    selected : false},
                {name : 'High',         code : 'HH',    selected : false},
                {name : 'Medium High',  code : 'MH',    selected : false},
                {name : 'Standard',     code : 'ST',    selected : false},
            ];
            $scope.space_quantity_type = [
                {name : 'Small',        code : 'SM',    selected : false},
                {name : 'Medium',       code : 'MD',    selected : false},
                {name : 'Large',        code : 'LA',    selected : false},
                {name : 'Very Large',   code : 'VL',    selected : false},
            ];
            $scope.flat_size_by_flat_type = {
              '1R'    : 1000,
              '1B'    : 1500,
              '1-5B'  : 2000,
              '2B'    : 2500,
              '2-5B'  : 3000,
              '3B'    : 4000,
              '4B'    : 7000,
              '5B'    : 10000,
              'PH'    : 15000,
              'RH'    : 20000,
              'DP'    : 10000,
            };
            $scope.society_flat_type = [
                {name : '1 RK',         code : '1R',      selected : false,  flat_count:angular.copy($scope.flat_count), flat_size:angular.copy($scope.flat_size)},
                {name : '1 BHK',        code : '1B',      selected : false,  flat_count:angular.copy($scope.flat_count), flat_size:angular.copy($scope.flat_size)},
                {name : '1.5 BHK',      code : '1-5B',    selected : false,  flat_count:angular.copy($scope.flat_count), flat_size:angular.copy($scope.flat_size)},
                {name : '2 BHK',        code : '2B',      selected : false,  flat_count:angular.copy($scope.flat_count), flat_size:angular.copy($scope.flat_size)},
                {name : '2.5 BHK',      code : '2-5B',    selected : false,  flat_count:angular.copy($scope.flat_count), flat_size:angular.copy($scope.flat_size)},
                {name : '3 BHK',        code : '3B',      selected : false,  flat_count:angular.copy($scope.flat_count), flat_size:angular.copy($scope.flat_size)},
                {name : '4 BHK',        code : '4B',      selected : false,  flat_count:angular.copy($scope.flat_count), flat_size:angular.copy($scope.flat_size)},
                {name : '5 BHK',        code : '5B',      selected : false,  flat_count:angular.copy($scope.flat_count), flat_size:angular.copy($scope.flat_size)},
                {name : 'PENT HOUSE',   code : 'PH',      selected : false,  flat_count:angular.copy($scope.flat_count), flat_size:angular.copy($scope.flat_size)},
                {name : 'DUPLEX',       code : 'DP',      selected : false,  flat_count:angular.copy($scope.flat_count), flat_size:angular.copy($scope.flat_size)},
                {name : 'ROW HOUSE',    code : 'RH',      selected : false,  flat_count:angular.copy($scope.flat_count), flat_size:angular.copy($scope.flat_size)},
            ];
            $scope.employee_count = [
              {name:'0-1000',     code : {min:'0',      max:'1000'},   selected:false},
              {name:'1000-3000',  code : {min:'1000',   max:'3000'},   selected:false},
              {name:'3000-6000',  code : {min:'3000',   max:'6000'},   selected:false},
              {name:'6000-10000', code : {min:'6000',   max:'10000'},  selected:false},

            ];
            $scope.inventory_filters = {
              inv_poster : 0,
              inv_standee : 0,
              inv_stall : 0,
              inv_flier : 0,
            };
            $scope.inventory_headers = {
              poster : false,
              standee : false,
              stall : false,
              flier : false,
            };
            //set flat sizes
            angular.forEach($scope.society_flat_type,function(flat_type){
              flat_type.flat_size.options.ceil = $scope.flat = $scope.flat_size_by_flat_type[flat_type.code];
            });
            //Start: api call to get amenity filters from database
              mapViewService.getAmenityFilters()
              .then(function onSuccess(response, status) {
                console.log(response);
                $scope.amenities = response.data.data;
                $scope.loading = response.data.data;
              })
              .catch(function onError(response){
                console.log(response);
                commonDataShare.showErrorMessage(response);
                // swal(constants.name,constants.amenity_error,constants.error);
              });
            //End:   api call to get amenity filters from database

        //Start: filters for suppliers
        var createInitialFilterData = function(){
          try{
            $scope.RS_filters = {
              inventory : $scope.space_inventory_type,
              locality_rating : $scope.space_location,
              quality_type : $scope.space_quality_type,
              quantity_type : $scope.space_quantity_type,
              flat_type : $scope.society_flat_type,
              amenities : $scope.amenities,
              flat_avg_rental_persqft:$scope.flat_avg_rental_persqft,
              flat_sale_cost_persqft:$scope.flat_sale_cost_persqft,
              ratio_of_tenants_to_flats:$scope.no_of_tenants,
              possession_year : $scope.possession_year,
            };
            $scope.CP_filters = {
              inventory : $scope.space_inventory_type,
              locality_rating : $scope.space_location,
              quality_type : $scope.space_quality_type,
              quantity_type : $scope.space_quantity_type,
              employee_count : $scope.employee_count,
            };
          }catch(error){
            console.log(error.message);
          }
        }
        //End: filters for suppliers
        //Start: add filter varible for each supplier in each center
        //set created to maintain unique_suppliers in all centers
    $scope.society_show = false,$scope.corporate_show = false;
    $scope.supplier_centers_list = {
      RS:[],
      CP:[],
    };
    //created set of suppliers to collect unique suppliers in multiple centers
    //this is used to show all suppliers uniquely on gridview
    //i.e no duplication if the supplier is repeated in multiple centers
    $scope.unique_suppliers = new Set();
    $scope.extraSuppliersData = [];
    var center_id=0;
    //function basically adds required keys to handle supplier allowed checkbox
    //function called from getSpaces after loading the page
    $scope.addSupplierFilters = function(centers){
     try{
      angular.forEach(centers, function(center){

        center.suppliers_allowed = {};
        center.filters_meta = {};
        center.inventory_meta = {};
        center.summary_meta = {};
        $scope.extraSuppliersData[center_id] = {};
       if(center.suppliers[$scope.supplierCode.society] != undefined){
        //  center.summary_meta[$scope.supplierCode.society] = angular.copy(summarySupplierStatus);
         center.inventory_meta[$scope.supplierCode.society] = new Set();
         $scope.extraSuppliersData[center_id][$scope.supplierCode.society] = [];
         center.suppliers_allowed.society_allowed = true;
         $scope.unique_suppliers.add($scope.supplierCode.society);
         center.suppliers_allowed['society_show'] = true;
         center.RS_filters = angular.copy($scope.RS_filters);
        //  center.suppliers_meta = {};
         $scope.supplier_centers_list.RS.push(center_id);
         //added to show selected filter on mapview summary
         center.filters_meta[$scope.supplierCode.society] = {};
         center.filters_meta[$scope.supplierCode.society] = angular.copy($scope.inventory_filters);
         getSummary($scope.supplierCode.society,center);
       }
       if(center.suppliers[$scope.supplierCode.corporate] != undefined){
        //  center.summary_meta[$scope.supplierCode.corporate] = angular.copy(summarySupplierStatus);
         center.inventory_meta[$scope.supplierCode.corporate] = new Set();
         $scope.extraSuppliersData[center_id]['CP'] = [];
        center.suppliers_allowed['corporate_allowed'] =  true;
        $scope.unique_suppliers.add('CP');
        center.suppliers_allowed['corporate_show'] =  true;
         center.CP_filters =  angular.copy($scope.CP_filters);
        //  center.suppliers_meta = {};
         $scope.supplier_centers_list.CP.push(center_id);
         getSummary($scope.supplierCode.corporate,center);
       }
       if(center.suppliers[$scope.supplierCode.busShelter] != undefined){
         center.suppliers_allowed['busShelter_allowed'] = true;
         center.suppliers_allowed['busShelter_show'] = true;
         $scope.unique_suppliers.add($scope.supplierCode.busShelter);
         getSummary($scope.supplierCode.busShelter,center);
       }
       if(center.suppliers[$scope.supplierCode.gym] != undefined){
         center.suppliers_allowed['gym_allowed'] = true;
         center.suppliers_allowed['gym_show'] = true;
         $scope.unique_suppliers.add($scope.supplierCode.gym);
         getSummary($scope.supplierCode.gym,center);
       }
       if(center.suppliers[$scope.supplierCode.saloon] != undefined){
         center.suppliers_allowed['saloon_allowed'] = true;
         center.suppliers_allowed['saloon_show'] = true;
         $scope.unique_suppliers.add($scope.supplierCode.saloon);
         getSummary($scope.supplierCode.saloon,center);
       }
       if(center.suppliers[$scope.supplierCode.retailStore] != undefined){
         center.suppliers_allowed['retailStore_allowed'] = true;
         center.suppliers_allowed['retailStore_show'] = true;
         $scope.unique_suppliers.add($scope.supplierCode.retailStore);
         getSummary($scope.supplierCode.retailStore,center);
       }
       center_id++;
     });
     //Start : code added to display filter panel for all centers on gridview
     if($scope.unique_suppliers.has('RS')){
        $scope.gridView_RS_filters = angular.copy($scope.RS_filters);
        $scope.society_show = true;
        $scope.society_allowed_gridview = true;
      }
     if($scope.unique_suppliers.has('CP')){
        $scope.gridView_CP_filters = angular.copy($scope.CP_filters);
        $scope.corporate_show = true;
        $scope.corporate_allowed_gridview = true;
      }
      if($scope.unique_suppliers.has($scope.supplierCode.busShelter)){
         $scope.busShelter_show = true;
         $scope.busShelter_allowed_gridview = true;
       }
       if($scope.unique_suppliers.has($scope.supplierCode.gym)){
          $scope.gym_show = true;
          $scope.gym_allowed_gridview = true;
        }
        if($scope.unique_suppliers.has($scope.supplierCode.saloon)){
           $scope.saloon_show = true;
           $scope.saloon_allowed_gridview = true;
         }
         if($scope.unique_suppliers.has($scope.supplierCode.retailStore)){
            $scope.retailStore_show = true;
            $scope.retailStore_allowed_gridview = true;
          }
         $scope.unique_suppliersCode = Array.from($scope.unique_suppliers);
         $scope.unique_suppliersCode.push(constants.supplierCode_all);
         $scope.unique_suppliersCode = convertSupplierCodeToName($scope.unique_suppliersCode);
         $scope.supplierListCode = constants.All;

      //End : code added to display filter panel for all centers on gridview
    }catch(error){
      console.log(error.message);
    }
  }
  //start:convert supplier code to supplier name
  var convertSupplierCodeToName = function(supplierCodeList){
    var supplierNamesList = [];
    angular.forEach(supplierCodeList, function(code){
      supplierNamesList.push(constants[code]);
    })
    return supplierNamesList;
  }
  //end:convert supplier code to supplier name
    //End: add filter varible for each supplier in each center
      //Start: reset all filters
    // $scope.clearAllFilters = function(){
    //     // addSupplierFilters($scope.center_data);
    //     var defer = $q.defer();
    //     console.log($scope.center_data);
    //     for(var i=0;i<$scope.center_data.length;i++){
    //       $scope.center_data[i].RS_filters = angular.copy($scope.RS_filters);
    //       $scope.center_data[i].CP_filters =  angular.copy($scope.CP_filters);
    //     }
    //     var func = function(){$scope.societyFilters();}
    //     setTimeout(func, 1000);
    //     $scope.corporateFilters();
    // }
      //End: reset all filters
// This service gets all the spaces according to center specification like society_allowed
          //Start: adding code to call shortlisted_spaces api if the proposal data is already saved
          $scope.proposal_id_temp = $stateParams.proposal_id;
          $scope.getInitialSpaces = function(){
            mapViewService.getSpaces($scope.proposal_id_temp)
              .then(function onSuccess(response, status){
                try{
                  console.log(response);
                  $scope.loading = response.data.data;
                  $scope.business_name = response.data.business_name;
                  createInitialFilterData();
                    // $scope.business_name = response.data.business_name;
                    $scope.center_data = response.data.data.suppliers;

                    $scope.current_center = response.data.data.suppliers[0];
                    $scope.current_center_index = 0;
                    $scope.current_center_id = $scope.current_center.center.id;
                    $scope.old_data = angular.copy($scope.center_data);

                    //loading icon
                    $scope.loadIcon2 = response.data;
                    //Start: code added if proposal is already created or exported, and user wants to edit that proposal
                    var flag;
                    // for(var i=0;i<$scope.center_data.length;i++){
                    //   if($scope.center_data[i].suppliers_meta != null){
                    //     flag = true;
                    //   }
                    // }
                    // if(flag == true){
                    //   checkSavedFilters();
                    // }
                    //End: code added if proposal is already created or exported and user wants to edit that proposal
                    $scope.addSupplierFilters($scope.center_data);

                    mapViewBasicSummary();
                    suppliersData();
                    gridViewBasicSummary();
                    if($scope.unique_suppliers.has($scope.supplierCode.society))
                      getComprehinsiveSummary($scope.supplierCode.society);
                    if($scope.unique_suppliers.has($scope.supplierCode.corporate))
                      getComprehinsiveSummary($scope.supplierCode.corporate);
                    if($scope.unique_suppliers.has($scope.supplierCode.busShelter))
                      getComprehinsiveSummary($scope.supplierCode.busShelter);
                    // gridView_Summary();
                    for(var i=0;i<$scope.center_data.length; i++){
                      $scope.initial_center_changed.push(false);
                    }
                    $scope.current_center_id = $scope.current_center.center.id
                    $scope.map = { zoom: 13, bounds: {},
                      center: {
                        latitude: $scope.current_center.center.latitude,
                        longitude: $scope.current_center.center.longitude,
                     }
                    };
                    $scope.circle = {
                        id : 1,
                        center : {
                            latitude : $scope.current_center.center.latitude,
                            longitude : $scope.current_center.center.longitude,
                        },
                        radius : $scope.current_center.center.radius * 1000,
                        stroke : {
                            color : '#08B21F',
                            weight : 2,
                            opacity : 1,
                        },
                        fill : {
                            color : '#87cefa',
                            opacity : 0.5,
                        },
                        clickable : false,
                        control : {},
                    };
                    // initial center is to allow user to reset the latitude and longitude to the saved address of the center in the database
                    $scope.society_markers = assignMarkersToMap($scope.current_center.suppliers);
                    $scope.center_marker = assignCenterMarkerToMap($scope.current_center.center);
                  }
                  catch(error){
                    console.log(error.message);
                  }
                })
              .catch(function onError(response, status){
                commonDataShare.showErrorMessage(response);
                // swal(constants.name,constants.errorMsg,constants.error);
                if(status == -1)
                  console.log(constants.server_connection_error);
                $scope.get_spaces_error = response.message;
                console.log("Error response : ",response);
              });
          }
          if($window.localStorage.isSavedProposal == 'true'){
            mapViewService.getShortlistedSuppliers($scope.proposal_id_temp)
              .then(function onSuccess(response, status){
                try{
                  console.log(response);
                  createInitialFilterData();
                  //TO convert dict to array as response coming in dict form and very difficult to use
                  $scope.center_data = $.map(response.data.data, function(value, index){
                    return [value];
                  });
                  $scope.current_center = $scope.center_data[0];
                  $scope.current_center_index = 0;
                  $scope.old_data = angular.copy($scope.center_data);
                  $scope.addSupplierFilters($scope.center_data);
                  var flag;
                  $scope.current_center_id = $scope.current_center.center.id;

                  for(var i=0;i<$scope.center_data.length;i++){
                    if($scope.center_data[i].suppliers_meta != null){
                      flag = true;
                    }
                  }
                  if(flag == true){
                    checkSavedFilters();
                  }

                  // toggleInventoryFilters($scope.current_center,'true','RS');
                  mapViewBasicSummary();
                  suppliersData();
                  gridViewBasicSummary();
                  gridViewFilterSummary();
                  getComprehinsiveSummary($scope.supplierCode.society);

                  for(var i=0;i<$scope.center_data.length; i++)
                    $scope.initial_center_changed.push(false);
                  $scope.current_center_id = $scope.current_center.center.id
                  $scope.map = { zoom: 13, bounds: {},
                    center: {
                      latitude: $scope.current_center.center.latitude,
                      longitude: $scope.current_center.center.longitude,
                   }
                  };
                  $scope.circle = {
                      id : 1,
                      center : {
                          latitude : $scope.current_center.center.latitude,
                          longitude : $scope.current_center.center.longitude,
                      },
                      radius : $scope.current_center.center.radius * 1000,
                      stroke : {
                          color : '#08B21F',
                          weight : 2,
                          opacity : 1,
                      },
                      fill : {
                          color : '#87cefa',
                          opacity : 0.5,
                      },
                      clickable : false,
                      control : {},
                  };
                    $scope.society_markers = assignMarkersToMap($scope.current_center.suppliers);
                    $scope.center_marker = assignCenterMarkerToMap($scope.current_center.center);
                  //loading icon
                  $scope.loadIcon1 = response.data;
                }
              catch(error){
                console.log(error.message);
              }
            })
              .catch(function onError(response, status){
                commonDataShare.showErrorMessage(response);
                // swal(constants.name,constants.errorMsg,constants.error);
                if(status == -1)
                  console.log(error.message);
              });
          }
          //Start: adding code to call shortlisted_spaces api if the proposal data is already saved
          else{
            $scope.getInitialSpaces();
          }
        });

          $scope.windowCoords = {}; // at windowCoords the window will show up
          $scope.space = {}
          //onClick function is called when a marker is clicked
          $scope.onClick = function(marker, eventName, model) {
            $scope.space = {};
              if(model.id == 0){
                $scope.space = {
                    name : "Center Chosen By You",
                    address1 : "Center Address",
                    location_type : "Posh",
                  }
              }else{
                    $scope.space = model.title
              }
              $scope.windowCoords.latitude = model.latitude;
              $scope.windowCoords.longitude = model.longitude;
              $scope.show = true;
            };
            $scope.closeClick = function() {
                $scope.show = false;
            };
            // different society filters

// Start: supplier filters select deselecting functionality
    $scope.checkSuppliers = function(code){
      if(code == 'RS'){
        if($scope.society_allowed_gridview == true)
          $scope.society_allowed_gridview = false;
        else
          $scope.society_allowed_gridview = true;
        }
        if(code == 'CP'){
          if($scope.corporate_allowed_gridview == true)
            $scope.corporate_allowed_gridview = false;
          else
            $scope.corporate_allowed_gridview = true;
          }
    }
    // Start : check saved filter
    var checkSavedFilters = function (){
      try{
        if($scope.current_center.suppliers_meta['RS'] != null){
          var filter_types = Object.keys($scope.current_center.suppliers_meta['RS']);
          for(var j=0;j<filter_types.length;j++){
            if(filter_types[j]=='inventory_type_selected'){
              selectFilters($scope.current_center.suppliers_meta['RS'][filter_types[j]],$scope.current_center.RS_filters['inventory']);
            }else
              selectFilters($scope.current_center.suppliers_meta['RS'][filter_types[j]],$scope.current_center.RS_filters[filter_types[j]]);
          }
        }
        if($scope.current_center.suppliers['RS'] != null){
            $scope.societyFilters();
            toggleInventoryFilters($scope.current_center,'true','RS');
          }
        if($scope.current_center.suppliers_meta['CP'] != null){
          var filter_types = Object.keys($scope.current_center.suppliers_meta['CP']);
          for(var j=0;j<filter_types.length;j++){
            if(filter_types[j]=='inventory_type_selected'){
              selectFilters($scope.current_center.suppliers_meta['CP'][filter_types[j]],$scope.current_center.CP_filters['inventory']);
            }else
              selectFilters($scope.current_center.suppliers_meta['CP'][filter_types[j]],$scope.current_center.CP_filters[filter_types[j]]);
          }
        }
        if($scope.current_center.suppliers_meta['CP'] != null || $scope.current_center.suppliers['CP'] != null){
          $scope.corporateFilters();
        }
        if($scope.current_center.suppliers[$scope.supplierCode.busShelter] != null){
          $scope.busShelterFilters();
        }
      }catch(error){
        console.log(error.message);
      }
    }
    var selectFilters = function(saved_filter_type,current_filter_type){
      try{
        for(var i=0;i<saved_filter_type.length;i++){
          for(var j=0;j<current_filter_type.length;j++){
            if(saved_filter_type[i]==current_filter_type[j].code)
              current_filter_type[j].selected=true;
          }
        }
      }catch(error){
        console.log(error.message);
      }
    }
    // End : check saved filter
    $scope.spaceSupplier = function(code,supplier){
    // this function handles selecting/deselecting society space i.e. society_allowed = true/false
    // code changed after changes done for adding two centers on gridView
        if(code == 'RS'){
          if(supplier == false){
            supplier = true;
            delete $scope.current_center.suppliers['RS'];
          }
          else{
            supplier = false;
            $scope.societyFilters();
          }
        }
        if(code == 'CP'){
          if(supplier == false){
            supplier = true;
            delete $scope.current_center.suppliers['CP'];
          }
          else{
            supplier = false;
            $scope.corporateFilters();
          }
        }
        $scope.society_markers = assignMarkersToMap($scope.current_center.suppliers);
      }
     // This function is for showing societies on the map view
       $scope.showSocieties = function(){
              $scope.show_societies = !$scope.show_societies
       }
      var toggleInventoryFilters = function(current_center,value,code){
       try{
        if(value){
          $scope.inventoryHeaders = angular.copy($scope.inventory_headers);
          for(var center = 0; center < $scope.center_data.length; center++){
            $scope.center_data[center].filters_meta[code] = angular.copy($scope.inventory_filters);
              for(var i=0;i<$scope.center_data[center].RS_filters.inventory.length;i++){
                if($scope.center_data[center].RS_filters.inventory[i].code.indexOf('PO') > -1 && $scope.center_data[center].RS_filters.inventory[i].selected == true){
                  $scope.center_data[center].filters_meta[code].inv_poster++;
                  $scope.inventoryHeaders.poster = true;
                }
                if($scope.center_data[center].RS_filters.inventory[i].code.indexOf('ST') > -1 && $scope.center_data[center].RS_filters.inventory[i].selected == true){
                  $scope.center_data[center].filters_meta[code].inv_standee++;
                  $scope.inventoryHeaders.standee = true;
                }
                if($scope.center_data[center].RS_filters.inventory[i].code.indexOf('SL') > -1 && $scope.center_data[center].RS_filters.inventory[i].selected == true){
                  $scope.center_data[center].filters_meta[code].inv_stall++;
                  $scope.inventoryHeaders.stall = true;
                }
                if($scope.center_data[center].RS_filters.inventory[i].code.indexOf('FL') > -1 && $scope.center_data[center].RS_filters.inventory[i].selected == true){
                  $scope.center_data[center].filters_meta[code].inv_flier++;
                  $scope.inventoryHeaders.flier = true;
                }
              }
            }
      }
    }catch(error){
      console.log(error.message);
    }
  }
    var reset = function(filter_array){
      var length = filter_array.length;
      for(var i=0;i<length;i++){
        if(filter_array[i].selected == true){
           filter_array[i].selected = false;
           $scope.societyFilter(filter_array[i]);
         }
          filter_array[i].selected = false;
        }
      }

  //start: set of inventory codes, which helpes to store unique inventories
  var setInventoryTypeCodes = function(supplier_code){
    $scope.current_center.inventory_meta[supplier_code] = new Set();
    angular.forEach($scope.current_center[supplierFilters[supplier_code]].inventory, function(filter){
      if(filter.selected == true){
        var invCodes = filter.code.match(/.{1,2}/g);
        for(var i=0; i< invCodes.length; i++){
          $scope.current_center.inventory_meta[supplier_code].add(invCodes[i]);
        }
      }
    });
  }
  //End: set of inventory codes, which helpes to store unique inventories

  //Start:code for society filters
  $scope.societyFilters = function(value){
    //Start : Code added to filter multiple centers on gridview
   try{
    promises = [];
    var defer = $q.defer();
  //   if($scope.show_societies){
  //     for(var i=0;i<$scope.center_data.length;i++){
  //       if($scope.center_data[i].suppliers['RS'] != null){
  //         $scope.center_data[i].RS_filters = angular.copy($scope.gridView_RS_filters);
  //         toggleInventoryFilters($scope.center_data[i],value,'RS');
  //       }
  //     }
  //     for(var i=0;i<$scope.center_data.length;i++){
  //       if($scope.center_data[i].suppliers['RS'] != null){
  //         var filters = {
  //           'supplier_type_code' : 'RS',
  //           proposal_id : $scope.proposal_id_temp,
  //           center_id : $scope.center_data[i].center.id,
  //           common_filters : {
  //           latitude : $scope.center_data[i].center.latitude,
  //           longitude : $scope.center_data[i].center.longitude,
  //           radius : $scope.center_data[i].center.radius,
  //           quality : [],
  //           locality : [],
  //           quantity : [],
  //         },
  //         inventory_filters : [],
  //         priority_index_filters : {
  //           flat_type : [],
  //         },
  //         amenities:[],
  //       };
  //       if($scope.flat_avg_rental_persqft_flag == true){
  //         filters.priority_index_filters['flat_avg_rental_persqft'] = $scope.center_data[i].RS_filters.flat_avg_rental_persqft;
  //       }
  //       if($scope.flat_sale_cost_persqft_flag == true){
  //         filters.priority_index_filters['flat_sale_cost_persqft'] = $scope.center_data[i].RS_filters.flat_sale_cost_persqft;
  //       }
  //       if($scope.center_data[i].RS_filters.flat_avg_rental_persqft.max == 0){
  //         delete filters.priority_index_filters['flat_avg_rental_persqft'];
  //       }
  //       if($scope.center_data[i].RS_filters.flat_sale_cost_persqft.max == 0){
  //         delete filters.priority_index_filters['flat_sale_cost_persqft'];
  //       }
  //       makeFilters($scope.center_data[i].RS_filters.inventory,filters.inventory_filters);
  //       makeFilters($scope.center_data[i].RS_filters.flat_type,filters.priority_index_filters.flat_type);
  //       makeFilters($scope.center_data[i].RS_filters.quality_type,filters.common_filters.quality);
  //       makeFilters($scope.center_data[i].RS_filters.locality_rating,filters.common_filters.locality);
  //       makeFilters($scope.center_data[i].RS_filters.quantity_type,filters.common_filters.quantity);
  //       makeFilters($scope.center_data[i].RS_filters.amenities,filters.amenities);
  //       $scope.checkFilters = true;
  //       promises.push(mapViewService.getFilterSuppliers(filters));
  //
  //     }
  //   }
  //   var data = [];
  //   $q.all(promises).then(function(response){
  //     data = angular.copy(promises);
  //     handleSupplierPromise(data,"RS");
  //     $scope.checkFilters = false;
  //   },function (error) {
  //   //This will be called if $q.all finds any of the requests erroring.
  //     handleErrors();
  //     $scope.checkFilters = false;
  // });
  // }
    //End : Code added to filter multiple centers on gridview
  // else{
    // $scope.gridView_RS_filters = angular.copy($scope.current_center.RS_filters);
    toggleInventoryFilters($scope.current_center,value,'RS');
    setInventoryTypeCodes($scope.supplierCode.society);
      var filters = {
        'supplier_type_code' : 'RS',
        proposal_id : $scope.proposal_id_temp,
        center_id : $scope.current_center.center.id,
          common_filters : {
          latitude : $scope.current_center.center.latitude,
          longitude : $scope.current_center.center.longitude,
          radius : $scope.current_center.center.radius,
          quality : [],
          locality : [],
          quantity : [],
        },
        inventory_filters : [],
        priority_index_filters : {
          flat_type : {},
          amenities : [],
        },
      };
      if($scope.current_center.RS_filters.flat_avg_rental_persqft.max != $scope.current_center.RS_filters.flat_avg_rental_persqft.options.floor){
        filters.priority_index_filters['flat_avg_rental_persqft'] = $scope.current_center.RS_filters.flat_avg_rental_persqft;
      }
      if($scope.current_center.RS_filters.flat_sale_cost_persqft.max != $scope.current_center.RS_filters.flat_sale_cost_persqft.options.floor){
        filters.priority_index_filters['flat_sale_cost_persqft'] = $scope.current_center.RS_filters.flat_sale_cost_persqft;
      }
      if($scope.current_center.RS_filters.ratio_of_tenants_to_flats.max != $scope.current_center.RS_filters.ratio_of_tenants_to_flats.options.floor){
        filters.priority_index_filters['ratio_of_tenants_to_flats'] = {};
        filters.priority_index_filters['ratio_of_tenants_to_flats']['min'] = $scope.current_center.RS_filters.ratio_of_tenants_to_flats.min/100;
        filters.priority_index_filters['ratio_of_tenants_to_flats']['max'] = $scope.current_center.RS_filters.ratio_of_tenants_to_flats.max/100;
      }
      if($scope.current_center.RS_filters.possession_year.max != $scope.current_center.RS_filters.possession_year.options.floor){
        filters.priority_index_filters['possession_year'] = $scope.current_center.RS_filters.possession_year;
      }
      if($scope.is_standalone_society.selected == true){
        filters.priority_index_filters['is_standalone_society'] = true;
      }
      makeFilters($scope.current_center.RS_filters.inventory,filters.inventory_filters);
      // makeFilters($scope.current_center.RS_filters.flat_type,filters.priority_index_filters.flat_type);
      makeFilters($scope.current_center.RS_filters.quality_type,filters.common_filters.quality);
      makeFilters($scope.current_center.RS_filters.locality_rating,filters.common_filters.locality);
      makeFilters($scope.current_center.RS_filters.quantity_type,filters.common_filters.quantity);
      makeFilters($scope.current_center.RS_filters.amenities,filters.priority_index_filters.amenities);
      makeFlatTypeFilters($scope.current_center.RS_filters.flat_type,filters.priority_index_filters.flat_type);
      filterSupplierData(filters.supplier_type_code,filters);
      // }
    }catch(error){
      console.log(error.message);
    }
  }
  //End: code for society filters
  //Start: code for corporate filters
      $scope.real_estate_allowed = false;

      $scope.corporateFilters = function(value){
       try{
        //Start : Code added to filter multiple centers on gridview
        $scope.real_estate_allowed = value;
        promises = [];
        var defer = $q.defer();
        // if($scope.show_societies){
      //     for(var i=0;i<$scope.center_data.length;i++){
      //       if($scope.center_data[i].suppliers['CP'] != null)
      //         $scope.center_data[i].CP_filters = angular.copy($scope.gridView_CP_filters);
      //     }
      //     for(var i=0;i<$scope.center_data.length;i++){
      //       if($scope.center_data[i].suppliers['CP'] != null){
      //         var filters = {
      //           'supplier_type_code' : 'CP',
      //           proposal_id : $scope.proposal_id_temp,
      //           center_id : $scope.center_data[i].center.id,
      //           common_filters : {
      //           latitude : $scope.center_data[i].center.latitude,
      //           longitude : $scope.center_data[i].center.longitude,
      //           radius : $scope.center_data[i].center.radius,
      //           quality : [],
      //           locality : [],
      //           quantity : [],
      //         },
      //         inventory_filters : [],
      //         priority_index_filters : {
      //           // real_estate_allowed : $scope.real_estate_allowed,
      //           employees_count : [],
      //         },
      //       };
      //       makeFilters($scope.center_data[i].CP_filters.inventory,filters.inventory_filters);
      //       makeFilters($scope.center_data[i].CP_filters.employee_count,filters.priority_index_filters.employees_count);
      //       makeFilters($scope.center_data[i].CP_filters.quality_type,filters.common_filters.quality);
      //       makeFilters($scope.center_data[i].CP_filters.locality_rating,filters.common_filters.locality);
      //       makeFilters($scope.center_data[i].CP_filters.quantity_type,filters.common_filters.quantity);
      //       if($scope.real_estate_allowed == true)
      //         filters.priority_index_filters.real_estate_allowed = true;
      //       $scope.checkFilters = true;
      //       promises.push(mapViewService.getFilterSuppliers(filters));
      //
      //     }
      //   }
      //   var data = [];
      //   $q.all(promises).then(function(response){
      //     data = angular.copy(promises);
      //     handleSupplierPromise(data,"CP");
      //     $scope.checkFilters = false;
      //   },function (error) {
      //   //This will be called if $q.all finds any of the requests erroring.
      //     handleErrors();
      //     $scope.checkFilters = false;
      // });
      // }
        //End : Code added to filter multiple centers on gridview
    // else{
      // $scope.gridView_CP_filters = angular.copy($scope.current_center.CP_filters);
        var filters = {
          'supplier_type_code' : 'CP',
          proposal_id : $scope.proposal_id_temp,
          center_id : $scope.current_center.center.id,
            common_filters : {
            latitude : $scope.current_center.center.latitude,
            longitude : $scope.current_center.center.longitude,
            radius : $scope.current_center.center.radius,
            quality : [],
            locality : [],
            quantity : [],
          },
          inventory_filters : [],
          priority_index_filters : {
            // real_estate_allowed : $scope.real_estate_allowed,
            employees_count : [],
          },
        };
        makeFilters($scope.current_center.CP_filters.inventory,filters.inventory_filters);
        makeFilters($scope.current_center.CP_filters.employee_count,filters.priority_index_filters.employees_count);
        makeFilters($scope.current_center.CP_filters.quality_type,filters.common_filters.quality);
        makeFilters($scope.current_center.CP_filters.locality_rating,filters.common_filters.locality);
        makeFilters($scope.current_center.CP_filters.quantity_type,filters.common_filters.quantity);
        if($scope.real_estate_allowed == true)
          filters.priority_index_filters.real_estate_allowed = true;
        filterSupplierData(filters.supplier_type_code,filters);
      // }
    }catch(error){
      console.log(error.message);
    }
  }

  //start - busshelter filter call
  $scope.busShelterFilters = function(value){
    //Start : Code added to filter multiple centers on gridview
   try{
      var filters = {
        supplier_type_code : $scope.supplierCode.busShelter,
        proposal_id : $scope.proposal_id_temp,
        center_id : $scope.current_center.center.id,
        common_filters : {
          latitude : $scope.current_center.center.latitude,
          longitude : $scope.current_center.center.longitude,
          radius : $scope.current_center.center.radius,
        },
      };
      filterSupplierData(filters.supplier_type_code,filters);
      // }
    }catch(error){
      console.log(error.message);
    }
  }
  //end - busshelter filter call
  //start - gym filter call
  $scope.gymFilters = function(value){
    //Start : Code added to filter multiple centers on gridview
   try{
      var filters = {
        supplier_type_code : $scope.supplierCode.gym,
        proposal_id : $scope.proposal_id_temp,
        center_id : $scope.current_center.center.id,
        common_filters : {
          latitude : $scope.current_center.center.latitude,
          longitude : $scope.current_center.center.longitude,
          radius : $scope.current_center.center.radius,
        },
      };
      filterSupplierData(filters.supplier_type_code,filters);
      // }
    }catch(error){
      console.log(error.message);
    }
  }
  //end - gym filter call
  //start - saloon filter call
  $scope.saloonFilters = function(value){
    //Start : Code added to filter multiple centers on gridview
   try{
      var filters = {
        supplier_type_code : $scope.supplierCode.saloon,
        proposal_id : $scope.proposal_id_temp,
        center_id : $scope.current_center.center.id,
        common_filters : {
          latitude : $scope.current_center.center.latitude,
          longitude : $scope.current_center.center.longitude,
          radius : $scope.current_center.center.radius,
        },
      };
      filterSupplierData(filters.supplier_type_code,filters);
      // }
    }catch(error){
      console.log(error.message);
    }
  }
  //end - saloon filter call
  //start - retailStore filter call
  $scope.retailStoreFilters = function(value){
    //Start : Code added to filter multiple centers on gridview
   try{
      var filters = {
        supplier_type_code : $scope.supplierCode.retailStore,
        proposal_id : $scope.proposal_id_temp,
        center_id : $scope.current_center.center.id,
        common_filters : {
          latitude : $scope.current_center.center.latitude,
          longitude : $scope.current_center.center.longitude,
          radius : $scope.current_center.center.radius,
        },
      };
      filterSupplierData(filters.supplier_type_code,filters);
      // }
    }catch(error){
      console.log(error.message);
    }
  }
  //end - retailStore filter call

//Start: for handling multiplse center response in promises for all suppliers
      var handleSupplierPromise = function(responseData,code){
        try{
          for(var index=0;index<$scope.supplier_centers_list[code].length;index++){
            $scope.center_data[$scope.supplier_centers_list[code][index]].suppliers[code] = responseData[index].$$state.value.data.data.suppliers[code];
            if($scope.center_data[$scope.supplier_centers_list[code][index]].suppliers_meta){
              $scope.center_data[$scope.supplier_centers_list[code][index]].suppliers_meta[code] = responseData[index].$$state.value.data.data.suppliers_meta[code];
            }else {
              $scope.center_data[$scope.supplier_centers_list[code][index]].suppliers_meta = responseData[index].$$state.value.data.data.suppliers_meta;
            }
            //$scope.center_data[$scope.supplier_centers_list[code][index]].suppliers[code].push.apply($scope.center_data[$scope.supplier_centers_list[code][index]].suppliers[code],$scope.extraSuppliersData[index][code]);
          }
        $scope.current_center = $scope.center_data[$scope.current_center_index];
        suppliersData();
        mapViewBasicSummary();
        mapViewFiltersSummary();
        mapViewImpressions();
        gridViewBasicSummary();
        gridViewFilterSummary();
        gridViewImpressions();
        $scope.society_markers = assignMarkersToMap($scope.current_center.suppliers);
        $scope.center_marker = assignCenterMarkerToMap($scope.current_center.center);
      }catch(error){
        console.log(error.message);
      }
    }
//End: for handling multiplse center response in promises for all suppliers
//Start: function for adding filters code to provided filter type list
      var makeFilters = function(filter_array,filter_list){
        try{
          for(var i=0; i<filter_array.length; i++){
            if(filter_array[i].selected == true)
              filter_list.push(filter_array[i].code);
          }
        }catch(error){
          console.log(error.message);
        }
      }
//End: function for adding filters code to provided filter type list
//Start: for flat type filters
 var makeFlatTypeFilters = function(filter_array,filter_list){
   try{
     for(var i=0;i<filter_array.length; i++){
       if(filter_array[i].selected == true){
         filter_list[filter_array[i].code] = angular.copy(filter_array[i]);
         if(filter_array[i].flat_count.max != filter_array[i].flat_count.options.floor){
            filter_list[filter_array[i].code]['count'] = angular.copy(filter_array[i].flat_count);
          }
         if(filter_array[i].flat_size.max != filter_array[i].flat_size.options.floor){
            filter_list[filter_array[i].code]['size'] = filter_array[i].flat_size;
          }
       }
     }
   }catch(error){
   }
 }
//End: for flat type filters
//start: generic function for fetching all supplier filters
        var filterSupplierData = function (code,supplier_filters){
         try{
          $scope.checkFilters = true;
          mapViewService.getFilterSuppliers(supplier_filters)
                .then(function onSuccess(response, status){
                console.log(response);
                    response.data.data.center = $scope.current_center.center;
                    // if(response.data.data.suppliers[code].length > 0)
                      $scope.center_data[$scope.current_center_index].suppliers[code] = response.data.data.suppliers[code];
                    if($scope.center_data[$scope.current_center_index].suppliers_meta){
                      $scope.center_data[$scope.current_center_index].suppliers_meta[code] = response.data.data.suppliers_meta[code];
                    }else {
                      $scope.center_data[$scope.current_center_index].suppliers_meta = response.data.data.suppliers_meta;
                    }
                    $scope.center_data[$scope.current_center_index].suppliers[code].push.apply($scope.center_data[$scope.current_center_index].suppliers[code],$scope.extraSuppliersData[$scope.current_center_index][code]);
                    $scope.current_center = $scope.center_data[$scope.current_center_index];

                    suppliersData();
                    mapViewBasicSummary();
                    mapViewFiltersSummary();
                    mapViewImpressions();
                    gridViewBasicSummary();
                    gridViewFilterSummary();
                    gridViewImpressions();
                    getSummary(code,$scope.current_center);
                    getComprehinsiveSummary('RS');
                    $scope.society_markers = assignMarkersToMap($scope.current_center.suppliers);
                    $scope.center_marker = assignCenterMarkerToMap($scope.current_center.center);
                    $scope.checkFilters = false;
                })
                .catch(function onError(response, status){
                  commonDataShare.showErrorMessage(response);
                  // swal(constants.name,constants.errorMsg,constants.error);
                    console.log("Error Happened while filtering");
                    $scope.checkFilters = false;
                });
              }catch(error){
                console.log(error.message);
              }
        }
  //End: generic function for fetching all supplier filters
      var promises = [];
      //       $scope.getFilteredSocieties = function(){
      //       promises = [];
      //       var defer = $q.defer();
      //       // start: for mapview only
      //       if(!$scope.show_societies){
      //       // for(var i=0; i<$scope.centers1.length; i++){
      //         var lat = "?lat=" + $scope.current_center.center.latitude ;
      //         var lng = "&lng=" + $scope.current_center.center.longitude;
      //         var radius = "&r=" + $scope.current_center.center.radius;
      //         var get_url_string = lat + lng + radius;
      //         get_url_string += makeString($scope.space_inventory_type, "&inv=");
      //         get_url_string += makeString($scope.space_location, "&loc=");
      //         get_url_string += makeString($scope.space_quality_type, "&qlt=");
      //         get_url_string += makeString($scope.space_quantity_type, "&qnt=");
      //         get_url_string += makeString($scope.society_flat_type, "&flt=");
      //
      //         // promises.push(mapViewService.getFilterSocieties(get_url_string));
      //     // } //end of for loop
      //
      //     // promises handled
      //
      //     mapViewService.getFilterSocieties(get_url_string)
      //           .success(function(response, status){
      //             //console.log(response);
      //             response.data.center = $scope.current_center.center;
      //               $scope.current_center = response.data;
      //               $scope.center_data[$scope.current_center_index] = response.data;
      //               //console.log($scope.center_data);
      //               // $scope.current_center.societies_inventory_count = response.societies_inventory_count;
      //               // $scope.current_center.societies_count = response.societies_count;
      //               // console.log("\n\n$scope.centers : ", $scope.centers);
      //               $scope.society_markers = assignMarkersToMap($scope.current_center.suppliers);
      //               mapViewBasicSummary();
      //               mapViewFiltersSummary();
      //               mapViewImpressions();
      //               suppliersData();
      //               gridViewBasicSummary();
      //               gridViewFilterSummary();
      //               gridViewImpressions();
      //           })
      //           .error(function(response, status){
      //               console.log("Error Happened while filtering");
      //           });// end of q
      //         }
      //     // End: for mapview only
      //     //start: for gridview filters
      //     else{
      //       for(var i=0; i<$scope.center_data.length; i++){
      //         var lat = "?lat=" + $scope.center_data[i].center.latitude;
      //         var lng = "&lng=" + $scope.center_data[i].center.longitude;
      //         var radius = "&r=" + $scope.center_data[i].center.radius;
      //         var get_url_string = lat + lng + radius;
      //         get_url_string += makeString($scope.space_inventory_type, "&inv=");
      //         get_url_string += makeString($scope.space_location, "&loc=");
      //         get_url_string += makeString($scope.space_quality_type, "&qlt=");
      //         get_url_string += makeString($scope.space_quantity_type, "&qnt=");
      //         get_url_string += makeString($scope.society_flat_type, "&flt=");
      //
      //         promises.push(mapViewService.getFilterSocieties(get_url_string));
      //       } //end of for loop
      //
      //         // promises handled
      //       $q.all(promises).then(function(response){
      //         var length = $scope.center_data.length;
      //         for(var i=0; i<length; i++){
      //           response[i].data.data.center = $scope.center_data[i].center;
      //           $scope.center_data[i] = response[i].data.data;
      //
      //         } //end of for loop
      //         $scope.current_center = $scope.center_data[$scope.current_center_index];
      //         $scope.society_markers = assignMarkersToMap($scope.current_center.suppliers);
      //         mapViewBasicSummary();
      //         mapViewFiltersSummary();
      //         mapViewImpressions();
      //         suppliersData();
      //         gridViewBasicSummary();
      //         gridViewFilterSummary();
      //         gridViewImpressions();
      //       }) // end of q
      //     }
      //     //End: for gridview filters
      // }

      //End: angular-google-maps is loaded properly only then proces code inside then
    // var makeString = function(filter_array, filter_keyword){
    //           var my_string = filter_keyword;
    //           var length = filter_array.length;
    //           var count = 0;
    //           for(var i=0;i<length;i++)
    //               if(filter_array[i].selected){
    //                   my_string += filter_array[i].code + " ";
    //                   count += 1;
    //               }
    //           // Uncomment for better performance but this will also include null values for that filter
    //           // What this does is basically dont apply the filter if all values are selected
    //           if(count==length)
    //               my_string = filter_keyword;
    //           return my_string;
    //     }

  //Start: code added to search & show all suppliers on add societies tab
  $scope.supplier_names = [
    { name: 'Residential',      code:'RS'},
    { name: 'Corporate Parks',  code:'CP'},
    { name: 'Bus Shelter',  code:'BS'},
    { name: 'Gym',  code:'GY'},
    { name: 'Saloon',  code:'SA'},
    { name: 'Retail Store',  code:'RE'},
    ];
  $scope.search;
  $scope.search_status = false;
  $scope.supplier_type_code;
  $scope.center_index = null;
  $scope.searchSuppliers = function(){
   try{
    $scope.search_status = false;
    if($scope.supplier_type_code && $scope.search){
      mapViewService.searchSuppliers($scope.supplier_type_code,$scope.search)
        .then(function onSuccess(response, status){
            $scope.center_index = null;
          $scope.supplierData = response.data.data;
          if($scope.supplierData.length > 0){
            $scope.search_status = true;
            $scope.errorMsg = undefined;
          }
          else {
            $scope.errorMsg = "No Results Found, Please enter valid Search Text";
            $scope.search_status = false;
          }
        })
        .catch(function onError(response, status){
            console.log("Error Happened while searching");
            commonDataShare.showErrorMessage(response);
            // swal(constants.name,constants.errorMsg,constants.error);
        });
      }
      else {
        $scope.errorMsg = "Please Fill all the details";
        $scope.supplierData = [];
        $scope.search_status = false;
      }
    }catch(error){
      console.log(error.message);
    }
  }
    //End: code added to search & show all suppliers on add societies tab
    //Start: function to clear searched supplier data whenever add suppliers button clicked
    $scope.clearSearchData = function(){
      try{
        $scope.supplierData = [];
        $scope.search_status = false;
        $scope.supplier_type_code = null;
        $scope.search = null;
        $scope.errorMsg = undefined;
        $scope.center_index = null;

        $scope.createSupplierList();
      }catch(error){
        console.log(error.message);
      }
    }
    //Start: To add searched societies in given center
      $scope.addMoreSuppliers = function(supplier,id){
       try{
        if($scope.center_data[$scope.current_center_index].suppliers[$scope.supplier_type_code] != undefined && $scope.center_index != null && checkDuplicateSupplier(supplier)){
          // supplier.status = 'S';
          // $scope.extraSuppliersData[$scope.current_center_index][$scope.supplier_type_code].push(supplier);
          $scope.center_data[$scope.current_center_index].suppliers[$scope.supplier_type_code].push(supplier);
          $scope.supplierData.splice(id,1);
          // $scope.changeCurrentCenter($scope.center_index);
          var center = $scope.center_data[$scope.current_center_index];
          $scope.updateSupplierStatus(supplier,center,$scope.supplier_type_code);
          mapViewBasicSummary();
          suppliersData();
          gridViewBasicSummary();
          $scope.errorMsg = "Supplier Added Successfully";
          if($scope.supplierData.length <=0){
            $scope.search_status = false;
            $scope.supplier_type_code = null;
            $scope.search = null;
          }
        }
        else if($scope.center_index == null){
          supplier.status = null;
          $scope.errorMsg = "Please select center first to add new suppliers";
        }
        else if($scope.center_index == null){
          $scope.errorMsg = "Selected supplier not allowedadd in this center";
        }
      }catch(error){
        console.log(error.message);
      }
    }
    //End: To add searched societies in given center
    //Start: function to select center at add more suplliers
    $scope.selectCenter = function(center_index){
     try{
      $scope.center_index = center_index;
      if(center_index != null){
        for(var i=0;i<$scope.center_data.length; i++){
          if($scope.center_data[i].center.id == center_index){
              $scope.current_center_index = i;
          }
        }
      }
    }catch(error){
      console.log(error.message);
    }
  }
    //End: function to select center at add more suplliers
//Start: upload and import functionality
//Start: For sending only shortlisted societies & selected inventory types
     function saveSelectedFilters(){
     //Start: For sending filtered inventory type
        try{
         var society_inventory_type_selected = [];
         for(var center = 0; center<$scope.center_data.length; center++){
           if($scope.center_data[center].suppliers_meta){
             if($scope.center_data[center].suppliers_meta['RS']){
               $scope.center_data[center].suppliers_meta['RS'].inventory_type_selected = [];
               $scope.center_data[center].suppliers_meta['RS'].quality_type = [];
               $scope.center_data[center].suppliers_meta['RS'].quantity_type = [];
               $scope.center_data[center].suppliers_meta['RS'].flat_type = [];
               $scope.center_data[center].suppliers_meta['RS'].locality_rating = [];
               makeFilters($scope.center_data[center].RS_filters.inventory,$scope.center_data[center].suppliers_meta['RS'].inventory_type_selected);
               makeFilters($scope.center_data[center].RS_filters.quality_type,$scope.center_data[center].suppliers_meta['RS'].quality_type);
               makeFilters($scope.center_data[center].RS_filters.quantity_type,$scope.center_data[center].suppliers_meta['RS'].quantity_type);
               makeFilters($scope.center_data[center].RS_filters.flat_type,$scope.center_data[center].suppliers_meta['RS'].flat_type);
               makeFilters($scope.center_data[center].RS_filters.locality_rating,$scope.center_data[center].suppliers_meta['RS'].locality_rating);
             }
             if($scope.center_data[center].suppliers_meta['CP']){
               $scope.center_data[center].suppliers_meta['CP'].inventory_type_selected = [];
               $scope.center_data[center].suppliers_meta['CP'].quality_type = [];
               $scope.center_data[center].suppliers_meta['CP'].quantity_type = [];
               $scope.center_data[center].suppliers_meta['CP'].employee_count = [];
               $scope.center_data[center].suppliers_meta['CP'].locality_rating = [];

               makeFilters($scope.center_data[center].CP_filters.inventory,$scope.center_data[center].suppliers_meta['CP'].inventory_type_selected);
               makeFilters($scope.center_data[center].CP_filters.quality_type,$scope.center_data[center].suppliers_meta['CP'].quality_type);
               makeFilters($scope.center_data[center].CP_filters.quantity_type,$scope.center_data[center].suppliers_meta['CP'].quantity_type);
               makeFilters($scope.center_data[center].CP_filters.employee_count,$scope.center_data[center].suppliers_meta['CP'].employee_count);
               makeFilters($scope.center_data[center].CP_filters.locality_rating,$scope.center_data[center].suppliers_meta['CP'].locality_rating);
             }
           }
         }
       }catch(error){
         console.log(error.message);
       }
      }
       //End: For sending filtered inventory type

       //Start: setting status of suppliers like shortlisted, removed or buffer
       $scope.setSupplierStatus = function (supplier,value){
         try{
          if(supplier.buffer_status == false && value == 'B')
              supplier.status = 'F';
          else if(supplier.buffer_status == true && value != 'R')
            supplier.status = 'B';
          else
            supplier.status = value;
          if(value != 'B')
            supplier.shortlisted = !supplier.shortlisted;
        }catch(error){
          console.log(error.message);
        }
      };
       //End: setting status of suppliers like shortlisted, removed or buffer
       $scope.submitProposal = function(){
         saveSelectedFilters();
       };
     $scope.exportData = function(){

       try{
         $scope.hideSpinner = false;
         $scope.requestProposal = false;
         $scope.checkFileExport = true;
         var parent_proposal_id = $window.localStorage.parent_proposal_id;
         if(parent_proposal_id == undefined){
            parent_proposal_id = $stateParams.proposal_id;

         }
          if($window.localStorage.isSavedProposal == undefined){
            $window.localStorage.isSavedProposal = false;
          }
         saveSelectedFilters();
         var proposal_data = {
           centers:$scope.center_data,
          //  is_proposal_version_created:$window.localStorage.isSavedProposal,
           is_proposal_version_created:false,
         };
         console.log("request proposal data",proposal_data);
         console.log("sending proposal version API call");
         mapViewService.proposalVersion($stateParams.proposal_id, proposal_data)
           .then(  function onSuccess(response) {
                  $scope.clientId = response.data.data.logged_in_user_async_id;
                  $scope.bdHeadId = response.data.data.bd_head_async_id;
                  $scope.uploadId = response.data.data.upload_to_amazon_async_id;
                  $scope.proposalFileName = response.data.data.file_name;
                  $scope.isSuperUser = $window.localStorage.is_Superuser;
                  sendEmailToClient();
                  sendEmailToBDHead();
                  uploadToAmazon();
                  $scope.hideSpinner = true;
                  $scope.isRequested = true;
                  $window.localStorage.isReadOnly = 'true';
                  $window.localStorage.isSavedProposal = 'true';
                  swal(constants.name,constants.request_proposal_success,constants.success);
                  $scope.checkFileExport = false;
                  $location.path('/' + $scope.campaign_id + '/manageCampaign/create');

           }).catch(function onError(response){
              console.log("Error occurred in fetching response");
              console.log(response);
              $scope.hideSpinner = true;
              commonDataShare.showErrorMessage(response);
              // swal(constants.name,constants.request_proposal_error,constants.error);
              $scope.checkFileExport = false;
         });
       /*  $http({
              url: constants.base_url + constants.url_base + parent_proposal_id + '/proposal-version/',
              method: 'POST',
              data: proposal_data, //this is your json data string
              headers: {
                  'Content-type': 'application/json',
                  'Authorization' : 'JWT ' + $rootScope.globals.currentUser.token
              }
         }).then(function onSuccess(response){
           $scope.clientId = response.data.data.logged_in_user_async_id;
           $scope.bdHeadId = response.data.data.bd_head_async_id;
           $scope.uploadId = response.data.data.upload_to_amazon_async_id;
           $scope.proposalFileName = response.data.data.file_name;
            $scope.isSuperUser = $window.localStorage.is_Superuser;
            sendEmailToClient();
            sendEmailToBDHead();
            uploadToAmazon();
           $scope.hideSpinner = true;
           swal(constants.name,constants.request_proposal_success,constants.success);
              $scope.checkFileExport = false;
         }).catch(function onError(response){
           $scope.hideSpinner = true;
              swal(constants.name,constants.request_proposal_error,constants.error);
              $scope.checkFileExport = false;
         });*/

       }catch(error){
         $scope.hideSpinner = true;
       }
     }
     var sendEmailToClient = function(){
       mapViewService.sendEmailToClient($scope.clientId)
       .then(function onSuccess(response){
         if(response.data.data.ready != true){
            $timeout(sendEmailToClient,5000); // This will perform async
         }
         else if(response.data.data.status == true){
           $scope.emailToClient = true;
           deleteFile();
         }
       }).catch(function onError(response){
         commonDataShare.showErrorMessage(response);
          // swal(constants.name,constants.client_email_error,constants.error);
       });
     }


     var sendEmailToBDHead = function(){
       mapViewService.sendEmailToBDHead($scope.bdHeadId)
       .then(function onSuccess(response){
         if(response.data.data.ready != true){
            $timeout(sendEmailToBDHead,6000); // This will perform async
         }
         else if(response.data.data.status == true){
           $scope.emailToBDHead = true;
           deleteFile();
         }
       }).catch(function onError(response){
         commonDataShare.showErrorMessage(response);
          // swal(constants.name,constants.bdhead_email_error,constants.error);
       });
     }
     var uploadToAmazon = function(){
       mapViewService.uploadToAmazon($scope.uploadId)
       .then(function onSuccess(response){
         if(response.data.data.ready != true){
            $timeout(uploadToAmazon,7000); // This will perform async
         }
         else if(response.data.data.status == true){
          //  console.log("success");
          $scope.uploadToAmazon = true;
          deleteFile();
         }
       }).catch(function onError(response){
         commonDataShare.showErrorMessage(response);
          // swal(constants.name,constants.upload_error,constants.error);
       });
     }

     var deleteFile = function(){
       if($scope.emailToClient && $scope.emailToBDHead && $scope.uploadToAmazon){
         var data = {
           file_name : $scope.proposalFileName,
         }
         mapViewService.deleteFile(data)
         .then(function onSuccess(response){
           $scope.emailToClient = null;
           $scope.emailToBDHead = null;
           $scope.uploadToAmazon = null;
          //  console.log(response);
         }).catch(function onError(response){
           commonDataShare.showErrorMessage(response);
            // swal(constants.name,constants.deletefile_error,constants.error);
          //  console.log(response);
         });
       }
     }

//Start : function to upload files to amazon server, just provide file name and file
  //  var uploadFileToAmazonServer = function(file_name,file){
  //   try{
  //    Upload.upload({
  //        url: constants.aws_bucket_url,
  //        method : 'POST',
  //        data: {
  //            key: file_name, // the key to store the file on S3, could be file name or customized
  //            AWSAccessKeyId : constants.AWSAccessKeyId,
  //            acl : constants.acl, // sets the access to the uploaded file in the bucket: private, public-read, ...
  //            policy : constants.policy,
  //            signature : constants.signature, // base64-encoded signature based on policy string (see article below)
  //            "Content-Type": constants.content_type,// content type of the file (NotEmpty)
  //            file: file }
  //        }).then(function onSuccess(response){
  //             swal(constants.name,constants.uploadfile_success,constants.success);
  //        }).catch(function onError(response) {
  //          commonDataShare.showErrorMessage(response);
  //             // swal(constants.name,constants.uploadfile_error,constants.error);
  //        });
  //      }catch(error){
  //        $scope.hideSpinner = true;
  //        console.log(error.message);
  //      }
  //  }
//End : function to upload files to amazon server, just provide file name and file
    $scope.upload = function (file) {
      if(file){
       try{
        var uploadUrl = constants.base_url + constants.url_base;
        $scope.hideSpinner = false;
        var token = $rootScope.globals.currentUser.token ;
        Upload.upload({
            url: uploadUrl + $scope.proposal_id_temp + '/import-supplier-data/',
            data: {file: file, 'username': $scope.username},
            headers: {'Authorization': 'JWT ' + token},
        }).then(function onSuccess(response) {
          $scope.hideSpinner = true;
          swal(constants.name,constants.uploadfile_success,constants.success);
          // uploadFileToAmazonServer(response.data.data,file);

        }).catch(function onError(response) {
          $scope.hideSpinner = true;
          commonDataShare.showErrorMessage(response);
            // swal(constants.name,constants.importfile_error,constants.error);
        });
      }catch(error){
        $scope.hideSpinner = true;
        console.log(error.message);
      }
    }
  };
    //End: upload and import functionality
    //Start:save suppliers and filters to save the current state
    $scope.saveData = function(){
     try{
       saveSelectedFilters();
       console.log($scope.center_data);
      $window.localStorage.isSavedProposal = 'true';
      mapViewService.saveData($scope.proposal_id_temp,$scope.center_data)
        .then(function onSuccess(response, status){
          // alert("Saved Successfully");
          swal(constants.name,constants.save_success,constants.success);
        }).catch(function(response, status){
          commonDataShare.showErrorMessage(response);
          // swal(constants.name,constants.save_error,constants.error);
          // alert("Error Occured");
      });//
    }catch(error){
      console.log(error.message);
    }
  }
    //End:save suppliers and filters to save the current state
    // Start: function to update status of supplier and save in db
    $scope.updateSupplierStatus = function(supplier,center,code){
     try{
      var data = {
        'center_id':center.center.id,
        'supplier_id':supplier.supplier_id,
        'status':supplier.status,
        'supplier_type_code':code,
      };
      mapViewService.updateSupplierStatus($scope.proposal_id_temp,data)
        .then(function onSuccess(response, status){
          console.log(response);
          getSummary(code,center);
          getComprehinsiveSummary(code);
        }).catch(function onError(response, status){
          commonDataShare.showErrorMessage(response);
          // swal(constants.name,constants.supplier_status_error,constants.error);
      });
    }catch(error){
      console.log(error.message);
    }
  }
    // End: function to update status of supplier and save in db
    //Start:create dict of supplier_ids
    $scope.createSupplierList = function(){
     try{
      $scope.supplier_id_list = [];

      for(var i=0;i<$scope.center_data.length;i++){
        $scope.supplier_id_list[i] = {};

        var supplier_keys = Object.keys($scope.center_data[i].suppliers);
        angular.forEach(supplier_keys,function(key){
          $scope.supplier_id_list[i][key] = {};
          for(var j=0;j<$scope.center_data[i].suppliers[key].length; j++){
            $scope.supplier_id_list[i][key][$scope.center_data[i].suppliers[key][j].supplier_id] = j;
          }
        });
      }
    }catch(error){
      console.log(error.message);
    }
  }
    //Start: check duplicate suppliers if adding more suppliers
    var checkDuplicateSupplier = function(supplier){
      try{
        if($scope.supplier_id_list[$scope.current_center_index][$scope.supplier_type_code][supplier.supplier_id] !=null){
          // var index = $scope.supplier_id_list[$scope.current_center_index][$scope.supplier_type_code][supplier.supplier_id]
          // var center = $scope.center_data[$scope.current_center_index];
          // $scope.updateSupplierStatus(supplier,center,$scope.supplier_type_code);
          // center.suppliers[$scope.supplier_type_code][index].status = supplier.status;
          // alert("Supplier already Exist and You changed Supplier status");
          supplier.status = null;
          $scope.errorMsg = "Supplier already Exist";
          return false;
        }
        else{
          return true;
        }
      }catch(error){
        console.log(error.message);
      }
    }
  });



    //start : code added for societyDetails
  $scope.getSocietyDetails = function(supplier,supplierId,center,index){
    console.log(supplier);
    // $location.path('/' + supplierId + '/SocietyDetailsPages');
    $scope.temp_index = index;
    $scope.center = center;
    mapViewService.processParam();
    var supplier_id = supplier.supplier_id;
    $scope.society = {};
    $scope.disable = false;
    $scope.residentCount = {};
    $scope.inventoryDetails = {};
    $scope.totalInventoryCount = {};
    $scope.supplier_type_code = "RS";
    mapViewService.getSociety(supplier_id,$scope.supplier_type_code)
     .then(function onSuccess(response) {
       console.log(response);
       $scope.loading = response;
       setSocietyLocationOnMap(response.data.data.supplier_data);
        $scope.loading = response.data.data.supplier_data;
       $scope.myInterval=300;
       $scope.society_images = response.data.data.supplier_images;
       $scope.amenities = response.data.data.amenities;
       $scope.society = supplier;
      //  $scope.society = response.data.supplier_data;
       //$rootScope.societyname = response.society_data.society_name;
       $scope.residentCount = estimatedResidents(response.data.data.supplier_data.flat_count);
       $scope.flatcountflier = response.data.data.supplier_data.flat_count;
       var baseUrl = constants.aws_bucket_url;

       // Start : Code added to seperate images by their image tag names
       var imageUrl;
       $scope.SocietyImages = [],$scope.FlierImages=[],$scope.PosterImages=[],$scope.StandeeImages=[],$scope.StallImages=[],$scope.CarImages=[];
       for(var i=0;i<$scope.society_images.length;i++){
         if($scope.society_images[i].name == 'Society'){
           imageUrl = baseUrl + $scope.society_images[i].image_url;
           $scope.SocietyImages.push(imageUrl);
         }
         if($scope.society_images[i].name == 'Standee Space'){
           imageUrl = baseUrl + $scope.society_images[i].image_url;
           $scope.StandeeImages.push(imageUrl);
         }
         if($scope.society_images[i].name == 'Stall Space'){
           imageUrl = baseUrl + $scope.society_images[i].image_url;
           $scope.StallImages.push(imageUrl);
         }
         if($scope.society_images[i].name == 'Fliers'){
           imageUrl = baseUrl + $scope.society_images[i].image_url;
           $scope.FlierImages.push(imageUrl);
         }
         if($scope.society_images[i].name == 'Car Display'){
           imageUrl = baseUrl + $scope.society_images[i].image_url;
           $scope.CarImages.push(imageUrl);
         }
         if($scope.society_images[i].name == 'Lift' || $scope.society_images[i].name == 'Notice Board'){
           imageUrl = baseUrl + $scope.society_images[i].image_url;
           $scope.PosterImages.push(imageUrl);
         }
     }
     // End : Code added to seperate images by their image tag names
    });

    mapViewService.get_inventory_summary(supplier_id, $scope.supplier_type_code)
    .then(function onSuccess(response){
      console.log(response);
      $scope.societyDetails = true;
      if('inventory' in response.data){
        $scope.inventoryDetails = response.data.inventory;
         $scope.totalInventoryCount = inventoryCount($scope.inventoryDetails);
         $scope.model = response.data.inventory;
         $scope.inventories_allowed = response.data.inventories_allowed_codes;
         $scope.show_inventory = true;
       }
    }).catch(function onError(response){
      console.log("error",response);
      commonDataShare.showErrorMessage(response);
    });
  }//End of function getSocietyDetails

  function estimatedResidents (flatcount){
    var residents = flatcount * 4;
    $scope.residentCount = {
       residents  : residents,
    };
    return $scope.residentCount;
  }
  function inventoryCount (inventoryDetails){
         var totalPoster = inventoryDetails.lift_count + inventoryDetails.nb_count ;
         $scope.totalInventoryCount = {
            totalPoster  : totalPoster,
         };
         return $scope.totalInventoryCount;
  }

 if($rootScope.campaignId){
     mapViewService.getShortlistedSocietyCount($rootScope.campaignId)
     .then(function onSuccess(response,status){
         $scope.societies_count = response.data.count;

     }).catch(function onError(response,status){
         console.log("error ",response.data.error);
         commonDataShare.showErrorMessage(response);
        //  swal(constants.name,constants.errorMsg,constants.error);
     });
 }

 $scope.society_ids = {}
 mapViewService.getSocietyIds()
 .then(function onSuccess(response,status){
     $scope.society_ids = response.data.society_ids;
     $scope.minlength = 0;
     $scope.maxlength = $scope.society_ids.length-1;
     for(var i=0;i<= $scope.maxlength; i++){
         if($rootScope.societyId == $scope.society_ids[i]){
             $scope.index = i;
             break;
         }
     }
 });

     $scope.nextSociety = function(){
     $scope.index = $scope.index + 1;
     if($scope.index <= $scope.maxlength){
         // getsocietyfunc($scope.model[$scope.index].supplier_id)
         var current_path = $location.path()
         var pos = current_path.lastIndexOf("/");
         var required_path = current_path.slice(0,pos+1) + $scope.society_ids[$scope.index] ;
         $location.path(required_path);
         // history.pushState({bar : "foo"}, "page 3", required_path);
         // setCurrentPage(required_path);
     }else{
         $scope.index = $scope.index - 1;
     }
 }

 $scope.previousSociety = function(){
    $scope.index = $scope.index - 1;
     if($scope.index >= $scope.minlength){
         var current_path = $location.path()
         var pos = current_path.lastIndexOf("/");
         var required_path = current_path.slice(0,pos+1) + $scope.society_ids[$scope.index] ;
         $location.path(required_path);
         // history.pushState({bar : "foo"}, "page 3", required_path);
         // setCurrentPage(required_path);
     }
     else{
        $scope.index = $scope.index + 1;
     }
 }

 $scope.societyByIndex = function(index){
     $scope.numberError = false;
     if(index <= $scope.maxlength && index >= $scope.minlength){
         $scope.index = index;
         var current_path = $location.path()
         var pos = current_path.lastIndexOf("/");
         var required_path = current_path.slice(0,pos+1) + $scope.society_ids[$scope.index] ;
         $location.path(required_path);
     }
     else{
         $scope.numberError = true;
          // $scope.startFade = true;
          //  $timeout(function(){
          //    $scope.numberError = true;
          //  }, 2000);
     }
     $scope.societyIndex = undefined;
 }
 $scope.getSecondIndex = function(Images,index)
 {
   if(index-Images.length>=0)
     return null;
   else
     return index;
 }
  $scope.societyList = function() {
    $location.path("manageCampaign/shortlisted/" + $rootScope.campaignId + "/societies");
  };
  //Start:code added for shortlist societies
  $scope.shortlistThis = function(status){
    var code = 'RS';
    $scope.society.status = status;
    $scope.updateSupplierStatus($scope.society,$scope.center,code);
  }
  //End:code added for shortlist societies
  //start: to display inventory tabs based on availibility of inventory in supplier
  $scope.inventory_codes = {
    poster : 'PO',
    standee : 'ST',
    stall : 'SL',
    flier : 'FL',
    cardisplay : 'CD',
  }
  $scope.isAllowed = function(inventory){
    if($scope.inventories_allowed.indexOf(inventory) >= 0)
      return true;
    else
      return false;
  }
  //start: to display inventory tabs based on availibility of inventory in supplier

  //Start:For adding shortlisted society
  // if($rootScope.campaignId){
  //   $scope.shortlistThis = function(id) {
  //   mapViewService.addShortlistedSociety($rootScope.campaignId, id)
  //    .success(function (response){
  //        // $scope.model = response;
  //          // $location.path("manageCampaign/shortlisted/" + $rootScope.campaignId + "/societies");
  //          $scope.disable = true;
  //          $scope.societies_count = response.count;
  //
  //          // var temp = "#alert_placeholder" + index;
  //          var temp = "#alert_placeholder";
  //        var style1 = 'style="position:absolute;z-index:1000;margin-left:-321px;margin-top:-100px;background-color:gold;font-size:18px;"'
  //        $(temp).html('<div ' + style1 + 'class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>'+response.message +'</span></div>')
  //        setTimeout(function() {
  //            $("div.alert").remove();
  //        }, 3000);
  //   });
  // }}//End: For adding shortlisted society
//End: code added for societydetails
$(".modal-fullscreen").on('show.bs.modal', function () {
  setTimeout( function() {
    $(".modal-backdrop").addClass("modal-backdrop-fullscreen");
  }, 0);
});
$(".modal-fullscreen").on('hidden.bs.modal', function () {
  $(".modal-backdrop").addClass("modal-backdrop-fullscreen");
});
//start: map start
var setSocietyLocationOnMap = function(supplier){
  var mapOptions = {
       center:new google.maps.LatLng(0,0),
      //  zoom:13
       mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    var map = new google.maps.Map(document.getElementById("supplierMap"),mapOptions);

    var marker = new google.maps.Marker({
       position: new google.maps.LatLng(supplier.society_latitude, supplier.society_longitude),
       map: map,
       mapTypeId: google.maps.MapTypeId.ROADMAP
    });


    var latlngbounds = new google.maps.LatLngBounds();
    latlngbounds.extend(marker.position);
    // map.setCenter(latlngbounds.getCenter());
    map.fitBounds(latlngbounds);
    //  map.setZoom(15);
    // map.setCenter(marker.getPosition());

    google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
      //  map.setCenter(marker.getPosition());
        if (this.getZoom()){
            this.setZoom(16);
        }
      });

      google.maps.event.addListenerOnce(map, 'idle', function() {
        google.maps.event.trigger(map, 'resize');
      });
      // map.panToBounds(latlngbounds);

    // bounds.extend(new google.maps.LatLngBounds(19.088291, 72.442383));
    // map.fitBounds(bounds);

  }
//end: map end
  //start: event on close societydetails modal
  $('#societyDetails').on('hidden.bs.modal', function () {
    $scope.inventories_allowed = [];
    $scope.show_inventory = false;
    $scope.societyDetails = true;
  })
  //end: event on close societydetails modal
  //start: for amenity icons
  var amenityIcons = {
    GY :'icons/ic_gym.png',
    SP : 'icons/swim.png',
    PA : 'icons/ic_playing area.png',
    OA : 'icons/ic_open_space_area.png',
    GA : 'icons/ic_open_space_area.png',

  }
  $scope.getAmenityIcon = function(amenity){
    return amenityIcons[amenity];
  }
  //end: for amenity icons
  $scope.getOrderBy = function(center_data,supplierCode,status){
    console.log("hello");
    $timeout(function () {
      for (var i = 0; i < center_data.length; i++) {
        var suppliers = [];
         suppliers = angular.copy(center_data[i].suppliers[supplierCode]);
        var sortedSupplierList = [], unsortedSupplierList = [];
        $scope.myConcatenatedData = [];
        var k = 0;
        unsortedSupplierList = $filter('filter')(suppliers, {'status':'!'+ status});
        sortedSupplierList = $filter('filter')(suppliers, {'status':status});
        console.log(sortedSupplierList.length,unsortedSupplierList.length);
        Array.prototype.unshift.apply(unsortedSupplierList, sortedSupplierList);
        // $scope.myConcatenatedData = sortedSupplierList.concat(unsortedSupplierList);
        // angular.extend($scope.myConcatenatedData, sortedSupplierList,unsortedSupplierList);
        center_data[i].suppliers[supplierCode] = angular.copy(unsortedSupplierList);
      }
    });
  }
  // $scope.selectSupplierList = function(supplier){
  //   if($scope.supplierListCode == constants.All){
  //     $scope.society_allowed_gridview = true;
  //     $scope.corporate_allowed_gridview = true;
  //     $scope.busShelter_allowed_gridview = true;
  //     $scope.gym_allowed_gridview = true;
  //     $scope.saloon_allowed_gridview = true;
  //     $scope.retailStore_allowed_gridview = true;
  //   }
  // }
  $scope.sortByPriorityIndex = function(supplierCode){
    angular.forEach($scope.center_data, function(center){
      center.suppliers[supplierCode].sort(function(a, b) {
      return b.priority_index - a.priority_index;
    })

});
  }
});
