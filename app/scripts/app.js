'use strict';

/**
 * @ngdoc overview
 * @name catalogueApp
 * @description
 * # catalogueApp
 *
 * Main module of the application.
 */

// var APIBaseUrl = 'http://coreapi-test.3j6wudg4pu.ap-southeast-1.elasticbeanstalk.com/';
//var APIBaseUrl = 'http://13.232.210.224:8000/';
var APIBaseUrl = Config.APIBaseUrl;

angular.module('Authentication', []);

angular
  .module('catalogueApp', [
    // 'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ui.router',
    'ngSanitize',
    'machadaloCommon',
    'machadaloPages',
    'Authentication',
    'rzModule',
    'ui.bootstrap',
    'angular.filter',
    'angularUtils.directives.dirPagination',
    'angularjs-dropdown-multiselect',
    'ngFileUpload',
    'uiGmapgoogle-maps',
    'ncy-angular-breadcrumb',
    'slickCarousel',
    'scrollable-table',
    'cfp.loadingBar',
    'vcRecaptcha',
    'ngMaterial',
    'nvd3',
    'chart.js',
    'angularUtils.directives.dirPagination',
    'percentCircle-directive',
    'ngTableToCsv',
    'ui.grid',
    'angular-js-xlsx',
    'toastr',
    'smart-table',
    'angular-chartist',
    'angular.morris-chart',
    'textAngular',
    'ngJsTree',
    'xeditable',
    'angular-progress-button-styles',
    'catalogueApp.theme.components',
    'catalogueApp.theme.inputs',
    'catalogueApp.theme',
    'angular-circular-progress',
    'ngMap',
    'AngularPrint',
    'checklist-model',
    'btorfs.multiselect',
    'angularUtils.directives.dirPagination',
    'angularMoment',
    'daterangepicker'
  ])
  .config(function ($routeProvider, $stateProvider, $urlRouterProvider, $httpProvider, $qProvider, $locationProvider,cfpLoadingBarProvider) {
      $stateProvider
      .state('society', {
          url : '/society',
          controller: 'CatalogueBaseCtrl',
          templateUrl: 'modules/pages/base/base.tmpl.html'
        })
        .state('campaign', {
          url : '/campaign/:campaignId',
          templateUrl: 'index.html',
          controller: ''
        })
        .state('campaign.societyList', {
          url : '/societyList', //:societyId/
          templateUrl: 'modules/pages/societylist/societylist.tmpl.html',
          controller: 'SocietyListCtrl'
        })
          .state('MapView',{
           url : '/:proposal_id/mapview',
           templateUrl : 'modules/pages/mapview/mapview.tmpl.html',
           controller : 'MapCtrl',
           ncyBreadcrumb: {
             label:'mapview',
             parent: function($rootScope) {
              return $rootScope.getCurState();
            },
          },
          data :{
            permission : 'mapview_page_access'
          }
        })
        .state('createProposalMe',{
          url : '/:account_id/createproposal',
          templateUrl : 'modules/pages/createProposal/createproposal.tmpl.html',
          controller : 'ProposalCtrl',
          ncyBreadcrumb: {
            label:'createProposal',
            parent: 'manageCampaign.create'
          },
          data :{
            permission : 'create_proposal_page_access'
          }
        })
        .state('showCurrentProposal',{
           url : '/:proposal_id/showcurrentproposal',
           templateUrl : 'modules/pages/currentProposal/currentProposal.tmpl.html',
           controller : 'CurrentProposal',
           ncyBreadcrumb: {
             label:'proposalSummary',
             parent : 'manageCampaign.create'
           },
           data :{
             permission : 'current_proposal_page_access'
           }
        })
        .state('showProposalHistory',{
          url : '/:proposal_id/showproposalhistory',
          templateUrl : 'modules/pages/ProposalHistory/proposalHistory.tmpl.html',
          controller : 'ProposalHistory',
          ncyBreadcrumb: {
            label:'proposalHistory',
            parent : 'manageCampaign.create'
          },
          data :{
            permission : 'show_proposal_hostory_page_access'
          }
        })
        .state('campaign.societyDetails', {
          url : '/societyDetails/:societyId', //:societyId/
          templateUrl: 'modules/pages/societydetails/societydetails.tmpl.html',
          controller: 'SocietyCtrl'
        })
        .state('campaign.societyList.filter', {
          url : '/societyList/:filter',
          templateUrl: 'modules/pages/societylist/societylist.tmpl.html',
          controller: 'SocietyFilterCtrl',
        })
        .state('showSocietyDetails', {
          url : '/societyDetails/:societyId',
          templateUrl: 'modules/pages/supplierDetails/societyDetails/newsocietyDetails.tmpl.html',
          controller: 'NewSocietyCtrl',
          data :{
            permission : 'show_society_details_page_access'
          }
        })
      .state('login', {
          url : '/login',
          controller: 'LoginCtrl',
          templateUrl: 'modules/pages/login/login.tmpl.html',
          data :{
            permission : 'loginAccess'
          }
        })
      .state('manageCampaign', {
          url : '/manageCampaign',
          controller: 'CreateCampaignCtrl',
          templateUrl: 'modules/pages/manageCampaign/manage-campaign.tmpl.html',
          ncyBreadcrumb: {
            skip: true // Never display this state in breadcrumb.
          },
          data :{
            permission : 'homepage_access'
          }
        })
      .state('manageCampaign.create', {
          url : '/create',
          controller: 'CreateCampaignCtrl',
          templateUrl: 'modules/pages/manageCampaign/create/create-campaign.tmpl.html',
          ncyBreadcrumb: {
            label: 'Homepage'
          },
          data :{
            permission : 'homepage_access'
          }
        })
      .state('editAccount', {
            url : '/editAccount/:accountId',
            controller: 'CreateAccountCtrl',
            templateUrl: 'modules/pages/manageCampaign/createaccount/create-account.tmpl.html',
            ncyBreadcrumb: {
              label: 'Account',
              parent : 'manageCampaign.create'
            },
            data :{
              permission : 'edit_account_page_access'
            }
        })
        .state('createaccount', {
              url : '/createAccount/:organisationId',
              controller: 'CreateAccountCtrl',
              templateUrl: 'modules/pages/manageCampaign/createaccount/create-account.tmpl.html',
              ncyBreadcrumb: {
                label: 'Account',
                parent : 'manageCampaign.create'
              },
              data :{
                permission : 'create_account_page_access'
              }
          })
      .state('manageCampaign.shortlisted', {
          url : '/shortlisted',
          controller: 'ShortlistedCampaignCtrl',
          templateUrl: 'modules/pages/manageCampaign/shortlisted/shortlisted.tmpl.html'
        })
      .state('manageCampaign.shortlisted.societies', {
          url : '/:campaignId/societies',
          controller: 'ShortlistedSocietiesCtrl',
          templateUrl: 'modules/pages/manageCampaign/shortlisted/shortlisted-societies.tmpl.html'
        })
      .state('manageCampaign.requested', {
          url : '/requested',
          controller: 'RequestedCampaignCtrl',
          templateUrl: 'modules/pages/manageCampaign/shortlisted/shortlisted.tmpl.html'
        })
      .state('manageCampaign.requested.societies', {
          url : '/:campaignId/societies',
          controller: 'RequestedSocietiesCtrl',
          templateUrl: 'modules/pages/manageCampaign/shortlisted/shortlisted-societies.tmpl.html'
        })
      .state('manageCampaign.finalized', {
          url : '/finalized',
          controller: 'FinalizedCampaignCtrl',
          templateUrl: 'modules/pages/manageCampaign/shortlisted/shortlisted.tmpl.html'
        })
      .state('manageCampaign.finalized.finalbooking', {
          url : '/:campaignId/finalbooking',
          controller: 'FinalBookingCampaignCtrl',
          templateUrl: 'modules/pages/manageCampaign/finalbooking/finalbooking.tmpl.html'
          })
      .state('manageCampaign.finalized.societies', {
          url : '/:campaignId/societies',
          controller: 'FinalizedSocietiesCtrl',
          templateUrl: 'modules/pages/manageCampaign/shortlisted/shortlisted-societies.tmpl.html'
        })
      .state('manageCampaign.finalize', {
          url : '/finalize',
          controller: 'FinalizeCampaignCtrl',
          templateUrl: 'modules/pages/manageCampaign/finalize/finalize.tmpl.html'
        })
        .state('manageCampaign.release', {
            url : '/release',
            controller: 'ReleaseCampaignCtrl',
            templateUrl: 'modules/pages/manageCampaign/release/release-campaign.tmpl.html'
          })
      .state('manageCampaign.finalize.finalizeInventory', {
          url : '/:campaignId/finalizeInventory/',
          controller: 'FinalizeInventoryCtrl',
          templateUrl: 'modules/pages/manageCampaign/finalize/finalizeInventory.tmpl.html'
        })
      .state('society.details.poster', {
          url : '/poster', //:societyId/
          templateUrl: 'modules/common/postertab/poster-tab.tmpl.html',
          controller: ''
        })
      .state('society.details.info', {
          url : '/info', //:societyId/
          templateUrl: 'modules/common/infotab/societyinfo-tab.tmpl.html',
          controller: ''
        })
      .state('manageCampaign.ongoingcampaign', {
            url : '/ongoingcampaign',
            controller: 'OngoingCampaignCtrl',
            templateUrl: 'modules/pages/manageCampaign/ongoingcampaign/ongoing-campaign.tmpl.html',
            data :{
              permission : 'manageCampaign.ongoingcampaignPageAccess'
            }

          })
      .state('mapView',{
            url : '/mapview',
            controller : 'MapCtrl',
            templateUrl : 'modules/pages/mapview/mapview.tmpl.html',
            data :{
              permission : 'mapview_page_Access'
            }
        })
        .state('societydetailspage',{
             // url : '/SocietyDetailsPages',
             url : '/:supplierId/SocietyDetailsPages',
               controller : 'SocietyDetailsPagesCtrl',
             templateUrl : 'modules/pages/SocietyDetailsPages/societydetailspage.tmpl.html',
             data :{
               permission : 'society_details_page_access'
             }
         })

         .state('changePassword',{
              url : '/changePassword',
                controller : 'changePswdCtrl',
              templateUrl : 'modules/pages/changePassword/changePassword.tmpl.html',
              data :{
                permission : 'change_password_page_access'
              }
          })

      .state('releasePlan',{
           url : '/:proposal_id/releasePlan',
           controller : 'ReleaseCampaignCtrl',
           templateUrl : 'modules/pages/releaseCampaignPlan/releaseCampaign.tmpl.html',
           ncyBreadcrumb: {
             label:'BookingPlan',
             parent : 'CampaignList'
           },
           data :{
             permission : 'release_plan_page_access'
           }
       })
      .state('OpsDashBoard',{
           url : '/OpsDashBoard',
           controller : 'OpsDashCtrl',
           templateUrl : 'modules/pages/DashBoard/OperationsDashBoard/opsdashboard.tmpl.html',
           ncyBreadcrumb: {
             label:'OpsDashBoard',
             parent : 'manageCampaign.create'
           },
           data :{
             permission : 'ops_dashboard_page_access'
           }
       })
       .state('CampaignList',{
            url : '/CampaignList',
            controller : 'CampaignListCtrl',
            templateUrl : 'modules/pages/DashBoard/CampaignList/campaignlist.tmpl.html',
            ncyBreadcrumb: {
              label:'CampaignList',
              parent : 'OpsDashBoard'
            },
            data :{
              permission : 'campaign_list_page_access'
            }
        })

      .state('manageUsers',{
           url : '/manageUser',
           controller : 'userCtrl',
           templateUrl : 'modules/pages/manageUsers/user.tmpl.html',
           data :{
             permission : 'manage_users_page_access'
           }
       })
      .state('auditReleasePlan',{
            url : '/:proposal_id/auditReleasePlan',
            controller : 'AuditReleasePlanCtrl',
            templateUrl : 'modules/pages/operations/auditReleasePlan/auditReleasePlan.tmpl.html',
            ncyBreadcrumb: {
              label:'CampaignReleaseAndAuditPlan',
              parent : 'releasePlan'
            },
            data :{
              permission : 'audit_release_plan_page_access'
            }
      })
      .state('opsExecutionPlan',{
            url : '/:proposal_id/opsExecutionPlan',
            controller : 'OpsExecutionPlanCtrl',
            templateUrl : 'modules/pages/operations/opsExecutionPlan/opsExecutionPlan.tmpl.html',
            ncyBreadcrumb: {
              label:'ExecutionPlan',
              parent : 'CampaignList'
            },
            data :{
              permission : 'ops_execution_plan_page_access'
            }
      })
      .state('guestHomePage',{
            url : '/guestHomePage',
            controller : 'guestHomePageController',
            templateUrl : 'modules/pages/guestPage/homepage.tmpl.html',
            ncyBreadcrumb: {
              label:'Homepage',
            },
            data :{
              permission : 'guest_home_page_access'
            }
      })
      .state('ongoingCampaigns',{
            url : '/ongoingCampaigns',
            controller : 'OngoingCampaignCtrl',
            templateUrl : 'modules/pages/campaignStatus/ongoingCampaigns/ongoingCampaign.tmpl.html',
            data :{
              permission : 'ongoingCampaignsPageAccess'
            }

      })
      .state('upcomingCampaigns',{
            url : '/upcomingCampaigns',
            controller : 'UpcomingCampaignCtrl',
            templateUrl : 'modules/pages/campaignStatus/upcomingCampaigns/upcomingCampaign.tmpl.html',
            data :{
              permission : 'upcomingCampaignsPageAccess'
            }
      })
      .state('completedCampaigns',{
            url : '/completedCampaigns',
            controller : 'CompletedCampaignCtrl',
            templateUrl : 'modules/pages/campaignStatus/completedCampaigns/completedCampaign.tmpl.html',
            data :{
              permission : 'completedCampaignsPageAccess'
            }
      })
      .state('dashboard',{
            url : '/dashboard',
            controller : 'DashboardCtrl',
            templateUrl : 'modules/pages/dashboard/dashboard.html',
            sidebarMeta: {
              icon: 'ion-android-home',
              order: 0,
            },
            data :{
              permission : 'dashboard_page_access'
            }
      })
      .state('sheetToCampaign',{
            url : '/sheetToCampaign',
            controller : 'sheetToCampaignController',
            templateUrl : 'modules/pages/sheetToCampaign/sheetToCampaign.tmpl.html',
            data :{
              permission : 'sheet_to_campaign_page_access'
            }
      })
      .state('campaignLeads',{
            url : '/campaignLeads',
            controller : 'CampaignLeadsCtrl',
            templateUrl : 'modules/pages/leads/campaignLeads.tmpl.html',
            data :{
              permission : 'campaign_leads_page_access'
            }
      })
      // .state('enterLeads',{
      //       url : '/leadsForm/:supplierCode/:campaignId/:supplierId',
      //       controller : 'LeadFormCtrl',
      //       templateUrl : 'modules/pages/leadForm/leadsForm.tmpl.html',
      //       data :{
      //         permission : 'enterLeadsPageAccess'
      //       }
      // })

      .state('enterLeadsFromApplication',{
            url : '/enterLeadsFromApplication/:formId/:supplierId',
            controller : 'enterLeadFormCtrl',
            templateUrl : 'modules/pages/enterLeadsFromApplication/enterLeads.tmpl.html',
            data :{
              permission : 'enter_leads_from_application_access'
            }
      })

      .state('forbiddenPage',{
            url : '/forbiddenPage',
            templateUrl : 'modules/common/forbiddenErrorPage.tmpl.html',
            data : {
              permission : 'forbidden_page_access'
            }
      }).state('dashboard1',{
            url : '/dashboard1',
            // controller : 'DashboardCtrl',
            templateUrl : 'modules/pages/dashboard-gulp/admin/release/index.html',
            data : {
              permission : 'dashboard1PageAccess'
            }

      }).state('loginLogs',{
          url : '/loginLogs',
          controller : 'loginLogsCtrl',
          templateUrl : 'modules/pages/loginLogs/loginLogs.tmpl.html',
          data : {
            permission : 'login_logs_page_access'
          }
      }).state('editProposalDetails',{
              url : '/editProposalDetails/:proposalId/',
              controller : 'EditProposalDetailsCtrl',
              templateUrl : 'modules/pages/editProposalDetails/editProposalDetails.tmpl.html',
              data : {
                permission : 'editProposalDetailsPage'
              }
        })
        // .state('dynamicGraphs',{
        //       url : '/dynamicGraphs',
        //       controller : 'DashboarddynamicGraphsCtrl',
        //       templateUrl : 'modules/pages/dynamicGraphs/dynamicGraphs.html',
        //        data :{
        //         permission : 'dashboard_dynamic_graphs'
        //       }
        // })
        ;


      //$qProvider.errorOnUnhandledRejections(false);
      $locationProvider.hashPrefix('');
      // console.log = () => {};
})
.run(['$rootScope', '$window', '$location', 'AuthService','$state','$cookieStore',
     function ($rootScope, $window, $location, AuthService, $state, $cookieStore) {
       $rootScope.globals = $rootScope.globals || {};
       $rootScope.globals.currentUser = AuthService.UserInfo();
       $rootScope.getCurState = function() {
            if($window.localStorage.isSavedProposal == 'true')
              return 'showCurrentProposal';
            else if($window.localStorage.isSavedProposal == 'false')
              return 'createProposalMe';
            else if($window.localStorage.user_code == 'guestUser')
              return 'guestHomePage';
        }

       var whence = $location.path();

       $rootScope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState, fromParams) {

         var permissions = $rootScope.globals.userInfo.profile.permissions;
         var page = toState.data.permission;
         if($rootScope.globals.currentUser && !(permissions.hasOwnProperty(page.toLowerCase()) && permissions[page.toLowerCase()]) && $location.path() != '/logout'){
           e.preventDefault();
           console.log(permissions.hasOwnProperty(page.toLowerCase()));
           $state.go('forbiddenPage');
         }
       });
       $rootScope.$on('$locationChangeStart', function (e, toState, toParams, fromState, fromParams) {
         var whence = $location.path();
         // redirect to login page if not logged in
         $rootScope.globals.currentUser = AuthService.UserInfo();
         if(!$rootScope.globals.hasOwnProperty('userInfo') || !$rootScope.globals.userInfo.hasOwnProperty('profile')){
           $location.path("/login");
         }
         var category = $rootScope.globals.userInfo.profile.organisation.category;
         if (!$rootScope.globals.currentUser) {
           // if(toState.name != 'login')
              // $cookieStore.put('returnUrl', $location.url());
              $location.path("/login");
         }else if ($rootScope.globals.currentUser && $location.path() == '/guestHomePage' && category != 'BUSINESS') {
           $location.path("/guestHomePage");
         }else if ($rootScope.globals.currentUser && $location.path() == '/logout'){
           AuthService.Logout();
           $location.path("/login");
         }
         else if ($rootScope.globals.currentUser && typeof $cookieStore.get('returnUrl') != 'undefined' && $cookieStore.get('returnUrl') && category != 'BUSINESS'){
           $location.path($cookieStore.get('returnUrl'));
           $cookieStore.remove('returnUrl');
         }else if ($rootScope.globals.currentUser && ($location.path() == '/login' || $location.path() == '/') && ($window.localStorage.user_code != 'guestUser') && category != 'BUSINESS'){
           // e.preventDefault();
           $location.path("/manageCampaign/create");
         }else if(category == 'BUSINESS'){
           $location.path("/dashboard");
         } else if(category != 'BUSINESS'){
           $location.path(whence);
         }
       });

     }]);
