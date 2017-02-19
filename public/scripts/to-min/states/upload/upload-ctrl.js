angular.module('genie.upload-ctrl', [])
.controller('UploadCtrl', function($scope, $http, $state) {
	$scope.go = function(route) {
		$state.go(route);
	}

	$http.get("/fileList").then( function(response) {
		d3.select("#files").selectAll("li")
			.data(response)
			.text(function(d) { return d; });
	});

});
