angular.module('detail-ctrl', [])
.controller('DetailCtrl', function($scope, $state) {
	$scope.hello = 'hello';
	$scope.go = function(route) {
		$state.go(route);
	}
});
