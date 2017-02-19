angular.module('genie.upload-ctrl', [])
.controller('UploadCtrl', function($scope, $http, $state) {
	$scope.go = function(route) {
		$state.go(route);
	}

	$http({method: 'POST', url: '/fileList'}).then( function(response) {
		var rows = d3.select("#files").selectAll("tr")
			.data(response.data);

		rows.select("td")
			.text(function(d) { return d; });

		rows.enter()
			.append("td")
			.text(function(d) { return d; });

	}, function(error) {
		console.error(error)
	});

});
