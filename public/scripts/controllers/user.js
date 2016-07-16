'use strict';

angular.module('bookTrading')
.controller('UserCtrl', function($scope, $http, UserService, $location){

  $scope.signup = function() {
    if ($scope.formData.email != undefined
        && $scope.formData.password != undefined) {
      $scope.loading = true;

      $http.post('/api/signup', $scope.formData)

      .then(function successCallback(response) {
          if (response.data.success == true){
            UserService.setToken(response.data.token);

            $location.path("/books");
          }          
        }, function errorCallback(response) {
          alert(response.data);
        });
    }
  }

  $scope.login = function() {
    if ($scope.formData.email != undefined
        && $scope.formData.password != undefined) {
      $scope.loading = true;

      $http.post('/api/login', $scope.formData)

      .then(function successCallback(response) {
          if (response.data.success == true){
            UserService.setToken(response.data.token);

            $location.path("/books");
          }          
        }, function errorCallback(response) {
          alert(response.data);
        });
    }
  }

});