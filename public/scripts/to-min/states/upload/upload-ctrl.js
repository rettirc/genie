angular.module('genie.auth-ctrl', [])
.controller('AuthCtrl', function($scope, $http, $state) {
	$scope.go = function(route) {
		$state.go(route);
	}
});
