var app = angular.module('eventConf', []);

  app.controller('Controller', ['$scope', '$http', function($scope, $http) {
    $scope.sessions = [];
    $http.get('http://localhost:9899/eventConf')
        .success(function(data){
            $scope.sessions = data;
            console.log($scope.sessions);
        })
        .error(function(data){
            console.log('Error: ' + data);        
        });
  }])
  .directive('session', function() {
    return {
      restrict: 'E',
      scope: {
        sessionInfo: '=info'
      },
      templateUrl: 'session.html'
    };
  });