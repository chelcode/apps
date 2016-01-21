var app = angular.module('eventConf', []);

  app.controller('Controller', ['$scope', '$http', function($scope, $http) {
    $scope.sessions = [];
    $http.get('http://localhost:9899/eventConf')
        .success(function(data){
            angular.forEach(data, function(ele, index){
               //Just add the index to your item
               ele.index = index;
            });
            jQuery("#message").html("");
            $scope.sessions = data;
            console.log($scope.sessions);
        })
        .error(function(data){
            console.log('Error: ' + data);        
        });

    $scope.downloadCSV = function(){
        window.open('csv', '_blank');
    }
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