angular.module('genie.auth-ctrl', [])
.controller('AuthCtrl', function($scope, $state) {
	$scope.go = function(route) {
		$state.go(route);
	}

	$("#submitButton").on("click", function() { $scope.go("layout.upload")});
});
