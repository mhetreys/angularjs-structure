/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
    'use strict';

  angular.module('catalogueApp')
      .controller('DashboarddynamicGraphsCtrl',function($scope,NgMap, $rootScope, baConfig, colorHelper,dynamicGraphService, commonDataShare, constants,$location,$anchorScroll,uiGmapGoogleMapApi,uiGmapIsReady,Upload,cfpLoadingBar,$stateParams,$timeout,Excel) {

console.log("hello");
$scope.getDistributionGraphsStatics = function(){

  var data =  {
         "data_scope": {"1":{"category": "unordered", "level": "campaign", "match_type": 0,
             "values": {"exact": [$scope.campaignIdForPerfMetrics]}, "value_type": "campaign"}},
         "data_point": {
             "category": "unordered",
             "level": ["supplier","campaign"]
         },
         "raw_data": ["lead", "hot_lead","flat"],
         "metrics": [["1","3","/"],["m1",100,"*"],["2","3","/"],["m3",100,"*"]],
         // "metrics": [["2","3","/"],["m1",100,"*"]],
         // "metrics" :[["1","3","/"],["2","3","/"],["m1","100","*"],["m2","100","*"]],
         "statistical_information":{"stats":["z_score"], "metrics":["m1","m3"]},
         "higher_level_statistical_information":{"level":["campaign"],"stats":["frequency_distribution","mean","variance_stdev"],
         "metrics":["m2","m4"]
         }
      }


  dynamicGraphService.getDistributionGraphsStatics(data)
  .then(function onSuccess(response){
    console.log(response);
  }).catch(function onError(response){
    console.log(response);
    })
}

})


})();
