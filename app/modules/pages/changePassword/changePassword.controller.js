angular.module('catalogueApp')
.controller('changePswdCtrl',
    ['$scope', '$rootScope', '$window', '$location','changePasswordService','$stateParams','commonDataShare','constants','$timeout','Upload','cfpLoadingBar','permissions',
    function ($scope, $rootScope, $window, $location, changePasswordService, $stateParams,commonDataShare,constants,$timeout,Upload,cfpLoadingBar, permissions) {


    console.log("Hello passwrod change World");

        console.log($rootScope);
        $scope.userInfo = $rootScope.globals.userInfo;
        $scope.model = {};
        $scope.isValid = false;
        $scope.passwordError = constants.password_error;
        $scope.changePassword = function(){
          changePasswordService.changePassword($scope.userInfo.id,$scope.model)
          .then(function onSuccess(response){
            console.log(response);
            swal(constants.name,constants.changePassword_success,constants.success);
            $location.path("/logout");
          }).catch(function onError(response){
            console.log(response);
            commonDataShare.showErrorMessage(response);
            // swal(constants.name,constants.errorMsg,constants.error);
          });
        }

        $scope.validatePassword = function(){
          console.log("hello");
          if($scope.model.password == $scope.model.confirm_password)
            $scope.isValid = true;
          else
            $scope.isValid = false;
          console.log($scope.isValid,$scope.model);
        }
      }]);
