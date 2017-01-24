angular.module('genie.auth-ctrl', [])
.controller('AuthCtrl', function($scope, $state) {
	$scope.go = function(route) {
		$state.go(route);
	}
});
