angular.module('genie.attribute-ctrl', [])
.controller('AttributeCtrl', function($scope, $http, $state, d3) {
	$scope.go = function(route) {
		$state.go(route);
	}

	$scope.indiData = null;

	function fetchData() {
		$http.get("/api/people").then(function successCallback(response) {
			$scope.indiData = response.data;
			showPeople();
		}, function errorCallback(response) {
			console.error(response);
		});
	}


	function showPeople() {
		if ($scope.indiData === null) {
			throw "Error: Global individual array is null."; //Hopefully won't happen
		}
		var dataDrivenTable = d3.select("#individualMenu").selectAll("tr").data($scope.indiData);
		var rows = dataDrivenTable.enter()
			.append("tr");
		rows.append("td")
			.text(function(d) { return d.GivenName; });
		rows.append("td")
			.text(function(d) { return d.Surname; });
	}

	fetchData();

	// $("#submitButton").on("click", function() { $scope.go("layout.upload")});
});
