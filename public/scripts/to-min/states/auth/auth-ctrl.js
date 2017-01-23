angular.module('genie.auth-ctrl', [])
.controller('AuthCtrl', function($scope, $state) {
	$scope.hello = 'hello';
	$scope.go = function(route) {
		$state.go(route);
	}
});
