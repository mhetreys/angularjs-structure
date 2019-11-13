angular.module('machadaloPages')
.controller('FinalBookingCampaignCtrl',
    ['$scope', '$rootScope', '$window', '$location',
    function ($scope, $rootScope, $window, $location) {
    //Start: for document type in modal window
      $scope.documenttypes = [];
         var doctype = [
         {"name":"Invoice"},
         {"name":"Cost Sheet"},
         {"name":"Proposal"}
        ];
        $scope.documenttypes = doctype;
      //End: for document type in modal window

      $scope.payments = [
      {
        'booking_amount':'2500',
        'payment_mode': 'cheque',
        'payment_detail': '',
        'payment_date': '27-05-1988'
      }
	  ];
    $scope.addRow = function(){
  	    $scope.payments.push({ 'booking_amount':$scope.amount, 'payment_mode': $scope.payment_mode, 'payment_detail':$scope.payment_detail, 'payment_date': $scope.payment_date });
  	    $scope.booking_amount = '';
  	    $scope.payment_mode = '';
        $scope.payment_detail = '';
  	    $scope.payment_date = '';
  };

  $scope.finalBooking = function(){
    alert('vidhi');
  };

}]);//Controller ends here
