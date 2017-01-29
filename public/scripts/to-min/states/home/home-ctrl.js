angular.module('genie.home-ctrl', [])
.controller('HomeCtrl', function($scope, $state) {
	$scope.hello = 'hello';
	$scope.go = function(route) {
		$state.go(route);
	}
});
