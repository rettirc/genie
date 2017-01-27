angular.module('genie.map-ctrl', [])
.controller('MapCtrl', function($scope, $state) {
	$scope.go = function(route) {
		$state.go(route);
	}
});
