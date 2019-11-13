/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('catalogueApp')
    .controller('DashboardCtrl', function ($scope, NgMap, $rootScope, baConfig, colorHelper, DashboardService, commonDataShare, constants, $location, $anchorScroll, uiGmapGoogleMapApi, uiGmapIsReady, Upload, cfpLoadingBar, $stateParams, $timeout, Excel, permissions, $window) {
      $scope.itemsByPage = 15;
      $scope.permissions = permissions.dashboard;
      $scope.campaign_id = $stateParams.proposal_id;
      $scope.query = "";
      $scope.oneAtATime = true;
      $scope.bookingStatusSuppliers = constants.booking_status;
      $scope.showCampaigns = true;
      $scope.rowCollection = [];
      $scope.userIcon = "icons/usericon.png";
      $scope.passwordError = constants.password_error;
      $scope.userInfo = $rootScope.globals.userInfo;
      $scope.dateRangeModel = {};
      $scope.selectedVendor = {};
      $scope.vendorsData = {};
      $scope.emailModel = {};
      $scope.vendorDataMap = {};
      $scope.vendorsData = {};
      $scope.selectedVendors = [];
      $scope.selectedCities = [];
      $scope.selectedCities_temp = [];
      $scope.selectedbookingParameters = [];
      $scope.selectedVendors_temp = [];
      $scope.selectedDynamicCampaigns = [];
      $scope.selectedDynamicGraphParams = [];
      $scope.selectedTypeOfSocieties = [];
      $scope.selectedSizeOfFlats = [];
      var selectedSpecificItems = [];
      $scope.cumulativeOrder = false;
      $scope.selectedOrderKey = undefined;


      $scope.typeOfSocietyLists = [
        { id: 1, name: 'Ultra High' },
        { id: 2, name: 'High' },
        { id: 3, name: 'Medium High' },
        { id: 4, name: 'Standard' },
      ];
      $scope.sizeOfFlatsLists = [
        { id: 1, name: '1-150' },
        { id: 2, name: '151-400' },
        { id: 3, name: '401+' },
      ];
      $scope.freebiesLists = [
        { id: 1, name: 'Whatsapp Group' },
        { id: 2, name: 'Email Group' },
        { id: 3, name: 'Building ERP' },
        { id: 4, name: 'Door To Door' },
      ];

      $scope.graphParams = [
        { id: 1, name: 'Non Zero Total Leads', value: 'lead_nz', key: 'lead' },
        { id: 2, name: 'Non Zero Hot Leads', value: 'hot_lead_nz', key: 'hot_lead' },
        { id: 3, name: 'Non Zero Booking Confirmed', value: 'total_booking_confirmed_nz', key: 'total_booking_confirmed' },
        { id: 4, name: 'Non Zero Order Punched', value: 'total_orders_punched_nz', key: 'total_orders_punched'},
      ]
      $scope.BookingParametersLists = [
        { id: 1, name: 'Freebies Allowed', value: 'freebiestype' },
        { id: 2, name: 'Pre-Hype Allowed', value: 'preHypetype' },
        { id: 3, name: 'Poster Allowed', value: 'nbpostertype' },
        { id: 4, name: 'Standee Allowed', value: 'standeetype' },
        { id: 5, name: 'Flier Allowed', value: 'fliertype' },
        { id: 5, name: 'Banner Allowed', value: 'bannertype' },
        { id: 6, name: 'Stall Allowed', value: 'stalltype' },
        { id: 7, name: 'Stall Location', value: 'stalltype' },
      ];
      $scope.dynamicGraphYValuesMap = {
        'lead/flat*100': 'Leads %',
        'hot_lead/flat*100': 'Hot Leads %',
        'hotness_level_2/flat*100': 'Meeting Fixed %',
        'total_booking_confirmed/flat*100': 'Booking Confirmed %',
        'total_orders_punched/flat*100': 'Order Punched %',
        'flat*cost_flat/lead': 'Cost Per Lead (Rs)',
        'flat*cost_flat/hot_lead': 'Cost Per Hot Lead (Rs)',
        'cost_flat/hotness_level_2': 'Cost per Meeting Fixed',
        'flat*cost_flat/total_booking_confirmed': 'Cost per Booking Confirmed',
        'flat*cost_flat/total_orders_punched': 'Cost per Order Punched'
      };
      $scope.dynamicGraphYKeysMap = {
        'leadsPerc': 'lead/flat*100',
        'hotleadsPerc': 'hot_lead/flat*100',
        'meetingFixedPerc': 'hotness_level_2/flat*100',
        'meetingCompletedPerc': 'total_booking_confirmed/flat*100',
        'conversionPerc': 'total_orders_punched/flat*100',
        'costPerLeads': 'cost_flat/lead',
        'costPerHotLeads': 'cost_flat/hot_lead',
        'costPerMeetingFixed': 'cost_flat/hotness_level_2',
        'costPerMeetingCompleted': 'cost_flat/total_booking_confirmed',
        'costPerConversion': 'cost_flat/total_orders_punched'
      };
      var dynamicPricingKeys = {
        'Leads %': [
          {
            name: 'Total Leads',
            value: 'lead',
          },
          {
          name: 'Cost Per Lead',
          value: 'flat*cost_flat/lead',
        },
        ],
        'Hot Leads %': [{
          name: 'Hot Leads',
          value: 'hot_lead',
        },{
          name: 'Cost Per Hot Lead',
          value: 'flat*cost_flat/hot_lead',
        }],
        'Booking Confirmed %': [{
          name: 'Total Bookings Confirmed',
          value: 'total_booking_confirmed',
        },{
          name: 'Cost Per Meeting Fixed',
          value: 'flat*cost_flat/total_booking_confirmed',
        }],
        'Order Punched %': [{
          name: 'Total Orders Punched',
          value: 'total_orders_punched',
        },{
          name: 'Cost Per Orders Punched',
          value: 'flat*cost_flat/total_orders_punched',
        }]
      }
      var Raw_Data_Only_Cost = ["lead", "hot_lead", "flat", "cost_flat"];
      var Raw_Metric_Only_Cost = [["1", "3", "/"], ["m1", 100, "*"], ["2", "3", "/"], ["m3", 100, "*"], ["4", "1", "/"], ["4", "2", "/"]];

      var raw_data_global = ["lead", "hot_lead", "flat", "cost_flat", "hotness_level_2", "total_booking_confirmed", "total_orders_punched"];
      var metrics_global = [["1", "3", "/"], ["m1", 100, "*"], ["2", "3", "/"], ["m3", 100, "*"], ["5", "3", "/"]
        , ["m5", 100, "*"], ["6", "3", "/"], ["m7", 100, "*"], ["7", "3", "/"], ["m9", 100, "*"], ["4", "1", "/"],
      ["4", "2", "/"], ["4", "5", "/"], ["4", "6", "/"], ["4", "7", "/"],
      ["3", "4", "*"], ["m16", "1", "/"], ["m16", "2", "/"], ["m16", "6", "/"], ["m16", "7", "/"]];

      var raw_data_basic = ["lead", "hot_lead", "flat", "hotness_level_2", "total_booking_confirmed", "total_orders_punched"];
      var metrics_basic = [["1", "3", "/"], ["m1", 100, "*"], ["2", "3", "/"], ["m3", 100, "*"], ["4", "3", "/"], ["m5", 100, "*"],
      ["5", "3", "/"], ["m7", 100, "*"], ["6", "3", "/"], ["m9", 100, "*"]];
      var raw_data_basic_temp = ["lead", "hot_lead", "flat"];
      var metrics_basic_temp = [["1", "3", "/"], ["m1", 100, "*"], ["2", "3", "/"], ["m3", 100, "*"]];

      $scope.invNameToCode = {
        'POSTER': 'PO',
        'STALL': 'SL',
        'STANDEE': 'ST',
        'FLIER': 'FL',
        'GATEWAY ARCH': 'GA',
        'SUNBOARD': 'SB',
        'BANNER': 'BA'
      };
      $scope.queryType = {
        'Locality': 'Locality',
        'date': 'Date',
      };
      $scope.invKeys = [
        { header: 'POSTER' },
        { header: 'STANDEE' },
        { header: 'STALL' },
        { header: 'FLIER' },
        { header: 'GATEWAY ARCH' },
        { header: 'BANNER' },
        { header: 'SUNBOARD' },
      ];
      $scope.invCodes = {
        PO: 'PO',
        ST: 'ST',
        SL: 'SL',
        FL: 'FL',
        GA: 'GA',
        SB: 'SB',
        BA: 'BA'
      };
      $scope.actKeys = [
        { header: 'RELEASE', key: 'release', label1: 'Released', label2: 'UnReleased' },
        // {header : 'AUDIT', key : 'audit', label1 : 'Audited', label2 : 'UnAudited'},
        // {header : 'CLOSURE', key : 'closure', label1 : 'Closed', label2 : 'UnClosed' },
      ];


      $scope.supHeaders = [
        { header: 'Campaign Name', key: 'proposal_name' },
        { header: 'Inventory', key: 'supplier_name' },
        { header: 'Total Assigned', key: 'assigned' },
        { header: 'Today Released', key: 'inv_type' },
        { header: 'Average Delay(In Hours)', key: 'act_name' },
        { header: 'Average Off Location(Meters)', key: 'act_name' },
        { header: 'Images', key: 'images' },
      ];
      $scope.campaignStatus = {
        overall: {
          status: 'overall', value: false, campaignLabel: 'Overall Campaigns', supplierLabel: 'Overall Societies'
        },
        ongoing: {
          status: 'ongoing', value: false, campaignLabel: 'Ongoing Campaigns', supplierLabel: 'Ongoing Societies'
        },
        completed: {
          status: 'completed', value: false, campaignLabel: 'Completed Campaigns', supplierLabel: 'Completed Societies'
        },
        upcoming: {
          status: 'upcoming', value: false, campaignLabel: 'Upcoming Campaigns', supplierLabel: 'Upcoming Societies'
        },
        onhold: {
          status: 'onhold', value: false, campaignLabel: 'On Hold Campaigns', supplierLabel: 'On Hold Societies'
        },
        compare_campaigns: {
          status: 'compare_campaigns', value: false, campaignLabel: 'Compare Campaigns', supplierLabel: 'Compare Societies'
        },
      };

      $scope.allCampaignStatusType = {
        ongoing: {
          status: 'ongoing_campaigns', value: false, campaignLabel: 'Ongoing Campaigns'
        },
        completed: {
          status: 'completed_campaigns', value: false, campaignLabel: 'Completed Campaigns'
        },
        upcoming: {
          status: 'upcoming_campaigns', value: false, campaignLabel: 'Upcoming Campaigns'
        },
        onhold: {
          status: 'onhold_campaigns', value: false, campaignLabel: 'On Hold Campaigns'
        },
        compare_campaigns: {
          status: 'compare_campaigns', value: false, campaignLabel: 'Compare Campaigns'
        },
      };

      $scope.charts = {
        pie: { name: 'Pie Chart', value: 'pie' },
        doughnut: { name: 'Doughnut Chart', value: 'doughnut' },

      };
      $scope.LeadsHeader = [
        { header: 'Ongoing' },
        { header: 'Completed' },

      ];
      $scope.perfLeads = {
        all: 'all',
        invleads: 'invleads',
      };
      $scope.showPerfLeads = false;

      $scope.perfMetrics = {
        inv: 'inv',
        ontime: 'onTime',
        location: 'onLocation',
        leads: 'leads',
        multipleLeads: 'multipleLeads',
        overall: 'overall',
        blank: 'blank',
        distributedstatisticsgraphs: 'distributedstatisticsgraphs'
      };
      $scope.showPerfMetrics = false;

      $scope.perfPanel = {
        all: 'all',
        respective: 'respective'
      };
      $scope.showPerfPanel = false;
      $scope.inventories = constants.inventories;
      $scope.campaignStatusLabels = [$scope.campaignStatus.ongoing.name, $scope.campaignStatus.completed.name, $scope.campaignStatus.upcoming.name, $scope.campaignStatus.onhold.name, $scope.campaignStatus.overall.name];
      $scope.pieChartDefaulOptions = { legend: { display: true, position: 'right', padding: '10px' } };
      $scope.getCampaignsMenu = function (status) {
        $scope.campaignStatus.overall.value = false;
        $scope.campaignStatus.ongoing.value = false;
        $scope.campaignStatus.completed.value = false;
        $scope.campaignStatus.upcoming.value = false;
        $scope.campaignStatus.onhold.value = false;
        $scope.campaignStatus.compare_campaigns.value = false;
        $scope.campaignStatus[status].value = !$scope.campaignStatus[status].value;
      }

      var campaignDataStruct = {
        id: '',
        supplier_id: '',
        proposal_name: '',
        inv_id: '',
        inv_type: '',
        images: [],
        act_name: '',
        act_date: '',
        reAssign_date: '',
      };

      var category = $rootScope.globals.userInfo.profile.organisation.category;
      var orgId = $rootScope.globals.userInfo.profile.organisation.organisation_id;
      $scope.campaignDataList = [];
      var getAllCampaignsData = function () {
        DashboardService.getAllCampaignsData(orgId, category)
          .then(function onSuccess(response) {
            $scope.count = 0;
            $scope.invActDateList = [];
            $scope.inventoryActivityCountData = response.data.data;
            $scope.showTableForAllCampaignDisplay = false;
            angular.forEach(response.data.data, function (data, key) {
              $scope.isPanelOpen = !$scope.isPanelOpen;
              $scope.inventoryActivityCountData[key] = sortObject(data);
              $scope.invActDateList = $scope.invActDateList.concat(Object.keys($scope.inventoryActivityCountData[key]));
            })
            $scope.invActDateList = Array.from(new Set($scope.invActDateList));
            $scope.invActDateList.sort().reverse();
            $scope.dateListKeys = {};
            angular.forEach($scope.invActDateList, function (date) {
              $scope.dateListKeys[date] = date;
            })
            getHistory(response.data.data);
            $scope.loading = response.data.data;
          }).catch(function onError(response) {
            console.log(response);
          })
      }

      var loadData = function () {
        getAllCampaignsData();
      }
      loadData();

      function sortObject(obj) {
        return Object.keys(obj).sort().reverse().reduce(function (result, key) {
          result[key] = obj[key];
          return result;
        }, {});
      }

      $scope.count = 0;
      $scope.date = new Date();
      $scope.date = commonDataShare.formatDate($scope.date);
      $scope.pre = -1;
      $scope.next = 1;
      $scope.getDate = function (day) {
        $scope.dateWiseSuppliers = [];

        $scope.showAssignedInvTable = false;
        $scope.OntimeOnlocation.ontime.value = false;
        $scope.OntimeOnlocation.onlocation.value = false;
        $scope.date = new Date($scope.date);
        $scope.date.setDate($scope.date.getDate() + day);
        $scope.date = commonDataShare.formatDate($scope.date);
      }
      $scope.getRecentActivity = function (day) {
        $scope.dateWiseSuppliers = [];
        $scope.isPanelOpen = !$scope.isPanelOpen;
        $scope.showAssignedInvTable = false;
        $scope.OntimeOnlocation.ontime.value = false;
        $scope.OntimeOnlocation.onlocation.value = false;
        var initialDate = $scope.date;
        var date = new Date($scope.date);
        var counter = 100000;
        date.setDate(date.getDate() + day);
        date = commonDataShare.formatDate(date);

        while ($scope.dateListKeys[date] != date) {
          date = new Date(date);
          date.setDate(date.getDate() + day);
          date = commonDataShare.formatDate(date);
          counter--;
          if (counter < 0) {
            alert("No Activity");
            break;
          }
        }
        if (counter < 0)
          $scope.date = initialDate;
        else
          $scope.date = date;
      }

      $scope.getPercent = function (num1, num2) {
        var percent = num1 / num2 * 100;
        return percent;
      }

      $scope.getAssignedIdsAndImages = function (date, type, inventory) {
        cfpLoadingBar.start();
        $scope.dateWiseSuppliers = [];
        $scope.invName = inventory;
        $scope.actType = type;
        DashboardService.getAssignedIdsAndImages(orgId, category, type, date, inventory)
          .then(function onSuccess(response) {
            cfpLoadingBar.complete();
            $scope.campaignReleaseData = [];
            var campaignReleaseData = [];

            campaignReleaseData['totalOnTimeCount'] = 0;
            campaignReleaseData['totalOffTimeCount'] = 0;
            campaignReleaseData['totalOnLocationCount'] = 0;
            campaignReleaseData['totalOffLocationCount'] = 0;
            campaignReleaseData['totalOffLocationDistance'] = 0;
            campaignReleaseData['totalOffTimeDays'] = 0;
            campaignReleaseData['totalInvCount'] = 0;

            angular.forEach(response.data.data, function (data, campaignName) {
              $scope.campaignData = [];
              var campaignData = {};
              campaignData['name'] = campaignName;
              campaignData['images'] = [];
              campaignData['inv_count'] = 0;
              campaignData['onLocationCount'] = 0;
              campaignData['offLocationCount'] = 0;
              campaignData['onTimeCount'] = 0;
              campaignData['offTimeCount'] = 0;
              campaignData['offTimeDays'] = 0;
              campaignData['offLocationDistance'] = 0;
              campaignData['assigned'] = Object.keys(data.assigned).length;

              if (!campaignData['proposalId']) {
                campaignData['proposalId'] = data.assigned[Object.keys(data.assigned)[0]][0].proposal_id;
              }
              if (Object.keys(data.completed).length == 0) {
                var days = Math.floor((new Date() - new Date($scope.date)) / (1000 * 60 * 60 * 24));
                campaignData['offTimeDays'] = days * Object.keys(data.assigned).length;
              } else {
                var total = Object.keys(data.assigned).length - Object.keys(data.completed).length;
                var days = Math.floor((new Date() - new Date($scope.date)) / (1000 * 60 * 60 * 24));
                campaignData['offTimeDays'] = total * days;
              }

              angular.forEach(data.completed, function (items, inv) {
                campaignData.inv_count += 1;
                campaignData[inv] = {};
                campaignData[inv]['onLocation'] = false;
                campaignData[inv]['onTime'] = false;
                // campaignData[inv]['minDistance'] = 100;
                campaignData[inv]['dayCount'] = undefined;

                for (var i = 0; i < items.length; i++) {
                  campaignData['proposalId'] = items[i].proposal_id;
                  if (items[i].hasOwnProperty('distance') && items[i].distance <= constants.distanceLimit) {
                    campaignData[inv]['onLocation'] = true;
                    campaignData[inv]['minDistance'] = items[i].distance;
                    break;
                  }
                  else if (items[i].hasOwnProperty('distance')) {
                    if (!campaignData[inv].hasOwnProperty('minDistance') || items[i].distance < campaignData[inv]['minDistance']) {
                      campaignData[inv]['minDistance'] = items[i].distance;
                    }
                  }
                }
                for (var i = 0; i < items.length; i++) {
                  var days = Math.floor((new Date(items[i].created_at) - new Date(items[i].actual_activity_date)) / (1000 * 60 * 60 * 24));
                  if (days == 0) {
                    campaignData[inv]['onTime'] = true;
                    campaignData[inv]['dayCount'] = 0;
                    break;
                  } else if (campaignData[inv]['dayCount'] && days < campaignData[inv]['dayCount']) {
                    if (items[i].latitude)
                      campaignData[inv]['dayCount'] = days;
                    else {
                      campaignData[inv]['dayCount'] = 0;
                    }
                  } else if (!campaignData[inv]['dayCount']) {
                    if (items[i].latitude)
                      campaignData[inv]['dayCount'] = days;
                    else {
                      campaignData[inv]['dayCount'] = 0;
                    }

                  }
                }
                if (campaignData[inv]['onLocation']) {
                  campaignData['onLocationCount'] += 1;
                  if (campaignData[inv]['minDistance'])
                    campaignData['offLocationDistance'] += campaignData[inv]['minDistance'];
                }
                else {
                  campaignData['offLocationCount'] += 1;
                  if (campaignData[inv]['minDistance'])
                    campaignData['offLocationDistance'] += campaignData[inv]['minDistance'];
                }


                if (campaignData[inv]['onTime'])
                  campaignData['onTimeCount'] += 1;
                else {
                  campaignData['offTimeCount'] += 1;
                  campaignData['offTimeDays'] += campaignData[inv]['dayCount'];
                }
                campaignData['images'].push(items);

              })
              campaignReleaseData['totalOnTimeCount'] += campaignData['onTimeCount'];
              campaignReleaseData['totalOffTimeCount'] += campaignData['offTimeCount'];
              campaignReleaseData['totalOnLocationCount'] += campaignData['onLocationCount'];
              campaignReleaseData['totalOffLocationCount'] += campaignData['offLocationCount'];
              campaignReleaseData['totalOffLocationDistance'] += campaignData['offLocationDistance'];
              campaignReleaseData['totalInvCount'] += campaignData['inv_count'];
              campaignReleaseData['totalOffTimeDays'] += campaignData['offTimeDays'];

              campaignReleaseData.push(campaignData);
            })
            $scope.campaignReleaseData = campaignReleaseData;
            if ($scope.campaignReleaseData.length) {
              $scope.showAssignedInvTable = true;
            } else {
              $scope.showAssignedInvTable = false;
            }
            $scope.campaignDataList = [];
          }).catch(function onError(response) {
            console.log(response);
          })
      }

      $scope.goToExecutionPage = function (images) {
        $scope.imageUrlList = [];
        angular.forEach(images, function (imageObjects) {
          for (var i = 0; i < imageObjects.length; i++) {
            var imageData = {
              image_url: 'http://androidtokyo.s3.amazonaws.com/' + imageObjects[i].image_path,
              comment: imageObjects[i].comment,
            };
            $scope.imageUrlList.push(imageData);
          }
        })
      }

      $scope.getCampaignsByVendor = function () {
        $scope.getCampaigns(undefined, $scope.selectedVendor.name)
      }
      $scope.getCampaigns = function (date, vendor) {
        cfpLoadingBar.start();
        $scope.showSupplierTypeCountChart = false;
        $scope.selectedBookingCampaignName = undefined;
        $scope.showTableForAllCampaignDisplay = false;

        if (!date)
          date = new Date();
        date = commonDataShare.formatDate(date);
        date = date + ' 00:00:00';
        if (!vendor) {
          $scope.selectedVendor = {};
        }
        $scope.showCampaignGraph = true;
        $scope.campaignLabel = false;
        $scope.showLeadsDetails = false;
        $scope.showDisplayDetailsTable = false;
        $scope.showAllCampaignDisplay = false;
        $scope.allCampaignsLeadsData = {};
        $scope.viewCampaignLeads(true);
        DashboardService.getCampaigns(orgId, category, date, $scope.selectedVendor.name)
          .then(function onSuccess(response) {
            cfpLoadingBar.complete();
            $scope.searchSelectAllModel = [];
            $scope.showSingleCampaignChart = false;
            $scope.campaignData = response.data.data;
            $scope.campaignAllStatusTypeData = response.data.data;
            $scope.mergedarray = [];
            angular.forEach($scope.campaignData, function (data) {
              angular.forEach(data, function (campaign) {
                $scope.mergedarray.push(campaign);
              })
            })
            $scope.distributedGraphsVendorsData = [];

            angular.forEach($scope.mergedarray, function (data) {
              // $scope.distributedGraphsVendorsData.push(data);
              if (data.principal_vendor) {
                $scope.vendorsData[data.principal_vendor] = data;
              }
            })

            $scope.vendorsList = Object.keys($scope.vendorsData);
            
            $scope.campaigns = [$scope.campaignData.ongoing_campaigns.length, $scope.campaignData.completed_campaigns.length, $scope.campaignData.upcoming_campaigns.length, $scope.campaignData.onhold_campaigns.length];
            $scope.campaignChartdata = [
              { label: $scope.allCampaignStatusType.ongoing.campaignLabel, value: $scope.campaignData.ongoing_campaigns.length, status: $scope.allCampaignStatusType.ongoing.status },
              { label: $scope.allCampaignStatusType.completed.campaignLabel, value: $scope.campaignData.completed_campaigns.length, status: $scope.allCampaignStatusType.completed.status },
              { label: $scope.allCampaignStatusType.upcoming.campaignLabel, value: $scope.campaignData.upcoming_campaigns.length, status: $scope.allCampaignStatusType.upcoming.status },
              { label: $scope.allCampaignStatusType.onhold.campaignLabel, value: $scope.campaignData.onhold_campaigns.length, status: $scope.allCampaignStatusType.onhold.status }

            ];
            $scope.options = angular.copy(doughnutChartOptions);
            $scope.options.chart.pie.dispatch['elementClick'] = function (e) { $scope.pieChartClick(e.data.label); };
            $scope.options.chart.pie.dispatch['elementClick'] = function (e) { $scope.getCampaignInvData(e.data); };

            $scope.showPerfPanel = $scope.perfPanel.all;
          }).catch(function onError(response) {
            console.log(response);
          })
      }


      $scope.pieChartClick = function (label) {
        $anchorScroll('bottom');
        $scope.campaignStatusName = label;
        var campaignStatus = _.findKey($scope.campaignStatus, { 'campaignLabel': label });
        getCountOfSupplierTypesByCampaignStatus(campaignStatus);
      }
      var getCountOfSupplierTypesByCampaignStatus = function (campaignStatus) {
        cfpLoadingBar.start();
        DashboardService.getCountOfSupplierTypesByCampaignStatus(campaignStatus)
          .then(function onSuccess(response) {
            cfpLoadingBar.complete();
            $scope.AllCampaignData = response.data.data;

            $scope.supplierPanIndiaMarkers = assignPanIndiaMarkersToMap($scope.AllCampaignData);
            if (response.data.data) {
              $scope.supplierCodeCountData = formatCountData(response.data.data);
              $scope.supplierTypesData = response.data.data;
              $scope.supplierTypesDataList = [];
              angular.forEach($scope.supplierTypesData, function (data) {
                $scope.supplierTypesDataList = $scope.supplierTypesDataList.concat(data);

              })
              $scope.supplierCodeCountOptions = angular.copy(doughnutChartOptions);
              $scope.showSupplierTypeCountChart = true;
            }
          }).catch(function onError(response) {
            console.log(response);
          })
      }

      $scope.doughnutChartOptions = function () {
        $anchorScroll('bottom');
      }


      var formatCountData = function (data) {
        var countData = [];
        angular.forEach(data, function (items, key) {
          var temp_data = {
            label: constants[key] + ' Campaigns',
            value: items.length,
            campaigns: items
          }
          countData.push(temp_data);
        })
        return countData;
      }
      var formatSupplierCountData = function (data) {
        var countData = [];
        angular.forEach(data, function (item) {
          var temp_data = {
            label: constants[item.supplier_code] + ' Count',
            value: item.total,
          }
          countData.push(temp_data);
        })
        return countData;
      }

      var formatLabelData = function (data, label) {
        var labelData = [];
        angular.forEach(data, function (item) {
          labelData.push(item[label]);
        })
        return labelData;
      }
      $scope.type = $scope.charts.doughnut.value;
      $scope.series = ["Campaigns"];
      $scope.getChart = function (chartType) {
        $scope.data = [$scope.campaigns];
        if (chartType == 'doughnut') {
          $scope.options = angular.copy(doughnutChartOptions);
          $scope.options.chart.pie.dispatch['elementClick'] = function (e) {
            $scope.pieChartClick(e.data.label);


          };

        }
        if (chartType == 'pie') {
          $scope.options = $scope.pieChartOptions;
        }
        $scope.type = chartType;
      }



      var doughnutChartOptions = {
        chart: {
          type: 'pieChart',
          height: 350,
          top: -30,
          donut: true,
          x: function (d) { return d.label; },
          y: function (d) { return d.value; },

          showLabels: true,
          labelType: 'value',
          pie: {
            startAngle: function (d) { return d.startAngle - Math.PI / 2 },
            endAngle: function (d) { return d.endAngle - Math.PI / 2 },
            dispatch: {
            }
          },
          duration: 500,
          legend: {
            rightAlign: false,

          },
          legendPosition: 'bottom',
          tooltip: {
          },
          interactive: true
        }
      };

      $scope.pieChartOptions = {
        chart: {
          type: 'pieChart',
          height: 350,
          x: function (d) { return d.label; },
          y: function (d) { return d.value; },
          showLabels: true,
          labelType: 'value',
          duration: 500,
          labelThreshold: 0.01,
          labelSunbeamLayout: true,
          legend: {
            rightAlign: false,

          },
          legendPosition: 'bottom',
        }
      };

      $scope.variableoptions = {
        chart: {
          type: 'linePlusBarChart',
          height: 500,
          margin: {
            top: 30,
            right: 75,
            bottom: 50,
            left: 75
          },
          bars: {
            forceY: [0]
          },
          bars2: {
            forceY: [0]
          },
          color: ['#2ca02c', 'darkred'],
          x: function (d, i) { return i; },
          showLabels: true,
          xAxis: {
            axisLabel: 'X Axis',
            tickFormat: function (d) {
              // var label = $scope.formatMultiBarChartDataForSuppliers[0].values[d].x;
              var label = $scope.values1;
              return label;
            }
          },
          x2Axis: {
            showMaxMin: false

          },
          y1Axis: {
            axisLabel: 'Y1 Axis',
            tickFormat: function (d) {
              return d3.format(',f')(d);
            },
            axisLabelDistance: 12
          },
          y2Axis: {
            axisLabel: 'Y2 Axis',
            tickFormat: function (d) {
              return 'HQ ' + d3.format(',.2f')(d)
            }
          },
          y3Axis: {
            tickFormat: function (d) {
              return d3.format(',f')(d);
            }
          },
          y4Axis: {
            tickFormat: function (d) {
              return '$' + d3.format(',.2f')(d)
            }
          }
        }
      };

      var societySummaryBarChart = {
        "chart": {
          "type": "multiBarChart",
          "height": 450,
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 145,
            "left": 45
          },
          "clipEdge": true,
          "duration": 500,
          "grouped": true,
          "sortDescending": false,
          "xAxis": {
            "axisLabel": "Society (Flat Count) in Percentage",
            "showMaxMin": false,
            "rotateLabels": -30
          },
          "yAxis": {
            "axisLabel": "Leads in %",
            "axisLabelDistance": -20,
            "ticks": 8
          },
          "legend": {
            "margin": {
              "top": 5,
              "right": 3,
              "bottom": 5,
              "left": 15
            },
          },

          "reduceXTicks": false
        }
      };

      var stackedBarChart = {
        "chart": {
          "type": "multiBarChart",          
          "height": 450,
          "forceY": [0,maxYValue+2],
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 200,
            "left": 60
          },
          "clipEdge": true,
          "duration": 500,
          "grouped": true,
          "sortDescending": false,
          "xAxis": {
            "axisLabel": "",
            "showMaxMin": false,
            "rotateLabels": -20,
          },
          "yAxis": {
            "axisLabel": "",
            "axisLabelDistance": -20,

            "ticks": 8,

          },
          "legend": {
            "margin": {
              "top": 5,
              "right": 3,
              "bottom": 5,
              "left": 15
            },
          },
          tooltip: {
            contentGenerator: function (e) {
              var series = e.series[0];
              
              if (series.value === null) return;
              var rows =
                "<tr>" +
                "<td class='key'>" + 'Name : ' + "</td>" +
                "<td class='x-value'>" + e.value + "</td>" +
                "</tr>" +
                "<tr>" +
                "<td class='key'>" + 'Value In (%) : ' + "</td>" +
                "<td class='x-value'><strong>" + (series.value ? series.value.toFixed(2) : 0) + "</strong></td>" +
                "</tr>" +
                "<tr>" +
                "<td class='key'>" + dynamicPricingKeys[e.data.key][0]['name'] + ' :' + "</td>" +
                "<td class='x-value'><strong>" + tooltipDynamicGraphData[e.index][dynamicPricingKeys[e.data.key][0]['value']].toFixed(2) + "</strong></td>" +
                "</tr>" +
                "<tr>" +
                "<td class='key'>" + dynamicPricingKeys[e.data.key][1]['name'] + ' (RS)' + ' :' + "</td>" +
                "<td class='x-value'><strong>" + tooltipDynamicGraphData[e.index][dynamicPricingKeys[e.data.key][1]['value']].toFixed(2) + "</strong></td>" +
                "</tr>";

              var header =
                "<thead>" +
                "<tr>" +
                "<td class='legend-color-guide'><div style='background-color: " + series.color + ";'></div></td>" +
                "<td class='key'><strong>" + series.key + "</strong></td>" +
                "</tr>" +
                "</thead>";

              return "<table>" +
                header +
                "<tbody>" +
                rows +
                "</tbody>" +
                "</table>";
            }
          },


          "reduceXTicks": false
        }
      };

      var stackedBarChartSummary = {
        "chart": {
          "type": "multiBarChart",          
          "height": 450,
          "forceY": [0,maxYValueSummary+2],
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 200,
            "left": 60
          },
          "clipEdge": true,
          "duration": 500,
          "grouped": true,
          "sortDescending": false,
          "xAxis": {
            "axisLabel": "",
            "showMaxMin": false,
            "rotateLabels": -20,
          },
          "yAxis": {
            "axisLabel": "",
            "axisLabelDistance": -20,

            "ticks": 8,

          },
          "legend": {
            "margin": {
              "top": 5,
              "right": 3,
              "bottom": 5,
              "left": 15
            },
          },
          tooltip: {
            contentGenerator: function (e) {
              var series = e.series[0];
              
              if (series.value === null) return;
              var rows =
                "<tr>" +
                "<td class='key'>" + 'Name : ' + "</td>" +
                "<td class='x-value'>" + e.value + "</td>" +
                "</tr>" +
                "<tr>" +
                "<td class='key'>" + 'Value In (%) : ' + "</td>" +
                "<td class='x-value'><strong>" + (series.value ? series.value.toFixed(2) : 0) + "</strong></td>" +
                "</tr>" +
                "<tr>" +
                "<td class='key'>" + dynamicPricingKeys[e.data.key][0]['name'] + ' :' + "</td>" +
                "<td class='x-value'><strong>" + tooltipDynamicGraphDataSummary[e.index][dynamicPricingKeys[e.data.key][0]['value']].toFixed(2) + "</strong></td>" +
                "</tr>" +
                "<tr>" +
                "<td class='key'>" + dynamicPricingKeys[e.data.key][1]['name'] + ' (RS)' + ' :' + "</td>" +
                "<td class='x-value'><strong>" + tooltipDynamicGraphDataSummary[e.index][dynamicPricingKeys[e.data.key][1]['value']].toFixed(2) + "</strong></td>" +
                "</tr>";

              var header =
                "<thead>" +
                "<tr>" +
                "<td class='legend-color-guide'><div style='background-color: " + series.color + ";'></div></td>" +
                "<td class='key'><strong>" + series.key + "</strong></td>" +
                "</tr>" +
                "</thead>";

              return "<table>" +
                header +
                "<tbody>" +
                rows +
                "</tbody>" +
                "</table>";
            }
          },


          "reduceXTicks": false
        }
      };

      var dateSummaryBarChart = {
        "chart": {
          "type": "multiBarChart",
          "height": 450,
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 145,
            "left": 45
          },
          "clipEdge": true,
          "duration": 500,
          "grouped": true,
          "sortDescending": false,
          "xAxis": {
            "axisLabel": "Date (Flat Count) in Percentage",
            "showMaxMin": false,
            "rotateLabels": -30
          },
          "yAxis": {
            "axisLabel": "Leads in %",
            "axisLabelDistance": -20,

            "ticks": 8
          },
          "legend": {
            "margin": {
              "top": 5,
              "right": 3,
              "bottom": 5,
              "left": 15
            },
          },

          "reduceXTicks": false
        }
      };

      var flatSummaryBarChart = {
        "chart": {
          "type": "multiBarChart",
          "height": 450,
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 145,
            "left": 45
          },
          "clipEdge": true,
          "duration": 500,
          "grouped": true,
          "sortDescending": false,
          "xAxis": {
            "axisLabel": "Flat Range (Flat Count) in Percentage",
            "axisLabelDistance": -50,
            "showMaxMin": false,
            "rotateLabels": -30
          },
          "yAxis": {
            "axisLabel": "Leads in %",
            "axisLabelDistance": -20,

            "ticks": 8
          },
          "legend": {
            "margin": {
              "top": 5,
              "right": 3,
              "bottom": 5,
              "left": 15
            },
          },

          "reduceXTicks": false
        }
      };

      var weekSummaryStackedBar = {
        "chart": {
          "type": "multiBarChart",
          "height": 450,
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 145,
            "left": 45
          },
          "clipEdge": true,
          "duration": 500,
          "grouped": true,
          "sortDescending": false,
          "xAxis": {
            "axisLabel": "Summary Wise (Flat Count) in Percentage",
            "axisLabelDistance": -50,
            "showMaxMin": false,
            "rotateLabels": -30
          },
          "yAxis": {
            "axisLabel": "Leads in %",
            "axisLabelDistance": -20,

            "ticks": 8
          },
          "legend": {
            "margin": {
              "top": 5,
              "right": 3,
              "bottom": 5,
              "left": 15
            },
          },

          "reduceXTicks": false
        }
      };

      var locationSummaryBarChart = {
        "chart": {
          "type": "multiBarChart",
          "height": 450,
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 145,
            "left": 45
          },
          "clipEdge": true,
          "duration": 500,
          "grouped": true,
          "sortDescending": false,
          "xAxis": {
            "axisLabel": "Society Area (Flat Count) in Percentage",
            "showMaxMin": false,
            "rotateLabels": -30
          },
          "yAxis": {
            "axisLabel": "Leads in %",
            "axisLabelDistance": -20,

            "ticks": 8
          },
          "legend": {
            "margin": {
              "top": 5,
              "right": 3,
              "bottom": 5,
              "left": 15
            },
          },

          "reduceXTicks": false
        }
      };

      var phaseSummaryBarChart = {
        "chart": {
          "type": "multiBarChart",
          "height": 450,
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 145,
            "left": 45
          },
          "clipEdge": true,
          "duration": 500,
          "grouped": true,
          "sortDescending": false,
          "xAxis": {
            "axisLabel": "Phases (Flat Count) in Percentage",
            "showMaxMin": false,
            "rotateLabels": -30
          },
          "yAxis": {
            "axisLabel": "Leads in %",
            "axisLabelDistance": -20,

            "ticks": 8
          },
          "legend": {
            "margin": {
              "top": 5,
              "right": 3,
              "bottom": 5,
              "left": 15
            },
          },

          "reduceXTicks": false
        }
      };

      var citySummaryBarChart = {
        "chart": {
          "type": "multiBarChart",
          "height": 450,
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 145,
            "left": 45
          },
          "clipEdge": true,
          "duration": 500,
          "grouped": true,
          "sortDescending": false,
          "xAxis": {
            "axisLabel": "City (Flat Count) in Percentage",
            "showMaxMin": false,
            "rotateLabels": -30
          },
          "yAxis": {
            "axisLabel": "Leads in %",
            "axisLabelDistance": -20,

            "ticks": 8
          },
          "legend": {
            "margin": {
              "top": 5,
              "right": 3,
              "bottom": 5,
              "left": 15
            },
          },

          "reduceXTicks": false
        }
      };

      var lineChartLeads = {
        "chart": {
          "type": "lineChart",
          "height": 450,
          "interpolate": "basis",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 130,
            "left": 140
          },
          "useInteractiveGuideline": true,
          x: function (d, i) {  
            return +d.x; },
          y: function (d) { return +d.y; },
          "dispatch": {
            stateChange: function (e) { console.log("stateChange"); },
            changeState: function (e) { console.log("changeState"); },
            tooltipShow: function (e) { console.log("tooltipShow"); },
            tooltipHide: function (e) { console.log("tooltipHide"); }
          },
          "xAxis": {
            "axisLabel": "Leads % and Hot Leads % Range Distribution",
            "showMaxMin": false, 
            "reduceXTicks": false,
            "staggerLabels": false,           
            tickFormat: function (d) {
              console.log($scope.x_fre_leads[d]);
              
              return $scope.x_fre_leads[d];
            },
            // tickFormat: function(d){
            //   console.log($scope.x[d]);
            //           return $scope.x[d];
            //       },
            "rotateLabels": -30
          },
          "yAxis": {
            "axisLabel": "Mode Count In Leads and Hot Leads",
          }
        }
      };

      var lineChartCumulativeOrder = {
        "chart": {
          "type": "lineChart",
          "height": 450,
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 130,
            "left": 140
          },
          "useInteractiveGuideline": true,
            x: function (d, i) {  
                         
              return d.x; },
            y: function (d) { 
              return d.y; },
            "dispatch": {
            stateChange: function (e) { console.log("stateChange"); },
            changeState: function (e) { console.log("changeState"); },
            tooltipShow: function (e) { console.log("tooltipShow"); },
            tooltipHide: function (e) { console.log("tooltipHide"); }
          },
          "xAxis": {
            "axisLabel": "Orders Punched Day",
            "showMaxMin": false,
            tickFormat: function(d) { 
              return d },
            
            "rotateLabels": -30
          },
          "yAxis": {
            "axisLabel": "Cumulative Orders Punched (%)",
            tickFormat: function(d){
              return d3.format(',.2f')(d);
          },
          }
        }
      };

      var discreteBarChart = {
        chart: {
          type: 'discreteBarChart',
          height: 450,
          margin: {
            top: 20,
            right: 20,
            bottom: 50,
            left: 55
          },
          x: function (d) { return d.label; },
          y: function (d) { return d.value + (1e-10); },
          showValues: true,
          valueFormat: function (d) {
            return d3.format(',.2f')(d);
          },
          duration: 1500,
          xAxis: {
            axisLabel: '',
            "showMaxMin": false,
            "rotateLabels": -30
          },
          yAxis: {
            axisLabel: 'Leads in %',
            axisLabelDistance: -10
          }
        }
      };
      var dynamicDiscreteBarChart = {
        chart: {
          type: 'discreteBarChart',
          "height": 450,
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 200,
            "left": 60
          },
          x: function (d) { return d.label; },
          y: function (d) { return d.value + (1e-10); },
          showValues: true,
          valueFormat: function (d) {
            return d3.format(',.2f')(d);
          },
          duration: 1500,
          xAxis: {
            axisLabel: '',
            "showMaxMin": false,
            "rotateLabels": -30
          },
          yAxis: {
            axisLabel: 'Leads in %',
            axisLabelDistance: -10
          },
          tooltip: {
            contentGenerator: function (e) {
              var series = e.series[0];
              console.log(series,e);
              var key = $scope.dynamicGraphYValuesMap[$scope.dynamicGraphSelectedOrder.value];
              if (series.value === null) return;
              var rows =
                "<tr>" +
                "<td class='key'>" + 'Name : ' + "</td>" +
                "<td class='x-value'>" + key + "</td>" +
                "</tr>" +
                "<tr>" +
                "<td class='key'>" + 'Value In (%) : ' + "</td>" +
                "<td class='x-value'><strong>" + (series.value ? series.value.toFixed(2) : 0) + "</strong></td>" +
                "</tr>" +
                "<tr>" +
                "<td class='key'>" + dynamicPricingKeys[key][0]['name'] + ' :' + "</td>" +
                "<td class='x-value'><strong>" + tooltipDynamicGraphData[e.index][dynamicPricingKeys[key][0]['value']].toFixed(2) + "</strong></td>" +
                "</tr>" +
                "<tr>" +
                "<td class='key'>" + dynamicPricingKeys[key][1]['name'] + ' (RS)' + ' :' + "</td>" +
                "<td class='x-value'><strong>" + tooltipDynamicGraphData[e.index][dynamicPricingKeys[key][1]['value']].toFixed(2) + "</strong></td>" +
                "</tr>";

              var header =
                "<thead>" +
                "<tr>" +
                "<td class='legend-color-guide'><div style='background-color: " + series.color + ";'></div></td>" +
                "<td class='key'><strong>" + series.key + "</strong></td>" +
                "</tr>" +
                "</thead>";

              return "<table>" +
                header +
                "<tbody>" +
                rows +
                "</tbody>" +
                "</table>";
            }
          },         
        }
      };
      var overallSummaryStackedBar = {
        "chart": {
          "type": "multiBarChart",
          "height": 450,
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 145,
            "left": 45
          },
          "clipEdge": true,
          "duration": 500,
          "grouped": true,
          "sortDescending": false,
          "xAxis": {
            "axisLabel": "Campaign Wise (Flat Count) in Percentage",
            "axisLabelDistance": -50,
            "showMaxMin": false,
            "rotateLabels": -30
          },
          "yAxis": {
            "axisLabel": "Leads in %",
            "axisLabelDistance": -20,

            "ticks": 8
          },
          "legend": {
            "margin": {
              "top": 5,
              "right": 3,
              "bottom": 5,
              "left": 15
            },
          },

          "reduceXTicks": false
        }
      };


      var overallVendorSummaryStackedBar = {
        "chart": {
          "type": "multiBarChart",
          "height": 450,
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 145,
            "left": 45
          },
          "clipEdge": true,
          "duration": 500,
          "grouped": true,
          "sortDescending": false,
          "xAxis": {
            "axisLabel": "Vendor Wise (Flat Count) in Percentage",
            "axisLabelDistance": -50,
            "showMaxMin": false,
            "rotateLabels": -30
          },
          "yAxis": {
            "axisLabel": "Leads in %",
            "axisLabelDistance": -20,

            "ticks": 8
          },
          "legend": {
            "margin": {
              "top": 5,
              "right": 3,
              "bottom": 5,
              "left": 15
            },
          },

          "reduceXTicks": false
        }
      };


      var thisWeekSummaryStackedBar = {
        "chart": {
          "type": "multiBarChart",
          "height": 450,
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 145,
            "left": 45
          },
          "clipEdge": true,
          "duration": 500,
          "grouped": true,
          "sortDescending": false,
          "xAxis": {
            "axisLabel": "Last Week (Flat Count) in Percentage",
            "axisLabelDistance": -50,
            "showMaxMin": false,
            "rotateLabels": -30
          },
          "yAxis": {
            "axisLabel": "Leads in %",
            "axisLabelDistance": -20,

            "ticks": 8
          },
          "legend": {
            "margin": {
              "top": 5,
              "right": 3,
              "bottom": 5,
              "left": 15
            },
          },

          "reduceXTicks": false
        }
      };
      var last2WeekSummaryStackedBar = {
        "chart": {
          "type": "multiBarChart",
          "height": 450,
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 145,
            "left": 45
          },
          "clipEdge": true,
          "duration": 500,
          "grouped": true,
          "sortDescending": false,
          "xAxis": {
            "axisLabel": "Last 2 Week (Flat Count) in Percentage",
            "axisLabelDistance": -50,
            "showMaxMin": false,
            "rotateLabels": -30
          },
          "yAxis": {
            "axisLabel": "Leads in %",
            "axisLabelDistance": -20,

            "ticks": 8
          },
          "legend": {
            "margin": {
              "top": 5,
              "right": 3,
              "bottom": 5,
              "left": 15
            },
          },

          "reduceXTicks": false
        }
      };
      var last3WeekSummaryStackedBar = {
        "chart": {
          "type": "multiBarChart",
          "height": 450,
          // "labelType" : "11",
          "margin": {
            "top": 100,
            "right": 20,
            "bottom": 145,
            "left": 45
          },
          "clipEdge": true,
          "duration": 500,
          "grouped": true,
          "sortDescending": false,
          "xAxis": {
            "axisLabel": "Last 3 Weeks (Flat Count) in Percentage",
            "axisLabelDistance": -50,
            "showMaxMin": false,
            "rotateLabels": -30
          },
          "yAxis": {
            "axisLabel": "Leads in %",
            "axisLabelDistance": -20,

            "ticks": 8
          },
          "legend": {
            "margin": {
              "top": 5,
              "right": 3,
              "bottom": 5,
              "left": 15
            },
          },

          "reduceXTicks": false
        }
      };
      // START : service call to get suppliers as campaign status
      $scope.getSuppliersOfCampaignWithStatus = function (campaign) {
        getCampaignInventoryActivitydetails(campaign.campaign);
        cfpLoadingBar.start();
        $scope.principalVendor = campaign.principal_vendor;
        $scope.campaignOwner = campaign.organisation;
        $scope.campaignTabPropsalName = campaign.name;
        $scope.campaignLabel = true;
        $scope.getCampaignFilters(campaign.campaign);
        $scope.campaignId = campaign.campaign;
        $scope.inv = campaign;
        DashboardService.getSuppliersOfCampaignWithStatus(campaign.campaign)
          .then(function onSuccess(response) {
            cfpLoadingBar.complete();
            // $scope.getPhases(campaign.campaign);

            // $scope.overallMetricStatus = [
            //   { label : $scope.campaignStatus.ongoing.supplierLabel, value : $scope.campaignStatusData.ongoing.length, status : $scope.campaignStatus.ongoing.status },
            //   { label : $scope.campaignStatus.completed.supplierLabel, value : $scope.campaignStatusData.completed.length, status : $scope.campaignStatus.completed.status },
            //   { label : $scope.campaignStatus.upcoming.supplierLabel, value : $scope.campaignStatusData.upcoming.length, status : $scope.campaignStatus.upcoming.status }
            // ];
            // console.log($scope.overallMetricStatus);
            $scope.overallMetric = response.data.data.overall_metrics;
            angular.forEach($scope.overallMetric, function (data, key) {
              $scope.metricStatusValue = data;
              // $scope.avgLeadsPerFlat = data.total_leads_count/data.flat_count * 100;
            });
            $scope.showLeadsDetails = false;
            $scope.showDisplayDetailsTable = false;
            $scope.showAllCampaignDisplay = false;
            $scope.showSupplierTypeCountChart = false;
            $scope.showCampaignInvTable = false;
            $scope.showSupplierInvTable = false;
            $scope.showSingleCampaignChart = true;
            $scope.showTableForAllCampaignDisplay = false;
            $scope.campaignStatusData = response.data.data;
            $scope.campaignSupplierAndInvData = response.data.data;
            $scope.showSupplierSocietywiseInvTable = false;
            $scope.showSupplierInvdDataTable = function (invData) {
              $scope.SocietyInvTable = $scope.campaignStatusData;
              $scope.showSupplierSocietywiseInvTable = true;
            };
            $scope.countallsupplier = $scope.campaignStatusData.completed.length + $scope.campaignStatusData.ongoing.length + $scope.campaignStatusData.upcoming.length;
            var totalFlats = 0, totalLeads = 0, totalSuppliers = 0, hotLeads = 0;

            // $scope.totalLeadsCount = response.data.data.supplier_data.length;
            $scope.campaignStatusData['totalSuppliers'] = 0;
            angular.forEach($scope.campaignStatusData, function (data, key) {
              if ($scope.campaignStatusData[key].length && key != 'upcoming') {
                $scope.campaignStatusData['totalSuppliers'] += $scope.campaignStatusData[key].length;
                $scope.campaignStatusData[key]['totalFlats'] = 0;
                $scope.campaignStatusData[key]['totalLeads'] = 0;
                $scope.campaignStatusData[key]['hotLeads'] = 0;
                angular.forEach(data, function (supplierData) {
                  $scope.campaignStatusData[key]['totalFlats'] += supplierData.supplier.flat_count;
                  $scope.campaignStatusData[key]['totalLeads'] += supplierData.leads_data.length;
                  if (supplierData.leads_data.length) {
                    $scope.showLeadsDetails = true;
                    angular.forEach(supplierData.leads_data, function (lead) {
                      if (lead.is_interested) {
                        $scope.campaignStatusData[key]['hotLeads'] += 1;

                      }
                    })
                  }
                })
                totalLeads += $scope.campaignStatusData[key].totalLeads;
                totalFlats += $scope.campaignStatusData[key].totalFlats;
              }
            })
            $scope.avgLeadsPerFlat = totalLeads / totalFlats * 100;
            $scope.avgLeadsPerSupplier = totalLeads / $scope.campaignStatusData.totalSuppliers;
            $scope.avgHotLeadsPerFlat = hotLeads / totalFlats * 100;
            $scope.avgHotLeadsPerSupplier = hotLeads / $scope.campaignStatusData.totalSuppliers;

            $scope.campaignChartdata = [
              { label: $scope.campaignStatus.ongoing.supplierLabel, value: $scope.campaignStatusData.ongoing.length, status: $scope.campaignStatus.ongoing.status },
              { label: $scope.campaignStatus.completed.supplierLabel, value: $scope.campaignStatusData.completed.length, status: $scope.campaignStatus.completed.status },
              { label: $scope.campaignStatus.upcoming.supplierLabel, value: $scope.campaignStatusData.upcoming.length, status: $scope.campaignStatus.upcoming.status },
              // { label : $scope.campaignStatus.onhold.supplierLabel, value : $scope.campaignStatusData.onhold.length, status : $scope.campaignStatus.onhold.status }

            ];
            $scope.options1 = angular.copy(doughnutChartOptions);
            $scope.options1.chart.pie.dispatch['elementClick'] = function (e) { $scope.getSupplierAndInvData(e.data); };



          }
          ).catch(function onError(response) {
            console.log(response);

          })
      }


      // START : get campaign filters
      $scope.getCampaignFilters = function (campaignId) {
        cfpLoadingBar.start();
        $scope.showTimeLocBtn = false;
        $scope.campaignId = campaignId;
        $scope.showPerfMetrics = $scope.perfMetrics.blank;
        DashboardService.getCampaignFilters(campaignId)
          .then(function onSuccess(response) {
            cfpLoadingBar.complete();
            $scope.campaignInventories = [];
            $scope.showinv = true;
            $scope.select = {
              campaignInventories: ""
            };
            angular.forEach(response.data.data, function (inv) {
              if ($scope.invCodes.hasOwnProperty(inv.filter_code)) {
                $scope.campaignInventories.push(inv);
              }
            })
            $scope.performanceMetricsData = [];

          }).catch(function onError(response) {
            console.log(response);
          })
      }
      // END : get campaign filters

      // START : get Performance metrics data
      $scope.getPerformanceMetricsData = {};
      $scope.getPerformanceMetricsData = function (inv, perf_param) {
        cfpLoadingBar.start();
        $scope.inv = inv;
        var type = 'inv';
        if (!perf_param)
          perf_param = 'inv';
        $scope.select.campaignInventories = "";

        DashboardService.getPerformanceMetricsData($scope.campaignId, type, inv, perf_param)
          .then(function onSuccess(response) {
            cfpLoadingBar.complete();
            $scope.performanceMetricsData = response.data.data;
            $scope.activityInvPerfData = {
              release: Object.keys($scope.performanceMetricsData.actual.release).length,
              audit: Object.keys($scope.performanceMetricsData.actual.audit).length,
              closure: Object.keys($scope.performanceMetricsData.actual.closure).length
            }
            $scope.showPerfMetrics = $scope.perfMetrics.inv;
            $scope.showTimeLocBtn = true;
            if (perf_param == 'on_time') {
              setOntimeData($scope.performanceMetricsData.actual);
              $scope.showPerfMetrics = $scope.perfMetrics.ontime;
            }
            if (perf_param == 'on_location') {
              getOnLocationData($scope.performanceMetricsData.actual);
              $scope.showPerfMetrics = $scope.perfMetrics.onLocation;
            }

          }).catch(function onError(response) {
            console.log(response);
          })
      }
      // END : get Performance metrics data

      // START : create on time data on activities
      var setOntimeData = function (data) {
        angular.forEach(data, function (activity, key) {
          activity['ontime'] = 0;
          angular.forEach(activity, function (imageData) {
            for (var i = 0; i < imageData.length; i++) {
              var days = Math.floor((new Date(imageData[i].created_at) - new Date(imageData[i].activity_date)) / (1000 * 60 * 60 * 24));
              if (days == 0) {
                activity['ontime'] += 1;
                break;
              }
            }
          })

        })
      }
      // END : create on time data on activities
      $scope.getOnTimeData = function (perf_param) {
        $scope.getPerformanceMetricsData($scope.inv, perf_param);
      }

      $scope.getLocationData = function (perf_param) {
        $scope.getPerformanceMetricsData($scope.inv, perf_param);
      }

      var getOnLocationData = function (data) {
        angular.forEach(data, function (activity, key) {
          data[key]['onLocation'] = 0;
          angular.forEach(activity, function (imageData) {
            for (var i = 0; i < imageData.length; i++) {
              if (imageData[i].hasOwnProperty('distance') && imageData[i].distance <= constants.distanceLimit) {
                data[key].onLocation += 1;
                break;
              }
            }
          })

        })


      }
      $scope.initializePerfMetrix = function () {
        $scope.showSupplierTypeCountChart = false;
      }

      $scope.getCampaignInvTypesData = function (campaign) {
        cfpLoadingBar.start();
        $scope.proposal_id = campaign.proposal_id;
        $scope.campaignName = campaign.proposal__name;
        DashboardService.getCampaignInvTypesData($scope.proposal_id)
          .then(function onSuccess(response) {
            $scope.campaignInventoryTypesData = response.data.data;
            $scope.loading = response.data.data;
            $scope.getSupplierInvTableData($scope.campaignInventoryTypesData);
            $scope.campaignInventoryData = response.data.data;
            $scope.totalTowerCount = 0;
            $scope.totalFlatCount = 0;
            $scope.totalSupplierCount = response.data.data.supplier_data.length;
            angular.forEach(response.data.data.supplier_data, function (data, key) {

              $scope.totalTowerCount += data.tower_count;
              $scope.totalFlatCount += data.flat_count;

            })
            cfpLoadingBar.complete();
          }).catch(function onError(response) {
            console.log(response);
          })
      }

      $scope.getSupplierInvTableData = function (supplier) {
        $scope.supplierInvData = supplier;
        $scope.showSupplierInvTable = true;

      }

      var getCampaignInventoryActivitydetails = function (campaignId) {
        cfpLoadingBar.start();
        DashboardService.getCampaignInventoryActivitydetails(campaignId)
          .then(function onSuccess(response) {
            $scope.campaignInventoryActivityData = response.data.data;
          }).catch(function onError(response) {
            console.log(response);
          })
      }




      $scope.onLocationDetails = false;
      $scope.onTimeDetails = false;

      $scope.OntimeOnlocation = {
        ontime: {
          status: 'ontime', value: false
        },
        onlocation: {
          status: 'onlocation', value: false
        },
      };

      $scope.showOntimeOnlocation = function (status) {
        $scope.showOnClickDetails = true;
        $scope.OntimeOnlocation.ontime.value = false;
        $scope.OntimeOnlocation.onlocation.value = false;

        $scope.OntimeOnlocation[status].value = !$scope.OntimeOnlocation[status].value;
      }


      var getHistory = function (data) {
        $scope.historyData = {};
        var curDate = new Date();
        angular.forEach(data, function (dates, invKey) {
          angular.forEach(dates, function (activities, dateKey) {
            if (new Date(dateKey) <= curDate) {
              if (!$scope.historyData.hasOwnProperty(dateKey)) {
                $scope.historyData[dateKey] = {};
              }
              angular.forEach(activities, function (count, actKey) {
                if (!$scope.historyData[dateKey].hasOwnProperty(actKey)) {
                  $scope.historyData[dateKey][actKey] = {};
                  $scope.historyData[dateKey][actKey]['actual'] = 0;
                  $scope.historyData[dateKey][actKey]['total'] = 0;
                }
                $scope.historyData[dateKey][actKey].actual += data[invKey][dateKey][actKey].actual;
                $scope.historyData[dateKey][actKey].total += data[invKey][dateKey][actKey].total;
              })
            }
          })
        })
      }
      $scope.getDatewiseSuppliersInventory = function (item, proposalId, proposalName) {
        cfpLoadingBar.start();
        $scope.dateWiseSuppliers = [];
        $scope.selectedProposalname = proposalName;
        $scope.proposalId = proposalId;
        DashboardService.getDatewiseSuppliersInventory(proposalId, $scope.date, $scope.invName, $scope.actType)
          .then(function onSuccess(response) {
            cfpLoadingBar.complete();
            angular.forEach(response.data.data, function (data) {
              $scope.dateWiseSuppliers.push(data);
            })
          }).catch(function onError(response) {
            console.log(response);
          })
      }
      $scope.getLeadsByCampaign = function (campaignId, campaign) {
        cfpLoadingBar.start();
        $scope.lineChartForLeadsDistributedGraphs = undefined;
        $scope.lineChartForHotLeadsDistributedGraphs = undefined;
        $scope.CampaignLeadsName = campaign.name;
        $scope.principalVendor = campaign.principal_vendor;
        $scope.campaignOwner = campaign.organisation;


        $scope.LeadsByCampaign = {};
        $scope.showReportBtn = false;
        // $scope.getSortedLeadsByCampaign();
        $scope.showTimeLocBtn = false;
        $scope.showinv = false;
        $scope.showSelection = true;
        $scope.campaignIdForPerfMetrics = campaignId;
        $scope.campaignInfoForPerfMetrics = campaign;
        $scope.showPerfMetrics = $scope.perfMetrics.blank;
        var result;        

        if ($scope.dateRangeModel.hasOwnProperty('start_date') && $scope.dateRangeModel.hasOwnProperty('end_date') &&
              !isNaN($scope.dateRangeModel.start_date.getDate()) && !isNaN($scope.dateRangeModel.end_date.getDate())) {
          
          $scope.dateRangeModel.start_date = commonDataShare.formatDateToString($scope.dateRangeModel.start_date);
          $scope.dateRangeModel.end_date = commonDataShare.formatDateToString($scope.dateRangeModel.end_date);
          result = DashboardService.getLeadsByCampaign(campaignId, $scope.dateRangeModel)
        } else {
          result = DashboardService.getLeadsByCampaign(campaignId)
        }
        $scope.getDistributionGraphsStatics();

        // DashboardService.getLeadsByCampaign(campaignId)
        result.then(function onSuccess(response) {
          $scope.dateRangeModel.start_date = new Date($scope.dateRangeModel.start_date);
          $scope.dateRangeModel.end_date = new Date($scope.dateRangeModel.end_date);
          $scope.selectAllCampaignLeads = false;
          $scope.dynamicGraphsUI = false;
          cfpLoadingBar.complete();
          if ($scope.LeadsByCampaign) {
            $scope.LeadsByCampaign = response.data.data;
            $scope.Data = $scope.LeadsByCampaign;
          }

          $scope.localityData = $scope.LeadsByCampaign.locality_data;
          $scope.phaseData = $scope.LeadsByCampaign.phase_data;
          $scope.locationHeader = [];
          angular.forEach($scope.LeadsByCampaign.locality_data, function (data, key) {
            $scope.value1 = key;
            $scope.locationHeader.push($scope.value1);
          })

          $scope.d3StackedBarChartData = formatD3StackedBarChartData($scope.LeadsByCampaign.supplier_data);
          $scope.stackedBarChartOptions = angular.copy(stackedBarChart);
          $scope.stackedBarChartSocietyWise = angular.copy(societySummaryBarChart);
          $scope.stackedBarChartDateWise = angular.copy(dateSummaryBarChart);
          $scope.stackedBarChartFlatWise = angular.copy(flatSummaryBarChart);
          $scope.stackedBarChartLocationWise = angular.copy(locationSummaryBarChart);
          $scope.stackedBarChartPhaseWise = angular.copy(phaseSummaryBarChart);
          $scope.stackedBarChartCityWise = angular.copy(citySummaryBarChart);
          $scope.weeklyStackedBarData = angular.copy(weekSummaryStackedBar);
          $scope.stackedBarChartSupplierData = formatMultiBarChartDataForSuppliers(response.data.data.supplier_data);
          $scope.stackedBarChartDateData = formatMultiBarChartDataByDate(response.data.data.date_data);
          $scope.stackedBarWeekSummaryData = formatWeekStackedChart(response.data.data);
          $scope.stackedBarFLatCountChart = formatFlatCountChart(response.data.data.flat_data);
          $scope.stackedBarLocationCountChart = formatLocationCountChart(response.data.data.locality_data);
          $scope.stackedBarPhaseChart = formatPhaseChart(response.data.data.phase_data);
          $scope.stackedBarThreeWeeksChart = formatThreeWeeksSummary(response.data.data);

          
          if(Object.keys(response.data.data.supplier_data).length > 4 ){
            $scope.stackedBarChartSocietyWise.chart['width'] = Object.keys(response.data.data.supplier_data).length * 100;
          }
          if(Object.keys(response.data.data.date_data).length > 4 ){
            $scope.stackedBarChartDateWise.chart['width'] = Object.keys(response.data.data.date_data).length * 100;
          }
          if(Object.keys(response.data.data.locality_data).length > 4 ){
            $scope.stackedBarChartLocationWise.chart['width'] = Object.keys(response.data.data.locality_data).length * 100;
          }

          $scope.campaignLeadsData = response.data.data;
          $scope.showPerfMetrics = $scope.perfMetrics.leads;
          // $scope.showPerfMetrics != $scope.perfMetrics.overall;
          $scope.selectAllCampaignLeads = false;


          $scope.showReportBtn = true;
        }).catch(function onError(response) {
          console.log(response);
        })
      }

      var formatMultiBarChartDataForSuppliers = function (data) {
        var values1 = [];
        var values2 = [];
        var values3 = [];
        var values4 = [];
        angular.forEach(data, function (supplier) {
          
          if (supplier['flat_count'] != 0) {
            $scope.hotLeadsValues = supplier.interested / supplier['flat_count'] * 100;
            $scope.normalLeadsValues = supplier.total / supplier['flat_count'] * 100;
            $scope.normalBookingValues = supplier.is_hot_level_3 / supplier['flat_count'] * 100;
            $scope.normalPunchedValues = supplier.is_hot_level_4 / supplier['flat_count'] * 100;
          }
          else {
            $scope.hotLeadsValues = supplier.interested;
            $scope.normalLeadsValues = supplier.total;

          }

          var keyWithFlatLabel = supplier.data.society_name + ' (' + supplier['flat_count'] + ')';
          var value1 =
            [keyWithFlatLabel, $scope.normalLeadsValues];
          var value2 =
            [keyWithFlatLabel, $scope.hotLeadsValues];
          var value3 =
            [ keyWithFlatLabel, $scope.normalBookingValues ];
          var value4 =
            [ keyWithFlatLabel, $scope.normalPunchedValues ];
          values1.push(value1);
          values2.push(value2);
          values3.push(value3);
          values4.push(value4);

        })

        var temp_data = [
          {
            key: "Total Leads in %",
            color: constants.colorKey1,
            values: values1,
            // "bar": true,
          },
          {
            key: "High Potential Leads in %",
            color: constants.colorKey2,
            values: values2,

          },
          {
            key: "Booking Confirmed in % :",
            color: constants.colorKey3,
            values: values3
          },
          {
            key: "Total Orders Punched in % :",
            color: constants.colorKey4,
            values: values4
          }
        ].map((series) => {
          series.values = series.values.map((d) => { return { x: d[0], y: d[1] } });
          return series;
        });
        console.log(temp_data);
        
        return temp_data;
      }

      var formatMultiBarChartDataByDate = function (data) {
        var values1 = [];
        var values2 = [];
        angular.forEach(data, function (date) {
          if (date['flat_count'] != 0) {
            $scope.hotLeadsValues = date.interested / date['flat_count'] * 100;
            $scope.normalLeadsValues = date.total / date['flat_count'] * 100;
          }
          else {
            $scope.hotLeadsValues = date.interested;
            $scope.normalLeadsValues = date.total;

          }

          var tempDate = commonDataShare.formatDate(date.created_at);
          var DateLabel = tempDate + ' (' + date['flat_count'] + ')';
          var value1 =
            { x: DateLabel, y: $scope.normalLeadsValues };
          var value2 =
            { x: DateLabel, y: $scope.hotLeadsValues };
          values1.push(value1);
          values2.push(value2);
        })
        var temp_data = [
          {
            key: "Total Leads in %",
            color: constants.colorKey1,
            values: values1
          },
          {
            key: "High Potential Leads in %",
            color: constants.colorKey2,
            values: values2
          }
        ];
        return temp_data;
      }

      var formatFlatCountChart = function (data) {
        var values1 = [];
        var values2 = [];
        var values3 = [];
        var values4 = [];
        angular.forEach(data, function (data, key) {
          if (data['flat_count'] != 0) {
            $scope.hotLeadsValues = data.interested / data['flat_count'] * 100;
            $scope.normalLeadsValues = data.total / data['flat_count'] * 100;
            $scope.normalBookingValues = data.is_hot_level_3 / data['flat_count'] * 100;
            $scope.normalPunchedValues = data.is_hot_level_4 / data['flat_count'] * 100;
          }
          else {
            $scope.hotLeadsValues = data.interested;
            $scope.normalLeadsValues = data.total;

          }
          var keyWithFlatLabel = key + ' (' + data['flat_count'] + ')';
          var value1 =
            { x: keyWithFlatLabel, y: $scope.normalLeadsValues };
          var value2 =
            { x: keyWithFlatLabel, y: $scope.hotLeadsValues };
          var value3 =
          { x: keyWithFlatLabel, y: $scope.normalBookingValues };
          var value4 =
          { x: keyWithFlatLabel, y: $scope.normalPunchedValues };
          values1.push(value1);
          values2.push(value2);
          values3.push(value3);
          values4.push(value4);


        })

        var temp_data = [
          {
            key: "Total Leads in % :",
            color: constants.colorKey1,
            values: values1
          },
          {
            key: "High Potential Leads in % :",
            color: constants.colorKey2,
            values: values2
          },
          {
            key: "Booking Confirmed in % :",
            color: constants.colorKey3,
            values: values3
          },
          {
            key: "Total Orders Punched in % :",
            color: constants.colorKey4,
            values: values4
          }
        ];
        return temp_data;
      }

      var formatWeekStackedChart = function (weekDataMerged) {
        var values1 = [];
        var values2 = [];
        angular.forEach(weekDataMerged, function (data, key) {
          var keyWithFlatLabel = key + ' (' + key.flat_count + ')';
          var value1 =
            { x: keyWithFlatLabel, y: $scope.normalLeadsValues };
          var value2 =
            { x: keyWithFlatLabel, y: $scope.hotLeadsValues };
          values1.push(value1);
          values2.push(value2);


        })

        var temp_data = [
          {
            key: "Total Leads in % :",
            color: constants.colorKey1,
            values: values1
          },
          {
            key: "High Potential Leads in % :",
            color: constants.colorKey2,
            values: values2
          }
        ];

        return temp_data;
      }

      var formatLocationCountChart = function (data) {
        var values1 = [];
        var values2 = [];
        var values3 = [];
        var values4 = [];
        angular.forEach(data, function (data, key) {
          if (data['flat_count'] != 0) {
            $scope.hotLeadsValues = data.interested / data['flat_count'] * 100;
            $scope.normalLeadsValues = data.total / data['flat_count'] * 100;
            $scope.normalBookingValues = data.is_hot_level_3 / data['flat_count'] * 100;
            $scope.normalPunchedValues = data.is_hot_level_4 / data['flat_count'] * 100;
          }
          else {
            $scope.hotLeadsValues = data.interested;
            $scope.normalLeadsValues = data.total;

          }
          var keyWithFlatLabel = key + ' (' + data['flat_count'] + ')';
          var value1 =
            { x: keyWithFlatLabel, y: $scope.normalLeadsValues };
          var value2 =
            { x: keyWithFlatLabel, y: $scope.hotLeadsValues };
          var value3 =
            { x: keyWithFlatLabel, y: $scope.normalBookingValues };
          var value4 =
            { x: keyWithFlatLabel, y: $scope.normalPunchedValues };
          values1.push(value1);
          values2.push(value2);
          values3.push(value3);
          values4.push(value4);


        })

        var temp_data = [
          {
            key: "Total Leads in %",
            color: constants.colorKey1,
            values: values1
          },
          {
            key: "High Potential Leads in %",
            color: constants.colorKey2,
            values: values2
          },
          {
            key: "Total Bookings Confirmed in %",
            color: constants.colorKey3,
            values: values3
          },
          {
            key: "Total Punched Orders in %",
            color: constants.colorKey4,
            values: values4
          }
        ];

        return temp_data;
      }

      var formatPhaseChart = function (data) {
        var values1 = [];
        var values2 = [];
        angular.forEach(data, function (data, key) {
          if (data['flat_count'] != 0) {
            $scope.hotLeadsValues = data.interested / data['flat_count'] * 100;
            $scope.normalLeadsValues = data.total / data['flat_count'] * 100;
          }
          else {
            $scope.hotLeadsValues = data.interested;
            $scope.normalLeadsValues = data.total;

          }

          var keyWithFlatLabel = key + ' (' + data['flat_count'] + ')';
          var value1 =
            { x: keyWithFlatLabel, y: $scope.normalLeadsValues };
          var value2 =
            { x: keyWithFlatLabel, y: $scope.hotLeadsValues };
          values1.push(value1);
          values2.push(value2);


        })

        var temp_data = [
          {
            key: "Total Leads in %",
            color: constants.colorKey1,
            values: values1
          },
          {
            key: "High Potential Leads in %",
            color: constants.colorKey2,
            values: values2
          }
        ];
        return temp_data;
      }
      //START :  code for 3 weeks summary
      var formatThreeWeeksSummary = function (data, key) {
        var temp_data = [
          {
            key: "Total Leads in %",
            color: constants.colorKey1,
            values:
              [
                { x: 'Overall' + '(' + data.overall_data.flat_count + ')', y: data.overall_data.total_leads / data.overall_data.flat_count * 100 },
                { x: 'Last Week' + '(' + data.last_week.flat_count + ')', y: data.last_week.total_leads / data.last_week.flat_count * 100 },
                { x: 'Last Two Week' + '(' + data.last_two_weeks.flat_count + ')', y: data.last_two_weeks.total_leads / data.last_two_weeks.flat_count * 100 },
                { x: 'Last Three Week' + '(' + data.last_three_weeks.flat_count + ')', y: data.last_three_weeks.total_leads / data.last_three_weeks.flat_count * 100 }
              ]
          },
          {
            key: "High Potential Leads in %",
            color: constants.colorKey2,
            values:
              [
                { x: 'Overall' + '(' + data.overall_data.flat_count + ')', y: data.overall_data.total_hot_leads / data.overall_data.flat_count * 100 },
                { x: 'Last Week' + '(' + data.last_week.flat_count + ')', y: data.last_week.total_hot_leads / data.last_week.flat_count * 100 },
                { x: 'Last Two Week' + '(' + data.last_two_weeks.flat_count + ')', y: data.last_two_weeks.total_hot_leads / data.last_two_weeks.flat_count * 100 },
                { x: 'Last Three Week' + '(' + data.last_three_weeks.flat_count + ')', y: data.last_three_weeks.total_hot_leads / data.last_three_weeks.flat_count * 100 }
              ]
          }
        ];
        return temp_data;
      }
      //END :  code for 3 weeks summary

      $scope.getDateData = function (date) {
        $scope.date = date;
      }


      $scope.graphicalComparision = {
        leads: {
          status: 'leads', value: false
        },
        inventory: {
          status: 'inventory', value: false
        },
      };
      $scope.getGraphicalComparision = function (status) {
        $scope.graphicalComparision.leads.value = false;
        $scope.graphicalComparision.inventory.value = false;
        $scope.showPerfMetrics = false;
        $scope.campaignInventories = [];
        $scope.showTimeLocBtn = false;
        $scope.graphicalComparision[status].value = !$scope.graphicalComparision[status].value;
        $scope.getCampaignsMenu($scope.campaignStatus.compare_campaigns.status);
      }

      $scope.searchSelectAllSettings = {
        enableSearch: true,
        keyboardControls: true, idProp: "campaign",
        template: '{{option.name}}', smartButtonTextConverter(skip, option) { return option; },
        selectionLimit: 4,
        showCheckAll: true,
        scrollableHeight: '300px', scrollable: true
      };
      $scope.settingsForDynamicGraph = {
        enableSearch: true,
        keyboardControls: true, idProp: "{{option.campaign_id}}",
        template: '{{option.campaign_name}}',
        showCheckAll: true,
        scrollableHeight: '300px', scrollable: true,        
      };
      $scope.settingsForDynamicGraphCity = {
        enableSearch: true,
        keyboardControls: true, idProp: "option",
        template: '{{option}}',
        smartButtonMaxItems: 1,
        smartButtonTextConverter(skip, option) { 
          return option; },
        // showCheckAll: true,
        scrollableHeight: '300px', scrollable: true,
        selectionLimit: 1,
        
      };
      $scope.settingsForDynamicGraphSociety = {
        enableSearch: true,
        keyboardControls: true, idProp: "option",
        template: '{{option.name}}', smartButtonTextConverter(skip, option) { return option; },
        showCheckAll: true,
        scrollableHeight: '300px', scrollable: true
      };
      $scope.settingsForDynamicGraphFlatType = {
        enableSearch: true,
        keyboardControls: true, idProp: "option",
        template: '{{option.name}}', smartButtonTextConverter(skip, option) { return option; },
        showCheckAll: true,
        scrollableHeight: '300px', scrollable: true
      };
      $scope.settingsForDynamicGraphVendor = {
        enableSearch: true,
        keyboardControls: true, idProp: "{{option}}",
        template: '{{option}}', 
        showCheckAll: true,
        scrollableHeight: '300px', scrollable: true,
        smartButtonMaxItems: 1,
        smartButtonTextConverter(skip, option) { 
          return option; },
          selectionLimit: 1,

      };
      $scope.settingsForDynamicGraphBookingParameters = {
        enableSearch: true,
        keyboardControls: true, idProp: "option",
        template: '{{option.name}}', smartButtonTextConverter(skip, option) { return option; },
        showCheckAll: true,
        scrollableHeight: '300px', scrollable: true
      };
      $scope.settingsForVendors = {
        enableSearch: true,
        keyboardControls: true, idProp: "{{option}}",
        template: '{{option}}',
        showCheckAll: true,
        scrollableHeight: '300px', scrollable: true
      };
      $scope.settingsForGraphParams = {
        enableSearch: true,
        keyboardControls: true, idProp: "{{option.id}}",
        template: '{{option.name}}', smartButtonTextConverter(skip, option) { return option; },
        showCheckAll: true,
        scrollableHeight: '300px', scrollable: true
      };
      $scope.selected_baselines_customTexts = { buttonDefaultText: 'Select Campaigns' };
      $scope.selected_baselines_customTexts_city = { buttonDefaultText: 'Select Cities' };
      $scope.selected_baselines_customTexts_booking_parameters = { buttonDefaultText: 'Select Parameters' };
      $scope.selected_baselines_customTexts_vendor = { buttonDefaultText: 'Select Vendor' };
      $scope.selected_baselines_customTexts_qualityTypesociety = { buttonDefaultText: 'Select Type of Society' };
      $scope.selected_baselines_customTexts_sizeOfFlats = { buttonDefaultText: 'Select Size of Society' };
      $scope.selected_baselines_customTexts_freebies = { buttonDefaultText: 'Select Freebies' };
      $scope.selected_baselines_customTexts_graphParams = { buttonDefaultText: 'Select Graph Param' };




      $scope.events = {

        onItemSelect: function (item) {
        }
      }
      $scope.eventsForDynamicGraphCampaign = {

        onItemSelect: function (item) {
          console.log(item);

        }
      }

      $scope.compCampaigns = {
        campaigns: {
          status: 'campaigns', value: false
        }
      };
      $scope.getCompareCampaigns = function (status) {
        $scope.compCampaigns.value = false;
        $scope.showPerfMetrics = false;
        $scope.showReportBtn = false;
        $scope.getCampaignsMenu($scope.campaignStatus.compare_campaigns.status);
        $scope.compCampaigns[status].value = !$scope.compCampaigns[status].value;
      }

      $scope.ontimelocation = {
        ontimeloc: {
          status: 'ontimeloc', value: false
        },
        showdrop: {
          status: 'showdrop', value: false
        }
      };
      $scope.getontimelocation = function (status) {
        $scope.ontimelocation.value = false;
        $scope.ontimelocation[status].value = !$scope.ontimelocation[status].value;
      }


      $scope.getCompareCampaignChartData = function (campaignChartData) {
        cfpLoadingBar.start();
        var proposalIdData = [];
        var proposalIdDataNames = {};
        angular.forEach($scope.searchSelectAllModel, function (data) {
          proposalIdData.push(data.campaign);
          proposalIdDataNames[data.campaign] = {
            name: data.name,
          };
        })
        DashboardService.getCompareCampaignChartData(proposalIdData)
          .then(function onSuccess(response) {
            cfpLoadingBar.complete();
            var campaignIds = Object.keys(response.data.data);
            angular.forEach(proposalIdData, function (campaignId) {
              if (!(campaignIds.indexOf(campaignId) > -1)) {
                response.data.data[campaignId] = {};
                response.data.data[campaignId]['data'] = {};
                response.data.data[campaignId]['total'] = 0;
                response.data.data[campaignId]['interested'] = 0;
                response.data.data[campaignId]['data']['name'] = proposalIdDataNames[campaignId].name;
              }
            });
            formatLineChartData(response.data.data);
            $scope.stackedBarChartOptions = angular.copy(stackedBarChart);
            $scope.stackedBarChartcampaignsData = formatMultiBarChartDataByMultCampaigns(response.data.data);
            $scope.showPerfMetrics = $scope.perfMetrics.multipleLeads;

          }).catch(function onError(response) {
            console.log(response);
          })
      }
      var formatMultiBarChartDataByMultCampaigns = function (data) {
        var values1 = [];
        var values2 = [];
        angular.forEach(data, function (campaign, key) {
          if (campaign['flat_count'] != 0) {
            $scope.hotLeadsValues = campaign.interested / campaign['flat_count'] * 100;
            $scope.normalLeadsValues = campaign.total / campaign['flat_count'] * 100;
          }
          else {
            $scope.hotLeadsValues = campaign.interested;
            $scope.normalLeadsValues = campaign.total;

          }
          var keyWithFlatLabel = campaign.data.name + ' (' + campaign['flat_count'] + ')';
          var value1 =
            { x: keyWithFlatLabel, y: $scope.normalLeadsValues };
          var value2 =
            { x: keyWithFlatLabel, y: $scope.hotLeadsValues };
          values1.push(value1);
          values2.push(value2);
        })
        var temp_data = [
          {
            key: "Total Leads",
            color: constants.colorKey1,
            values: values1
          },
          {
            key: "High Potential Leads",
            color: constants.colorKey2,
            values: values2
          }
        ];
        return temp_data;
      };
      var formatLineChartData = function (data) {
        $scope.lineChartLabels = [];
        $scope.lineChartValues = [];
        var values1 = [];
        var values2 = [];

        var count = Object.keys(data).length;
        angular.forEach(data, function (campaign) {
          $scope.lineChartLabels.push(campaign.data.name);
          values1.push(campaign.total / count);
          values2.push((campaign.interested) / count);
        });
        $scope.lineChartValues.push(values1);
        $scope.lineChartValues.push(values2);
      }

      $scope.lineChartOptions = {
        scales: {
          yAxes: [
            {
              id: 'y-axis-1',
              type: 'linear',
              display: true,
              position: 'left'
            },

          ],
          xAxes: [{
            ticks: {
              autoSkip: false
            }
          }],
          responsive: true,
          maintainAspectRatio: false,
        },
        series: ['Normal', 'High Potential'],
        legend: { display: true },
        colors: ['#d7525b', '#fcfc5f'],

      };
      $scope.datasetOverride = [
        {
          fill: true,
          backgroundColor: [
            "#d7525b",

          ]
        },
        {
          fill: true,
          backgroundColor: [
            "#fcfc5f",

          ]
        },
      ];

      $scope.openMenu = function ($mdMenu, ev) {
        $mdMenu.open(ev);
      };
      var invStatusKeys = {
        'STALL': {
          status: false, total: 0
        },
        'POSTER': {
          status: false, total: 0
        },
        'FLIER': {
          status: false, total: 0
        },
        'STANDEE': {
          status: false, total: 0
        },
        'GATEWAY ARCH': {
          status: false, total: 0
        },
        'BANNER': {
          status: false, total: 0
        },
        'SUNBOARD': {
          status: false, total: 0
        },

      }

      $scope.getCampaignInvData = function (data) {
        $scope.supplierStatus = data.status;
        $scope.campaignDetailsData = $scope.campaignAllStatusTypeData[data.status];
        $scope.showTableForAllCampaignDisplay = true;
        $scope.$apply();

      }

      $scope.getSupplierAndInvData = function (data) {
        $scope.societyCampaignName = true;
        $scope.campaignName = false;
        $scope.supplierStatus = data.status;
        $scope.supplierAndInvData = $scope.campaignSupplierAndInvData[data.status];
        $scope.invStatusKeys = angular.copy(invStatusKeys);
        // console.log($scope.supplierAndInvData);
        $scope.TotalSupplierFlatCount = 0;
        $scope.TotalSupplierLeadsCount = 0;
        $scope.TotalLeadsPerFlat = 0;
        $scope.TotalSupplierHotLeadsCount = 0;
        angular.forEach($scope.supplierAndInvData, function (supplier, key) {
          $scope.latitude = supplier.supplier.society_latitude;
          $scope.longitude = supplier.supplier.society_longitude;
          $scope.societyName = supplier.supplier.society_name;
          $scope.length = $scope.supplierAndInvData.length;
          $scope.TotalSupplierFlatCount += supplier.supplier.flat_count;
          if (supplier.leads_data.total_leads_count) {
            $scope.TotalSupplierLeadsCount += supplier.leads_data.total_leads_count;
          }
          $scope.TotalLeadsPerFlat += supplier.leads_data.leads_flat_percentage;
          if (supplier.leads_data.hot_leads_count) {
            $scope.TotalSupplierHotLeadsCount += supplier.leads_data.hot_leads_count;
          }
          $scope.societyName = supplier.supplier.society_name;

          angular.forEach(supplier.supplier.inv_data, function (inv, key) {
            $scope.invStatusKeys[key].status = true;
          })
          $scope.ImageURL = function (supplier, images) {

            $scope.ImageURLListOfAll = [];
            angular.forEach(images, function (data) {
              var imagesData = {
                image_url: 'http://androidtokyo.s3.amazonaws.com/' + data.image_path,
                comment: data.comment,
                // distance : data.distance,
              };
              $scope.ImageURLListOfAll.push(imagesData);

            })


          }

          angular.forEach(supplier.leads_data, function (inv, key) {
            $scope.leads_data = inv;
            $scope.showLeads = true;
            $scope.countLeads += 1;

            if ($scope.leads_data.is_interested) {
              $scope.supplierHotLeads += 1;
            }
          })


        })

        $scope.showDisplayDetailsTable = true;
        $scope.showAllCampaignDisplay = false;
        $scope.map = { zoom: 13, bounds: {}, center: { latitude: $scope.latitude, longitude: $scope.longitude } };
        $scope.supplierMarkers = assignMarkersToMap($scope.supplierAndInvData);

        uiGmapIsReady.promise()
          .then(function (instances) {
            uiGmapGoogleMapApi.then(function (maps) {

            });
          });
        $scope.$apply();

      }
      $scope.windowCoords = {};
      $scope.marker = {
        events: {
          mouseover: function (marker, eventName, model) {
            $scope.space = model;
            $scope.campaignInventory = model;
            $scope.windowCoords.latitude = model.latitude;
            $scope.windowCoords.longitude = model.longitude;
            $scope.show = true;
          }
        }
      };
      $scope.windowAllCoords = {};
      $scope.markerPanIndia = {
        mouseoverevent: {
          mouseover: function (markerPanIndia, eventName, modelAll) {
            $scope.spacePanIndia = modelAll;
            $scope.campaignInventory = modelAll;
            $scope.windowAllCoords.latitude = modelAll.latitude;
            $scope.windowAllCoords.longitude = modelAll.longitude;
            $scope.show = true;
          }
        }
      };

      function assignPanIndiaMarkersToMap(panIndiaCampaigns) {
        var markersOfPanIndia = [];
        angular.forEach(panIndiaCampaigns, function (data) {
          angular.forEach(data, function (campaign) {
            markersOfPanIndia.push({
              latitude: campaign.center__latitude,
              longitude: campaign.center__longitude,
              id: campaign.proposal_id,
              // icon: 'http://www.googlemapsmarkers.com/v1/009900/',
              options: { draggable: false },
              dataOfPanIndia: campaign,
              title: {
                name: campaign.proposal__name,
                society_count: campaign.total,

              },
            });
          })




        });
        return markersOfPanIndia;

      };
      function assignMarkersToMap(suppliers) {
        var markers = [];
        // var icon;
        var checkInv = true;
        angular.forEach(suppliers, function (supplier, $index) {
          markers.push({
            latitude: supplier.supplier.society_latitude,
            longitude: supplier.supplier.society_longitude,
            id: supplier.supplier.supplier_id,
            // icon: 'http://www.googlemapsmarkers.com/v1/009900/',
            options: { draggable: false },
            dataofSupplierAndInvData: supplier.supplier,
            title: {
              name: supplier.supplier.society_name,
              flat_count: supplier.supplier.flat_count,
            },
          });
          if (checkInv) {
            angular.forEach($scope.invStatusKeys, function (inv, key) {
              if ($scope.invStatusKeys[key].status) {
                if ('inv_data' in supplier.supplier && key in supplier.supplier.inv_data) {
                  markers[$index].title[key] = {
                    'key': key,
                    'total': supplier.supplier.inv_data[key].total.total
                  }
                } else {
                  markers[$index].title[key] = {
                    'key': key,
                    'total': 0
                  }
                }

              }
            })
          }


        });
        return markers;

      };
      $scope.supplierMarkers = [];
      $scope.supplierPanIndiaMarkers = [];

      $scope.map = { zoom: 5, bounds: {}, center: { latitude: 19.119, longitude: 73.48, } };
      $scope.options = {
        scrollwheel: false, mapTypeControl: true,
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



      $scope.calculateTotalCount = function (invKey, value) {
        if (value)
          $scope.invStatusKeys[invKey].total += value;
      }


      $scope.selectTabIndex = {
        value: 0
      }

      $scope.switchToLeads = function () {
        $scope.selectTabIndex.value = 2;
        $scope.getLeadsByCampaign($scope.campaignId);
      }


      $scope.switchToInventory = function (inv) {
        $scope.selectTabIndex.value = 2;
        // var perf_param = null;
        // $scope.getPerformanceMetricsData(inv,perf_param);
      }
      $scope.setImageUrl = function (item, images) {
        $scope.campaignNameOnImageModal = item.name;
        $scope.campaignName = true;
        $scope.societyCampaignName = false;
        $scope.imageUrlList = [];
        angular.forEach(images, function (data) {
          for (var i = 0; i < data.length; i++) {
            var imageData = {
              image_url: 'http://androidtokyo.s3.amazonaws.com/' + data[i].image_path,
              comment: data[i].comment,
              distance: data[i].distance,
              timestamp: data[i].created_at,
            };
            $scope.imageUrlList.push(imageData);
          }
        })

      }
      // map

      $scope.setInventoryInfoModalDetails = function (supplier, inv) {
      }


      $scope.map;
      NgMap.getMap().then(function (evtMap) {
        $scope.map = evtMap;
      });
      $scope.showDetail = function (evt, supplierData) {
        $scope.map;
        NgMap.getMap().then(function (evtMap) {
          $scope.map = evtMap;
        });
        $scope.windowDisplay = supplierData;
        $scope.map.showInfoWindow('myWindow', this);
      };

      $scope.viewSupplierImages = function (supplierId, invType, activityType, date) {

        $scope.imageUrlList = [];
        DashboardService.getSupplierImages(supplierId, invType, activityType, date)
          .then(function onSuccess(response) {
            angular.forEach(response.data.data, function (data) {
              var imageData = {
                image_url: 'http://androidtokyo.s3.amazonaws.com/' + data.image_path,
                comment: data.comment,
                distance: data.distance,
                timestamp: data.created_at
              };
              $scope.imageUrlList.push(imageData);
            })
          }).catch(function onError(response) {
            console.log(response);
          })
      }

      $scope.setHashtagImageUrl = function (item, images) {
        $scope.campaignNameOnImageModal = item.name;
        $scope.campaignName = true;
        $scope.societyCampaignName = false;
        $scope.hashTagImageUrl = [];
        angular.forEach(images, function (data) {
          for (var i = 0; i < data.length; i++) {
            var imageData = {
              image_url: 'http://androidtokyo.s3.amazonaws.com/' + data[i].image_path,
              comment: data[i].comment,
              distance: data[i].distance,
            };
            $scope.hashTagImageUrl.push(imageData);
          }
        })
      }
      $scope.getHashtagImages = function (item) {
        $scope.hashTagImageUrl = [];
        DashboardService.getHashtagImages($scope.proposalId, $scope.date)
          .then(function onSuccess(response) {
            $scope.hashTagImageData = [];
            angular.forEach(response.data.data, function (data) {
              var imageData = {
                image_url: constants.aws_campaign_images_url + data.image_path,
                comment: data.hashtag,
                supplier_name: data.supplier_data.society_name,
                timestamp: data.created_at
              };
              $scope.hashTagImageData.push(imageData);
            })
            if (!$scope.hashTagImageData.length) {
              $('#imageHashtag').modal('hide');
              swal(constants.name, "No Hashtag Images Clicked", constants.warning);
            } else {
              $('#imageHashtag').modal('show');
            }
          }).catch(function onError(response) {
            console.log(response);
          })
      }
      //
      $scope.options = { width: 500, height: 300, 'bar': 'aaa' };
      

      var formatD3StackedBarChartData = function (data) {
        var d3Data = [];
        // var d3Data['counts'] = [];
        angular.forEach(data, function (value) {
          var object_data = {
            label: value.data.society_name,
            total: value.total,
            counts: []
          };
          // object_data['counts'] = [];

          var temp_data = {
            'name': 'count',
            'y0': 0,
            'y1': value.total - value.interested,
            'label': value.data.society_name,
            'total': value.total,
          };
          object_data['counts'].push(temp_data);
          var temp_data = {
            'name': 'count2',
            'y0': value.total - value.interested,
            'y1': value.total,
            'label': value.data.society_name,
            'total': value.total,
          };
          object_data['counts'].push(temp_data);

          d3Data.push(object_data);
        });
        return d3Data;
      }

      $scope.getBookingCampaigns = function (campaign) {
        cfpLoadingBar.start();
        $scope.headerForSupplierBookings = undefined;
        $scope.bookingPhases = [];
        $scope.bookingSuppliersData = [];

        $scope.proposalId = campaign.campaign;
        $scope.campaignOwner = campaign.organisation;
        $scope.principalVendor = campaign.principal_vendor;
        $scope.selectedBookingCampaignName = campaign.name;
        $scope.showTableForAllCampaignDisplay = false;
        DashboardService.getBookingCampaigns(campaign.campaign)
          .then(function onSuccess(response) {
            cfpLoadingBar.complete();
            $scope.bookingPhases = response.data.data;

            // if(!$scope.bookingPhases.length){
            // swal(constants.name, "Suppliers Booking is going on.Currently, No supplier is Booked", constants.warning)
            // }
          }).catch(function onError(response) {
            console.log(response);
          })
      }
      $scope.getTotalFlatCount = function (data) {
        var total = 0;
        if (data) {
          angular.forEach(data, function (supplier) {
            total += supplier.flat_count || 0;
          })
        }
        return total;
      }
      $scope.getSuppliersOfBookingDetails = function (data, header) {
        $scope.headerForSupplierBookings = header;
        $scope.bookingSuppliersData = {};
        $scope.supplierBookingStatus = constants.supplierBookingStatus;
        if (data) {
          $scope.bookingSuppliersData = data;
        } else {
          swal(constants.name, "Suppliers Not Available In this Status", constants.warning);
        }
      }
      $scope.geToSupplierDetails = function (supplierId) {
        $location.path(supplierId + "/SocietyDetailsPages");
      }
      $scope.checkNan = function (number) {
        return isNaN(number);
      }
      $scope.viewCampaignLeads = function (value) {
        cfpLoadingBar.start();
        DashboardService.viewCampaignLeads($scope.selectedVendor.name)
          .then(function onSuccess(response) {
            $scope.AllCampaignTotalLeadsCount = 0;
            $scope.AllCampaignHotLeadsCount = 0;
            $scope.AllCampaignSupplierCount = 0;
            $scope.AllCampaignFlatCount = 0;
            $scope.allCampaignDetailsData = response.data.data;
            $scope.dynamicValues = $scope.allCampaignDetailsData;
            $scope.dynamicValuesCampaignIdMap = {};
            angular.forEach($scope.dynamicValues, function (data) {
              $scope.dynamicValuesCampaignIdMap[data.campaign_id] = data;
            })
            $scope.showTableForAllCampaignDisplay = false;

            angular.forEach($scope.allCampaignDetailsData, function (data) {
              $scope.campaignLength = data.length;
              if (data.total_leads) {
                $scope.AllCampaignTotalLeadsCount += data.total_leads;
              }
              if (data.hot_leads) {
                $scope.AllCampaignHotLeadsCount += data.hot_leads;
              }
              if (data.supplier_count) {
                $scope.AllCampaignSupplierCount += data.supplier_count;
              }
              if (data.flat_count) {
                $scope.AllCampaignFlatCount += data.flat_count;
              }
            });
            cfpLoadingBar.complete();
            $scope.leadsDataCampaigns = response.data.data;
            if (value) {
              angular.forEach($scope.leadsDataCampaigns, function (data) {
                if (!$scope.allCampaignsLeadsData.hasOwnProperty(data.campaign_status)) {
                  $scope.allCampaignsLeadsData[data.campaign_status] = {};
                  $scope.allCampaignsLeadsData[data.campaign_status]['total_leads'] = 0;
                  $scope.allCampaignsLeadsData[data.campaign_status]['hot_leads'] = 0;
                  $scope.allCampaignsLeadsData[data.campaign_status]['supplier_count'] = 0;
                  $scope.allCampaignsLeadsData[data.campaign_status]['flat_count'] = 0;
                }
                if (data.total_leads) {
                  $scope.allCampaignsLeadsData[data.campaign_status]['total_leads'] += data.total_leads;
                }

                if (data.hot_leads) {
                  $scope.allCampaignsLeadsData[data.campaign_status]['hot_leads'] += data.hot_leads;
                }
                if (data.supplier_count) {
                  $scope.allCampaignsLeadsData[data.campaign_status]['supplier_count'] += data.supplier_count;
                }
                if (data.flat_count) {
                  $scope.allCampaignsLeadsData[data.campaign_status]['flat_count'] += data.flat_count;
                }
              })
            }
          }).catch(function onError(response) {
            console.log(response);
          })
      }
      $scope.viewLeadsForSelectedCampaign = function (data, campaignId) {
        cfpLoadingBar.start();
        $scope.campaignIdForLeads = campaignId;
        DashboardService.viewLeadsForSelectedCampaign(data, campaignId)
          .then(function onSuccess(response) {
            cfpLoadingBar.complete();
            $scope.selectedCampaignLeads = response.data.data;
            $scope.CampaignNameofLeads = data.name;
            $scope.showCampaigns = false;
          }).catch(function onError(response) {
            console.log(response);
          })
      }
      $scope.backToCampaign = function () {
        $scope.showCampaigns = true;
      }
      

      // Check for internal comments
      var userInfo = JSON.parse($window.localStorage.userInfo);
      var userEmail = userInfo.email;
      $scope.canViewInternalComments = false;
      if (userEmail.includes('machadalo')){
        $scope.canViewInternalComments = true;
      }

      $scope.viewComments = function (comment_type, supplier) {
        $scope.societyViewNameForComments = supplier.supplier.society_name;
        $scope.commentsData = [];
        var relatedTo = comment_type;
        var spaceId = supplier.shortlisted_space_id;
        DashboardService.viewComments($scope.campaignId, spaceId, relatedTo)
          .then(function onSuccess(response) {
            $scope.commentModal = {};
            $scope.commentsData = response.data.data;
          }).catch(function onError(response) {
            console.log(response);
          })
      }

      $scope.viewBookingComments = function (supplier) {
        $scope.supplierNameForComment = undefined;
        $scope.supplierNameForComment = supplier.society_name;
        $scope.commentsData = {};
        var relatedTo = constants.execution_related_comment;
        var spaceId = supplier.space_id;
        DashboardService.viewBookingComments($scope.proposalId, spaceId, relatedTo)
          .then(function onSuccess(response) {
            $scope.commentModal = {};
            $scope.commentsData = response.data.data;
            if (Object.keys($scope.commentsData).length != 0) {
              $scope.viewInvForComments = Object.keys($scope.commentsData);
              $scope.selectedInvForView = $scope.viewInvForComments[0];
              $('#viewComments').modal('show');
            } else {
              $('#viewComments').modal('hide');
              swal(constants.name, constants.no_comments_msg, constants.warning);
            }
          }).catch(function onError(response) {
            console.log(response);
          })
      }
      $scope.addCount = function (data, key) {
        var total = 0;
        angular.forEach(data, function (item) {
          total += item[key];
        })
        return total;
      }
      $scope.sortMenu = [
        { name: 'Total(ASC)', type: 'total', order: 'ASC', id: 1 },
        { name: 'Total(DESC)', type: 'total', order: 'DESC', id: 2 },
        { name: 'HotLeads(ASC)', type: 'interested', order: 'ASC', id: 3 },
        { name: 'HotLeads(DESC)', type: 'interested', order: 'DESC', id: 4 },
        { name: 'All', type: '', order: '', id: 5 },
      ];
      var sortMenuMap = {};
      angular.forEach($scope.sortMenu, function (data) {
        sortMenuMap[data.id] = data;
      });
      $scope.sortedLocationData = {};
      $scope.togglesortedGraphs = {
        'location': false,
        'weekwise': false,
        'datewise': false,
        'flatData': false,
        'supplier': false,
        'weekly': false,
        'overall': false,
        'thisweek': false,
        'last2week': false,
        'last3week': false,
        'summary': false,
      }
      $scope.sortData = function (keyName, id) {

        if (id == 5) {
          $scope.togglesortedGraphs[keyName] = false;
        } else {
          $scope.togglesortedGraphs[keyName] = true;
        }
        if (keyName == 'location') {
          $scope.sortedData = angular.copy($scope.LeadsByCampaign.locality_data[0]);
        }
        if (keyName == 'weekwise') {
          $scope.sortedData = angular.copy($scope.LeadsByCampaign.phase_data[0]);
        }
        if (keyName == 'datewise') {
          $scope.sortedData = angular.copy($scope.LeadsByCampaign.date_data);
        }
        if (keyName == 'flatData') {
          $scope.sortedData = angular.copy($scope.LeadsByCampaign.flat_data);
        }
        if (keyName == 'supplier') {
          $scope.sortedData = angular.copy($scope.LeadsByCampaign.supplier_data);
        }
        if (keyName == 'summary') {
          $scope.sortedData = angular.copy($scope.LeadsByCampaign);
        }
        if (keyName == 'overall') {
          $scope.sortedData = angular.copy($scope.overallCampaignSummary);
        }
        if (keyName == 'thisweek') {
          $scope.sortedData = angular.copy($scope.overallCampaignSummary);
        }
        if (keyName == 'last2week') {
          $scope.sortedData = angular.copy($scope.overallCampaignSummary);
        }
        if (keyName == 'last3week') {
          $scope.sortedData = angular.copy($scope.overallCampaignSummary);
        }
        var sortable = [];
        for (var key in $scope.sortedData) {
          $scope.sortedData[key]['hotPerc'] = $scope.sortedData[key]['interested'] / $scope.sortedData[key]['flat_count'] * 100;
          $scope.sortedData[key]['totalPerc'] = $scope.sortedData[key]['total'] / $scope.sortedData[key]['flat_count'] * 100;
          $scope.sortedData[key]['totalPercRoundOff'] = Math.round($scope.sortedData[key]['totalPerc']);
          $scope.sortedData[key]['hotPercRoundOff'] = Math.round($scope.sortedData[key]['hotPerc']);
          sortable.push([key, $scope.sortedData[key]]);
        }

        var mean;
        if (sortMenuMap[id].type == 'total') {
          sortable.sort(function (a, b) {
            a = a[1].total / a[1].flat_count * 100;
            b = b[1].total / b[1].flat_count * 100;

            return a - b;
          });
          var total = 0;
          for (var key in $scope.sortedData) {
            total += $scope.sortedData[key].totalPerc;
          };
          mean = total / Object.keys($scope.sortedData).length;
          var mid = parseInt(Object.keys($scope.sortedData).length / 2);
          // console.log(sortable[mif]);
          if (Object.keys($scope.sortedData).length % 2 == 0) {
            var median = (sortable[mid][1].totalPerc + sortable[mid - 1][1].totalPerc) / 2;
          } else {
            var median = sortable[mid][1].totalPerc;
          }
          var mode, modeValues = {};
          angular.forEach($scope.sortedData, function (data) {
            if (!modeValues.hasOwnProperty(data.totalPercRoundOff)) {
              modeValues[data.totalPercRoundOff] = 0;
            }
            modeValues[data.totalPercRoundOff] += 1;
          })
          var max = 0;
          angular.forEach(modeValues, function (value) {
            max = (value > max) ? value : max;
          })
          var total = 0, count = 0, keys = [];
          angular.forEach(modeValues, function (value, key) {
            keys.push(parseInt(key));
            if (value == max) {
              total += parseInt(key);
              count += 1;
            }
          })
          var mode = total / count;
          var range = Math.max.apply(null, keys) - Math.min.apply(null, keys);
        }
        if (sortMenuMap[id].type == 'interested') {
          sortable.sort(function (a, b) {
            a = a[1].interested / a[1].flat_count * 100;
            b = b[1].interested / b[1].flat_count * 100;
            return a - b;
          });
          var total = 0;
          for (var key in $scope.sortedData) {
            total += $scope.sortedData[key].hotPerc;
          };
          mean = total / Object.keys($scope.sortedData).length;
          var mid = parseInt(Object.keys($scope.sortedData).length / 2);
          if (Object.keys($scope.sortedData).length % 2 == 0) {
            var median = (sortable[mid][1].hotPerc + sortable[mid - 1][1].hotPerc) / 2;
          } else {
            var median = sortable[mid][1].hotPerc;
          }
          var mode, modeValues = {};
          angular.forEach($scope.sortedData, function (data) {
            if (!modeValues.hasOwnProperty(data.hotPercRoundOff)) {
              modeValues[data.hotPercRoundOff] = 0;
            }
            modeValues[data.hotPercRoundOff] += 1;
          })
          var max = 0;
          angular.forEach(modeValues, function (value) {
            max = (value > max) ? value : max;
          })
          var total = 0, count = 0, keys = [];
          angular.forEach(modeValues, function (value, key) {
            keys.push(parseInt(key));
            if (value == max) {
              total += parseInt(key);
              count += 1;
            }
          })
          var mode = total / count;
          var range = Math.max.apply(null, keys) - Math.min.apply(null, keys);
        }

        $scope.sortedLocationData[keyName] = {};

        $scope.locationChartOptions = angular.copy(discreteBarChart);
        if (sortMenuMap[id].order == 'ASC') {
          $scope.sortedLocationData[keyName] = formatByLocation(sortable, keyName, sortMenuMap[id].type);
        }
        if (sortMenuMap[id].order == 'DESC') {
          $scope.sortedLocationData[keyName] = formatByLocation(sortable.reverse(), keyName, sortMenuMap[id].type);
        }

      
        $scope.showLocationData = true;
      }


      var formatByLocation = function (data, key, type) {
        var temp_data = {};

        temp_data['key'] = key;
        temp_data['values'] = [];
        angular.forEach(data, function (item) {
          if (key == 'supplier') {
            item[0] = item[1].data.society_name + " (" + item[1].data.flat_count + ")";
          }
          var value = {
            'label': item[0],
            'value': item[1][type] / item[1].flat_count * 100
          }
          temp_data.values.push(value);
        })
        return [temp_data];
      }
      $scope.commentModal = {};
      $scope.addComment = function (comment_type, supplier_shorlisted_spaceId) {
        $scope.commentModal['related_to'] = comment_type;
        $scope.commentModal['shortlisted_spaces_id'] = supplier_shorlisted_spaceId;
        DashboardService.addComment($scope.campaignId, $scope.commentModal)
          .then(function onSuccess(response) {
            $scope.commentModal = {};
            $scope.supplierDataForComment = undefined;
            swal(constants.name, constants.add_data_success, constants.success);
          }).catch(function onError(error) {
            console.log(error);
            swal(constants.name, 'Error adding comments', constants.failure);
          })
      }

      $scope.openChat = function () {
        $scope.showChat = true;
      }
      $scope.changePassword = function () {
        $('#changePassword').modal('show');
      }
      $scope.changeUserPassword = function () {
        cfpLoadingBar.start();
        DashboardService.changePassword($scope.userInfo.id, $scope.passwordModel)
          .then(function onSuccess(response) {
            cfpLoadingBar.complete();
            $('#changePassword').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            swal(constants.name, constants.changePassword_success, constants.success);
            $location.path("/logout");
          }).catch(function onError(response) {
            console.log(response);
            commonDataShare.showErrorMessage(response);
            swal(constants.name, constants.errorMsg, constants.error);
            // swal(constants.name,constants.errorMsg,constants.error);
          });
      }
      $scope.validatePassword = function () {
        if ($scope.passwordModel.password == $scope.passwordModel.confirm_password)
          $scope.isValid = true;
        else
          $scope.isValid = false;
      }

      $scope.getFormDetails = function (campaignId, type) {
        if(type === 'email'){
          $scope.submitLeadType = true;
        }else{
          $scope.submitLeadType = false;
        }
        cfpLoadingBar.start();
        $scope.campaignIdForleads = campaignId;
        $scope.emailCampaignLeadsModel = {};
        $scope.sendEmailList = [];
        DashboardService.getFormDetails(campaignId)
          .then(function onSuccess(response) {
            cfpLoadingBar.complete();
            $scope.formDetails = response.data.data;
            $scope.campaign_id = $scope.formDetails.leads_form_items;
          }).catch(function onError(response) {
            console.log(response);
          })
      }

      $scope.sendMeEmail = function () {
        cfpLoadingBar.start();
        $scope.emailCampaignLeadsModel['campaign_id'] = $scope.campaignIdForleads;
        DashboardService.sendMeEmail($scope.emailCampaignLeadsModel)
          .then(function onSuccess(response) {
            cfpLoadingBar.complete();
            $('#sendEmailModal').modal('hide');
            swal(constants.name, constants.email_success, constants.success);

          }).catch(function onError(response) {
            console.log(response);
          })
      }
      $scope.reportData = {};
      $scope.sendReport = function () {
        var token = $rootScope.globals.currentUser.token;
        var startDate, endDate;
        if ($scope.reportData.reportStartDate && $scope.reportData.reportEndDate) {
          startDate = commonDataShare.formatDate($scope.reportData.reportStartDate);
          endDate = commonDataShare.formatDate($scope.reportData.reportEndDate);
        }
        if ($scope.file) {
          Upload.upload({
            url: Config.APIBaseUrl + "v0/ui/website/send-graph-pdf/",
            data: {
              file: $scope.file,
              campaign_id: $scope.campaignIdForPerfMetrics,
              data_import_type: "base-data",
              start_date: startDate,
              end_date: endDate
            },
            headers: { 'Authorization': 'JWT ' + token }
          }).then(function onSuccess(response) {
            $scope.file = undefined;
            swal(constants.name, constants.email_success, constants.success);
          })
            .catch(function onError(response) {
              console.log(response);
            });
        }
      }
      var reportFile;
      $scope.uploadFiles = function (file) {
        var reportFile;
        $scope.file = file;
        $scope.selectDate = true;
      }
      $scope.enableAddComments = function (supplier) {
        $scope.supplierShorlistedSpaceId = supplier.shortlisted_space_id;
        $scope.societyNameForComments = supplier.supplier.society_name;
      }
      $scope.getPermissionBoxImages = function (supplier) {
        $scope.supplierNameForPermBox = supplier.society_name;
        DashboardService.getPermissionBoxImages($scope.campaignId, supplier.supplier_id)
          .then(function onSuccess(response) {
            if (response.data.data.length) {
              angular.forEach(response.data.data, function (data) {
                data['image_url'] = 'http://androidtokyo.s3.amazonaws.com/' + data.image_path;
              })
              $('#imageModalForPermBox').modal('show');
            } else {
              swal(constants.name, constants.image_empty, constants.warning);
            }
            $scope.perBoxImageData = response.data.data;

          }).catch(function onError(response) {
            console.log(response);
          })
      }

      $scope.sendBookingEmails = function () {
        $scope.emailBtnDisabled = true;
        cfpLoadingBar.start();
        if ($scope.emailModel.selected == 'listOfSupplier') {
          DashboardService.sendListOfSuppliersEmail($scope.proposalId, $scope.emailModel.email)
            .then(function onSuccess(response) {
              $scope.emailModel = {};
              $scope.emailBtnDisabled = false;
              cfpLoadingBar.complete();
              swal(constants.name, constants.email_success, constants.success);
            }).catch(function onError(response) {
              console.log(response);
              $scope.emailBtnDisabled = false;
              cfpLoadingBar.complete();
            })
        } else if ($scope.emailModel.selected == 'activationOfSupplier') {
          DashboardService.sendActivationOfSuppliersEmail($scope.proposalId, $scope.emailModel.email)
            .then(function onSuccess(response) {
              $scope.emailModel = {};
              $scope.emailBtnDisabled = false;
              cfpLoadingBar.complete();
              swal(constants.name, constants.email_success, constants.success);
            }).catch(function onError(response) {
              console.log(response);
              $scope.emailBtnDisabled = false;
              cfpLoadingBar.complete();
            })
        } else if ($scope.emailModel.selected == 'pipelineOfSupplier') {
          DashboardService.sendPipelinedSuppliersEmail($scope.proposalId, $scope.emailModel.email)
            .then(function onSuccess(response) {
              $scope.emailModel = {};
              $scope.emailBtnDisabled = false;
              cfpLoadingBar.complete();
              swal(constants.name, constants.email_success, constants.success);
            }).catch(function onError(response) {
              console.log(response);
              $scope.emailBtnDisabled = false;
              cfpLoadingBar.complete();
            })
        }
      }
      $scope.sendConfirmBookingEmails = function () {
        $scope.emailBtnDisabled = true;
        cfpLoadingBar.start();
        if ($scope.emailModel.selected == 'listOfSupplier') {
          DashboardService.sendListOfSuppliersConfirmEmail($scope.proposalId)
            .then(function onSuccess(response) {
              $scope.emailModel = {};
              $scope.emailBtnDisabled = false;
              cfpLoadingBar.complete();
              swal(constants.name, constants.email_success, constants.success);
            }).catch(function onError(response) {
              console.log(response);
              $scope.emailBtnDisabled = false;
              cfpLoadingBar.complete();
            })
        } else if ($scope.emailModel.selected == 'activationOfSupplier') {
          DashboardService.sendActivationOfSuppliersConfirmEmail($scope.proposalId)
            .then(function onSuccess(response) {
              $scope.emailModel = {};
              $scope.emailBtnDisabled = false;
              cfpLoadingBar.complete();
              swal(constants.name, constants.email_success, constants.success);
            }).catch(function onError(response) {
              console.log(response);
              $scope.emailBtnDisabled = false;
              cfpLoadingBar.complete();
            })
        } else if ($scope.emailModel.selected == 'pipelineOfSupplier') {
          DashboardService.sendPipelinedSuppliersConfirmEmail($scope.proposalId)
            .then(function onSuccess(response) {
              $scope.emailModel = {};
              $scope.emailBtnDisabled = false;
              cfpLoadingBar.complete();
              swal(constants.name, constants.email_success, constants.success);
            }).catch(function onError(response) {
              console.log(response);
              $scope.emailBtnDisabled = false;
              cfpLoadingBar.complete();
            })
        }
      }

      $scope.Sort = function (val) {
        if ($scope.sort == val) {
          $scope.reversesort = !$scope.reversesort;
          //return;
        }
        $scope.sort = val;
        $('td a i').each(function () {
          //alert(this.className);
          $(this).removeClass().addClass('icon-sort');
        });

      };


      $scope.SortColumn = function (val) {
        if ($scope.sortColumn == val) {
          $scope.reversesortcolumn = !$scope.reversesortcolumn;
          //return;
        }
        $scope.sortColumn = val;
        $('td a i').each(function () {
          //alert(this.className);
          $(this).removeClass().addClass('icon-sort');
        });

      };
      

      $scope.getCampaignWiseSummary = function () {
        $scope.getVendorWiseSummary();
        $scope.getDynamicGraphsStatics();
        cfpLoadingBar.start();
        DashboardService.getCampaignWiseSummary()
          .then(function onSuccess(response) {
            $scope.showPerfMetrics = $scope.perfMetrics.overall;
            $scope.selectAllCampaignLeads = true;
            $scope.dynamicGraphsUI = true;
            $scope.showReportBtn = true;
            $scope.lineChartForLeadsDistributedGraphs = false;
            $scope.lineChartForHotLeadsDistributedGraphs = false;
            $scope.campaignSummary = response.data.data;
            $scope.WeeklyMISOverallSummary = response.data.data.overall;
            $scope.WeeklyMISLastWeekSummary = response.data.data.last_week;
            $scope.WeeklyMISLast2WeekSummary = response.data.data.last_two_weeks;
            $scope.WeeklyMISLast3WeekSummary = response.data.data.last_three_weeks;
            $scope.overallCampaignSummary = response.data.data.overall.campaign_wise;
            $scope.lastWeekCampaignSummary = response.data.data.last_week.campaign_wise;
            $scope.last2WeeksCampaignSummary = response.data.data.last_two_weeks.campaign_wise;
            $scope.last3WeeksCampaignSummary = response.data.data.last_three_weeks.campaign_wise;

            $scope.stackedBarChartLocationWise = angular.copy(locationSummaryBarChart);
            $scope.OverallSummaryStackedBarChart = angular.copy(overallSummaryStackedBar);
            $scope.thisWeekSummaryStackedBarChart = angular.copy(thisWeekSummaryStackedBar);
            $scope.last2WeekSummaryStackedBarChart = angular.copy(last2WeekSummaryStackedBar);
            $scope.last3WeekSummaryStackedBarChart = angular.copy(last3WeekSummaryStackedBar);


            if (Object.keys($scope.overallCampaignSummary).length > 4) {
              $scope.OverallSummaryStackedBarChart.chart['width'] = Object.keys($scope.overallCampaignSummary).length * 100;
            }
            
            $scope.stackedBarAllCampaignWiseChart = formatAllCampaignWiseChart($scope.overallCampaignSummary);
            $scope.stackedBarLastWeekChart = formatLastWeekWiseChart($scope.lastWeekCampaignSummary);
            $scope.stackedBarLast2WeeksChart = formatLast2WeekWiseChart($scope.last2WeeksCampaignSummary);
            $scope.stackedBarLast3WeeksChart = formatLast3WeekWiseChart($scope.last3WeeksCampaignSummary);

            cfpLoadingBar.complete();
          }).catch(function onError(response) {
            console.log(response);
          })
      }


      var formatAllCampaignWiseChart = function (data) {
        var values1 = [];
        var values2 = [];
        angular.forEach(data, function (data, key) {
          if (data.flat_count != 0) {
            $scope.hotLeadsValues = data.interested / data.flat_count * 100;
            $scope.normalLeadsValues = data.total / data.flat_count * 100;
          }
          else {
            $scope.hotLeadsValues = data.interested;
            $scope.normalLeadsValues = data.total;

          }
          var keyWithFlatLabel = data.name + ' (' + data.flat_count + ')';
          var value1 =
            { x: keyWithFlatLabel, y: $scope.normalLeadsValues };
          var value2 =
            { x: keyWithFlatLabel, y: $scope.hotLeadsValues };
          values1.push(value1);
          values2.push(value2);


        })

        var temp_data = [
          {
            key: "Total Leads in %",
            color: constants.colorKey1,
            values: values1
          },
          {
            key: "High Potential Leads in %",
            color: constants.colorKey2,
            values: values2
          }
        ];

        return temp_data;
      }

      var formatLastWeekWiseChart = function (data) {
        var values1 = [];
        var values2 = [];
        angular.forEach(data, function (data, key) {
          if (data.flat_count != 0) {
            $scope.hotLeadsValues = data.interested / data.flat_count * 100;
            $scope.normalLeadsValues = data.total / data.flat_count * 100;
          }
          else {
            $scope.hotLeadsValues = data.interested;
            $scope.normalLeadsValues = data.total;

          }
          var keyWithFlatLabel = data.name + ' (' + data.flat_count + ')';
          var value1 =
            { x: keyWithFlatLabel, y: $scope.normalLeadsValues };
          var value2 =
            { x: keyWithFlatLabel, y: $scope.hotLeadsValues };
          values1.push(value1);
          values2.push(value2);


        })

        var temp_data = [
          {
            key: "Total Leads in %",
            color: constants.colorKey1,
            values: values1
          },
          {
            key: "High Potential Leads in %",
            color: constants.colorKey2,
            values: values2
          }
        ];

        return temp_data;
      }

      var formatLast2WeekWiseChart = function (data) {
        var values1 = [];
        var values2 = [];
        angular.forEach(data, function (data, key) {
          if (data.flat_count != 0) {
            $scope.hotLeadsValues = data.interested / data.flat_count * 100;
            $scope.normalLeadsValues = data.total / data.flat_count * 100;
          }
          else {
            $scope.hotLeadsValues = data.interested;
            $scope.normalLeadsValues = data.total;

          }
          var keyWithFlatLabel = data.name + ' (' + data.flat_count + ')';
          var value1 =
            { x: keyWithFlatLabel, y: $scope.normalLeadsValues };
          var value2 =
            { x: keyWithFlatLabel, y: $scope.hotLeadsValues };
          values1.push(value1);
          values2.push(value2);


        })

        var temp_data = [
          {
            key: "Total Leads in %",
            color: constants.colorKey1,
            values: values1
          },
          {
            key: "High Potential Leads in %",
            color: constants.colorKey2,
            values: values2
          }
        ];

        return temp_data;
      }

      var formatLast3WeekWiseChart = function (data) {
        var values1 = [];
        var values2 = [];
        angular.forEach(data, function (data, key) {
          if (data.flat_count != 0) {
            $scope.hotLeadsValues = data.interested / data.flat_count * 100;
            $scope.normalLeadsValues = data.total / data.flat_count * 100;
          }
          else {
            $scope.hotLeadsValues = data.interested;
            $scope.normalLeadsValues = data.total;

          }
          var keyWithFlatLabel = data.name + ' (' + data.flat_count + ')';
          var value1 =
            { x: keyWithFlatLabel, y: $scope.normalLeadsValues };
          var value2 =
            { x: keyWithFlatLabel, y: $scope.hotLeadsValues };
          values1.push(value1);
          values2.push(value2);


        })

        var temp_data = [
          {
            key: "Total Leads in %",
            color: constants.colorKey1,
            values: values1
          },
          {
            key: "High Potential Leads in %",
            color: constants.colorKey2,
            values: values2
          }
        ];

        return temp_data;
      }


      $scope.exportData = function () {
        $('#customer1').tableExport({ type: 'csv', escape: 'false' });
        $('#customer2').tableExport({ type: 'csv', escape: 'false' });
        $('#customer3').tableExport({ type: 'csv', escape: 'false' });
        $('#customer4').tableExport({ type: 'csv', escape: 'false' });
        $('#customer5').tableExport({ type: 'csv', escape: 'false' });
        $('#customer6').tableExport({ type: 'csv', escape: 'false' });


      };

      $scope.exportToExcel = function (tableId) { // ex: '#my-table'
        var exportHref = Excel.tableToExcel(tableId, 'WireWorkbenchDataExport');
        $timeout(function () { location.href = exportHref; }, 100); // trigger download
      }


      $scope.getDistributionGraphsStatics = function () {
        var data = {
          "data_scope": {
            "1": {
              "category": "unordered", "level": "campaign", "match_type": 0,
              "values": { "exact": [$scope.campaignIdForPerfMetrics] }, "value_type": "campaign"
            }
          },
          "data_point": {
            "category": "unordered",
            "level": ["supplier", "campaign"]
          },
          "raw_data": ["lead", "hot_lead", "flat"],
          "metrics": [["1", "3", "/"], ["m1", 100, "*"], ["2", "3", "/"], ["m3", 100, "*"]],
          // "metrics": [["2","3","/"],["m1",100,"*"]],
          // "metrics" :[["1","3","/"],["2","3","/"],["m1","100","*"],["m2","100","*"]],
          "statistical_information": { "stats": ["z_score"], "metrics": ["m1", "m3"] },
          "higher_level_statistical_information": {
            "level": ["campaign"], "stats": ["frequency_distribution", "mean", "variance_stdev"],
            "metrics": ["m2", "m4"]
          }
        }


        DashboardService.getDistributionGraphsStatics(data)
          .then(function onSuccess(response) {
            console.log(response);
            
            $scope.lineChartLeadsDistributed = angular.copy(lineChartLeads);
            $scope.lineChartLeadsDistributed.chart.xAxis.axisLabel = "Frequency Distribution Graph(Leads)";
            $scope.lineChartLeadsDistributed.chart.yAxis.axisLabel = "Mode(Leads)";
            $scope.lineChartLeadsDistributed2 = angular.copy(lineChartLeads);
            $scope.lineChartLeadsDistributed2.chart.xAxis.axisLabel = "Frequency Distribution Graph(Hot Leads)";
            $scope.lineChartLeadsDistributed2.chart.yAxis.axisLabel = "Mode(Hot Leads)";

            $scope.lineChartForLeadsDistributedGraphs = formatLineChartForLeadsDistributedGraph(response.data.data);
            $scope.lineChartForLeadsDistributedGraphs2 = formatLineChartForLeadsDistributedGraph2(response.data.data);
            

            $scope.selectAllCampaignLeads = false;
          }).catch(function onError(response) {
            console.log(response);
          })
      }


      var formatLineChartForLeadsDistributedGraph = function (data) {
        var values1 = [];
        var values2 = [];
        var index = 0;
        $scope.x_fre_leads = [];
        $scope.standardDeviationLeads = data.higher_group_data[0]['stdev_lead/flat*100'];
        $scope.standardDeviationHotLeads = data.higher_group_data[0]['stdev_hot_lead/flat*100'];
        $scope.varianceLeads = data.higher_group_data[0]['variance_lead/flat*100'];
        $scope.varianceHotLeads = data.higher_group_data[0]['variance_hot_lead/flat*100'];

        angular.forEach(data.higher_group_data[0]['freq_dist_lead/flat*100'], function (modeData, key) {

          if (index == 0) {
            var value1 =
              { x: index, y: 0 };
            values1.push(value1);
            var value2 =
              { x: index, y: 0 };
            values2.push(value2);
            $scope.x_fre_leads.push('0');
            index++;
          }
          $scope.x_fre_leads.push(key);
          if (modeData.hasOwnProperty('mode')) {
            var value1 =
              { x: index, y: modeData.mode };

            values1.push(value1);
          } else {
            var value1 =
              { x: index, y: 0 };

            values1.push(value1);
          }
          if (data.higher_group_data[0]['freq_dist_lead/flat*100'][key].hasOwnProperty('mode')) {
            var value2 =
              { x: index, y: data.higher_group_data[0]['freq_dist_lead/flat*100'][key].mode };
            values2.push(value2);
          } else {
            var value2 =
              { x: index, y: 0 };

            values2.push(value2);
          }
          index++;

        })

        var temp_data = [
          {
            key: "Leads (Mean) %",
            color: constants.colorKey1,
            values: values1
          },
          // {
          //   key: "Hot Leads (Mean) %",
          //   color: constants.colorKey2,
          //   values: values2
          // }
        ];

        return temp_data;
      }

      var formatLineChartForLeadsDistributedGraph2 = function (data) {
        var values1 = [];
        var values2 = [];
        var index = 0;
        $scope.x_fre_leads = [];
        $scope.standardDeviationLeads = data.higher_group_data[0]['stdev_lead/flat*100'];
        $scope.standardDeviationHotLeads = data.higher_group_data[0]['stdev_hot_lead/flat*100'];
        $scope.varianceLeads = data.higher_group_data[0]['variance_lead/flat*100'];
        $scope.varianceHotLeads = data.higher_group_data[0]['variance_hot_lead/flat*100'];

        angular.forEach(data.higher_group_data[0]['freq_dist_hot_lead/flat*100'], function (modeData, key) {

          if (index == 0) {
            var value1 =
              { x: index, y: 0 };
            values1.push(value1);
            var value2 =
              { x: index, y: 0 };
            values2.push(value2);
            $scope.x_fre_leads.push('0');
            index++;
          }
          $scope.x_fre_leads.push(key);
          if (modeData.hasOwnProperty('mode')) {
            var value1 =
              { x: index, y: modeData.mode };

            values1.push(value1);
          } else {
            var value1 =
              { x: index, y: 0 };

            values1.push(value1);
          }
          if (data.higher_group_data[0]['freq_dist_hot_lead/flat*100'][key].hasOwnProperty('mode')) {
            var value2 =
              { x: index, y: data.higher_group_data[0]['freq_dist_hot_lead/flat*100'][key].mode };
            values2.push(value2);
          } else {
            var value2 =
              { x: index, y: 0 };

            values2.push(value2);
          }
          index++;

        })

        var temp_data = [
          // {
          //   key: "Leads (Mean) %",
          //   color: constants.colorKey1,
          //   values: values1
          // },
          {
            key: "Hot Leads (Mean) %",
            color: constants.colorKey2,
            values: values2
          }
        ];

        return temp_data;
      }


      $scope.getPrintLeadsInExcelData = function (campaignId) {
        var campaignIdForExcel = campaignId;
        $scope.getFormDetails($scope.campaignIdForLeads);
        getShortlistedSuppliers($scope.campaignIdForLeads);
      }
      var getShortlistedSuppliers = function (campaignId) {
        var supplier_code = 'RS';
        DashboardService.getShortlistedSuppliers(campaignId, supplier_code)
          .then(function onSuccess(response) {
            $scope.shortlistedSuppliers = response.data.data;
          }).catch(function onError(response) {
            console.log(response);
          })
      }

      $scope.printLeadsInExcel = function () {

        DashboardService.printLeadsInExcel($scope.printLeadsInExcelData)
          .then(function onSuccess(response) {
            var link = document.createElement("a");
            link.download = "mydata.xlsx";
            link.href = response.data.data;
            link.click();
          }).catch(function onError(response) {
            console.log(response);
          })
      }

      $scope.rotateImage = function (id) {
        var index = 0;
        var id = '#img_test' + id;
        index = index + 1;
        if (index % 4 == 0) {
          $(id).toggleClass('rotateImage0');
        } else if (index % 4 == 1) {
          $(id).toggleClass('rotateImage90');
        } else if (index % 4 == 2) {
          $(id).toggleClass('rotateImage180');
        } else if (index % 4 == 3) {
          $(id).toggleClass('rotateImage270');
        }


      }


      $scope.getDynamicGraphsStatics = function () {
        $scope.selectAllCampaignLeads = false;
        $scope.showReportBtn = false;
        $scope.lineChartForLeadsDistributedGraphs = false;
        $scope.lineChartForHotLeadsDistributedGraphs = false;
      }

      $scope.dynamicData = {
        'data_scope': {
          '1': {
            'values': {}
          },
        },
        'data_point': {
          'level': [],
        },
        'raw_data': [],
        'metrics': [],
        'statistical_information': {
          'stats': ["z_score"],
          'metrics': []
        },
      }
      $scope.myModel = [];
      $scope.myModel1 = [];

      $scope.getLevelValues = function (value) {
        $scope.dynamicValues = [];
        $scope.myModel = [];
        if (value == 'campaign') {
          getCampaignsWiseForCity();
        }

        if (value == 'vendor') {
          $scope.getCampaignsByVendor();
        }
      }
      $scope.getRawDataValue = function (value, type) {
        if (value) {
          $scope.dynamicData.raw_data.push(type);
        } else {
          var index = $scope.dynamicData.raw_data.indexOf(type);
          if (index > -1) {
            $scope.dynamicData.raw_data.splice(index, 1);
          }
        }
      }
      $scope.metricsData = {};
      $scope.addMetrics = function () {
        if ($scope.metricsData) {
          var data = [$scope.metricsData.firstValue, $scope.metricsData.secondValue, $scope.metricsData.operator];
          $scope.dynamicData.metrics.push(data);
        }
      }
      $scope.removeMetrics = function (index) {
        $scope.dynamicData.metrics.splice($index, 1);
      }

      $scope.getDynamicGraphData = function () {
        $scope.showGraph = true;
        if ($scope.myModel.length) {
          $scope.dynamicData.data_scope['1'].values['exact'] = [];
          angular.forEach($scope.myModel, function (data) {
            if ($scope.dynamicData.data_scope['1'].level == 'campaign')
              $scope.dynamicData.data_scope['1'].values['exact'].push(data.campaign_id);
            else if ($scope.dynamicData.data_scope['1'].level == 'city') {
              $scope.dynamicData.data_scope['1'].values['exact'].push(data.name);
            }
            else if ($scope.dynamicData.data_scope['1'].level == 'vendor') {
              $scope.dynamicData.data_scope['1'].values['exact'].push(data.value);
            }
          })
        }
        // $scope.dynamicData.data_scope['1'].values['exact'] = $scope.myModel;
        if ($scope.dynamicData.data_scope['1'].values['exact'].length) {
          DashboardService.getDistributionGraphsStatics($scope.dynamicData)
            .then(function onSuccess(response) {
              $scope.stackedBarChartForDynamic = angular.copy(stackedBarChart);
              $scope.stackedBarChartDynamicData = formatDynamicData(response.data.data, orderSpecificCase);
            }).catch(function onError(response) {
              console.log(response);
            })
        }
      }

      $scope.getLevelDataValue = function (value, type) {
        if (value) {
          $scope.dynamicData.data_point['level'].push(type);
        } else {
          var index = $scope.dynamicData.data_point['level'].indexOf(type);
          if (index > -1) {
            $scope.dynamicData.data_point['level'].splice(index, 1);
          }
        }
      }
      $scope.getYValueFromData = function (value, type) {
        if (value) {
          $scope.yValues.push(type);
        } else {
          var index = $scope.yValues.indexOf(type);
          if (index > -1) {
            $scope.yValues.splice(index, 1);
          }
        }
      }

      
      $scope.yValues = [];
      var maxYValue = 0;
      var maxYValueSummary = 0;
      $scope.xValues = {
        value: ''
      };
      var tooltipDynamicGraphData = [];
      var tooltipDynamicGraphDataSummary = [];
      var formatDynamicData = function (data, dataOrder) {

        var values1 = {};
        var labels = [];
        var finalData = [];
        tooltipDynamicGraphData = [];
        if (specificXValue) {
          $scope.specificXValueLabel = specificXValue;
        }

        if (!dataOrder) {
          angular.forEach(data.lower_group_data, function (data1, key) {

            tooltipDynamicGraphData.push(data1);
            $scope.FlatCountOVerallLowerORderGroup = data1.flat;

            if (selectedSpecificItems.indexOf(data1[$scope.xValues.value]) > -1 || !selectedSpecificItems.length) {
              angular.forEach($scope.yValues, function (itemKey, index, item) {
                if (!values1.hasOwnProperty(itemKey)) {
                  values1[itemKey] = [];
                }
                if (specificXValue) {
                  if (data1[$scope.xValues.value] != null) {
                    var temp_label = data1[$scope.xValues.value] +
                      " (" + data1[specificXValue] + ")" +
                      " (" + $scope.FlatCountOVerallLowerORderGroup + ")";
                    if (specificXValue2) {
                      var temp_label = data1[$scope.xValues.value] +
                        ", " + data1[specificXValue2] +
                        "( " + data1[specificXValue] + " )" + " (" +
                        $scope.FlatCountOVerallLowerORderGroup + ")";
                    }

                    setMaxYValue(data1[itemKey]);
                    var temp = {
                      x: temp_label,
                      y: data1[itemKey] || 0
                    }
                    values1[itemKey].push(temp);
                  }

                } else {
                  if (data1[$scope.xValues.value] != null) {
                    setMaxYValue(data1[itemKey]);
                    var temp = {
                      x: data1[$scope.xValues.value] + "(" + $scope.FlatCountOVerallLowerORderGroup
                      + ")",
                      y: data1[itemKey] || 0
                    }
                    values1[itemKey].push(temp);
                  }
                }
              })
            }


          })
          angular.forEach($scope.yValues, function (itemKey) {
            
            var temp_data = {
              key: $scope.dynamicGraphYValuesMap[itemKey],
              values: values1[itemKey]
            }
            finalData.push(temp_data);
          })

        } else {
          angular.forEach(data.higher_group_data, function (data1, key) {

            tooltipDynamicGraphData.push(data1);
            $scope.FlatCountOVerallLowerORderGroup = data1.flat;

            if (selectedSpecificItems.indexOf(data1[$scope.xValues.value]) > -1 || !selectedSpecificItems.length) {
              angular.forEach($scope.yValues, function (itemKey, index, item) {
                if (!values1.hasOwnProperty(itemKey)) {
                  values1[itemKey] = [];
                }
                if (specificXValue) {
                  if (data[$scope.xValues.value] != null) {
                    var temp_label = data1[$scope.xValues.value] +
                      " (" + data1[specificXValue] + ")" +
                      " (" + $scope.FlatCountOVerallLowerORderGroup + ")";
                    if (specificXValue2) {
                      var temp_label = data1[$scope.xValues.value] +
                        ", " + data1[specificXValue2] +
                        "( " + data1[specificXValue] + " )" + " (" +
                        $scope.FlatCountOVerallLowerORderGroup + ")";
                    }
                    setMaxYValue(data1[itemKey]);
                    var temp = {
                      x: temp_label,
                      y: data1[itemKey] || 0
                    }
                    values1[itemKey].push(temp);
                  }

                } else {
                  if (data1[$scope.xValues.value] != null) {
                    setMaxYValue(data1[itemKey]);
                    var temp = {
                      x: data1[$scope.xValues.value] + " (" +
                      $scope.FlatCountOVerallLowerORderGroup + ")",
                      y: data1[itemKey] || 0
                    }
                    values1[itemKey].push(temp);
                  }
                }
              })
            }


          })
          angular.forEach($scope.yValues, function (itemKey) {
            var temp_data = {
              key: $scope.dynamicGraphYValuesMap[itemKey],
              values: values1[itemKey]
            }
            finalData.push(temp_data);
          })

        }

        $scope.stackedBarChartForDynamic.chart.forceY[1] = maxYValue+2;
        
        return finalData;
      }
      var setMaxYValue = function(value){
        if(value > maxYValue){
          maxYValue = value;
        }
      }
      var setMaxYValueSummary = function(value){
        if(value > maxYValueSummary){
          maxYValueSummary = value;
        }
      }
      $scope.clearMetrics = function () {
        $scope.dynamicData.metrics = [];
      }
      $scope.clearSubLevel = function () {
        $scope.dynamicData.data_point.sublevel = undefined;
      }
      $scope.graphSelection = {
        category: {},
        dateRange: {},
        phaseRange: {},
        specificParam: {
          society: {},
          booking: {},
        },
        Yvalues: {
          leadsPerc: true,
          hotleadsPerc: true,
          // costPerLeads: false,
          // costPerHotLeads: false,
          meetingCompletedPerc: true,
          conversionPerc: true
        }
      };
      $scope.yValues = ["lead/flat*100", "hot_lead/flat*100", "total_booking_confirmed/flat*100", "total_orders_punched/flat*100"];
      var specificXValue = undefined;
      var specificXValue2 = undefined;
      var orderSpecificCase = false;
      $scope.getGenericGraphData = function () {
        cfpLoadingBar.start();

        specificXValue = undefined;
        specificXValue2 = undefined;
        orderSpecificCase = false;
        $scope.cumulativeOrder = false;
        
        if ($scope.selectedDynamicCampaigns.length) {
          $scope.graphSelection.category = 'campaign';
        }
        if ($scope.selectedVendors.length) {
          $scope.graphSelection.category = 'vendor';
        }
        if ($scope.selectedTypeOfSocieties.length) {
          $scope.graphSelection.category = 'qualitytype';

        }
        if ($scope.selectedbookingParameters.length) {
          $scope.graphSelection.category = $scope.BookingParametersLists.value;
        }

        if ($scope.selectedSizeOfFlats.length) {
          $scope.graphSelection.category = 'flattype';
        }

        if ($scope.graphSelection.dateRange.startDate &&
          ($scope.selectedTypeOfSocieties.length && $scope.selectedSizeOfFlats.length
            && $scope.selectedDynamicCampaigns.length)) {
          // alert("Date range + society parameter(society and Flat - together) and City Campaign Selected");
          $scope.xValues.value = 'qualitytype';
          // $scope.xValues.value = 'flattype';
          specificXValue = 'campaign_name';
          specificXValue2 = 'flattype';
          var reqData = {
            "data_scope": {
              "1":
              {
                "category": "unordered", "level": "campaign", "match_type": 0,
                "values": { "exact": [] },
                "value_type": "campaign"

              },
              "2": {
                "category": "time", "level": "time", "match_type": 1,
                "values": { "range": [] },
                "value_type": "time"

              }
            },
            "data_point": {
              "category": "unordered", "level": ["qualitytype", "flattype"],
              "value_ranges": { "flattype": [], "qualitytype": [] }
            },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global,
          }
          angular.forEach($scope.selectedDynamicCampaigns, function (data) {
            reqData.data_scope['1'].values.exact.push(data.campaign_id);
          });
          angular.forEach($scope.selectedTypeOfSocieties, function (data) {
            reqData.data_point.value_ranges.qualitytype.push(data.name);
          });
          angular.forEach($scope.selectedSizeOfFlats, function (data) {
            reqData.data_point.value_ranges.flattype.push(data.name);
          });
          reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.startDate));
          reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.endDate));
        } else if ($scope.graphSelection.dateRange.startDate &&
          ($scope.selectedTypeOfSocieties.length && $scope.selectedSizeOfFlats.length
            && $scope.selectedDynamicCampaigns.length)) {
          // alert("Date range + society parameter(society and Flat - together) and Vendor Campaign Selected");
          $scope.xValues.value = 'qualitytype';
          // $scope.xValues.value = 'flattype';
          specificXValue = 'campaign_name';
          specificXValue2 = 'flattype';
          var reqData = {
            "data_scope": {
              "1":
              {
                "category": "unordered", "level": "campaign", "match_type": 0,
                "values": { "exact": [] },
                "value_type": "campaign"

              },
              "2": {
                "category": "time", "level": "time", "match_type": 1,
                "values": { "range": [] },
                "value_type": "time"

              }
            },
            "data_point": {
              "category": "unordered", "level": ["qualitytype", "flattype"],
              "value_ranges": { "flattype": [], "qualitytype": [] }
            },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global,
          }
          angular.forEach($scope.selectedDynamicCampaigns, function (data) {
            reqData.data_scope['1'].values.exact.push(data.campaign_id);
          });
          angular.forEach($scope.selectedTypeOfSocieties, function (data) {
            reqData.data_point.value_ranges.qualitytype.push(data.name);
          });
          angular.forEach($scope.selectedSizeOfFlats, function (data) {
            reqData.data_point.value_ranges.flattype.push(data.name);
          });
          reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.startDate));
          reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.endDate));
        } else if ($scope.graphSelection.dateRange.startDate &&
          ($scope.selectedbookingParameters.length && $scope.selectedDynamicCampaigns.length)) {
          // alert("Date range + Booking(multiselect) and City Campaign Selected");

          // specificXValue = 'campaign_name';
          // angular.forEach($scope.selectedbookingParameters, function(data){
          //   console.log(data);
          //    $scope.xValues.value = data.name;
          // });

          // $scope.xValues.value = 'campaign_name';
          // specificXValue2 = 'binary_fields';

          //  specificXValue2 = 'standeetype';
          // specificXValue = 'fliertype';
          // var specficSelectedValue = 0;
          // angular.forEach($scope.selectedbookingParameters, function(data){
          //   console.log(data);
          //   specficSelectedValue = specficSelectedValue + 1;
          //   var dataSpecific = {
          //     "specificXValue" : "specificXValue" + specficSelectedValue,
          //   }
          //   console.log(specficSelectedValue);
          //   console.log(dataSpecific.specificXValue);
          //   var dataValueSpecificKey = data.value;
          //   console.log(dataValueSpecificKey);
          //
          // });
          // $scope.xValues.value = 'campaign_name';

          angular.forEach($scope.selectedbookingParameters, function (data) {
            // specificXValue = data.value;
            // specificXValue = 'campaign_name';
            // $scope.xValues.value = 'binary_fields';
            $scope.xValues.value = 'campaign_name';
            specificXValue = 'binary_fields';
          });

          var reqData = {
            "data_scope": {
              "1":
              {
                "category": "unordered", "level": "campaign", "match_type": 0,
                "values": { "exact": [] },
                "value_type": "campaign"

              },
              "2": {
                "category": "time", "level": "time", "match_type": 1,
                "values": { "range": [] },
                "value_type": "time"

              }
            },
            "data_point": {
              "category": "unordered", "level": [],
              "custom_binary_field_labels": { "nbpostertype": { "true": "Poster", "false": "No Poster" } }
            },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global,
          }
          angular.forEach($scope.selectedDynamicCampaigns, function (data) {
            reqData.data_scope['1'].values.exact.push(data.campaign_id);
          });
          angular.forEach($scope.selectedbookingParameters, function (data) {
            reqData.data_point.level.push(data.value);
          });
          reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.startDate));
          reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.endDate));
        }

        else if ($scope.graphSelection.dateRange.startDate &&
          ($scope.selectedTypeOfSocieties.length &&
            $scope.selectedDynamicCampaigns.length)) {
          // alert("Date range + society parameter(society) and Campaign Selected");
          $scope.xValues.value = 'qualitytype';
          specificXValue = 'campaign_name';
          var reqData = {
            "data_scope": {
              "1":
              {
                "category": "unordered", "level": "campaign", "match_type": 0,
                "values": { "exact": [] },
                "value_type": "campaign"

              },
              "2": {
                "category": "time", "level": "time", "match_type": 1,
                "values": { "range": [] },
                "value_type": "time"

              }
            },
            "data_point": {
              "category": "unordered", "level": ["qualitytype"],
              "value_ranges": { "qualitytype": [] }
            },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global,
          }
          angular.forEach($scope.selectedDynamicCampaigns, function (data) {
            reqData.data_scope['1'].values.exact.push(data.campaign_id);
          });
          angular.forEach($scope.selectedTypeOfSocieties, function (data) {
            reqData.data_point.value_ranges.qualitytype.push(data.name);
          });
          reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.startDate));
          reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.endDate));
        }

        else if ($scope.graphSelection.dateRange.startDate &&
          ($scope.selectedSizeOfFlats.length &&
            $scope.selectedDynamicCampaigns.length)) {
          // alert("Date range + society parameter(flat) and Campaign Selected");
          $scope.xValues.value = 'flattype';
          specificXValue = 'campaign_name';
          var reqData = {
            "data_scope": {
              "1":
              {
                "category": "unordered", "level": "campaign", "match_type": 0,
                "values": { "exact": [] },
                "value_type": "campaign"

              },
              "2": {
                "category": "time", "level": "time", "match_type": 1,
                "values": { "range": [] },
                "value_type": "time"

              }
            },
            "data_point": {
              "category": "unordered", "level": ["flattype"],
              "value_ranges": { "flattype": [] }
            },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global,
          }
          angular.forEach($scope.selectedDynamicCampaigns, function (data) {
            reqData.data_scope['1'].values.exact.push(data.campaign_id);
          });
          angular.forEach($scope.selectedSizeOfFlats, function (data) {
            reqData.data_point.value_ranges.flattype.push(data.name);
          });
          reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.startDate));
          reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.endDate));
        }
        else if (!$scope.graphSelection.dateRange.startDate &&
          ($scope.selectedSizeOfFlats.length &&
            $scope.selectedTypeOfSocieties.length && $scope.selectedCities_temp.length
            && $scope.selectedDynamicCampaigns.length)) {
          // alert("only society type and Campaign Selected and Flat Type");
          $scope.xValues.value = 'qualitytype';
          // $scope.xValues.value = 'flattype';
          specificXValue = 'campaign_name';
          specificXValue2 = 'flattype';
          var reqData = {
            "data_scope": {
              "1": {
                "category": "unordered", "level": "campaign", "match_type": 0,
                "values": { "exact": [] }, "value_type": "campaign"
              }
            },
            "data_point": {
              "category": "unordered", "level": ["qualitytype", "flattype"],
              "value_ranges": { "flattype": [], "qualitytype": [] }
            },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global,
          }
          angular.forEach($scope.selectedDynamicCampaigns, function (data) {
            reqData.data_scope['1'].values.exact.push(data.campaign_id);
          });
          angular.forEach($scope.selectedTypeOfSocieties, function (data) {
            reqData.data_point.value_ranges.qualitytype.push(data.name);
          });
          angular.forEach($scope.selectedSizeOfFlats, function (data) {
            reqData.data_point.value_ranges.flattype.push(data.name);
          });
        }
        else if (!$scope.graphSelection.dateRange.startDate &&
          ($scope.selectedTypeOfSocieties.length && $scope.selectedCities_temp.length
            && $scope.selectedDynamicCampaigns.length)) {
          // alert("only society type and Campaign Selected");
          $scope.xValues.value = 'qualitytype';
          // $scope.xValues.value = 'flattype';
          specificXValue = 'campaign_name';

          var reqData = {
            "data_scope": {
              "1": {
                "category": "unordered", "level": "campaign", "match_type": 0,
                "values": { "exact": [] }, "value_type": "campaign"
              }
            },
            "data_point": {
              "category": "unordered", "level": ["qualitytype"],
              "value_ranges": { "qualitytype": [] }
            },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global,
          }
          angular.forEach($scope.selectedDynamicCampaigns, function (data) {
            reqData.data_scope['1'].values.exact.push(data.campaign_id);
          });
          angular.forEach($scope.selectedTypeOfSocieties, function (data) {
            reqData.data_point.value_ranges.qualitytype.push(data.name);
          });

        }
        else if (!$scope.graphSelection.dateRange.startDate &&
          ($scope.selectedSizeOfFlats.length && $scope.selectedCities_temp.length
            && $scope.selectedDynamicCampaigns.length)) {
          // alert("only flat type and Campaign Selected");
          $scope.xValues.value = 'flattype';
          // $scope.xValues.value = 'flattype';
          specificXValue = 'campaign_name';

          var reqData = {
            "data_scope": {
              "1": {
                "category": "unordered", "level": "campaign", "match_type": 0,
                "values": { "exact": [] }, "value_type": "campaign"
              }
            },
            "data_point": {
              "category": "unordered", "level": ["flattype"],
              "value_ranges": { "flattype": [] }
            },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global,
          }
          angular.forEach($scope.selectedDynamicCampaigns, function (data) {
            reqData.data_scope['1'].values.exact.push(data.campaign_id);
          });
          angular.forEach($scope.selectedSizeOfFlats, function (data) {
            reqData.data_point.value_ranges.flattype.push(data.name);
          });

        }
        else if (!$scope.graphSelection.dateRange.startDate && ($scope.graphSelection.phaseRange.length
          && $scope.selectedDynamicCampaigns.length
        )) {
          // alert("only Phase Range and Campaign Selected");
          $scope.xValues.value = 'campaign_name';
          var reqData = {
            "data_scope": {
              "1":
              {
                "category": "unordered", "level": "campaign", "match_type": 0,
                "values": { "exact": [] },
                "value_type": "campaign"
              }
            },
            "data_point": {
              "category": "time", "level": ["date"], "sublevel": "phase",
              "value_ranges": { "phase": [] }, "range_type": 1
            },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global
          }
          angular.forEach($scope.selectedDynamicCampaigns, function (data) {
            reqData.data_scope['1'].values.exact.push(data.campaign_id);
          });
          reqData.data_point.value_ranges.phase.push(commonDataShare.formatDate($scope.graphSelection.phaseRange.start));
          reqData.data_point.value_ranges.phase.push(commonDataShare.formatDate($scope.graphSelection.phaseRange.end));

        }
        else if ($scope.graphSelection.dateRange.startDate && (
          $scope.graphSelection.category == 'vendor' &&
          $scope.selectedVendors.length)) {
          // alert("only Date Range Type and Vendor Selected");
          $scope.xValues.value = 'vendor_name';
          var reqData = {
            "data_scope": {
              "1":
              {
                "category": "unordered", "level": "vendor", "match_type": 0,
                "values": { "exact": [] },
                "value_type": "vendor"

              },
              "2": {
                "category": "time", "level": "time", "match_type": 1,
                "values": { "range": [] },
                "value_type": "time"

              }
            },
            "data_point": { "category": "unordered", "level": ["vendor"] },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global
          }

          angular.forEach($scope.selectedVendors, function (data) {
            reqData.data_scope['1'].values.exact.push($scope.vendorsData[data].vendor_id);
          });
          reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.startDate));
          reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.endDate));
        } else if (
          $scope.selectedDynamicCampaigns.length &&
          $scope.graphSelection.category == 'vendor' &&
          $scope.selectedVendors.length
        ) {          
          $scope.xValues.value = 'campaign_name';
          orderSpecificCase = true;
          $scope.cumulativeOrder = true;
          var reqData = {

            "data_scope": {
              "1":
              {
                "category": "unordered", "level": "campaign", "match_type": 0,
                "values": { "exact": [] },
                "value_type": "campaign"
              },
            },
            "data_point": { "category": "unordered", "level": ["supplier","campaign"] },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global,
            "statistical_information": {
              "stats": [
                "z_score"
              ],
              "metrics": [
                "m1",
                "m3"
              ]
            },
            "higher_level_statistical_information": {
              "level": [
                "campaign"
              ],
              "stats": [
                "frequency_distribution",
                "mean",
                "variance_stdev",
                "sum"
              ],
              "metrics": [
                "m2",
                "m4",
                "m16",
                "m17",
                "m18",
                "m19",
                "m20",
                "m8",
                "m10"
              ]
            }
          }

          if($scope.graphSelection.dateRange.startDate){
            reqData.data_scope['2'] = {
              "category": "time",
              "level": "time",
              "match_type": 1,
              "values": {
                  "range": [
                      
                  ]
              },
              "value_type": "time"
            }
            
            reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.startDate));
            reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.endDate));
          }
          

          angular.forEach($scope.selectedDynamicCampaigns, function (data) {
            reqData.data_scope['1'].values.exact.push(data.campaign_id);
          });

        }

        else if ($scope.selectedSizeOfFlats.length) {
          if ($scope.selectedDynamicCampaigns.length) {
            // alert("only Flat Type selected");
            $scope.xValues.value = 'flattype';
            specificXValue = 'campaign_name';
            var reqData = {
              "data_scope": {
                "1":
                {
                  "category": "unordered", "level": "campaign", "match_type": 0,
                  "values": { "exact": [] },
                  "value_type": "campaign"
                }
              },
              "data_point": {
                "category": "unordered", "level": ["flattype"],
                "value_ranges": { "flattype": [] }
              },
              "raw_data": angular.copy(raw_data_global),
              "metrics": metrics_global,
            }

            angular.forEach($scope.selectedDynamicCampaigns, function (data) {
              reqData.data_scope['1'].values.exact.push(data.campaign_id);
            });
            angular.forEach($scope.selectedSizeOfFlats, function (data) {
              reqData.data_point.value_ranges.flattype.push(data.name);
            });
          }

        }
        else if (
          $scope.selectedCities_temp.length
          && $scope.selectedDynamicCampaigns.length
        ) {
          // alert("only city");
          $scope.xValues.value = 'campaign_name';
          orderSpecificCase = true;
          $scope.cumulativeOrder = true;
          var reqData = {

            "data_scope": {
              "1":
              {
                "category": "unordered", "level": "campaign", "match_type": 0,
                "values": { "exact": [] },
                "value_type": "campaign"
              },
            },
            "data_point": { "category": "unordered", "level": ["supplier","campaign"] },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global,
            "statistical_information": {
              "stats": [
                "z_score"
              ],
              "metrics": [
                "m1",
                "m3"
              ]
            },
            "higher_level_statistical_information": {
              "level": [
                "campaign"
              ],
              "stats": [
                "frequency_distribution",
                "mean",
                "variance_stdev",
                "sum"
              ],
              "metrics": [
                "m2",
                "m4",
                "m16",
                "m17",
                "m18",
                "m19",
                "m20",
                "m8",
                "m10"
              ]
            }
          }

          if($scope.graphSelection.dateRange.startDate){
            reqData.data_scope['2'] = {
              "category": "time",
              "level": "time",
              "match_type": 1,
              "values": {
                  "range": [
                      
                  ]
              },
              "value_type": "time"
            }
            
            reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.startDate));
            reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.endDate));
          }
          

          angular.forEach($scope.selectedDynamicCampaigns, function (data) {
            reqData.data_scope['1'].values.exact.push(data.campaign_id);
          });
        }
        else if (
          $scope.selectedCities_temp.length
        ) {
          // alert("only city");
          $scope.xValues.value = 'city';
          var reqData = {

            "data_scope": {
              "1":
              {
                "category": "geographical", "level": "city", "match_type": 0,
                "values": { "exact": [] },
                "value_type": "city"
              },
            },
            "data_point": { "category": "geographical", "level": ["city"] },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global
          }


          angular.forEach($scope.selectedCities_temp, function (data) {
            reqData.data_scope['1'].values.exact.push(data);
          });
        }
        else if (!$scope.graphSelection.dateRange.startDate && (
          $scope.graphSelection.category == 'vendor' &&
          $scope.selectedVendors.length
        )) {
          // alert("Only Vendor Selected");
          $scope.xValues.value = 'vendor_name';
          var reqData = {
            "data_scope": {
              "1":
              {
                "category": "unordered", "level": "vendor", "match_type": 0,
                "values": { "exact": [] },
                "value_type": "vendor"

              },
            },
            "data_point": { "category": "unordered", "level": ["vendor"] },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global
          }

          angular.forEach($scope.selectedVendors, function (data) {
            reqData.data_scope['1'].values.exact.push($scope.vendorsData[data].vendor_id);
          });
        } else if ($scope.graphSelection.specificParam.society == 'qualitytype') {
          if ($scope.selectedDynamicCampaigns.length) {
            // alert("only Society Quality Type selected");
            $scope.xValues.value = 'qualitytype';
            specificXValue = 'campaign_name';
            var reqData = {
              "data_scope": {
                "1":
                {
                  "category": "unordered", "level": "campaign", "match_type": 0,
                  "values": { "exact": [] },
                  "value_type": "campaign"
                }
              },
              "data_point": {
                "category": "unordered", "level": ["qualitytype"],
                "value_ranges": { "qualitytype": [] }
              },
              "raw_data": angular.copy(raw_data_global),
              "metrics": metrics_global
            }

            angular.forEach($scope.selectedDynamicCampaigns, function (data) {
              reqData.data_scope['1'].values.exact.push(data.campaign_id);
            });
            angular.forEach($scope.selectedTypeOfSocieties, function (data) {
              reqData.data_point.value_ranges.qualitytype.push(data.name);
            });
            // reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.startDate));
            // reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.endDate));
          }
        } else if ($scope.graphSelection.phaseRange.start
          && $scope.selectedDynamicCampaigns.length) {
          // alert("only Phase Range and Campaign Selected");
          $scope.xValues.value = 'phase';
          var reqData = {
            "data_scope": {
              "1":
              {
                "category": "unordered", "level": "campaign", "match_type": 0,
                "values": { "exact": [] },
                "value_type": "campaign"
              }
            },
            "data_point": {
              "category": "time", "level": ["date"], "sublevel": "phase",
              "value_ranges": { "phase": [] }, "range_type": 1
            },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global
          }

          angular.forEach($scope.selectedDynamicCampaigns, function (data) {
            reqData.data_scope['1'].values.exact.push(data.campaign_id);
          });
          reqData.data_point.value_ranges.phase.push($scope.graphSelection.phaseRange.start);
          reqData.data_point.value_ranges.phase.push($scope.graphSelection.phaseRange.end);

        }
        else if ($scope.selectedbookingParameters.length) {
          if ($scope.selectedDynamicCampaigns.length) {
            // alert("only Booking Parameter Types Selected");
            $scope.xValues.value = 'campaign_name';
            angular.forEach($scope.selectedbookingParameters, function (data) {
              specificXValue = data.value;
            });

            var reqData = {
              "data_scope": {
                "1": {
                  "category": "unordered", "level": "campaign", "match_type": 0,
                  "values": { "exact": [] }, "value_type": "campaign"
                }
              },
              "data_point": { "category": "unordered", "level": [] },
              "raw_data": angular.copy(raw_data_global),
              "metrics": metrics_global
            }

            angular.forEach($scope.selectedDynamicCampaigns, function (data) {
              reqData.data_scope['1'].values.exact.push(data.campaign_id);
            });
            angular.forEach($scope.selectedbookingParameters, function (data) {
              reqData.data_point.level.push(data.value);
            });
          }
        }
        else if ($scope.applyClickedFilters.value) {

          // alert("By Default Campaign");
          $scope.xValues.value = 'campaign_name';
          var reqData =
          {
            "data_scope":
            {
              "1": {
                "category": "unordered", "level": "campaign", "match_type": 0,
                "values": { "exact": [] }, "value_type": "campaign"
              }
            },
            "data_point": { "category": "unordered", "level": ["campaign"] },
            "raw_data": angular.copy(raw_data_global),
            "metrics": metrics_global
          }

          angular.forEach($scope.selectedDynamicCampaigns, function (data) {
            reqData.data_scope['1'].values.exact.push(data.campaign_id);
          });
        }

        if (reqData) {
          if($scope.selectedDynamicGraphParams.length){
            angular.forEach($scope.selectedDynamicGraphParams, function(item){
              var index = reqData.raw_data.indexOf(item.key);
              reqData.raw_data.splice(index, 1, item.value);
            })            
          }
          $scope.showCumulativeSummaryGraphs = orderSpecificCase;
          
          getCampaignCumulativeGraph();
          
          DashboardService.getDistributionGraphsStatics(reqData)
            .then(function onSuccess(response) {
              cfpLoadingBar.complete();              

                $scope.initialDynamicGraphData = response.data.data;
                if(response.data.data){
                  delete reqData['metrics'];
                  if(reqData.hasOwnProperty('higher_level_statistical_information')){
                    delete reqData['higher_level_statistical_information'];
                  }
                  if(reqData.hasOwnProperty('statistical_information')){
                    delete reqData['statistical_information'];
                  }
                  if(!reqData.data_point.level.hasOwnProperty('date')){
                    reqData.data_point.level.splice(0,0,'date');
                  }
                  if(orderSpecificCase){
                    reqData.data_point.level = ['date','campaign'];
                  }
                  $scope.cumulativeOrder = true;
                  reqData['custom_functions'] = ["order_cumulative"];
                  reqData['raw_data'] = ['total_orders_punched'];
                  DashboardService.getDistributionGraphsStatics(reqData)
                  .then(function onSuccess(response) {
                    console.log(response);
                    $scope.initialCumulativeOrderData = response.data.data;
                    $scope.lineChartGraphCumulativeOrder = [];
                    $scope.cumulativeOrderCampaignsNamesById = {};
                    
                    angular.forEach(response.data.data['lower_group_data'], function(data){
                      
                      var key = data[$scope.xValues.value];
                      if(specificXValue){
                        key = key + ", " + data[specificXValue]
                      }
                      if(specificXValue2){
                        key = key + ", " + data[specificXValue2]
                      }
                      
                      if(!$scope.cumulativeOrderCampaignsNamesById.hasOwnProperty(key)){
                        $scope.cumulativeOrderCampaignsNamesById[key] = {
                          dates: [],
                          values: [],
                          sumValues: []
                        }
                      }
                      
                      $scope.cumulativeOrderCampaignsNamesById[key]['dates'].push(data.date);
                      $scope.cumulativeOrderCampaignsNamesById[key]['values'].push(data.total_orders_punched_cum_pct);
                      $scope.cumulativeOrderCampaignsNamesById[key]['sumValues'].push(data.total_orders_punched);

                    })
                    $scope.cumulativeOrderCampaignKeys = Object.keys($scope.cumulativeOrderCampaignsNamesById);
                    $scope.cumulativeOrderCampaignKeys.push('ALL');
                    $scope.selectedOrderKey = $scope.cumulativeOrderCampaignKeys[0];
                    $scope.lineChartForCumulativeOrder = [];
                    $scope.lineChartForCumulativeOrder = formatLineChartForCumulativeOrderGraph($scope.cumulativeOrderCampaignsNamesById);
                    
                  }).catch(function onError(response) {
                    console.log(response);
                  })
                }
              $scope.stackedBarChartForDynamic = angular.copy(stackedBarChart);

              if (!orderSpecificCase) {
                $scope.campaignFilteredSummaryData = $scope.initialDynamicGraphData.lower_group_data;
                $scope.showTableForSpecificCase = false;
                angular.forEach($scope.initialDynamicGraphData.lower_group_data, function (data) {
                  $scope.initalDynamicTableData = data;
                })
                setCampaignOverallSummary($scope.initialDynamicGraphData.lower_group_data);
                if ($scope.initialDynamicGraphData.lower_group_data.length > 4) {
                  $scope.stackedBarChartForDynamic.chart['width'] = $scope.initialDynamicGraphData.lower_group_data.length * 300;
                }
                $scope.stackedBarChartDynamicData = formatDynamicData($scope.initialDynamicGraphData, orderSpecificCase);
              } else {
                setKeysForOrderSpecificData($scope.initialDynamicGraphData.higher_group_data);
                
                $scope.campaignFilteredSummaryData = $scope.initialDynamicGraphData.higher_group_data;
                angular.forEach($scope.initialDynamicGraphData.higher_group_data, function (data) {
                  $scope.initalDynamicTableData = data;
                })
                setCampaignOverallSummary($scope.initialDynamicGraphData.higher_group_data);
                if ($scope.initialDynamicGraphData.higher_group_data.length > 4) {
                  $scope.stackedBarChartForDynamic.chart['width'] = $scope.initialDynamicGraphData.lower_group_data.length * 300;
                }
                $scope.stackedBarChartDynamicData = formatDynamicData($scope.initialDynamicGraphData, orderSpecificCase);
                
              }
              

              setLabelsOnBars();
              
            }).catch(function onError(response) {
              console.log(response);
              cfpLoadingBar.complete();
            })
            
        }
      }
      var setKeysForOrderSpecificData = function(data){
        angular.forEach(data, function(item){
          if(item.hasOwnProperty('mean_flat*cost_flat/lead')){
            item['flat*cost_flat/lead'] = item['mean_flat*cost_flat/lead'];
          }
          if(item.hasOwnProperty('mean_flat*cost_flat/hot_lead')){
            item['flat*cost_flat/hot_lead'] = item['mean_flat*cost_flat/hot_lead'];
          }
          if(item.hasOwnProperty('mean_flat*cost_flat/total_booking_confirmed')){
            item['flat*cost_flat/total_booking_confirmed'] = item['mean_flat*cost_flat/total_booking_confirmed'];
          }
          if(item.hasOwnProperty('mean_flat*cost_flat/lead')){
            item['flat*cost_flat/total_orders_punched'] = item['mean_flat*cost_flat/total_orders_punched'];
          }

          if(item.hasOwnProperty('mean_lead/flat*100')){
            item['lead/flat*100'] = item['mean_lead/flat*100'];
          }
          if(item.hasOwnProperty('mean_hot_lead/flat*100')){
            item['hot_lead/flat*100'] = item['mean_hot_lead/flat*100'];
          }
          if(item.hasOwnProperty('mean_total_booking_confirmed/flat*100')){
            item['total_booking_confirmed/flat*100'] = item['mean_total_booking_confirmed/flat*100'];
          }
          if(item.hasOwnProperty('mean_total_orders_punched/flat*100')){
            item['total_orders_punched/flat*100'] = item['mean_total_orders_punched/flat*100'];
          }
          
        })
      }
      var setCampaignOverallSummary = function(data){
        $scope.campaignOverallSummary = [];
        var campaign_data = {};
        console.log(data);
        // campaign_data[campaign.campaign]['Name'] = campaign.campaign_name;
        
        angular.forEach(data , function(campaign){
          if (!campaign_data.hasOwnProperty(campaign.campaign)){
            campaign_data[campaign.campaign] = {}
            campaign_data[campaign.campaign]['flatCount'] = 0;
            campaign_data[campaign.campaign]['totalLeads'] = 0;
            campaign_data[campaign.campaign]['hotLeads'] = 0;
            campaign_data[campaign.campaign]['costPerLeads'] = 0;
            campaign_data[campaign.campaign]['costPerHotLeads'] = 0;
            campaign_data[campaign.campaign]['leadsPerc'] = 0;
            campaign_data[campaign.campaign]['hotLeadsPerc'] = 0;
            campaign_data[campaign.campaign]['costPerBookingConfirmed'] = 0;
            campaign_data[campaign.campaign]['costPerOrdersPunched'] = 0;
            campaign_data[campaign.campaign]['bookingConfirmedPerc'] = 0;
            campaign_data[campaign.campaign]['ordersPunchedPerc'] = 0;
            campaign_data[campaign.campaign]['count'] = 0;
          }
          campaign_data[campaign.campaign]['name'] = campaign.campaign_name;
          campaign_data[campaign.campaign]['flatCount'] += campaign.flat;
          campaign_data[campaign.campaign]['totalLeads'] += campaign.lead;
          campaign_data[campaign.campaign]['hotLeads'] += campaign.hot_lead;
          campaign_data[campaign.campaign]['costPerLeads'] += campaign['flat*cost_flat/lead'];
          campaign_data[campaign.campaign]['costPerHotLeads'] += campaign['flat*cost_flat/hot_lead'];
          campaign_data[campaign.campaign]['leadsPerc'] += campaign['lead/flat*100'];
          campaign_data[campaign.campaign]['hotLeadsPerc'] += campaign['hot_lead/flat*100'];
          campaign_data[campaign.campaign]['costPerBookingConfirmed'] += campaign['flat*cost_flat/total_booking_confirmed'];
          campaign_data[campaign.campaign]['costPerOrdersPunched'] += campaign['flat*cost_flat/total_orders_punched'];
          campaign_data[campaign.campaign]['bookingConfirmedPerc'] += campaign['total_booking_confirmed/flat*100'];
          campaign_data[campaign.campaign]['ordersPunchedPerc'] += campaign['total_orders_punched/flat*100'];
          campaign_data[campaign.campaign]['count'] += campaign_data[campaign.campaign]['count'] + 1;

        })
        angular.forEach(campaign_data, function(data){
          data['costPerLeads'] = (data['costPerLeads']/data['count']).toFixed(2);
          data['costPerHotLeads'] = (data['costPerHotLeads']/data['count']).toFixed(2);
          data['leadsPerc'] = (data['leadsPerc']/data['count']).toFixed(2);
          data['hotLeadsPerc'] = (data['hotLeadsPerc']/data['count']).toFixed(2);
          data['costPerBookingConfirmed'] = (data['costPerBookingConfirmed']/data['count']).toFixed(2);
          data['costPerOrdersPunched'] = (data['costPerOrdersPunched']/data['count']).toFixed(2);
          data['bookingConfirmedPerc'] = (data['bookingConfirmedPerc']/data['count']).toFixed(2);
          data['ordersPunchedPerc'] = (data['ordersPunchedPerc']/data['count']).toFixed(2);
          data['ratio'] = (data['hotLeads']/data['totalLeads']*100).toFixed(2);
        })
        
        $scope.campaignOverallSummary = Object.values(campaign_data);
        console.log($scope.campaignOverallSummary);
      }      
      
      $scope.changeCumulativeOrderKey = function(key){
        $scope.selectedOrderKey = key;
        $scope.lineChartForCumulativeOrder = formatLineChartForCumulativeOrderGraph($scope.cumulativeOrderCampaignsNamesById);
      }
      
      var formatLineChartForCumulativeOrderGraph = function(data){        
        
        $scope.x_fre_leads = [];
        var temp_data = [];
        var final_data = [];
        var values1 = [];        
        $scope.lineChartGraphCumulativeOrder = [];
        $scope.cumulativeTableData = [];
        if($scope.selectedOrderKey == 'ALL'){
          var allKeys = angular.copy($scope.cumulativeOrderCampaignKeys);
          allKeys.splice(allKeys.indexOf('ALL'),1);
          angular.forEach(allKeys, function(key){
            var temp_data = [];
            var values1 = [];   
            var chart = angular.copy(lineChartCumulativeOrder);
            chart.chart.xAxis.axisLabel = "Orders Punched Days" + "(" +
                      key + ")";
            chart.chart.yAxis.axisLabel = "Cumulative Orders Punched (%)" + "(100% =" +
             data[key].sumValues.reduce((a,b)=>a+b) + " Orders Punched)";
            
            createNumberSet(data[key].dates, data[key].sumValues,
              data[key].values, key, $scope.cumulativeTableData);
            $scope.lineChartGraphCumulativeOrder.push(chart);
            var index = 0;
            // values1.push({
            //   x: 0, y: 0 
            // })
            // index++;
            
            angular.forEach(data[key].values, function(item){
              values1.push({
                x: data[key].dates[index], y: item
              })
              index++;
            })
            // $scope.x_fre_leads = angular.copy(data[key].dates);
            
            temp_data.push({
              key: 'Total Orders Punched (%)',
              color: constants.colorKey1,
              values: values1
            });                    
            final_data.push(temp_data);    
          })
        }else{
        var chart = angular.copy(lineChartCumulativeOrder);
        chart.chart.yAxis.axisLabel = "Cumulative Orders Punched (%)" + "(100% =" +
        data[$scope.selectedOrderKey].sumValues.reduce((a,b)=>a+b) + " Orders Punched)";
        $scope.lineChartGraphCumulativeOrder.push(chart);
        var index = 0;
        // values1.push({
        //   x: 0, y: 0 
        // })
        // index++;
        console.log(data[$scope.selectedOrderKey].dates);
        
        createNumberSet(data[$scope.selectedOrderKey].dates, data[$scope.selectedOrderKey].sumValues,
          data[$scope.selectedOrderKey].values, $scope.selectedOrderKey, $scope.cumulativeTableData);
        
        angular.forEach(data[$scope.selectedOrderKey].values, function(item){
          
          values1.push({
            x: data[$scope.selectedOrderKey].dates[index], y: item 
          })
          index++;
        })
        
        $scope.x_fre_leads = angular.copy(data[$scope.selectedOrderKey].dates);
        
        temp_data.push({
          key: 'Total Orders Punched (%)',
          color: constants.colorKey1,
          values: values1
        });                    
        final_data.push(temp_data);
        }
                
        return final_data;
      }
      $scope.clearDatesFromDynamicGraph = function () {
        $scope.graphSelection.dateRange = {};
        $scope.selectedDynamicCampaigns = [];
        $scope.selectedCities_temp = [];
        $scope.selectedbookingParameters = [];
        $scope.selectedSizeOfFlats = [];
        $scope.selectedVendors = [];
        $scope.graphSelection.phaseRange = {};
        $scope.selectedTypeOfSocieties = [];
        $scope.graphSelection.specificParam = [];
        $scope.dynamicValuesCampaigns = [];
        $scope.dynamicValuesVendor = [];
      }
      $scope.changeDynamicGraph = function () {
        $scope.yValues = [];
        angular.forEach($scope.graphSelection.Yvalues, function (data, key) {
          if (data)
            $scope.yValues.push($scope.dynamicGraphYKeysMap[key]);
        })
        $scope.stackedBarChartDynamicData = formatDynamicData($scope.initialDynamicGraphData, orderSpecificCase);
        setLabelsOnBars();
      }
      // $scope.getGenericGraphData();


      $scope.getVendorWiseSummary = function () {
        cfpLoadingBar.start();
        DashboardService.getVendorWiseSummary()
          .then(function onSuccess(response) {
            $scope.vendorSummary = response.data.data;
            $scope.vendorName = response.data.data.vendor_details;
            $scope.overallVendorSummary = response.data.data.overall;
            $scope.WeeklyVendorMISOverallSummary = response.data.data.overall.overall;
            $scope.WeeklyVendorMISLastWeekSummary = response.data.data.last_week.overall;
            $scope.WeeklyVendorMISLast2WeekSummary = response.data.data.last_two_week.overall;
            $scope.WeeklyVendorMISLast3WeekSummary = response.data.data.last_three_week.overall;
            $scope.OverallVendorStackedBarChart = angular.copy(overallVendorSummaryStackedBar);
            $scope.stackedBarAllVendorWiseChart = formatAllVendorWiseChart($scope.overallVendorSummary);

            cfpLoadingBar.complete();
          }).catch(function onError(response) {
            console.log(response);
          })
      }


      var formatAllVendorWiseChart = function (data) {
        var values1 = [];
        var values2 = [];
        angular.forEach(data, function (data, key) {
          if (data.flat_count != 0) {
            $scope.hotLeadsValues = data.interested / data.flat_count * 100;
            $scope.normalLeadsValues = data.total / data.flat_count * 100;
          }
          else {
            $scope.hotLeadsValues = data.interested;
            $scope.normalLeadsValues = data.total;
          }
          if (key != 'overall') {
            $scope.vendorKeyName = $scope.vendorSummary.vendor_details[key].name;
            var keyWithFlatLabel = $scope.vendorKeyName + ' (' + data.flat_count + ')';
            var value1 =
              { x: keyWithFlatLabel, y: $scope.normalLeadsValues };
            var value2 =
              { x: keyWithFlatLabel, y: $scope.hotLeadsValues };
            values1.push(value1);
            values2.push(value2);
          }
        })

        var temp_data = [
          {
            key: "Total Leads in %",
            color: constants.colorKey1,
            values: values1
          },
          {
            key: "High Potential Leads in %",
            color: constants.colorKey2,
            values: values2
          }
        ];

        return temp_data;
      }
      $scope.dynamicGraphSelectedOrder = {};
      $scope.dynamicSortedGraphOptions = angular.copy(dynamicDiscreteBarChart);

      $scope.sortDynamicData = function (order) {
        setLabelsOnBars();
        if(!orderSpecificCase){
          $scope.dynamicOrderData = angular.copy($scope.initialDynamicGraphData.lower_group_data);
        }else{
          setKeysForOrderSpecificData($scope.initialDynamicGraphData.higher_group_data);
          console.log($scope.initialDynamicGraphData.higher_group_data);
          
          $scope.dynamicOrderData = angular.copy($scope.initialDynamicGraphData.higher_group_data);
        }
        
        $scope.dynamicOrderData.sort(function (a, b) {
          return a[$scope.dynamicGraphSelectedOrder.value] - b[$scope.dynamicGraphSelectedOrder.value];
        });
        if (order == 'DESC') {
          $scope.dynamicOrderData.reverse();
        }
        $scope.dynamicSortedGraphData = formatSortedDynamicGraphData($scope.dynamicOrderData);
      }

      var formatSortedDynamicGraphData = function (data) {
        var temp_data = {};

        temp_data['key'] = "Sample";
        temp_data['values'] = [];
        tooltipDynamicGraphData = [];
        angular.forEach(data, function (item) {
          tooltipDynamicGraphData.push(item);
          console.log(tooltipDynamicGraphData);
          
          if (selectedSpecificItems.indexOf(item[$scope.xValues.value]) > -1 || !selectedSpecificItems.length) {
            if (item[$scope.xValues.value]) {
              if (specificXValue) {
                if (specificXValue2) {
                  var value = {
                    'label': item[$scope.xValues.value] + item[specificXValue2]
                      + "( " + item[specificXValue] + " )",
                    'value': item[$scope.dynamicGraphSelectedOrder.value]
                  }
                }

                else {
                  var value = {
                    'label': item[$scope.xValues.value]
                      + "(" + item[specificXValue] + ")",
                    'value': item[$scope.dynamicGraphSelectedOrder.value]
                  }
                }
                temp_data.values.push(value);
              } else {
                var value = {
                  'label': item[$scope.xValues.value],
                  'value': item[$scope.dynamicGraphSelectedOrder.value]
                }
                temp_data.values.push(value);
              }

            }
          }
        })
        return [temp_data];
      }

      var setLabelsOnBars = function () {
        $timeout(function () {
          d3.selectAll('.nv-multibar .nv-group').each(function (group) {
            var g = d3.select(this);

            // Remove previous labels if there is any
            g.selectAll('text').remove();
            g.selectAll('.nv-bar').each(function (bar) {
              var b = d3.select(this);
              var barWidth = b.attr('width');
              var barHeight = b.attr('height');

              g.append('text')
                // Transforms shift the origin point then the x and y of the bar
                // is altered by this transform. In order to align the labels
                // we need to apply this transform to those.
                .attr('transform', b.attr('transform'))
                .text(function () {
                  // No decimals format and eliminate zero values
                  if (bar.y === 0) {
                    return;
                  }
                  return parseFloat(bar.y).toFixed(2) + "%";
                })
                .attr('y', function () {
                  // Center label vertically
                  var height = this.getBBox().height;
                  return parseFloat(b.attr('y')) - 2; // 15 is the label's margin from the top of bar
                })
                .attr('x', function () {
                  // Center label horizontally
                  var width = this.getBBox().width;
                  return parseFloat(b.attr('x')) + (parseFloat(barWidth) / 2) - (width / 2);
                })
                .style("stroke", "black")
                .attr('class', 'bar-values');
            });
          });
        }, 1000);
      }

      var getCampaignsWiseForCity = function () {
        var dataCity =
        {
          "cities": [],
        }

        angular.forEach($scope.selectedCities_temp, function (data) {
          dataCity.cities.push(data);
        });
        DashboardService.getCampaignsWiseForCity(dataCity)
          .then(function onSuccess(response) {
            $scope.selectedCampaignsCityWise = response.data.data;
            $scope.dynamicValuesCampaigns = $scope.selectedCampaignsCityWise;
            $scope.dynamicValuesVendor = $scope.selectedCampaignsCityWise;
          }).catch(function onError(response) {
            console.log(response);
          })
      }
      var getCampaignsWiseForVendor = function () {
        var dataVendor =
        {
          "vendors": [],
        }

        angular.forEach($scope.selectedVendors, function (data) {
          dataVendor.vendors.push($scope.vendorsData[data].vendor_id);
        });
        DashboardService.getCampaignsWiseForVendor(dataVendor)
          .then(function onSuccess(response) {
            $scope.selectedCampaignsCityWise = response.data.data;
            $scope.dynamicValuesCampaigns = $scope.selectedCampaignsCityWise;
            $scope.dynamicValuesVendor = $scope.selectedCampaignsCityWise;
          }).catch(function onError(response) {
            console.log(response);
          })
      }

      $scope.dynamicValuesCityWiseCampaignIdMap = {};
      angular.forEach($scope.dynamicValuesCampaigns, function (data) {
        $scope.dynamicValuesCityWiseCampaignIdMap[data.campaign_id] = data;
      })
      $scope.dynamicValuesVendorWiseCampaignIdMap = {};
      angular.forEach($scope.dynamicValuesVendor, function (data) {
        $scope.dynamicValuesVendorWiseCampaignIdMap[data.campaign_id] = data;
      })
      $scope.applyClickedFilters = {};
      $scope.changeApplyFilters = function () {
      }

      $scope.graphSelection.phaseRange = false;
      $scope.graphSelection.dateRange = false;
      $scope.BookingParameters = false;
      $scope.graphSelection.specificParam.society = false;
      $scope.selectedVendorParameters = false;
      $scope.selectedCityParameters = false;

      $scope.DisabledClicked = function () {
        $scope.selectAnyPhase = false;
        $scope.selectAnyDate = true;
        // $scope.graphSelection.phaseRange = {};
      }
      $scope.DisabledClickedPhase = function () {
        $scope.selectAnyPhase = true;
        $scope.selectAnyDate = false;
      }
      $scope.DisabledClickedSociety = function () {
        $scope.checkboxChecked = false;
        $scope.checkboxCheckedSociety = true;
        $scope.selectedbookingParameters = [];
      }
      $scope.DisabledClickedBooking = function () {
        $scope.checkboxCheckedSociety = false;
        $scope.checkboxChecked = true;
        angular.forEach($scope.selectedbookingParameters, function (data) {
          var specificXValue = data.value;
        });
        $scope.graphSelection.specificParam.society = [];
        $scope.selectedTypeOfSocieties = [];
        $scope.selectedSizeOfFlats = [];
        // $scope.graphSelection.specificParam.society = [];
      }
      $scope.DisabledClickedCity = function () {
        $scope.checkboxCheckedCity = true;
        $scope.checkboxCheckedVendor = false;
        getCampaignsWiseForCity();
        $scope.cityLists = [];
        DashboardService.getCityUsers()
          .then(function onSuccess(response) {
            $scope.cityLists = response.data.data.list_of_cities;
          }).catch(function onError(response) {
            console.log(response);
          })
        $scope.dynamicValuesCampaigns = [];
        $scope.selectedVendors = [];
      }
      $scope.DisabledClickedVendor = function () {
        $scope.checkboxCheckedCity = false;
        $scope.checkboxCheckedVendor = true;
        getCampaignsWiseForVendor();
        $scope.selectedCities_temp = [];
      }

      $scope.downloadSheet = function(){
        $scope.emailCampaignLeadsModel.start_date = commonDataShare.formatDate($scope.emailCampaignLeadsModel.start_date);
        $scope.emailCampaignLeadsModel.end_date = commonDataShare.formatDate($scope.emailCampaignLeadsModel.end_date);
        DashboardService.downloadSheet($scope.emailCampaignLeadsModel.leads_form_id)
        .then(function onSuccess(response){
          console.log(response);
          if(response.data.data.one_time_hash && $scope.emailCampaignLeadsModel.start_date &&
                  $scope.emailCampaignLeadsModel.end_date ){
            $window.open(Config.APIBaseUrl + 'v0/ui/leads/download_lead_data_excel/' + response.data.data.one_time_hash + 
            "/?start_date=" + $scope.emailCampaignLeadsModel.start_date + 
            "&end_date=" + $scope.emailCampaignLeadsModel.end_date , '_blank');            
          }else if(response.data.data.one_time_hash){
            $window.open(Config.APIBaseUrl + 'v0/ui/leads/download_lead_data_excel/' + response.data.data.one_time_hash + "/", '_blank');            
          }            
        }).catch(function onError(response){
          console.log(response);            
        })
      }
      $scope.getOverallSummaryData = function(item){
        
        var total = 0
        angular.forEach($scope.campaignOverallSummary, function(data){
          total+= parseFloat(data[item]);
        })      
        if(['flatCount','totalLeads','hotLeads'].indexOf(item) > -1){
          return total;
        }
        
        return (total/$scope.campaignOverallSummary.length).toFixed(2);  
      }

      $scope.getCampaign = function (proposalId) {
        DashboardService.getCampaign(proposalId)
      }

      var super_admin = JSON.parse(localStorage.getItem("machadalo-credentials"));
      $scope.admin = super_admin["user_id"]

      $scope.deleteLeads = function(supplier_id){
        var data = {
          "supplier_ids": [],
          "campaign_id": $scope.campaignId
        }
        data.supplier_ids.push(supplier_id);
        DashboardService.deleteLeads(data)
      }
      
      $scope.societyParamsCheck = function(item,status){
        console.log(item,status);
        if(item === 'society'){
          if(status){
            $scope.selectedbookingParameters = [];
            $scope.checkboxChecked = false;
            $scope.checkboxCheckedSociety = true;
          }else{
            $scope.selectedTypeOfSocieties = [];
            $scope.selectedSizeOfFlats = [];
            $scope.checkboxChecked = true;
            $scope.checkboxCheckedSociety = false;
          }
        }
        if(item === 'booking'){
          if(status){
            $scope.selectedTypeOfSocieties = [];
            $scope.selectedSizeOfFlats = [];
            $scope.checkboxChecked = true;
            $scope.checkboxCheckedSociety = false;
          }else{
            $scope.selectedbookingParameters = [];
            $scope.checkboxChecked = false;
            $scope.checkboxCheckedSociety = true;
            
          }
        }        
        console.log($scope.checkboxChecked,$scope.checkboxCheckedSociety);
        
      }
      var createNumberSet = function(dates, values, pValues, name, result){
        var maxDateValue = Math.max(...dates);
        var n = Math.round(maxDateValue/10);
        if(n<=1){
          n=2;
        }
        var sum = 0;
        var perct;
        var l = [];
        for(var i=0; i<maxDateValue; i=i+n){
          var data = {}
          data['key'] = i + "-" + (i + (n - 1));          
          data['perct'] = perct;
          angular.forEach(dates, function(date, index){                       
            if(date >= i && date <= (i + n-1)){              
              sum += values[index];
              data['perct'] = pValues[index];
              perct = pValues[index];

            }
          })
          data['sum'] = sum;
          l.push(data);                    
        }
        result.push(l);
      }
      var getCampaignCumulativeGraph = function(){
        var reqData = {

          "data_scope": {
            "1":
            {
              "category": "unordered", "level": "campaign", "match_type": 0,
              "values": { "exact": [] },
              "value_type": "campaign"
            },
          },
          "data_point": { "category": "unordered", "level": ["supplier","campaign"] },
          "raw_data": angular.copy(raw_data_global),
          "metrics": metrics_global,
          "statistical_information": {
            "stats": [
              "z_score"
            ],
            "metrics": [
              "m1",
              "m3"
            ]
          },
          "higher_level_statistical_information": {
            "level": [
              "campaign"
            ],
            "stats": [
              "frequency_distribution",
              "mean",
              "variance_stdev",
              "sum"
            ],
            "metrics": [
              "m2",
              "m4",
              "m16",
              "m17",
              "m18",
              "m19",
              "m20",
            "m8",
            "m10"
            ]
          }
        }
        if($scope.graphSelection.dateRange.startDate){
          reqData.data_scope['2'] = {
            "category": "time",
            "level": "time",
            "match_type": 1,
            "values": {
                "range": [
                    
                ]
            },
            "value_type": "time"
          }
          
          reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.startDate));
          reqData.data_scope['2'].values.range.push(commonDataShare.formatDate($scope.graphSelection.dateRange.endDate));
        }
        angular.forEach($scope.selectedDynamicCampaigns, function (data) {
          reqData.data_scope['1'].values.exact.push(data.campaign_id);
        });
        if($scope.selectedDynamicGraphParams.length){
          angular.forEach($scope.selectedDynamicGraphParams, function(item){
            var index = reqData.raw_data.indexOf(item.key);
            reqData.raw_data.splice(index, 1, item.value);
          })            
        }
        DashboardService.getDistributionGraphsStatics(reqData)
            .then(function onSuccess(response) {
              console.log(response);
              setKeysForOrderSpecificData(response.data.data.higher_group_data);
              setStackedBarChartSummary(response.data.data);
            }).catch(function onError(response){
              console.log(response);              
            })
        console.log(reqData);
        var data = angular.copy(reqData);

        //For line chart
        data['custom_functions'] = ["order_cumulative"];
        data['raw_data'] = ['total_orders_punched'];
        delete data['metrics'];
        delete data['higher_level_statistical_information'];
        delete data['statistical_information'];
        data.data_point.level = ['date','campaign'];
        DashboardService.getDistributionGraphsStatics(data)
        .then(function onSuccess(response) {
          console.log(response);
          setCampaignLineChart(response.data.data);
        }).catch(function onError(response){
          console.log(response);          
        })
      }

      var setStackedBarChartSummary = function(data){
        $scope.stackedBarChartForDynamicSummary = angular.copy(stackedBarChartSummary);

              
                $scope.campaignFilteredSummaryDataSummary = data.higher_group_data
                angular.forEach(data.higher_group_data, function (data) {
                  $scope.initalDynamicTableDataSummary = data;
                })
                setCampaignOverallSummary(data.higher_group_data);
                if (data.higher_group_data.length > 4) {
                  $scope.stackedBarChartForDynamicSummary.chart['width'] = data.higher_group_data.length * 300;
                }
                $scope.stackedBarChartDynamicDataSummary = formatDynamicDataSummary(data, orderSpecificCase);
                console.log($scope.stackedBarChartDynamicDataSummary);
                  
                
              

              setLabelsOnBars();
      }

      var setCampaignLineChart = function(data){
        $scope.initialCampaignChartData = data;
        $scope.lineChartOrder = [];
        $scope.lineChartOrderCampaignsNamesById = {};        
        
        angular.forEach(data['lower_group_data'], function(summaryData){
                    
          var key = summaryData['campaign_name'];

          if(!$scope.lineChartOrderCampaignsNamesById.hasOwnProperty(key)){
            $scope.lineChartOrderCampaignsNamesById[key] = {
              dates: [],
              values: [],
              sumValues: []
            }
          }          
          $scope.lineChartOrderCampaignsNamesById[key]['dates'].push(summaryData.date);
          $scope.lineChartOrderCampaignsNamesById[key]['values'].push(summaryData.total_orders_punched_cum_pct);
          $scope.lineChartOrderCampaignsNamesById[key]['sumValues'].push(summaryData.total_orders_punched);
        })
        
        $scope.lineChartOrderCampaignKeys = Object.keys($scope.lineChartOrderCampaignsNamesById);
        $scope.selectedLineChartOrderKey = $scope.lineChartOrderCampaignKeys[0];
        $scope.cumulativeLineChartOrder = [];
        $scope.cumulativeLineChartOrderSummary = setFormatLineChartForCumulativeOrderGraph($scope.lineChartOrderCampaignsNamesById);
        console.log($scope.cumulativeLineChartOrderSummary,$scope.cumulativeTableDataSummary,
          $scope.lineChartGraphCumulativeOrderSummary);
        
        
      }

      var setFormatLineChartForCumulativeOrderGraph = function(data){        
                
        var final_data = [];
        
        $scope.lineChartGraphCumulativeOrderSummary = [];        
        $scope.cumulativeTableDataSummary = [];
        
        angular.forEach(data, function(data1, key){
          console.log(data1,key);
          var values1 = [];        
          var temp_data = [];
          
          var chart = angular.copy(lineChartCumulativeOrder);
          chart.chart.yAxis.axisLabel = "Cumulative Orders Punched (%)" + "(100% =" +
          data1.sumValues.reduce((a,b)=>a+b) + " Orders Punched)";
          chart.chart.xAxis.axisLabel = "Orders Punched Day (" +  
            key
          +")";
          $scope.lineChartGraphCumulativeOrderSummary.push(chart);
          var index = 0;          
          
          createNumberSet(data1.dates, data1.sumValues,
            data1.values, key, $scope.cumulativeTableDataSummary);
          
          angular.forEach(data1.values, function(item){
            
            values1.push({
              x: data1.dates[index], y: item 
            })
            index++;
          })
          
          // $scope.x_fre_leads = angular.copy(data[$scope.selectedLineChartOrderKey].dates);        
          
          temp_data.push({
            key: 'Total Orders Punched (%)',
            color: constants.colorKey1,
            values: values1
          });                    
          final_data.push(temp_data);
        })
        
        // console.log($scope.x_fre_leads);        
        
                
        return final_data;
      }

      var formatDynamicDataSummary = function (data) {

        var values1 = {};
        var labels = [];
        var finalData = [];
        tooltipDynamicGraphDataSummary = [];
        
          angular.forEach(data.higher_group_data, function (data1, key) {

            tooltipDynamicGraphDataSummary.push(data1);
            $scope.FlatCountOVerallLowerORderGroup = data1.flat;

            if (selectedSpecificItems.indexOf(data1['campaign_name']) > -1 || !selectedSpecificItems.length) {
              angular.forEach($scope.yValues, function (itemKey, index, item) {
                if (!values1.hasOwnProperty(itemKey)) {
                  values1[itemKey] = [];
                }                
                  
                    var temp_label = data1['campaign_name'] +                      
                      " (" + $scope.FlatCountOVerallLowerORderGroup + ")";                                          
                    setMaxYValueSummary(data1[itemKey]);
                    var temp = {
                      x: temp_label,
                      y: data1[itemKey] || 0
                    }
                    values1[itemKey].push(temp);
                  
                
              })
            }


          })
          angular.forEach($scope.yValues, function (itemKey) {
            var temp_data = {
              key: $scope.dynamicGraphYValuesMap[itemKey],
              values: values1[itemKey]
            }
            finalData.push(temp_data);
          })
                
        
        $scope.stackedBarChartForDynamicSummary.chart.forceY[1] = maxYValueSummary+2;
        
        return finalData;
      }
      $scope.roundOfPrecisionTwo = function(value){
        if(value)
          return parseFloat(value.toFixed(2));
        else  
          return 'NA';
      } 
      
      // END

    })
})();
app.factory('Excel', function ($window) {
  var uri = 'data:application/vnd.ms-excel;base64,',
    template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
    base64 = function (s) { return $window.btoa(unescape(encodeURIComponent(s))); },
    format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) };
  return {
    tableToExcel: function (tableId, worksheetName) {
      var table = $(tableId),
        ctx = { worksheet: worksheetName, table: table.html() },
        href = uri + base64(format(template, ctx));
      return href;
    }
  };
})
